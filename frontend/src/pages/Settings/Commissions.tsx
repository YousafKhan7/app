import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Typography,
  Popconfirm,
  InputNumber,
  Checkbox
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PercentageOutlined } from '@ant-design/icons';
import { apiService } from '../../api';
import type { Commission, CommissionCreate } from '../../api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import ErrorToast from '../../components/ErrorDisplay/ErrorToast';

const { Title } = Typography;

const Commissions: React.FC = () => {
  const [data, setData] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Commission | null>(null);
  const [form] = Form.useForm();

  // Use our custom error handler hook
  const { errorMessage, showError, clearError } = useErrorHandler();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 120,
      render: (percentage: number) => `${percentage}%`,
    },
    {
      title: 'GP',
      dataIndex: 'gp',
      key: 'gp',
      width: 80,
      render: (gp: boolean) => (
        <Checkbox checked={gp} disabled />
      ),
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      key: 'sales',
      width: 80,
      render: (sales: boolean) => (
        <Checkbox checked={sales} disabled />
      ),
    },
    {
      title: 'Commercial Billing',
      dataIndex: 'commercial_billing',
      key: 'commercial_billing',
      width: 150,
      render: (commercial_billing: boolean) => (
        <Checkbox checked={commercial_billing} disabled />
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'payment',
      key: 'payment',
      width: 100,
      render: (payment: boolean) => (
        <Checkbox checked={payment} disabled />
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Commission) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Are you sure you want to delete this commission?"
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
      const commissions = await apiService.getCommissions();
      setData(commissions);
    } catch (error: any) {
      showError(error.message || 'Failed to fetch commissions');
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
    clearError(); // Clear any previous error messages
    setModalVisible(true);
  };

  const handleEdit = (record: Commission) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    clearError(); // Clear any previous error messages
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteCommission(id);
      console.log('Commission deleted successfully');
      fetchData(); // Refresh the data
    } catch (error: any) {
      showError(error.message || 'Failed to delete commission');
    }
  };

  const handleSubmit = async (values: CommissionCreate) => {
    try {
      if (editingRecord) {
        // Update existing commission
        await apiService.updateCommission(editingRecord.id, values);
        console.log('Commission updated successfully');
      } else {
        // Add new commission
        await apiService.createCommission(values);
        console.log('Commission added successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchData(); // Refresh the data
    } catch (error: any) {
      showError(error.message || 'Failed to save commission');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Commissions</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Commission
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
        title={editingRecord ? 'Edit Commission' : 'Add Commission'}
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
          {/* Error Display at the top of the form */}
          <ErrorToast message={errorMessage} onClose={clearError} />

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please enter commission type' }]}
          >
            <Input placeholder="Enter commission type (e.g., Level A)" />
          </Form.Item>

          <Form.Item
            name="percentage"
            label="Percentage"
            rules={[{ required: true, message: 'Please enter percentage' }]}
          >
            <InputNumber 
              placeholder="Enter percentage" 
              min={0}
              max={100}
              step={0.01}
              style={{ width: '100%' }}
              addonAfter={<PercentageOutlined />}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="gp"
              valuePropName="checked"
            >
              <Checkbox>GP</Checkbox>
            </Form.Item>

            <Form.Item
              name="sales"
              valuePropName="checked"
            >
              <Checkbox>Sales</Checkbox>
            </Form.Item>

            <Form.Item
              name="commercial_billing"
              valuePropName="checked"
            >
              <Checkbox>Commercial Billing</Checkbox>
            </Form.Item>

            <Form.Item
              name="payment"
              valuePropName="checked"
            >
              <Checkbox>Payment</Checkbox>
            </Form.Item>
          </div>

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

export default Commissions;
