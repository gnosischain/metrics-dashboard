import React, { useState, useEffect } from 'react';
import Header from './Header';
import TabNavigation from './TabNavigation';
import MetricGrid from './MetricGrid';
import metricsService from '../services/metrics';

/**
 * Main Dashboard component with tabbed interface
 * @returns {JSX.Element} Dashboard component
 */
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('');
  const [tabs, setTabs] = useState([]);
  const [tabMetrics, setTabMetrics] = useState([]);
  
  // Get all metrics configurations and organize tabs
  useEffect(() => {
    // Get all unique tabs from metrics service
    const allTabs = metricsService.getAllTabs();
    setTabs(allTabs);
    
    // Set first tab as active if no active tab
    if (!activeTab && allTabs.length > 0) {
      setActiveTab(allTabs[0]);
    }
  }, []);
  
  // Update metrics when active tab changes
  useEffect(() => {
    if (activeTab) {
      const metricsForTab = metricsService.getMetricsForTab(activeTab);
      setTabMetrics(metricsForTab);
    } else {
      setTabMetrics([]);
    }
  }, [activeTab]);
  
  // Change the active tab
  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      // Clear existing metrics first to ensure clean unmounting
      setTabMetrics([]);
      setActiveTab(tab);
    }
  };
  
  return (
    <div className="dashboard">
      <Header />
      
      <div className="dashboard-main">
        <aside className="dashboard-sidebar">
          <TabNavigation 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
        </aside>
        
        <div className="dashboard-content">
          {activeTab ? (
            <div className="tab-content">
              <MetricGrid key={`grid-${activeTab}`} metrics={tabMetrics} />
            </div>
          ) : (
            <div className="loading-indicator">Loading dashboard...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;