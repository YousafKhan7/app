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
  
  message,
  Input,
  Popconfirm
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  PlusOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { apiService } from '../../api';
import type { Quote } from '../../api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import ErrorToast from '../../components/ErrorDisplay/ErrorToast';
import AddQuoteModal from './AddQuoteModal';
import EditQuoteModal from './EditQuoteModal';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

const Quotes: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  // Use our custom error handler hook
  const { errorMessage, showError, clearError } = useErrorHandler();

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Completed', label: 'Completed' }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'default';
      case 'pending': return 'processing';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'blue';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Job ID',
      dataIndex: 'job_id',
      key: 'job_id',
      width: 120,
      sorter: (a: Quote, b: Quote) => a.job_id.localeCompare(b.job_id),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a: Quote, b: Quote) => a.name.localeCompare(b.name),
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 180,
      render: (name: string) => name || '-',
      sorter: (a: Quote, b: Quote) => (a.customer_name || '').localeCompare(b.customer_name || ''),
    },
    {
      title: 'Engineer',
      dataIndex: 'engineer_name',
      key: 'engineer_name',
      width: 150,
      render: (name: string) => name || '-',
    },
    {
      title: 'Salesman',
      dataIndex: 'salesman_name',
      key: 'salesman_name',
      width: 150,
      render: (name: string) => name || '-',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: (a: Quote, b: Quote) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Sell Price',
      dataIndex: 'sell_price',
      key: 'sell_price',
      width: 120,
      render: (price: number) => `$${price.toLocaleString()}`,
      sorter: (a: Quote, b: Quote) => a.sell_price - b.sell_price,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
      sorter: (a: Quote, b: Quote) => a.status.localeCompare(b.status),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Quote) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this quote?"
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

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const quotesData = await apiService.getQuotes();
      setQuotes(quotesData);
      setFilteredQuotes(quotesData);
    } catch (error: any) {
      showError(error.message || 'Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [quotes, dateRange, statusFilter, searchText]);

  const applyFilters = () => {
    let filtered = [...quotes];

    // Apply search filter
    if (searchText) {
      filtered = filtered.filter(quote =>
        quote.job_id.toLowerCase().includes(searchText.toLowerCase()) ||
        quote.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (quote.customer_name && quote.customer_name.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Apply date range filter
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(quote => {
        const quoteDate = dayjs(quote.date);
        return quoteDate.isAfter(startDate.subtract(1, 'day')) && 
               quoteDate.isBefore(endDate.add(1, 'day'));
      });
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    setFilteredQuotes(filtered);
  };



  const handleEdit = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowEditModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteQuote(id);
      message.success('Quote deleted successfully');
      fetchQuotes();
    } catch (error: any) {
      message.error(error.message || 'Failed to delete quote');
      showError(error.message || 'Failed to delete quote');
    }
  };

  const handleAddQuote = () => {
    setShowAddModal(true);
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchQuotes();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedQuote(null);
    fetchQuotes();
  };

  const clearFilters = () => {
    setDateRange(null);
    setStatusFilter('');
    setSearchText('');
  };



  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Quote Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddQuote}
        >
          Add Quote
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
                placeholder="Search by Job ID, Name, or Customer"
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
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
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
                Showing {filteredQuotes.length} of {quotes.length} quotes
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Quotes Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredQuotes}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} quotes`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {quotes.length === 0 && !loading && (
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileTextOutlined className="text-4xl" />
            </div>
            <Title level={4} className="text-gray-500">No quotes found</Title>
            <p className="text-gray-400">
              Create your first quote to get started with quote management.
            </p>
          </div>
        </Card>
      )}

      {/* Add Quote Modal */}
      <AddQuoteModal
        visible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Quote Modal */}
      {selectedQuote && (
        <EditQuoteModal
          visible={showEditModal}
          quote={selectedQuote}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedQuote(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default Quotes;
