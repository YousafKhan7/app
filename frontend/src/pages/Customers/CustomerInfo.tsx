import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Card,
  Select,
  InputNumber,
  Space,
  Divider,
  Typography,
  Popconfirm,
  message
} from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiService } from '../../api';
import type { Customer, CustomerCreate, User, Currency } from '../../api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import FormErrorDisplay from '../../components/FormErrorDisplay';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface CustomerInfoProps {
  customer: Customer;
  onUpdate: () => void;
  onDelete?: () => void;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ customer, onUpdate, onDelete }) => {
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  // Use our custom error handler hook
  const { errorMessage, showError, clearError } = useErrorHandler();

  // File format options
  const fileFormatOptions = [
    { value: 'CSV', label: 'CSV' },
    { value: 'Excel', label: 'Excel' },
    { value: 'PDF', label: 'PDF' },
    { value: 'XML', label: 'XML' },
    { value: 'JSON', label: 'JSON' }
  ];

  useEffect(() => {
    fetchDropdownData();
    // Set form values when customer changes
    form.setFieldsValue({
      ...customer,
      tax_rate: customer.tax_rate || 0
    });
  }, [customer, form]);

  const fetchDropdownData = async () => {
    try {
      const [usersData, currenciesData] = await Promise.all([
        apiService.getUsers(),
        apiService.getCurrencies()
      ]);
      setUsers(usersData as any);
      setCurrencies(currenciesData);
    } catch (error: any) {
      showError(error);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    clearError();
  };

  const handleCancel = () => {
    setEditing(false);
    form.setFieldsValue({
      ...customer,
      tax_rate: customer.tax_rate || 0
    });
    clearError();
  };

  const handleSave = async (values: CustomerCreate) => {
    setLoading(true);
    try {
      // Transform form values to ensure proper data types
      const transformedValues = {
        ...values,
        sales_rep_id: values.sales_rep_id || null,
        currency_id: values.currency_id || null,
        tax_rate: values.tax_rate || 0
      };

      await apiService.updateCustomer(customer.id, transformedValues);
      setEditing(false);
      onUpdate(); // Refresh customer data
      message.success('Customer updated successfully');
    } catch (error: any) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await apiService.deleteCustomer(customer.id);
      message.success('Customer deleted successfully');
      if (onDelete) {
        onDelete();
      }
    } catch (error: any) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={4}>Customer Information</Title>
        {!editing ? (
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Popconfirm
              title="Delete Customer"
              description="Are you sure you want to delete this customer? This action cannot be undone."
              onConfirm={handleDelete}
              okText="Yes, Delete"
              cancelText="Cancel"
              okType="danger"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={loading}
              >
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ) : (
          <Space>
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={() => form.submit()}
            >
              Save
            </Button>
          </Space>
        )}
      </div>

      {!editing ? (
        // Read-only view
        <div>
          {/* Basic Information */}
          <Card title="Basic Information" className="mb-6">
            <Row gutter={16}>
              <Col span={12}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <div className="text-base">{customer.name || '-'}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div className="text-base">{customer.category || '-'}</div>
                </div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales Representative</label>
                  <div className="text-base">{customer.sales_rep_name || '-'}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="text-base">{customer.phone || '-'}</div>
                </div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="text-base">{customer.email || '-'}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="text-base whitespace-pre-wrap">{customer.address || '-'}</div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Contact Information */}
          <Card title="Contact Information" className="mb-6">
            <Row gutter={16}>
              <Col span={12}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <div className="text-base">{customer.contact_name || '-'}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Title</label>
                  <div className="text-base">{customer.contact_title || '-'}</div>
                </div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <div className="text-base">{customer.contact_phone || '-'}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <div className="text-base">{customer.contact_email || '-'}</div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Financial Information */}
          <Card title="Financial Information" className="mb-6">
            <Row gutter={16}>
              <Col span={12}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <div className="text-base">{customer.currency_name || '-'}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                  <div className="text-base">{customer.tax_rate ? `${customer.tax_rate}%` : '-'}</div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Banking Information */}
          <Card title="Banking Information">
            <Row gutter={16}>
              <Col span={12}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <div className="text-base">{customer.bank_name || '-'}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Format</label>
                  <div className="text-base">{customer.file_format || '-'}</div>
                </div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <div className="text-base">{customer.account_number || '-'}</div>
                </div>
              </Col>
              <Col span={8}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                  <div className="text-base">{customer.institution || '-'}</div>
                </div>
              </Col>
              <Col span={8}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transit</label>
                  <div className="text-base">{customer.transit || '-'}</div>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      ) : (
        // Edit form
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          {/* Error Display */}
          <FormErrorDisplay error={errorMessage} onClose={clearError} />
        {/* Basic Information */}
        <Card title="Basic Information" className="mb-6">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Company Name"
                rules={[{ required: true, message: 'Please enter company name' }]}
              >
                <Input placeholder="Enter company name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
              >
                <Input placeholder="Enter category (e.g., Manufacturing, Technology)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sales_rep_id"
                label="Sales Representative"
              >
                <Select placeholder="Select sales representative" allowClear>
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>{user.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: 'email', message: 'Please enter a valid email' }]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="address"
                label="Address"
              >
                <TextArea 
                  placeholder="Enter full address" 
                  rows={3}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Contact Information */}
        <Card title="Contact Information" className="mb-6">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contact_name"
                label="Contact Name"
              >
                <Input placeholder="Enter contact person name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contact_title"
                label="Contact Title"
              >
                <Input placeholder="Enter contact person title" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contact_phone"
                label="Contact Phone"
              >
                <Input placeholder="Enter contact phone number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contact_email"
                label="Contact Email"
                rules={[{ type: 'email', message: 'Please enter a valid email' }]}
              >
                <Input placeholder="Enter contact email address" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Financial Information */}
        <Card title="Financial Information" className="mb-6">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="currency_id"
                label="Currency"
              >
                <Select placeholder="Select currency" allowClear>
                  {currencies.map(currency => (
                    <Option key={currency.id} value={currency.id}>
                      {currency.currency} (Rate: {currency.rate})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tax_rate"
                label="Tax Rate (%)"
              >
                <InputNumber 
                  placeholder="Enter tax rate" 
                  min={0}
                  max={100}
                  step={0.01}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Banking Information */}
        <Card title="Banking Information">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="bank_name"
                label="Bank Name"
              >
                <Input placeholder="Enter bank name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="file_format"
                label="File Format"
              >
                <Select placeholder="Select file format" allowClear>
                  {fileFormatOptions.map(option => (
                    <Option key={option.value} value={option.value}>{option.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="account_number"
                label="Account Number"
              >
                <Input placeholder="Enter account number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="institution"
                label="Institution"
              >
                <Input placeholder="Enter institution" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="transit"
                label="Transit"
              >
                <Input placeholder="Enter transit number" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
        </Form>
      )}
    </div>
  );
};

export default CustomerInfo;
