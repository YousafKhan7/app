/**
 * Business-related type definitions
 */
import type { BaseEntity } from './common';

export interface Department extends BaseEntity {
  number: string;
  name: string;
}

export interface DepartmentCreate {
  number: string;
  name: string;
}

export interface Location extends BaseEntity {
  number: string;
  name: string;
}

export interface LocationCreate {
  number: string;
  name: string;
}

export interface Manufacturer extends BaseEntity {
  name: string;
  logo_file?: string;
  sorting: number;
}

export interface ManufacturerCreate {
  name: string;
  logo_file?: string;
  sorting: number;
}

export interface Team extends BaseEntity {
  name: string;
  description?: string;
}

export interface TeamCreate {
  name: string;
  description?: string;
}

export interface Warehouse extends BaseEntity {
  warehouse_name: string;
  number: string;
  markup: number;
}

export interface WarehouseCreate {
  warehouse_name: string;
  number: string;
  markup: number;
}

export interface Commission extends BaseEntity {
  type: string;
  percentage: number;
  gp: boolean;
  sales: boolean;
  commercial_billing: boolean;
  payment: boolean;
}

export interface CommissionCreate {
  type: string;
  percentage: number;
  gp: boolean;
  sales: boolean;
  commercial_billing: boolean;
  payment: boolean;
}
