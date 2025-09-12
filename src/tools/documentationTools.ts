// FusionKit Documentation Tools

interface FusionKitOverview {
  introduction: string;
  keyBenefits: string[];
  quickStart: string;
  deploymentScenarios: string[];
}

interface PackageDocumentation {
  overview: string;
  installation: string;
  api: string;
  examples: string;
}

interface MigrationGuide {
  title: string;
  overview: string;
  breakingChanges: string[];
  steps: string[];
  codeChanges: string;
}

interface CodeExample {
  useCase: string;
  framework: string;
  code: string;
}

export const getFusionKitOverview = async (section?: string): Promise<FusionKitOverview | Partial<FusionKitOverview>> => {
  const overview: FusionKitOverview = {
    introduction: 'FusionKit is a comprehensive foundational library designed to standardize and streamline the development of both standalone applications and microfrontend applications.',
    keyBenefits: ['Standardization', 'Microfrontend Enablement', 'Reduced Development Time', 'Enhanced Security', 'Framework Agnostic'],
    quickStart: 'Install globally: npm install -g @inform-appshell/fusion-kit-cli@latest, then create a new microfrontend: fk create mfe -n my-app',
    deploymentScenarios: ['Standalone Applications', 'Microfrontends in a Shell']
  };

  if (!section || section === 'all') {
    return overview;
  }

  if (section in overview) {
    return { [section]: overview[section as keyof FusionKitOverview] };
  }

  throw new Error(`Section "${section}" not found`);
};

export const getFusionKitPackages = async (packageName?: string): Promise<Record<string, string> | { [key: string]: string }> => {
  const packages: Record<string, string> = {
    'fusion-kit-core': 'Core foundational services and utilities for FusionKit applications',
    'fusion-kit-cli': 'Command-line interface for creating and managing FusionKit applications',
    'fusion-kit-contracts': 'Type definitions and contracts for FusionKit services',
    'fusion-kit-keycloak': 'Keycloak integration services for authentication and authorization',
    'fusion-kit-module-federation': 'Module federation utilities for microfrontend architecture'
  };

  if (packageName) {
    const key = `fusion-kit-${packageName}`;
    const packageInfo = packages[key] || packages[packageName];
    if (packageInfo) {
      return { [packageName]: packageInfo };
    } else {
      throw new Error(`Package "${packageName}" not found`);
    }
  }

  return packages;
};

export const getPackageDocumentation = async (packageName: string, section?: string): Promise<PackageDocumentation | Partial<PackageDocumentation>> => {
  const packageDocs: Record<string, PackageDocumentation> = {
    core: {
      overview: 'FusionKit Core provides foundational services including configuration management, logging, and service orchestration',
      installation: 'npm install @inform-appshell/fusion-kit-core',
      api: 'Main exports: ConfigService, LoggingService, ServiceRegistry',
      examples: 'Example: const config = new ConfigService(); config.get("apiUrl");'
    },
    cli: {
      overview: 'Command-line tool for scaffolding and managing FusionKit applications',
      installation: 'npm install -g @inform-appshell/fusion-kit-cli@latest',
      api: 'Commands: create, build, serve, test',
      examples: 'fk create mfe -n my-microfrontend'
    },
    contracts: {
      overview: 'TypeScript definitions and service contracts for FusionKit ecosystem',
      installation: 'npm install @inform-appshell/fusion-kit-contracts',
      api: 'Exports interfaces for all FusionKit services',
      examples: 'import { IConfigService } from "@inform-appshell/fusion-kit-contracts";'
    },
    keycloak: {
      overview: 'Keycloak integration for authentication and authorization in FusionKit apps',
      installation: 'npm install @inform-appshell/fusion-kit-keycloak',
      api: 'KeycloakService, AuthGuard, TokenInterceptor',
      examples: 'const auth = new KeycloakService(); auth.login();'
    },
    'module-federation': {
      overview: 'Webpack Module Federation utilities for microfrontend architecture',
      installation: 'npm install @inform-appshell/fusion-kit-module-federation',
      api: 'ModuleFederationPlugin, RemoteService',
      examples: 'Configure webpack with ModuleFederationPlugin for dynamic imports'
    }
  };

  const docs = packageDocs[packageName];
  if (!docs) {
    throw new Error(`Documentation for package "${packageName}" not found`);
  }

  if (!section || section === 'all') {
    return docs;
  }

  if (section in docs) {
    return { [section]: docs[section as keyof PackageDocumentation] };
  }

  throw new Error(`Section "${section}" not found for package "${packageName}"`);
};

export const getCodeExamples = async (useCase: string, framework?: string): Promise<CodeExample> => {
  const examples: Record<string, Record<string, string>> = {
    'getting-started': {
      angular: 'import { FusionKitModule } from "@inform-appshell/fusion-kit-core";\n\n@NgModule({\n  imports: [FusionKitModule.forRoot()]\n})',
      react: 'import { FusionKitProvider } from "@inform-appshell/fusion-kit-react";\n\nfunction App() {\n  return <FusionKitProvider><YourApp /></FusionKitProvider>;\n}',
      vue: 'import { createFusionKit } from "@inform-appshell/fusion-kit-vue";\n\nconst app = createApp(App);\napp.use(createFusionKit());'
    },
    'microfrontend-setup': {
      angular: 'const ModuleFederationPlugin = require("@inform-appshell/fusion-kit-module-federation");\n\nmodule.exports = {\n  plugins: [\n    new ModuleFederationPlugin({\n      name: "mfe1",\n      exposes: { "./Component": "./src/app/app.component" }\n    })\n  ]\n};'
    },
    'authentication': {
      angular: 'import { KeycloakService } from "@inform-appshell/fusion-kit-keycloak";\n\nconstructor(private keycloak: KeycloakService) {}\n\nasync login() {\n  await this.keycloak.login();\n}'
    },
    'configuration': {
      angular: 'import { ConfigService } from "@inform-appshell/fusion-kit-core";\n\nconstructor(private config: ConfigService) {}\n\nget apiUrl() {\n  return this.config.get("api.baseUrl");\n}'
    }
  };

  const useFramework = framework || 'angular';
  const exampleSet = examples[useCase];

  if (!exampleSet) {
    throw new Error(`No examples found for use case "${useCase}"`);
  }

  const example = exampleSet[useFramework] || exampleSet['angular'] || Object.values(exampleSet)[0];

  return {
    useCase,
    framework: useFramework,
    code: example
  };
};

export const getMigrationGuide = async (fromVersion: string, toVersion?: string): Promise<MigrationGuide> => {
  const migrationGuides: Record<string, MigrationGuide> = {
    'v1-to-v2': {
      title: 'Migration from V1 to V2',
      overview: 'FusionKit V2 introduces breaking changes to service initialization and configuration management',
      breakingChanges: [
        'ConfigService constructor now requires configuration object',
        'Service registration moved to ServiceRegistry',
        'Authentication service renamed from AuthService to KeycloakService'
      ],
      steps: [
        'Update package versions to V2',
        'Migrate service initialization code',
        'Update configuration imports',
        'Test all authentication flows'
      ],
      codeChanges: 'Before: new ConfigService()\nAfter: new ConfigService(config)'
    }
  };

  const migrationKey = `${fromVersion}-to-${toVersion || 'latest'}`;
  const guide = migrationGuides[migrationKey] || migrationGuides['v1-to-v2'];

  return guide;
};