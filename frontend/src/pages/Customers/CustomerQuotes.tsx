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
import { EyeOutlined, EditOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../api';
import type { Quote } from '../../api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import ErrorToast from '../../components/ErrorDisplay/ErrorToast';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface CustomerQuotesProps {
  customerId: number;
}

const CustomerQuotes: React.FC<CustomerQuotesProps> = ({ customerId }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const navigate = useNavigate();

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
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_: any, record: Quote) => (
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

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const quotesData = await apiService.getCustomerQuotes(customerId);
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
  }, [customerId]);

  useEffect(() => {
    applyFilters();
  }, [quotes, dateRange, statusFilter]);

  const applyFilters = () => {
    let filtered = [...quotes];

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

  const handleView = (quote: Quote) => {
    Modal.info({
      title: 'Quote Details',
      width: 600,
      content: (
        <div className="space-y-4">
          <div><strong>Job ID:</strong> {quote.job_id}</div>
          <div><strong>Name:</strong> {quote.name}</div>
          <div><strong>Engineer:</strong> {quote.engineer_name || '-'}</div>
          <div><strong>Salesman:</strong> {quote.salesman_name || '-'}</div>
          <div><strong>Date:</strong> {dayjs(quote.date).format('MMMM DD, YYYY')}</div>
          <div><strong>Sell Price:</strong> ${quote.sell_price.toLocaleString()}</div>
          <div><strong>Status:</strong> <Tag color={getStatusColor(quote.status)}>{quote.status}</Tag></div>
        </div>
      ),
    });
  };

  const handleEdit = (quote: Quote) => {
    // Navigate to quotes page with edit functionality
    navigate('/quotes');
    message.info(`Navigate to quotes page to edit quote ${quote.job_id}`);
  };

  const handleAddQuote = () => {
    // Navigate to quotes page to add new quote
    navigate('/quotes');
    message.info('Navigate to quotes page to add new quote');
  };

  const clearFilters = () => {
    setDateRange(null);
    setStatusFilter('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={4}>Quotes</Title>
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
          scroll={{ x: 1000 }}
        />
      </Card>

      {quotes.length === 0 && !loading && (
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FilterOutlined className="text-4xl" />
            </div>
            <Title level={4} className="text-gray-500">No quotes found</Title>
            <p className="text-gray-400">
              This customer doesn't have any quotes yet. Create a new quote to get started.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CustomerQuotes;
