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
  Popconfirm,
  Select
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiService } from '../../api';
import type { ChartOfAccount, ChartOfAccountCreate, Currency, AccountType, AccountTypeCreate } from '../../api';

const { Title } = Typography;

const ChartOfAccounts: React.FC = () => {
  const [data, setData] = useState<ChartOfAccount[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ChartOfAccount | null>(null);
  const [form] = Form.useForm();
  const [newTypeName, setNewTypeName] = useState('');

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
      title: 'Type',
      dataIndex: 'type_id',
      key: 'type_id',
      width: 120,
      render: (type_id: number) => {
        const accountType = accountTypes.find(t => t.id === type_id);
        return accountType ? accountType.name : '-';
      },
    },
    {
      title: 'Currency',
      dataIndex: 'currency_id',
      key: 'currency_id',
      width: 120,
      render: (currency_id: number) => {
        const currency = currencies.find(c => c.id === currency_id);
        return currency ? currency.currency : '-';
      },
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

  const fetchCurrencies = async () => {
    try {
      const currenciesData = await apiService.getCurrencies();
      setCurrencies(currenciesData);
    } catch (error) {
      message.error('Failed to fetch currencies');
    }
  };

  const fetchAccountTypes = async () => {
    try {
      const accountTypesData = await apiService.getAccountTypes();
      setAccountTypes(accountTypesData);
    } catch (error) {
      message.error('Failed to fetch account types');
    }
  };

  const handleAddNewType = async () => {
    if (!newTypeName.trim()) {
      message.error('Please enter a type name');
      return;
    }

    try {
      await apiService.createAccountType({ name: newTypeName.trim() });
      message.success('Account type added successfully');
      setNewTypeName('');
      fetchAccountTypes(); // Refresh the types list
    } catch (error) {
      message.error('Failed to add account type');
    }
  };

  useEffect(() => {
    fetchData();
    fetchCurrencies();
    fetchAccountTypes();
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
            name="type_id"
            label="Type"
            rules={[{ required: true, message: 'Please select account type' }]}
          >
            <Select
              placeholder="Select account type"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div style={{ padding: '8px 0' }}>
                    <div style={{ display: 'flex', flexWrap: 'nowrap', padding: '0 8px' }}>
                      <Input
                        style={{ flex: 'auto' }}
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                        placeholder="Enter new type name"
                        onPressEnter={handleAddNewType}
                      />
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={handleAddNewType}
                        style={{ marginLeft: 8 }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </>
              )}
            >
              {accountTypes.map(type => (
                <Select.Option key={type.id} value={type.id}>
                  {type.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="currency_id"
            label="Currency"
          >
            <Select placeholder="Select currency" allowClear>
              {currencies.map(currency => (
                <Select.Option key={currency.id} value={currency.id}>
                  {currency.currency}
                </Select.Option>
              ))}
            </Select>
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
