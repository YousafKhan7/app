import axios from 'axios';
import { withRetry } from './utils/retryUtils';

// Determine API base URL based on environment
const API_BASE_URL = import.meta.env.PROD
  ? '/api'  // Production: use relative path for Vercel
  : 'http://localhost:8000';  // Development: use localhost

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the full error for debugging
    console.error('API Error:', error);
    console.error('Error Response:', error.response);
    console.error('Error Response Data:', error.response?.data);

    // Categorize error types
    let errorCategory = 'unknown';
    let shouldRetry = false;

    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      errorCategory = 'network';
      shouldRetry = true;
    } else if (error.response?.status >= 500) {
      errorCategory = 'server';
      shouldRetry = true;
    } else if (error.response?.status >= 400) {
      errorCategory = 'client';
      shouldRetry = false;
    }

    console.error('Error Category:', errorCategory);

    // Preserve the original error structure for validation error parsing
    // Add error metadata to the original error object
    (error as any).category = errorCategory;
    (error as any).shouldRetry = shouldRetry;
    (error as any).status = error.response?.status;

    // Throw the original error to preserve the response structure
    throw error;
  }
);

export interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserCreate {
  name: string;
  email: string;
  active: boolean;
}

export interface AccountType {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AccountTypeCreate {
  name: string;
  description?: string;
}

export interface ChartOfAccount {
  id: number;
  number: string;
  description: string;
  inactive: boolean;
  sub_account?: string;
  type_id: number;
  currency_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChartOfAccountCreate {
  number: string;
  description: string;
  inactive: boolean;
  sub_account?: string;
  type_id: number;
  currency_id?: number;
}

export interface Department {
  id: number;
  number: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface DepartmentCreate {
  number: string;
  name: string;
}

export interface Currency {
  id: number;
  currency: string;
  rate: number;
  effective_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface CurrencyCreate {
  currency: string;
  rate: number;
  effective_date: string;
}

export interface Location {
  id: number;
  number: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface LocationCreate {
  number: string;
  name: string;
}

export interface Manufacturer {
  id: number;
  name: string;
  logo_file?: string;
  sorting: number;
  created_at?: string;
  updated_at?: string;
}

export interface ManufacturerCreate {
  name: string;
  logo_file?: string;
  sorting: number;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeamCreate {
  name: string;
  description?: string;
}

export interface Warehouse {
  id: number;
  warehouse_name: string;
  number: string;
  markup: number;
  created_at?: string;
  updated_at?: string;
}

export interface WarehouseCreate {
  warehouse_name: string;
  number: string;
  markup: number;
}

export interface Commission {
  id: number;
  type: string;
  percentage: number;
  gp: boolean;
  sales: boolean;
  commercial_billing: boolean;
  payment: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CommissionCreate {
  type: string;
  percentage: number;
  gp: boolean;
  sales: boolean;
  commercial_billing: boolean;
  payment: boolean;
}

export interface Customer {
  id: number;
  name: string;
  category?: string;
  sales_rep_id?: number;
  phone?: string;
  email?: string;
  address?: string;
  contact_name?: string;
  contact_title?: string;
  contact_phone?: string;
  contact_email?: string;
  currency_id?: number;
  tax_rate: number;
  bank_name?: string;
  file_format?: string;
  account_number?: string;
  institution?: string;
  transit?: string;
  sales_rep_name?: string;
  currency_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerCreate {
  name: string;
  category?: string;
  sales_rep_id?: number;
  phone?: string;
  email?: string;
  address?: string;
  contact_name?: string;
  contact_title?: string;
  contact_phone?: string;
  contact_email?: string;
  currency_id?: number;
  tax_rate: number;
  bank_name?: string;
  file_format?: string;
  account_number?: string;
  institution?: string;
  transit?: string;
}

export interface Supplier {
  id: number;
  name: string;
  category?: string;
  sales_rep_id?: number;
  phone?: string;
  email?: string;
  address?: string;
  contact_name?: string;
  contact_title?: string;
  contact_phone?: string;
  contact_email?: string;
  currency_id?: number;
  tax_rate: number;
  bank_name?: string;
  file_format?: string;
  account_number?: string;
  institution?: string;
  transit?: string;
  sales_rep_name?: string;
  currency_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupplierCreate {
  name: string;
  category?: string;
  sales_rep_id?: number;
  phone?: string;
  email?: string;
  address?: string;
  contact_name?: string;
  contact_title?: string;
  contact_phone?: string;
  contact_email?: string;
  currency_id?: number;
  tax_rate: number;
  bank_name?: string;
  file_format?: string;
  account_number?: string;
  institution?: string;
  transit?: string;
}

export interface Quote {
  id: number;
  job_id: string;
  name: string;
  customer_id?: number;
  engineer_id?: number;
  salesman_id?: number;
  date: string;
  sell_price: number;
  status: string;
  customer_name?: string;
  engineer_name?: string;
  salesman_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: number;
  project_id: string;
  name: string;
  customer_id?: number;
  engineer_id?: number;
  end_user?: string;
  date: string;
  salesman_id?: number;
  status: string;
  engineer_name?: string;
  salesman_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerAccount {
  id: number;
  invoice_number: string;
  date: string;
  project_id?: number;
  customer_id?: number;
  name: string;
  amount: number;
  outstanding: number;
  reminder_date?: string;
  comments?: string;
  project_name?: string;
  customer_name?: string;
  created_at?: string;
  updated_at?: string;
}

export const apiService = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // File upload
  uploadImage: async (file: File): Promise<{filename: string, url: string}> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Users
  getUsers: async (params?: PaginationParams): Promise<User[] | PaginatedResponse<User>> => {
    return withRetry(async () => {
      const response = await api.get('/users', { params });

      // If pagination params provided, return paginated response
      if (params && (params.page || params.limit || params.search)) {
        return {
          data: response.data.users,
          pagination: response.data.pagination
        };
      }

      // Otherwise return just the users array for backward compatibility
      return response.data.users;
    });
  },

