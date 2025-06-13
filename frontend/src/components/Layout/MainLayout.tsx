import React, { useState, Suspense, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Spin, Avatar } from 'antd';
import {
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
  MailOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
// Import logo from assets
import logo from '../../assets/logo.png';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout: React.FC = () => {
  const [settingsSidebarVisible, setSettingsSidebarVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current route is a settings page
  useEffect(() => {
    setSettingsSidebarVisible(location.pathname.startsWith('/settings'));
  }, [location.pathname]);

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
      label: 'Home',
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
      key: '/accounts',
      icon: <DollarOutlined />,
      label: 'Accounts',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const handleMenuClick = (e: any) => {
    if (e.key === '/settings') {
      navigate('/settings/users');
    } else {
      navigate(e.key);
    }
  };

  const getCurrentSettingsMenuItem = () => {
    return settingsMenuItems.find(item => location.pathname === item.key)?.key || '/settings/users';
  };

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white px-4 shadow-sm flex items-center justify-between h-16 z-10">
        <div className="flex items-center">
          <div className="logo-container mr-4">
            <img 
              src={logo} 
              alt="Company Logo" 
              className="h-10 w-auto"
            />
          </div>
          <Title level={4} className="m-0">
            Client Centre
          </Title>
        </div>
        
        <div className="flex items-center">
          <Button
            type="text"
            icon={<MailOutlined />}
            className="mr-2"
          />
          <div className="user-info flex items-center cursor-pointer">
            <span className="mr-2">Choudhry Raza</span>
            <Avatar icon={<UserOutlined />} />
          </div>
        </div>
      </Header>
      
      <Layout>
        <div className="top-navigation border-b bg-white">
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname.split('/')[1] ? '/' + location.pathname.split('/')[1] : '/']}
            items={mainMenuItems}
            onClick={handleMenuClick}
            className="border-r-0"
          />
        </div>
        
        <Layout>
          {settingsSidebarVisible && (
            <Sider
              width={250}
              className="bg-white shadow-sm site-layout-background"
              collapsible={false}
            >
              <div className="p-4">
                <Title level={5} className="m-0">System settings</Title>
              </div>
              <Menu
                mode="inline"
                selectedKeys={[getCurrentSettingsMenuItem()]}
                items={settingsMenuItems}
                onClick={handleMenuClick}
                className="border-r-0"
              />
            </Sider>
          )}
          
          <Content className="p-6 bg-gray-50 min-h-[calc(100vh-64px-46px)]">
            <Suspense fallback={
              <div className="flex justify-center items-center h-64">
                <Spin size="large" />
              </div>
            }>
              <Outlet />
            </Suspense>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
