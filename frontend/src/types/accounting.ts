/**
 * Accounting-related type definitions
 */
import type { BaseEntity } from './common';

export interface AccountType extends BaseEntity {
  name: string;
  description?: string;
}

export interface AccountTypeCreate {
  name: string;
  description?: string;
}

export interface ChartOfAccount extends BaseEntity {
  number: string;
  description: string;
  inactive: boolean;
  sub_account?: string;
  type_id: number;
  currency_id?: number;
}

export interface ChartOfAccountCreate {
  number: string;
  description: string;
  inactive: boolean;
  sub_account?: string;
  type_id: number;
  currency_id?: number;
}

export interface Currency extends BaseEntity {
  currency: string;
  rate: number;
  effective_date: string;
}

export interface CurrencyCreate {
  currency: string;
  rate: number;
  effective_date: string;
}
