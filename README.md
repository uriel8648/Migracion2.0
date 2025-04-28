# Angular 12 Todo Application

## Introduction

This project is a fully migrated Angular 12 Todo application, previously built with AngularJS 1.x. The application provides a modern, component-based architecture with TypeScript support, improved performance, and better maintainability.

The application allows users to:
- View a list of todos with sorting and pagination
- Create new todos
- Edit existing todos
- Delete todos
- View detailed information about a specific todo
- Toggle todo completion status
- Perform bulk operations (complete/delete multiple todos)

## Directory Structure

```
frontend/
├── angular.json             # Angular CLI configuration
├── package.json             # NPM dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── proxy.conf.json          # Development proxy configuration
├── src/
│   ├── index.html           # Main HTML entry point
│   ├── main.ts              # Application bootstrap
│   ├── styles.scss          # Global styles
│   ├── polyfills.ts         # Browser polyfills
│   ├── assets/              # Static assets (images, icons)
│   ├── environments/        # Environment configuration
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── app/
│       ├── app.component.ts         # Root component
│       ├── app.component.html
│       ├── app.component.scss
│       ├── app.module.ts            # Root module
│       ├── app-routing.module.ts    # Application routes
│       ├── models/                  # Data models
│       │   └── todo.model.ts
│       ├── services/                # Services
│       │   └── todo.service.ts
│       ├── components/              # Feature components
│       │   ├── todo-list/
│       │   ├── todo-form/
│       │   └── todo-detail/
│       ├── shared/                  # Shared module (pipes, directives)
│       │   └── shared.module.ts
│       └── core/                    # Core module (singleton services)
│           ├── core.module.ts
│           └── http-interceptors/
│               └── api-prefix.interceptor.ts
└── e2e/                     # End-to-end tests
```

## Setup Instructions

### Prerequisites

- Node.js (v14.x or later)
- npm (v6.x or later)
- Angular CLI 12.x (`npm install -g @angular/cli@12`)

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Development Workflow

### Development Server

Run the development server with API proxy configuration:

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Build

Build the project for production:

```bash
ng build --prod
```

The build artifacts will be stored in the `dist/` directory.

### Running Tests

#### Unit Tests

```bash
ng test
```

This will execute the unit tests via [Karma](https://karma-runner.github.io).

#### End-to-End Tests

```bash
ng e2e
```

This will execute the end-to-end tests via [Cypress](https://www.cypress.io/).

## Migration Notes

### Key Changes from AngularJS

1. **Component Architecture**: Replaced AngularJS controllers and $scope with Angular components
2. **TypeScript**: Added strong typing throughout the application
3. **RxJS**: Replaced promise-based HTTP calls with Observable streams
4. **Routing**: Implemented Angular Router with route parameters and guards
5. **Forms**: Migrated from ng-model to Reactive Forms
6. **HTTP**: Replaced $http with HttpClient
7. **Dependency Injection**: Updated to Angular's hierarchical DI system
8. **Modules**: Organized code into feature, shared, and core modules

### Limitations and Challenges

- The original JSP templates have been completely replaced with Angular components
- Server-side rendering is no longer used; all rendering happens client-side
- The application now requires JavaScript to function (no progressive enhancement)
- CORS must be properly configured on the backend to allow API requests

## Angular 12 Features Implemented

- **Strict Mode**: Enabled TypeScript's strict mode for better type safety
- **Ivy Renderer**: Utilizing Angular's Ivy rendering engine for smaller bundle size
- **Standalone Components**: Some components are implemented as standalone (where appropriate)
- **Lazy Loading**: Routes are lazy-loaded for better initial load performance
- **HttpClient**: Using the modern HttpClient with interceptors for API requests
- **Angular Material**: Integrated for UI components (optional)
- **Reactive Forms**: Using FormBuilder and validators for form handling

## Required Manual Changes

Before running the application, you need to make the following changes:

1. **Environment Configuration**: Update the API URL in `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8080/api'
   };
   ```

2. **Proxy Configuration**: Verify the proxy settings in `proxy.conf.json` match your backend:
   ```json
   {
     "/api": {
       "target": "http://localhost:8080",
       "secure": false
     }
   }
   ```

3. **Package.json Scripts**: Ensure the following scripts are present:
   ```json
   "scripts": {
     "ng": "ng",
     "start": "ng serve --proxy-config proxy.conf.json",
     "build": "ng build",
     "watch": "ng build --watch --configuration development",
     "test": "ng test"
   }
   ```

4. **Backend Configuration**: Update your Spring MVC configuration to:
   - Allow CORS requests from Angular's development server
   - Serve the Angular application from `/static/`
   - Forward all non-API routes to `index.html`

## Troubleshooting

### Common Issues

1. **API 404 Errors**
   - Verify proxy configuration is correct
   - Check that backend API endpoints match the paths used in the service

2. **CORS Errors**
   - Add appropriate CORS headers to your Spring MVC configuration
   - Ensure the proxy is correctly configured for development

3. **Routing Issues**
   - Verify that your Spring MVC configuration forwards unknown routes to `index.html`
   - Check for route path typos in the Angular routing module

4. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check TypeScript errors and fix any type issues

## Deployment

### Building for Production

```bash
ng build --prod
```

### Deploying to the Backend

1. Copy the contents of `dist/todo-ui/` to `backend/src/main/webapp/static/`
2. Configure Spring MVC to serve static assets from this directory
3. Add a catch-all route in Spring MVC to serve `index.html` for unknown paths

### Spring MVC Configuration

Add the following to your Spring MVC configuration:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**")
                .addResourceLocations("/static/");
    }

    @Controller
    static class RouterController {
        @RequestMapping(value = "/**/{path:[^\\.]*}")
        public String redirectToIndex() {
            return "forward:/static/index.html";
        }
    }
}
```

## Testing Procedures

### Unit Testing Strategy

1. **Services**: Test all HTTP methods with HttpTestingController
2. **Components**: Test rendering, user interactions, and state changes
3. **Pipes and Directives**: Test transformation and DOM manipulation
4. **Guards and Resolvers**: Test route protection and data fetching

### E2E Testing Scenarios

1. **Todo List**: Verify sorting, pagination, and filtering
2. **Todo Creation**: Test form validation and submission
3. **Todo Editing**: Test loading existing data and updating
4. **Todo Deletion**: Test confirmation and removal from list
5. **Navigation**: Test routing between different views

### Test Commands

Run specific test files:
```bash
ng test --include=**/todo.service.spec.ts
```

Run tests with code coverage:
```bash
ng test --code-coverage
```

---

This README provides a comprehensive guide to the migrated Angular 12 Todo application. For further assistance or to report issues, please contact the development team.