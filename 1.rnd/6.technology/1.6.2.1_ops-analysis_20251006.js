/**
 * OPS Analysis Routes for DSHS Email
 * 50-State Analysis Dashboard
 */

import express from 'express';
import { createLogger } from '../../common/logging/index.js';

const router = express.Router();
const logger = createLogger('ops-analysis');

// 50-State Analysis Dashboard
router.get('/', (req, res) => {
  const mockData = {
    overview: {
      totalStates: 50,
      legalCannabisStates: 24,
      medicalCannabisStates: 38,
      hempLegalStates: 50,
      revenueOpportunity: '$100 Billion',
      lastUpdated: new Date().toISOString()
    },
    stateBreakdown: [
      { 
        name: 'Texas', 
        status: 'Hemp Legal, Medical (Low THC)', 
        revenuePotential: '$47 Million (lost to OK)', 
        complianceScore: 75,
        population: '30.5M',
        hempAcres: '15,000',
        keyIssues: ['Border bleed to OK', 'Restrictive THC limits', 'Limited processing']
      },
      { 
        name: 'Oklahoma', 
        status: 'Medical, High THC Hemp', 
        revenuePotential: '$1.2 Billion', 
        complianceScore: 90,
        population: '4.0M',
        hempAcres: '45,000',
        keyIssues: ['Capturing TX revenue', 'Processing capacity', 'Quality standards']
      },
      { 
        name: 'California', 
        status: 'Adult-Use', 
        revenuePotential: '$5.3 Billion', 
        complianceScore: 88,
        population: '39.5M',
        hempAcres: '25,000',
        keyIssues: ['Oversupply', 'Tax burden', 'Illegal market competition']
      },
      { 
        name: 'Colorado', 
        status: 'Adult-Use', 
        revenuePotential: '$2.2 Billion', 
        complianceScore: 92,
        population: '5.8M',
        hempAcres: '30,000',
        keyIssues: ['Tourism impact', 'Quality standards', 'Export opportunities']
      },
      { 
        name: 'New York', 
        status: 'Adult-Use', 
        revenuePotential: '$1.5 Billion', 
        complianceScore: 70,
        population: '20.2M',
        hempAcres: '8,000',
        keyIssues: ['Slow rollout', 'Social equity', 'Market development']
      },
      { 
        name: 'Florida', 
        status: 'Medical Only', 
        revenuePotential: '$800 Million', 
        complianceScore: 65,
        population: '22.2M',
        hempAcres: '12,000',
        keyIssues: ['Limited access', 'High costs', 'Vertical integration']
      },
      { 
        name: 'Pennsylvania', 
        status: 'Medical Only', 
        revenuePotential: '$600 Million', 
        complianceScore: 68,
        population: '13.0M',
        hempAcres: '10,000',
        keyIssues: ['Expansion delays', 'Patient access', 'Product variety']
      },
      { 
        name: 'Illinois', 
        status: 'Adult-Use', 
        revenuePotential: '$1.1 Billion', 
        complianceScore: 85,
        population: '12.8M',
        hempAcres: '18,000',
        keyIssues: ['Social equity', 'Supply chain', 'Tax revenue']
      }
    ],
    federalOutlook: {
      deschedulingProbability: 'High (70%)',
      interstateCommerceImpact: 'Massive Economic Growth',
      bankingReform: 'Imminent',
      timeline: '12-18 months',
      keyDrivers: [
        'Bipartisan support',
        'Economic pressure',
        'State momentum',
        'Public opinion shift'
      ]
    },
    texasSpecificAnalysis: {
      currentStatus: 'Hemp Legal (0.3% D9 THC)',
      revenueLoss: '$47M annually to Oklahoma',
      borderBleed: 'Significant cross-border activity',
      policyRecommendations: [
        'Increase THC limit to 1.0%',
        'Streamline licensing process',
        'Invest in processing infrastructure',
        'Implement quality standards'
      ],
      economicImpact: {
        directJobs: '5,000+',
        indirectJobs: '15,000+',
        taxRevenue: '$47M+ annually',
        gdpImpact: '$200M+'
      }
    },
    recommendations: {
      immediate: [
        'File TTSA in Texas Legislature',
        'Engage DSHS stakeholders',
        'Develop regulatory framework',
        'Launch pilot program'
      ],
      shortTerm: [
        'Implement COA requirements',
        'Establish testing standards',
        'Create licensing system',
        'Build processing capacity'
      ],
      longTerm: [
        'Full adult-use legalization',
        'Interstate commerce participation',
        'Export market development',
        'Federal descheduling support'
      ]
    }
  };

  logger.info('50-state analysis served', { requestId: req.requestId });
  res.status(200).json(mockData);
});

// State-specific analysis
router.get('/state/:stateName', (req, res) => {
  const { stateName } = req.params;
  const state = stateName.toLowerCase();

  const stateData = {
    texas: {
      name: 'Texas',
      status: 'Hemp Legal, Medical (Low THC)',
      revenuePotential: '$47 Million (lost to OK)',
      complianceScore: 75,
      population: '30.5M',
      hempAcres: '15,000',
      keyIssues: ['Border bleed to OK', 'Restrictive THC limits', 'Limited processing'],
      policyStatus: 'TTSA Proposed',
      nextSteps: ['Legislative filing', 'DSHS engagement', 'Stakeholder meetings'],
      economicImpact: {
        directJobs: '5,000+',
        indirectJobs: '15,000+',
        taxRevenue: '$47M+ annually',
        gdpImpact: '$200M+'
      }
    },
    oklahoma: {
      name: 'Oklahoma',
      status: 'Medical, High THC Hemp',
      revenuePotential: '$1.2 Billion',
      complianceScore: 90,
      population: '4.0M',
      hempAcres: '45,000',
      keyIssues: ['Capturing TX revenue', 'Processing capacity', 'Quality standards'],
      policyStatus: 'Established',
      nextSteps: ['Market expansion', 'Quality improvement', 'Export development'],
      economicImpact: {
        directJobs: '25,000+',
        indirectJobs: '75,000+',
        taxRevenue: '$120M+ annually',
        gdpImpact: '$1.2B+'
      }
    }
  };

  const stateInfo = stateData[state] || {
    name: stateName,
    status: 'Analysis pending',
    message: 'Detailed analysis coming soon'
  };

  logger.info(`State analysis served for ${stateName}`, { requestId: req.requestId });
  res.status(200).json(stateInfo);
});

export default router;
