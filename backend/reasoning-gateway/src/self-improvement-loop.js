/**
 * Self-Improvement Loop
 * Liv Hana's autonomous learning and optimization system
 *
 * Continuously monitors, learns, and improves the entire platform
 * - Learns from customer interactions
 * - Optimizes performance automatically
 * - Detects and fixes bugs
 * - Discovers and implements features
 * - Generates improvement proposals for approval
 */

import Anthropic from '@anthropic-ai/sdk';
import { BigQuery } from '@google-cloud/bigquery';
import { createClient } from 'redis';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import express from 'express';

const execAsync = promisify(exec);

export class SelfImprovementLoop {
  constructor({ logger, apiKey, bigQueryClient, redisClient }) {
    this.logger = logger;
    this.claude = new Anthropic({ apiKey });
    this.bigQuery = bigQueryClient || new BigQuery();
    this.redis = redisClient;
    this.projectRoot = join(process.cwd(), '../..');

    // Configuration
    this.config = {
      minInteractionsForLearning: 100,
      minErrorsForBugReport: 5,
      minFeatureRequestsForProposal: 3,
      performanceThresholdMs: 2000,
      analysisInterval: 24 * 60 * 60 * 1000, // 24 hours
      approvalRequired: true,
      maxAutoFixesPerDay: 5,
      testRequired: true,
    };

    // Metrics
    this.metrics = {
      improvementsProposed: 0,
      improvementsApproved: 0,
      improvementsImplemented: 0,
      bugsDetected: 0,
      bugsFixed: 0,
      featuresDiscovered: 0,
      featuresImplemented: 0,
      performanceImprovements: 0,
      testsGenerated: 0,
      docsGenerated: 0,
    };

    // Safety rails
    this.safetyChecks = {
      requireApproval: true,
      requireTests: true,
      requireReview: true,
      allowProductionDeploy: false,
      maxChangesPerProposal: 10,
      maxLinesPerChange: 500,
    };
  }

  /**
   * Initialize the self-improvement loop
   */
  static async create({ logger }) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY required for self-improvement');
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const redisClient = createClient({ url: redisUrl });
    await redisClient.connect();

    const instance = new SelfImprovementLoop({
      logger,
      apiKey,
      bigQueryClient: new BigQuery(),
      redisClient,
    });

