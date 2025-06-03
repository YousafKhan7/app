import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserCreate {
  name: string;
  email: string;
}

export interface ChartOfAccount {
  id: number;
  number: string;
  description: string;
  inactive: boolean;
  sub_account?: string;
  type: string;
  currency_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChartOfAccountCreate {
  number: string;
  description: string;
  inactive: boolean;
  sub_account?: string;
  type: string;
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
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data.users;
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
};

export default api;
