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
import type { Supplier, SupplierCreate, User, Currency } from '../../api';
import FormErrorDisplay from '../../components/FormErrorDisplay';
import FieldHelp from '../../components/FieldHelp';
import { useErrorHandler } from '../../hooks/useErrorHandler';

const { Option } = Select;
const { TextArea } = Input;

interface AddSupplierModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (supplier: Supplier) => void;
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
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
    { value: 'JSON', label: 'JSON' },
    { value: 'TXT', label: 'TXT' }
  ];

  // Use our custom error handler hook
  const { errorMessage, showError, clearError } = useErrorHandler();

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
      setUsers(userData);
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

  const handleSubmit = async (values: SupplierCreate) => {
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

      const response = await apiService.createSupplier(transformedValues);
      message.success('Supplier created successfully');
      form.resetFields();
      onSuccess(response.supplier);
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
        title="Add New Supplier"
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
            Create Supplier
          </Button>,
        ]}
        width={800}
        destroyOnClose
      >
        {/* Error Display */}
        <FormErrorDisplay error={errorMessage} onClose={clearError} />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            tax_rate: 0
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <FieldHelp type="name" />
              <Form.Item
                label="Supplier Name"
                name="name"
                rules={[{ required: true, message: 'Please enter supplier name' }]}
              >
                <Input placeholder="e.g., ABC Supplies Inc." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Category"
                name="category"
              >
                <Input placeholder="Enter category" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Sales Representative"
                name="sales_rep_id"
              >
                <Select placeholder="Select sales representative" allowClear>
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <FieldHelp type="phone" />
              <Form.Item
                label="Phone"
                name="phone"
              >
                <Input placeholder="e.g., (555) 123-4567" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <FieldHelp type="email" />
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Please enter a valid email' }]}
              >
                <Input placeholder="e.g., contact@supplier.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Address"
                name="address"
              >
                <TextArea rows={3} placeholder="Enter address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Contact Name"
                name="contact_name"
              >
                <Input placeholder="Enter contact name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Contact Title"
                name="contact_title"
              >
                <Input placeholder="Enter contact title" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Contact Phone"
                name="contact_phone"
              >
                <Input placeholder="Enter contact phone" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Contact Email"
                name="contact_email"
                rules={[{ type: 'email', message: 'Please enter a valid email' }]}
              >
                <Input placeholder="Enter contact email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Currency"
                name="currency_id"
              >
                <Select placeholder="Select currency" allowClear>
                  {currencies.map(currency => (
                    <Option key={currency.id} value={currency.id}>
                      {currency.name} ({currency.code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <FieldHelp type="taxRate" />
              <Form.Item
                label="Tax Rate (%)"
                name="tax_rate"
                rules={[{ required: true, message: 'Please enter tax rate' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={0.01}
                  placeholder="e.g., 13.5"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Bank Name"
                name="bank_name"
              >
                <Input placeholder="Enter bank name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="File Format"
                name="file_format"
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
                label="Account Number"
                name="account_number"
              >
                <Input placeholder="Enter account number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Institution"
                name="institution"
              >
                <Input placeholder="Enter institution" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Transit"
                name="transit"
              >
                <Input placeholder="Enter transit number" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default AddSupplierModal;
