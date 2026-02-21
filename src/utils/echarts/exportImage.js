const DEFAULT_LIGHT_EXPORT_BACKGROUND = '#ffffff';
const DEFAULT_DARK_EXPORT_BACKGROUND = '#1e293b';

export const createChartExportFileName = (title = 'chart') => {
  const normalizedTitle = String(title)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const safeTitle = normalizedTitle || 'chart';
  const dateStamp = new Date().toISOString().slice(0, 10);
  return `${safeTitle}-${dateStamp}.png`;
};

export const resolveExportBackgroundColor = (anchorElement, isDarkMode = false) => {
  if (anchorElement && typeof window !== 'undefined') {
    const style = window.getComputedStyle(anchorElement);
    const surfaceColor = style.getPropertyValue('--color-surface')?.trim();
    if (surfaceColor) {
      return surfaceColor;
    }

    const elementBackground = style.backgroundColor?.trim();
    if (elementBackground && elementBackground !== 'transparent' && elementBackground !== 'rgba(0, 0, 0, 0)') {
      return elementBackground;
    }
  }

  return isDarkMode ? DEFAULT_DARK_EXPORT_BACKGROUND : DEFAULT_LIGHT_EXPORT_BACKGROUND;
};

export const downloadEChartInstanceAsPng = (chartInstance, options = {}) => {
  if (!chartInstance || typeof chartInstance.getDataURL !== 'function') {
    return false;
  }

  const {
    title = 'chart',
    isDarkMode = false,
    anchorElement = null,
    pixelRatio = 2
  } = options;

  const backgroundColor = resolveExportBackgroundColor(anchorElement, isDarkMode);

  const dataUrl = chartInstance.getDataURL({
    type: 'png',
    pixelRatio,
    backgroundColor
  });

  if (!dataUrl) {
    return false;
  }

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = createChartExportFileName(title);
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return true;
};
