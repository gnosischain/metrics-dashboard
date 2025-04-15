import React from 'react';
import Card from './Card';
import ReactMarkdown from 'react-markdown';

/**
 * TextWidget component for displaying formatted text
 * @param {Object} props - Component props
 * @param {string} props.title - Optional title for the text box
 * @param {string} props.subtitle - Optional subtitle for the text box
 * @param {string} props.content - Markdown content to display
 * @returns {JSX.Element} Text widget component
 */
const TextWidget = ({ title, subtitle, content }) => {
  return (
    <Card 
    //  title={title}
    //  subtitle={subtitle}
    >
      <div className="text-widget">
        <ReactMarkdown>
          {content}
        </ReactMarkdown>
      </div>
    </Card>
  );
};

export default TextWidget;