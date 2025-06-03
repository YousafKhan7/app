import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Space,
  Typography,
  Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiService } from '../../api';
import type { Currency } from '../../api';
import dayjs from 'dayjs';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import ErrorToast from '../../components/ErrorDisplay/ErrorToast';

const { Title } = Typography;

const Currencies: React.FC = () => {
  const [data, setData] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Currency | null>(null);
  const [form] = Form.useForm();

  // Use our custom error handler hook
  const { errorMessage, showError, clearError } = useErrorHandler();

  const columns = [
    {
      title: 'Currency',
      dataIndex: 'currency',
      key: 'currency',
      width: 150,
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      render: (rate: number) => rate.toFixed(4),
    },
    {
      title: 'Effective Date',
      dataIndex: 'effective_date',
      key: 'effective_date',
      width: 150,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Currency) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Are you sure you want to delete this currency?"
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
      const currencies = await apiService.getCurrencies();
      setData(currencies);
    } catch (error: any) {
      showError(error.message || 'Failed to fetch currencies');
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

  const handleEdit = (record: Currency) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      effective_date: record.effective_date ? dayjs(record.effective_date) : null,
    });
    clearError(); // Clear any previous error messages
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteCurrency(id);
      console.log('Currency deleted successfully');
      fetchData(); // Refresh the data
    } catch (error: any) {
      showError(error.message || 'Failed to delete currency');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        effective_date: values.effective_date ? values.effective_date.format('YYYY-MM-DD') : null,
      };

      if (editingRecord) {
        // Update existing record
        await apiService.updateCurrency(editingRecord.id, submitData);
        console.log('Currency updated successfully');
      } else {
        // Add new record
        await apiService.createCurrency(submitData);
        console.log('Currency added successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchData(); // Refresh the data
    } catch (error: any) {
      showError(error.message || 'Failed to save currency');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Currencies</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Currency
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
        title={editingRecord ? 'Edit Currency' : 'Add Currency'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {/* Error Display at the top of the form */}
          <ErrorToast message={errorMessage} onClose={clearError} />

          <Form.Item
            name="currency"
            label="Currency"
            rules={[{ required: true, message: 'Please enter currency code' }]}
          >
            <Input placeholder="Enter currency code (e.g., USD)" maxLength={10} />
          </Form.Item>

          <Form.Item
            name="rate"
            label="Rate"
            rules={[{ required: true, message: 'Please enter exchange rate' }]}
          >
            <InputNumber
              placeholder="Enter exchange rate"
              min={0}
              step={0.0001}
              precision={4}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="effective_date"
            label="Effective Date"
            rules={[{ required: true, message: 'Please select effective date' }]}
          >
            <DatePicker
              placeholder="Select effective date"
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
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

export default Currencies;
