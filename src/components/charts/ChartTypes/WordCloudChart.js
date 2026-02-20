/**
 * Word Cloud Chart implementation for ECharts
 * Location: src/components/charts/ChartTypes/WordCloudChart.js
 * 
 * Supports text frequency visualization with filtering via labelField
 */

import { BaseChart } from './BaseChart';
import { generateColorPalette, formatValue } from '../../../utils';

// Import echarts-wordcloud plugin
import 'echarts-wordcloud';

export class WordCloudChart extends BaseChart {
  static getOptions(data, config, isDarkMode) {
    if (!this.validateData(data)) {
      return this.getEmptyChartOptions(isDarkMode);
    }

    const processedData = this.processData(data, config);
    
    // Generate colors based on categories if using category coloring
    const colors = this.generateColors(processedData, config, isDarkMode);
    
    return {
      ...this.getBaseOptions(isDarkMode),
      
      // Animation settings to prevent flickering
      animation: config.layoutAnimation !== false,
      animationDuration: config.animationDuration || 1000,
      animationEasing: config.animationEasing || 'cubicOut',
      
      series: [{
        type: 'wordCloud',
        
        // Shape configuration
        shape: config.shape || 'circle', // 'circle', 'cardioid', 'diamond', 'triangle', 'pentagon', 'star'
        
        // Size and positioning - adjusted for better fit
        left: config.left || 'center',
        top: config.top || 'center', 
        width: config.width || '90%',
        height: config.height || '85%',
        right: config.right || null,
        bottom: config.bottom || null,
        
        // Text size range - more conservative for readability
        sizeRange: config.sizeRange || [14, 60],
        
        // Rotation settings - less rotation for better readability
        rotationRange: config.rotationRange || [-30, 30],
        rotationStep: config.rotationStep || 15,
        
        // Grid and spacing - tighter packing
        gridSize: config.gridSize || 6,
        drawOutOfBound: config.drawOutOfBound || false,
        shrinkToFit: config.shrinkToFit !== false,
        
        // Performance settings - improved stability
        layoutAnimation: config.layoutAnimation !== false,
        animationDuration: config.animationDuration || 1000,
        animationEasing: config.animationEasing || 'cubicOut',
        
        // Data with proper color assignment
        data: processedData.words.map((word, index) => ({
          ...word,
          // Assign color directly to each word data point
          textStyle: {
            color: this.assignWordColor(word, index, processedData, config, colors, isDarkMode)
          }
        })),
        
        // Styling - remove color function since we're setting it per word
        textStyle: {
          fontFamily: config.fontFamily || '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontWeight: config.fontWeight || 'normal'
          // Color is set per word in the data
        },
        
        // Emphasis (hover) effects
        emphasis: {
          focus: 'self',
          textStyle: {
            fontWeight: 'bold',
            textShadowBlur: config.hoverShadowBlur || 8,
            textShadowColor: config.hoverShadowColor || (isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')
          }
        }
      }],
      
      tooltip: {
        show: config.showTooltip !== false,
        trigger: 'item',
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.96)' : 'rgba(255, 255, 255, 0.96)',
        borderColor: isDarkMode ? '#334155' : '#E2E8F0',
        borderWidth: 1,
        borderRadius: 8,
        extraCssText: isDarkMode
          ? 'box-shadow: 0 14px 28px -14px rgba(2, 6, 23, 0.75);'
          : 'box-shadow: 0 12px 24px -12px rgba(15, 23, 42, 0.3);',
        textStyle: {
          color: isDarkMode ? '#E2E8F0' : '#0F172A'
        },
        formatter: (params) => {
          const word = params.data;
          let tooltip = `<div style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">${word.name}</div>`;
          tooltip += `<div>Count: <strong>${formatValue(word.value, config.format)}</strong></div>`;
          
          // Show category if available
          if (word.category && config.categoryField) {
            const categoryLabel = this.getFieldLabel(config.categoryField);
            tooltip += `<div>${categoryLabel}: <strong>${word.category}</strong></div>`;
          }
          
          // Show percentage if total is available
          if (word.percentage) {
            tooltip += `<div>Percentage: <strong>${word.percentage}%</strong></div>`;
          }
          
          // Custom tooltip fields
          if (config.customTooltipFields && word.originalData) {
            config.customTooltipFields.forEach(field => {
              if (word.originalData[field] !== undefined) {
                const fieldLabel = this.getFieldLabel(field);
                tooltip += `<div>${fieldLabel}: ${word.originalData[field]}</div>`;
              }
            });
          }
          
          return tooltip;
        }
      },
      
      // Legend for categories (only show if we have multiple categories and it's enabled)
      legend: this.getLegendConfig(processedData, config, isDarkMode)
    };
  }

  static processData(data, config) {
    const {
      textField = 'word',
      valueField = 'count',
      categoryField = null, // For labelField filtering support
      minWordLength = 1,
      maxWords = 100,
      excludeWords = [],
      normalizeCase = true
    } = config;

    if (!Array.isArray(data)) {
      throw new Error('Word cloud data must be an array');
    }

    console.log('WordCloudChart: Processing data with config:', {
      textField,
      valueField, 
      categoryField,
      dataLength: data.length,
      sampleData: data.slice(0, 3)
    });

    // Process each data item
    let processedWords = data.map(item => {
      const text = item[textField];
      const value = parseFloat(item[valueField] || 0);
      const category = categoryField ? (item[categoryField] || 'Unknown') : null;
      
      if (!text || isNaN(value)) {
        return null;
      }

      // Clean and normalize the word
      let cleanWord = text.toString();
      if (normalizeCase) {
        cleanWord = cleanWord.toLowerCase();
      }
      
      // Check if word should be excluded
      const excludeList = excludeWords.map(w => w.toLowerCase());
      if (excludeList.includes(cleanWord.toLowerCase()) || 
          cleanWord.length < minWordLength) {
        return null;
      }

      // Capitalize first letter for display
      const displayWord = normalizeCase ? 
        cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1) : 
        cleanWord;

      return {
        name: displayWord,
        value: value,
        category: category,
        originalData: item
      };
    }).filter(word => word !== null);

