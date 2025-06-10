/**
 * Project, Quote, and Account API service
 */
import apiClient from './api-client';
import type { 
  Quote,
  QuoteCreate,
  Project,
  ProjectCreate,
  CustomerAccount,
  CustomerAccountCreate
} from '../types';

export const projectService = {
  // Quotes
  getQuotes: async (): Promise<Quote[]> => {
    const response = await apiClient.get('/quotes');
    return response.data.quotes;
  },

  createQuote: async (quote: QuoteCreate): Promise<any> => {
    const response = await apiClient.post('/quotes', quote);
    return response.data;
  },

  updateQuote: async (id: number, quote: QuoteCreate): Promise<any> => {
    const response = await apiClient.put(`/quotes/${id}`, quote);
    return response.data;
  },

  deleteQuote: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/quotes/${id}`);
    return response.data;
  },

  getQuote: async (id: number): Promise<Quote> => {
    const response = await apiClient.get(`/quotes/${id}`);
    return response.data.quote;
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    const response = await apiClient.get('/projects');
    return response.data.projects;
  },

  createProject: async (project: ProjectCreate): Promise<any> => {
    const response = await apiClient.post('/projects', project);
    return response.data;
  },

  updateProject: async (id: number, project: ProjectCreate): Promise<any> => {
    const response = await apiClient.put(`/projects/${id}`, project);
    return response.data;
  },

  deleteProject: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },

  getProject: async (id: number): Promise<Project> => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data.project;
  },

  // Customer Accounts
  getAccounts: async (): Promise<CustomerAccount[]> => {
    const response = await apiClient.get('/accounts');
    return response.data.accounts;
  },

  createAccount: async (account: CustomerAccountCreate): Promise<any> => {
    const response = await apiClient.post('/accounts', account);
    return response.data;
  },

  updateAccount: async (id: number, account: CustomerAccountCreate): Promise<any> => {
    const response = await apiClient.put(`/accounts/${id}`, account);
    return response.data;
  },

  deleteAccount: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/accounts/${id}`);
    return response.data;
  },

  getAccount: async (id: number): Promise<CustomerAccount> => {
    const response = await apiClient.get(`/accounts/${id}`);
    return response.data.account;
  },
};
