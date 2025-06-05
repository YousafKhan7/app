// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, message } from 'antd';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import ChartOfAccounts from './pages/Settings/ChartOfAccounts';
import Departments from './pages/Settings/Departments';
import Locations from './pages/Settings/Locations';
import Currencies from './pages/Settings/Currencies';
import Manufacturers from './pages/Settings/Manufacturers';
import Users from './pages/Settings/Users';
import Teams from './pages/Settings/Teams';
import Warehouses from './pages/Settings/Warehouses';
import Commissions from './pages/Settings/Commissions';
import Customers from './pages/Customers/Customers';
import Quotes from './pages/Quotes/Quotes';
import Projects from './pages/Projects/Projects';
import Accounts from './pages/Accounts/Accounts';

function App() {
  // Configure message to appear at the top with proper styling
  message.config({
    top: 100,
    duration: 5,
    maxCount: 3,
  });

  return (
    <ConfigProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
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
  );
}

export default App
