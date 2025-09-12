export interface GetFusionKitOverviewParams {
  section?: 'introduction' | 'keyBenefits' | 'quickStart' | 'deploymentScenarios' | 'all';
}

export interface GetFusionKitPackagesParams {
  packageName?: 'core' | 'cli' | 'contracts' | 'keycloak' | 'module-federation';
}

export interface GetPackageDocumentationParams {
  packageName: 'core' | 'cli' | 'contracts' | 'keycloak' | 'module-federation';
  section?: 'overview' | 'installation' | 'api' | 'examples' | 'all';
}

export interface GetCodeExamplesParams {
  useCase: 'getting-started' | 'microfrontend-setup' | 'authentication' | 'configuration' | 'service-integration';
  framework?: 'angular' | 'react' | 'vue' | 'vanilla';
}

export interface GetMigrationGuideParams {
  fromVersion: string;
  toVersion?: string;
}