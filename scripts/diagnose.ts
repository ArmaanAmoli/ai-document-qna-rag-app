#!/usr/bin/env node
/**
 * Diagnostic script for Recall AI application
 * Run with: npx tsx scripts/diagnose.ts
 * Provides comprehensive health check with actionable remediation
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string;
  remediation?: string;
}

class Diagnostics {
  private results: CheckResult[] = [];
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async run(): Promise<void> {
    console.log('🔍 Recall AI - System Diagnostics\n');
    console.log('='.repeat(60));

    await this.checkEnvironment();
    await this.checkDatabase();
    await this.checkMigrations();
    await this.checkEmbeddingService();
    await this.checkFileStorage();
    await this.checkDependencies();
    await this.checkConfiguration();

    this.printSummary();
    process.exit(this.hasFailures() ? 1 : 0);
  }

  private addResult(result: CheckResult): void {
    this.results.push(result);
    const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
    if (result.details) console.log(`   Details: ${result.details}`);
    if (result.remediation) console.log(`   🔧 Fix: ${result.remediation}`);
  }

  private hasFailures(): boolean {
    return this.results.some(r => r.status === 'fail');
  }

  private printSummary(): void {
    const passes = this.results.filter(r => r.status === 'pass').length;
    const warns = this.results.filter(r => r.status === 'warn').length;
    const fails = this.results.filter(r => r.status === 'fail').length;

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Summary: ${passes} passed, ${warns} warnings, ${fails} failed`);
    
    if (fails > 0) {
      console.log('\n🚨 CRITICAL ISSUES - Application will not work correctly:');
      this.results.filter(r => r.status === 'fail').forEach(r => {
        console.log(`   - ${r.name}: ${r.remediation || r.message}`);
      });
    }
    
    if (warns > 0) {
      console.log('\n⚠️  WARNINGS - Application may have degraded functionality:');
      this.results.filter(r => r.status === 'warn').forEach(r => {
        console.log(`   - ${r.name}: ${r.remediation || r.message}`);
      });
    }
  }

  private async checkEnvironment(): Promise<void> {
    const required = [
      'DATABASE_URL',
      'JWT_SECRET',
      'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GEMINI_API_KEY',
      'EMBEDDING_SERVICE_URL',
    ];

    for (const env of required) {
      if (!process.env[env]) {
        this.addResult({
          name: `ENV: ${env}`,
          status: 'fail',
          message: 'Missing required environment variable',
          remediation: `Add ${env} to .env file`,
        });
      } else {
        this.addResult({
          name: `ENV: ${env}`,
          status: 'pass',
          message: 'Set',
        });
      }
    }

    // Check optional but recommended
    const optional = ['REDIS_URL', 'LANGFUSE_PUBLIC_KEY', 'OTEL_EXPORTER_OTLP_TRACES_ENDPOINT'];
    for (const env of optional) {
      if (!process.env[env]) {
        this.addResult({
          name: `ENV: ${env} (optional)`,
          status: 'warn',
          message: 'Not set (optional)',
          remediation: `Add ${env} to enable caching/observability`,
        });
      }
    }
  }

  private async checkDatabase(): Promise<void> {
    try {
      await this.prisma.$connect();
      await this.prisma.$queryRaw`SELECT 1`;
      
      // Check pgvector extension
      try {
        await this.prisma.$queryRaw`SELECT extname FROM pg_extension WHERE extname = 'vector'`;
        this.addResult({
          name: 'Database: pgvector',
          status: 'pass',
          message: 'pgvector extension installed',
        });
      } catch {
        this.addResult({
          name: 'Database: pgvector',
          status: 'fail',
          message: 'pgvector extension not found',
          remediation: 'Run: CREATE EXTENSION IF NOT EXISTS vector; in PostgreSQL',
        });
      }

      // Check table counts
      const [userCount, chatCount, docCount, chunkCount] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.chat.count(),
        this.prisma.document.count(),
        this.prisma.documentChunk.count(),
      ]);

      this.addResult({
        name: 'Database: Data',
        status: 'pass',
        message: `Users: ${userCount}, Chats: ${chatCount}, Docs: ${docCount}, Chunks: ${chunkCount}`,
      });

    } catch (error) {
      this.addResult({
        name: 'Database: Connection',
        status: 'fail',
        message: `Cannot connect: ${error}`,
        details: String(error),
        remediation: 'Check DATABASE_URL and ensure PostgreSQL is running with pgvector',
      });
    }
  }

  private async checkMigrations(): Promise<void> {
    try {
      const migrationDir = join(process.cwd(), 'prisma', 'migrations');
      if (!existsSync(migrationDir)) {
        this.addResult({
          name: 'Migrations',
          status: 'fail',
          message: 'No migrations directory found',
          remediation: 'Run: pnpm prisma migrate dev',
        });
        return;
      }

      // Check if migrations are applied
      const appliedMigrations = await this.prisma.$queryRaw<{ migration_name: string }[]>`
        SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL ORDER BY started_at
      `;

      const fs = require('fs');
      const migrationFolders = fs.readdirSync(migrationDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)
        .filter(n => n !== '.git');

      const appliedNames = appliedMigrations.map(m => m.migration_name);
      const pending = migrationFolders.filter(m => !appliedNames.includes(m));

      if (pending.length > 0) {
        this.addResult({
          name: 'Migrations',
          status: 'fail',
          message: `${pending.length} pending migrations`,
          details: pending.join(', '),
          remediation: 'Run: pnpm prisma migrate deploy',
        });
      } else {
        this.addResult({
          name: 'Migrations',
          status: 'pass',
          message: `All ${appliedNames.length} migrations applied`,
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Migrations',
        status: 'fail',
        message: `Migration check failed: ${error}`,
        remediation: 'Check database connection and migration table',
      });
    }
  }

  private async checkEmbeddingService(): Promise<void> {
    const url = process.env.EMBEDDING_SERVICE_URL || 'http://localhost:8001';
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${url}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        this.addResult({
          name: 'Embedding Service',
          status: 'pass',
          message: `Healthy at ${url}`,
          details: JSON.stringify(data),
        });
      } else {
        this.addResult({
          name: 'Embedding Service',
          status: 'fail',
          message: `HTTP ${response.status} from ${url}`,
          remediation: 'Start embedding service: cd fastapi-server && source venv/bin/activate && python -m uvicorn main:app --reload --port 8001',
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Embedding Service',
        status: 'fail',
        message: `Cannot reach embedding service at ${url}`,
        details: String(error),
        remediation: 'Start embedding service: cd fastapi-server && source venv/bin/activate && python -m uvicorn main:app --reload --port 8001',
      });
    }

    // Test embedding generation
    try {
      const testResponse = await fetch(`${url}/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: ['test'] }),
      });

      if (testResponse.ok) {
        const data = await testResponse.json();
        const dims = data.embeddings?.[0]?.length || 0;
        this.addResult({
          name: 'Embedding Generation',
          status: dims === 384 ? 'pass' : 'warn',
          message: dims === 384 ? 'Generating 384-dim embeddings' : `Unexpected dimension: ${dims}`,
          remediation: dims === 384 ? undefined : 'Check sentence-transformers model version',
        });
      } else {
        this.addResult({
          name: 'Embedding Generation',
          status: 'fail',
          message: 'Embedding endpoint returned error',
          remediation: 'Check embedding service logs',
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Embedding Generation',
        status: 'fail',
        message: `Embedding test failed: ${error}`,
        remediation: 'Check embedding service is running and model is loaded',
      });
    }
  }

  private async checkFileStorage(): Promise<void> {
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    if (!existsSync(uploadDir)) {
      this.addResult({
        name: 'File Storage',
        status: 'warn',
        message: 'Upload directory does not exist',
        remediation: `Create directory: mkdir -p ${uploadDir}`,
      });
    } else {
      const fs = require('fs');
      const stats = fs.statSync(uploadDir);
      const writable = fs.constants.W_OK & stats.mode;
      
      this.addResult({
        name: 'File Storage',
        status: writable ? 'pass' : 'warn',
        message: `Upload directory exists${writable ? ' (writable)' : ' (NOT writable)'}`,
        details: `Path: ${uploadDir}`,
        remediation: writable ? undefined : `Fix permissions: chmod 755 ${uploadDir}`,
      });
    }

    // Check for pdftotext and pdfinfo
    try {
      execSync('which pdftotext', { stdio: 'ignore' });
      execSync('which pdfinfo', { stdio: 'ignore' });
      this.addResult({
        name: 'PDF Tools',
        status: 'pass',
        message: 'pdftotext and pdfinfo available',
      });
    } catch {
      this.addResult({
        name: 'PDF Tools',
        status: 'fail',
        message: 'pdftotext/pdfinfo not found',
        remediation: 'Install poppler-utils: apt-get install poppler-utils (Ubuntu) or brew install poppler (macOS)',
      });
    }
  }

  private async checkDependencies(): Promise<void> {
    try {
      const pkgPath = join(process.cwd(), 'package.json');
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      
      // Check critical dependencies
      const critical = [
        'next', 'react', 'react-dom',
        '@prisma/client', 'prisma',
        '@google/genai',
        'jsonwebtoken', 'bcrypt',
        '@paralleldrive/cuid2',
        'zod',
      ];

      for (const dep of critical) {
        if (!pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]) {
          this.addResult({
            name: `Dependency: ${dep}`,
            status: 'fail',
            message: 'Missing from package.json',
            remediation: `Run: pnpm add ${dep}`,
          });
        } else {
          this.addResult({
            name: `Dependency: ${dep}`,
            status: 'pass',
            message: 'Installed',
          });
        }
      }

      // Check node_modules
      if (!existsSync(join(process.cwd(), 'node_modules'))) {
        this.addResult({
          name: 'Node Modules',
          status: 'fail',
          message: 'node_modules not found',
          remediation: 'Run: pnpm install',
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Dependencies',
        status: 'fail',
        message: `Dependency check failed: ${error}`,
      });
    }
  }

  private async checkConfiguration(): Promise<void> {
    // Check Next.js config
    const nextConfigPath = join(process.cwd(), 'next.config.ts');
    if (existsSync(nextConfigPath)) {
      this.addResult({ name: 'Next.js Config', status: 'pass', message: 'Config file exists' });
    } else {
      this.addResult({ name: 'Next.js Config', status: 'warn', message: 'next.config.ts not found' });
    }

    // Check TypeScript config
    const tsConfigPath = join(process.cwd(), 'tsconfig.json');
    if (existsSync(tsConfigPath)) {
      this.addResult({ name: 'TypeScript Config', status: 'pass', message: 'Config file exists' });
    } else {
      this.addResult({ name: 'TypeScript Config', status: 'warn', message: 'tsconfig.json not found' });
    }

    // Check Prisma schema
    const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
    if (existsSync(schemaPath)) {
      this.addResult({ name: 'Prisma Schema', status: 'pass', message: 'Schema file exists' });
    } else {
      this.addResult({ name: 'Prisma Schema', status: 'fail', message: 'schema.prisma not found' });
    }

    // Check .env file
    const envPath = join(process.cwd(), '.env');
    if (existsSync(envPath)) {
      this.addResult({ name: 'Environment File', status: 'pass', message: '.env file exists' });
    } else {
      this.addResult({ name: 'Environment File', status: 'warn', message: '.env file not found', remediation: 'Copy .env.example to .env and fill in values' });
    }
  }
}

// Run diagnostics
const diagnostics = new Diagnostics();
diagnostics.run().catch(console.error);
