/**
 * ECharts theme configurations for light and dark modes
 */

export const LIGHT_THEME = {
    backgroundColor: 'transparent',
    textStyle: {
      color: '#333333',
      fontFamily: 'Arial, sans-serif'
    },
    title: {
      textStyle: {
        color: '#333333'
      }
    },
    legend: {
      textStyle: {
        color: '#333333'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#dddddd',
      borderWidth: 1,
      textStyle: {
        color: '#333333'
      }
    },
    grid: {
      borderColor: '#cccccc'
    },
    categoryAxis: {
      axisLine: {
        lineStyle: {
          color: '#dddddd'
        }
      },
      axisLabel: {
        color: '#666666'
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      }
    },
    valueAxis: {
      axisLine: {
        lineStyle: {
          color: '#dddddd'
        }
      },
      axisLabel: {
        color: '#666666'
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      }
    }
  };
  
  export const DARK_THEME = {
    backgroundColor: 'transparent',
    textStyle: {
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    },
    title: {
      textStyle: {
        color: '#ffffff'
      }
    },
    legend: {
      textStyle: {
        color: '#ffffff'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(50, 50, 50, 0.95)',
      borderColor: '#555555',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff'
      }
    },
    grid: {
      borderColor: '#444444'
    },
    categoryAxis: {
      axisLine: {
        lineStyle: {
          color: '#444444'
        }
      },
      axisLabel: {
        color: '#cccccc'
      },
      splitLine: {
        lineStyle: {
          color: '#333333'
        }
      }
    },
    valueAxis: {
      axisLine: {
        lineStyle: {
          color: '#444444'
        }
      },
      axisLabel: {
        color: '#cccccc'
      },
      splitLine: {
        lineStyle: {
          color: '#333333'
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
        '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
        '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#d4a76a',
        '#6b9bd1', '#a4de6c', '#ffc658', '#ff7875', '#87ceeb'
      ];
    } else {
      return [
        '#4285f4', '#34a853', '#fbbc04', '#ea4335', '#9aa0a6',
        '#0f9d58', '#ff6d01', '#673ab7', '#e91e63', '#795548',
        '#607d8b', '#009688', '#ff9800', '#8bc34a', '#cddc39'
      ];
    }
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