import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  message,
  InputNumber
} from 'antd';
import { apiService } from '../../api';
import type { Customer, Project } from '../../api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import ErrorToast from '../../components/ErrorDisplay/ErrorToast';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface AddAccountModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialCustomerId?: number;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  initialCustomerId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Use our custom error handler hook
  const { errorMessage, showError, clearError } = useErrorHandler();

  useEffect(() => {
    if (visible) {
      fetchCustomers();
      fetchProjects();
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

  const fetchProjects = async () => {
    try {
      const projectsData = await apiService.getProjects();
      setProjects(projectsData);
    } catch (error: any) {
      showError(error.message || 'Failed to fetch projects');
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const accountData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        reminder_date: values.reminder_date ? values.reminder_date.format('YYYY-MM-DD') : null,
        amount: values.amount || 0,
        outstanding: values.outstanding || 0,
      };
      
      await apiService.createAccount(accountData);
      message.success('Invoice created successfully');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      showError(error.message || 'Failed to create invoice');
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
      title="Add New Invoice"
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
          date: dayjs(),
          amount: 0,
          outstanding: 0,
        }}
      >
        {/* Error Display */}
        <ErrorToast message={errorMessage} onClose={clearError} />

        <Form.Item
          name="invoice_number"
          label="Invoice Number"
          rules={[{ required: true, message: 'Please enter invoice number' }]}
        >
          <Input
            placeholder="Enter invoice number"
            addonAfter={
              <Button
                size="small"
                onClick={async () => {
                  // Generate unique invoice number (e.g., INV-YYYYMMDD-XXXX)
                  const today = dayjs().format('YYYYMMDD');
                  const random = Math.floor(1000 + Math.random() * 9000);
                  const generated = `INV-${today}-${random}`;
                  form.setFieldsValue({ invoice_number: generated });
                }}
              >
                Generate
              </Button>
            }
          />
        </Form.Item>

        <Form.Item
          name="name"
          label="Invoice Name"
          rules={[{ required: true, message: 'Please enter invoice name' }]}
        >
          <Input placeholder="Enter invoice name" />
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
          name="project_id"
          label="Project"
        >
          <Select
            placeholder="Select project"
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {projects.map(project => (
              <Option key={project.id} value={project.id}>
                {project.project_id} - {project.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="date"
          label="Invoice Date"
          rules={[{ required: true, message: 'Please select invoice date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount"
          rules={[{ required: true, message: 'Please enter amount' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={0.01}
            precision={2}
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value: string | undefined): number => {
              const parsed = value ? parseFloat(value.replace(/\$\s?|,/g, '')) : 0;
              return isNaN(parsed) ? 0 : parsed;
            }}
            placeholder="Enter amount"
          />
        </Form.Item>

        <Form.Item
          name="outstanding"
          label="Outstanding Amount"
          rules={[{ required: true, message: 'Please enter outstanding amount' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={0.01}
            precision={2}
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value: string | undefined): number => {
              const parsed = value ? parseFloat(value.replace(/\$\s?|,/g, '')) : 0;
              return isNaN(parsed) ? 0 : parsed;
            }}
            placeholder="Enter outstanding amount"
          />
        </Form.Item>

        <Form.Item
          name="reminder_date"
          label="Reminder Date"
        >
          <DatePicker style={{ width: '100%' }} placeholder="Select reminder date" />
        </Form.Item>

        <Form.Item
          name="comments"
          label="Comments"
        >
          <TextArea
            rows={3}
            placeholder="Enter any comments or notes"
          />
        </Form.Item>

        <Form.Item className="mb-0 text-right">
          <Space>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add Invoice
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddAccountModal;
