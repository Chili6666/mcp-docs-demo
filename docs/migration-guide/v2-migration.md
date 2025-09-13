# v2.0.0 Migration Guide

This guide provides detailed instructions for migrating from fusion-kit v1.x to v2.0.0, which introduces significant breaking changes to the remote module system.

## Table of Contents

- [Overview of Changes](#overview-of-changes)
- [Breaking Changes](#breaking-changes)
- [Step-by-Step Migration](#step-by-step-migration)
- [Code Examples](#code-examples)

## Overview of Changes

### What Changed

fusion-kit v2.0.0 introduces a complete redesign of the remote module system to provide:
- **Better Module Federation Support**: More explicit module mapping
- **Enhanced Type Safety**: Improved TypeScript support
- **Utility Module Support**: Separate handling for utility vs. full modules
- **Health Monitoring**: Built-in remote health checking
- **Simplified Configuration**: Cleaner configuration structure

### Major Breaking Changes

1. **RemoteConfiguration Interface**: Complete restructure
2. **RemoteManager Interface**: New federation-based API
3. **New Interfaces**: RemotesConfiguration and RemoteHealthStatus
4. **Removed Properties**: Deprecated bundler and format types
5. **Method Signatures**: Updated parameter structures

## Breaking Changes

### 1. RemoteConfiguration Interface

The RemoteConfiguration interface has been completely redesigned:

**Before (v1.x):**
```typescript
interface RemoteConfiguration {
  url: string;
  name: string;
  module: string;
  format?: 'esm' | 'systemjs' | 'var';
  bundler?: 'vite' | 'webpack';
}
```

**After (v2.0):**
```typescript
interface RemoteConfiguration {
  name: string;
  url: string;
  exposedModules: Record<string, string>;
  type: 'vite' | 'webpack';
}
```

**Key Changes:**
- `bundler` → `type` (required, no optional)
- `format` → **removed** (no longer needed)
- `module` → `exposedModules` (single string to object mapping)
- Property order changed (name first)

### 2. RemoteManager Interface

Complete API redesign with new method structure:

**Before (v1.x):**
```typescript
interface RemoteManager {
  loadRemoteModules(configs: RemoteConfiguration[]): Promise<void>;
  getRemoteModuleConfiguration(name: string): RemoteConfiguration | undefined;
  getLoadedRemoteModules(): Module[];
  getLoadedNonBootstrapableRemoteModule<T>(name: string): T | undefined;
}
```

**After (v2.0):**
```typescript
interface RemoteManager {
  // Configuration management
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
```

### 3. New Interfaces

**RemotesConfiguration** (new):
```typescript
interface RemotesConfiguration {
  appName: string;
  remotes: RemoteConfiguration[];
  shared?: Record<string, unknown>;
}
```

**RemoteHealthStatus** (new):
```typescript
interface RemoteHealthStatus {
  isHealthy: boolean;
  lastChecked: Date;
  responseTime?: number;
  error?: string;
}
```

## Step-by-Step Migration

### Step 1: Update Package Dependencies

```bash
npm install @inform-appshell/fusion-kit-contracts@2.0.0
npm install @inform-appshell/fusion-kit-core@2.1.1
npm install @inform-appshell/fusion-kit-keycloak@2.0.1
npm install @inform-appshell/fusion-kit-module-federation@1.2.0

```

### Step 2: Update RemoteConfiguration Objects

Transform your existing remote configurations:

**Before:**
```typescript
const remoteConfigs: RemoteConfiguration[] = [
  {
    url: 'http://localhost:3001/remoteEntry.js',
    name: 'designSystem',
    module: './Button',
    format: 'esm',
    bundler: 'vite'
  },
  {
    url: 'http://localhost:3002/remoteEntry.js', 
    name: 'dashboard',
    module: './DashboardApp',
    bundler: 'webpack'
  }
];
```

**After:**
```typescript
const remoteConfigs: RemoteConfiguration[] = [
  {
    name: 'designSystem',
    url: 'http://localhost:3001/remoteEntry.js',
    type: 'vite', // renamed from 'bundler'
    exposedModules: {
      'Button': './Button', // moved from 'module'
      'Modal': './Modal',   // can expose multiple modules
      'utils': './utils/index'
    }
  },
  {
    name: 'dashboard', 
    url: 'http://localhost:3002/remoteEntry.js',
    type: 'webpack',
    exposedModules: {
      'DashboardApp': './DashboardApp',
      'widgets': './widgets/index'
    }
  }
];
```

### Step 3: Create RemotesConfiguration

Wrap your remote configurations in the new RemotesConfiguration structure:

```typescript
const remotesConfig: RemotesConfiguration = {
  appName: 'my-host-app',
  remotes: remoteConfigs,
  shared: {
    'react': { singleton: true, requiredVersion: '^18.0.0' },
    'react-dom': { singleton: true, requiredVersion: '^18.0.0' }
  }
};
```

### Step 4: Update RemoteManager Usage

Replace old RemoteManager method calls:

**Before:**
```typescript
// Old initialization
await remoteManager.loadRemoteModules(remoteConfigs);

// Old module retrieval
const modules = remoteManager.getLoadedRemoteModules();
const config = remoteManager.getRemoteModuleConfiguration('designSystem');
const utility = remoteManager.getLoadedNonBootstrapableRemoteModule<Utils>('designSystem/utils');
```

**After:**
```typescript
// New initialization
remoteManager.configure(remotesConfig);

// New module loading
const buttonModule = await remoteManager.loadModule('designSystem', 'Button');
const allModules = await remoteManager.getAllModules();
const designSystemModules = await remoteManager.getModulesByRemote('designSystem');

// New utility loading
const utils = await remoteManager.loadUtilityModule<Utils>('designSystem', 'utils');
const cachedUtils = remoteManager.getLoadedUtilityModule<Utils>('designSystem/utils');
```

### Step 5: Update Module Federation Configuration

Update your webpack/vite module federation configuration to match the new exposed modules structure:

**Vite Module Federation (vite.config.ts):**
```typescript
import { defineConfig } from 'vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'designSystem',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/components/Button',
        './Modal': './src/components/Modal', 
        './utils': './src/utils/index'
      },
      shared: ['react', 'react-dom']
    })
  ]
});
```

**Webpack Module Federation (webpack.config.js):**
```javascript
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'designSystem',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/components/Button',
        './Modal': './src/components/Modal',
        './utils': './src/utils/index'
      },
      shared: share({
        '@angular/core': {
          singleton: true,
          strictVersion: false,
          requiredVersion: 'auto',
        }
        // add other shared libs here
      })
    })
  ]
};
```

## Code Examples

### Complete Migration Example

**Before (v1.x):**
```typescript
import { RemoteManager, RemoteConfiguration } from '@inform-appshell/fusion-kit-contracts';

class OldRemoteService {
  constructor(private remoteManager: RemoteManager) {}

  async initializeRemotes() {
    const configs: RemoteConfiguration[] = [
      {
        url: 'http://localhost:3001/remoteEntry.js',
        name: 'components',
        module: './Button',
        bundler: 'vite'
      }
    ];

    await this.remoteManager.loadRemoteModules(configs);
    
    const modules = this.remoteManager.getLoadedRemoteModules();
    const utility = this.remoteManager.getLoadedNonBootstrapableRemoteModule('components/helpers');
    
    return modules;
  }
}
```

**After (v2.0):**
```typescript
import { 
  RemoteManager, 
  RemoteConfiguration, 
  RemotesConfiguration 
} from '@inform-appshell/fusion-kit-contracts';

class NewRemoteService {
  constructor(private remoteManager: FederationModuleManager) {}

  async initializeRemotes() {
    const remotesConfig: RemotesConfiguration = {
      appName: 'my-app',
      remotes: [
        {
          name: 'components',
          url: 'http://localhost:3001/remoteEntry.js',
          type: 'vite',
          exposedModules: {
            'Button': './Button',
            'helpers': './helpers/index'
          }
        }
      ],
      shared: {
        'react': { singleton: true }
      }
    };

    this.remoteManager.configure(remotesConfig);
    
    // Load specific modules
    const buttonModule = await this.remoteManager.loadModule('components', 'Button');
    const helpers = await this.remoteManager.loadUtilityModule('components', 'helpers');
    
    // Get all modules from all remotes
    const allModules = await this.remoteManager.getAllModules();
    
    return allModules;
  }
}
```

### Utility vs Full Module Loading

```typescript
// Full modules (implement Module interface)
const dashboardModule = await remoteManager.loadModule('analytics', 'Dashboard');
// dashboardModule has: name, title, description, mount(), unmount(), etc.

// Utility modules (any type, no Module interface requirement)
const formatters = await remoteManager.loadUtilityModule<FormattersType>('utils', 'formatters');
const validators = await remoteManager.loadUtilityModule<ValidatorsType>('utils', 'validators');

// Type-safe utility loading
interface UtilityAPI {
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date) => string;
}

const utils = await remoteManager.loadUtilityModule<UtilityAPI>('shared', 'formatters');
const formatted = utils.formatCurrency(1000); // Type-safe!
```