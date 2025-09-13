# fusion-kit-contracts

This repository serves as a centralized library for defining shared TypeScript interfaces and types used across multiple repositories in the Fusion Kit ecosystem. It provides a consistent and reusable set of contracts (interfaces, types, and enums) that define the structure and behavior of various components, such as authentication services, logging, remote module management, and user feedback mechanisms.

## 🚨 Breaking Changes in v2.0.0

This version introduces significant breaking changes to the remote module remotes system. Please review the migration guide below before upgrading.

### Major Changes:
- **RemoteConfiguration**: Complete interface redesign
- **RemoteManager**: New federation-based API with utility module support
- **Type Definitions**: Removed deprecated bundler and format types
- **New Interfaces**: Added RemotesConfiguration and RemoteHealthStatus

## Table of Contents

- [🚨 Breaking Changes in v2.0.0](#-breaking-changes-in-v200)
- [📖 Migration Guide](#-migration-guide)
- [AuthService Interface](#authservice-interface)
- [Logger Interface](#logger-interface)
- [FrameAdapter Interface](#frameadapter-interface)
- [RemoteManager](#remotemanager)
- [Remotes Configuration](#remotes-configuration)
- [Remote Health Status](#remote-health-status)
- [Module Configuration](#module-configuration)
- [Type Definitions](#type-definitions)
- [Additional Interfaces](#additional-interfaces)

## 📖 Migration Guide

### RemoteConfiguration Interface Changes

**Before (v1.x):**
```typescript
interface RemoteConfiguration {
  url: string;
  name: string;
  module: string;
  format?: 'esm' | 'systemjs' | 'var';
  bundler?: 'vite' | 'webpack';
}

// Example usage
const oldConfig: RemoteConfiguration = {
  url: 'http://localhost:9000/assets/remoteEntry.js',
  name: 'remoteA',
  module: './RemoteARoot',
  format: 'esm',
  bundler: 'vite'
};
```

**After (v2.0):**
```typescript
interface RemoteConfiguration {
  name: string;
  url: string;
  exposedModules: Record<string, string>;
  type: 'vite' | 'webpack';
}

// Example migration
const newConfig: RemoteConfiguration = {
  name: 'remoteA',
  url: 'http://localhost:9000/assets/remoteEntry.js',
  type: 'vite', // renamed from 'bundler'
  exposedModules: {
    'RemoteARoot': './RemoteARoot', // moved from 'module' property
    'Component': './components/Component',
    'utils': './utils/index'
  }
};
```

**Migration Steps:**
1. Rename `bundler` property to `type`
2. Remove `format` property (no longer needed)
3. Replace single `module` property with `exposedModules` object
4. Map your module paths as key-value pairs in `exposedModules`

### RemoteManager Interface Changes

**Before (v1.x):**
```typescript
interface RemoteManager {
  loadRemoteModules(configs: RemoteConfiguration[]): Promise<void>;
  getRemoteModuleConfiguration(name: string): RemoteConfiguration | undefined;
  getLoadedRemoteModules(): Module[];
  getLoadedNonBootstrapableRemoteModule<T>(name: string): T | undefined;
}

// Example usage
await manager.loadRemoteModules([config]);
const modules = manager.getLoadedRemoteModules();
const utility = manager.getLoadedNonBootstrapableRemoteModule<Utils>('remote1/utils');
```

**After (v2.0):**
```typescript
interface RemoteManager {
  // Remotes configuration
  configure(config: RemotesConfiguration): void;
  getConfiguration(): RemotesConfiguration | undefined;
  
  // Remote registration  
  registerRemote(remote: RemoteConfiguration): void;
  registerRemotes(remotes: RemoteConfiguration[]): void;
  isRemoteRegistered(remoteName: string): boolean;
  
  // Full modules (Module interface)
  loadModule(remoteName: string, moduleName: string): Promise<Module>;
  loadModules(remoteName: string, moduleNames: string[]): Promise<Module[]>;
  getAllModules(): Promise<Module[]>;
  getModulesByRemote(remoteName: string): Promise<Module[]>;
  getLoadedModule(moduleFullPath: string): Module | undefined;
  
  // Utility modules (no Module interface)
  loadUtilityModule<T>(remoteName: string, moduleName: string): Promise<T>;
  loadUtilityModules<T>(remoteName: string, moduleNames: string[]): Promise<T[]>;
  getLoadedUtilityModule<T>(moduleFullPath: string): T;
}

// Example migration
const remotesConfig: RemotesConfiguration = {
  appName: 'my-host-app',
  remotes: [newConfig], // using new RemoteConfiguration format
  shared: {
    'react': { singleton: true },
    'react-dom': { singleton: true }
  }
};

// New usage pattern
manager.configure(remotesConfig);
const module = await manager.loadModule('remoteA', 'RemoteARoot');
const utils = await manager.loadUtilityModule<Utils>('remoteA', 'utils');
```

**Migration Steps:**
1. Replace `loadRemoteModules()` with `configure()` using `RemotesConfiguration`
2. Use `loadModule()` instead of accessing loaded modules directly
3. Use `loadUtilityModule()` for non-Module interface components
4. Update method calls to use separate remote name and module name parameters



## AuthService Interface

The `AuthService` interface defines methods and properties for managing authentication within an application. It includes methods for initializing the service, logging out, retrieving user information, token validation, and token refresh capabilities, as well as properties for accessing authentication tokens and checking login status.

### Methods

#### `init(): Promise<boolean>`

Initializes the authentication service and shows the login screen for the selected Authservice

- **Returns:** A promise that resolves to a boolean indicating whether the Login was successful.

#### `logout(): Promise<void>`

Logs out the user.

- **Returns:** A promise that resolves when the logout process is complete.

#### `getUserInfo(): Promise<AuthUserProfile | undefined>`

Gets the user profile information.

- **Returns:** A promise that resolves to the user profile information, if available.

#### `validateAccessToken(): TokenValidationResult`

Validates the current access token.

- **Returns:** TokenValidationResult with validation status and any errors.

#### `validateIdToken(): TokenValidationResult`

Validates the current ID token.

- **Returns:** TokenValidationResult with validation status and any errors.

#### `validateIdTokenFromString(token: string): TokenValidationResult`

Validates an ID token from a token string.

- **Parameters:**
  - `token`: The JWT token string to validate.
- **Returns:** TokenValidationResult with validation status and any errors.

#### `getTokenValidationStatus(): { accessToken: TokenValidationResult; idToken: TokenValidationResult }`

Get token validation status for debugging.

- **Returns:** Object containing validation results for both access and ID tokens.

#### `needsTokenRefresh(bufferSeconds: number): boolean`

Check if tokens need refresh soon.

- **Parameters:**
  - `bufferSeconds`: Number of seconds before expiration to consider "needs refresh".
- **Returns:** True if tokens should be refreshed.

#### `forceTokenRefresh(minValidity: number): Promise<boolean>`

Force token refresh.

- **Parameters:**
  - `minValidity`: Minimum validity in seconds to force refresh.
- **Returns:** Promise that resolves to true if refresh was successful.

### Properties

#### `token: string | undefined`

Gets the authentication token.

- **Returns:** The authentication token, if available.

#### `idToken: string | undefined`

Gets the ID token.

- **Returns:** The ID token, if available.

#### `isLoggedin: boolean`

Checks if the user is logged in.

- **Returns:** A boolean indicating whether the user is logged in.

#### `tokenExpiresIn: number`

Enhanced token expiration check with validation.

- **Returns:** The time in seconds until the token expires, or 0 if invalid.

#### `onLogin?: () => void | Promise<void>`

Optional callback for when authentication was successful.

#### `onLogout?: () => void | Promise<void>`

Optional callback for when the user is logged out.

#### `onNewToken?: () => void | Promise<void>`

Optional callback that handles actions to be performed on token refresh.

## Logger Interface

The `Logger` interface defines methods for logging messages at various levels of severity. Each method accepts a message or an array of messages to be logged.

### Methods

#### `fatal(message: string | string[]): void`

Logs a fatal message. This indicates a severe error that will prevent the application from continuing.

- **Parameters:**
  - `message`: The message or array of messages to log.

#### `error(message: string | string[]): void`

Logs an error message. This indicates a significant problem that has occurred but does not necessarily stop the application.

- **Parameters:**
  - `message`: The message or array of messages to log.

#### `warn(message: string | string[]): void`

Logs a warning message. This indicates a potential issue or something that should be noted but is not necessarily an error.

- **Parameters:**
  - `message`: The message or array of messages to log.

#### `info(message: string | string[]): void`

Logs an informational message. This is used for general information about the application's operation.

- **Parameters:**
  - `message`: The message or array of messages to log.

#### `debug(message: string | string[]): void`

Logs a debug message. This is used for detailed information useful for debugging the application.

- **Parameters:**
  - `message`: The message or array of messages to log.

## FrameAdapter Interface

The `FrameAdapter` interface defines methods for displaying various types of notifications, message boxes, and toasts within an application. It'S the glue between the FusionApp and the UI

### Methods

#### `showNotification(message: string | undefined, notificationType: NotificationTypes): void`

Displays a single notification.

- **Parameters:**
  - `message`: The message to display in the notification.
  - `notificationType`: The type of notification to display (e.g., success, error).

#### `showNotifications(notifications: { message: string | undefined; notificationType: NotificationTypes; }[]): void`

Displays multiple notifications.

- **Parameters:**
  - `notifications`: An array of objects, each containing a message and a notification type.

#### `showMessageBox(title: string, messages: MessageBoxMessage[], cancelButtonText: string, confirmButtonText: string, confirmCallback?: () => void, cancelCallback?: () => void): void`

Displays a message box with a title, messages, and buttons for confirmation and cancellation.

- **Parameters:**
  - `title`: The title of the message box.
  - `messages`: An array of messages to display in the message box.
  - `cancelButtonText`: The text to display on the cancel button.
  - `confirmButtonText`: The text to display on the confirm button.
  - `confirmCallback`: An optional callback function to execute when the confirm button is clicked.
  - `cancelCallback`: An optional callback function to execute when the cancel button is clicked.

#### `showToast(message: string, toastType: ToastTypes): void`

Displays a toast message.

- **Parameters:**
  - `message`: The message to display in the toast.
  - `toastType`: The type of toast to display (e.g., success, error).

## RemoteManager

The `RemoteManager` interface provides comprehensive methods for loading and managing remote modules in a federated architecture. It supports both full-featured modules (implementing the Module interface) and utility modules, with caching and batch operations for improved performance.

### Remotes Configuration Methods

#### `configure(config: RemotesConfiguration): void`

Configures the remotes with the provided configuration. This method initializes the remotes system with app settings and registers all remotes defined in the configuration.

- **Parameters:**
  - `config`: The remotes configuration containing app name and remotes
- **Throws:** Error if configuration is invalid or missing required properties

**Example:**
```typescript
const manager = new RemoteManagerImpl(); // or your actual implementation class
await manager.configure({
  appName: 'my-host-app',
  remotes: [
    { name: 'remote1', url: 'http://localhost:3001/remoteEntry.js', type: 'vite', exposedModules: {...} }
  ]
});
```

#### `getConfiguration(): RemotesConfiguration | undefined`

Gets the current remotes configuration.

- **Returns:** The current remotes configuration or undefined if not configured

### Remote Registration Methods

#### `registerRemote(remote: RemoteConfiguration): void`

Registers a remote application with its configuration.

- **Parameters:**
  - `remote`: The remote module configuration to register

#### `registerRemotes(remotes: RemoteConfiguration[]): void`

Registers multiple remote applications with their configurations. This is a convenience method for bulk registration of remotes, typically used during application initialization.

- **Parameters:**
  - `remotes`: Array of remote module configurations to register

**Example:**
```typescript
manager.registerRemotes([
  { name: 'remote1', url: 'http://localhost:3001/remoteEntry.js', type: 'vite', exposedModules: {...} },
  { name: 'remote2', url: 'http://localhost:3002/remoteEntry.js', type: 'webpack', exposedModules: {...} }
]);
```

#### `isRemoteRegistered(remoteName: string): boolean`

Checks if a remote application is already registered.

- **Parameters:**
  - `remoteName`: The name of the remote to check
- **Returns:** true if the remote is registered, false otherwise

### Full Module Loading Methods (Module Interface)

#### `loadModule(remoteName: string, moduleName: string): Promise<Module>`

Loads a specific full-featured module from a registered remote. This method loads modules that implement the complete Module interface, including lifecycle methods (mount/unmount), menu items, and metadata.

- **Parameters:**
  - `remoteName`: The name of the remote application
  - `moduleName`: The name of the module to load from the remote
- **Returns:** Promise that resolves to the loaded Module instance
- **Throws:** Error if the remote is not registered or the module is not found

**Example:**
```typescript
// Load a complete microfrontend module
const dashboardModule = await manager.loadModule('analytics', 'Dashboard');

// Module will have: name, title, description, menuItems, mount, unmount
dashboardModule.mount(document.getElementById('app'));
```

#### `loadModules(remoteName: string, moduleNames: string[]): Promise<Module[]>`

Loads multiple full-featured modules from a specific registered remote in parallel.

- **Parameters:**
  - `remoteName`: The name of the remote application
  - `moduleNames`: Array of module names to load from the remote
- **Returns:** Promise that resolves to an array of loaded Module instances
- **Throws:** Error if the remote is not registered or any of the modules are not found

**Example:**
```typescript
// Load multiple complete modules at once
const [dashboard, reports, settings] = await manager.loadModules(
  'businessApps',
  ['Dashboard', 'Reports', 'Settings']
);
```

#### `getAllModules(): Promise<Module[]>`

Loads all available full-featured modules from all registered remotes. Failed module loads are logged as warnings but don't stop the process.

- **Returns:** Promise that resolves to an array of all successfully loaded Module instances

**Example:**
```typescript
// Load all available modules for discovery or initialization
const allModules = await manager.getAllModules();
console.log(`Loaded ${allModules.length} modules from federation`);
```

#### `getModulesByRemote(remoteName: string): Promise<Module[]>`

Loads all full-featured modules from a specific registered remote.

- **Parameters:**
  - `remoteName`: The name of the remote to load modules from
- **Returns:** Promise that resolves to an array of Module instances from the specified remote
- **Throws:** Error if the remote is not registered

**Example:**
```typescript
// Load all modules from a specific remote
const designSystemModules = await manager.getModulesByRemote('designSystem');
designSystemModules.forEach(module => console.log(module.name));
```

#### `getLoadedModule(moduleFullPath: string): Module | undefined`

Retrieves a previously loaded full-featured module from the internal cache.

- **Parameters:**
  - `moduleFullPath`: The full path identifier for the module (e.g., "remoteName/moduleName")
- **Returns:** The cached Module instance if found, undefined if not loaded or cached

**Example:**
```typescript
// Check if module is already loaded before loading
const cachedModule = manager.getLoadedModule('designSystem/Button');
if (cachedModule) {
  // Use cached module without re-loading
  cachedModule.mount(container);
} else {
  // Load fresh if not cached
  const module = await manager.loadModule('designSystem', 'Button');
}
```

### Utility Module Loading Methods (No Module Interface)

#### `loadUtilityModule<T>(remoteName: string, moduleName: string): Promise<T>`

Loads a utility module from a registered remote without Module interface validation. This method is designed for loading lightweight modules that don't implement the full Module interface - such as utility functions, helper libraries, simple components, or configuration objects.

- **Parameters:**
  - `remoteName`: The name of the remote application
  - `moduleName`: The name of the utility module to load from the remote
- **Returns:** Promise that resolves to the utility module instance of type T
- **Throws:** Error if the remote is not registered or the module is not found

**Example:**
```typescript
// Load utility functions with type safety
const formatters = await manager.loadUtilityModule<{
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date) => string;
}>('utilsRemote', 'formatters');

const formatted = formatters.formatCurrency(1000); // "$1,000.00"

// Load a simple React component
const Button = await manager.loadUtilityModule<React.ComponentType>(
  'components',
  'SimpleButton'
);
```

#### `loadUtilityModules<T>(remoteName: string, moduleNames: string[]): Promise<T[]>`

Loads multiple utility modules from a specific registered remote in parallel.

- **Parameters:**
  - `remoteName`: The name of the remote application
  - `moduleNames`: Array of utility module names to load from the remote
- **Returns:** Promise that resolves to an array of utility module instances of type T
- **Throws:** Error if the remote is not registered or any of the modules are not found

**Example:**
```typescript
// Load multiple related utilities with type safety
interface UtilityType {
  validate: (value: string) => boolean;
  format: (value: string) => string;
}

const [emailUtils, phoneUtils, addressUtils] = await manager.loadUtilityModules<UtilityType>(
  'validationRemote',
  ['emailUtils', 'phoneUtils', 'addressUtils']
);

const isValid = emailUtils.validate('user@example.com');
```

#### `getLoadedUtilityModule<T>(moduleFullPath: string): T`

Retrieves a previously loaded utility module from the internal cache.

- **Parameters:**
  - `moduleFullPath`: The full path identifier for the module (e.g., "remoteName/moduleName")
- **Returns:** The cached utility module instance of type T

**Example:**
```typescript
// Check cache before loading utility
const cachedFormatters = manager.getLoadedUtilityModule<{
  formatCurrency: (amount: number) => string;
}>('utilsRemote/formatters');

if (cachedFormatters) {
  // Use cached utilities without re-loading
  const formatted = cachedFormatters.formatCurrency(1000);
} else {
  // Load fresh if not cached
  const formatters = await manager.loadUtilityModule('utilsRemote', 'formatters');
}
```

## Remotes Configuration

The `RemotesConfiguration` interface defines the structure for configuring a remotes application, including its identity, remote modules, and shared dependencies.

### Properties

#### `appName: string`

Unique identifier for the host application. Used for distinguishing this app in the remotes network.

#### `remotes: RemoteConfiguration[]`

Array of remote modules that this host can consume. Each remote defines where to find external microfrontends and their exposed modules.

#### `shared?: Record<string, unknown>`

Optional shared dependencies configuration. Defines which packages should be shared between host and remotes to avoid duplication.

**Example:**
```typescript
const config: RemotesConfiguration = {
  appName: 'my-host-app',
  remotes: [
    {
      name: 'designSystem',
      url: 'http://localhost:3001/remoteEntry.js',
      type: 'vite',
      exposedModules: {
        'Button': './components/Button',
        'Modal': './components/Modal',
        'utils': './utils/index'
      }
    }
  ],
  shared: {
    'react': { singleton: true, requiredVersion: '^18.0.0' },
    'react-dom': { singleton: true, requiredVersion: '^18.0.0' }
  }
};
```

## Remote Health Status

The `RemoteHealthStatus` interface represents the health status of a remote microfrontend, used to track availability and performance of remote modules in a federated architecture.

### Properties

#### `isHealthy: boolean`

Indicates whether the remote is currently healthy and accessible. True if the remote responded successfully to the health check.

#### `lastChecked: Date`

Timestamp of when this health check was performed. Used to determine if the cached health status is still valid.

#### `responseTime?: number`

Response time in milliseconds for the health check request. Useful for monitoring performance and detecting slow remotes. Only available when the health check completed (successfully or not).

#### `error?: string`

Error message if the health check failed. Contains details about why the remote is considered unhealthy, such as network errors, HTTP status codes, or timeout messages.

## Module Configuration

### RemoteConfiguration Interface

The `RemoteConfiguration` interface defines the configuration for a remote microfrontend module. It specifies the connection details and exposed modules for a remote microfrontend that can be dynamically loaded by the host application.

#### Properties

##### `name: string`

Unique identifier for the remote module. Must match the name defined in the remote's remotes configuration.

##### `url: string`

URL to the remote entry point.
- For Vite: should end with 'remoteEntry.js'
- For Webpack: points to the remoteEntry.js file

##### `exposedModules: Record<string, string>`

Map of exposed module names to their internal paths.
- Key: the name used to import the module
- Value: the actual module path as exposed by the remote

**Example:**
```typescript
exposedModules: {
  'Button': './components/Button',
  'utils': './utils/index'
}
```

##### `type: 'vite' | 'webpack'`

Build tool type used by the remote microfrontend. Determines which loader strategy to use for module loading.

**Complete Example:**
```typescript
const remoteConfig: RemoteConfiguration = {
  name: 'designSystem',
  url: 'http://localhost:3001/remoteEntry.js',
  type: 'vite',
  exposedModules: {
    'Button': './components/Button',
    'Modal': './components/Modal',
    'theme': './theme/index',
    'utils': './utils/helpers'
  }
};
```

### ModuleMenuItem Interface

The `ModuleMenuItem` interface defines the structure for a menu item within a module. This includes properties for the item's identifier, title, execution capability, icon, execution function, and any sub-menu items.

#### Properties

- **id**: `string`
  - A unique identifier for the menu item.
- **title**: `string`
  - The display title of the menu item.
- **canExecute**: `boolean`
  - A flag indicating whether the menu item can be executed.
- **icon**: `string`
  - The icon associated with the menu item.
- **execute**: `() => void | Promise<void>`
  - A function that is executed when the menu item is selected. Can return void or a Promise.
- **menuItems**: `ModuleMenuItem[]`
  - An array of sub-menu items, each of which is also a `ModuleMenuItem`.

### Module Interface

The `Module` interface defines the structure for bootstrapping a module, including its identifier, title, description, menu items, and methods for mounting and unmounting the module.

#### Properties

- **name**: `string`
  - The unique identifier for the module.
- **title**: `string`
  - The display title of the module.
- **description**: `string`
  - A brief description of the module.
- **menuItems**: `ModuleMenuItem[]`
  - An array of menu items associated with the module. Each item is defined by the `ModuleMenuItem` interface.
- **applicationImage**: `string` (optional)
  - Optional application image or icon for the module.

#### Methods

- **mount(container: string | HTMLElement, moduleConfiguration?: ModuleConfiguration): Promise<void>**
  - Mounts the module to the specified container. The container can be identified by a string (e.g., a CSS selector) or an `HTMLElement`. Optionally, configuration options for the module can be provided.
  - **Parameters:**
    - `container`: The container element or its ID where the module will be mounted.
    - `moduleConfiguration`: Optional configuration options for the module.
  - **Returns:** Promise that resolves when mounting is complete.

- **unmount(container: string | HTMLElement): void**
  - Unmounts the module from the specified container, performing any necessary cleanup.
  - **Parameters:**
    - `container`: The container element or its ID from which the module will be unmounted.

## Type Definitions

The following type definitions are available for various UI components and configurations:

### NotificationTypes

```typescript
type NotificationTypes = 'info' | 'warning' | 'error' | 'success';
```

Defines the types of notifications that can be displayed in the application.

### MessageBoxTypes

```typescript
type MessageBoxTypes = 'info' | 'warning' | 'error' | 'success' | 'question';
```

Defines the types of message boxes that can be displayed.

### ToastTypes

```typescript
type ToastTypes = 'info' | 'warning' | 'error';
```

Defines the types of toast notifications available.

### MessageBoxMessage Interface

```typescript
interface MessageBoxMessage {
  type?: MessageBoxTypes;
  message?: string;
}
```

Defines the structure for messages displayed in message boxes.

## Additional Interfaces

### TokenValidationResult

The `TokenValidationResult` interface provides information about token validation status, including whether the token is valid and any associated error messages.

### AuthUserProfile

The `AuthUserProfile` interface defines the structure for user profile information returned by authentication services.

### EncryptedStorage

The `EncryptedStorage` interface provides methods for securely storing and retrieving encrypted data.

### UserFeedbackService

The `UserFeedbackService` interface defines methods for collecting and managing user feedback within the application.

### AppService

The `AppService` interface provides core application services and utilities.

### LoggerOptions

The `LoggerOptions` interface defines configuration options for the logging system.
