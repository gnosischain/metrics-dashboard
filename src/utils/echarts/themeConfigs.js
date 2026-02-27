/**
 * ECharts theme configurations for light and dark modes
 */

const BASE_FONT_FAMILY = '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const LIGHT_THEME = {
  backgroundColor: 'transparent',
  textStyle: {
    color: '#334155',
    fontFamily: BASE_FONT_FAMILY
  },
  title: {
    textStyle: {
      color: '#0F172A'
    }
  },
  legend: {
    textStyle: {
      color: '#334155'
    }
  },
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 8,
    extraCssText: 'box-shadow: 0 12px 24px -12px rgba(15, 23, 42, 0.3);',
    textStyle: {
      color: '#0F172A'
    }
  },
  grid: {
    borderColor: '#E2E8F0'
  },
  categoryAxis: {
    axisLine: {
      lineStyle: {
        color: '#CBD5E1'
      }
    },
    axisLabel: {
      color: '#64748B'
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(148, 163, 184, 0.24)',
        type: 'dashed'
      }
    }
  },
  valueAxis: {
    axisLine: {
      lineStyle: {
        color: '#CBD5E1'
      }
    },
    axisLabel: {
      color: '#64748B'
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(148, 163, 184, 0.24)',
        type: 'dashed'
      }
    }
  }
};

export const DARK_THEME = {
  backgroundColor: 'transparent',
  textStyle: {
    color: '#E2E8F0',
    fontFamily: BASE_FONT_FAMILY
  },
  title: {
    textStyle: {
      color: '#E2E8F0'
    }
  },
  legend: {
    textStyle: {
      color: '#CBD5E1'
    }
  },
  tooltip: {
    backgroundColor: 'rgba(30, 41, 59, 0.96)',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    extraCssText: 'box-shadow: 0 14px 28px -14px rgba(2, 6, 23, 0.75);',
    textStyle: {
      color: '#E2E8F0'
    }
  },
  grid: {
    borderColor: '#334155'
  },
  categoryAxis: {
    axisLine: {
      lineStyle: {
        color: '#475569'
      }
    },
    axisLabel: {
      color: '#94A3B8'
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(148, 163, 184, 0.18)',
        type: 'dashed'
      }
    }
  },
  valueAxis: {
    axisLine: {
      lineStyle: {
        color: '#475569'
      }
    },
    axisLabel: {
      color: '#94A3B8'
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(148, 163, 184, 0.18)',
        type: 'dashed'
      }
    }
  }
};

/**
 * Get theme configuration for specified mode
 * @param {boolean} isDarkMode - Whether to use dark theme
 * @returns {Object} Theme configuration
 */
export const getThemeConfig = (isDarkMode = false) => {
  return isDarkMode ? DARK_THEME : LIGHT_THEME;
};

/**
 * Generate color palette based on theme
 * @param {boolean} isDarkMode - Whether to use dark theme
 * @returns {Array} Color palette
 */
export const getThemeColors = (isDarkMode = false) => {
  if (isDarkMode) {
    return [
      '#818CF8', '#34D399', '#FBBF24', '#F87171', '#A78BFA',
      '#60A5FA', '#F472B6', '#2DD4BF', '#FDBA74', '#A3E635',
      '#67E8F9', '#C4B5FD', '#4ADE80', '#FDA4AF', '#38BDF8'
    ];
  }

  return [
    '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#3B82F6', '#EC4899', '#14B8A6', '#F97316', '#84CC16',
    '#06B6D4', '#A855F7', '#22C55E', '#FB7185', '#0EA5E9'
  ];
};

/**
 * Get animation configuration
 * @param {Object} config - Animation configuration overrides
 * @returns {Object} Animation configuration
 */
export const getAnimationConfig = (config = {}) => {
  return {
    animation: config.animation !== false,
    animationDuration: config.duration || 1000,
    animationEasing: config.easing || 'cubicOut',
    animationDelay: config.delay || 0,
    animationDurationUpdate: config.updateDuration || 800,
    animationEasingUpdate: config.updateEasing || 'cubicOut',
    animationDelayUpdate: config.updateDelay || 0
  };
};

