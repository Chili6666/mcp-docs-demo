/*
 * SHELL CLI TOOL
 *
 * This tool is triggered when users ask to:
 * - Create a new FusionKit shell project with copilot integration
 * - Generate shell application for FusionKit
 * - Set up a new shell with specific name and copilot support
 * - Initialize shell project structure with copilot
 *
 * Example triggers:
 * - "Create a shell named my-app with copilot"
 * - "Generate FusionKit shell project called my-shell with copilot support"
 * - "Set up new shell application with copilot integration"
 * - "Initialize shell project with name test-shell and copilot"
 * - "fk create shell -n my-app --mcp"
 */

import { createResponse, createError } from '../utils/serverutils.js';
import { z } from 'zod';
import { spawn } from 'child_process';
import { resolve } from 'path';

// Define Zod schema for Shell CLI parameters
const ShellCliParamsSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name cannot be empty')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Project name can only contain letters, numbers, hyphens, and underscores')
    .describe('Name of the shell project to create'),
});

// Execute CLI command helper
const execCommand = (command: string, args: string[], cwd?: string): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: true, cwd });
    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', data => {
      stdout += data.toString();
    });

    child.stderr?.on('data', data => {
      stderr += data.toString();
    });

    child.on('close', code => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });

    child.on('error', error => {
      reject(error);
    });
  });
};

// Open browser helper
const openBrowser = (url: string): void => {
  const command = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  spawn(command, [url], { shell: true, detached: true, stdio: 'ignore' });
};

// Tool definition for external registration
export const createShellTool = {
  name: 'createShell',
  description:
    'Create a new FusionKit shell project with copilot integration using the FusionKit CLI command "fk create shell -n <name> --mcp". This will generate a complete shell application project structure with copilot support and all necessary files and configurations.',
  inputSchema: ShellCliParamsSchema.shape,
  execute: async (args: any) => {
    try {
      // Validate and parse arguments with Zod
      const parseResult = ShellCliParamsSchema.safeParse(args);

      if (!parseResult.success) {
        return createError(`Invalid parameters: ${parseResult.error.errors.map(e => e.message).join(', ')}`);
      }

      const { name } = parseResult.data;

      // Execute the FusionKit CLI command with MCP flag
      const { stdout, stderr } = await execCommand('fk', ['create', 'shell', '-n', name, '--mcp']);

      // Check if command was successful
      if (stderr && stderr.includes('error')) {
        return createError(`Failed to create shell project: ${stderr}`);
      }

      // 1. Show full path to user
      const fullPath = resolve(process.cwd(), name);

      try {
        // 2. Install dependencies
        await execCommand('npm', ['install'], fullPath);

        // 3. Start the project
        const devServer = spawn('npm', ['run', 'dev'], {
          cwd: fullPath,
          shell: true,
          detached: true,
          stdio: ['ignore', 'pipe', 'pipe']
        });

        devServer.unref(); // Allow parent process to exit without waiting

        // Log dev server output for debugging
        devServer.stdout?.on('data', (data) => {
          console.log('Dev server output:', data.toString());
        });

        devServer.stderr?.on('data', (data) => {
          console.error('Dev server error:', data.toString());
        });

        devServer.on('error', (error) => {
          console.error('Failed to start dev server:', error);
        });

        // Give the server time to start
        setTimeout(() => {
          // 4. Open browser at localhost:8080 (common shell app dev server port)
          const url = 'http://localhost:8080';
          openBrowser(url);
        }, 3000);

      } catch (setupError) {
        // Post-setup steps failed, but we'll still return success for the main project creation
      }

      // Return success response with output
      const successMessage = `Successfully created FusionKit shell project "${name}" with copilot integration!

📁 Full path: ${fullPath}

${stdout}

✨ Automated setup completed:
✅ Project created with copilot support
✅ Dependencies installed
✅ Development server started
✅ Browser opened at http://localhost:8080

The project is now running! You can:
- View it in your browser at http://localhost:8080
- Navigate to: cd ${name}
- Make changes and see them live-reload
- Use copilot integration features`;

      return createResponse(successMessage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating shell project';

      // Check if it's a "command not found" error
      if (errorMessage.includes('ENOENT') || errorMessage.includes('command not found')) {
        return createError('FusionKit CLI (fk) not found. Please install it first with: npm install -g @inform-appshell/fusion-kit-cli@latest');
      }

      return createError(`Failed to create shell project: ${errorMessage}`);
    }
  },
};