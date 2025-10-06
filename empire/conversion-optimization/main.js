import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 8084;

// Conversion Optimization System
class ConversionOptimizer {
  constructor() {
    this.abTests = new Map();
    this.funnelMetrics = new Map();
    this.optimizationRules = new Map();
  }
  
  // A/B Testing Framework
  createABTest(testName, variants, trafficSplit = 0.5) {
    const testId = uuidv4();
    const test = {
      id: testId,
      name: testName,
      variants: variants.map((variant, index) => ({
        id: uuidv4(),
        name: variant.name,
        config: variant.config,
        traffic: index === 0 ? trafficSplit : (1 - trafficSplit) / (variants.length - 1),
        conversions: 0,
        visitors: 0
      })),
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    this.abTests.set(testId, test);
    return test;
  }
  
  // Assign user to test variant
  assignVariant(testId, userId) {
    const test = this.abTests.get(testId);
    if (!test || test.status !== 'active') return null;
    
    // Simple hash-based assignment
    const hash = this.hashString(userId + testId);
    const bucket = hash % 100;
    
    let cumulativeTraffic = 0;
    for (const variant of test.variants) {
      cumulativeTraffic += variant.traffic * 100;
      if (bucket < cumulativeTraffic) {
        return variant;
      }
    }
    
    return test.variants[0]; // Fallback
  }
  
  // Track conversion
  trackConversion(testId, variantId, userId) {
    const test = this.abTests.get(testId);
    if (!test) return false;
    
    const variant = test.variants.find(v => v.id === variantId);
    if (!variant) return false;
    
    variant.conversions++;
    return true;
  }
  
  // Track visitor
  trackVisitor(testId, variantId, userId) {
    const test = this.abTests.get(testId);
    if (!test) return false;
    
    const variant = test.variants.find(v => v.id === variantId);
    if (!variant) return false;
    
    variant.visitors++;
    return true;
  }
  
  // Get test results
  getTestResults(testId) {
    const test = this.abTests.get(testId);
    if (!test) return null;
    
    const results = test.variants.map(variant => ({
      ...variant,
      conversionRate: variant.visitors > 0 ? (variant.conversions / variant.visitors) * 100 : 0,
      confidence: this.calculateConfidence(variant.conversions, variant.visitors)
    }));
    
    return {
      testId,
      testName: test.name,
      results,
      winner: results.reduce((max, current) => 
        current.conversionRate > max.conversionRate ? current : max
      ),
      status: test.status
    };
  }
  
  // Funnel Analysis
  analyzeFunnel(funnelName, steps) {
    const funnelId = uuidv4();
    const funnel = {
      id: funnelId,
      name: funnelName,
      steps: steps.map((step, index) => ({
        id: uuidv4(),
        name: step.name,
        order: index + 1,
        visitors: 0,
        conversions: 0,
        dropOffRate: 0
      })),
      createdAt: new Date().toISOString()
    };
    
    this.funnelMetrics.set(funnelId, funnel);
    return funnel;
  }
  
  // Track funnel step
  trackFunnelStep(funnelId, stepId, userId, action) {
    const funnel = this.funnelMetrics.get(funnelId);
    if (!funnel) return false;
    
    const step = funnel.steps.find(s => s.id === stepId);
    if (!step) return false;
    
    if (action === 'visit') {
      step.visitors++;
    } else if (action === 'convert') {
      step.conversions++;
    }
    
    return true;
  }
  
  // Get funnel analysis
  getFunnelAnalysis(funnelId) {
    const funnel = this.funnelMetrics.get(funnelId);
    if (!funnel) return null;
    
    let previousVisitors = 0;
    const analysis = funnel.steps.map((step, index) => {
      const dropOffRate = previousVisitors > 0 ? 
        ((previousVisitors - step.visitors) / previousVisitors) * 100 : 0;
      
      previousVisitors = step.visitors;
      
      return {
        ...step,
        dropOffRate,
        conversionRate: step.visitors > 0 ? (step.conversions / step.visitors) * 100 : 0
      };
    });
    
    const totalVisitors = funnel.steps[0]?.visitors || 0;
    const totalConversions = funnel.steps[funnel.steps.length - 1]?.conversions || 0;
    const overallConversionRate = totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;
    
    return {
      funnelId,
      funnelName: funnel.name,
      analysis,
      totalVisitors,
      totalConversions,
      overallConversionRate,
      biggestDropOff: analysis.reduce((max, current) => 
        current.dropOffRate > max.dropOffRate ? current : max
      )
    };
  }
  
  // Optimization Rules Engine
  createOptimizationRule(ruleName, conditions, actions) {
    const ruleId = uuidv4();
    const rule = {
      id: ruleId,
      name: ruleName,
      conditions,
      actions,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    this.optimizationRules.set(ruleId, rule);
    return rule;
  }
  
  // Apply optimization rules
  applyOptimizationRules(userId, userData) {
    const applicableRules = [];
    
    for (const [ruleId, rule] of this.optimizationRules) {
      if (rule.status !== 'active') continue;
      
      const isApplicable = this.evaluateConditions(rule.conditions, userData);
      if (isApplicable) {
        applicableRules.push({
          ruleId,
          ruleName: rule.name,
          actions: rule.actions
        });
      }
    }
    
    return applicableRules;
  }
  
  // Helper methods
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  calculateConfidence(conversions, visitors) {
    if (visitors === 0) return 0;
    
    const p = conversions / visitors;
    const n = visitors;
    const z = 1.96; // 95% confidence
    
    const margin = z * Math.sqrt((p * (1 - p)) / n);
    return Math.min(100, Math.max(0, (p - margin) * 100));
  }
  
  evaluateConditions(conditions, userData) {
    // Simple condition evaluation
    return conditions.every(condition => {
      const { field, operator, value } = condition;
      const userValue = userData[field];
      
      switch (operator) {
        case 'equals':
          return userValue === value;
        case 'greater_than':
          return userValue > value;
        case 'less_than':
          return userValue < value;
        case 'contains':
          return userValue && userValue.includes(value);
        default:
          return false;
      }
    });
  }
}

// Initialize Conversion Optimizer
const optimizer = new ConversionOptimizer();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'conversion-optimization',
    timestamp: new Date().toISOString(),
    features: ['ab-testing', 'funnel-analysis', 'optimization-rules', 'conversion-tracking']
  });
});

