import React from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ShopOutlined,
  DatabaseOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const SettingsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const settingsMenuItems = [
    {
      key: 'system-settings',
      type: 'group',
      label: 'System settings',
      children: [
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
      ],
    },
    {
      key: 'manage-cards',
      type: 'group',
      label: 'Manage cards',
      children: [
        {
          key: '/settings/users',
          icon: <UserOutlined />,
          label: 'Manage cards',
        },
        {
          key: '/settings/teams',
          icon: <TeamOutlined />,
          label: 'Manage hierarchy',
        },
        {
          key: '/settings/warehouses',
          icon: <DatabaseOutlined />,
          label: 'Hierarchy access',
        },
        {
          key: '/settings/commissions',
          icon: <PercentageOutlined />,
          label: 'Company defined fields',
        },
      ],
    },
  ] as MenuItem[];

  const handleMenuClick = (e: any) => {
    navigate(e.key);
  };

  return (
    <Layout className="settings-layout">
      <Sider
        width={250}
        className="bg-white shadow-sm site-layout-background"
        collapsible={false}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={settingsMenuItems}
          onClick={handleMenuClick}
          className="border-r-0"
        />
      </Sider>
      <Layout.Content className="p-6">
        {children}
      </Layout.Content>
    </Layout>
  );
};

export default SettingsLayout; 