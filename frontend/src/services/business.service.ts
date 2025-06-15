/**
 * Business-related API service
 */
import apiClient from './api-client';
import type { 
  Department, 
  DepartmentCreate,
  Location,
  LocationCreate,
  Manufacturer,
  ManufacturerCreate,
  Team,
  TeamCreate,
  Warehouse,
  WarehouseCreate,
  Commission,
  CommissionCreate
} from '../types';

export const businessService = {
  // Departments
  getDepartments: async (): Promise<Department[]> => {
    const response = await apiClient.get('/departments');
    return response.data.departments;
  },

  createDepartment: async (department: DepartmentCreate): Promise<any> => {
    const response = await apiClient.post('/departments', department);
    return response.data;
  },

  updateDepartment: async (id: number, department: DepartmentCreate): Promise<any> => {
    const response = await apiClient.put(`/departments/${id}`, department);
    return response.data;
  },

  deleteDepartment: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/departments/${id}`);
    return response.data;
  },

  // Locations
  getLocations: async (): Promise<Location[]> => {
    const response = await apiClient.get('/locations');
    return response.data.locations;
  },

  createLocation: async (location: LocationCreate): Promise<any> => {
    const response = await apiClient.post('/locations', location);
    return response.data;
  },

  updateLocation: async (id: number, location: LocationCreate): Promise<any> => {
    const response = await apiClient.put(`/locations/${id}`, location);
    return response.data;
  },

  deleteLocation: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/locations/${id}`);
    return response.data;
  },

  // Manufacturers
  getManufacturers: async (): Promise<Manufacturer[]> => {
    const response = await apiClient.get('/settings/manufacturers');
    return response.data.manufacturers;
  },

  createManufacturer: async (manufacturer: ManufacturerCreate): Promise<any> => {
    const response = await apiClient.post('/settings/manufacturers', manufacturer);
    return response.data;
  },

  updateManufacturer: async (id: number, manufacturer: ManufacturerCreate): Promise<any> => {
    const response = await apiClient.put(`/settings/manufacturers/${id}`, manufacturer);
    return response.data;
  },

  deleteManufacturer: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/settings/manufacturers/${id}`);
    return response.data;
  },

  // Teams
  getTeams: async (): Promise<Team[]> => {
    const response = await apiClient.get('/teams');
    return response.data.teams;
  },

  createTeam: async (team: TeamCreate): Promise<any> => {
    const response = await apiClient.post('/teams', team);
    return response.data;
  },

  updateTeam: async (id: number, team: TeamCreate): Promise<any> => {
    const response = await apiClient.put(`/teams/${id}`, team);
    return response.data;
  },

  deleteTeam: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/teams/${id}`);
    return response.data;
  },

  // Warehouses
  getWarehouses: async (): Promise<Warehouse[]> => {
    const response = await apiClient.get('/warehouses');
    return response.data.warehouses;
  },

  createWarehouse: async (warehouse: WarehouseCreate): Promise<any> => {
    const response = await apiClient.post('/warehouses', warehouse);
    return response.data;
  },

  updateWarehouse: async (id: number, warehouse: WarehouseCreate): Promise<any> => {
    const response = await apiClient.put(`/warehouses/${id}`, warehouse);
    return response.data;
  },

  deleteWarehouse: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/warehouses/${id}`);
    return response.data;
  },

  // Commissions
  getCommissions: async (): Promise<Commission[]> => {
    const response = await apiClient.get('/commissions');
    return response.data.commissions;
  },

  createCommission: async (commission: CommissionCreate): Promise<any> => {
    const response = await apiClient.post('/commissions', commission);
    return response.data;
  },

  updateCommission: async (id: number, commission: CommissionCreate): Promise<any> => {
    const response = await apiClient.put(`/commissions/${id}`, commission);
    return response.data;
  },

  deleteCommission: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/commissions/${id}`);
    return response.data;
  },
};
