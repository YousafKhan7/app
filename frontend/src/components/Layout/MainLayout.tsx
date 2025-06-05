import React, { useState } from 'react';
import { Layout, Menu, Button, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ShopOutlined,
  DatabaseOutlined,
  PercentageOutlined,
  ContactsOutlined,
  FileTextOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const settingsMenuItems = [
    {
      key: '/settings/chart-of-accounts',
      icon: <BankOutlined />,
      label: 'Chart of Account',
    },
    {
      key: '/settings/departments',
      icon: <TeamOutlined />,
      label: 'Department',
    },
    {
      key: '/settings/locations',
      icon: <EnvironmentOutlined />,
      label: 'Location',
    },
    {
      key: '/settings/currencies',
      icon: <DollarOutlined />,
      label: 'Currency',
    },
    {
      key: '/settings/manufacturers',
      icon: <ShopOutlined />,
      label: 'Manufacturers',
    },
    {
      key: '/settings/users',
      icon: <UserOutlined />,
      label: 'Users',
    },
    {
      key: '/settings/teams',
      icon: <TeamOutlined />,
      label: 'Teams',
    },
    {
      key: '/settings/warehouses',
      icon: <DatabaseOutlined />,
      label: 'Inventory Management',
    },
    {
      key: '/settings/commissions',
      icon: <PercentageOutlined />,
      label: 'Commissions',
    },
  ];

  const mainMenuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/customers',
      icon: <ContactsOutlined />,
      label: 'Customers',
    },
    {
      key: '/suppliers',
      icon: <ShopOutlined />,
      label: 'Suppliers',
    },
    {
      key: '/quotes',
      icon: <FileTextOutlined />,
      label: 'Quotes',
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: 'Projects',
    },
    {
      key: '/accounts',
      icon: <DollarOutlined />,
      label: 'Accounts',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      children: settingsMenuItems,
    },
  ];

  const handleMenuClick = (e: any) => {
    if (e.key !== 'settings') {
      navigate(e.key);
    }
  };

  return (
    <Layout className="min-h-screen">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={250}
        className="bg-white shadow-lg"
      >
        <div className="p-4 border-b">
          <Title level={4} className="m-0 text-center">
            {collapsed ? 'App' : 'Full Stack App'}
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={location.pathname.startsWith('/settings') ? ['settings'] : []}
          items={mainMenuItems}
          onClick={handleMenuClick}
          className="border-r-0"
        />
      </Sider>
      
      <Layout>
        <Header className="bg-white px-4 shadow-sm flex items-center">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />
        </Header>
        
        <Content className="p-6 bg-gray-50">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
