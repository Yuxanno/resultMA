import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import fs from 'fs/promises';
import { GroqService } from './groqService';

interface ParsedQuestion {
  text: string;
  variants: { letter: string; text: string; invalid?: boolean }[];
  correctAnswer: string;
  points: number;
  needsReview?: boolean;
}

export class TestImportService {
  /**
   * Parse Excel/CSV file
   */
  static async parseExcel(filePath: string): Promise<ParsedQuestion[]> {
    try {
      console.log('Reading Excel file:', filePath);
      const workbook = XLSX.readFile(filePath);
      console.log('Workbook sheets:', workbook.SheetNames);
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data: any[] = XLSX.utils.sheet_to_json(worksheet);

      console.log('Excel rows:', data.length);
      console.log('First row:', JSON.stringify(data[0]));
      console.log('Column names:', Object.keys(data[0] || {}));

      const questions: ParsedQuestion[] = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        console.log(`Processing row ${i + 1}:`, JSON.stringify(row));

        // Expected columns: Savol, A, B, C, D, To'g'ri javob, Ball
        // Or: Question, A, B, C, D, Correct Answer, Points
        const questionText = row['Savol'] || row['Question'] || row['savol'] || row['question'] || '';
        const variantA = row['A'] || row['a'] || '';
        const variantB = row['B'] || row['b'] || '';
        const variantC = row['C'] || row['c'] || '';
        const variantD = row['D'] || row['d'] || '';
        const correctAnswer = (row["To'g'ri javob"] || row['Correct Answer'] || row['correct'] || row['Javob'] || 'A').toString().toUpperCase();
        const points = parseInt(row['Ball'] || row['Points'] || row['points'] || '1');

        console.log('Parsed:', { questionText, variantA, variantB, correctAnswer });

        if (!questionText) {
          console.log('Skipping row - no question text');
          continue;
        }

        const variants = [];
        if (variantA) variants.push({ letter: 'A', text: variantA.toString() });
        if (variantB) variants.push({ letter: 'B', text: variantB.toString() });
        if (variantC) variants.push({ letter: 'C', text: variantC.toString() });
        if (variantD) variants.push({ letter: 'D', text: variantD.toString() });

        if (variants.length >= 2) {
          questions.push({
            text: questionText.toString(),
            variants,
            correctAnswer: correctAnswer.charAt(0),
            points,
          });
          console.log(`✓ Added question ${questions.length}`);
        } else {
          console.log('Skipping row - not enough variants:', variants.length);
        }
      }

      console.log('Total questions parsed from Excel:', questions.length);
      return questions;
    } catch (error: any) {
      console.error('Error parsing Excel:', error);
      throw new Error(`Excel faylni o'qishda xatolik: ${error.message}`);
    }
  }

  /**
   * Parse Word document
   */
  static async parseWord(filePath: string): Promise<ParsedQuestion[]> {
    try {
      const buffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;

      console.log('Word text extracted, length:', text.length);

      // Try AI parsing first
      const aiQuestions = await GroqService.parseTestWithAI(text);
      if (aiQuestions.length > 0) {
        console.log('✅ Using AI-parsed questions');
        return GroqService.convertToOurFormat(aiQuestions);
      }

      // Fallback to regex parsing
      console.log('⚠️ AI parsing failed, using regex fallback');
      return this.parseTextContent(text);
    } catch (error: any) {
      console.error('Error parsing Word:', error);
      throw new Error(`Word faylni o'qishda xatolik: ${error.message}`);
    }
  }



  /**
   * Parse image using OCR
   */
  static async parseImage(filePath: string): Promise<ParsedQuestion[]> {
    try {
      const { data: { text } } = await Tesseract.recognize(filePath, 'uzb+eng', {
        logger: (m) => console.log(m),
      });

      console.log('OCR text extracted, length:', text.length);

      // Try AI parsing first
      const aiQuestions = await GroqService.parseTestWithAI(text);
      if (aiQuestions.length > 0) {
        console.log('✅ Using AI-parsed questions');
        return GroqService.convertToOurFormat(aiQuestions);
      }

      // Fallback to regex parsing
      console.log('⚠️ AI parsing failed, using regex fallback');
      return this.parseTextContent(text);
    } catch (error: any) {
      console.error('Error parsing image:', error);
      throw new Error(`Rasmni o'qishda xatolik: ${error.message}`);
    }
  }

  /**
   * Parse text content and extract questions
   * Expected format:
   * 1. Question text?
   * A) Variant A
   * B) Variant B
   * C) Variant C
   * D) Variant D
   * To'g'ri javob: A
   * Ball: 1
   */
  private static parseTextContent(text: string): ParsedQuestion[] {
    const questions: ParsedQuestion[] = [];
    
    console.log('Parsing text content, length:', text.length);
    
    // Split by question numbers (1., 2., 3. or 1), 2), 3))
    const questionBlocks = text.split(/\n(?=\d+[\.\)])/);
    
    console.log('Found question blocks:', questionBlocks.length);

    for (const block of questionBlocks) {
      if (!block.trim()) continue;

      const lines = block.split('\n').map(line => line.trim()).filter(line => line);
      if (lines.length === 0) continue;

      let questionText = '';
      const variants: { letter: string; text: string }[] = [];
      let correctAnswer = 'A';
      let points = 1;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // First line should be the question
        if (i === 0) {
          // Remove question number
          questionText = line.replace(/^\d+[\.\)]\s*/, '').trim();
          continue;
        }

        // Check if it's a variant (A), B), C), D) or A., B., C., D.)
        const variantMatch = line.match(/^([A-D])[\.\)]\s*(.+)/i);
        if (variantMatch) {
          variants.push({
            letter: variantMatch[1].toUpperCase(),
            text: variantMatch[2].trim(),
          });
          continue;
        }

        // Check for correct answer (more flexible patterns)
        const correctMatch = line.match(/(?:to'?g'?ri\s*javob|correct\s*answer|javob|answer)[\s:]*([A-D])/i);
        if (correctMatch) {
          correctAnswer = correctMatch[1].toUpperCase();
          continue;
        }

        // Check for points
        const pointsMatch = line.match(/(?:ball|points?)[\s:]*(\d+)/i);
        if (pointsMatch) {
          points = parseInt(pointsMatch[1]);
          continue;
        }

        // If no match and we don't have variants yet, append to question
        if (variants.length === 0 && questionText) {
          questionText += ' ' + line;
        }
      }

      // Add question if valid
      if (questionText && variants.length >= 2) {
        questions.push({
          text: questionText,
          variants,
          correctAnswer,
          points,
        });
        console.log(`Parsed question ${questions.length}:`, questionText.substring(0, 50));
      }
    }

    console.log('Total questions parsed:', questions.length);
    return questions;
  }

  /**
   * Main import function
   */
  static async importTest(filePath: string, format: 'word' | 'image'): Promise<ParsedQuestion[]> {
    const ext = filePath.split('.').pop()?.toLowerCase();

    switch (format) {
      case 'word':
        if (ext === 'docx' || ext === 'doc') {
          return this.parseWord(filePath);
        }
        throw new Error('Noto\'g\'ri Word format. Faqat .docx va .doc fayllari qo\'llab-quvvatlanadi');

      case 'image':
        if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
          return this.parseImage(filePath);
        }
        throw new Error('Noto\'g\'ri rasm format. Faqat .jpg, .jpeg va .png fayllari qo\'llab-quvvatlanadi');

      default:
        throw new Error('Noma\'lum format');
    }
  }

  /**
   * Get Groq API statistics
   */
  static getGroqStats(): any {
    return GroqService.getDetailedStats();
  }

  /**
   * Get parsing logs from Groq
   */
  static getParsingLogs(): any[] {
    return GroqService.getAndClearLogs();
  }
}