// A/B Testing endpoints
app.post('/api/conversion/ab-test', (req, res) => {
  const { testName, variants, trafficSplit } = req.body;
  
  try {
    const test = optimizer.createABTest(testName, variants, trafficSplit);
    res.status(201).json({
      message: 'A/B test created successfully',
      test
    });
  } catch (error) {
    console.error('A/B test creation error:', error);
    res.status(500).json({ error: 'Test creation failed' });
  }
});

app.get('/api/conversion/ab-test/:testId/variant', (req, res) => {
  const { testId } = req.params;
  const { userId } = req.query;
  
  try {
    const variant = optimizer.assignVariant(testId, userId);
    if (variant) {
      optimizer.trackVisitor(testId, variant.id, userId);
      res.status(200).json({ variant });
    } else {
      res.status(404).json({ error: 'Test not found' });
    }
  } catch (error) {
    console.error('Variant assignment error:', error);
    res.status(500).json({ error: 'Assignment failed' });
  }
});

app.post('/api/conversion/ab-test/:testId/conversion', (req, res) => {
  const { testId } = req.params;
  const { variantId, userId } = req.body;
  
  try {
    const success = optimizer.trackConversion(testId, variantId, userId);
    res.status(200).json({
      message: success ? 'Conversion tracked' : 'Tracking failed',
      success
    });
  } catch (error) {
    console.error('Conversion tracking error:', error);
    res.status(500).json({ error: 'Tracking failed' });
  }
});

app.get('/api/conversion/ab-test/:testId/results', (req, res) => {
  const { testId } = req.params;
  
  try {
    const results = optimizer.getTestResults(testId);
    res.status(200).json({ results });
  } catch (error) {
    console.error('Results retrieval error:', error);
    res.status(500).json({ error: 'Results retrieval failed' });
  }
});

// Funnel Analysis endpoints
app.post('/api/conversion/funnel', (req, res) => {
  const { funnelName, steps } = req.body;
  
  try {
    const funnel = optimizer.analyzeFunnel(funnelName, steps);
    res.status(201).json({
      message: 'Funnel created successfully',
      funnel
    });
  } catch (error) {
    console.error('Funnel creation error:', error);
    res.status(500).json({ error: 'Funnel creation failed' });
  }
});

app.post('/api/conversion/funnel/:funnelId/step', (req, res) => {
  const { funnelId } = req.params;
  const { stepId, userId, action } = req.body;
  
  try {
    const success = optimizer.trackFunnelStep(funnelId, stepId, userId, action);
    res.status(200).json({
      message: success ? 'Step tracked' : 'Tracking failed',
      success
    });
  } catch (error) {
    console.error('Funnel step tracking error:', error);
    res.status(500).json({ error: 'Tracking failed' });
  }
});

app.get('/api/conversion/funnel/:funnelId/analysis', (req, res) => {
  const { funnelId } = req.params;
  
  try {
    const analysis = optimizer.getFunnelAnalysis(funnelId);
    res.status(200).json({ analysis });
  } catch (error) {
    console.error('Funnel analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Optimization Rules endpoints
app.post('/api/conversion/rule', (req, res) => {
  const { ruleName, conditions, actions } = req.body;
  
  try {
    const rule = optimizer.createOptimizationRule(ruleName, conditions, actions);
    res.status(201).json({
      message: 'Optimization rule created successfully',
      rule
    });
  } catch (error) {
    console.error('Rule creation error:', error);
    res.status(500).json({ error: 'Rule creation failed' });
  }
});

app.post('/api/conversion/optimize', (req, res) => {
  const { userId, userData } = req.body;
  
  try {
    const applicableRules = optimizer.applyOptimizationRules(userId, userData);
    res.status(200).json({
      userId,
      applicableRules,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Optimization error:', error);
    res.status(500).json({ error: 'Optimization failed' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`📈 Conversion Optimization running on port ${PORT}`);
  console.log(`🧪 A/B testing framework active`);
  console.log(`📊 Funnel analysis ready`);
  console.log(`🎯 Optimization rules engine active`);
  console.log(`📋 Conversion tracking ready`);
  console.log(`🚀 E2E optimization strategy applied`);
});
