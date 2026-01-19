import React, { useEffect, useRef, useState } from 'react';
import Card from './Card.jsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import mermaid from 'mermaid';


const isElementDark = (el) => {
  if (!el) return false;
  const cls = el.classList || { contains: () => false };
  const dataTheme = el.getAttribute ? el.getAttribute('data-theme') : null;
  return (
    cls.contains('dark') ||
    cls.contains('dark-mode') ||
    dataTheme === 'dark'
  );
};

const getIsDark = () => {
  if (typeof document === 'undefined') return false;
  const html = document.documentElement;
  const body = document.body;
  // Prefer explicit app flags on html/body
  if (isElementDark(html) || isElementDark(body)) return true;
  // Otherwise: treat as light (no OS fallback so light keeps Mermaid's default)
  return false;
};

// Light: Mermaid’s built-in default theme
const baseLight = {
  theme: 'default',
  startOnLoad: false,
  securityLevel: 'loose',
  flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
};

// Dark: custom variables for good contrast on dark cards
const darkTheme = {
  theme: 'base',
  themeVariables: {
    background: 'transparent',
    textColor: '#e6edf3',
    mainBkg: '#232933',
    primaryColor: '#2b313c',
    primaryBorderColor: '#8b949e',
    primaryTextColor: '#e6edf3',
    lineColor: '#9aa4b2',
    secondaryColor: '#2d333b',
    tertiaryColor: '#1f242c',
    noteBkgColor: '#2b313c',
    noteTextColor: '#e6edf3',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  securityLevel: 'loose',
  startOnLoad: false,
  flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
};

// Initialize once with LIGHT default so you truly get Mermaid's original look
mermaid.initialize(baseLight);

/* -----------------------------
   Mermaid code block renderer
   ----------------------------- */

const CodeBlock = ({ language, children }) => {
  const raw = String(children).trim();
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`);
  const [svg, setSvg] = useState(null);
  const [isDark, setIsDark] = useState(getIsDark());

  // Observe theme changes on <html> and <body>
  useEffect(() => {
    if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return;

    const html = document.documentElement;
    const body = document.body;

    const onMutation = () => setIsDark(getIsDark());

    const opts = { attributes: true, attributeFilter: ['class', 'data-theme'] };
    const moHtml = new MutationObserver(onMutation);
    const moBody = new MutationObserver(onMutation);

    moHtml.observe(html, opts);
    if (body) moBody.observe(body, opts);

    return () => {
      moHtml.disconnect();
      moBody.disconnect();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const renderMermaid = async () => {
      // Re-configure Mermaid for current theme just before rendering
      mermaid.initialize(isDark ? darkTheme : baseLight);
      try {
        const { svg } = await mermaid.render(idRef.current, raw);
        if (!cancelled) setSvg(svg);
      } catch (e) {
        console.error('Mermaid render error:', e);
        if (!cancelled) setSvg(null);
      }
    };

    if (language === 'mermaid' && raw) {
      renderMermaid();
    } else {
      setSvg(null);
    }
    return () => { cancelled = true; };
  }, [language, raw, isDark]);

  if (language === 'mermaid') {
    return (
      <div
        className="mermaid-container"
        style={{ visibility: svg ? 'visible' : 'hidden' }} // avoids layout jump
        dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
        data-mermaid-id={idRef.current}
      />
    );
  }

  return (
    <pre>
      <code className={`language-${language || ''}`}>{raw}</code>
    </pre>
  );
};

/* -----------------------------
   TextWidget
   ----------------------------- */

const TextWidget = ({ title, subtitle, content, minimal = false }) => {
  const markdownContent = (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      components={{
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          if (!inline && language) {
            return (
              <CodeBlock language={language}>
                {String(children).replace(/\n$/, '')}
              </CodeBlock>
            );
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <Card minimal={minimal} title={title} subtitle={subtitle}>
      <div className="text-widget">{markdownContent}</div>
    </Card>
  );
};

export default TextWidget;
