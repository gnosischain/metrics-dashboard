/**
 * Components Index
 * Location: src/components/index.js
 * 
 * This file exports all components to make imports cleaner
 */

import Dashboard from './Dashboard.jsx';
import Header from './Header.jsx';
import TabNavigation from './TabNavigation.jsx';
import MetricGrid from './MetricGrid.jsx';
import MetricWidget from './MetricWidget.jsx';
import Card from './Card.jsx';
import TextWidget from './TextWidget.jsx';
import NumberWidget from './NumberWidget.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import IconComponent from './IconComponent.jsx';
import LabelSelector from './LabelSelector.jsx';
import ExpandButton from './ExpandButton.jsx';
import ChartModal from './ChartModal.jsx';
import TableWidget from './TableWidget.jsx';

import EChartsContainer from './charts/ChartTypes/EChartsContainer.jsx';
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