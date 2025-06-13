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
  message
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  FilterOutlined,
  DollarOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { apiService } from '../../api';
import type { CustomerAccount } from '../../api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import ErrorToast from '../../components/ErrorDisplay/ErrorToast';
import AddAccountModal from '../Accounts/AddAccountModal';
import EditAccountModal from '../Accounts/EditAccountModal';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface CustomerAccountsProps {
  customerId: number;
}

const CustomerAccounts: React.FC<CustomerAccountsProps> = ({ customerId }) => {
  const [accounts, setAccounts] = useState<CustomerAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<CustomerAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<CustomerAccount | null>(null);

  // Use our custom error handler hook
  const { errorMessage, showError, clearError } = useErrorHandler();

  const getPaymentStatus = (outstanding: number) => {
    if (outstanding === 0) {
      return { status: 'Paid', color: 'success', icon: <CheckCircleOutlined /> };
    } else if (outstanding > 0) {
      return { status: 'Outstanding', color: 'warning', icon: <ExclamationCircleOutlined /> };
    }
    return { status: 'Unknown', color: 'default', icon: null };
  };

  const isOverdue = (reminderDate: string | null) => {
    if (!reminderDate) return false;
    return dayjs().isAfter(dayjs(reminderDate));
  };

  const columns = [
    {
      title: 'Invoice',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      width: 120,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: (a: CustomerAccount, b: CustomerAccount) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Project ID',
      dataIndex: 'project_name',
      key: 'project_name',
      width: 150,
      render: (projectName: string) => projectName || '-',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => `$${amount.toLocaleString()}`,
      sorter: (a: CustomerAccount, b: CustomerAccount) => a.amount - b.amount,
    },
    {
      title: 'Outstanding',
      dataIndex: 'outstanding',
      key: 'outstanding',
      width: 120,
      render: (outstanding: number) => {
        const { status, color, icon } = getPaymentStatus(outstanding);
        return (
          <Space>
            <span>${outstanding.toLocaleString()}</span>
            <Tag color={color} icon={icon}>
              {status}
            </Tag>
          </Space>
        );
      },
      sorter: (a: CustomerAccount, b: CustomerAccount) => a.outstanding - b.outstanding,
    },
    {
      title: 'Reminder',
      dataIndex: 'reminder_date',
      key: 'reminder_date',
      width: 120,
      render: (reminderDate: string | null) => {
        if (!reminderDate) return '-';
        const overdue = isOverdue(reminderDate);
        return (
          <Space>
            <span className={overdue ? 'text-red-500' : ''}>
              {dayjs(reminderDate).format('MMM DD, YYYY')}
            </span>
            {overdue && (
              <Tooltip title="Overdue">
                <BellOutlined className="text-red-500" />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Comments',
      dataIndex: 'comments',
      key: 'comments',
      width: 200,
      render: (comments: string) => (
        <div className="truncate max-w-xs" title={comments}>
          {comments || '-'}
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_: any, record: CustomerAccount) => (
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

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const accountsData = await apiService.getCustomerAccounts(customerId);
      setAccounts(accountsData);
      setFilteredAccounts(accountsData);
    } catch (error: any) {
      showError(error.message || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [customerId]);

  useEffect(() => {
    applyFilters();
  }, [accounts, dateRange]);

  const applyFilters = () => {
    let filtered = [...accounts];

    // Apply date range filter
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(account => {
        const accountDate = dayjs(account.date);
        return accountDate.isAfter(startDate.subtract(1, 'day')) && 
               accountDate.isBefore(endDate.add(1, 'day'));
      });
    }

    setFilteredAccounts(filtered);
  };

  const handleAddInvoice = () => {
    setShowAddModal(true);
  };

  const handleEdit = (account: CustomerAccount) => {
    setSelectedAccount(account);
    setShowEditModal(true);
  };

  const handleView = (account: CustomerAccount) => {
    const { status, color } = getPaymentStatus(account.outstanding);
    Modal.info({
      title: 'Invoice Details',
      width: 600,
      content: (
        <div className="space-y-4">
          <div><strong>Invoice Number:</strong> {account.invoice_number}</div>
          <div><strong>Date:</strong> {dayjs(account.date).format('MMMM DD, YYYY')}</div>
          <div><strong>Project:</strong> {account.project_name || '-'}</div>
          <div><strong>Name:</strong> {account.name}</div>
          <div><strong>Amount:</strong> ${account.amount.toLocaleString()}</div>
          <div><strong>Outstanding:</strong> ${account.outstanding.toLocaleString()}</div>
          <div><strong>Payment Status:</strong> <Tag color={color}>{status}</Tag></div>
          {account.reminder_date && (
            <div><strong>Reminder Date:</strong> {dayjs(account.reminder_date).format('MMMM DD, YYYY')}</div>
          )}
          {account.comments && (
            <div><strong>Comments:</strong> {account.comments}</div>
          )}
        </div>
      ),
    });
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchAccounts();
    message.success('Invoice added successfully');
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedAccount(null);
    fetchAccounts();
    message.success('Invoice updated successfully');
  };

  const clearFilters = () => {
    setDateRange(null);
  };

  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    if (dates) {
      setDateRange([dates[0], dates[1]]);
    } else {
      setDateRange(null);
    }
  };

  // Calculate summary statistics
  const totalAmount = filteredAccounts.reduce((sum, account) => sum + account.amount, 0);
  const totalOutstanding = filteredAccounts.reduce((sum, account) => sum + account.outstanding, 0);
  const overdueCount = filteredAccounts.filter(account => 
    account.reminder_date && isOverdue(account.reminder_date)
  ).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={4}>Accounts</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddInvoice}
        >
          Add Invoice
        </Button>
      </div>

      {/* Error Display */}
      <ErrorToast message={errorMessage} onClose={clearError} />

      {/* Summary Cards */}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${totalAmount.toLocaleString()}</div>
              <div className="text-gray-500">Total Amount</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">${totalOutstanding.toLocaleString()}</div>
              <div className="text-gray-500">Outstanding</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${(totalAmount - totalOutstanding).toLocaleString()}</div>
              <div className="text-gray-500">Paid</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
              <div className="text-gray-500">Overdue</div>
            </div>
          </Card>
        </Col>
      </Row>

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
                  Apply Filters
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
                Showing {filteredAccounts.length} of {accounts.length} invoices
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Accounts Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredAccounts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} invoices`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {accounts.length === 0 && !loading && (
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <DollarOutlined className="text-4xl" />
            </div>
            <Title level={4} className="text-gray-500">No invoices found</Title>
            <p className="text-gray-400">
              This customer doesn't have any invoices yet. Create a new invoice to get started.
            </p>
          </div>
        </Card>
      )}

      {/* Add Account Modal */}
      <AddAccountModal
        visible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        initialCustomerId={customerId}
      />

      {/* Edit Account Modal */}
      {selectedAccount && (
        <EditAccountModal
          visible={showEditModal}
          account={selectedAccount}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedAccount(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default CustomerAccounts;
