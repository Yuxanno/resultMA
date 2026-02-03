import { NodeViewWrapper } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FormulaPopover from './FormulaPopover';

export default function FormulaNode({ node, updateAttributes, selected, editor }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const nodeRef = useRef<HTMLSpanElement>(null);
  const currentLatexRef = useRef<string>('');
  
  const rawLatex = node.attrs.latex || '';
  const latex = rawLatex.replace(/\\\\/g, '\\');
  
  useEffect(() => {
    currentLatexRef.current = latex;
  }, [latex]);

  // Автоматически открываем popover ТОЛЬКО для новых пустых формул
  // НЕ открываем для импортированных формул с содержимым
  useEffect(() => {
    if (!latex && !showPopover && nodeRef.current) {
      // Небольшая задержка чтобы node успел отрендериться
      setTimeout(() => {
        setShowPopover(true);
        setIsEditing(true);
      }, 100);
    }
  }, []); // Пустой массив зависимостей - выполняется только при монтировании

  useEffect(() => {
    if (selected && !isEditing) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
          e.preventDefault();
          setShowPopover(true);
          setIsEditing(true);
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selected, isEditing]);

  const handleDoubleClick = () => {
    setShowPopover(true);
    setIsEditing(true);
  };

  const handleSave = (newLatex: string) => {
    currentLatexRef.current = newLatex;
    if (newLatex.trim()) {
      updateAttributes({ latex: newLatex });
    }
  };

  const handleClose = () => {
    const finalLatex = currentLatexRef.current;
    
    if (!finalLatex.trim()) {
      editor.commands.deleteSelection();
    } else {
      updateAttributes({ latex: finalLatex });
    }
    
    setShowPopover(false);
    setIsEditing(false);
  };

  return (
    <NodeViewWrapper as="span" className="inline-block relative">
      <span
        ref={nodeRef}
        onDoubleClick={handleDoubleClick}
        className={`inline-flex items-center px-2 py-1 mx-0.5 rounded-md cursor-pointer transition-all ${
          selected
            ? 'bg-blue-100 ring-2 ring-blue-400 ring-offset-1'
            : 'bg-gray-50 hover:bg-gray-100'
        }`}
        contentEditable={false}
      >
        {latex ? (
          <InlineMath math={latex} />
        ) : (
          <span className="text-gray-400 text-sm italic">formula</span>
        )}
      </span>

      {showPopover && nodeRef.current && (
        <FormulaPopover
          anchorEl={nodeRef.current}
          initialLatex={latex}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </NodeViewWrapper>
  );
}
