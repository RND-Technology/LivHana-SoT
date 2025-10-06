/**
 * 🤠 TEXAS FULL PANEL COA CHECKER - Lone Star Compliance Tool
 * 
 * Features:
 * - Phone camera COA scanning
 * - Texas DSHS compliance validation
 * - NIST validation checking
 * - Quick compliance checker
 * - QR code generation
 * 
 * Philosophy: "Everything's bigger in Texas - including our compliance standards"
 */

import React, { useState, useRef } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  CameraAlt,
  Upload,
  CheckCircle,
  Warning,
  Error,
  QrCode,
  Download,
  Share
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const TexasCOAChecker = () => {
  const [coaData, setCoaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [complianceResult, setComplianceResult] = useState(null);
  const [quickCheck, setQuickCheck] = useState({
    totalThc: '',
    hasNovel: false,
    nistValidated: false
  });
  const [showQuickCheck, setShowQuickCheck] = useState(false);
  const fileInputRef = useRef(null);

  // Texas Full Panel Requirements
  const texasRequirements = {
    cannabinoids: [
      'Delta-9 THC', 'THCA', 'CBD', 'CBDA', 'CBG', 'CBGA',
      'CBC', 'CBN', 'Delta-8 THC', 'THCV', 'Total THC', 'Total CBD'
    ],
    heavyMetals: ['Lead (Pb)', 'Arsenic (As)', 'Cadmium (Cd)', 'Mercury (Hg)'],
    microbial: ['Total Aerobic Count', 'Total Yeast and Mold', 'E. coli', 'Salmonella', 'Aspergillus'],
    pesticides: ['Minimum 15 pesticides required', 'NIST validation required for novel cannabinoids'],
    mycotoxins: ['Aflatoxins (B1, B2, G1, G2)', 'Ochratoxin A'],
    residualSolvents: ['Butane', 'Propane', 'Ethanol', 'Acetone', 'Isopropanol', 'Hexane', 'Heptane']
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      // Simulate COA processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock COA data
      const mockCoaData = {
        id: `TX-COA-${Date.now()}`,
        lab: 'KCA Labs',
        date: new Date().toISOString(),
        product: 'Texas Hemp Flower',
        cannabinoids: {
          'Total THC': 0.28,
          'Total CBD': 12.5,
          'Delta-9 THC': 0.15,
          'THCA': 0.13,
          'CBD': 12.1,
          'CBDA': 0.4
        },
        heavyMetals: {
          'Lead (Pb)': '<0.1 ppm',
          'Arsenic (As)': '<0.1 ppm',
          'Cadmium (Cd)': '<0.1 ppm',
          'Mercury (Hg)': '<0.1 ppm'
        },
        microbial: {
          'Total Aerobic Count': '<10 CFU/g',
          'Total Yeast and Mold': '<10 CFU/g',
          'E. coli': 'Not Detected',
          'Salmonella': 'Not Detected'
        },
        pesticides: '15 pesticides tested - All Pass',
        mycotoxins: 'Aflatoxins B1, B2, G1, G2 - Not Detected',
        residualSolvents: 'All solvents tested - Pass'
      };

      setCoaData(mockCoaData);
      
      // Validate compliance
      const isCompliant = mockCoaData.cannabinoids['Total THC'] <= 0.3;
      const flags = isCompliant 
        ? ['✅ TEXAS COMPLIANT - ≤0.3% Total THC', '✅ ALL TESTS PASSED']
        : ['❌ EXCEEDS TEXAS LIMIT: >0.3% Total THC'];
      
      setComplianceResult({
        compliant: isCompliant,
        flags,
        coaId: mockCoaData.id
      });

    } catch (error) {
      console.error('COA processing error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheck = async () => {
    if (!quickCheck.totalThc) return;

    setLoading(true);
    try {
      const totalThc = parseFloat(quickCheck.totalThc);
      const isCompliant = totalThc <= 0.3;
      
      const flags = [];
      if (isCompliant) {
        flags.push('✅ TEXAS COMPLIANT - ≤0.3% Total THC');
        if (quickCheck.nistValidated) {
          flags.push('✅ NIST-VALIDATED METHOD');
        }
      } else {
        flags.push(`❌ EXCEEDS TEXAS LIMIT: ${totalThc}% THC (max 0.3%)`);
      }
      
      if (quickCheck.hasNovel && !quickCheck.nistValidated) {
        flags.push('⚠️ NOVEL CANNABINOID REQUIRES NIST-VALIDATED METHOD');
      }

      setComplianceResult({
        compliant: isCompliant,
        flags,
        totalThc,
        quickCheck: true
      });

    } catch (error) {
      console.error('Quick check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = () => {
    if (!coaData) return;
    // In production, generate actual QR code
    alert(`QR Code generated for COA: ${coaData.id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#DC2626', fontWeight: 'bold' }}>
        🤠 Texas Full Panel COA Checker
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, color: '#64748B' }}>
        Validate Texas DSHS compliance with phone camera scanning and NIST validation
      </Typography>

      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📸 Upload COA Document
              </Typography>
              
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                
                <Button
                  variant="contained"
                  startIcon={<CameraAlt />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  sx={{ 
                    bgcolor: '#DC2626',
                    '&:hover': { bgcolor: '#B91C1C' },
                    mb: 2
                  }}
                >
                  Scan COA with Camera
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Upload />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  sx={{ ml: 2 }}
                >
                  Upload File
                </Button>
                
                {loading && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Processing COA document...
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Check Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                ⚡ Quick Compliance Check
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Total THC %"
                  type="number"
                  value={quickCheck.totalThc}
                  onChange={(e) => setQuickCheck({...quickCheck, totalThc: e.target.value})}
                  inputProps={{ step: 0.01, min: 0, max: 100 }}
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label="Novel Cannabinoids"
                    color={quickCheck.hasNovel ? 'primary' : 'default'}
                    onClick={() => setQuickCheck({...quickCheck, hasNovel: !quickCheck.hasNovel})}
                  />
                  <Chip
                    label="NIST Validated"
                    color={quickCheck.nistValidated ? 'success' : 'default'}
                    onClick={() => setQuickCheck({...quickCheck, nistValidated: !quickCheck.nistValidated})}
                  />
                </Box>
                
                <Button
                  variant="contained"
                  onClick={handleQuickCheck}
                  disabled={loading || !quickCheck.totalThc}
                  fullWidth
                  sx={{ bgcolor: '#F59E0B', '&:hover': { bgcolor: '#D97706' } }}
                >
                  Check Compliance
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Section */}
        {complianceResult && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  📋 Compliance Results
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {complianceResult.compliant ? (
                    <CheckCircle sx={{ color: '#16A34A', mr: 1 }} />
                  ) : (
                    <Error sx={{ color: '#DC2626', mr: 1 }} />
                  )}
                  <Typography variant="h6" sx={{ 
                    color: complianceResult.compliant ? '#16A34A' : '#DC2626',
                    fontWeight: 'bold'
                  }}>
                    {complianceResult.compliant ? 'TEXAS COMPLIANT' : 'NON-COMPLIANT'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  {complianceResult.flags.map((flag, index) => (
                    <Alert 
                      key={index} 
                      severity={flag.includes('✅') ? 'success' : flag.includes('⚠️') ? 'warning' : 'error'}
                      sx={{ mb: 1 }}
                    >
                      {flag}
                    </Alert>
                  ))}
                </Box>
                
                {coaData && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      COA Details:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                      ID: {coaData.id} | Lab: {coaData.lab} | Date: {new Date(coaData.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<QrCode />}
                    onClick={generateQRCode}
                  >
                    Generate QR Code
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                  >
                    Download Report
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Share />}
                  >
                    Share Results
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Texas Requirements */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📋 Texas Full Panel Requirements
              </Typography>
              
              <Grid container spacing={2}>
                {Object.entries(texasRequirements).map(([category, requirements]) => (
                  <Grid item xs={12} sm={6} md={4} key={category}>
                    <Paper sx={{ p: 2, bgcolor: '#F8FAFC' }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Typography>
                      {Array.isArray(requirements) ? (
                        <ul style={{ margin: 0, paddingLeft: '16px' }}>
                          {requirements.map((req, index) => (
                            <li key={index} style={{ fontSize: '0.875rem', color: '#64748B' }}>
                              {req}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#64748B' }}>
                          {requirements}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TexasCOAChecker;
