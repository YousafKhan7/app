/**
 * React Query hooks for API calls with caching and optimistic updates
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../api';
import type {
  User, UserCreate,
  Customer, CustomerCreate,
  Supplier, SupplierCreate,

  PaginationParams, PaginatedResponse
} from '../api';

// Query Keys
export const queryKeys = {
  users: ['users'] as const,
  activeUsersCount: ['users', 'active-count'] as const,
  customers: ['customers'] as const,
  suppliers: ['suppliers'] as const,
  currencies: ['currencies'] as const,
  departments: ['departments'] as const,
  locations: ['locations'] as const,
  teams: ['teams'] as const,
  warehouses: ['warehouses'] as const,
  commissions: ['commissions'] as const,
  quotes: ['quotes'] as const,
  projects: ['projects'] as const,
  accounts: ['accounts'] as const,
  customerQuotes: (customerId: number) => ['customers', customerId, 'quotes'] as const,
  customerProjects: (customerId: number) => ['customers', customerId, 'projects'] as const,
  customerAccounts: (customerId: number) => ['customers', customerId, 'accounts'] as const,
};

// Users Queries
export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => apiService.getUsers() as Promise<User[]>,
  });
};

export const useActiveUsersCount = () => {
  return useQuery({
    queryKey: queryKeys.activeUsersCount,
    queryFn: apiService.getActiveUsersCount,
  });
};

// Paginated Users Query
export const usePaginatedUsers = (params: PaginationParams) => {
  return useQuery({
    queryKey: [...queryKeys.users, 'paginated', params],
    queryFn: () => apiService.getUsers(params) as Promise<PaginatedResponse<User>>,
  });
};

// Users Mutations
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiService.createUser,
    onMutate: async (newUser) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users });

      // Snapshot previous value
      const previousUsers = queryClient.getQueryData<User[]>(queryKeys.users);

      // Optimistically update
      if (previousUsers) {
        const optimisticUser: User = {
          id: Date.now(), // Temporary ID
          ...newUser,
        };
        queryClient.setQueryData<User[]>(queryKeys.users, [...previousUsers, optimisticUser]);
      }

      return { previousUsers };
    },
    onError: (err, context: any) => {
      console.error(err);
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKeys.users, context.previousUsers);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeUsersCount });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, user }: { id: number; user: UserCreate }) =>
      apiService.updateUser(id, user),
    onMutate: async ({ id, user }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users });

      const previousUsers = queryClient.getQueryData<User[]>(queryKeys.users);

      // Optimistically update
      if (previousUsers) {
        const updatedUsers = previousUsers.map(u =>
          u.id === id ? { ...u, ...user } : u
        );
        queryClient.setQueryData<User[]>(queryKeys.users, updatedUsers);
      }

      return { previousUsers };
    },
    onError: (err, context: any) => {
      console.error(err);
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKeys.users, context.previousUsers);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeUsersCount });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.deleteUser,
    onMutate: async (userId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users });
      
      // Snapshot previous value
      const previousUsers = queryClient.getQueryData<User[]>(queryKeys.users);
      
      // Optimistically update
      if (previousUsers) {
        queryClient.setQueryData<User[]>(
          queryKeys.users,
          previousUsers.filter(user => user.id !== userId)
        );
      }
      
      return { previousUsers };
    },
    onError: (err, context: any) => {
      console.error(err);
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKeys.users, context.previousUsers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeUsersCount });
    },
  });
};

// Customers Queries
export const useCustomers = () => {
  return useQuery({
    queryKey: queryKeys.customers,
    queryFn: apiService.getCustomers,
  });
};

// Customers Mutations
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiService.createCustomer,
    onMutate: async (newCustomer) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.customers });

      const previousCustomers = queryClient.getQueryData<Customer[]>(queryKeys.customers);

      if (previousCustomers) {
        const optimisticCustomer: Customer = {
          id: Date.now(),
          ...newCustomer,
          sales_rep_name: undefined,
          currency_name: undefined,
        };
        queryClient.setQueryData<Customer[]>(queryKeys.customers, [...previousCustomers, optimisticCustomer]);
      }

      return { previousCustomers };
    },
    onError: (err, context: any) => {
      console.error(err);
      if (context?.previousCustomers) {
        queryClient.setQueryData(queryKeys.customers, context.previousCustomers);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, customer }: { id: number; customer: CustomerCreate }) => 
      apiService.updateCustomer(id, customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.deleteCustomer,
    onMutate: async (customerId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.customers });
      
      const previousCustomers = queryClient.getQueryData<Customer[]>(queryKeys.customers);
      
      if (previousCustomers) {
        queryClient.setQueryData<Customer[]>(
          queryKeys.customers,
          previousCustomers.filter(customer => customer.id !== customerId)
        );
      }
      
      return { previousCustomers };
    },
    onError: (err, context: any) => {
      console.error(err);
      if (context?.previousCustomers) {
        queryClient.setQueryData(queryKeys.customers, context.previousCustomers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
    },
  });
};

// Suppliers Queries
export const useSuppliers = () => {
  return useQuery({
    queryKey: queryKeys.suppliers,
    queryFn: apiService.getSuppliers,
  });
};

// Suppliers Mutations
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, supplier }: { id: number; supplier: SupplierCreate }) => 
      apiService.updateSupplier(id, supplier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.deleteSupplier,
    onMutate: async (supplierId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.suppliers });
      
      const previousSuppliers = queryClient.getQueryData<Supplier[]>(queryKeys.suppliers);
      
      if (previousSuppliers) {
        queryClient.setQueryData<Supplier[]>(
          queryKeys.suppliers,
          previousSuppliers.filter(supplier => supplier.id !== supplierId)
        );
      }
      
      return { previousSuppliers };
    },
    onError: (err, context: any) => {
      console.error(err);
      if (context?.previousSuppliers) {
        queryClient.setQueryData(queryKeys.suppliers, context.previousSuppliers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
    },
  });
};

// Other Queries (for dropdowns and reference data)
export const useCurrencies = () => {
  return useQuery({
    queryKey: queryKeys.currencies,
    queryFn: apiService.getCurrencies,
    staleTime: 30 * 60 * 1000, // 30 minutes - currencies don't change often
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: queryKeys.departments,
    queryFn: apiService.getDepartments,
    staleTime: 30 * 60 * 1000,
  });
};

export const useLocations = () => {
  return useQuery({
    queryKey: queryKeys.locations,
    queryFn: apiService.getLocations,
    staleTime: 30 * 60 * 1000,
  });
};

export const useTeams = () => {
  return useQuery({
    queryKey: queryKeys.teams,
    queryFn: apiService.getTeams,
    staleTime: 30 * 60 * 1000,
  });
};

export const useWarehouses = () => {
  return useQuery({
    queryKey: queryKeys.warehouses,
    queryFn: apiService.getWarehouses,
    staleTime: 30 * 60 * 1000,
  });
};

export const useCommissions = () => {
  return useQuery({
    queryKey: queryKeys.commissions,
    queryFn: apiService.getCommissions,
    staleTime: 30 * 60 * 1000,
  });
};

// Quotes Queries
export const useQuotes = () => {
  return useQuery({
    queryKey: queryKeys.quotes,
    queryFn: apiService.getQuotes,
  });
};

// Projects Queries
export const useProjects = () => {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: apiService.getProjects,
  });
};

// Accounts Queries
export const useAccounts = () => {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: apiService.getAccounts,
  });
};

// Customer-specific queries
export const useCustomerQuotes = (customerId: number) => {
  return useQuery({
    queryKey: queryKeys.customerQuotes(customerId),
    queryFn: () => apiService.getCustomerQuotes(customerId),
    enabled: !!customerId,
  });
};

export const useCustomerProjects = (customerId: number) => {
  return useQuery({
    queryKey: queryKeys.customerProjects(customerId),
    queryFn: () => apiService.getCustomerProjects(customerId),
    enabled: !!customerId,
  });
};

export const useCustomerAccounts = (customerId: number) => {
  return useQuery({
    queryKey: queryKeys.customerAccounts(customerId),
    queryFn: () => apiService.getCustomerAccounts(customerId),
    enabled: !!customerId,
  });
};
