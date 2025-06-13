/**
 * Central export point for all API services
 * Maintains backward compatibility with the original apiService
 */

// Import all services
import { userService } from './user.service';
import { accountingService } from './accounting.service';
import { businessService } from './business.service';
import { customerService } from './customer.service';
import { projectService } from './project.service';
import { fileService } from './file.service';
import { healthService } from './health.service';

// Export individual services for modular imports
export { userService } from './user.service';
export { accountingService } from './accounting.service';
export { businessService } from './business.service';
export { customerService } from './customer.service';
export { projectService } from './project.service';
export { fileService } from './file.service';
export { healthService } from './health.service';
export { default as apiClient } from './api-client';

// Backward compatibility: Combined apiService object
export const apiService = {
  // Health check
  ...healthService,

  // File upload
  ...fileService,

  // Users
  ...userService,

  // Account Types & Chart of Accounts & Currencies
  ...accountingService,

  // Departments, Locations, Manufacturers, Teams, Warehouses, Commissions
  ...businessService,

  // Customers & Suppliers
  ...customerService,

  // Quotes, Projects, Accounts
  ...projectService,
};

// Default export for backward compatibility
export default apiService;
