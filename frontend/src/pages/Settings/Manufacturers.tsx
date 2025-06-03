import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber,
  Upload,
  message, 
  Space,
  Typography,
  Popconfirm,
  Image
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { apiService } from '../../api';
import type { Manufacturer, ManufacturerCreate } from '../../api';

const { Title } = Typography;

const Manufacturers: React.FC = () => {
  const [data, setData] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Manufacturer | null>(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'File (Logo)',
      dataIndex: 'logo_file',
      key: 'logo_file',
      width: 150,
      render: (logo_file: string) => (
        logo_file ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
              <span className="text-blue-600 text-xs font-medium">IMG</span>
            </div>
            <span className="text-sm text-gray-600 truncate max-w-20" title={logo_file}>
              {logo_file}
            </span>
          </div>
        ) : (
          <span className="text-gray-400">No logo</span>
        )
      ),
    },
    {
      title: 'Sorting',
      dataIndex: 'sorting',
      key: 'sorting',
      width: 100,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record: Manufacturer) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Are you sure you want to delete this manufacturer?"
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
      const manufacturers = await apiService.getManufacturers();
      setData(manufacturers);
    } catch (error) {
      message.error('Failed to fetch manufacturers');
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

  const handleEdit = (record: Manufacturer) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteManufacturer(id);
      message.success('Manufacturer deleted successfully');
      fetchData(); // Refresh the data
    } catch (error) {
      message.error('Failed to delete manufacturer');
    }
  };

  const handleSubmit = async (values: ManufacturerCreate) => {
    try {
      if (editingRecord) {
        // Update existing record
        await apiService.updateManufacturer(editingRecord.id, values);
        message.success('Manufacturer updated successfully');
      } else {
        // Add new record
        await apiService.createManufacturer(values);
        message.success('Manufacturer added successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchData(); // Refresh the data
    } catch (error) {
      message.error('Failed to save manufacturer');
    }
  };

  const uploadProps = {
    name: 'file',
    action: '/api/upload', // TODO: Implement upload endpoint
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info: any) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Manufacturers</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Manufacturer
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
        title={editingRecord ? 'Edit Manufacturer' : 'Add Manufacturer'}
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
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter manufacturer name' }]}
          >
            <Input placeholder="Enter manufacturer name" />
          </Form.Item>

          <Form.Item
            name="logo_file"
            label="File (Logo)"
          >
            <Input placeholder="Enter logo filename (e.g., logo.png)" />
          </Form.Item>

          <Form.Item
            name="sorting"
            label="Sorting"
            rules={[{ required: true, message: 'Please enter sorting order' }]}
          >
            <InputNumber 
              placeholder="Enter sorting order" 
              min={0}
              style={{ width: '100%' }}
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

export default Manufacturers;
