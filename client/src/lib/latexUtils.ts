/**
 * Utilities for converting LaTeX format to TipTap JSON format
 */

/**
 * Check if text contains LaTeX formulas
 */
export function hasLatexFormulas(text: string): boolean {
  if (!text) return false;
  // Ищем \( или \[ (одинарный слеш, так как в JS строке он уже распарсен)
  return text.includes('\\(') || text.includes('\\[');
}

/**
 * Convert text with LaTeX formulas \\(...\\) to TipTap JSON format
 */
export function convertLatexToTiptapJson(text: string): any {
  if (!text) {
    return {
      type: 'doc',
      content: [{ type: 'paragraph', content: [] }]
    };
  }

  // Убираем \text{} обертки (AI иногда добавляет их)
  let cleanedText = text.replace(/\\text\{([^}]+)\}/g, '$1');

  // Если нет формул, возвращаем простой текст
  if (!hasLatexFormulas(cleanedText)) {
    return {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: cleanedText }]
      }]
    };
  }

  const paragraphContent: any[] = [];
  let currentIndex = 0;
  
  // Ищем все формулы в тексте
  // Паттерн: \( ... \) где внутри может быть что угодно кроме \)
  const formulaRegex = /\\[()\[\]]/g;
  let match;
  let inFormula = false;
  let formulaStart = -1;
  let formulaType: '(' | '[' | null = null;
  
  while ((match = formulaRegex.exec(cleanedText)) !== null) {
    const symbol = match[0]; // \( или \) или \[ или \]
    
    if (!inFormula) {
      // Начало формулы
      if (symbol === '\\(' || symbol === '\\[') {
        // Добавляем текст перед формулой
        if (match.index > currentIndex) {
          const beforeText = cleanedText.substring(currentIndex, match.index);
          if (beforeText) {
            paragraphContent.push({
              type: 'text',
              text: beforeText
            });
          }
        }
        
        inFormula = true;
        formulaStart = match.index + 2; // После \( или \[
        formulaType = symbol === '\\(' ? '(' : '[';
      }
    } else {
      // Конец формулы
      const expectedEnd = formulaType === '(' ? '\\)' : '\\]';
      if (symbol === expectedEnd) {
        // Извлекаем LaTeX формулы
        const latex = cleanedText.substring(formulaStart, match.index);
        
        paragraphContent.push({
          type: 'formula',
          attrs: { latex: latex.trim() }
        });
        
        inFormula = false;
        formulaType = null;
        currentIndex = match.index + 2; // После \) или \]
      }
    }
  }
  
  // Добавляем оставшийся текст после последней формулы
  if (currentIndex < cleanedText.length) {
    const remainingText = cleanedText.substring(currentIndex);
    if (remainingText.trim()) {
      paragraphContent.push({
        type: 'text',
        text: remainingText
      });
    }
  }
  
  return {
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: paragraphContent.length > 0 ? paragraphContent : []
    }]
  };
}

/**
 * Convert text with LaTeX formulas to HTML (fallback method)
 */
export function convertLatexToHtml(text: string): string {
  if (!text) return '<p></p>';
  
  let html = text;
  
  // Заменяем \( ... \) на <span data-type="formula" data-latex="...">
  html = html.replace(/\\\(([^)]+)\\\)/g, (match, latex) => {
    return `<span data-type="formula" data-latex="${latex.trim()}"></span>`;
  });
  
  // Заменяем \[ ... \] на блочные формулы
  html = html.replace(/\\\[([^\]]+)\\\]/g, (match, latex) => {
    return `<p><span data-type="formula" data-latex="${latex.trim()}"></span></p>`;
  });
  
  // Оборачиваем в параграф если нет HTML тегов
  if (!html.includes('<p>') && !html.includes('<div>') && !html.includes('<span')) {
    html = `<p>${html}</p>`;
  }
  
  return html;
}
