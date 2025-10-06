import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 8083;

// RPM DNA System - MAP Massive Action Plan Framework
class RPMDNASystem {
  constructor() {
    this.decisionTree = {
      // Level 1: What MUST be done to accomplish result?
      mustDo: [],
      
      // Level 2: Apply 80/20 rule
      pareto80: [],
      pareto20: [],
      
      // Level 3: Apply 5/55 principle (Christ's teaching)
      seed5: [],
      harvest55: [],
      
      // Level 4: What is the one thing that would make the biggest difference?
      oneThing: null,
      
      // Level 5: Stack rank RPMs within COI
      rpmRanking: [],
      
      // Level 6: Stack rank COIs within AOM
      coiRanking: [],
      
      // Level 7: Determine AOM priority
      aomPriority: null
    };
    
    this.resourceAllocation = {
      time: {},
      money: {},
      human: {},
      technology: {},
      marketing: {}
    };
  }
  
  // Decision Tree Engine
  analyzeMustDo(result) {
    const mustDoQuestions = [
      `What MUST be done to accomplish ${result}?`,
      `What are the non-negotiable requirements?`,
      `What would cause failure if not done?`,
      `What are the critical path items?`
    ];
    
    return {
      result,
      questions: mustDoQuestions,
      analysis: 'Must-do items identified',
      timestamp: new Date().toISOString()
    };
  }
  
  // 80/20 Rule Analysis
  applyParetoAnalysis(mustDoItems) {
    const totalItems = mustDoItems.length;
    const pareto80Count = Math.ceil(totalItems * 0.8);
    const pareto20Count = Math.ceil(totalItems * 0.2);
    
    return {
      totalItems,
      pareto80: mustDoItems.slice(0, pareto80Count),
      pareto20: mustDoItems.slice(-pareto20Count),
      analysis: '80/20 rule applied',
      timestamp: new Date().toISOString()
    };
  }
  
  // 5/55 Principle (Christ's teaching)
  applySeedHarvestPrinciple(pareto20Items) {
    const totalSeeds = pareto20Items.length;
    const seed5Count = Math.ceil(totalSeeds * 0.05);
    const harvest55Count = Math.ceil(totalSeeds * 0.55);
    
    return {
      totalSeeds,
      seed5: pareto20Items.slice(0, seed5Count),
      harvest55: pareto20Items.slice(0, harvest55Count),
      principle: '5% of seeds yield 55% of harvest',
      analysis: 'Christ\'s 5/55 teaching applied',
      timestamp: new Date().toISOString()
    };
  }
  
  // One Thing Analysis
  findOneThing(harvest55Items) {
    if (harvest55Items.length === 0) return null;
    
    // Find the item with highest impact potential
    const oneThing = harvest55Items.reduce((max, item) => {
      const impactScore = this.calculateImpactScore(item);
      return impactScore > max.score ? { item, score: impactScore } : max;
    }, { item: null, score: 0 });
    
    return {
      oneThing: oneThing.item,
      impactScore: oneThing.score,
      question: 'What is the one thing that would make the biggest difference?',
      analysis: 'One thing identified',
      timestamp: new Date().toISOString()
    };
  }
  
  // Impact Score Calculation
  calculateImpactScore(item) {
    const factors = {
      revenue: item.revenue || 0,
      time: item.time || 0,
      effort: item.effort || 0,
      risk: item.risk || 0,
      dependencies: item.dependencies || 0
    };
    
    // Weighted scoring
    return (
      factors.revenue * 0.3 +
      factors.time * 0.2 +
      factors.effort * 0.2 +
      factors.risk * 0.15 +
      factors.dependencies * 0.15
    );
  }
  
  // Stack Rank RPMs within COI
  stackRankRPMs(coi, rpms) {
    return rpms
      .map(rpm => ({
        ...rpm,
        score: this.calculateImpactScore(rpm)
      }))
      .sort((a, b) => b.score - a.score)
      .map((rpm, index) => ({
        ...rpm,
        rank: index + 1,
        coi
      }));
  }
  
  // Stack Rank COIs within AOM
  stackRankCOIs(aom, cois) {
    return cois
      .map(coi => ({
        ...coi,
        score: this.calculateImpactScore(coi)
      }))
      .sort((a, b) => b.score - a.score)
      .map((coi, index) => ({
        ...coi,
        rank: index + 1,
        aom
      }));
  }
  
