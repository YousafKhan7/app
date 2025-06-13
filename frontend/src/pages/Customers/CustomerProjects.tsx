import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  DatePicker,
  Row,
  Col,
  Card,
  Typography,
  message,
  Popconfirm
} from 'antd';
import {
  EditOutlined,
  FilterOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { apiService } from '../../api';
import type { Project } from '../../api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import ErrorToast from '../../components/ErrorDisplay/ErrorToast';
import AddProjectModal from '../Projects/AddProjectModal';
import EditProjectModal from '../Projects/EditProjectModal';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface CustomerProjectsProps {
  customerId: number;
}

const CustomerProjects: React.FC<CustomerProjectsProps> = ({ customerId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Use our custom error handler hook
  const { errorMessage, showError, clearError } = useErrorHandler();

  const getProjectStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return { status: 'Active', color: 'success', icon: <CheckCircleOutlined /> };
      case 'completed':
        return { status: 'Completed', color: 'blue', icon: <CheckCircleOutlined /> };
      case 'on hold':
        return { status: 'On Hold', color: 'warning', icon: <ExclamationCircleOutlined /> };
      default:
        return { status, color: 'default', icon: null };
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [customerId]);

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

  const handleAddProject = () => {
    setShowAddModal(true);
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
      showError(error.message || 'Failed to delete project');
    }
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchProjects();
    message.success('Project added successfully');
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedProject(null);
    fetchProjects();
    message.success('Project updated successfully');
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setDateRange([dates[0], dates[1]]);
    } else {
      setDateRange(null);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(project => {
        const projectDate = dayjs(project.date);
        return projectDate.isAfter(startDate.subtract(1, 'day')) && 
               projectDate.isBefore(endDate.add(1, 'day'));
      });
    }

    setFilteredProjects(filtered);
  };

  const clearFilters = () => {
    setDateRange(null);
    setFilteredProjects(projects);
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
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: (a: Project, b: Project) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'End User',
      dataIndex: 'end_user',
      key: 'end_user',
      width: 150,
      render: (endUser: string) => endUser || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const { status: statusText, color, icon } = getProjectStatus(status);
        return (
          <Tag color={color} icon={icon}>
            {statusText}
          </Tag>
        );
      },
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
            onConfirm={() => handleDelete(record.id!)}
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
                onChange={handleDateRangeChange}
                style={{ width: '100%' }}
                placeholder={['Start Date', 'End Date']}
              />
            </div>
          </Col>
          <Col span={8}>
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
          <Col span={8}>
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

      {/* Add Project Modal */}
      <AddProjectModal
        visible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        initialCustomerId={customerId}
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

export default CustomerProjects;
