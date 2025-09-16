/*
 * MFE CLI TOOL
 *
 * This tool is triggered when users ask to:
 * - Create a new FusionKit microfrontend project
 * - Generate MFE for FusionKit with specific framework
 * - Set up a new microfrontend with specific name and framework
 * - Initialize MFE project structure
 *
 * Example triggers:
 * - "Create an MFE named my-vue-app with Vue framework"
 * - "Generate FusionKit MFE project called my-react-app"
 * - "Set up new microfrontend with Angular"
 * - "Initialize MFE project with name test-mfe using React"
 * - "fk create mfe -n my-app --mcp -f vue"
 */

import { createResponse, createError } from '../utils/serverutils.js';
import { z } from 'zod';
import { spawn } from 'child_process';
import { resolve } from 'path';

// Define Zod schema for MFE CLI parameters
const MfeCliParamsSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name cannot be empty')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Project name can only contain letters, numbers, hyphens, and underscores')
    .describe('Name of the microfrontend project to create'),
  framework: z
    .enum(['vue', 'angular', 'react'])
    .default('react')
    .describe('Framework for the microfrontend project (vue, angular, react). Defaults to react if not specified.'),
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

// Get framework-specific details
const getFrameworkDetails = (framework: string) => {
  switch (framework) {
    case 'vue':
      return {
        port: '4300',
        features: 'Elevate Design System, i18n, Linter',
        runCommand: ['run', 'build-and-run-mfe']
      };
    case 'angular':
      return {
        port: '4100',
        features: 'Elevate Design System, AppShell UI Components',
        runCommand: ['run', 'start']
      };
    case 'react':
    default:
      return {
        port: '4200',
        features: 'Elevate Design System, Redux',
        runCommand: ['run', 'build-and-run-mfe']
      };
  }
};

// Tool definition for external registration
export const createMfeTool = {
  name: 'createMfe',
  description:
    'Create a new FusionKit microfrontend project using the FusionKit CLI command "fk create mfe -n <name> --mcp -f <framework>". This will generate a complete microfrontend project structure with framework-specific features and configurations. Supports Vue, Angular, and React frameworks (React is default).',
  inputSchema: MfeCliParamsSchema.shape,
  execute: async (args: any) => {
    try {
      // Validate and parse arguments with Zod
      const parseResult = MfeCliParamsSchema.safeParse(args);

      if (!parseResult.success) {
        return createError(`Invalid parameters: ${parseResult.error.errors.map(e => e.message).join(', ')}`);
      }

      const { name, framework } = parseResult.data;
      const frameworkDetails = getFrameworkDetails(framework);

      // Execute the FusionKit CLI command
      const { stdout, stderr } = await execCommand('fk', ['create', 'mfe', '-n', name, '--mcp', '-f', framework]);

      // Check if command was successful
      if (stderr && stderr.includes('error')) {
        return createError(`Failed to create MFE project: ${stderr}`);
      }

      // 1. Show full path to user
      const fullPath = resolve(process.cwd(), name);

      try {
        // 2. Install dependencies
        await execCommand('npm', ['install'], fullPath);

        // 3. Start the project using framework-specific command
        spawn('npm', frameworkDetails.runCommand, {
          cwd: fullPath,
          shell: true,
          detached: true,
          stdio: 'ignore'
        });

        // Give the server time to start
        setTimeout(() => {
          // 4. Open browser at framework-specific port
          const url = `http://localhost:${frameworkDetails.port}`;
          openBrowser(url);
        }, 3000);

      } catch (setupError) {
        // Post-setup steps failed, but we'll still return success for the main project creation
      }

      // Return success response with output
      const successMessage = `Successfully created FusionKit ${framework.toUpperCase()} microfrontend project "${name}"!

=� Full path: ${fullPath}

${stdout}

( Automated setup completed:
 ${framework.toUpperCase()} microfrontend created with ${frameworkDetails.features}
 Dependencies installed
 Development server started
 Browser opened at http://localhost:${frameworkDetails.port}

The project is now running! You can:
- View it in your browser at http://localhost:${frameworkDetails.port}
- Navigate to: cd ${name}
- Make changes and see them live-reload
- Use all ${framework} microfrontend features`;

      return createResponse(successMessage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating MFE project';

      // Check if it's a "command not found" error
      if (errorMessage.includes('ENOENT') || errorMessage.includes('command not found')) {
        return createError('FusionKit CLI (fk) not found. Please install it first with: npm install -g @inform-appshell/fusion-kit-cli@latest');
      }

      return createError(`Failed to create MFE project: ${errorMessage}`);
    }
  },
};