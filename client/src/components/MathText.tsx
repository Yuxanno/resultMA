import { useEffect, useRef } from 'react';
import katex from 'katex';
import { hasMathML, convertMathMLToLatex } from '@/lib/mathmlUtils';
import { renderOmmlInText } from '@/lib/ommlUtils';
import 'katex/dist/katex.min.css';

interface MathTextProps {
  text: string;
  className?: string;
}

export default function MathText({ text, className = '' }: MathTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current || !text) return;

    try {
      containerRef.current.innerHTML = '';

      console.log('🔍 [MATHTEXT] ===== START RENDERING =====');
      console.log('🔍 [MATHTEXT] Original text:', text.substring(0, 200));

      let cleanedText = text;
      
      // Шаг 1: Конвертируем OMML в MathML (если есть)
      if (cleanedText.includes('<omml>')) {
        console.log('🔄 [OMML] Converting OMML to MathML...');
        cleanedText = renderOmmlInText(cleanedText);
      }
      
      // Шаг 2: Конвертируем MathML в LaTeX (если есть)
      if (hasMathML(cleanedText)) {
        console.log('🔄 [MathML] Converting MathML to LaTeX...');
        cleanedText = convertMathMLToLatex(cleanedText);
      }
      
      // Шаг 3: Очистка HTML
      cleanedText = cleanedText.replace(/<p>/gi, '');
      cleanedText = cleanedText.replace(/<\/p>/gi, '\n');
      cleanedText = cleanedText.replace(/<br\s*\/?>/gi, '\n');
      
      // Fix double backslashes from AI (\\(...\\) -> \(...\))
      cleanedText = cleanedText.replace(/\\\\+\(/g, '\\(');
      cleanedText = cleanedText.replace(/\\\\+\)/g, '\\)');
      cleanedText = cleanedText.replace(/\\\\+\[/g, '\\[');
      cleanedText = cleanedText.replace(/\\\\+\]/g, '\\]');
      
      console.log('🔍 [MATHTEXT] After HTML cleanup:', cleanedText.substring(0, 200));
      
      // Удаляем пустые формулы
      cleanedText = cleanedText.replace(/<span[^>]*data-type="formula"[^>]*data-latex=""[^>]*><\/span>/g, '');
      cleanedText = cleanedText.replace(/<span[^>]*data-latex=""[^>]*data-type="formula"[^>]*><\/span>/g, '');

      // Извлекаем формулы из HTML-тегов и конвертируем в $...$
      cleanedText = cleanedText.replace(/<span[^>]*data-latex="([^"]*)"[^>]*><\/span>/g, '$$$1$$');
      cleanedText = cleanedText.replace(/<[^>]+>/g, '');
      cleanedText = cleanedText.trim();

      // Нормализуем формат: конвертируем \(...\) в $...$
      let normalizedText = cleanedText;
      normalizedText = normalizedText.replace(/\\\((.*?)\\\)/g, '$$$1$$');
      normalizedText = normalizedText.replace(/\\\[(.*?)\\\]/g, '$$$1$$');

      console.log('🔍 [MATHTEXT] After normalization:', normalizedText.substring(0, 200));
      console.log('🔍 [MATHTEXT] Has $ signs:', normalizedText.includes('$'));
      console.log('🔍 [MATHTEXT] Count of $ signs:', (normalizedText.match(/\$/g) || []).length);

      // Рендерим с помощью KaTeX
      const container = containerRef.current;
      
      // Split by formulas: $$...$$ (block) or $...$ (inline)
      // Important: match $$ first, then single $
      const parts: string[] = [];
      let currentPos = 0;
      let inFormula = false;
      let formulaStart = -1;
      let isBlockFormula = false;
      
      for (let i = 0; i < normalizedText.length; i++) {
        if (normalizedText[i] === '$') {
          if (!inFormula) {
            // Start of formula
            // Add text before formula
            if (i > currentPos) {
              parts.push(normalizedText.substring(currentPos, i));
            }
            
            // Check if it's block formula ($$)
            if (i + 1 < normalizedText.length && normalizedText[i + 1] === '$') {
              isBlockFormula = true;
              formulaStart = i + 2; // Skip $$
              i++; // Skip second $
            } else {
              isBlockFormula = false;
              formulaStart = i + 1; // Skip $
            }
            
            inFormula = true;
          } else {
            // End of formula
            if (isBlockFormula) {
              // Check if next char is also $ (end of $$)
              if (i + 1 < normalizedText.length && normalizedText[i + 1] === '$') {
                const formula = normalizedText.substring(formulaStart, i);
                parts.push('$$' + formula + '$$');
                i++; // Skip second $
                currentPos = i + 1;
                inFormula = false;
              }
            } else {
              // Single $ - end of inline formula
              const formula = normalizedText.substring(formulaStart, i);
              parts.push('$' + formula + '$');
              currentPos = i + 1;
              inFormula = false;
            }
          }
        }
      }
      
      // Add remaining text
      if (currentPos < normalizedText.length) {
        parts.push(normalizedText.substring(currentPos));
      }
      
      console.log('🔍 [MATHTEXT] Split into', parts.length, 'parts:');
      parts.forEach((part, idx) => {
        if (part) {
          const isFormula = part.startsWith('$');
          const preview = part.substring(0, 50) + (part.length > 50 ? '...' : '');
          console.log(`   Part ${idx}: ${preview} ${isFormula ? '(FORMULA)' : '(TEXT)'}`);
        }
      });
      
      parts.forEach((part) => {
        if (!part) return;

        if (part.startsWith('$$') && part.endsWith('$$')) {
          // Блочная формула
          let math = part.slice(2, -2).trim();
          
          // Auto-wrap subscripts and superscripts
          math = math.replace(/([a-zA-Z0-9])_(?!{)([a-zA-Z0-9])/g, '$1_{$2}');
          math = math.replace(/([a-zA-Z0-9])\^(?!{)([a-zA-Z0-9])/g, '$1^{$2}');
          
          console.log('🔄 [MATHTEXT] Rendering block formula:', math);
          
          const span = document.createElement('span');
          span.className = 'katex-block';
          try {
            katex.render(math, span, {
              displayMode: true,
              throwOnError: false,
              errorColor: '#cc0000',
              strict: false
            });
            console.log('✅ [MATHTEXT] Block formula rendered successfully');
          } catch (e) {
            console.error('❌ [MATHTEXT] Error rendering block formula:', e);
            span.textContent = part;
            span.className = 'text-red-500';
          }
          container.appendChild(span);
        } else if (part.startsWith('$') && part.endsWith('$')) {
          // Inline формула
          let math = part.slice(1, -1).trim();
          
          // Auto-wrap subscripts and superscripts
          math = math.replace(/([a-zA-Z0-9])_(?!{)([a-zA-Z0-9])/g, '$1_{$2}');
          math = math.replace(/([a-zA-Z0-9])\^(?!{)([a-zA-Z0-9])/g, '$1^{$2}');
          
          console.log('🔄 [MATHTEXT] Rendering inline formula:', math);
          
          const span = document.createElement('span');
          span.className = 'katex-inline';
          try {
            katex.render(math, span, {
              displayMode: false,
              throwOnError: false,
              errorColor: '#cc0000',
              strict: false
            });
            console.log('✅ [MATHTEXT] Inline formula rendered successfully');
          } catch (e) {
            console.error('❌ [MATHTEXT] Error rendering inline formula:', e);
            span.textContent = part;
            span.className = 'text-red-500';
          }
          container.appendChild(span);
        } else {
          // Обычный текст
          const textNode = document.createTextNode(part);
          container.appendChild(textNode);
        }
      });
      
      console.log('✅ [MATHTEXT] ===== RENDERING COMPLETE =====');
    } catch (error) {
      console.error('❌ [MATHTEXT] Fatal error:', error);
      if (containerRef.current) {
        containerRef.current.textContent = text;
      }
    }
  }, [text]);

  if (!text) return null;

  return <span ref={containerRef} className={className}></span>;
}
