import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface LaTeXPreviewProps {
  text: string;
}

export const LaTeXPreview: React.FC<LaTeXPreviewProps> = ({ text }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        // Simple regex to replace $...$ with katex rendered spans
        // Note: For a real production app, use a more robust parser like Remark-Math
        const parts = text.split(/(\$[^\$]+\$)/g);
        containerRef.current.innerHTML = parts.map(part => {
          if (part.startsWith('$') && part.endsWith('$')) {
            const math = part.slice(1, -1);
            return katex.renderToString(math, { throwOnError: false, displayMode: false });
          }
          return part;
        }).join('');
      } catch (e) {
        console.error('KaTeX error', e);
      }
    }
  }, [text]);

  return <div ref={containerRef} className="prose dark:prose-invert max-w-none" />;
};
