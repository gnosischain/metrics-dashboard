import { describe, expect, it } from 'vitest';
import { formatTruncateHex } from './formatters';

const renderHtml = (html) => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  return wrapper;
};

describe('formatTruncateHex', () => {
  it('escapes display text and copy metadata without inline JavaScript', () => {
    const value = '0xabc"\'&<>\\def123456789';
    const html = formatTruncateHex(value);
    const wrapper = renderHtml(html);
    const span = wrapper.querySelector('.hex-copy');

    expect(html).not.toContain('onclick=');
    expect(html).not.toContain('writeText');
    expect(span).not.toBeNull();
    expect(span.dataset.copyValue).toBe(value);
    expect(span.getAttribute('title')).toBe(`${value} — click to copy`);
    expect(span.textContent).toBe(`${value.slice(0, 6)}…${value.slice(-4)}`);
  });

  it('escapes short values that do not need truncation', () => {
    const wrapper = renderHtml(formatTruncateHex('<img src=x>'));

    expect(wrapper.querySelector('img')).toBeNull();
    expect(wrapper.textContent).toBe('<img src=x>');
  });
});
