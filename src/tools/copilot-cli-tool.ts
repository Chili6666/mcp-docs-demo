/*
 * COPILOT CLI TOOL
 *
 * This tool is triggered when users ask to:
 * - Create a new FusionKit copilot project
 * - Generate MCP server for FusionKit documentation
 * - Set up a new copilot with specific name
 * - Initialize copilot project structure
 *
 * Example triggers:
 * - "Create a copilot named mycopilot"
 * - "Generate FusionKit copilot project called volker"
 * - "Set up new copilot for documentation"
 * - "Initialize copilot project with name test-copilot"
 * - "fk create copilot -n projectname"
 */

import { createResponse, createError } from '../utils/serverutils.js';
import { z } from 'zod';
import { spawn } from 'child_process';
import { resolve } from 'path';

// Define Zod schema for Copilot CLI parameters
const CopilotCliParamsSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name cannot be empty')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Project name can only contain letters, numbers, hyphens, and underscores')
    .describe('Name of the copilot project to create'),
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
export const createCopilotTool = {
  name: 'createCopilot',
  description:
    'Create a new FusionKit copilot project using the FusionKit CLI command "fk create copilot -n <name>". This will generate a complete MCP server project structure with all necessary files and configurations.',
  inputSchema: CopilotCliParamsSchema.shape,
  execute: async (args: any) => {
    try {
      // Validate and parse arguments with Zod
      const parseResult = CopilotCliParamsSchema.safeParse(args);

      if (!parseResult.success) {
        return createError(`Invalid parameters: ${parseResult.error.errors.map(e => e.message).join(', ')}`);
      }

      const { name } = parseResult.data;

      // Execute the FusionKit CLI command
      const { stdout, stderr } = await execCommand('fk', ['create', 'copilot', '-n', name]);

      // Check if command was successful
      if (stderr && stderr.includes('error')) {
        return createError(`Failed to create copilot project: ${stderr}`);
      }

      // 1. Show full path to user
      const fullPath = resolve(process.cwd(), name);

      try {
        // 2. Install dependencies
        await execCommand('npm', ['install'], fullPath);

        // 3. Start the project
        spawn('npm', ['run', 'start'], {
          cwd: fullPath,
          shell: true,
          detached: true,
          stdio: 'ignore'
        });

        // Give the server time to start
        setTimeout(() => {
          // 4. Open browser at localhost:4400 (common Vue dev server port)
          const url = 'http://localhost:4400';
          openBrowser(url);
        }, 3000);

      } catch (setupError) {
        // Post-setup steps failed, but we'll still return success for the main project creation
      }

      // Return success response with output
      const successMessage = `Successfully created FusionKit copilot project "${name}"!

📁 Full path: ${fullPath}

${stdout}

✨ Automated setup completed:
✅ Project created
✅ Dependencies installed
✅ Development server started
✅ Browser opened at http://localhost:4400

The project is now running! You can:
- View it in your browser at http://localhost:4400
- Navigate to: cd ${name}
- Make changes and see them live-reload`;

      return createResponse(successMessage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating copilot project';

      // Check if it's a "command not found" error
      if (errorMessage.includes('ENOENT') || errorMessage.includes('command not found')) {
        return createError('FusionKit CLI (fk) not found. Please install it first with: npm install -g @inform-appshell/fusion-kit-cli@latest');
      }

      return createError(`Failed to create copilot project: ${errorMessage}`);
    }
  },
};