    // Sort by value (descending)
    processedWords.sort((a, b) => b.value - a.value);
    
    // Limit number of words
    processedWords = processedWords.slice(0, maxWords);

    // Calculate percentages
    const totalValue = processedWords.reduce((sum, word) => sum + word.value, 0);
    processedWords = processedWords.map(word => ({
      ...word,
      percentage: totalValue > 0 ? ((word.value / totalValue) * 100).toFixed(1) : '0.0'
    }));

    // Get unique categories for legend
    const categories = categoryField ? 
      [...new Set(processedWords.map(w => w.category))].filter(c => c && c !== 'Unknown') : 
      [];
    if (categoryField && !categories.includes('Unknown')) {
      categories.push('Unknown');
    }

    console.log('WordCloudChart: Processed words:', {
      wordCount: processedWords.length,
      categories: categories.length,
      categoriesList: categories,
      topWords: processedWords.slice(0, 5).map(w => `${w.name}: ${w.value} (${w.category})`)
    });

    return { 
      words: processedWords,
      categories: categories,
      totalValue: totalValue
    };
  }

  static generateColors(processedData, config, isDarkMode) {
    if (config.categoryField && processedData.categories.length > 0) {
      // Generate colors for categories
      return generateColorPalette(processedData.categories.length, isDarkMode);
    } else {
      // Generate colors for random/gradient coloring
      return this.getDefaultColors(isDarkMode);
    }
  }

  static assignWordColor(word, index, processedData, config, colors, isDarkMode) {
    console.log('WordCloudChart: Assigning color for word:', {
      word: word.name,
      category: word.category,
      colorMode: config.colorMode,
      availableCategories: processedData.categories
    });

    if (config.colorMode === 'category' && config.categoryField && processedData.categories.length > 0) {
      // Color by category
      const categories = processedData.categories;
      const categoryIndex = categories.indexOf(word.category);
      const assignedColor = categoryIndex >= 0 ? colors[categoryIndex % colors.length] : colors[colors.length - 1];
      
      console.log('WordCloudChart: Category color assignment:', {
        category: word.category,
        categoryIndex,
        assignedColor,
        allCategories: categories
      });
      
      return assignedColor;
    } else if (config.colorMode === 'gradient') {
      // Color by value (gradient)
      const maxValue = Math.max(...processedData.words.map(w => w.value));
      const minValue = Math.min(...processedData.words.map(w => w.value));
      const ratio = maxValue === minValue ? 0.5 : (word.value - minValue) / (maxValue - minValue);
      const startColor = config.gradientColors?.[0] || (isDarkMode ? '#818CF8' : '#4F46E5');
      const endColor = config.gradientColors?.[1] || (isDarkMode ? '#F472B6' : '#EC4899');
      return this.interpolateColors(startColor, endColor, ratio);
    } else {
      // Random colors (default) - but consistent per word
      const assignedColor = colors[index % colors.length];
      console.log('WordCloudChart: Random color assignment:', {
        word: word.name,
        index,
        assignedColor
      });
      return assignedColor;
    }
  }

  static getLegendConfig(processedData, config, isDarkMode) {
    // Check if legend is explicitly disabled
    if (config.showLegend === false) {
      return { show: false };
    }
    
    // Only show legend if we have categories AND multiple categories AND it's explicitly enabled
    if (config.categoryField && 
        processedData.categories.length > 1 && 
        config.colorMode === 'category') {
      
      console.log('WordCloudChart: Creating legend for categories:', processedData.categories);
      
      return {
        show: true,
        type: 'scroll',
        orient: 'horizontal',
        bottom: 5,
        left: 'center',
        data: processedData.categories.map(cat => ({
          name: cat,
          icon: 'circle'
        })),
        textStyle: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
          fontSize: 11
        },
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: [4, 8],
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 12
      };
    }
    
    // Hide legend by default
    console.log('WordCloudChart: Hiding legend - no categories or not category mode');
    return { show: false };
  }

  static getDefaultColors(isDarkMode) {
    return isDarkMode ? [
      '#818CF8', '#34D399', '#FBBF24', '#F87171', '#A78BFA',
      '#60A5FA', '#F472B6', '#2DD4BF', '#FDBA74', '#A3E635',
      '#67E8F9', '#C4B5FD', '#4ADE80', '#FDA4AF', '#38BDF8'
    ] : [
      '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#3B82F6', '#EC4899', '#14B8A6', '#F97316', '#84CC16',
      '#06B6D4', '#A855F7', '#22C55E', '#FB7185', '#0EA5E9'
    ];
  }

  static interpolateColors(color1, color2, ratio) {
    const hex2rgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const c1 = hex2rgb(color1);
    const c2 = hex2rgb(color2);
    
    if (!c1 || !c2) return color1;
    
    const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
    const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
    const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  static getFieldLabel(fieldName) {
    // Convert field names to readable labels
    const fieldLabels = {
      'word_type': 'Type',
      'source': 'Source', 
      'category': 'Category',
      'topic': 'Topic',
      'sentiment': 'Sentiment',
      'language': 'Language'
    };
    return fieldLabels[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  static validateData(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('WordCloudChart: Invalid data provided');
      return false;
    }
    
    const firstItem = data[0];
    if (!firstItem || typeof firstItem !== 'object') {
      console.warn('WordCloudChart: Data items must be objects');
      return false;
    }
    
    return true;
  }
}

export default WordCloudChart;
