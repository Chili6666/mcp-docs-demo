# fusion-kit-keycloak

This library handles authentication using [Keycloak](https://www.keycloak.org/), an identity and access management solution currently used by INFORM. The library provides a service class, `KeyCloakService`, which implements the AuthService interface and facilitates authentication processes.

## Table of Contents

- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
  - [KeyCloakConfig Interface](#keycloakconfig-interface)
- [Authentication Service](#authentication-service)
  - [KeyCloakService Class](#keycloakservice-class)
  - [Token Validation](#token-validation-features)
  - [Service Lifecycle](#service-lifecycle-management)
- [Health Monitoring](#keycloak-health-monitoring)
  - [Basic Usage](#basic-usage)
  - [Configuration Options](#configuration-options)
  - [Manual Control](#manual-control)
  - [Integration Example](#integration-example)

## Installation

```bash
npm install @inform-appshell/fusion-kit-keycloak
```

This library is written in TypeScript and includes full type definitions.

## Configuration

## Architecture

This library follows a clean separation of concerns:

- **`KeyCloakService`**: Handles authentication operations (login, logout, token management)
- **`KeycloakHealthService`**: Provides health monitoring capabilities (independent service)

Both services can be used together or separately based on your needs. The health service operates independently and doesn't require the authentication service to function.

## KeyCloakConfig Interface

The `KeyCloakConfig` interface represents the configuration required for authentication.

### Properties

#### `url: string`

The URL of the authentication server.

- **Type:** `string`

#### `realm: string`

The realm used for authentication.

- **Type:** `string`

#### `clientId: string`

The client ID used for authentication.

- **Type:** `string`

#### `redirectUri?: string`

The redirect URI.

- **Type:** `string` (optional)

#### `usePkce: boolean`

Whether to use Proof Key for Code Exchange (PKCE) for enhanced security. Enabled by default unless explicitly disabled.

- **Type:** `boolean`

#### `checkLoginIframe: boolean`

Whether to check the login iframe for single sign-out (see https://www.keycloak.org/securing-apps/javascript-adapter#_session_status_iframe).

- **Type:** `boolean`

#### `extraScopes?: string[]`

Additional scopes to request during authentication beyond the default 'openid' and 'profile' scopes.

- **Type:** `string[]` (optional)

## Authentication Service

## KeyCloakService Class

The `KeyCloakService` class is a service for handling authentication using Keycloak. It implements the `AuthService` interface.

**Features:**
- Comprehensive token validation with security checks
- Optional logging support (no logging occurs if no logger is provided)
- Enhanced error handling and debugging capabilities
- Clean resource management with disposal methods
- Independent operation without external dependencies

### Constructor

#### `constructor(keyCloakConfig: KeyCloakConfig, logger?: Logger)`

Creates an instance of `KeyCloakService`.

- **Parameters:**
  - `keyCloakConfig`: The authentication configuration.
  - `logger` (optional): Logger instance for debugging and monitoring. If not provided, no logging will occur.

**Example:**
```typescript
// Without logging
const keycloakService = new KeyCloakService(keycloakConfig);

// With custom logger
const keycloakService = new KeyCloakService(keycloakConfig, myCustomLogger);
```

### Methods

#### `init(): Promise<boolean>`

Initializes the Keycloak service and attempts to authenticate the user.

- **Returns:** A promise that resolves to a boolean indicating whether the user was authenticated.

#### `logout(): Promise<void>`

Logs out the user.

- **Returns:** A promise that resolves when the logout process is complete.

#### `getUserInfo(): Promise<AuthUserProfile | undefined>`

Gets the user profile information.

- **Returns:** A promise that resolves to the user profile information, if available.

#### `token: string | undefined`

Gets the authentication token.

- **Returns:** The authentication token, if available.

#### `idToken: string | undefined`

Gets the ID token.

- **Returns:** The authentication token, if available.

#### `isLoggedin: boolean`

Enhanced login check with comprehensive token validation. Validates both access and ID tokens for expiration, issuer, audience, and other security claims.

- **Returns:** A boolean indicating whether the user is logged in and has valid tokens.

#### `tokenExpiresIn: number`

Gets the time in seconds until the access token expires, with validation.

- **Returns:** The time in seconds until the token expires, or 0 if the token is invalid.

### Token Validation Methods

#### `validateAccessToken(): TokenValidationResult`

Validates the current access token against security requirements.

- **Returns:** `TokenValidationResult` with validation status and any errors.

#### `validateIdToken(): TokenValidationResult`

Validates the current ID token against security requirements.

- **Returns:** `TokenValidationResult` with validation status and any errors.

#### `validateIdTokenFromString(token: string): TokenValidationResult`

Validates an ID token from a JWT token string.

- **Parameters:**
  - `token`: The JWT token string to validate.
- **Returns:** `TokenValidationResult` with validation status and any errors.

#### `getTokenValidationStatus(): { accessToken: TokenValidationResult; idToken: TokenValidationResult }`

Gets comprehensive token validation status for debugging purposes.

- **Returns:** Object containing validation results for both access and ID tokens.

### Token Management Methods

#### `needsTokenRefresh(bufferSeconds?: number): boolean`

Checks if tokens need refresh soon.

- **Parameters:**
  - `bufferSeconds`: Number of seconds before expiration to consider "needs refresh" (default: 300).
- **Returns:** True if tokens should be refreshed.

#### `forceTokenRefresh(minValidity?: number): Promise<boolean>`

Forces token refresh.

- **Parameters:**
  - `minValidity`: Minimum validity in seconds to force refresh (default: 30).
- **Returns:** Promise that resolves to true if refresh was successful.

#### `decodeToken<T>(token: string): T`

Decodes a JWT token and returns its payload with generic type support.

- **Type Parameters:**
  - `T`: The expected type of the decoded token payload.
- **Parameters:**
  - `token`: The JWT token string to decode.
- **Returns:** The decoded token payload cast to type `T`.
- **Throws:** Error if token format is invalid.

**Example:**
```typescript
const tokenClaims = keyCloakService.decodeToken<TokenClaims>(jwtToken);
```

#### `dispose(): void`

Cleanup method to properly dispose of the service and its resources.

- **Returns:** void

This method should be called when the KeyCloakService instance is no longer needed. It performs the following cleanup operations:
- Clears cached user profile data  
- Prevents memory leaks and resource accumulation

**Example:**
```typescript
// When shutting down your application or component
keyCloakService.dispose();
```

## Token Validation Features

This library includes comprehensive token validation that checks:

- **Expiration**: Ensures tokens haven't expired
- **Not Before**: Validates the `nbf` claim if present
- **Issuer**: Verifies the token was issued by the expected Keycloak realm
- **Audience**: Validates the token audience matches the client ID (for ID tokens)
- **Token Type**: Ensures proper token type for access ("Bearer") and ID ("ID") tokens
- **Subject**: Validates the subject claim is present and valid
- **Authorized Party**: Validates `azp` claim for ID tokens if present
- **Issued At**: Ensures token wasn't issued in the future (with clock skew tolerance)

## TokenValidationResult Interface

The `TokenValidationResult` interface represents the result of token validation:

```typescript
interface TokenValidationResult {
  isValid: boolean;
  errors: string[];
}
```

### Notification Callbacks

#### `public onLogin?(): void | Promise<void>;`

Handles actions to be performed on login.

- **Returns:** void | Promise<void>

#### `public onLogout?(): void | Promise<void>;`

Handles actions to be performed on logout.

- **Returns:** void | Promise<void>

#### `public onNewToken?(): void | Promise<void>;`

Handles actions to be performed on token refresh.

- **Returns:** void | Promise<void>

## Keycloak Health Monitoring

The `KeycloakHealthService` provides monitoring capabilities for your Keycloak server, allowing you to detect when the service is available or unavailable and receive callbacks when the status changes.

### Features

- **Automatic Health Monitoring**: Continuously monitors Keycloak server health via realm endpoint
- **Configurable Intervals**: Customize check frequency and failure thresholds  
- **Status Callbacks**: Get notified when service goes online/offline
- **Standalone Service**: Operates independently from authentication service
- **Timeout Handling**: Configurable timeouts for health checks
- **Error Resilience**: Handles network errors and HTTP failures gracefully
- **Immutable Configuration**: Configuration is set at initialization for stability
- **Reliable Endpoint**: Uses Keycloak realm endpoint which is always available

### Basic Usage

#### Standalone Health Service

```typescript
import { KeycloakHealthService, AuthServiceHealthServiceConfig } from '@inform-appshell/fusion-kit-keycloak';

const keycloakConfig = {
  url: 'https://your-keycloak-server.com',
  realm: 'your-realm',
  clientId: 'your-client-id',
};

const onServiceOnline = () => {
  console.log('🟢 Keycloak service is now online!');
};

const onServiceOffline = () => {
  console.log('🔴 Keycloak service is offline!');
  // Handle offline scenario - show user message, switch to offline mode, etc.
};

const onHealthCheck = (isHealthy: boolean, responseTime?: number) => {
  console.log(`Health check: ${isHealthy ? '✅' : '❌'} (${responseTime}ms)`);
  // The service checks: https://your-keycloak-server.com/realms/your-realm-name
};

const config: AuthServiceHealthServiceConfig = {
  checkInterval: 30000, // Check every 30 seconds
  timeout: 5000, // 5 second timeout for health checks
  failureThreshold: 3, // Consider offline after 3 consecutive failures
  successThreshold: 1, // Consider online after 1 success
  autoStart: true, // Start monitoring automatically
};

const healthService = new KeycloakHealthService(
  keycloakConfig, 
  onServiceOnline, 
  onServiceOffline, 
  onHealthCheck, 
  config
);
```

### Configuration Options

#### AuthServiceHealthServiceConfig

- `checkInterval` (default: 30000ms): Time between health checks
- `timeout` (default: 5000ms): Timeout for each health check request
- `failureThreshold` (default: 3): Consecutive failures before marking as offline
- `successThreshold` (default: 1): Consecutive successes before marking as online
- `autoStart` (default: true): Whether to start monitoring automatically

### Callback Functions

You can provide optional callback functions for different health events:

- `onServiceOnline`: Called when service becomes available
- `onServiceOffline`: Called when service becomes unavailable
- `onHealthCheck`: Called on each health check with status and response time

### Manual Control

```typescript
const healthService = new KeycloakHealthService(
  keycloakConfig,
  undefined, // onServiceOnline
  undefined, // onServiceOffline
  undefined, // onHealthCheck
  { autoStart: false } // Don't start automatically
);

// Perform a one-time health check
const result = await healthService.checkHealth();
console.log('Health result:', result);

// Start/stop monitoring
healthService.startMonitoring();
healthService.stopMonitoring();

// Update callbacks directly
healthService.onServiceOnline = () => console.log('Service online!');
healthService.onServiceOffline = () => console.log('Service offline!');
healthService.onHealthCheck = (isHealthy, responseTime) => console.log(`Health: ${isHealthy} (${responseTime}ms)`);

// Clean up when done
healthService.dispose();
```

### Health Check Endpoint

The health service checks the realm endpoint on your Keycloak server:
```
https://your-keycloak-server.com/realms/your-realm-name
```

This endpoint is always available in Keycloak installations and returns realm information. The service considers the realm healthy if this endpoint returns a successful HTTP response (200).

### Best Practices

1. **Service Separation**: Use `KeyCloakService` for authentication and `KeycloakHealthService` for monitoring independently
2. **Optional Logging**: Provide a logger to `KeyCloakService` for debugging, or omit it for silent operation
3. **Health Monitoring**: Use appropriate intervals - don't check too frequently to avoid unnecessary load
4. **Handle Offline Scenarios**: Implement fallback behavior when Keycloak is unavailable
5. **Monitor Response Times**: Use the `onHealthCheck` callback to track performance
6. **Resource Cleanup**: Always call `dispose()` when services are no longer needed
7. **Configure Thresholds**: Adjust failure/success thresholds based on your reliability requirements
8. **Immutable Configuration**: Health service configuration is set at initialization for stability
9. **Realm Endpoint**: The health service uses the realm endpoint which is always available in Keycloak

### Integration Example

```typescript
import { KeyCloakService, KeycloakHealthService } from '@inform-appshell/fusion-kit-keycloak';

class MyApp {
  private keycloakService: KeyCloakService;
  private healthService: KeycloakHealthService;
  private isKeycloakAvailable = true;

  constructor() {
    // Authentication service with optional logger
    this.keycloakService = new KeyCloakService(keycloakConfig, console);
    
    // Independent health monitoring service
    this.healthService = new KeycloakHealthService(
      keycloakConfig,
      () => {
        this.isKeycloakAvailable = true;
        this.showNotification('Authentication service restored', 'success');
      },
      () => {
        this.isKeycloakAvailable = false;
        this.showNotification('Authentication service unavailable', 'warning');
      },
      (isHealthy, responseTime) => {
        console.log(`Keycloak health: ${isHealthy ? '✅' : '❌'} (${responseTime}ms)`);
      }
    );
  }

  async login() {
    if (!this.isKeycloakAvailable) {
      this.showNotification('Login temporarily unavailable', 'error');
      return false;
    }

    try {
      return await this.keycloakService.init();
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  dispose() {
    this.keycloakService.dispose();
    this.healthService.dispose();
  }
}
```

## Service Lifecycle Management

When using the KeyCloakService, it's important to properly manage its lifecycle:

```typescript
// Application startup
const keycloakService = new KeyCloakService(keycloakConfig);
await keycloakService.init();

// Application shutdown
keycloakService.dispose(); // Always call dispose() to clean up resources
```

The `dispose()` method ensures:
- Cached user data is cleared
- No memory leaks or background processes remain
