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
  
  // Change the active tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Get metrics for the active tab
  const tabMetrics = activeTab ? metricsService.getMetricsForTab(activeTab) : [];
  
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
             
              <MetricGrid metrics={tabMetrics} />
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