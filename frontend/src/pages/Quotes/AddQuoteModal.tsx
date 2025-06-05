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
  DatePicker,
  message
} from 'antd';
import { apiService } from '../../api';
import type { Quote, Customer, User } from '../../api';
import dayjs from 'dayjs';

const { Option } = Select;

interface AddQuoteModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddQuoteModal: React.FC<AddQuoteModalProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Completed', label: 'Completed' }
  ];

  useEffect(() => {
    if (visible) {
      fetchDropdownData();
      form.resetFields();
      // Set default values
      form.setFieldsValue({
        date: dayjs(),
        sell_price: 0,
        status: 'Draft'
      });
    }
  }, [visible, form]);

  const fetchDropdownData = async () => {
    try {
      const [customersData, usersData] = await Promise.all([
        apiService.getCustomers(),
        apiService.getUsers()
      ]);
      setCustomers(customersData);
      setUsers(usersData);
    } catch (error: any) {
      message.error('Failed to fetch dropdown data');
    }
  };

  const generateJobId = () => {
    const year = dayjs().format('YYYY');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `Q${year}-${randomNum}`;
  };

  const handleGenerateJobId = () => {
    const jobId = generateJobId();
    form.setFieldValue('job_id', jobId);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const quoteData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        sell_price: values.sell_price || 0
      };

      await apiService.createQuote(quoteData);
      message.success('Quote created successfully');
      onSuccess();
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || 'Failed to create quote');
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
      title="Add New Quote"
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
          Create Quote
        </Button>,
      ]}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* Basic Information */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="job_id"
                label="Job ID"
                rules={[{ required: true, message: 'Please enter job ID' }]}
              >
                <Input 
                  placeholder="Enter job ID"
                  addonAfter={
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={handleGenerateJobId}
                      style={{ padding: '0 8px' }}
                    >
                      Generate
                    </Button>
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Quote Name"
                rules={[{ required: true, message: 'Please enter quote name' }]}
              >
                <Input placeholder="Enter quote name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customer_id"
                label="Customer"
                rules={[{ required: true, message: 'Please select a customer' }]}
              >
                <Select 
                  placeholder="Select customer"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {customers.map(customer => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Assignment Information */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Assignment</h3>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="engineer_id"
                label="Engineer"
              >
                <Select 
                  placeholder="Select engineer"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="salesman_id"
                label="Salesman"
              >
                <Select 
                  placeholder="Select salesman"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Financial Information */}
        <div>
          <h3 className="text-lg font-medium mb-4">Financial Information</h3>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sell_price"
                label="Sell Price ($)"
                rules={[{ required: true, message: 'Please enter sell price' }]}
              >
                <InputNumber
                  placeholder="Enter sell price"
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  {statusOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Form>
    </Modal>
  );
};

export default AddQuoteModal;
