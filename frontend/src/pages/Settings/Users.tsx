import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Switch,
  Tag,
  message,
  Tabs
} from 'antd';
import { EditOutlined, SearchOutlined, DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import type { User, UserCreate } from '../../api';
import { useUsers, useCreateUser, useUpdateUser } from '../../hooks/useApiQueries';
import FormErrorDisplay from '../../components/FormErrorDisplay';
import { useErrorHandler } from '../../hooks/useErrorHandler';

const { TabPane } = Tabs;

const Users: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('active');

  // React Query hooks
  const { data = [], isLoading } = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  // Error handler for form-level errors
  const { errorMessage, showError, clearError } = useErrorHandler();

  // Filter users based on active status and search text
  const filteredUsers = data.filter((user: User) => {
    let matchesActiveStatus = true;
    
    if (activeTab === 'active') {
      matchesActiveStatus = !!user.active;
    } else if (activeTab === 'inactive') {
      matchesActiveStatus = !user.active;
    }
    // For 'all' tab, we don't filter by active status
    
    const matchesSearch = searchText === '' || 
      user.name?.toLowerCase().includes(searchText.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesActiveStatus && matchesSearch;
  });

  const columns = [
    {
      title: 'First Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => {
        const nameParts = name ? name.split(' ') : [''];
        return nameParts[0];
      }
    },
    {
      title: 'Last Name',
      dataIndex: 'name',
      key: 'lastName',
      render: (name: string) => {
        const nameParts = name ? name.split(' ') : ['', ''];
        return nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      }
    },
    {
      title: 'Work Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || '-'
    },
    {
      title: 'Cell Phone',
      dataIndex: 'cellPhone',
      key: 'cellPhone',
      render: (cellPhone: string) => cellPhone || '-'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'No. of Cards',
      dataIndex: 'cardCount',
      key: 'cardCount',
      render: () => 0
    },
    {
      title: 'No. of Proxies',
      dataIndex: 'proxyCount',
      key: 'proxyCount',
      render: () => 0
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
      title: 'Details',
      key: 'actions',
      width: 80,
      render: (_: any, record: User) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
          size="small"
        />
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

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setSearchText('');
  };

  return (
    <div role="main" aria-label="Users Management">
      <div className="mb-6">
        <Card className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div className="w-full md:w-2/3 mb-4 md:mb-0">
              <Input
                placeholder="Search by first name, last name or email"
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearch(e.target.value)}
                value={searchText}
                className="w-full"
                allowClear
              />
            </div>
            <div className="flex items-center">
              <Button
                type="primary"
                icon={<FilterOutlined />}
                className="mr-2"
              >
                Search
              </Button>
            </div>
          </div>
          
          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            <TabPane tab="Active users" key="active" />
            <TabPane tab="Inactive users" key="inactive" />
            <TabPane tab="All" key="all" />
          </Tabs>
          
          <div className="flex justify-between items-center mb-4">
            <Button 
              type="primary"
              onClick={handleAdd}
            >
              New user
            </Button>
            <Button 
              icon={<DownloadOutlined />}
            >
              Download
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={isLoading || createUserMutation.isPending || updateUserMutation.isPending}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              position: ['bottomRight'],
              showTotal: (total) => `${total} items`,
              showLessItems: true,
            }}
            aria-label="Users table"
            aria-describedby="users-table-description"
            size="middle"
          />
        </Card>
      </div>

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

          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter user name' }]}
          >
            <Input placeholder="e.g., John Smith" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Work Phone"
          >
            <Input placeholder="e.g., 9058457558" />
          </Form.Item>

          <Form.Item
            name="cellPhone"
            label="Cell Phone"
          >
            <Input placeholder="e.g., 9058457558" />
          </Form.Item>

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
