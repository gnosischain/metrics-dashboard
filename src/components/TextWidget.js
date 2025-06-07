import React from 'react';
import Card from './Card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';      // GFM features (keep for non-table GFM)
import rehypeRaw from 'rehype-raw';      // Raw HTML (for tables and ToC anchor)
import remarkMath from 'remark-math';    // Recognize $...$ math syntax
import rehypeKatex from 'rehype-katex';  // Render math using KaTeX

/**
 * TextWidget component for displaying formatted text
 * @param {Object} props - Component props
 * @param {string} props.title - Optional title for the text box
 * @param {string} props.subtitle - Optional subtitle for the text box
 * @param {string} props.content - Markdown content to display
 * @param {boolean} props.minimal - Whether to render without card styling
 * @returns {JSX.Element} Text widget component
 */
const TextWidget = ({ title, subtitle, content, minimal = false }) => {
  const markdownContent = (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        rehypeRaw,
        rehypeKatex
      ]}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <Card minimal={minimal} title={title} subtitle={subtitle}>
      <div className="text-widget">
        {markdownContent}
      </div>
    </Card>
  );
};

export default TextWidget;