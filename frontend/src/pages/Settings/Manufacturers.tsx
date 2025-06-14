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
  Space,
  Typography,
  Popconfirm,
  Image
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { apiService } from '../../api';
import type { Manufacturer, ManufacturerCreate } from '../../api';
import type { UploadFile } from 'antd/es/upload/interface';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import ErrorToast from '../../components/ErrorDisplay/ErrorToast';

const { Title } = Typography;

const Manufacturers: React.FC = () => {
  const [data, setData] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Manufacturer | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Use our custom error handler hook
  const { errorMessage, showError, clearError } = useErrorHandler();

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Logo',
      dataIndex: 'logo_file',
      key: 'logo_file',
      width: 120,
      render: (logo_file: string) => (
        logo_file ? (
          <div className="flex items-center justify-center">
            <Image
              width={40}
              height={40}
              src={`http://localhost:8000/uploads/${logo_file}`}
              style={{ objectFit: 'cover', borderRadius: '4px' }}
              preview={{
                mask: <EyeOutlined />,
              }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span className="text-gray-400 text-xs">No logo</span>
          </div>
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
      render: (_: any, record: Manufacturer) => (
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
    } catch (error: any) {
      showError(error.message || 'Failed to fetch manufacturers');
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
    setFileList([]);
    clearError(); // Clear any previous error messages
    setModalVisible(true);
  };

  const handleEdit = (record: Manufacturer) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    // Set existing image in file list if available
    if (record.logo_file) {
      setFileList([{
        uid: '-1',
        name: record.logo_file,
        status: 'done',
        url: `http://localhost:8000/uploads/${record.logo_file}`,
      }]);
    } else {
      setFileList([]);
    }
    clearError(); // Clear any previous error messages
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteManufacturer(id);
      console.log('Manufacturer deleted successfully');
      fetchData(); // Refresh the data
    } catch (error: any) {
      showError(error.message || 'Failed to delete manufacturer');
    }
  };

  const handleSubmit = async (values: ManufacturerCreate) => {
    try {
      // Get the logo filename from the uploaded file
      const logoFile = fileList.length > 0 && fileList[0].response ? fileList[0].response.filename :
                      (fileList.length > 0 && fileList[0].name ? fileList[0].name : undefined);

      const submitData = {
        ...values,
        logo_file: logoFile || undefined  // Send undefined instead of null
      };

      if (editingRecord) {
        // Update existing record
        await apiService.updateManufacturer(editingRecord.id, submitData);
        console.log('Manufacturer updated successfully');
      } else {
        // Add new record
        await apiService.createManufacturer(submitData);
        console.log('Manufacturer added successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setFileList([]);
      fetchData(); // Refresh the data
    } catch (error: any) {
      showError(error.message || 'Failed to save manufacturer');
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const response = await apiService.uploadImage(file);
      return response;
    } catch (error: any) {
      showError(error.message || 'Upload failed');
      throw error;
    }
  };

  const uploadProps = {
    name: 'file',
    listType: 'picture-card' as const,
    fileList: fileList,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        showError('You can only upload image files!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        showError('Image must smaller than 2MB!');
        return false;
      }
      return true;
    },
    customRequest: async ({ file, onSuccess, onError }: any) => {
      try {
        const response = await handleUpload(file as File);
        onSuccess(response);
      } catch (error) {
        onError(error);
      }
    },
    onChange: ({ fileList: newFileList }: any) => {
      setFileList(newFileList);
    },
    maxCount: 1,
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
          {/* Error Display at the top of the form */}
          <ErrorToast message={errorMessage} onClose={clearError} />

          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter manufacturer name' }]}
          >
            <Input placeholder="Enter manufacturer name" />
          </Form.Item>

          <Form.Item
            name="logo_file"
            label="Logo Image"
          >
            <Upload {...uploadProps}>
              {fileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
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
