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
    const response = await apiClient.get('/settings/departments');
    return response.data.departments;
  },

  createDepartment: async (department: DepartmentCreate): Promise<any> => {
    const response = await apiClient.post('/settings/departments', department);
    return response.data;
  },

  updateDepartment: async (id: number, department: DepartmentCreate): Promise<any> => {
    const response = await apiClient.put(`/settings/departments/${id}`, department);
    return response.data;
  },

  deleteDepartment: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/settings/departments/${id}`);
    return response.data;
  },

  // Locations
  getLocations: async (): Promise<Location[]> => {
    const response = await apiClient.get('/settings/locations');
    return response.data.locations || [];
  },

  createLocation: async (location: LocationCreate): Promise<any> => {
    const response = await apiClient.post('/settings/locations', location);
    return response.data;
  },

  updateLocation: async (id: number, location: LocationCreate): Promise<any> => {
    const response = await apiClient.put(`/settings/locations/${id}`, location);
    return response.data;
  },

  deleteLocation: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/settings/locations/${id}`);
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
    const response = await apiClient.get('/settings/teams');
    return response.data.teams || [];
  },

  createTeam: async (team: TeamCreate): Promise<any> => {
    const response = await apiClient.post('/settings/teams', team);
    return response.data;
  },

  updateTeam: async (id: number, team: TeamCreate): Promise<any> => {
    const response = await apiClient.put(`/settings/teams/${id}`, team);
    return response.data;
  },

  deleteTeam: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/settings/teams/${id}`);
    return response.data;
  },

  // Warehouses
  getWarehouses: async (): Promise<Warehouse[]> => {
    const response = await apiClient.get('/settings/warehouses');
    return response.data.warehouses || [];
  },

  createWarehouse: async (warehouse: WarehouseCreate): Promise<any> => {
    const response = await apiClient.post('/settings/warehouses', warehouse);
    return response.data;
  },

  updateWarehouse: async (id: number, warehouse: WarehouseCreate): Promise<any> => {
    const response = await apiClient.put(`/settings/warehouses/${id}`, warehouse);
    return response.data;
  },

  deleteWarehouse: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/settings/warehouses/${id}`);
    return response.data;
  },

  // Commissions
  getCommissions: async (): Promise<Commission[]> => {
    const response = await apiClient.get('/settings/commissions');
    return response.data.commissions || [];
  },

  createCommission: async (commission: CommissionCreate): Promise<any> => {
    const response = await apiClient.post('/settings/commissions', commission);
    return response.data;
  },

  updateCommission: async (id: number, commission: CommissionCreate): Promise<any> => {
    const response = await apiClient.put(`/settings/commissions/${id}`, commission);
    return response.data;
  },

  deleteCommission: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/settings/commissions/${id}`);
    return response.data;
  },
};
