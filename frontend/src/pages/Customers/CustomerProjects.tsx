import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  DatePicker,
  Select,
  Row,
  Col,
  Card,
  Typography,
  Spin,
  Modal,
  message
} from 'antd';
import { EyeOutlined, EditOutlined, FilterOutlined, ProjectOutlined, PlusOutlined } from '@ant-design/icons';
import { apiService } from '../../api';
import type { Project } from '../../api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import ErrorToast from '../../components/ErrorDisplay/ErrorToast';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface CustomerProjectsProps {
  customerId: number;
}

const CustomerProjects: React.FC<CustomerProjectsProps> = ({ customerId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Use our custom error handler hook
  const { errorMessage, showError, clearError } = useErrorHandler();

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Planning', label: 'Planning' },
    { value: 'Active', label: 'Active' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planning': return 'default';
      case 'active': return 'processing';
      case 'in progress': return 'blue';
      case 'on hold': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Project ID',
      dataIndex: 'project_id',
      key: 'project_id',
      width: 120,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Engineer',
      dataIndex: 'engineer_name',
      key: 'engineer_name',
      width: 150,
      render: (name: string) => name || '-',
    },
    {
      title: 'End User',
      dataIndex: 'end_user',
      key: 'end_user',
      width: 150,
      render: (endUser: string) => endUser || '-',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: (a: Project, b: Project) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Salesman',
      dataIndex: 'salesman_name',
      key: 'salesman_name',
      width: 150,
      render: (name: string) => name || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_: any, record: Project) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleView(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
        </Space>
      ),
    },
  ];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const projectsData = await apiService.getCustomerProjects(customerId);
      setProjects(projectsData);
      setFilteredProjects(projectsData);
    } catch (error: any) {
      showError(error.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [customerId]);

  useEffect(() => {
    applyFilters();
  }, [projects, dateRange, statusFilter]);

  const applyFilters = () => {
    let filtered = [...projects];

    // Apply date range filter
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(project => {
        const projectDate = dayjs(project.date);
        return projectDate.isAfter(startDate.subtract(1, 'day')) && 
               projectDate.isBefore(endDate.add(1, 'day'));
      });
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleView = (project: Project) => {
    Modal.info({
      title: 'Project Details',
      width: 600,
      content: (
        <div className="space-y-4">
          <div><strong>Project ID:</strong> {project.project_id}</div>
          <div><strong>Name:</strong> {project.name}</div>
          <div><strong>Engineer:</strong> {project.engineer_name || '-'}</div>
          <div><strong>End User:</strong> {project.end_user || '-'}</div>
          <div><strong>Date:</strong> {dayjs(project.date).format('MMMM DD, YYYY')}</div>
          <div><strong>Salesman:</strong> {project.salesman_name || '-'}</div>
          <div><strong>Status:</strong> <Tag color={getStatusColor(project.status)}>{project.status}</Tag></div>
        </div>
      ),
    });
  };

  const handleEdit = (project: Project) => {
    message.info('Edit project functionality will be implemented in the Project module');
  };

  const handleAddProject = () => {
    message.info('Add project functionality will be implemented in the Project module');
  };

  const clearFilters = () => {
    setDateRange(null);
    setStatusFilter('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={4}>Projects</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddProject}
        >
          Add Project
        </Button>
      </div>

      {/* Error Display */}
      <ErrorToast message={errorMessage} onClose={clearError} />

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col span={8}>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                style={{ width: '100%' }}
                placeholder={['Start Date', 'End Date']}
              />
            </div>
          </Col>
          <Col span={6}>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
                placeholder="Select status"
              >
                {statusOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col span={6}>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                &nbsp;
              </label>
              <Space>
                <Button 
                  icon={<FilterOutlined />}
                  onClick={applyFilters}
                >
                  Apply Filters
                </Button>
                <Button onClick={clearFilters}>
                  Clear
                </Button>
              </Space>
            </div>
          </Col>
          <Col span={4}>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Showing {filteredProjects.length} of {projects.length} projects
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Projects Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredProjects}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} projects`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {projects.length === 0 && !loading && (
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ProjectOutlined className="text-4xl" />
            </div>
            <Title level={4} className="text-gray-500">No projects found</Title>
            <p className="text-gray-400">
              This customer doesn't have any projects yet. Create a new project to get started.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CustomerProjects;
