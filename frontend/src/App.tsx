import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, message, Spin } from 'antd';
import MainLayout from './components/Layout/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ChartOfAccounts = React.lazy(() => import('./pages/Settings/ChartOfAccounts'));
const Departments = React.lazy(() => import('./pages/Settings/Departments'));
const Locations = React.lazy(() => import('./pages/Settings/Locations'));
const Currencies = React.lazy(() => import('./pages/Settings/Currencies'));
const Manufacturers = React.lazy(() => import('./pages/Settings/Manufacturers'));
const Users = React.lazy(() => import('./pages/Settings/Users'));
const Teams = React.lazy(() => import('./pages/Settings/Teams'));
const Warehouses = React.lazy(() => import('./pages/Settings/Warehouses'));
const Commissions = React.lazy(() => import('./pages/Settings/Commissions'));
const Customers = React.lazy(() => import('./pages/Customers/Customers'));
const Suppliers = React.lazy(() => import('./pages/Suppliers/Suppliers'));
const Quotes = React.lazy(() => import('./pages/Quotes/Quotes'));
const Projects = React.lazy(() => import('./pages/Projects/Projects'));
const Accounts = React.lazy(() => import('./pages/Accounts/Accounts'));

// Loading component
const PageLoader = () => (
  <div className="flex justify-center items-center h-64">
    <Spin size="large" />
  </div>
);

function App() {
  // Configure message to appear at the top with proper styling
  message.config({
    top: 100,
    duration: 5,
    maxCount: 3,
  });

  return (
    <ErrorBoundary>
      <ConfigProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="quotes" element={<Quotes />} />
              <Route path="projects" element={<Projects />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="settings/chart-of-accounts" element={<ChartOfAccounts />} />
              <Route path="settings/departments" element={<Departments />} />
              <Route path="settings/locations" element={<Locations />} />
              <Route path="settings/currencies" element={<Currencies />} />
              <Route path="settings/manufacturers" element={<Manufacturers />} />
              <Route path="settings/users" element={<Users />} />
              <Route path="settings/teams" element={<Teams />} />
              <Route path="settings/warehouses" element={<Warehouses />} />
              <Route path="settings/commissions" element={<Commissions />} />
            </Route>
          </Routes>
        </Router>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App
