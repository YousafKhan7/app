import React, { useState } from 'react';
import { Card, Typography, Space, Input, Table, Row, Col, Statistic, Alert } from 'antd';
import { SearchOutlined, UserOutlined, TeamOutlined, BankOutlined } from '@ant-design/icons';
import type { User } from '../api';
import { useUsers, useActiveUsersCount } from '../hooks/useApiQueries';

const { Title } = Typography;
const { Search } = Input;

const Dashboard: React.FC = () => {
  const [searchText, setSearchText] = useState('');

  // Use React Query hooks
  const { data: users = [], isLoading: usersLoading, error: usersError } = useUsers();
  const { data: activeUsersCount = 0, isLoading: activeCountLoading } = useActiveUsersCount();

  // Filter users based on search
  const filteredUsers = React.useMemo(() => {
    if (!searchText.trim()) {
      return users;
    }
    return users.filter(user =>
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [users, searchText]);

  const loading = usersLoading || activeCountLoading;

  // Handle search functionality - search by name OR email
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: User, b: User) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a: User, b: User) => a.email.localeCompare(b.email),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date || '').toLocaleDateString(),
      sorter: (a: User, b: User) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime(),
    },
  ];

  // Show error state
  if (usersError) {
    return (
      <div>
        <Title level={2} className="mb-8">Dashboard</Title>
        <Alert
          message="Error loading dashboard data"
          description={usersError.message}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div role="main" aria-label="Dashboard">
      <Title level={2} className="mb-8" id="dashboard-title">Dashboard</Title>

      <Space direction="vertical" size="large" className="w-full">
        {/* Statistics Cards */}
        <section aria-labelledby="statistics-heading">
          <h3 id="statistics-heading" className="sr-only">Key Statistics</h3>
          <Row gutter={16}>
            <Col span={6}>
              <Card role="region" aria-label="Total Users Statistics">
                <Statistic
                  title="Total Users"
                  value={users.length}
                  prefix={<UserOutlined aria-hidden="true" />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card role="region" aria-label="Active Users Statistics">
                <Statistic
                  title="Active Users"
                  value={activeUsersCount}
                  prefix={<TeamOutlined aria-hidden="true" />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card role="region" aria-label="Search Results Statistics">
                <Statistic
                  title="Search Results"
                  value={filteredUsers.length}
                  prefix={<SearchOutlined aria-hidden="true" />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card role="region" aria-label="System Status">
                <Statistic
                  title="System Status"
                  value="Online"
                  prefix={<BankOutlined aria-hidden="true" />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>
        </section>

        {/* Users Table */}
        <section aria-labelledby="users-table-heading">
          <Card title="Users Overview" className="shadow-lg">
            <Space direction="vertical" size="middle" className="w-full">
              {/* Search Bar */}
              <div className="mb-4">
                <label htmlFor="user-search" className="sr-only">
                  Search users by name or email
                </label>
                <Search
                  id="user-search"
                  placeholder="Search by name or email..."
                  allowClear
                  enterButton={<SearchOutlined aria-label="Search" />}
                  size="large"
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  onSearch={handleSearch}
                  style={{ maxWidth: 400 }}
                  aria-describedby="search-help"
                />
                <div id="search-help" className="sr-only">
                  Enter text to filter users by name or email address
                </div>
              </div>

              <Table
                columns={columns}
                dataSource={filteredUsers}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} users`,
                }}
                scroll={{ x: 800 }}
                aria-label="Users data table"
                aria-describedby="users-table-description"
              />
              <div id="users-table-description" className="sr-only">
                Table showing user information including name, email, and status
              </div>
            </Space>
          </Card>
        </section>
      </Space>
    </div>
  );
};

export default Dashboard;
