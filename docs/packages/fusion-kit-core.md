# fusion-kit-core

The **FusionKit** is a foundational library designed to standardize and streamline the development of both standalone applications and microfrontend applications. It provides a suite of services, utilities, and patterns that enable developers to build scalable, maintainable, and feature-rich frontends with consistent behavior across applications.

The FusionKit supports two deployment scenarios:
- **Standalone Applications**: Run independently with their own services and configurations
- **Microfrontends in a Shell**: When hosted within a shell application, microfrontends automatically inherit and reuse shared services from the shell, including authentication services, logging, and user feedback services, ensuring consistency and reducing resource overhead

## Table of Contents

- [Purpose](#purpose)
- [Key Features](#key-features)
  - [Configuration Management](#configuration-management)
  - [Encrypted Storage](#encrypted-storage)
  - [User Feedback Services](#user-feedback-services)
  - [Service Management](#service-management)
  - [Application State Management](#application-state-management)
  - [Builder Utilities](#builder-utilities)
  - [Logging](#logging)
  - [Authentication Services](#authentication-services)
  - [Utilities](#utilities)
- [Value Proposition](#value-proposition)
- [Example Use Case](#example-use-case)

## Purpose

The Fusion Kit Core serves two primary purposes:

1. **Standardization**: It provides a set of reusable services and utilities that ensure consistency across different frontend applications. This reduces duplication of work and promotes best practices.
2. **Microfrontend Enablement**: It offers tools and patterns for creating and managing microfrontend applications, making it easier to integrate and coordinate multiple independent modules within a single application.

## Key Features

The Fusion Kit Core includes the [`FusionApp`](../src/core/FusionApp.ts) class, which acts as the backbone for (microfrontend) applications. It provides essential functionalities such as:

- Authentication injection & management
- Configuration handling
- Logging
- User feedback services (e.g. notifications, toasts, and message boxes)
- Service registration and management via ServiceManager
- Application busy state management with callback notifications
- Frame adapter registration for microfrontend communication

### **Configuration Management**

The [`ConfigurationManager`](./src/core/ConfigurationManager.ts) class simplifies the process of loading and managing configuration files. It provides a centralized way to handle application configuration with the following capabilities:

**Core Features:**
- Loading JSON configuration files from a specified directory or URL
- Accessing configuration content by unique identifiers using `getContent<T>(id: string)`
- Handling timeouts and errors during configuration loading with 10-second default timeout
- Optional Bearer token authentication for protected configuration endpoints
- Automatic content caching to prevent duplicate loads of the same configuration
- Type-safe configuration retrieval with generic support
- Custom base URL support for flexible endpoint configuration
- Automatic URL normalization and path handling

**Security:**
- Bearer token authentication through callback mechanism for protected endpoints
- Secure token handling - only sends Authorization header when token is available
- Graceful fallback when authentication is not provided
- Clear logging of authentication status for debugging

**Interface:**
- **Constructor**: `ConfigurationManager(configurationDirectory: string, accessTokenCallback?: () => string | undefined)`
  - `configurationDirectory`: Base directory or URL where configuration files are located (automatically normalized with trailing slash)
  - `accessTokenCallback`: Optional function to provide access tokens for Bearer authentication

- **loadJsonContent()**: `async loadJsonContent(filename: string, id: string, baseUrl?: string): Promise<void>`
  - Loads and caches JSON content from a file with a unique identifier
  - Supports custom base URLs to override the default configuration directory
  - Includes automatic timeout handling (10-second default) and error recovery
  - Skips loading if content with the same ID is already cached
  - Uses Bearer token authentication if callback is provided and returns a token

- **getContent<T>()**: `getContent<T>(id: string): T | undefined`
  - Retrieves previously loaded configuration content by identifier
  - Returns typed content or undefined if not found
  - Generic type support for type-safe configuration access

**Builder Pattern:**
The [`ConfigurationManagerBuilder`](./src/builder/ConfigurationManagerBuilder.ts) provides a fluent API for setting up configuration management:

- **withConfigurationDirectory()**: Sets the base configuration directory
- **withFileToLoad()**: Adds files to be preloaded during build (supports custom base URLs)
- **withAccessTokenCallback()**: Sets the authentication callback for protected endpoints
- **build()**: Creates the ConfigurationManager and preloads all specified files concurrently

### **Encrypted Storage**

The [`EncryptedSessionStorage`](./src/core/EncryptedSessionStorage.ts) class provides secure storage for sensitive data in the browser's `sessionStorage` using AES encryption. It implements a standardized interface for encrypted data persistence with automatic serialization and type safety.

**Core Features:**
- AES encryption using CryptoJS for secure data storage
- Automatic JSON serialization/deserialization for objects
- Type-safe retrieval with generic support
- Key prefixing to avoid storage conflicts (`fusion-kit-` prefix)
- Comprehensive error handling and validation
- Namespace isolation for shared storage scenarios

**Security:**
- Uses AES encryption to protect sensitive data in browser storage
- Validates encryption keys and storage keys for security
- Safely handles encryption/decryption errors without exposing sensitive data

**Interface:**
- **Constructor**: `EncryptedSessionStorage(encryptionKey: string)`
  - Requires a non-empty encryption key for AES encryption
  - Validates key format and throws error for invalid keys

- **setItem()**: `setItem(key: string, value: unknown): void`
  - Encrypts and stores any value (objects are automatically JSON-serialized)
  - Validates key format and handles encryption errors gracefully
  - Adds namespace prefix to prevent storage conflicts

- **getItem<T>()**: `getItem<T>(key: string): T | null`
  - Retrieves and decrypts stored values with type safety
  - Automatically deserializes JSON objects or returns strings
  - Returns null if item doesn't exist, throws on decryption errors

- **removeItem()**: `removeItem(key: string): void`
  - Removes a specific encrypted item from storage
  - Validates key format and handles removal errors

- **clear()**: `clear(): void`
  - Removes all items with the `fusion-kit-` prefix
  - Safe for shared storage environments (only clears own items)
  - Prevents accidental deletion of unrelated storage items

- **getKeys()**: `getKeys(): string[]`
  - Returns array of all storage keys (without prefix)
  - Useful for iterating over stored items or debugging

**Shared Environment Considerations:**
The service is designed to work safely in shared storage scenarios (e.g., shell and microfrontend sharing sessionStorage) by using key prefixing and selective clearing operations.

### **User Feedback Services**

The [`UserFeedback`](./src/core/UserFeedBack.ts) class enables applications to provide consistent user feedback through a unified interface. It acts as a bridge between your application and the UI framework, supporting both standalone and microfrontend scenarios.

**Core Features:**
- Unified interface for displaying notifications, toasts, and message boxes
- Framework-agnostic design through adapter pattern
- Support for multiple notification types and severity levels
- Batch notification handling for multiple messages
- Integration with frame adapters for seamless communication between microfrontends and the shell

**Interface:**
- **registerFrameAdapter()**: `registerFrameAdapter(frameAdapter: FrameAdapter): void`
  - Registers a frame adapter for displaying UI feedback components
  - Essential for connecting the service to your UI framework (React, Vue, Angular, etc.)

- **showNotification()**: `showNotification(message: string | undefined, notificationType: NotificationTypes): void`
  - Displays a single notification with specified type (INFO, WARNING, ERROR, SUCCESS)
  - Automatically validates input and frame adapter availability

- **showNotifications()**: `showNotifications(notifications: Array<{message: string, notificationType: NotificationTypes}>): void`
  - Displays multiple notifications in batch
  - Iterates through array and displays each notification individually

- **showToast()**: `showToast(message: string, toastType: ToastTypes): void`
  - Displays temporary toast messages with different types
  - Ideal for brief status updates and confirmations

- **showMessageBox()**: `showMessageBox(title, messages, cancelButtonText, confirmButtonText, confirmCallback?, cancelCallback?): void`
  - Displays modal message boxes with customizable buttons and callbacks
  - Supports multiple messages and user interaction handling
  - Parameters include title, message array, button texts, and optional callback functions

**Adapter Integration:**
The UserFeedback service uses the adapter pattern to remain framework-agnostic. In microfrontend scenarios, the shell application typically provides the frame adapter, ensuring consistent UI behavior across all modules.

### **Service Management**

The [`ServiceManager`](./src/core/ServiceManager.ts) class provides centralized management for application services, enabling registration, retrieval, and removal of services throughout the application lifecycle. It acts as a service registry that maintains type safety and prevents service conflicts.

**Core Features:**
- Type-safe service registration and retrieval using generics
- Unique service identification through service IDs
- Dynamic service removal for cleanup and hot-swapping
- Map-based storage for efficient service lookup
- Support for any service implementing the AppService interface

**Interface:**
- **register<T>()**: `register<T extends AppService>(service: T): T`
  - Registers an application service and returns the registered instance
  - Uses the service's `id` property as the unique identifier
  - Generic type preservation ensures type safety when retrieving
  - Example: `serviceManager.register(myCustomService)`

- **get<T>()**: `get<T extends AppService>(id: string): T | undefined`
  - Retrieves a registered service by its unique ID
  - Returns typed service instance or undefined if not found
  - Type-safe retrieval with generic support
  - Example: `const service = serviceManager.get<MyServiceType>('my-service-id')`

- **remove()**: `remove(id: string): boolean`
  - Removes a registered service by its ID
  - Returns true if service was removed, false if not found
  - Useful for cleanup or service hot-swapping scenarios
  - Example: `const removed = serviceManager.remove('my-service-id')`

**Usage Pattern:**
The ServiceManager is automatically available through the `FusionApp.serviceManager` property, providing a centralized location for all application services. This is particularly useful in microfrontend architectures where services need to be shared or dynamically managed.

### **Application State Management**

The `FusionApp` class includes built-in application state management features for tracking and responding to application-wide state changes.

**Busy State Management:**
- **setBusy()**: `setBusy(busy: boolean): void`
  - Sets the application's busy state (e.g., during loading operations)
  - Automatically prevents duplicate state changes
  - Triggers registered callbacks when state changes
  - Example: `fusionApp.setBusy(true)` when starting an operation

- **isBusy**: `get isBusy(): boolean`
  - Returns the current busy state of the application
  - Read-only property for checking application status
  - Example: `if (fusionApp.isBusy) { /* show loading indicator */ }`

- **registerIsBusyCallback()**: `registerIsBusyCallback(callback: (isBusy: boolean) => void): void`
  - Registers a callback function to be notified of busy state changes
  - Useful for updating UI components (loading spinners, progress bars)
  - Only one callback can be registered at a time (overwrites previous)
  - Example: `fusionApp.registerIsBusyCallback((busy) => setLoadingState(busy))`

**Frame Adapter Management:**
- **registerFrameAdapter()**: `registerFrameAdapter(frameAdapter: FrameAdapter): void`
  - Registers a frame adapter for cross-frame communication in microfrontend scenarios
  - Automatically integrates with user feedback services if they support frame adapters
  - Includes validation and logging for debugging adapter registration
  - Essential for shell-to-microfrontend communication

- **frameAdapter**: `get frameAdapter(): FrameAdapter | undefined`
  - Returns the currently registered frame adapter
  - Used internally for frame-based communication
  - Returns undefined if no adapter has been registered

### **Builder Utilities**

The Fusion Kit Core includes builder classes to simplify the creation and configuration of key components:

- [`FusionAppBuilder`](./src/builder/FusionAppBuilder.ts): An API for constructing `FusionApp` instances with the services as previously described.
- [`ConfigurationManagerBuilder`](src/builder/ConfigurationManagerBuilder.ts): A utility for setting up and preloading configuration files for the `ConfigurationManager`.

### **Logging**

The [`ConsoleLogger`](./src/services/ConsoleLogger.ts) class provides a flexible and structured logging mechanism with hierarchical log levels and customizable output formatting. It implements the Logger interface for consistent logging behavior across applications.

**Core Features:**
- Hierarchical log levels (FATAL, ERROR, WARN, INFO, DEBUG) with filtering
- Structured JSON output with timestamps and level information
- Expressive styling mode with color-coded console output
- Level-based filtering to control log verbosity
- Consistent message formatting across all log levels
- Static utility methods for object serialization

**Log Level Hierarchy:**
- **FATAL**: Critical errors that may cause application failure
- **ERROR**: Error conditions that don't stop execution
- **WARN**: Warning messages for potentially problematic situations
- **INFO**: General informational messages
- **DEBUG**: Detailed information for debugging purposes

**Interface:**
- **Constructor**: `ConsoleLogger(logOption: LoggerOptions)`
  - Sets the minimum log level (only messages at or above this level are output)
  - Example: `new ConsoleLogger(LoggerOptions.INFO)` will show INFO, WARN, ERROR, and FATAL

- **fatal()**: `fatal(logMessage: string, expressive?: boolean): void`
  - Logs critical error messages with highest priority
  - Uses `console.error` and red styling in expressive mode

- **error()**: `error(logMessage: string, expressive?: boolean): void`
  - Logs error messages for non-critical failures
  - Uses `console.error` and red styling in expressive mode

- **warn()**: `warn(logMessage: string, expressive?: boolean): void`
  - Logs warning messages for potential issues
  - Uses `console.warn` and orange styling in expressive mode

- **info()**: `info(logMessage: string, expressive?: boolean): void`
  - Logs general informational messages
  - Uses `console.info` and blue styling in expressive mode

- **debug()**: `debug(logMessage: string, expressive?: boolean): void`
  - Logs detailed debugging information
  - Uses `console.log` with default styling

**Level Filtering:**
The logger only outputs messages at or above the configured log level, allowing you to control verbosity in different environments (e.g., DEBUG in development, INFO in production).

### **Authentication Services**

The [`ModuleAuthService`](./src/services/ModuleAuthService.ts) class provides a simplified authentication wrapper that delegates to existing authentication implementations. It enables:

- Wrapping existing AuthService implementations (Keycloak, Auth0, etc.)
- Simplified initialization for microfrontend scenarios
- Consistent authentication behavior across different modules
- Seamless integration with the FusionApp architecture

### **Utilities**

The Fusion Kit Core includes utility functions and interfaces that support the core functionality:

**Guard Functions:**
The [`guards.ts`](./src/utils/guards.ts) utility provides type-safe checking functions:

- **isRegister()**: `isRegister(obj: unknown): obj is FrameworkAdapterRegistration`
  - Type guard function to check if an object implements the FrameworkAdapterRegistration interface
  - Used internally to validate whether services support frame adapter registration
  - Provides type safety when working with dynamic service registration
  - Example usage in FusionApp for checking if UserFeedback service supports frame adapters

**Interfaces:**
- **FrameworkAdapterRegistration**: Interface defining the contract for services that can register frame adapters
  - `registerFrameAdapter(frameAdapter: FrameAdapter): void` - Method for registering frame adapters
  - `get frameAdapter(): FrameAdapter | undefined` - Property for retrieving registered adapters
  - Ensures consistent frame adapter handling across different service implementations

## Value Proposition

The Fusion Kit Core delivers significant value to frontend development teams by:

- **Reducing Development Time**: By providing prebuilt services and utilities, developers can focus on building application-specific features rather than reinventing the wheel.
- **Ensuring Consistency**: Standardized services and patterns ensure that all frontend applications behave predictably and adhere to best practices.
- **Facilitating Microfrontend Architecture**: The library simplifies the creation and integration of microfrontends, enabling teams to work independently while maintaining a cohesive user experience.
- **Enhancing Security**: Features like encrypted storage ensure that sensitive data is handled securely.
- **Improving Maintainability**: Centralized and reusable components reduce code duplication and make it easier to update or extend functionality.

## Example Use Case

Here’s an example of how the FusionKit  can be used to build a (microfrontend) application:

```typescript
import { FusionAppBuilder, ConfigurationManagerBuilder, EncryptedSessionStorage, ConsoleLogger, ModuleAuthService } from '@inform-appshell/fusion-kit-core';
import { LoggerOptions } from '@inform-appshell/fusion-kit-contracts';

const bootstrap = async () => {
  //******** Manage configuration files
 const configurationManager = await new ConfigurationManagerBuilder()
    .withConfigurationDirectory(window.location.origin + import.meta.env.VITE_BASE_URL + '/config/')
    .withFileToLoad('config.json', 'config')
    .withFileToLoad('pages.json', 'pages')
    .build();

  //******** initialize auth service factory
  const authService = () => {
    const configurationContext = configurationManager.getContent<Configuration>('config');
    if (!configurationContext) throw new Error('Configuration not found');

    return new KeyCloakService({
      url: configurationContext.keycloak.url,
      realm: configurationContext.keycloak.realm,
      clientId: configurationContext.keycloak.clientid,
      redirectUri: configurationContext.keycloak.redirectUrl,
    });
  };

  //******** initialize fusion app
  const fusionApp = await new FusionAppBuilder()
    .withName('paula-vue')
    .withAuth(authService())
    .withConfigManager(configurationManager)
    .withLogger(new ConsoleLogger(LoggerOptions.DEBUG))
    .withEncryptedStorage(new EncryptedSessionStorage('ADD_YOUR_SECRET_KEY'))
    .build();

  const isLoggedIn = await fusionApp?.auth.init();
  if (!isLoggedIn) {
    window.alert('User not logged in');
  } else {
    // Register custom services with the service manager
    fusionApp.serviceManager.register(myCustomService);
    
    // Set up busy state callback for loading indicators
    fusionApp.registerIsBusyCallback((isBusy) => {
      // Update your UI loading state here
      console.log('App busy state changed:', isBusy);
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const app = createApp(App);
    app.use(appRouter(false, fusionApp));
    app.provide('fusionApp', fusionApp);
    app.provide('standAlone', true);
    app.mount('#app');
  }
};

bootstrap().catch(error => {
  // eslint-disable-next-line no-console
  console.error('Failed to initialize app:', error);
});
```

This is used in the [fusion-kit-cli](https://github.com/inform-appshell/fusion-kit-cli), which is used for quickly creating framework-specific microfrontend templates.

For specific code documentation on the various services, please see [fusion-kit.md](./docs/fusion-kit.md).
