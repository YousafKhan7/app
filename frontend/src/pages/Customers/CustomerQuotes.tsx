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
  Tooltip,
  Modal,
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
import type { Quote } from '../../api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import ErrorToast from '../../components/ErrorDisplay/ErrorToast';
import AddQuoteModal from '../Quotes/AddQuoteModal';
import EditQuoteModal from '../Quotes/EditQuoteModal';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface CustomerQuotesProps {
  customerId: number;
}

const CustomerQuotes: React.FC<CustomerQuotesProps> = ({ customerId }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  // Use our custom error handler hook
  const { errorMessage, showError, clearError } = useErrorHandler();

  const getQuoteStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return { status: 'Approved', color: 'success', icon: <CheckCircleOutlined /> };
      case 'pending':
        return { status: 'Pending', color: 'warning', icon: <ExclamationCircleOutlined /> };
      case 'draft':
        return { status: 'Draft', color: 'default', icon: null };
      default:
        return { status, color: 'default', icon: null };
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [customerId]);

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

  const handleAddQuote = () => {
    setShowAddModal(true);
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
      showError(error.message || 'Failed to delete quote');
    }
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchQuotes();
    message.success('Quote added successfully');
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedQuote(null);
    fetchQuotes();
    message.success('Quote updated successfully');
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setDateRange([dates[0], dates[1]]);
    } else {
      setDateRange(null);
    }
  };

  const applyFilters = () => {
    let filtered = [...quotes];

    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(quote => {
        const quoteDate = dayjs(quote.date);
        return quoteDate.isAfter(startDate.subtract(1, 'day')) && 
               quoteDate.isBefore(endDate.add(1, 'day'));
      });
    }

    setFilteredQuotes(filtered);
  };

  const clearFilters = () => {
    setDateRange(null);
    setFilteredQuotes(quotes);
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
      width: 120,
      render: (status: string) => {
        const { status: statusText, color, icon } = getQuoteStatus(status);
        return (
          <Tag color={color} icon={icon}>
            {statusText}
          </Tag>
        );
      },
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

      {/* Add Quote Modal */}
      <AddQuoteModal
        visible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        initialCustomerId={customerId}
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

export default CustomerQuotes;
