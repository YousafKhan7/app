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
import type { Project, Customer, User } from '../../api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import ErrorToast from '../../components/ErrorDisplay/ErrorToast';
import dayjs from 'dayjs';

const { Option } = Select;

interface EditProjectModalProps {
  visible: boolean;
  project: Project;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  visible,
  project,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);

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
    if (visible && project) {
      fetchCustomers();
      fetchUsers();
      clearError();
      
      // Set form values
      form.setFieldsValue({
        project_id: project.project_id,
        name: project.name,
        customer_id: project.customer_id,
        engineer_id: project.engineer_id,
        end_user: project.end_user,
        date: dayjs(project.date),
        salesman_id: project.salesman_id,
        status: project.status,
      });
    }
  }, [visible, project, form]);

  const fetchCustomers = async () => {
    try {
      const customersData = await apiService.getCustomers();
      setCustomers(customersData);
    } catch (error: any) {
      showError(error.message || 'Failed to fetch customers');
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await apiService.getUsers();
      setUsers(usersData as User[]);
    } catch (error: any) {
      showError(error.message || 'Failed to fetch users');
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const projectData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      };
      
      await apiService.updateProject(project.id, projectData);
      message.success('Project updated successfully');
      onSuccess();
    } catch (error: any) {
      showError(error.message || 'Failed to update project');
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
      title="Edit Project"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* Error Display */}
        <ErrorToast message={errorMessage} onClose={clearError} />

        <Form.Item
          name="project_id"
          label="Project ID"
          rules={[{ required: true, message: 'Please enter project ID' }]}
        >
          <Input placeholder="Enter project ID" />
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
            {users.map(user => (
              <Option key={user.id} value={user.id}>
                {user.name}
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
            {users.map(user => (
              <Option key={user.id} value={user.id}>
                {user.name}
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
              Update Project
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditProjectModal;
