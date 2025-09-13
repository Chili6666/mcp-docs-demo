# Fusion Kit CLI 

## Table of Contents

- [Description](#description)
- [Core Functionality](#core-functionality)
- [Key Benefits](#key-benefits)
- [Optional Functionalities](#optional-functionalities)
- [Setup](#setup)
- [Frameworks](#frameworks)
  - [Angular](#angular)
  - [Vue](#vue)
  - [React](#react)
- [Concepts](#concepts)
  - [Standalone](#standalone)
  - [Auth](#auth)
  - [Socketcluster-client](#socketcluster-client)
  - [Exposing Helper Functions](#exposing-helper-functions)

## Description

The Fusion Kit CLI is a powerful command-line tool that streamlines the creation and setup of micro-frontend applications within the Fusion Kit ecosystem. Designed for modern web development, it supports Angular, React, and Vue frameworks with standardized project structures and automated configuration.

**Core Functionality:**

The CLI offers flexible command options to accelerate your (micro-)frontend development:

1. **Interactive Mode** (`fk create`)

   - Launches an interactive prompt asking whether you want to create a micro-frontend or shell application
   - Guides you through the setup process with user-friendly prompts

2. **Micro-frontend Creation** (`fk create mfe`)

   - Generates standardized micro-frontend projects for Angular, React, or Vue
   - Creates consistent project structures following Fusion Kit standards
   - Supports quick setup with `fk create mfe` or named projects with `fk create mfe -n [name]`

3. **Shell Application Creation** (`fk create shell -n [name]`)
   - Creates Vue-based shell applications to orchestrate micro-frontends
   - Establishes the foundation for micro-frontend integration and routing

**Key Benefits:**

- **User-Friendly Interface**: Interactive mode provides guided setup for users who prefer step-by-step assistance
- **Standardized Architecture**: Every generated project follows established Fusion Kit conventions, ensuring consistency across teams and applications
- **Framework Flexibility**: Choose from Angular, React, or Vue for micro-frontends while maintaining a Vue shell structure
- **Rapid Scaffolding**: Eliminate manual setup time with pre-configured project templates
- **Developer Productivity**: Automate repetitive tasks and focus on building features rather than configuration

The Fusion Kit CLI transforms complex micro-frontend setup into simple, repeatable commands, enabling teams to maintain architectural consistency while accelerating development velocity.

More information on the fusion kit can be found [here](https://github.com/inform-appshell/fusion-kit-core).

## Optional Functionalities

The frameworks can be created with certain optional functionalities. These include:

### Elevate Design System

Enabling the elevate design system will include the [Elevate Core UI](https://github.com/inform-elevate/elevate-core-ui) package in the application. This library provides various UI components.

### AppShell UI components

Enabling the AppShell UI Components will include the [AppShell UI Components](https://github.com/inform-appshell/appshell-ui-components) package in the application. This library inherits the elevate design system and provides higher-level UI components designed to be used in an AppShell for standardisation across microfrontends.

### i18n
(Actually only for vue based microfrontends and the shell)

Enabling internationalisation will include the relevant `i18n` library for the framework, and provide files to configure translations (initially for German and English).

## Setup

### Install the CLI package globally

```bash
npm install -g @inform-appshell/fusion-kit-cli@latest
```


### Commands

**Using globally installed CLI:**
- `fk create` → Interactive prompt to choose mfe/shell
- `fk create mfe` → Creates microfrontend
- `fk create mfe -n my-app` → Creates microfrontend named "my-app"
- `fk create shell -n my-shell` → Creates shell named "my-shell"

**Using npx (without global installation):**
- `npx @inform-appshell/fusion-kit-cli@latest create` → Interactive prompt to choose mfe/shell
- `npx @inform-appshell/fusion-kit-cli@latest create mfe` → Creates microfrontend
- `npx @inform-appshell/fusion-kit-cli@latest create mfe -n my-app` → Creates microfrontend named "my-app"
- `npx @inform-appshell/fusion-kit-cli@latest create shell -n my-shell` → Creates shell named "my-shell"

# Frameworks

Find below the usage and configuration guide for each framework.

## Angular

### Usage

Run the application with dev config:

```bash
npm run start
```

The app will be accessible at http://localhost:4100, after logging in via Keycloak.

To build with production configuration:

```bash
npm run build
```

You must then serve the files (e.g. with `http-server`). See [here](https://angular.dev/tools/cli/deployment) for more information.

### Configuration

#### Env

The Angular framework configuration is defined in its environment files, found in `src/environments`. When testing locally (e.g. via `npm run start`), `environment.development.ts` will be used by default - which uses the demo Keycloak realm variables, and sets the base URL to `/`. This will work out of the box.

#### Module

To use the application as a remote module, give your host the following remote configuration:

```
  {
      "name": "<app-name>",
      "url": "<app-url>:PORT/remoteEntry.js",
      "type": "webpack",
      "exposedModules": {
        "bootstrap": "./bootstrap"
      }
  }
```

Note the usage of 'webpack' as the bundler type. The full configuration can be found in the `README.md` of the app that you create.

## Vue

### Usage

Run the application locally:

```bash
npm run start
```

The app will be accessible at http://localhost:4300 after logging in via Keycloak.

**Note:** This application will only be able to be accessed via its URL, and not as a module. See below for running where it will be accessible as a module.

Build & run the application with dev config, accessible as a module:

```bash
npm run build-and-run-mfe
```

Again, the app will be available at http://localhost:4300 but `/remoteEntry.js` (required for running as a module) will be exposed.

To build with production configuration, run

```bash
npm run build
```

You can then serve the files via:

```bash
npm run preview
```

### Configuration

#### Env

The Vue framework configuration is defined within its environment files, found at the top level. Initially, `.env.development` and `.env.production` are defined. When testing locally (e.g. via `npm run start`), `.env.development` will be used by default - which uses the demo Keycloak realm variables, and sets the base URL to `/`. This will work out of the box.

#### Module

To use the application as a remote module, give your host the following remote configuration:

```
  {
      "name": "<app-name>",
      "url": "<app-url>:PORT/remoteEntry.js",
      "type": "vite",
      "exposedModules": {
        "bootstrap": "./bootstrap"
      }
  }
```

Note the usage of 'vite' as the bundler type. The full configuration can be found in the `README.md` of the app that you create.

## React

### Usage

Run the application locally:

```bash
npm run start
```

The app will be available at http://localhost:4200 and, like with Vue, will only be available in standalone mode, not as a module. To make it accessible as a module, run

```bash
npm run build-and-run-mfe
```

To build with production configuration, run

```bash
npm run build
```

You can then serve the files via:

```bash
npm run preview
```

### Configuration

#### Env

The React framework configuration is defined within its environment files, found at the top level. Initially, `.env.development` and `.env.production` are defined. When testing locally (e.g. via `npm run start`), `.env.development` will be used by default - which uses the demo Keycloak realm variables, and sets the base URL to `/`. This will work out of the box.

#### Module

To use the application as a remote module, give your host the following remote configuration:

```
  {
      "name": "<app-name>",
      "url": "<app-url>:PORT/remoteEntry.js",
      "type": "vite",
      "exposedModules": {
        "bootstrap": "./bootstrap"
      }
  }
```

# Concepts

### Standalone

The applications, when running, can either be accessed in 'standalone' mode (via their URL), or 'remote' mode (via `remoteEntry.js`, see below). Each framework defines a method of injection to specify whether the app is in standalone or remote mode, and to set up the fusion app as appropriate. It also uses the flag to specify whether certain interface components should be rendered (for example, a header and menu are not required when accessed as a remote).

### Auth

Authentication for remotes is encapsulated within its own service for each framework. This is because applications should not initialize and manage authentication when running as remote - this should be done in the host. The fusion kit provides the functionality to pass authentication information to the remote apps. This information fulfils the `AuthService` contract required for the fusion app.

In standalone mode, the standard `KeyCloakService` defined in `fusion-kit-keycloak` is used.

Where appropriate, the standalone service is extended to include (and the remote service implements) framework-specific attributes or methods (e.g. `Signal` and `Observable` return types for Angular).

#### Token Security Best Practice

Do not store authentication tokens directly in your application code. This creates two problems:

- The token will never be updated automatically
- It poses significant security risks

**Example: Secure Token Usage with `Fetch`**

Here's how to properly pass a token when making a fetch request:

```typescript
const fetchDashboardData = async (url: string): Promise<any> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${fusionApp?.auth.token || ''}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
  }

  return response.json();
};
```

## Socketcluster-client

**1. Using authToken Option (Recommended)**

This is the cleanest way to include the token during the initial handshake:

```typescript
import * as socketCluster from 'socketcluster-client';

const socket = socketCluster.create({
  hostname: 'localhost',
  port: 8000,
  secure: false,
  authToken: 'your-jwt-token-here' // Token sent during handshake
});
```
**2. Using Query Parameters**

Include the token as a query parameter in the connection URL:

```typescript
const socket = socketCluster.create({
  hostname: 'localhost',
  port: 8000,
  secure: false,
  query: {
    token: 'your-jwt-token-here',
    // or
    authorization: 'Bearer your-jwt-token-here'
  }
});
```

**3. Using Custom Headers (if supported by your server)**

```typescript
const socket = socketCluster.create({
  hostname: 'localhost',
  port: 8000,
  secure: false,
  extraHeaders: {
    'Authorization': 'Bearer your-jwt-token-here'
  }
});
```
**4. Angular Service with Dynamic Token Injection**

```typescript
import { Injectable } from '@angular/core';
import * as socketCluster from 'socketcluster-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;

  constructor() {}

  // Initialize socket with token
  connect(bearerToken: string) {
    this.socket = socketCluster.create({
      hostname: 'localhost',
      port: 8000,
      secure: false,
      authToken: bearerToken, // Token included in handshake
      query: {
        // Alternative: also include in query if needed
        authorization: `Bearer ${bearerToken}`
      }
    });

    return this.socket;
  }

  // For scenarios where you need to reconnect with a new token
  reconnectWithToken(newToken: string) {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    return this.connect(newToken);
  }
}
```

**5. Using Connection Event Hooks**

For more advanced scenarios, you can use connection lifecycle hooks:

```typescript
const socket = socketCluster.create({
  hostname: 'localhost',
  port: 8000,
  secure: false,
  authToken: 'your-jwt-token-here'
});

// Listen for connection events
socket.on('connect', (status) => {
  console.log('Connected with auth token:', socket.getAuthToken());
});

socket.on('authenticate', (signedAuthToken) => {
  console.log('Authenticated during handshake');
});

socket.on('authTokenSigned', (signedAuthToken) => {
  console.log('Token signed by server:', signedAuthToken);
});
```

**6. Complete Angular Example with Token Management**

```typescript
import { Injectable } from '@angular/core';
import * as socketCluster from 'socketcluster-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;
  private currentToken: string | null = null;

  // Connect with Bearer token
  connectWithAuth(bearerToken: string) {
    // Remove 'Bearer ' prefix if present
    const token = bearerToken.startsWith('Bearer ') 
      ? bearerToken.substring(7) 
      : bearerToken;

    this.currentToken = token;

    this.socket = socketCluster.create({
      hostname: 'your-server.com',
      port: 8000,
      secure: true, // Use wss:// for production
      authToken: token, // Primary method - sent in handshake
      query: {
        // Backup method - some servers check query params
        token: token
      },
      // Optional: if your server supports custom headers
      extraHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Handle authentication events
    this.socket.on('authenticate', () => {
      console.log('Socket authenticated successfully');
    });

    this.socket.on('deauthenticate', () => {
      console.log('Socket deauthenticated');
    });

    return this.socket;
  }

  // Subscribe to channels (token automatically included)
  subscribe(channelName: string) {
    if (!this.socket) {
      throw new Error('Socket not connected. Call connectWithAuth() first.');
    }
    return this.socket.subscribe(channelName);
  }
}
```

### Key Points:

- `authToken` is the most reliable method - it's built into SocketCluster's authentication flow
- Query parameters work as a fallback if your server checks them
- The token is automatically included in all subsequent channel subscriptions and RPC calls
- Make sure to remove the "Bearer " prefix when using `authToken` - SocketCluster expects just the JWT token

Which approach works best depends on how your backend is configured to validate the token during the handshake. The `authToken` option is typically the most straightforward and widely supported method.

### Exposing Utility Methods

If you want to expose a helper like this:

create a file: utils.ts with the following content:


```typescript
export const add2Values = (a: number, b: number): number => {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  return a + b;
};
```

You have to update `exposes` in the vite.config.ts

```json
 "./utils": "./src/utils/utils.ts"
```

Then, in the Shell, you can refernce the module of the remote like this:

```json
{
    "name": "sample_vue_one",
    "url": "http://localhost:4300/remoteEntry.js",
    "type": "vite",
    "exposedModules": {
      "bootstrap": "./bootstrap",
      "utils": "./utils"
    }
}
```

In your Shell you should create an interface like so:

```typescript
export interface RemoteUtils {
  add2Values: (a: number, b: number) => number;
}
```

Now you can access Utility method like this::

```typescript
const remoteUtils = await fusionApp.remoteManager?.loadUtilityModule<RemoteUtils>('sample_vue_one' ,'utils');
if(remoteUtils){
  console.log('add2Values', remoteUtils.add2Values(2, 3));
}
```