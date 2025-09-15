# Claude Code Configuration & Preferences

This file contains specific preferences and instructions for working with Claude Code on this project.

## MCP Server Installation Preferences

**User Preference**: I prefer MCP servers to be installed at user-level (`-s user`) rather than project-level (`-s project`), and I don't want `.mcp.json` files in my repositories.

### Preferred Installation Commands

```bash
# Build the server first
npm run build

# Remove any existing configurations
claude mcp remove mcp-docs-demo -s project 2>/dev/null || true
claude mcp remove mcp-docs-demo -s user 2>/dev/null || true

# Install at user level (global access)
claude mcp add -s user mcp-docs-demo node "D:/dev/myGithub/mcp-docs-demo/dist/server.js"

# Clean up any project files that may have been created
rm -f .mcp.json

# Verify installation
claude mcp list
```

### Why User-Level Installation?

- ✅ **Global availability** - works across all projects
- ✅ **Clean repository** - no `.mcp.json` files in project
- ✅ **Personal preference** - user-specific configuration
- ✅ **No version control conflicts** - configuration stored in user's system

### Development Workflow

When making changes to the MCP server:

1. **Build**: `npm run build`
2. **Restart**: Remove and re-add the server using commands above
3. **Test**: Verify with `claude mcp list`

---

*This file serves as a reference for Claude Code to understand user preferences for this project.*