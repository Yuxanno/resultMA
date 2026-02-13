import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

interface ParsedQuestion {
  text: string;
  variants: { letter: string; text: string }[];
  correctAnswer: string;
  points: number;
}

export class WordParser {
  async parseDocx(filePath: string): Promise<ParsedQuestion[]> {
    try {
      console.log('📄 [WORD] Parsing DOCX with pandoc...');
      const rawMarkdown = await this.extractTextWithPandoc(filePath);
      const { cleanText, mathBlocks } = this.preCleanAndHideMath(rawMarkdown);
      const questions = this.parseQuestions(cleanText, mathBlocks);
      console.log(`✅ [WORD] Parsed ${questions.length} questions`);
      return questions;
    } catch (error) {
      console.error('❌ [WORD] Error:', error);
      throw new Error(
        `Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private preCleanAndHideMath(text: string): { cleanText: string; mathBlocks: string[] } {
    let cleaned = text;

    // 1. УБИВАЕМ СЛЭШИ И КРИВЫЕ АПОСТРОФЫ (bo\`lsa -> bo'lsa)
    cleaned = cleaned.replace(/\\`/g, '`'); // чистим экранированный backtick
    cleaned = cleaned.replace(/`/g, "'"); // превращаем ВСЕ backticks в нормальные апострофы
    cleaned = cleaned.replace(/\\'/g, "'"); // чистим экранированный прямой апостроф
    cleaned = cleaned.replace(/\\"/g, '"');

    // 2. Распаковываем \mathbf{} ДО скрытия формул (сохраняем маркер правильного ответа)
    for (let i = 0; i < 3; i++) {
      cleaned = cleaned.replace(/\\(?:mathbf|boldsymbol|bf)\{([^{}]*)\}/g, '**$1**');
    }

    // 3. Конвертируем доллары в LaTeX
    cleaned = cleaned.replace(/\$\$(.*?)\$\$/gs, '\\($1\\)');
    cleaned = cleaned.replace(/\$(.*?)\$/gs, '\\($1\\)');

    // 4. ЯДЕРНЫЙ ВЗРЫВ ВАРИАНТОВ ВНУТРИ ФОРМУЛ
    // Если учитель написал `\sqrt{2}B)4` внутри Equation, мы выкидываем B) наружу!
    cleaned = cleaned.replace(/\\\([\s\S]*?\\\)/g, (mathBlock) => {
      // Ищем букву варианта после цифры, пробела или закрывающей скобки }
      return mathBlock.replace(
        /([0-9}\s])(\*\*|__)?([A-D])(\*\*|__)?(?:\\?\)|\\?\.)/g,
        '$1 \\) $2$3) \\( '
      );
    });
    // Убираем пустые формулы \( \), которые могли образоваться после взрыва
    cleaned = cleaned.replace(/\\\(\s*\\\)/g, ' ');

    // 5. ПРЯЧЕМ МАТЕМАТИКУ (ЗАЩИТНЫЙ КУПОЛ)
    const mathBlocks: string[] = [];
    cleaned = cleaned.replace(/\\\([\s\S]*?\\\)/g, (match) => {
      let cleanMath = match.replace(/\\ /g, ' ');
      mathBlocks.push(cleanMath);
      return ` ___MATH_${mathBlocks.length - 1}___ `;
    });

    // 6. ОТЛЕПЛЯЕМ СЛОВА ОТ ФОРМУЛ (e.g., \sqrt{6}ga -> \sqrt{6} ga)
    // Гарантируем, что текст никогда не прилипнет к защитному токену
    cleaned = cleaned.replace(/(___MATH_\d+___)([a-zA-Z])/g, '$1 $2');
    cleaned = cleaned.replace(/([a-zA-Z])(___MATH_\d+___)/g, '$1 $2');

    // 7. ТЕПЕРЬ БЕЗОПАСНО чистим эскейпы в тексте
    cleaned = cleaned.replace(/\\([.\(\)\[\]])/g, '$1');

    // 8. Нормализуем номера вопросов и вариантов (расставляем пробелы)
    cleaned = cleaned.replace(/(^|\s|\n)(\*\*|__)?(\d+)(\*\*|__)?\.\s*/g, '$1$2$3$4) ');
    cleaned = cleaned.replace(/([^\s\n])(\*\*|__)?([A-D])(\*\*|__)?\)/gi, '$1 $2$3$4)');
    cleaned = cleaned.replace(/(\d+|[A-D])(\*\*|__)?\)([^\s\n])/gi, '$1$2) $3');

    return { cleanText: cleaned, mathBlocks };
  }

  private async extractTextWithPandoc(filePath: string): Promise<string> {
    try {
      const pandocPaths = [
        'pandoc',
        'C:\\Program Files\\Pandoc\\pandoc.exe',
        '/usr/local/bin/pandoc',
        '/usr/bin/pandoc',
      ];

      let lastError: any;
      for (const pandocPath of pandocPaths) {
        try {
          const { stdout } = await execFileAsync(pandocPath, [
            filePath,
            '-f',
            'docx',
            '-t',
            'markdown',
            '--wrap=none',
          ]);
          return stdout;
        } catch (err) {
          lastError = err;
        }
      }
      throw lastError;
    } catch (error) {
      throw error;
    }
  }

  private parseQuestions(text: string, mathBlocks: string[]): ParsedQuestion[] {
    const questions: ParsedQuestion[] = [];

    // Ищем номер вопроса (гарантированно вне формул!)
    const questionPattern = /(?:^|\s|\n)(?:\*\*|__)?(\d+)(?:\*\*|__)?\)\s+/g;
    const matches = Array.from(text.matchAll(questionPattern));

    const validMatches = matches.filter((m) => {
      const num = parseInt(m[1]);
      return num >= 1 && num <= 30;
    });

    for (let i = 0; i < validMatches.length; i++) {
      const currentMatch = validMatches[i];
      const nextMatch = validMatches[i + 1];
      const questionNum = parseInt(currentMatch[1]);

      const startIndex = currentMatch.index! + currentMatch[0].length;
      const endIndex = nextMatch ? nextMatch.index! : text.length;
      const block = text.substring(startIndex, endIndex).trim();

      const question = this.extractQuestion(block, questionNum, mathBlocks);
      if (question) questions.push(question);
    }

    return questions;
  }

  private extractQuestion(
    block: string,
    qNum: number,
    mathBlocks: string[]
  ): ParsedQuestion | null {
    // Ищем буквы вариантов: A), B), C), D) вне формул!
    const variantPattern = /(?:^|\s)(?:\*\*|__)?([A-D])(?:\*\*|__)?\)\s*/gi;
    const variantMatches = Array.from(block.matchAll(variantPattern));

    if (variantMatches.length === 0) return null;

    const rawQText = block.substring(0, variantMatches[0].index!);
    const qText = this.finalCleanText(rawQText, mathBlocks);

    let correctAnswer = 'A';
    const variants: { letter: string; text: string }[] = [];

    for (let i = 0; i < variantMatches.length; i++) {
      const match = variantMatches[i];
      const letter = match[1].toUpperCase();

      const startIndex = match.index! + match[0].length;
      const endIndex = variantMatches[i + 1] ? variantMatches[i + 1].index! : block.length;
      const rawVariantText = block.substring(startIndex, endIndex);

      // Временно восстанавливаем математику, чтобы проверить жирность (отвечает за правильный ответ)
      const restoredVariantText = this.restoreMath(rawVariantText, mathBlocks);
      if (
        match[0].includes('**') ||
        match[0].includes('__') ||
        restoredVariantText.includes('**') ||
        restoredVariantText.includes('__')
      ) {
        correctAnswer = letter;
      }

      variants.push({
        letter,
        text: this.finalCleanText(rawVariantText, mathBlocks),
      });
    }

    // Ensure all 4 variants exist
    if (variants.length < 4) {
      const letters = ['A', 'B', 'C', 'D'];
      const existing = variants.map((v) => v.letter);
      letters.forEach((l) => {
        if (!existing.includes(l)) variants.push({ letter: l, text: '' });
      });
      variants.sort((a, b) => a.letter.localeCompare(b.letter));
    }

    return {
      text: qText,
      variants,
      correctAnswer,
      points: 1,
    };
  }

  private restoreMath(text: string, mathBlocks: string[]): string {
    // Возвращаем формулы на место токенов ___MATH_N___
    return text.replace(/___MATH_(\d+)___/g, (m, idx) => mathBlocks[parseInt(idx)] || m);
  }

  private finalCleanText(text: string, mathBlocks: string[]): string {
    let restored = this.restoreMath(text, mathBlocks);

    // 1. Удаляем маркеры жирности (чтобы студенты не увидели ответ)
    restored = restored.replace(/\*\*/g, '').replace(/__/g, '');

    // 2. Убираем артефакты пандока (висящие текстовые теги внутри формул)
    restored = restored.replace(/\\(mathrm|text|rm)\{([^{}]*)\}/g, '$2');

    // 3. Убираем висящие слеши (\\\\) в конце строки
    restored = restored.replace(/\\\\+\s*$/, '');

    return restored.trim();
  }
}

export const wordParser = new WordParser();
