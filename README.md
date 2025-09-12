# MCP Demo Server

A sample MCP server implementation.

## Adding to Claude Code

To register this MCP server with Claude Code:

1. **Build the server**:
   ```bash
   npm run build
   ```

2. **Add the server** using one of these scopes:

   **For global access (all projects):**
   ```bash
   claude mcp add -s user mcp-docs-demo node "D:/dev/myGithub/mcp-docs-demo/dist/server.js"
   ```

   **For project-specific access:**
   ```bash
   claude mcp add -s project mcp-docs-demo node "D:/dev/myGithub/mcp-docs-demo/dist/server.js"
   ```

3. **Verify connection**:
   ```bash
   claude mcp list
   ```

   Or in Claude Code interface: `/mcp list`

The server should show as "✓ Connected" when properly configured.

## Example Queries

Once the MCP server is connected, you can ask Claude Code questions about FusionKit documentation.

## Development Workflow

When you make changes to the MCP server code, follow these steps:

### 1. Build the Server
```bash
npm run build
```

### 2. Restart the MCP Server
```bash
# Remove the current server
claude mcp remove mcp-docs-demo -s user

# Re-add the server  
claude mcp add -s user mcp-docs-demo node "D:/dev/myGithub/mcp-docs-demo/dist/server.js"
```

### 3. Restart VS Code
- **Close VS Code completely**
- **Reopen VS Code** to refresh the MCP connection
- VS Code needs to be restarted to pick up the updated server

### 4. Verify Connection
In Claude Code interface:
```
/mcp list
```
Should show: `mcp-docs-demo - ✓ Connected`

### 5. Test Your Changes
Try asking questions like:
- "What is FusionKit?"

**Note**: Always restart VS Code after rebuilding the MCP server to ensure the Claude Code extension loads the updated version.



## MCP Tool Registration Patterns

When developing MCP tools with the SDK, use different registration patterns based on parameter count:

### Single Parameter Tools
For tools with one parameter, use the schema object format:
```typescript
server.tool(
  'toolName',
  {
    paramName: {
      type: 'string',
      description: 'Parameter description',
      optional: true, // if optional
    },
  },
  async ({ paramName }: ParamsInterface) => {
    // implementation
  }
);
```

### Multiple Parameter Tools
For tools with multiple parameters, use the description string format:
```typescript
server.tool(
  'toolName',
  'Tool description',
  async (args: any) => {
    const { param1, param2 = 'default' } = args as ParamsInterface;
    // implementation
  }
);
```

## Available Tools

This MCP server provides the following tools:

- **getFusionKitOverview** - Get overview of FusionKit platform
- **getFusionKitPackages** - Get details about specific FusionKit packages  
- **getPackageDocumentation** - Get documentation for specific packages
- **getCodeExamples** - Get code examples for different use cases and frameworks
- **getMigrationGuide** - Get migration guides between versions

## Example Questions

### FusionKit Overview
- "What is FusionKit?"
- "Give me an overview of FusionKit's key benefits"
- "Show me FusionKit quick start guide"
- "What are the deployment scenarios for FusionKit?"

### Package Information
- "Tell me about the FusionKit core package"
- "What packages are available in FusionKit?"
- "Show me documentation for the CLI package"
- "How do I use the module federation package?"

### Code Examples
- "Show me getting started code examples"
- "Give me React examples for authentication"
- "Show me Angular microfrontend setup code"
- "Provide Vue.js configuration examples"

### Migration Guides
- "How do I migrate from v1 to v2?"
- "Show me migration guide from v2.0 to latest"
- "What's changed between v1 and v3?"
