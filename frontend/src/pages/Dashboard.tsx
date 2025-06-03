import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, Space, Form, Input, message, Table, Tag } from 'antd';
import { apiService } from '../api';
import type { User, UserCreate } from '../api';

const { Title, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await apiService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (values: UserCreate) => {
    try {
      setLoading(true);
      await apiService.createUser(values);
      message.success('User created successfully!');
      form.resetFields();
      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error('Failed to create user:', error);
      message.error('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <Title level={2} className="mb-8">Dashboard</Title>

      <Space direction="vertical" size="large" className="w-full">
        {/* User Management */}
        <Card title="User Management" className="shadow-lg">
          <Space direction="vertical" size="middle" className="w-full">
            <Form
              form={form}
              layout="inline"
              onFinish={handleCreateUser}
              className="mb-4"
            >
              <Form.Item
                name="name"
                rules={[{ required: true, message: 'Please enter name' }]}
              >
                <Input placeholder="Name" />
              </Form.Item>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Add User
                </Button>
              </Form.Item>
            </Form>

            <Table
              columns={columns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default Dashboard;
