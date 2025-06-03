import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="settings/chart-of-accounts" element={<ChartOfAccounts />} />
          <Route path="settings/departments" element={<Departments />} />
          <Route path="settings/locations" element={<Locations />} />
          <Route path="settings/currencies" element={<Currencies />} />
          <Route path="settings/manufacturers" element={<Manufacturers />} />
          <Route path="settings/users" element={<Users />} />
          <Route path="settings/teams" element={<Teams />} />
          <Route path="settings/warehouses" element={<Warehouses />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App
