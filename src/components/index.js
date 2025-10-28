/**
 * Components Index
 * Location: src/components/index.js
 * 
 * This file exports all components to make imports cleaner
 */

import Dashboard from './Dashboard';
import Header from './Header';
import TabNavigation from './TabNavigation';
import MetricGrid from './MetricGrid';
import MetricWidget from './MetricWidget';
import Card from './Card';
import TextWidget from './TextWidget';
import NumberWidget from './NumberWidget';
import ThemeToggle from './ThemeToggle';
import IconComponent from './IconComponent';
import LabelSelector from './LabelSelector';
import ExpandButton from './ExpandButton';
import ChartModal from './ChartModal';
import TableWidget from './TableWidget';

import EChartsContainer from './charts/ChartTypes/EChartsContainer';
import { 
  LineChart, 
  AreaChart, 
  BarChart, 
  SankeyChart, 
  PieChart, 
  RadarChart,
  BoxplotChart,
  HeatmapChart,
  GraphChart,
  SunburstChart 
} from './charts/ChartTypes';

// Export all components
export {
  Dashboard,
  Header,
  TabNavigation,
  MetricGrid,
  MetricWidget,
  Card,
  TextWidget,
  NumberWidget,
  ThemeToggle,
  IconComponent,
  LabelSelector,
  ExpandButton,
  ChartModal,
  TableWidget,
  
  // ECharts components
  EChartsContainer,
  LineChart,
  AreaChart,
  BarChart,
  SankeyChart,
  PieChart,
  RadarChart,
  BoxplotChart,
  HeatmapChart,
  GraphChart,
  SunburstChart
};

export default Dashboard;