  getActiveUsersCount: async (): Promise<number> => {
    return withRetry(async () => {
      const response = await api.get('/users/active-count');
      return response.data.active_users_count;
    });
  },

  createUser: async (user: UserCreate): Promise<any> => {
    const response = await api.post('/users', user);
    return response.data;
  },

  updateUser: async (id: number, user: UserCreate): Promise<any> => {
    const response = await api.put(`/users/${id}`, user);
    return response.data;
  },

  deleteUser: async (id: number): Promise<any> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Account Types
  getAccountTypes: async (): Promise<AccountType[]> => {
    const response = await api.get('/account-types');
    return response.data.account_types;
  },

  createAccountType: async (accountType: AccountTypeCreate): Promise<void> => {
    await api.post('/account-types', accountType);
  },

  // Chart of Accounts
  getChartOfAccounts: async (): Promise<ChartOfAccount[]> => {
    const response = await api.get('/chart-of-accounts');
    return response.data.accounts;
  },

  createChartOfAccount: async (account: ChartOfAccountCreate): Promise<any> => {
    const response = await api.post('/chart-of-accounts', account);
    return response.data;
  },

  updateChartOfAccount: async (id: number, account: ChartOfAccountCreate): Promise<any> => {
    const response = await api.put(`/chart-of-accounts/${id}`, account);
    return response.data;
  },

  deleteChartOfAccount: async (id: number): Promise<any> => {
    const response = await api.delete(`/chart-of-accounts/${id}`);
    return response.data;
  },

  // Departments
  getDepartments: async (): Promise<Department[]> => {
    const response = await api.get('/departments');
    return response.data.departments;
  },

  createDepartment: async (department: DepartmentCreate): Promise<any> => {
    const response = await api.post('/departments', department);
    return response.data;
  },

  updateDepartment: async (id: number, department: DepartmentCreate): Promise<any> => {
    const response = await api.put(`/departments/${id}`, department);
    return response.data;
  },

