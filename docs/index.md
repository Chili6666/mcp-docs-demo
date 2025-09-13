# FusionKit Documentation

Welcome to the **FusionKit** ecosystem documentation. FusionKit is a comprehensive foundational library designed to standardize and streamline the development of both standalone applications and microfrontend applications.

## What is FusionKit?

FusionKit provides a suite of services, utilities, and patterns that enable developers to build scalable, maintainable, and feature-rich frontends with consistent behavior across applications. It supports two main deployment scenarios:

- **Standalone Applications**: Run independently with their own services and configurations
- **Microfrontends in a Shell**: When hosted within a shell application, microfrontends automatically inherit and reuse shared services from the shell

## Key Benefits

- **Standardization**: Provides reusable services and utilities ensuring consistency across frontend applications
- **Microfrontend Enablement**: Offers tools and patterns for creating and managing microfrontend applications
- **Reduced Development Time**: Prebuilt services allow developers to focus on application-specific features
- **Enhanced Security**: Features like encrypted storage ensure sensitive data is handled securely
- **Framework Agnostic**: Supports Angular, React, and Vue through the CLI and standardized patterns

## Quick Start

Get started quickly with the FusionKit CLI:

```bash
# Install globally
npm install -g @inform-appshell/fusion-kit-cli@latest

# Create a new microfrontend
fk create mfe -n my-app

# Create a shell application  
fk create shell -n my-shell
```

## Table of Contents

- [Overview](overview/index.md) - Core concepts and architecture
- [Packages](packages/index.md) - Detailed package documentation
- [Examples](examples/index.md) - Usage examples and tutorials
- [Migration Guide](migration-guide/index.md) - Migration guides and breaking changes

## Getting Help

For questions, issues, or contributions, please refer to the individual package repositories or contact the development team.