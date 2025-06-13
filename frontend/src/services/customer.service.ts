/**
 * Customer and Supplier API service
 */
import apiClient from './api-client';
import type { 
  Customer, 
  CustomerCreate,
  Supplier,
  SupplierCreate,
  Quote,
  Project,
  CustomerAccount
} from '../types';

export const customerService = {
  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    const response = await apiClient.get('/customers');
    return response.data.customers;
  },

  createCustomer: async (customer: CustomerCreate): Promise<any> => {
    const response = await apiClient.post('/customers', customer);
    return response.data;
  },

  updateCustomer: async (id: number, customer: CustomerCreate): Promise<any> => {
    const response = await apiClient.put(`/customers/${id}`, customer);
    return response.data;
  },

  deleteCustomer: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/customers/${id}`);
    return response.data;
  },

  // Customer-specific data
  getCustomerQuotes: async (customerId: number): Promise<Quote[]> => {
    const response = await apiClient.get(`/customers/${customerId}/quotes`);
    return response.data.quotes;
  },

  getCustomerProjects: async (customerId: number): Promise<Project[]> => {
    const response = await apiClient.get(`/customers/${customerId}/projects`);
    return response.data.projects;
  },

  getCustomerAccounts: async (customerId: number): Promise<CustomerAccount[]> => {
    const response = await apiClient.get(`/customers/${customerId}/accounts`);
    return response.data.accounts;
  },

  // Suppliers
  getSuppliers: async (): Promise<Supplier[]> => {
    const response = await apiClient.get('/suppliers');
    return response.data.suppliers;
  },

  createSupplier: async (supplier: SupplierCreate): Promise<any> => {
    const response = await apiClient.post('/suppliers', supplier);
    return response.data;
  },

  updateSupplier: async (id: number, supplier: SupplierCreate): Promise<any> => {
    const response = await apiClient.put(`/suppliers/${id}`, supplier);
    return response.data;
  },

  deleteSupplier: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/suppliers/${id}`);
    return response.data;
  },
};
