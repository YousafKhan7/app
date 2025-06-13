import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  message
} from 'antd';
import { apiService } from '../../api';
import type { Customer, User } from '../../api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import ErrorToast from '../../components/ErrorDisplay/ErrorToast';
import dayjs from 'dayjs';

const { Option } = Select;

interface AddProjectModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialCustomerId?: number;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  initialCustomerId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [engineers, setEngineers] = useState<User[]>([]);
  const [salesmen, setSalesmen] = useState<User[]>([]);

  // Use our custom error handler hook
  const { errorMessage, showError, clearError } = useErrorHandler();

  const statusOptions = [
    { value: 'Planning', label: 'Planning' },
    { value: 'Active', label: 'Active' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    if (visible) {
      fetchCustomers();
      fetchEngineers();
      fetchSalesmen();
      clearError();
      
      // Set initial customer if provided
      if (initialCustomerId) {
        form.setFieldsValue({
          customer_id: initialCustomerId
        });
      }
    }
  }, [visible, initialCustomerId]);

  const fetchCustomers = async () => {
    try {
      const customersData = await apiService.getCustomers();
      setCustomers(customersData);
    } catch (error: any) {
      showError(error.message || 'Failed to fetch customers');
    }
  };

  const fetchEngineers = async () => {
    try {
      const engineersData = await apiService.getUsers();
      setEngineers(engineersData as User[]);
    } catch (error: any) {
      showError(error.message || 'Failed to fetch engineers');
    }
  };

  const fetchSalesmen = async () => {
    try {
      const salesmenData = await apiService.getUsers();
      setSalesmen(salesmenData as User[]);
    } catch (error: any) {
      showError(error.message || 'Failed to fetch salesmen');
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const projectData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      };
      
      await apiService.createProject(projectData);
      message.success('Project created successfully');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      showError(error.message || 'Failed to create project');
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
    <Modal
      title="Add New Project"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: 'Active',
          date: dayjs(),
        }}
      >
        {/* Error Display */}
        <ErrorToast message={errorMessage} onClose={clearError} />

        <Form.Item
          name="project_id"
          label="Project ID"
          rules={[{ required: true, message: 'Please enter project ID' }]}
        >
          <Input
            placeholder="Enter project ID"
            addonAfter={
              <Button
                size="small"
                onClick={() => {
                  // Generate unique project ID (e.g., PRJ-YYYYMMDD-XXXX)
                  const today = dayjs().format('YYYYMMDD');
                  const random = Math.floor(1000 + Math.random() * 9000);
                  const generated = `PRJ-${today}-${random}`;
                  form.setFieldsValue({ project_id: generated });
                }}
              >
                Generate
              </Button>
            }
          />
        </Form.Item>

        <Form.Item
          name="name"
          label="Project Name"
          rules={[{ required: true, message: 'Please enter project name' }]}
        >
          <Input placeholder="Enter project name" />
        </Form.Item>

        <Form.Item
          name="customer_id"
          label="Customer"
        >
          <Select
            placeholder="Select customer"
            allowClear
            showSearch
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

        <Form.Item
          name="engineer_id"
          label="Engineer"
        >
          <Select
            placeholder="Select engineer"
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {engineers.map(engineer => (
              <Option key={engineer.id} value={engineer.id}>
                {engineer.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="end_user"
          label="End User"
        >
          <Input placeholder="Enter end user" />
        </Form.Item>

        <Form.Item
          name="date"
          label="Date"
          rules={[{ required: true, message: 'Please select date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="salesman_id"
          label="Salesman"
        >
          <Select
            placeholder="Select salesman"
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {salesmen.map(salesman => (
              <Option key={salesman.id} value={salesman.id}>
                {salesman.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

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

        <Form.Item className="mb-0 text-right">
          <Space>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add Project
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddProjectModal;