  deleteDepartment: async (id: number): Promise<any> => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },

  // Currencies
  getCurrencies: async (): Promise<Currency[]> => {
    const response = await api.get('/currencies');
    return response.data.currencies;
  },

  createCurrency: async (currency: CurrencyCreate): Promise<any> => {
    const response = await api.post('/currencies', currency);
    return response.data;
  },

  updateCurrency: async (id: number, currency: CurrencyCreate): Promise<any> => {
    const response = await api.put(`/currencies/${id}`, currency);
    return response.data;
  },

  deleteCurrency: async (id: number): Promise<any> => {
    const response = await api.delete(`/currencies/${id}`);
    return response.data;
  },

  // Locations
  getLocations: async (): Promise<Location[]> => {
    const response = await api.get('/locations');
    return response.data.locations;
  },

  createLocation: async (location: LocationCreate): Promise<any> => {
    const response = await api.post('/locations', location);
    return response.data;
  },

  updateLocation: async (id: number, location: LocationCreate): Promise<any> => {
    const response = await api.put(`/locations/${id}`, location);
    return response.data;
  },

  deleteLocation: async (id: number): Promise<any> => {
    const response = await api.delete(`/locations/${id}`);
    return response.data;
  },

  // Manufacturers
  getManufacturers: async (): Promise<Manufacturer[]> => {
    const response = await api.get('/manufacturers');
    return response.data.manufacturers;
  },

  createManufacturer: async (manufacturer: ManufacturerCreate): Promise<any> => {
    const response = await api.post('/manufacturers', manufacturer);
    return response.data;
  },

  updateManufacturer: async (id: number, manufacturer: ManufacturerCreate): Promise<any> => {
    const response = await api.put(`/manufacturers/${id}`, manufacturer);
    return response.data;
  },

  deleteManufacturer: async (id: number): Promise<any> => {
    const response = await api.delete(`/manufacturers/${id}`);
    return response.data;
  },

  // Teams
  getTeams: async (): Promise<Team[]> => {
    const response = await api.get('/teams');
    return response.data.teams;
  },

  createTeam: async (team: TeamCreate): Promise<any> => {
    const response = await api.post('/teams', team);
    return response.data;
  },

  updateTeam: async (id: number, team: TeamCreate): Promise<any> => {
    const response = await api.put(`/teams/${id}`, team);
    return response.data;
  },

  deleteTeam: async (id: number): Promise<any> => {
    const response = await api.delete(`/teams/${id}`);
    return response.data;
  },

  // Warehouses
  getWarehouses: async (): Promise<Warehouse[]> => {
    const response = await api.get('/warehouses');
    return response.data.warehouses;
  },

  createWarehouse: async (warehouse: WarehouseCreate): Promise<any> => {
    const response = await api.post('/warehouses', warehouse);
    return response.data;
  },

  updateWarehouse: async (id: number, warehouse: WarehouseCreate): Promise<any> => {
    const response = await api.put(`/warehouses/${id}`, warehouse);
    return response.data;
  },

  deleteWarehouse: async (id: number): Promise<any> => {
    const response = await api.delete(`/warehouses/${id}`);
    return response.data;
  },

  // Commissions
  getCommissions: async (): Promise<Commission[]> => {
    const response = await api.get('/commissions');
    return response.data.commissions;
  },

  createCommission: async (commission: CommissionCreate): Promise<any> => {
    const response = await api.post('/commissions', commission);
    return response.data;
  },

  updateCommission: async (id: number, commission: CommissionCreate): Promise<any> => {
    const response = await api.put(`/commissions/${id}`, commission);
    return response.data;
  },

  deleteCommission: async (id: number): Promise<any> => {
    const response = await api.delete(`/commissions/${id}`);
    return response.data;
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    const response = await api.get('/customers');
    return response.data.customers;
  },

  createCustomer: async (customer: CustomerCreate): Promise<any> => {
    const response = await api.post('/customers', customer);
    return response.data;
  },

