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

import FormErrorDisplay from '../../components/FormErrorDisplay';
import FieldHelp from '../../components/FieldHelp';
import { useErrorHandler } from '../../hooks/useErrorHandler';

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

  // Use error handler for form-level errors
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
    if (visible) {
      fetchUsers();
      fetchCurrencies();
      form.resetFields();
    }
  }, [visible, form]);

  const fetchUsers = async () => {
    try {
      const userData = await apiService.getUsers();
      setUsers(userData as User[]);
    } catch (error: any) {
      showError(error);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const currencyData = await apiService.getCurrencies();
      setCurrencies(currencyData);
    } catch (error: any) {
      showError(error);
    }
  };

  const handleSubmit = async (values: CustomerCreate) => {
    setLoading(true);
    try {
      // Transform form values to ensure proper data types and remove undefined values
      const transformedValues: any = {};

      // Always include required fields
      transformedValues.name = values.name;
      transformedValues.tax_rate = values.tax_rate || 0;

      // Only include optional fields if they have values
      if (values.category) transformedValues.category = values.category;
      if (values.sales_rep_id) transformedValues.sales_rep_id = values.sales_rep_id;
      if (values.phone) transformedValues.phone = values.phone;
      if (values.email) transformedValues.email = values.email;
      if (values.address) transformedValues.address = values.address;
      if (values.contact_name) transformedValues.contact_name = values.contact_name;
      if (values.contact_title) transformedValues.contact_title = values.contact_title;
      if (values.contact_phone) transformedValues.contact_phone = values.contact_phone;
      if (values.contact_email) transformedValues.contact_email = values.contact_email;
      if (values.currency_id) transformedValues.currency_id = values.currency_id;
      if (values.bank_name) transformedValues.bank_name = values.bank_name;
      if (values.file_format) transformedValues.file_format = values.file_format;
      if (values.account_number) transformedValues.account_number = values.account_number;
      if (values.institution) transformedValues.institution = values.institution;
      if (values.transit) transformedValues.transit = values.transit;

      const response = await apiService.createCustomer(transformedValues);
      message.success('Customer created successfully');
      form.resetFields();
      onSuccess(response.customer);
    } catch (error: any) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    clearError();
    onCancel();
  };

  return (
    <>
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
        {/* Error Display */}
        <FormErrorDisplay error={errorMessage} onClose={clearError} />

        {/* Basic Information */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          <Row gutter={16}>
            <Col span={12}>
              <FieldHelp type="name" />
              <Form.Item
                name="name"
                label="Company Name"
                rules={[{ required: true, message: 'Please enter company name' }]}
              >
                <Input placeholder="e.g., ABC Manufacturing Inc." />
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
              <FieldHelp type="phone" />
              <Form.Item
                name="phone"
                label="Phone"
              >
                <Input placeholder="e.g., (555) 123-4567" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <FieldHelp type="email" />
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: 'email', message: 'Please enter a valid email' }]}
              >
                <Input placeholder="e.g., contact@company.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <FieldHelp type="address" />
              <Form.Item
                name="address"
                label="Address"
              >
                <TextArea
                  placeholder="e.g., 123 Main St, Toronto, ON M5V 3A8"
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
              <FieldHelp type="name" />
              <Form.Item
                name="contact_name"
                label="Contact Name"
              >
                <Input placeholder="e.g., John Smith" />
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
              <FieldHelp type="phone" />
              <Form.Item
                name="contact_phone"
                label="Contact Phone"
              >
                <Input placeholder="e.g., (555) 987-6543" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <FieldHelp type="email" />
              <Form.Item
                name="contact_email"
                label="Contact Email"
                rules={[{ type: 'email', message: 'Please enter a valid email' }]}
              >
                <Input placeholder="e.g., john@company.com" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Financial Information */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Financial Information</h3>
          <Row gutter={16}>
            <Col span={12}>
              <FieldHelp type="currency" />
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
              <FieldHelp type="taxRate" />
              <Form.Item
                name="tax_rate"
                label="Tax Rate (%)"
                rules={[{ required: true, message: 'Please enter tax rate' }]}
              >
                <InputNumber
                  placeholder="e.g., 13.5"
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
              <FieldHelp type="accountNumber" />
              <Form.Item
                name="account_number"
                label="Account Number"
              >
                <Input placeholder="e.g., ACC12345" />
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
    </>
  );
};

export default AddCustomerModal;
