/**
 * Project, Quote, and Account type definitions
 */
import type { BaseEntity } from './common';

export interface Quote extends BaseEntity {
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
}

export interface QuoteCreate {
  job_id: string;
  name: string;
  customer_id?: number;
  engineer_id?: number;
  salesman_id?: number;
  date: string;
  sell_price: number;
  status: string;
}

export interface Project extends BaseEntity {
  project_id: string;
  name: string;
  customer_id?: number;
  engineer_id?: number;
  end_user?: string;
  date: string;
  salesman_id?: number;
  status: string;
  customer_name?: string;
  engineer_name?: string;
  salesman_name?: string;
}

export interface ProjectCreate {
  project_id: string;
  name: string;
  customer_id?: number;
  engineer_id?: number;
  end_user?: string;
  date: string;
  salesman_id?: number;
  status: string;
}

export interface CustomerAccount extends BaseEntity {
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
}

export interface CustomerAccountCreate {
  invoice_number: string;
  date: string;
  project_id?: number;
  customer_id?: number;
  name: string;
  amount: number;
  outstanding: number;
  reminder_date?: string;
  comments?: string;
}
