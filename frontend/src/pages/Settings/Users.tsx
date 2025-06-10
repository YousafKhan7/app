import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Typography,
  Popconfirm,
  Switch,
  Tag,
  message
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { User, UserCreate } from '../../api';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../hooks/useApiQueries';
import FormErrorDisplay from '../../components/FormErrorDisplay';
import FieldHelp from '../../components/FieldHelp';
import { useErrorHandler } from '../../hooks/useErrorHandler';

const { Title } = Typography;

const Users: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<User | null>(null);
  const [form] = Form.useForm();

  // React Query hooks
  const { data = [], isLoading } = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // Error handler for form-level errors
  const { errorMessage, showError, clearError } = useErrorHandler();

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
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    clearError(); // Clear any previous errors
    setModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    clearError(); // Clear any previous errors
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUserMutation.mutateAsync(id);
      message.success('User deleted successfully');
    } catch (error: any) {
      showError(error.message || 'Failed to delete user');
    }
  };

  const handleSubmit = async (values: UserCreate) => {
    try {
      if (editingRecord) {
        // Update existing user
        await updateUserMutation.mutateAsync({ id: editingRecord.id, user: values });
        message.success('User updated successfully');
      } else {
        // Add new user
        await createUserMutation.mutateAsync(values);
        message.success('User created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      clearError(); // Clear errors on success
    } catch (error: any) {
      showError(error.message || 'Failed to save user');
    }
  };

  return (
    <div role="main" aria-label="Users Management">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} id="users-heading">Users</Title>
        <Button
          type="primary"
          icon={<PlusOutlined aria-hidden="true" />}
          onClick={handleAdd}
          aria-label="Add new user"
        >
          Add User
        </Button>
      </div>

      <Card role="region" aria-labelledby="users-heading">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={isLoading || createUserMutation.isPending || updateUserMutation.isPending || deleteUserMutation.isPending}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          aria-label="Users table"
          aria-describedby="users-table-description"
        />
        <div id="users-table-description" className="sr-only">
          Table containing user information with options to edit or delete each user
        </div>
      </Card>

      <Modal
        title={editingRecord ? 'Edit User' : 'Add User'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
        aria-labelledby="user-modal-title"
        aria-describedby="user-modal-description"
      >
        <div id="user-modal-description" className="sr-only">
          {editingRecord ? 'Edit existing user information' : 'Add new user to the system'}
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {/* Error Display */}
          <FormErrorDisplay error={errorMessage} onClose={clearError} />

          <FieldHelp type="name" />
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter user name' }]}
          >
            <Input placeholder="e.g., John Smith" />
          </Form.Item>

          <FieldHelp type="email" />
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <Input placeholder="e.g., john@company.com" />
          </Form.Item>

          <Form.Item
            name="active"
            label="Status"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingRecord ? 'Update' : 'Add'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