  // Determine AOM Priority
  determineAOMPriority(aoms) {
    const prioritizedAOMs = aoms
      .map(aom => ({
        ...aom,
        score: this.calculateImpactScore(aom)
      }))
      .sort((a, b) => b.score - a.score);
    
    return {
      priority: prioritizedAOMs[0],
      allAOMs: prioritizedAOMs,
      analysis: 'AOM priority determined',
      timestamp: new Date().toISOString()
    };
  }
  
  // Resource Allocation Optimization
  optimizeResourceAllocation(priority, resources) {
    const allocation = {
      time: {},
      money: {},
      human: {},
      technology: {},
      marketing: {}
    };
    
    // Apply 5/55 principle to resource allocation
    const totalResources = Object.keys(resources).length;
    const seed5Count = Math.ceil(totalResources * 0.05);
    const harvest55Count = Math.ceil(totalResources * 0.55);
    
    Object.entries(resources).forEach(([type, amount], index) => {
      if (index < seed5Count) {
        allocation[type] = amount * 0.55; // 55% to top 5%
      } else {
        allocation[type] = amount * 0.45; // 45% to remaining 95%
      }
    });
    
    return {
      allocation,
      principle: '5/55 resource allocation',
      priority,
      timestamp: new Date().toISOString()
    };
  }
}

// Initialize RPM DNA System
const rpmDNA = new RPMDNASystem();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'rpm-dna-system',
    timestamp: new Date().toISOString(),
    features: ['decision-tree', 'pareto-analysis', 'seed-harvest', 'resource-allocation', 'priority-ranking']
  });
});

// Decision Tree Analysis
app.post('/api/rpm/analyze', (req, res) => {
  const { result, mustDoItems } = req.body;
  
  try {
    const analysis = rpmDNA.analyzeMustDo(result);
    const paretoAnalysis = rpmDNA.applyParetoAnalysis(mustDoItems);
    const seedHarvest = rpmDNA.applySeedHarvestPrinciple(paretoAnalysis.pareto20);
    const oneThing = rpmDNA.findOneThing(seedHarvest.harvest55);
    
    res.status(200).json({
      analysis,
      paretoAnalysis,
      seedHarvest,
      oneThing,
      decisionTree: rpmDNA.decisionTree
    });
    
  } catch (error) {
    console.error('RPM analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Resource Allocation Optimization
app.post('/api/rpm/allocate-resources', (req, res) => {
  const { priority, resources } = req.body;
  
  try {
    const allocation = rpmDNA.optimizeResourceAllocation(priority, resources);
    
    res.status(200).json({
      allocation,
      principle: '5/55 resource allocation applied',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Resource allocation error:', error);
    res.status(500).json({ error: 'Allocation failed' });
  }
});

// Priority Ranking
app.post('/api/rpm/rank-priorities', (req, res) => {
  const { type, items } = req.body; // type: 'rpm', 'coi', 'aom'
  
  try {
    let rankedItems;
    
    switch (type) {
      case 'rpm':
        rankedItems = rpmDNA.stackRankRPMs('default', items);
        break;
      case 'coi':
        rankedItems = rpmDNA.stackRankCOIs('default', items);
        break;
      case 'aom':
        rankedItems = rpmDNA.determineAOMPriority(items);
        break;
      default:
        throw new Error('Invalid type');
    }
    
    res.status(200).json({
      type,
      rankedItems,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Priority ranking error:', error);
    res.status(500).json({ error: 'Ranking failed' });
  }
});

// Get Decision Tree Status
app.get('/api/rpm/decision-tree', (req, res) => {
  res.status(200).json({
    decisionTree: rpmDNA.decisionTree,
    resourceAllocation: rpmDNA.resourceAllocation,
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🧬 RPM DNA System running on port ${PORT}`);
  console.log(`📊 MAP Massive Action Plan active`);
  console.log(`📈 80/20 rule analysis ready`);
  console.log(`🌱 5/55 seed-harvest principle active`);
  console.log(`🎯 One thing identification ready`);
  console.log(`📋 Priority ranking system active`);
  console.log(`💰 Resource allocation optimization ready`);
});