    logger.info('Self-improvement loop initialized');
    return instance;
  }

  /**
   * Main loop - runs all improvement analyses
   */
  async runImprovementCycle() {
    this.logger.info('Starting self-improvement cycle');

    try {
      const results = {
        timestamp: new Date().toISOString(),
        learning: await this.analyzeLearningOpportunities(),
        performance: await this.analyzePerformanceOptimizations(),
        codeQuality: await this.analyzeCodeQualityImprovements(),
        features: await this.analyzeFeatureDiscovery(),
        bugs: await this.analyzeBugDetection(),
        proposals: [],
      };

      // Generate improvement proposals
      const proposals = await this.generateImprovementProposals(results);
      results.proposals = proposals;

      // Store results
      await this.storeAnalysisResults(results);

      // Send proposals for approval
      if (proposals.length > 0) {
        await this.sendProposalsForApproval(proposals);
      }

      this.logger.info({
        proposalsGenerated: proposals.length,
        metrics: this.metrics,
      }, 'Self-improvement cycle completed');

      return results;
    } catch (error) {
      this.logger.error({ error: error.message }, 'Self-improvement cycle failed');
      throw error;
    }
  }

  /**
   * 1. CONTINUOUS LEARNING
   * Monitors interactions and extracts successful patterns
   */
  async analyzeLearningOpportunities() {
    this.logger.info('Analyzing learning opportunities');

    // Query recent interactions from BigQuery
    const query = `
      SELECT
        customer_id,
        interaction_type,
        message,
        response,
        metadata,
        sentiment_score,
        outcome,
        timestamp
      FROM \`ai_learning.customer_interactions\`
      WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
      ORDER BY timestamp DESC
      LIMIT 1000
    `;

    const [interactions] = await this.bigQuery.query(query);

    if (interactions.length < this.config.minInteractionsForLearning) {
      return { status: 'insufficient_data', count: interactions.length };
    }

    // Analyze patterns using Claude
    const analysis = await this.claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      thinking: {
        type: 'enabled',
        budget_tokens: 10000,
      },
      messages: [{
        role: 'user',
        content: `Analyze these customer interactions and extract learning patterns:

${JSON.stringify(interactions.slice(0, 100), null, 2)}

Identify:
1. Successful interaction patterns (high sentiment, positive outcomes)
2. Failure modes (low sentiment, negative outcomes, errors)
3. Common customer needs and preferences
4. Response patterns that work well
5. Areas where Liv Hana struggles
6. Knowledge gaps to fill

Format as JSON with:
{
  "successPatterns": [{ "pattern": "", "frequency": 0, "examples": [] }],
  "failurePatterns": [{ "pattern": "", "frequency": 0, "examples": [] }],
  "customerNeeds": [{ "need": "", "frequency": 0, "priority": "" }],
  "knowledgeGaps": [{ "gap": "", "impact": "", "solution": "" }],
  "recommendations": []
}`
      }],
    });

    const learningData = this.extractJSON(analysis);

    // Store in knowledge base
    await this.updateKnowledgeBase('learning_patterns', learningData);

    return {
      status: 'complete',
      interactionsAnalyzed: interactions.length,
      successPatterns: learningData.successPatterns?.length || 0,
      failurePatterns: learningData.failurePatterns?.length || 0,
      knowledgeGaps: learningData.knowledgeGaps?.length || 0,
      data: learningData,
    };
  }

  /**
   * 2. PERFORMANCE OPTIMIZATION
   * Tracks response times and suggests optimizations
   */
  async analyzePerformanceOptimizations() {
    this.logger.info('Analyzing performance optimizations');

    // Query slow queries and endpoints
    const query = `
      SELECT
        endpoint,
        AVG(response_time_ms) as avg_response_time,
        MAX(response_time_ms) as max_response_time,
        COUNT(*) as request_count,
        error_rate
      FROM \`performance.api_metrics\`
      WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
      GROUP BY endpoint, error_rate
      HAVING avg_response_time > ${this.config.performanceThresholdMs}
      ORDER BY avg_response_time DESC
      LIMIT 50
    `;

    let slowEndpoints = [];
    try {
      [slowEndpoints] = await this.bigQuery.query(query);
    } catch (error) {
      this.logger.warn({ error: error.message }, 'Performance metrics table not found, skipping');
      return { status: 'no_data', message: 'Performance metrics not available yet' };
    }

    if (slowEndpoints.length === 0) {
      return { status: 'all_fast', message: 'All endpoints performing well' };
    }

    // Analyze each slow endpoint
    const optimizations = [];

    for (const endpoint of slowEndpoints.slice(0, 10)) {
      // Read the code for this endpoint
      const codeAnalysis = await this.analyzeEndpointCode(endpoint.endpoint);

      const analysis = await this.claude.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [{
          role: 'user',
          content: `Analyze this slow endpoint and suggest optimizations:

Endpoint: ${endpoint.endpoint}
Average Response Time: ${endpoint.avg_response_time}ms
Max Response Time: ${endpoint.max_response_time}ms
Request Count: ${endpoint.request_count}

Code:
${codeAnalysis.code}

Suggest specific optimizations:
1. Database query optimizations
2. Caching opportunities
3. Algorithm improvements
4. Code refactoring
5. Infrastructure changes

Format as JSON with concrete code changes.`
        }],
      });

      const optimization = this.extractJSON(analysis);
      optimization.endpoint = endpoint.endpoint;
      optimization.currentPerformance = endpoint;
      optimizations.push(optimization);
    }

    this.metrics.performanceImprovements += optimizations.length;

    return {
      status: 'complete',
      slowEndpointsFound: slowEndpoints.length,
      optimizationsProposed: optimizations.length,
      optimizations,
    };
  }

  /**
   * 3. CODE QUALITY IMPROVEMENTS
   * Analyzes code coverage and suggests improvements
   */
  async analyzeCodeQualityImprovements() {
    this.logger.info('Analyzing code quality improvements');

    const improvements = {
      testCoverage: await this.analyzeTestCoverage(),
      refactoringOpportunities: await this.findRefactoringOpportunities(),
      documentationGaps: await this.findDocumentationGaps(),
    };

    return {
      status: 'complete',
      testsToAdd: improvements.testCoverage.missingTests?.length || 0,
      refactoringsNeeded: improvements.refactoringOpportunities.length || 0,
      docsToGenerate: improvements.documentationGaps.length || 0,
      improvements,
    };
  }

  async analyzeTestCoverage() {
    // Run test coverage
    try {
      const { stdout } = await execAsync('npm run test -- --coverage --run', {
        cwd: this.projectRoot,
        timeout: 120000,
      });

      // Parse coverage report
      const coverageLines = stdout.split('\n');
      const uncoveredFiles = coverageLines
        .filter(line => line.includes('0%') || line.includes('uncovered'))
        .slice(0, 20);

      // Generate test suggestions using Claude
      const suggestions = await this.claude.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [{
          role: 'user',
          content: `Review this test coverage report and suggest tests to add:

${uncoveredFiles.join('\n')}

For each uncovered file, suggest:
1. Unit tests to add
2. Integration tests to add
3. Edge cases to cover
4. Test structure and organization

Format as JSON with concrete test code.`
        }],
      });

      const missingTests = this.extractJSON(suggestions);
      this.metrics.testsGenerated += missingTests.tests?.length || 0;

      return { coverageReport: stdout, missingTests };
    } catch (error) {
      this.logger.warn({ error: error.message }, 'Test coverage analysis failed');
      return { error: error.message };
    }
  }

  async findRefactoringOpportunities() {
    // Find code smells using static analysis
    const { stdout } = await execAsync(
      `find . -name "*.js" -not -path "*/node_modules/*" | head -50`,
      { cwd: this.projectRoot }
    );

    const files = stdout.trim().split('\n').filter(Boolean);
    const refactorings = [];

    for (const file of files.slice(0, 10)) {
      try {
        const code = await readFile(join(this.projectRoot, file), 'utf-8');

        // Skip very large files
        if (code.split('\n').length > 1000) continue;

        const analysis = await this.claude.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8000,
          messages: [{
            role: 'user',
            content: `Analyze this code for refactoring opportunities:

File: ${file}

${code.slice(0, 5000)}

Identify:
1. Code duplication
2. Complex functions (too long, too many branches)
3. Unclear naming
4. Missing error handling
5. Performance issues
6. Security concerns

Suggest specific refactorings with before/after code.`
          }],
        });

        const opportunities = this.extractJSON(analysis);
        if (opportunities.refactorings?.length > 0) {
          refactorings.push({ file, opportunities });
        }
      } catch (error) {
        // Skip files that can't be analyzed
        continue;
      }
    }

    return refactorings;
  }

  async findDocumentationGaps() {
    // Find undocumented code
    const { stdout } = await execAsync(
      `grep -r "export.*function\\|export.*class" backend --include="*.js" | head -100`,
      { cwd: this.projectRoot }
    );

    const exports = stdout.trim().split('\n').filter(Boolean);
    const gaps = [];

    for (const exportLine of exports.slice(0, 20)) {
      const [file, code] = exportLine.split(':');

      // Check if there's JSDoc above it
      const fullCode = await readFile(join(this.projectRoot, file), 'utf-8');
      const lines = fullCode.split('\n');
      const exportIndex = lines.findIndex(l => l.includes(code));

      const hasJSDoc = exportIndex > 0 && lines[exportIndex - 1].includes('*/');

      if (!hasJSDoc) {
        gaps.push({ file, code, needsDocs: true });
      }
    }

    // Generate documentation using Claude
    if (gaps.length > 0) {
      const docsSuggestions = await this.claude.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [{
          role: 'user',
          content: `Generate JSDoc documentation for these undocumented exports:

${JSON.stringify(gaps, null, 2)}

For each, provide complete JSDoc with:
1. Description
2. Parameters with types
3. Return type and description
4. Examples
5. Any relevant notes

Format as JSON mapping file -> documentation.`
        }],
      });

      const docsToAdd = this.extractJSON(docsSuggestions);
      this.metrics.docsGenerated += gaps.length;

      return gaps.map((gap, i) => ({
        ...gap,
        suggestedDoc: docsToAdd[i],
      }));
    }

    return [];
  }

  /**
   * 4. FEATURE DISCOVERY
   * Analyzes customer requests to discover new features
   */
  async analyzeFeatureDiscovery() {
    this.logger.info('Analyzing feature discovery');

    // Query customer requests from interactions
    const query = `
      SELECT
        message,
        metadata,
        COUNT(*) as frequency
      FROM \`ai_learning.customer_interactions\`
      WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
        AND (
          LOWER(message) LIKE '%can you%'
          OR LOWER(message) LIKE '%is it possible%'
          OR LOWER(message) LIKE '%i wish%'
          OR LOWER(message) LIKE '%would be great%'
          OR LOWER(message) LIKE '%feature%'
        )
      GROUP BY message, metadata
      HAVING frequency >= ${this.config.minFeatureRequestsForProposal}
      ORDER BY frequency DESC
      LIMIT 100
    `;

    let requests = [];
    try {
      [requests] = await this.bigQuery.query(query);
    } catch (error) {
      this.logger.warn({ error: error.message }, 'Feature discovery query failed, skipping');
      return { status: 'no_data', message: 'Not enough customer interaction data yet' };
    }

    if (requests.length === 0) {
      return { status: 'no_requests', message: 'No feature requests found' };
    }

    // Analyze and cluster feature requests
    const analysis = await this.claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      thinking: {
        type: 'enabled',
        budget_tokens: 10000,
      },
      messages: [{
        role: 'user',
        content: `Analyze these customer requests and identify feature opportunities:

${JSON.stringify(requests, null, 2)}

Cluster similar requests and identify:
1. Common feature themes
2. Priority based on frequency and business value
3. Implementation complexity (easy/medium/hard)
4. Dependencies on existing features
5. Technical specifications for each feature
6. Estimated development time

Format as JSON with detailed feature specs ready for implementation.`
      }],
    });

    const features = this.extractJSON(analysis);
    this.metrics.featuresDiscovered += features.features?.length || 0;

    return {
      status: 'complete',
      requestsAnalyzed: requests.length,
      featuresIdentified: features.features?.length || 0,
      features,
    };
  }

  /**
   * 5. BUG DETECTION
   * Monitors error logs and correlates with code changes
   */
  async analyzeBugDetection() {
    this.logger.info('Analyzing bug detection');

    // Query error logs
    const query = `
      SELECT
        error_message,
        error_stack,
        endpoint,
        COUNT(*) as frequency,
        MAX(timestamp) as last_occurrence
      FROM \`logs.error_logs\`
      WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
      GROUP BY error_message, error_stack, endpoint
      HAVING frequency >= ${this.config.minErrorsForBugReport}
      ORDER BY frequency DESC
      LIMIT 50
    `;

    let errors = [];
    try {
      [errors] = await this.bigQuery.query(query);
    } catch (error) {
      this.logger.warn({ error: error.message }, 'Error logs query failed, checking Redis');

      // Fallback to Redis error tracking
      const keys = await this.redis.keys('error:*');
      errors = await Promise.all(
        keys.map(async key => {
          const data = await this.redis.get(key);
          return JSON.parse(data);
        })
      );
    }

    if (errors.length === 0) {
      return { status: 'no_errors', message: 'No recurring errors found' };
    }

    this.metrics.bugsDetected += errors.length;

    // Analyze each error
    const bugReports = [];

    for (const error of errors.slice(0, 10)) {
      // Get recent git commits that might have caused this
      const { stdout: gitLog } = await execAsync(
        'git log --since="7 days ago" --oneline',
        { cwd: this.projectRoot }
      );

      // Analyze the error with Claude
      const analysis = await this.claude.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        thinking: {
          type: 'enabled',
          budget_tokens: 5000,
        },
        messages: [{
          role: 'user',
          content: `Analyze this recurring error and suggest a fix:

Error: ${error.error_message}
Stack: ${error.error_stack}
Endpoint: ${error.endpoint}
Frequency: ${error.frequency} occurrences
Last Seen: ${error.last_occurrence}

Recent commits that might be related:
${gitLog}

Provide:
1. Root cause analysis
2. Suggested fix (with code)
3. How to prevent similar errors
4. Test cases to add
5. Priority (critical/high/medium/low)

Format as JSON with complete bug report and fix.`
        }],
      });

      const bugReport = this.extractJSON(analysis);
      bugReport.originalError = error;
      bugReports.push(bugReport);
    }

    return {
      status: 'complete',
      errorsAnalyzed: errors.length,
      bugReportsGenerated: bugReports.length,
      bugs: bugReports,
    };
  }

  /**
   * 6. GENERATE IMPROVEMENT PROPOSALS
   * Combines all analyses into actionable proposals
   */
  async generateImprovementProposals(analysisResults) {
    this.logger.info('Generating improvement proposals');

    const proposals = [];

    // Learning-based improvements
    if (analysisResults.learning?.data?.recommendations) {
      for (const rec of analysisResults.learning.data.recommendations.slice(0, 5)) {
        proposals.push({
          id: `learning-${Date.now()}-${proposals.length}`,
          type: 'learning',
          priority: 'medium',
          title: `Improve based on learning: ${rec.title || rec}`,
          description: rec.description || rec,
          implementation: rec.implementation || 'To be determined',
          estimatedImpact: rec.impact || 'medium',
          requiresApproval: true,
        });
      }
    }

    // Performance optimizations
    if (analysisResults.performance?.optimizations) {
      for (const opt of analysisResults.performance.optimizations.slice(0, 5)) {
        proposals.push({
          id: `performance-${Date.now()}-${proposals.length}`,
          type: 'performance',
          priority: opt.priority || 'high',
          title: `Optimize ${opt.endpoint}`,
          description: `Current: ${opt.currentPerformance.avg_response_time}ms average. ${opt.description || 'Performance optimization needed.'}`,
          implementation: opt.implementation || opt.suggestions,
          estimatedImpact: 'high',
          metrics: {
            currentResponseTime: opt.currentPerformance.avg_response_time,
            targetResponseTime: opt.targetResponseTime,
          },
          requiresApproval: true,
        });
      }
    }

    // Code quality improvements
    if (analysisResults.codeQuality?.improvements) {
      const { testCoverage, refactoringOpportunities, documentationGaps } = analysisResults.codeQuality.improvements;

      // Test proposals
      if (testCoverage?.missingTests?.tests) {
        proposals.push({
          id: `tests-${Date.now()}`,
          type: 'code_quality',
          subtype: 'testing',
          priority: 'medium',
          title: 'Add missing test coverage',
          description: `Add ${testCoverage.missingTests.tests.length} new tests to improve coverage`,
          implementation: testCoverage.missingTests,
          estimatedImpact: 'medium',
          requiresApproval: false, // Tests can be auto-generated
        });
      }

      // Refactoring proposals
      for (const refactoring of (refactoringOpportunities || []).slice(0, 3)) {
        proposals.push({
          id: `refactor-${Date.now()}-${proposals.length}`,
          type: 'code_quality',
          subtype: 'refactoring',
          priority: 'low',
          title: `Refactor ${refactoring.file}`,
          description: refactoring.opportunities.summary || 'Code refactoring needed',
          implementation: refactoring.opportunities,
          estimatedImpact: 'low',
          requiresApproval: true,
        });
      }

      // Documentation proposals
      if (documentationGaps?.length > 0) {
        proposals.push({
          id: `docs-${Date.now()}`,
          type: 'code_quality',
          subtype: 'documentation',
          priority: 'low',
          title: `Add documentation for ${documentationGaps.length} functions`,
          description: 'Generate JSDoc for undocumented exports',
          implementation: documentationGaps,
          estimatedImpact: 'low',
          requiresApproval: false, // Docs can be auto-generated
        });
      }
    }

    // Feature proposals
    if (analysisResults.features?.features?.features) {
      for (const feature of analysisResults.features.features.features.slice(0, 5)) {
        proposals.push({
          id: `feature-${Date.now()}-${proposals.length}`,
          type: 'feature',
          priority: feature.priority || 'medium',
          title: feature.name || feature.title,
          description: feature.description,
          implementation: feature.technicalSpec || feature.implementation,
          estimatedImpact: feature.businessValue || 'medium',
          complexity: feature.complexity,
          estimatedTime: feature.estimatedTime,
          requiresApproval: true,
        });
      }
    }

    // Bug fix proposals
    if (analysisResults.bugs?.bugs) {
      for (const bug of analysisResults.bugs.bugs) {
        proposals.push({
          id: `bugfix-${Date.now()}-${proposals.length}`,
          type: 'bugfix',
          priority: bug.priority || 'high',
          title: `Fix: ${bug.summary || bug.originalError.error_message.slice(0, 100)}`,
          description: bug.rootCause || bug.analysis,
          implementation: bug.suggestedFix || bug.fix,
          tests: bug.testCases,
          estimatedImpact: 'high',
          requiresApproval: bug.priority === 'critical' ? true : false,
          autoFixEligible: bug.priority !== 'critical',
        });
      }
    }

    this.metrics.improvementsProposed += proposals.length;

    return proposals;
  }

  /**
   * 7. SEND PROPOSALS FOR APPROVAL
   * Sends proposals to Jesse via email/Slack/dashboard
   */
  async sendProposalsForApproval(proposals) {
    this.logger.info({ count: proposals.length }, 'Sending proposals for approval');

    // Store proposals in Redis for dashboard
    for (const proposal of proposals) {
      await this.redis.set(
        `improvement:proposal:${proposal.id}`,
        JSON.stringify({
          ...proposal,
          status: 'pending_approval',
          createdAt: new Date().toISOString(),
        }),
        { EX: 30 * 24 * 60 * 60 } // 30 days
      );
    }

    // Store summary for quick access
    await this.redis.set(
      'improvement:proposals:summary',
      JSON.stringify({
        total: proposals.length,
        byType: this.groupBy(proposals, 'type'),
        byPriority: this.groupBy(proposals, 'priority'),
        timestamp: new Date().toISOString(),
      }),
      { EX: 30 * 24 * 60 * 60 }
    );

    // Generate summary report
    const report = await this.generateProposalReport(proposals);

    // Store report
    const reportPath = join(
      this.projectRoot,
      'reports',
      'improvements',
      `proposal-${Date.now()}.json`
    );

    try {
      await mkdir(join(this.projectRoot, 'reports', 'improvements'), { recursive: true });
      await writeFile(reportPath, JSON.stringify(report, null, 2));
      this.logger.info({ reportPath }, 'Proposal report saved');
    } catch (error) {
      this.logger.warn({ error: error.message }, 'Failed to save report to disk');
    }

    // Log summary for Jesse
    this.logger.info({
      proposalsCount: proposals.length,
      highPriority: proposals.filter(p => p.priority === 'high').length,
      criticalBugs: proposals.filter(p => p.type === 'bugfix' && p.priority === 'critical').length,
      newFeatures: proposals.filter(p => p.type === 'feature').length,
    }, 'IMPROVEMENT PROPOSALS READY FOR REVIEW');

    return report;
  }

  /**
   * 8. EXECUTE APPROVED IMPROVEMENTS
   * Implements approved proposals with safety checks
   */
  async executeApprovedImprovement(proposalId) {
    this.logger.info({ proposalId }, 'Executing approved improvement');

    // Get proposal
    const proposalData = await this.redis.get(`improvement:proposal:${proposalId}`);
    if (!proposalData) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    const proposal = JSON.parse(proposalData);

    if (proposal.status !== 'approved') {
      throw new Error(`Proposal ${proposalId} is not approved (status: ${proposal.status})`);
    }

    // Safety checks
    if (this.safetyChecks.requireTests && !proposal.tests) {
      throw new Error('Tests required but not provided');
    }

    // Create execution plan
    const plan = await this.createExecutionPlan(proposal);

    // Execute with rollback capability
    const rollbackData = await this.createRollbackPoint();

    try {
      const result = await this.executePlan(plan);

      // Run tests
      if (this.safetyChecks.requireTests) {
        await this.runTests();
      }

      // Update proposal status
      proposal.status = 'implemented';
      proposal.implementedAt = new Date().toISOString();
      proposal.result = result;

      await this.redis.set(
        `improvement:proposal:${proposalId}`,
        JSON.stringify(proposal)
      );

      this.metrics.improvementsImplemented++;
      this.logger.info({ proposalId, result }, 'Improvement implemented successfully');

      return {
        success: true,
        proposal,
        result,
      };
    } catch (error) {
      this.logger.error({ proposalId, error: error.message }, 'Implementation failed, rolling back');

      // Rollback
      await this.rollback(rollbackData);

      // Update proposal status
      proposal.status = 'failed';
      proposal.failedAt = new Date().toISOString();
      proposal.error = error.message;

      await this.redis.set(
        `improvement:proposal:${proposalId}`,
        JSON.stringify(proposal)
      );

      throw error;
    }
  }

  /**
   * 9. SCHEDULED JOBS
   * Runs improvement cycles on schedule
   *
   * IMPORTANT: JavaScript setTimeout/setInterval max safe value is 2^31-1 (2,147,483,647ms = ~24.8 days)
   * For intervals > 24 days, we use recursive setTimeout to avoid overflow
   */
  async startScheduledJobs() {
    this.logger.info('Starting scheduled improvement jobs');

    // Constants for safe intervals (under 32-bit limit)
    const MAX_SAFE_INTERVAL = 2147483647; // 2^31-1 milliseconds
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const SEVEN_DAYS = 7 * ONE_DAY;
    const THIRTY_DAYS = 30 * ONE_DAY;

    // Daily: Analyze yesterday's interactions
    setInterval(async () => {
      try {
        await this.runImprovementCycle();
      } catch (error) {
        this.logger.error({ error: error.message }, 'Daily improvement cycle failed');
      }
    }, this.config.analysisInterval);

    // Weekly: Generate improvement proposals (safe - under 24.8 days)
    setInterval(async () => {
      try {
        const proposals = await this.generateWeeklyReport();
        await this.sendProposalsForApproval(proposals);
      } catch (error) {
        this.logger.error({ error: error.message }, 'Weekly report generation failed');
      }
    }, SEVEN_DAYS);

    // Monthly: Major refactoring suggestions
    // Use recursive setTimeout to avoid 32-bit overflow (30 days > 24.8 days max)
    const scheduleMonthlyReport = () => {
      setTimeout(async () => {
        try {
          await this.generateMonthlyRefactoringReport();
        } catch (error) {
          this.logger.error({ error: error.message }, 'Monthly refactoring report failed');
        }
        // Re-schedule for next month
        scheduleMonthlyReport();
      }, Math.min(THIRTY_DAYS, MAX_SAFE_INTERVAL));
    };
    scheduleMonthlyReport();

    this.logger.info('Scheduled jobs started');
  }

  /**
   * 10. METRICS DASHBOARD
   * Provides improvement metrics
   */
  async getMetricsDashboard() {
    const proposals = await this.getAllProposals();

    return {
      metrics: this.metrics,
      proposals: {
        total: proposals.length,
        pending: proposals.filter(p => p.status === 'pending_approval').length,
        approved: proposals.filter(p => p.status === 'approved').length,
        implemented: proposals.filter(p => p.status === 'implemented').length,
        failed: proposals.filter(p => p.status === 'failed').length,
      },
      recentActivity: await this.getRecentActivity(),
      performanceGains: await this.calculatePerformanceGains(),
      safetyStatus: this.safetyChecks,
    };
  }

  // ========== HELPER METHODS ==========

  async updateKnowledgeBase(category, data) {
    const key = `knowledge:${category}:${Date.now()}`;
    await this.redis.set(key, JSON.stringify(data), { EX: 365 * 24 * 60 * 60 }); // 1 year
  }

  async analyzeEndpointCode(endpoint) {
    // Find the code for this endpoint
    const { stdout } = await execAsync(
      `grep -r "${endpoint}" backend --include="*.js" -A 50`,
      { cwd: this.projectRoot }
    );

    return {
      endpoint,
      code: stdout.slice(0, 5000),
    };
  }

  extractJSON(claudeResponse) {
    const text = claudeResponse.content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('\n');

    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) ||
                     text.match(/(\{[\s\S]*\})/);

    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (error) {
        this.logger.warn({ error: error.message }, 'Failed to parse JSON from Claude response');
        return { raw: text };
      }
    }

    return { raw: text };
  }

  async generateProposalReport(proposals) {
    return {
      summary: {
        total: proposals.length,
        byType: this.groupBy(proposals, 'type'),
        byPriority: this.groupBy(proposals, 'priority'),
        estimatedImpact: this.groupBy(proposals, 'estimatedImpact'),
      },
      proposals: proposals.map(p => ({
        id: p.id,
        type: p.type,
        priority: p.priority,
        title: p.title,
        description: p.description,
        estimatedImpact: p.estimatedImpact,
        requiresApproval: p.requiresApproval,
      })),
      recommendations: proposals
        .filter(p => p.priority === 'high' || p.priority === 'critical')
        .slice(0, 10),
      timestamp: new Date().toISOString(),
    };
  }

  groupBy(array, key) {
    return array.reduce((acc, item) => {
      const group = item[key] || 'unknown';
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {});
  }

  async createExecutionPlan(proposal) {
    // Use Claude to create detailed execution plan
    const response = await this.claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `Create a detailed execution plan for this improvement:

${JSON.stringify(proposal, null, 2)}

Provide step-by-step instructions with:
1. Files to modify
2. Exact code changes
3. Commands to run
4. Tests to add/run
5. Verification steps

Format as JSON with executable steps.`
      }],
    });

    return this.extractJSON(response);
  }

  async executePlan(plan) {
    // Execute the plan steps
    const results = [];

    for (const step of plan.steps || []) {
      if (step.type === 'file_edit') {
        await this.executeFileEdit(step);
      } else if (step.type === 'command') {
        await execAsync(step.command, { cwd: this.projectRoot });
      }

      results.push({ step, success: true });
    }

    return results;
  }

  async executeFileEdit(step) {
    const filePath = join(this.projectRoot, step.file);
    const content = await readFile(filePath, 'utf-8');
    const newContent = content.replace(step.find, step.replace);
    await writeFile(filePath, newContent, 'utf-8');
  }

  async runTests() {
    const { stdout, stderr } = await execAsync('npm test', {
      cwd: this.projectRoot,
      timeout: 300000, // 5 minutes
    });

    if (stderr && stderr.includes('FAIL')) {
      throw new Error('Tests failed: ' + stderr);
    }

    return { passed: true, output: stdout };
  }

  async createRollbackPoint() {
    const { stdout } = await execAsync('git stash', { cwd: this.projectRoot });
    return { stashId: stdout.trim() };
  }

  async rollback(rollbackData) {
    if (rollbackData.stashId) {
      await execAsync('git stash pop', { cwd: this.projectRoot });
    }
  }

  async getAllProposals() {
    const keys = await this.redis.keys('improvement:proposal:*');
    const proposals = await Promise.all(
      keys.map(async key => {
        const data = await this.redis.get(key);
        return JSON.parse(data);
      })
    );
    return proposals;
  }

  async getRecentActivity() {
    const proposals = await this.getAllProposals();
    return proposals
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);
  }

  async calculatePerformanceGains() {
    // Calculate total performance improvements
    const proposals = await this.getAllProposals();
    const performanceProposals = proposals.filter(p =>
      p.type === 'performance' && p.status === 'implemented'
    );

    let totalGain = 0;
    for (const p of performanceProposals) {
      if (p.metrics?.currentResponseTime && p.metrics?.targetResponseTime) {
        totalGain += p.metrics.currentResponseTime - p.metrics.targetResponseTime;
      }
    }

    return {
      totalResponseTimeReduced: totalGain,
      optimizedEndpoints: performanceProposals.length,
      averageImprovement: totalGain / (performanceProposals.length || 1),
    };
  }

  async generateWeeklyReport() {
    const analysis = await this.runImprovementCycle();
    return analysis.proposals || [];
  }

  async generateMonthlyRefactoringReport() {
    const refactorings = await this.findRefactoringOpportunities();
    const report = {
      timestamp: new Date().toISOString(),
      refactorings,
      summary: `Found ${refactorings.length} refactoring opportunities`,
    };

    const reportPath = join(
      this.projectRoot,
      'reports',
      'refactoring',
      `refactoring-${Date.now()}.json`
    );

    await mkdir(join(this.projectRoot, 'reports', 'refactoring'), { recursive: true });
    await writeFile(reportPath, JSON.stringify(report, null, 2));

    return report;
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown() {
    this.logger.info('Shutting down self-improvement loop');
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

/**
 * Create and start self-improvement loop
 */
export async function createSelfImprovementLoop({ logger }) {
  const loop = await SelfImprovementLoop.create({ logger });

  // Start scheduled jobs
  await loop.startScheduledJobs();

  return loop;
}

/**
 * API Routes for self-improvement
 */
export function createSelfImprovementRouter({ logger, improvementLoop }) {
  const router = express.Router();

  // Get metrics dashboard
  router.get('/metrics', async (req, res) => {
    try {
      const dashboard = await improvementLoop.getMetricsDashboard();
      res.json(dashboard);
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to get metrics dashboard');
      res.status(500).json({ error: error.message });
    }
  });

  // Get all proposals
  router.get('/proposals', async (req, res) => {
    try {
      const proposals = await improvementLoop.getAllProposals();
      res.json({ proposals });
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to get proposals');
      res.status(500).json({ error: error.message });
    }
  });

  // Get single proposal
  router.get('/proposals/:id', async (req, res) => {
    try {
      const data = await improvementLoop.redis.get(`improvement:proposal:${req.params.id}`);
      if (!data) {
        return res.status(404).json({ error: 'Proposal not found' });
      }
      res.json(JSON.parse(data));
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to get proposal');
      res.status(500).json({ error: error.message });
    }
  });

  // Approve proposal
  router.post('/proposals/:id/approve', async (req, res) => {
    try {
      const { id } = req.params;
      const data = await improvementLoop.redis.get(`improvement:proposal:${id}`);

      if (!data) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      const proposal = JSON.parse(data);
      proposal.status = 'approved';
      proposal.approvedAt = new Date().toISOString();
      proposal.approvedBy = req.user?.email || 'system';

      await improvementLoop.redis.set(
        `improvement:proposal:${id}`,
        JSON.stringify(proposal)
      );

      improvementLoop.metrics.improvementsApproved++;

      // Auto-execute if eligible
      if (!proposal.requiresApproval || req.body.autoExecute) {
        const result = await improvementLoop.executeApprovedImprovement(id);
        return res.json({ success: true, executed: true, result });
      }

      res.json({ success: true, proposal });
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to approve proposal');
      res.status(500).json({ error: error.message });
    }
  });

  // Reject proposal
  router.post('/proposals/:id/reject', async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const data = await improvementLoop.redis.get(`improvement:proposal:${id}`);
      if (!data) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      const proposal = JSON.parse(data);
      proposal.status = 'rejected';
      proposal.rejectedAt = new Date().toISOString();
      proposal.rejectedBy = req.user?.email || 'system';
      proposal.rejectionReason = reason;

      await improvementLoop.redis.set(
        `improvement:proposal:${id}`,
        JSON.stringify(proposal)
      );

      res.json({ success: true, proposal });
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to reject proposal');
      res.status(500).json({ error: error.message });
    }
  });

  // Execute approved proposal
  router.post('/proposals/:id/execute', async (req, res) => {
    try {
      const result = await improvementLoop.executeApprovedImprovement(req.params.id);
      res.json(result);
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to execute proposal');
      res.status(500).json({ error: error.message });
    }
  });

  // Trigger manual improvement cycle
  router.post('/analyze', async (req, res) => {
    try {
      const results = await improvementLoop.runImprovementCycle();
      res.json(results);
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to run improvement cycle');
      res.status(500).json({ error: error.message });
    }
  });

  // Health check
  router.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      metrics: improvementLoop.metrics,
      safetyChecks: improvementLoop.safetyChecks,
    });
  });

  return router;
}
