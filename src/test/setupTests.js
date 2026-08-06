import { expect } from 'vitest';
import matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// jsdom ships no canvas implementation, so HTMLCanvasElement.getContext returns null and
// logs "Not implemented". echarts-wordcloud probes for canvas support at *module scope* and
// throws `Sorry your browser not support wordCloud` when the probe fails. Because
// src/components/index.js pulls in the chart set and is also a circular dependency of
// MetricWidget.js, that throw never propagated: the import promise for MetricWidget simply
// never settled, so its whole test file hung with no error and no timeout. Installing a
// minimal 2D context here keeps the probe happy and the barrel importable.
//
// measureText must return a constant non-zero width: echarts-wordcloud's getMinFontSize
// walks font sizes from 20 down and stops as soon as two consecutive measurements agree.
if (typeof HTMLCanvasElement !== 'undefined') {
  const noop = () => {};
  const imageData = (width = 1, height = 1) => ({
    data: new Uint8ClampedArray(Math.max(1, width * height) * 4),
    width,
    height,
  });

  HTMLCanvasElement.prototype.getContext = function getContext() {
    return {
      canvas: this,
      measureText: (text = '') => ({ width: String(text).length * 8 }),
      getImageData: (x, y, width, height) => imageData(width, height),
      createImageData: (width, height) => imageData(width, height),
      putImageData: noop,
      createLinearGradient: () => ({ addColorStop: noop }),
      createRadialGradient: () => ({ addColorStop: noop }),
      createPattern: () => null,
      arc: noop,
      beginPath: noop,
      bezierCurveTo: noop,
      clearRect: noop,
      clip: noop,
      closePath: noop,
      drawImage: noop,
      fill: noop,
      fillRect: noop,
      fillText: noop,
      lineTo: noop,
      moveTo: noop,
      quadraticCurveTo: noop,
      rect: noop,
      restore: noop,
      rotate: noop,
      save: noop,
      scale: noop,
      setLineDash: noop,
      setTransform: noop,
      stroke: noop,
      strokeRect: noop,
      strokeText: noop,
      transform: noop,
      translate: noop,
    };
  };
}
