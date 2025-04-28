// This environment file defines configuration variables for different environments
// It's used to store API endpoints, feature flags, and other environment-specific settings

export const environment = {
  production: false,
  
  // API endpoints based on the Spring Boot backend controller paths
  apiUrl: '/api',
  
  // Todo-specific endpoints derived from TodoRestController
  todoEndpoints: {
    base: '/api/todos',
    getAll: '/api/todos',
    getById: '/api/todos/', // append ID
    getSorted: '/api/todos/', // append sortType/sortOrder/page
    create: '/api/todos',
    update: '/api/todos/', // append ID
    delete: '/api/todos/', // append ID
    toggleStatus: '/api/todos/', // append ID + '/toggle'
    bulk: {
      get: '/api/todos/bulk',
      complete: '/api/todos/bulk/complete',
      delete: '/api/todos/bulk/delete'
    }
  },
  
  // Pagination defaults
  pagination: {
    defaultPageSize: 10,
    defaultSortField: 'createdDate',
    defaultSortOrder: 'desc'
  },
  
  // Feature flags
  features: {
    enableBulkOperations: true,
    enableSorting: true
  },
  
  // Logging configuration
  logging: {
    level: 'debug', // 'debug', 'info', 'warn', 'error'
    enableHttpLogging: true
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.