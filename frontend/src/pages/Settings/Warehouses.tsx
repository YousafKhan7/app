import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber,
  message, 
  Space,
  Typography,
  Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiService } from '../../api';
import type { Warehouse, WarehouseCreate } from '../../api';

const { Title } = Typography;

const Warehouses: React.FC = () => {
  const [data, setData] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Warehouse | null>(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Warehouse Name',
      dataIndex: 'warehouse_name',
      key: 'warehouse_name',
    },
    {
      title: 'Number',
      dataIndex: 'number',
      key: 'number',
      width: 150,
    },
    {
      title: 'Markup (%)',
      dataIndex: 'markup',
      key: 'markup',
      width: 120,
      render: (markup: number) => `${markup.toFixed(2)}%`,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record: Warehouse) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Are you sure you want to delete this warehouse?"
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
      const warehouses = await apiService.getWarehouses();
      setData(warehouses);
    } catch (error) {
      message.error('Failed to fetch warehouses');
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
    setModalVisible(true);
  };

  const handleEdit = (record: Warehouse) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteWarehouse(id);
      message.success('Warehouse deleted successfully');
      fetchData(); // Refresh the data
    } catch (error) {
      message.error('Failed to delete warehouse');
    }
  };

  const handleSubmit = async (values: WarehouseCreate) => {
    try {
      if (editingRecord) {
        // Update existing record
        await apiService.updateWarehouse(editingRecord.id, values);
        message.success('Warehouse updated successfully');
      } else {
        // Add new record
        await apiService.createWarehouse(values);
        message.success('Warehouse added successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchData(); // Refresh the data
    } catch (error) {
      message.error('Failed to save warehouse');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Inventory Management - Warehouses</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Warehouse
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
        title={editingRecord ? 'Edit Warehouse' : 'Add Warehouse'}
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
          <Form.Item
            name="warehouse_name"
            label="Warehouse Name"
            rules={[{ required: true, message: 'Please enter warehouse name' }]}
          >
            <Input placeholder="Enter warehouse name" />
          </Form.Item>

          <Form.Item
            name="number"
            label="Number"
            rules={[{ required: true, message: 'Please enter warehouse number' }]}
          >
            <Input placeholder="Enter warehouse number" />
          </Form.Item>

          <Form.Item
            name="markup"
            label="Markup (%)"
            rules={[{ required: true, message: 'Please enter markup percentage' }]}
          >
            <InputNumber 
              placeholder="Enter markup percentage" 
              min={0}
              max={100}
              step={0.01}
              precision={2}
              style={{ width: '100%' }}
              addonAfter="%"
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

export default Warehouses;
