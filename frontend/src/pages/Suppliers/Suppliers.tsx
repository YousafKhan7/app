import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Space,
  Spin
} from 'antd';
import { PlusOutlined, ShopOutlined } from '@ant-design/icons';
import { apiService } from '../../api';
import type { Supplier } from '../../api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import ErrorToast from '../../components/ErrorDisplay/ErrorToast';
import SupplierInfo from './SupplierInfo';
import AddSupplierModal from './AddSupplierModal';

const { Title } = Typography;

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Use our custom error handler hook
  const { errorMessage, showError, clearError } = useErrorHandler();

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const supplierData = await apiService.getSuppliers();
      setSuppliers(supplierData);
      if (supplierData.length > 0 && !selectedSupplier) {
        setSelectedSupplier(supplierData[0]);
      }
    } catch (error: any) {
      showError(error.message || 'Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleSupplierUpdate = async () => {
    await fetchSuppliers(); // Refresh supplier list after updates
    // Update selected supplier with fresh data
    if (selectedSupplier) {
      const updatedSuppliers = await apiService.getSuppliers();
      const updatedSelectedSupplier = updatedSuppliers.find(s => s.id === selectedSupplier.id);
      if (updatedSelectedSupplier) {
        setSelectedSupplier(updatedSelectedSupplier);
      }
    }
  };

  const handleAddSupplier = () => {
    setShowAddModal(true);
  };

  const handleAddSupplierSuccess = (newSupplier: Supplier) => {
    setShowAddModal(false);
    fetchSuppliers();
    setSelectedSupplier(newSupplier);
  };

  const handleSupplierDelete = () => {
    setSelectedSupplier(null);
    fetchSuppliers();
  };

  if (loading && suppliers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Supplier Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddSupplier}
        >
          Add Supplier
        </Button>
      </div>

      {/* Error Display */}
      <ErrorToast message={errorMessage} onClose={clearError} />

      <div className="grid grid-cols-12 gap-6">
        {/* Supplier List Sidebar */}
        <div className="col-span-3">
          <Card title="Suppliers" size="small">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    selectedSupplier?.id === supplier.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSupplierSelect(supplier)}
                >
                  <div className="flex items-center space-x-2">
                    <ShopOutlined className="text-gray-500" />
                    <div>
                      <div className="font-medium text-sm">{supplier.name}</div>
                      <div className="text-xs text-gray-500">{supplier.category || 'No category'}</div>
                    </div>
                  </div>
                </div>
              ))}
              {suppliers.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No suppliers found
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Supplier Details */}
        <div className="col-span-9">
          {selectedSupplier ? (
            <Card>
              <div className="mb-4">
                <Title level={3} className="mb-2">{selectedSupplier.name}</Title>
                <div className="text-gray-600">
                  <Space>
                    <span>{selectedSupplier.category || 'No category'}</span>
                    {selectedSupplier.sales_rep_name && (
                      <>
                        <span>•</span>
                        <span>Sales Rep: {selectedSupplier.sales_rep_name}</span>
                      </>
                    )}
                  </Space>
                </div>
              </div>

              <SupplierInfo
                supplier={selectedSupplier}
                onUpdate={handleSupplierUpdate}
                onDelete={handleSupplierDelete}
              />
            </Card>
          ) : (
            <Card>
              <div className="text-center py-12">
                <ShopOutlined className="text-4xl text-gray-300 mb-4" />
                <Title level={4} className="text-gray-500">Select a supplier to view details</Title>
                <p className="text-gray-400">Choose a supplier from the list to see their information.</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Add Supplier Modal */}
      <AddSupplierModal
        visible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onSuccess={handleAddSupplierSuccess}
      />
    </div>
  );
};

export default Suppliers;
