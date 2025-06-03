import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Input, Table, Row, Col, Statistic } from 'antd';
import { SearchOutlined, UserOutlined, TeamOutlined, ShopOutlined, BankOutlined } from '@ant-design/icons';
import { apiService } from '../api';
import type { User } from '../api';
import { useErrorHandler } from '../hooks/useErrorHandler';
import ErrorToast from '../components/ErrorDisplay/ErrorToast';

const { Title } = Typography;
const { Search } = Input;

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Use our custom error handler hook
  const { errorMessage, showError, clearError } = useErrorHandler();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await apiService.getUsers();
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error: any) {
      showError(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Handle search functionality - search by name OR email
  const handleSearch = (value: string) => {
    setSearchText(value);
    if (!value.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(value.toLowerCase()) ||
      user.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
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
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: User, b: User) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
  ];

  return (
    <div>
      <Title level={2} className="mb-8">Dashboard</Title>

      {/* Error Display */}
      <ErrorToast message={errorMessage} onClose={clearError} />

      <Space direction="vertical" size="large" className="w-full">
        {/* Statistics Cards */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Users"
                value={users.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Active Users"
                value={users.length}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Search Results"
                value={filteredUsers.length}
                prefix={<SearchOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="System Status"
                value="Online"
                prefix={<BankOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Users Table */}
        <Card title="Users Overview" className="shadow-lg">
          <Space direction="vertical" size="middle" className="w-full">
            {/* Search Bar */}
            <div className="mb-4">
              <Search
                placeholder="Search by name or email..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                onSearch={handleSearch}
                style={{ maxWidth: 400 }}
              />
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
            />
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default Dashboard;
