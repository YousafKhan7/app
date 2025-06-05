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
  message,
  Input,
  Popconfirm
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  FilterOutlined, 
  PlusOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import { apiService } from '../../api';
import type { Project } from '../../api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import ErrorToast from '../../components/ErrorDisplay/ErrorToast';
import AddProjectModal from './AddProjectModal';
import EditProjectModal from './EditProjectModal';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
      sorter: (a: Project, b: Project) => a.project_id.localeCompare(b.project_id),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a: Project, b: Project) => a.name.localeCompare(b.name),
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 180,
      render: (name: string) => name || '-',
      sorter: (a: Project, b: Project) => (a.customer_name || '').localeCompare(b.customer_name || ''),
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
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
      sorter: (a: Project, b: Project) => a.status.localeCompare(b.status),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Project) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this project?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const projectsData = await apiService.getProjects();
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
  }, []);

  useEffect(() => {
    applyFilters();
  }, [projects, dateRange, statusFilter, searchText]);

  const applyFilters = () => {
    let filtered = [...projects];

    // Apply search filter
    if (searchText) {
      filtered = filtered.filter(project =>
        project.project_id.toLowerCase().includes(searchText.toLowerCase()) ||
        project.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (project.customer_name && project.customer_name.toLowerCase().includes(searchText.toLowerCase())) ||
        (project.end_user && project.end_user.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

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

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteProject(id);
      message.success('Project deleted successfully');
      fetchProjects();
    } catch (error: any) {
      message.error(error.message || 'Failed to delete project');
      showError(error.message || 'Failed to delete project');
    }
  };

  const handleAddProject = () => {
    setShowAddModal(true);
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchProjects();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedProject(null);
    fetchProjects();
  };

  const clearFilters = () => {
    setDateRange(null);
    setStatusFilter('');
    setSearchText('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Project Management</Title>
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
          <Col span={6}>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <Search
                placeholder="Search by Project ID, Name, Customer, or End User"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </div>
          </Col>
          <Col span={6}>
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
          <Col span={4}>
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
          <Col span={4}>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                &nbsp;
              </label>
              <Space>
                <Button 
                  icon={<FilterOutlined />}
                  onClick={applyFilters}
                >
                  Apply
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
          scroll={{ x: 1200 }}
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
              Create your first project to get started with project management.
            </p>
          </div>
        </Card>
      )}

      {/* Add Project Modal */}
      <AddProjectModal
        visible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Project Modal */}
      {selectedProject && (
        <EditProjectModal
          visible={showEditModal}
          project={selectedProject}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedProject(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default Projects;
