import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Switch, 
  message, 
  Space,
  Typography,
  Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiService } from '../../api';
import type { ChartOfAccount, ChartOfAccountCreate } from '../../api';

const { Title } = Typography;

const ChartOfAccounts: React.FC = () => {
  const [data, setData] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ChartOfAccount | null>(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Number',
      dataIndex: 'number',
      key: 'number',
      width: 150,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Inactive',
      dataIndex: 'inactive',
      key: 'inactive',
      width: 100,
      render: (inactive: boolean) => (
        <Switch checked={inactive} disabled size="small" />
      ),
    },
    {
      title: 'Sub Account',
      dataIndex: 'sub_account',
      key: 'sub_account',
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record: ChartOfAccount) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Are you sure you want to delete this account?"
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const accounts = await apiService.getChartOfAccounts();
      setData(accounts);
    } catch (error) {
      message.error('Failed to fetch chart of accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: ChartOfAccount) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteChartOfAccount(id);
      message.success('Account deleted successfully');
      fetchData(); // Refresh the data
    } catch (error) {
      message.error('Failed to delete account');
    }
  };

  const handleSubmit = async (values: ChartOfAccountCreate) => {
    try {
      if (editingRecord) {
        // Update existing record
        await apiService.updateChartOfAccount(editingRecord.id, values);
        message.success('Account updated successfully');
      } else {
        // Add new record
        await apiService.createChartOfAccount(values);
        message.success('Account added successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchData(); // Refresh the data
    } catch (error) {
      message.error('Failed to save account');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Chart of Accounts</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Account
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      <Modal
        title={editingRecord ? 'Edit Account' : 'Add Account'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="number"
            label="Number"
            rules={[{ required: true, message: 'Please enter account number' }]}
          >
            <Input placeholder="Enter account number" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            name="inactive"
            label="Inactive"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="sub_account"
            label="Sub Account"
          >
            <Input placeholder="Enter sub account" />
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

export default ChartOfAccounts;
