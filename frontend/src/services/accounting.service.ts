/**
 * Accounting-related API service
 */
import apiClient from './api-client';
import type { 
  AccountType, 
  AccountTypeCreate, 
  ChartOfAccount, 
  ChartOfAccountCreate,
  Currency,
  CurrencyCreate 
} from '../types';

export const accountingService = {
  // Account Types
  getAccountTypes: async (): Promise<AccountType[]> => {
    const response = await apiClient.get('/account-types');
    return response.data.account_types;
  },

  createAccountType: async (accountType: AccountTypeCreate): Promise<void> => {
    await apiClient.post('/account-types', accountType);
  },

  // Chart of Accounts
  getChartOfAccounts: async (): Promise<ChartOfAccount[]> => {
    const response = await apiClient.get('/chart-of-accounts');
    return response.data.accounts;
  },

  createChartOfAccount: async (account: ChartOfAccountCreate): Promise<any> => {
    const response = await apiClient.post('/chart-of-accounts', account);
    return response.data;
  },

  updateChartOfAccount: async (id: number, account: ChartOfAccountCreate): Promise<any> => {
    const response = await apiClient.put(`/chart-of-accounts/${id}`, account);
    return response.data;
  },

  deleteChartOfAccount: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/chart-of-accounts/${id}`);
    return response.data;
  },

  // Currencies
  getCurrencies: async (): Promise<Currency[]> => {
    const response = await apiClient.get('/currencies');
    return response.data.currencies;
  },

  createCurrency: async (currency: CurrencyCreate): Promise<any> => {
    const response = await apiClient.post('/currencies', currency);
    return response.data;
  },

  updateCurrency: async (id: number, currency: CurrencyCreate): Promise<any> => {
    const response = await apiClient.put(`/currencies/${id}`, currency);
    return response.data;
  },

  deleteCurrency: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/currencies/${id}`);
    return response.data;
  },
};
