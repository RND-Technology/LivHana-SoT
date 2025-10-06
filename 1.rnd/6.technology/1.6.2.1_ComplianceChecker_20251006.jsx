/**
 * 🛡️ FREE COMPLIANCE CHECKER TOOL - Texas Cannabis Compliance
 * 
 * Features:
 * - Age verification compliance
 * - THC limit checking
 * - License validation
 * - Product compliance scoring
 * - Real-time compliance monitoring
 * 
 * Philosophy: "Stay compliant, stay profitable"
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  Alert,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  Divider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Shield,
  CheckCircle,
  Warning,
  Error,
  Gavel,
  People,
  Inventory,
  AttachMoney,
  TrendingUp,
  Security
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ComplianceChecker = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [complianceData, setComplianceData] = useState({
    ageVerification: false,
    thcLimit: '',
    licenseValid: false,
    productType: '',
    state: 'Texas',
    businessType: 'retail'
  });
  const [complianceScore, setComplianceScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const steps = [
    'Age Verification',
    'THC Compliance',
    'License Validation',
    'Product Compliance',
    'Final Review'
  ];

  const complianceRules = {
    texas: {
      maxThc: 0.3,
      ageLimit: 21,
      licenseRequired: true,
      productTypes: ['Hemp', 'CBD', 'Delta-8', 'Delta-9', 'Other']
    },
    federal: {
      maxThc: 0.3,
      ageLimit: 21,
      licenseRequired: true,
      productTypes: ['Hemp', 'CBD']
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setComplianceData({
      ageVerification: false,
      thcLimit: '',
      licenseValid: false,
      productType: '',
      state: 'Texas',
      businessType: 'retail'
    });
    setComplianceScore(null);
  };

  const calculateComplianceScore = () => {
    setLoading(true);
    
    // Simulate calculation
    setTimeout(() => {
      let score = 0;
      let maxScore = 100;
      const issues = [];

      // Age verification (20 points)
      if (complianceData.ageVerification) {
        score += 20;
      } else {
        issues.push('Age verification system required');
      }

      // THC compliance (30 points)
      const thcValue = parseFloat(complianceData.thcLimit);
      if (thcValue <= complianceRules.texas.maxThc) {
        score += 30;
      } else {
        issues.push(`THC exceeds limit: ${thcValue}% > ${complianceRules.texas.maxThc}%`);
      }

      // License validation (25 points)
      if (complianceData.licenseValid) {
        score += 25;
      } else {
        issues.push('Valid license required');
      }

      // Product compliance (25 points)
      if (complianceData.productType) {
        score += 25;
      } else {
        issues.push('Product type must be specified');
      }

      const percentage = Math.round((score / maxScore) * 100);
      
      setComplianceScore({
        score: percentage,
        issues,
        compliant: percentage >= 80,
        recommendations: generateRecommendations(percentage, issues)
      });
      
      setLoading(false);
    }, 2000);
  };

  const generateRecommendations = (score, issues) => {
    const recommendations = [];
    
    if (score < 80) {
      recommendations.push('Implement age verification system');
      recommendations.push('Obtain proper licensing');
      recommendations.push('Test products for THC compliance');
    }
    
    if (score >= 80) {
      recommendations.push('Maintain current compliance standards');
      recommendations.push('Regular compliance audits recommended');
    }
    
    return recommendations;
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Age Verification Compliance
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={complianceData.ageVerification}
                  onChange={(e) => setComplianceData({...complianceData, ageVerification: e.target.checked})}
                />
              }
              label="Age verification system implemented"
            />
            <Alert severity="info" sx={{ mt: 2 }}>
              Texas requires age verification for all cannabis products. Minimum age: 21 years.
            </Alert>
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              THC Compliance
            </Typography>
            <TextField
              fullWidth
              label="Total THC %"
              type="number"
              value={complianceData.thcLimit}
              onChange={(e) => setComplianceData({...complianceData, thcLimit: e.target.value})}
              inputProps={{ step: 0.01, min: 0, max: 100 }}
              sx={{ mb: 2 }}
            />
            <Alert severity="warning" sx={{ mt: 2 }}>
              Texas hemp limit: ≤0.3% Total THC. Products exceeding this limit require cannabis licensing.
            </Alert>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              License Validation
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={complianceData.licenseValid}
                  onChange={(e) => setComplianceData({...complianceData, licenseValid: e.target.checked})}
                />
              }
              label="Valid business license"
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Business Type</InputLabel>
              <Select
                value={complianceData.businessType}
                onChange={(e) => setComplianceData({...complianceData, businessType: e.target.value})}
              >
                <MenuItem value="retail">Retail</MenuItem>
                <MenuItem value="wholesale">Wholesale</MenuItem>
                <MenuItem value="manufacturing">Manufacturing</MenuItem>
                <MenuItem value="cultivation">Cultivation</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
      
      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Product Compliance
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Product Type</InputLabel>
              <Select
                value={complianceData.productType}
                onChange={(e) => setComplianceData({...complianceData, productType: e.target.value})}
              >
                {complianceRules.texas.productTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Alert severity="info" sx={{ mt: 2 }}>
              Different product types have different compliance requirements. Ensure proper testing and labeling.
            </Alert>
          </Box>
        );
      
      case 4:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Final Review
            </Typography>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Compliance Summary:</Typography>
              <Typography variant="body2">Age Verification: {complianceData.ageVerification ? '✅' : '❌'}</Typography>
              <Typography variant="body2">THC Limit: {complianceData.thcLimit}%</Typography>
              <Typography variant="body2">License Valid: {complianceData.licenseValid ? '✅' : '❌'}</Typography>
              <Typography variant="body2">Product Type: {complianceData.productType}</Typography>
              <Typography variant="body2">Business Type: {complianceData.businessType}</Typography>
            </Paper>
            <Button
              variant="contained"
              onClick={calculateComplianceScore}
              disabled={loading}
              fullWidth
              sx={{ bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}
            >
              {loading ? 'Calculating...' : 'Calculate Compliance Score'}
            </Button>
          </Box>
        );
      
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#DC2626', fontWeight: 'bold' }}>
        🛡️ Free Compliance Checker Tool
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, color: '#64748B' }}>
        Comprehensive Texas cannabis compliance checking and scoring system
      </Typography>

      <Grid container spacing={3}>
        {/* Stepper */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                    <StepContent>
                      {getStepContent(index)}
                      <Box sx={{ mb: 2, mt: 2 }}>
                        <div>
                          <Button
                            variant="contained"
                            onClick={index === steps.length - 1 ? calculateComplianceScore : handleNext}
                            sx={{ mr: 1, bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}
                            disabled={loading}
                          >
                            {index === steps.length - 1 ? 'Calculate Score' : 'Continue'}
                          </Button>
                          <Button
                            disabled={index === 0}
                            onClick={handleBack}
                            sx={{ mr: 1 }}
                          >
                            Back
                          </Button>
                        </div>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
              
              {activeStep === steps.length && (
                <Paper square elevation={0} sx={{ p: 3 }}>
                  <Typography>All steps completed - you&apos;re finished</Typography>
                  <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                    Reset
                  </Button>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Compliance Score */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📊 Compliance Score
              </Typography>
              
              {loading && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Calculating compliance score...
                  </Typography>
                </Box>
              )}
              
              {complianceScore && (
                <Box>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h2" sx={{ 
                      color: complianceScore.compliant ? '#16A34A' : '#DC2626',
                      fontWeight: 'bold'
                    }}>
                      {complianceScore.score}%
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: complianceScore.compliant ? '#16A34A' : '#DC2626'
                    }}>
                      {complianceScore.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {complianceScore.issues.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Issues Found:
                      </Typography>
                      {complianceScore.issues.map((issue, index) => (
                        <Alert key={index} severity="error" sx={{ mb: 1 }}>
                          {issue}
                        </Alert>
                      ))}
                    </Box>
                  )}
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Recommendations:
                    </Typography>
                    {complianceScore.recommendations.map((rec, index) => (
                      <Alert key={index} severity="info" sx={{ mb: 1 }}>
                        {rec}
                      </Alert>
                    ))}
                  </Box>
                </Box>
              )}
              
              {!complianceScore && !loading && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Shield sx={{ fontSize: 64, color: '#64748B', mb: 2 }} />
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Complete the compliance checklist to get your score
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🚀 Quick Actions
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    startIcon={<Gavel />}
                    fullWidth
                    sx={{ py: 2 }}
                  >
                    Legal Resources
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    startIcon={<People />}
                    fullWidth
                    sx={{ py: 2 }}
                  >
                    Age Verification
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    startIcon={<Inventory />}
                    fullWidth
                    sx={{ py: 2 }}
                  >
                    Product Testing
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    startIcon={<Security />}
                    fullWidth
                    sx={{ py: 2 }}
                  >
                    Security Audit
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComplianceChecker;
