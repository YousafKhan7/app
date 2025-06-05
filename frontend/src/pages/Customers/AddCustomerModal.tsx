import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  InputNumber,
  message
} from 'antd';
import { apiService } from '../../api';
import type { Customer, CustomerCreate, User, Currency } from '../../api';

const { Option } = Select;
const { TextArea } = Input;

interface AddCustomerModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (customer: Customer) => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  // File format options
  const fileFormatOptions = [
    { value: 'CSV', label: 'CSV' },
    { value: 'Excel', label: 'Excel' },
    { value: 'PDF', label: 'PDF' },
    { value: 'XML', label: 'XML' },
    { value: 'JSON', label: 'JSON' }
  ];

  useEffect(() => {
    if (visible) {
      fetchDropdownData();
      form.resetFields();
    }
  }, [visible, form]);

  const fetchDropdownData = async () => {
    try {
      const [usersData, currenciesData] = await Promise.all([
        apiService.getUsers(),
        apiService.getCurrencies()
      ]);
      setUsers(usersData);
      setCurrencies(currenciesData);
    } catch (error: any) {
      message.error('Failed to fetch dropdown data');
    }
  };

  const handleSubmit = async (values: CustomerCreate) => {
    setLoading(true);
    try {
      const response = await apiService.createCustomer(values);
      message.success('Customer created successfully');
      
      // Fetch the created customer to get the full data with joined fields
      const customers = await apiService.getCustomers();
      const newCustomer = customers.find(c => c.id === response.customer_id);
      
      if (newCustomer) {
        onSuccess(newCustomer);
      } else {
        onCancel();
      }
      
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Add New Customer"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Create Customer
        </Button>,
      ]}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ tax_rate: 0 }}
      >
        {/* Basic Information */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
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
        </div>

        {/* Contact Information */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Contact Information</h3>
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
        </div>

        {/* Financial Information */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Financial Information</h3>
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
        </div>

        {/* Banking Information */}
        <div>
          <h3 className="text-lg font-medium mb-4">Banking Information</h3>
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
        </div>
      </Form>
    </Modal>
  );
};

export default AddCustomerModal;
