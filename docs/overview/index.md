# FusionKit Overview

## Table of Contents

- [What is FusionKit?](#what-is-fusionkit)
- [Core Concepts](#core-concepts)
- [Architecture](#architecture)
- [Deployment Scenarios](#deployment-scenarios)
- [Key Features](#key-features)
- [Value Proposition](#value-proposition)

## What is FusionKit?

The **FusionKit** is a foundational library designed to standardize and streamline the development of both standalone applications and microfrontend applications. It provides a comprehensive suite of services, utilities, and patterns that enable developers to build scalable, maintainable, and feature-rich frontends with consistent behavior across applications.

## Core Concepts

### Standardization First

FusionKit promotes consistency across different frontend applications by providing:
- Reusable services and utilities
- Standardized patterns and interfaces
- Consistent authentication and configuration management
- Unified logging and user feedback mechanisms

### Security by design
- Encrypted SessionStorage
- Sanitization
- EsLint Plugin

### Microfrontend Architecture

FusionKit simplifies the creation and integration of microfrontends by offering:
- Tools for creating and managing microfrontend applications
- Frame adapters for seamless communication between shell and microfrontends
- Service sharing and inheritance mechanisms
- Module federation support with health monitoring

### Framework Agnostic Design

While providing specific implementations for popular frameworks, FusionKit maintains a framework-agnostic core:
- Support for Angular, React, and Vue through the CLI
- Adapter pattern for UI framework integration
- Consistent API across different technology stacks

## Architecture

FusionKit follows a modular architecture with several key components:

### Core Library (`fusion-kit-core`)
The foundation providing:
- **FusionApp**: Central application instance managing services and state
- **ServiceManager**: Centralized service registration and retrieval
- **ConfigurationManager**: Unified configuration loading and management
- **EncryptedSessionStorage**: Secure client-side data storage
- **UserFeedback**: Framework-agnostic user notification system
- **ConsoleLogger**: Structured logging with level filtering

### Authentication Providers
Multiple authentication implementations:
- **Keycloak** (`fusion-kit-keycloak`): Enterprise identity management
- **Auth0** (`fusion-kit-auth0`): Cloud-based authentication service
- **Entra (Beta)** (`fusion-kit-entra`): Microsoft identity platform

### Development Tools
- **CLI** (`fusion-kit-cli`): Project scaffolding and setup automation
- **Module Federation** (`fusion-kit-module-federation`): Remote module management
- **Contracts** (`fusion-kit-contracts`): Shared interfaces and types

## Deployment Scenarios

### Standalone Applications

In standalone mode, applications:
- Run independently with their own service instances
- Initialize their own authentication and configuration
- Have complete control over their dependencies
- Can be deployed and scaled independently

```typescript
// Standalone application setup
const fusionApp = await new FusionAppBuilder()
  .withName('my-standalone-app')
  .withAuth(new KeyCloakService(authConfig))
  .withConfigManager(configurationManager)
  .withLogger(new ConsoleLogger(LoggerOptions.INFO))
  .build();
```

### Microfrontends in a Shell

When running as microfrontends:
- Automatically inherit shared services from the shell
- Reduce resource overhead through service reuse
- Maintain consistent behavior across modules
- Enable seamless communication through frame adapters

```typescript
async mount(container: string | HTMLElement, moduleConfiguration?: ModuleConfiguration): Promise<void> {
...
 const builder = await new FusionAppBuilder()
      .withName('my-remote-app')
      .withAuth(moduleConfiguration.authService)
      .withLogger( moduleConfiguration.logger)
      .withEncryptedStorage(moduleConfiguration.encryptedStorage )
      .withUserFeedbackService(moduleConfiguration.userfeedback);
      builder.build()
...
}
```

## Key Features

### Configuration Management
- JSON configuration file loading from URLs or directories
- Bearer token authentication for protected endpoints
- Type-safe configuration retrieval with generics
- Automatic caching and timeout handling

### Encrypted Storage
- AES encryption for sensitive browser storage
- Automatic JSON serialization/deserialization
- Namespace isolation for shared environments
- Type-safe retrieval with generic support

### User Feedback Services
- Unified interface for notifications, toasts, and message boxes
- Framework-agnostic through adapter pattern
- Support for multiple message types and severity levels
- Integration with microfrontend frame communication

### Service Management
- Type-safe service registration and retrieval
- Unique service identification and conflict prevention
- Dynamic service removal for cleanup and hot-swapping
- Central service registry for application-wide access

### Application State Management
- Built-in busy state management with callbacks
- Frame adapter registration for cross-frame communication
- State change notifications for UI updates
- Validation and logging for debugging

### Authentication Services
- Multiple provider support (Keycloak, Auth0, Entra)
- Token validation and refresh capabilities
- Consistent interface across different providers
- Framework-specific extensions where needed

### Logging
- Hierarchical log levels with filtering
- Structured JSON output with timestamps
- Color-coded console output for development
- Level-based filtering for different environments

## Value Proposition

### For Development Teams

- **Faster Development**: Focus on business logic instead of infrastructure
- **Consistency**: Standardized patterns across all applications
- **Maintainability**: Centralized updates and consistent behavior
- **Scalability**: Proven patterns for growing application portfolios

### For Organizations

- **Reduced Costs**: Less duplication of effort across teams
- **Risk Mitigation**: Battle-tested patterns and security practices
- **Flexibility**: Support for multiple frameworks and deployment models
- **Future-Proofing**: Modular architecture allows for incremental adoption

### For Architects

- **Standardization**: Consistent architecture across projects
- **Modularity**: Clean separation of concerns and dependencies
- **Integration**: Seamless microfrontend communication and service sharing
- **Monitoring**: Built-in health checks and logging for operational insights

The FusionKit ecosystem empowers teams to build modern, scalable frontend applications while maintaining consistency, security, and developer productivity across the entire application portfolio.