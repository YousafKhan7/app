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
  Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiService } from '../../api';
import type { Department, DepartmentCreate } from '../../api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import ErrorToast from '../../components/ErrorDisplay/ErrorToast';

const { Title } = Typography;

const Departments: React.FC = () => {
  const [data, setData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Department | null>(null);
  const [form] = Form.useForm();

  // Use our custom error handler hook
  const { errorMessage, showError, clearError } = useErrorHandler();

  const columns = [
    {
      title: 'Number',
      dataIndex: 'number',
      key: 'number',
      width: 150,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record: Department) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Are you sure you want to delete this department?"
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
      const departments = await apiService.getDepartments();
      setData(departments);
    } catch (error: any) {
      showError(error.message || 'Failed to fetch departments');
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

  const handleEdit = (record: Department) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    clearError(); // Clear any previous error messages
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteDepartment(id);
      console.log('Department deleted successfully');
      fetchData(); // Refresh the data
    } catch (error: any) {
      showError(error.message || 'Failed to delete department');
    }
  };

  const handleSubmit = async (values: DepartmentCreate) => {
    try {
      if (editingRecord) {
        // Update existing record
        await apiService.updateDepartment(editingRecord.id, values);
        console.log('Department updated successfully');
      } else {
        // Add new record
        await apiService.createDepartment(values);
        console.log('Department added successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchData(); // Refresh the data
    } catch (error: any) {
      showError(error.message || 'Failed to save department');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Departments</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Department
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
        title={editingRecord ? 'Edit Department' : 'Add Department'}
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
            name="number"
            label="Number"
            rules={[{ required: true, message: 'Please enter department number' }]}
          >
            <Input placeholder="Enter department number" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter department name' }]}
          >
            <Input placeholder="Enter department name" />
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

export default Departments;
