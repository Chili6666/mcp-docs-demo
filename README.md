# FusionKit Documentation MCP Server

A Model Context Protocol (MCP) server that provides dynamic access to FusionKit documentation by indexing markdown files and making them searchable through Claude Code.

## Overview

This MCP server automatically indexes markdown documentation files and provides structured access to:
- **Overview Information** - Introduction, benefits, quick start guides
- **Package Documentation** - Detailed docs for each FusionKit package
- **Code Examples** - Framework-specific examples extracted from docs
- **Migration Guides** - Version upgrade instructions and breaking changes

## How It Works

### Architecture Flow

1. **Lazy Loading**: Documentation is indexed only when first requested
2. **Markdown Processing**: All `.md` files in the `docs/` folder are recursively scanned
3. **Section Extraction**: Each markdown heading becomes a searchable section
4. **Smart Categorization**: Content is automatically categorized by folder structure:
   - `overview/` → Overview content
   - `packages/` → Package documentation  
   - `migration-guide/` → Migration guides
   - Everything else → Examples/tutorials
5. **Caching**: Indexed content is cached in memory for fast subsequent access
6. **Dynamic Responses**: All responses come from actual documentation content (no hardcoded fallbacks)

### Technical Implementation

```typescript
// Lazy initialization - indexing happens on first call
const getIndexedDocs = (): IndexedDocs => {
  if (!indexedDocs) {
    indexedDocs = docIndexer.indexDocs(); // Scans all markdown files
  }
  return indexedDocs; // Cached for subsequent calls
};
```

## Setup Instructions

### 1. Build the Server
```bash
npm run build
```

### 2. Add to Claude Code

**For global access (all projects):**
```bash
claude mcp add -s user mcp-docs-demo node "D:/dev/myGithub/mcp-docs-demo/dist/server.js"
```

**For project-specific access:**
```bash
claude mcp add -s project mcp-docs-demo node "D:/dev/myGithub/mcp-docs-demo/dist/server.js"
```

### 3. Verify Connection
```bash
claude mcp list
```

Or in Claude Code interface: `/mcp list`

The server should show as "✓ Connected" when properly configured.

## Available Tools

### 🔍 `getFusionKitOverview`
**Purpose**: Get high-level overview information about FusionKit
**Parameters**: 
- `section` (optional): `'introduction' | 'keyBenefits' | 'quickStart' | 'deploymentScenarios' | 'all'`

### 📦 `getFusionKitPackages` 
**Purpose**: List all FusionKit packages or get details about a specific package
**Parameters**:
- `packageName` (optional): `'core' | 'cli' | 'contracts' | 'keycloak' | 'module-federation'`

### 📚 `getPackageDocumentation`
**Purpose**: Get detailed documentation for a specific package
**Parameters**:
- `packageName`: `'core' | 'cli' | 'contracts' | 'keycloak' | 'module-federation'`
- `section` (optional): `'overview' | 'installation' | 'api' | 'examples' | 'all'`

### 💻 `getCodeExamples`
**Purpose**: Get code examples for specific use cases and frameworks
**Parameters**:
- `useCase`: `'getting-started' | 'microfrontend-setup' | 'authentication' | 'configuration' | 'service-integration'`
- `framework` (optional): `'angular' | 'react' | 'vue' | 'vanilla'`

### 🔄 `getMigrationGuide`
**Purpose**: Get migration instructions between FusionKit versions
**Parameters**:
- `fromVersion`: Source version (e.g., "1.0.0", "v1")
- `toVersion` (optional): Target version (defaults to "latest")

## Example Queries

### General Overview
- "What is FusionKit and what are its key benefits?"
- "Show me the FusionKit quick start guide"
- "What deployment scenarios does FusionKit support?"
- "Give me a complete overview of FusionKit"

### Package Information
- "Tell me about all FusionKit packages"
- "What does the fusion-kit-core package do?"
- "Show me the API documentation for the CLI package"
- "How do I install the keycloak package?"
- "Give me examples for the module-federation package"

### Code Examples
- "Show me React authentication examples"
- "Give me Angular authentication code examples"
- "How do I set up microfrontends with Vue?"
- "Show me configuration examples for any framework"
- "Provide service integration examples"

### Migration Help
- "How do I migrate from v1 to v2?"
- "Show me the migration guide from version 2.0 to latest"
- "What breaking changes are there between v1 and v3?"
- "Help me upgrade from v1.5 to v2.0"

### Specific Searches
- "Show me all code examples that contain authentication"
- "Find documentation about encrypted storage"
- "What packages mention module federation?"

## Development Workflow

When making changes to the MCP server:

### 1. Build the Server
```bash
npm run build
```

### 2. Restart the MCP Server
```bash
# Remove current server
claude mcp remove mcp-docs-demo -s user

# Re-add updated server  
claude mcp add -s user mcp-docs-demo node "D:/dev/myGithub/mcp-docs-demo/dist/server.js"
```

### 3. Restart VS Code
- **Close VS Code completely**
- **Reopen VS Code** to refresh the MCP connection
- VS Code restart is required to load the updated server

### 4. Test Changes
```bash
# Verify connection
/mcp list

# Test functionality
"What is FusionKit?"
```

## Adding New Documentation

To add new documentation that will be automatically indexed:

1. **Add markdown files** to the `docs/` directory
2. **Use standard markdown headings** (`#`, `##`, `###`, etc.)
3. **Organize by folders**:
   - `docs/overview/` - General information
   - `docs/packages/` - Package-specific docs
   - `docs/migration-guide/` - Version migration info
   - `docs/examples/` - Tutorials and examples
4. **No server restart needed** - documentation is re-indexed automatically

## Architecture Benefits

- ✅ **No Hardcoded Content** - All responses come from actual markdown files
- ✅ **Lazy Loading** - Fast startup, indexing only when needed
- ✅ **Memory Efficient** - Documentation cached after first load
- ✅ **Auto-Discovery** - New markdown files automatically included
- ✅ **Smart Search** - Content searchable by title, content, and file path
- ✅ **Framework Agnostic** - DocIndexer can be reused for any markdown documentation
- ✅ **Error Handling** - Graceful degradation when documentation is missing

## Technical Details

### File Structure
```
src/
├── server.ts              # MCP server setup and tool registration
├── tools/                 # Individual tool implementations
│   ├── documentationTools.ts   # Core documentation functions
│   ├── fusionkit-overview-tool.ts
│   ├── fusionkit-packages-tool.ts
│   ├── package-documentation-tool.ts
│   ├── code-examples-tool.ts
│   └── migration-guide-tool.ts
└── utils/
    ├── docIndexer.ts      # Generic markdown indexing (FusionKit-independent)
    └── serverutils.ts     # MCP response utilities
```

### Key Components

- **`DocIndexer`**: Generic markdown processor (reusable for any documentation)
- **`documentationTools.ts`**: FusionKit-specific logic using indexed content
- **Tool files**: Individual MCP tool definitions with parameter schemas
- **Server registration**: Maps tools to MCP protocol

This architecture makes it easy to adapt the server for different documentation sets by simply changing the folder structure and categorization logic.