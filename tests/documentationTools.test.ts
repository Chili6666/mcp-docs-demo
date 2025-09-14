import { 
  getFusionKitOverview, 
  getFusionKitPackages, 
  getPackageDocumentation, 
  getCodeExamples, 
  getMigrationGuide 
} from '../src/tools/documentationTools';

/**
 * Simple TypeScript test suite for documentationTools.ts
 * Run with: npx ts-node tests/documentationTools.test.ts
 */

class TestRunner {
  private results: Array<{name: string, passed: boolean, error?: string}> = [];

  async test(name: string, testFn: () => Promise<void>, shouldThrow = false): Promise<void> {
    try {
      await testFn();
      if (shouldThrow) {
        this.results.push({ name, passed: false, error: 'Expected error but test passed' });
      } else {
        this.results.push({ name, passed: true });
      }
    } catch (error) {
      if (shouldThrow) {
        this.results.push({ name, passed: true });
      } else {
        this.results.push({ name, passed: false, error: (error as Error).message });
      }
    }
  }

  printResults(): void {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    
    console.log('\n=== TEST RESULTS ===');
    
    this.results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      const suffix = result.error ? ` (${result.error})` : '';
      console.log(`${icon} ${result.name}${suffix}`);
    });
    
    console.log(`\n📊 Summary: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
      console.log('🎉 All tests passed!');
    }
  }
}

async function runTests(): Promise<void> {
  const runner = new TestRunner();
  
  console.log('🚀 Running TypeScript tests...\n');

  // Test getFusionKitOverview
  await runner.test('README: "What is FusionKit and what are its key benefits?"', async () => {
    const result = await getFusionKitOverview();
    
    if (!('introduction' in result)) throw new Error('Missing introduction');
    if (!('keyBenefits' in result)) throw new Error('Missing keyBenefits');
    if (!Array.isArray(result.keyBenefits)) throw new Error('keyBenefits must be array');
    if (result.keyBenefits.length === 0) throw new Error('keyBenefits cannot be empty');
  });

  // Test getPackageDocumentation
  await runner.test('README: "Show me the API documentation for the CLI package"', async () => {
    const result = await getPackageDocumentation('cli', 'api');
    
    if (!('api' in result)) throw new Error('Missing api property');
    if (typeof result.api !== 'string') throw new Error('api must be string');
    if (!result.api.includes('fk create')) throw new Error('CLI API must contain commands');
  });

  // Test parameter validation
  await runner.test('Parameter validation: undefined packageName should throw', async () => {
    await getPackageDocumentation(undefined as any, 'api');
  }, true);

  // Test getCodeExamples
  await runner.test('README: "Show me React authentication examples"', async () => {
    const result = await getCodeExamples('authentication', 'react');
    
    if (result.useCase !== 'authentication') throw new Error('useCase mismatch');
    if (result.framework !== 'react') throw new Error('framework mismatch');
    if (typeof result.code !== 'string') throw new Error('code must be string');
  });

  // Test getMigrationGuide
  await runner.test('README: "How do I migrate from v1 to v2?"', async () => {
    const result = await getMigrationGuide('v1', 'v2');

    if (!('title' in result)) throw new Error('Missing title');
    if (!('overview' in result)) throw new Error('Missing overview');
    if (!Array.isArray(result.breakingChanges)) throw new Error('breakingChanges must be array');
  });

  // Test undefined values for all methods
  await runner.test('getFusionKitOverview with undefined should work', async () => {
    const result = await getFusionKitOverview();
    if (!result) throw new Error('Result should not be null');
  });

  await runner.test('getFusionKitPackages with undefined should work', async () => {
    const result = await getFusionKitPackages();
    if (!result) throw new Error('Result should not be null');
  });

  await runner.test('getPackageDocumentation with undefined packageName should throw', async () => {
    await getPackageDocumentation(undefined as any, 'api');
  }, true);

  await runner.test('getPackageDocumentation with undefined section should throw', async () => {
    await getPackageDocumentation('core', undefined as any);
  }, true);

  await runner.test('getCodeExamples with undefined useCase should throw', async () => {
    await getCodeExamples(undefined as any, 'react');
  }, true);

  await runner.test('getCodeExamples with undefined framework should throw', async () => {
    await getCodeExamples('authentication', undefined as any);
  }, true);

  await runner.test('getMigrationGuide with undefined fromVersion should throw', async () => {
    await getMigrationGuide(undefined as any, 'v2');
  }, true);

  await runner.test('getMigrationGuide with undefined toVersion should throw', async () => {
    await getMigrationGuide('v1', undefined as any);
  }, true);

  // Test invalid/non-fitting parameter types
  await runner.test('getPackageDocumentation with number instead of string should throw', async () => {
    await getPackageDocumentation(123 as any, 'api');
  }, true);

  await runner.test('getPackageDocumentation with object instead of string should throw', async () => {
    await getPackageDocumentation({name: 'test'} as any, 'api');
  }, true);

  await runner.test('getCodeExamples with array instead of string should throw', async () => {
    await getCodeExamples(['auth'] as any, 'react');
  }, true);

  await runner.test('getMigrationGuide with boolean instead of string should throw', async () => {
    await getMigrationGuide(true as any, 'v2');
  }, true);

  // Test edge cases with empty strings and weird values
  await runner.test('getPackageDocumentation with empty string should throw', async () => {
    await getPackageDocumentation('', 'api');
  }, true);

  await runner.test('getCodeExamples with empty string should throw', async () => {
    await getCodeExamples('', 'react');
  }, true);

  await runner.test('getMigrationGuide with empty strings should throw', async () => {
    await getMigrationGuide('', '');
  }, true);

  await runner.test('getPackageDocumentation with whitespace-only string should throw', async () => {
    await getPackageDocumentation('   ', 'api');
  }, true);

  await runner.test('getCodeExamples with special characters should throw', async () => {
    await getCodeExamples('!@#$%^&*()', 'react');
  }, true);

  await runner.test('getMigrationGuide with null values should throw', async () => {
    await getMigrationGuide(null as any, null as any);
  }, true);

  // Test with extremely long strings
  await runner.test('getPackageDocumentation with extremely long string should throw', async () => {
    const longString = 'a'.repeat(10000);
    await getPackageDocumentation(longString, 'api');
  }, true);

  // Test with non-existent packages/frameworks
  await runner.test('getPackageDocumentation with non-existent package should handle gracefully', async () => {
    const result = await getPackageDocumentation('non-existent-package-xyz', 'api');
    if (!result) throw new Error('Should return something even for non-existent packages');
  });

  await runner.test('getCodeExamples with non-existent framework should handle gracefully', async () => {
    const result = await getCodeExamples('authentication', 'non-existent-framework-xyz');
    if (!result) throw new Error('Should return something even for non-existent frameworks');
  });

  runner.printResults();
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}