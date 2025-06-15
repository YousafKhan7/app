import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Space,
  Spin,
  Tabs
} from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { apiService } from '../../api';
import type { Customer } from '../../api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import ErrorToast from '../../components/ErrorDisplay/ErrorToast';
import CustomerInfo from './CustomerInfo';
import CustomerQuotes from './CustomerQuotes';
import CustomerAccounts from './CustomerAccounts';
import CustomerProjects from './CustomerProjects';
import AddCustomerModal from './AddCustomerModal';

const { Title } = Typography;
const { TabPane } = Tabs;

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Use our custom error handler hook
  const { errorMessage, showError, clearError } = useErrorHandler();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await apiService.getCustomers();
      setCustomers(response.customers);
      if (response.customers.length > 0 && !selectedCustomer) {
        setSelectedCustomer(response.customers[0]);
      }
    } catch (error: any) {
      showError(error.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleCustomerUpdate = async () => {
    await fetchCustomers(); // Refresh customer list after updates
    // Update selected customer with fresh data
    if (selectedCustomer) {
      const updatedCustomers = await apiService.getCustomers();
      const updatedSelectedCustomer = updatedCustomers.customers.find((c: Customer) => c.id === selectedCustomer.id);
      if (updatedSelectedCustomer) {
        setSelectedCustomer(updatedSelectedCustomer);
      }
    }
  };

  const handleAddCustomer = () => {
    setShowAddModal(true);
  };

  const handleAddCustomerSuccess = (newCustomer: Customer) => {
    setShowAddModal(false);
    fetchCustomers();
    setSelectedCustomer(newCustomer);
  };

  const handleCustomerDelete = () => {
    setSelectedCustomer(null);
    fetchCustomers();
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Customer Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddCustomer}
        >
          Add Customer
        </Button>
      </div>

      {/* Error Display */}
      <ErrorToast message={errorMessage} onClose={clearError} />

      <div className="grid grid-cols-12 gap-6">
        {/* Customer List Sidebar */}
        <div className="col-span-3">
          <Card title="Customers" size="small">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    selectedCustomer?.id === customer.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <div className="flex items-center space-x-2">
                    <UserOutlined className="text-gray-500" />
                    <div>
                      <div className="font-medium text-sm">{customer.name}</div>
                      <div className="text-xs text-gray-500">{customer.category || 'No category'}</div>
                    </div>
                  </div>
                </div>
              ))}
              {customers.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No customers found
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Customer Details */}
        <div className="col-span-9">
          {selectedCustomer ? (
            <Card>
              <div className="mb-4">
                <Title level={3} className="mb-2">{selectedCustomer.name}</Title>
                <div className="text-gray-600">
                  <Space>
                    <span>{selectedCustomer.category || 'No category'}</span>
                    {selectedCustomer.sales_rep_name && (
                      <>
                        <span>•</span>
                        <span>Sales Rep: {selectedCustomer.sales_rep_name}</span>
                      </>
                    )}
                  </Space>
                </div>
              </div>

              <Tabs defaultActiveKey="info">
                <TabPane tab="Information" key="info">
                  <CustomerInfo
                    customer={selectedCustomer}
                    onUpdate={handleCustomerUpdate}
                    onDelete={handleCustomerDelete}
                  />
                </TabPane>
                <TabPane tab="Quotes" key="quotes">
                  <CustomerQuotes customerId={selectedCustomer.id} />
                </TabPane>
                <TabPane tab="Accounts" key="accounts">
                  <CustomerAccounts customerId={selectedCustomer.id} />
                </TabPane>
                <TabPane tab="Projects" key="projects">
                  <CustomerProjects customerId={selectedCustomer.id} />
                </TabPane>
              </Tabs>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-12">
                <UserOutlined className="text-4xl text-gray-300 mb-4" />
                <Title level={4} className="text-gray-500">Select a customer to view details</Title>
                <p className="text-gray-400">Choose a customer from the list to see their information.</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        visible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onSuccess={handleAddCustomerSuccess}
      />
    </div>
  );
};

export default Customers;
