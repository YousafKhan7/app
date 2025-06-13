/**
 * Customer and Supplier type definitions
 */
import type { BaseEntity } from './common';

export interface Customer extends BaseEntity {
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

export interface Supplier extends BaseEntity {
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