  updateCustomer: async (id: number, customer: CustomerCreate): Promise<any> => {
    const response = await api.put(`/customers/${id}`, customer);
    return response.data;
  },

  deleteCustomer: async (id: number): Promise<any> => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  // Customer Quotes
  getCustomerQuotes: async (customerId: number): Promise<Quote[]> => {
    const response = await api.get(`/customers/${customerId}/quotes`);
    return response.data.quotes;
  },

  // Customer Projects
  getCustomerProjects: async (customerId: number): Promise<Project[]> => {
    const response = await api.get(`/customers/${customerId}/projects`);
    return response.data.projects;
  },

  // Customer Accounts
  getCustomerAccounts: async (customerId: number): Promise<CustomerAccount[]> => {
    const response = await api.get(`/customers/${customerId}/accounts`);
    return response.data.accounts;
  },

  // Suppliers
  getSuppliers: async (): Promise<Supplier[]> => {
    const response = await api.get('/suppliers');
    return response.data.suppliers;
  },

  createSupplier: async (supplier: SupplierCreate): Promise<any> => {
    const response = await api.post('/suppliers', supplier);
    return response.data;
  },

  updateSupplier: async (id: number, supplier: SupplierCreate): Promise<any> => {
    const response = await api.put(`/suppliers/${id}`, supplier);
    return response.data;
  },

  deleteSupplier: async (id: number): Promise<any> => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  },

  // Quotes
  getQuotes: async (): Promise<Quote[]> => {
    const response = await api.get('/quotes');
    return response.data.quotes;
  },

  createQuote: async (quote: Omit<Quote, 'id' | 'customer_name' | 'engineer_name' | 'salesman_name' | 'created_at' | 'updated_at'>): Promise<any> => {
    const response = await api.post('/quotes', quote);
    return response.data;
  },

  updateQuote: async (id: number, quote: Omit<Quote, 'id' | 'customer_name' | 'engineer_name' | 'salesman_name' | 'created_at' | 'updated_at'>): Promise<any> => {
    const response = await api.put(`/quotes/${id}`, quote);
    return response.data;
  },

  deleteQuote: async (id: number): Promise<any> => {
    const response = await api.delete(`/quotes/${id}`);
    return response.data;
  },

  getQuote: async (id: number): Promise<Quote> => {
    const response = await api.get(`/quotes/${id}`);
    return response.data.quote;
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data.projects;
  },

  createProject: async (project: Omit<Project, 'id' | 'customer_name' | 'engineer_name' | 'salesman_name' | 'created_at' | 'updated_at'>): Promise<any> => {
    const response = await api.post('/projects', project);
    return response.data;
  },

  updateProject: async (id: number, project: Omit<Project, 'id' | 'customer_name' | 'engineer_name' | 'salesman_name' | 'created_at' | 'updated_at'>): Promise<any> => {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  },

  deleteProject: async (id: number): Promise<any> => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  getProject: async (id: number): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data.project;
  },

  // Accounts
  getAccounts: async (): Promise<CustomerAccount[]> => {
    const response = await api.get('/accounts');
    return response.data.accounts;
  },

  createAccount: async (account: Omit<CustomerAccount, 'id' | 'customer_name' | 'project_name' | 'created_at' | 'updated_at'>): Promise<any> => {
    const response = await api.post('/accounts', account);
    return response.data;
  },

  updateAccount: async (id: number, account: Omit<CustomerAccount, 'id' | 'customer_name' | 'project_name' | 'created_at' | 'updated_at'>): Promise<any> => {
    const response = await api.put(`/accounts/${id}`, account);
    return response.data;
  },

  deleteAccount: async (id: number): Promise<any> => {
    const response = await api.delete(`/accounts/${id}`);
    return response.data;
  },

  getAccount: async (id: number): Promise<CustomerAccount> => {
    const response = await api.get(`/accounts/${id}`);
    return response.data.account;
  },
};

// Pagination interfaces
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default api;
