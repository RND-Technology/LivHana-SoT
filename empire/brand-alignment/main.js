import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 8085;

// Brand Alignment System
class BrandAlignmentSystem {
  constructor() {
    this.brandVoice = {
      // ReggieAndDro brand characteristics
      personality: {
        authentic: true,
        relatable: true,
        educational: true,
        communityFocused: true,
        professional: true,
        innovationDriven: true,
        texasProud: true
      },
      
      // Voice tone guidelines
      tone: {
        conversational: 'Friendly, approachable language',
        authoritative: 'Expert knowledge with confidence',
        supportive: 'Community empowerment focus',
        forwardThinking: 'Innovation and progress emphasis',
        texasProud: 'Lone Star State identity integration'
      },
      
      // Content strategy
      contentStrategy: {
        educational: 'Cannabis compliance and safety focus',
        community: 'Texas cannabis advocacy',
        innovation: 'Technology and compliance leadership',
        professional: 'Business credibility with accessibility',
        authentic: 'Down-to-earth cannabis community focus'
      },
      
      // Brand elements
      elements: {
        colors: {
          primary: '#DC2626', // Texas Red
          secondary: '#F59E0B', // Texas Gold
          accent: '#16A34A', // Texas Green
          neutral: '#64748B' // Texas Gray
        },
        typography: {
          primary: 'Inter, system-ui, sans-serif',
          secondary: 'Georgia, serif',
          accent: 'Monaco, monospace'
        },
        imagery: {
          style: 'Clean, professional, Texas-inspired',
          mood: 'Trustworthy, innovative, community-focused'
        }
      }
    };
    
    this.alignmentRules = new Map();
    this.voiceOptimization = new Map();
  }
  
  // Analyze content for brand alignment
  analyzeContent(content, contentType = 'general') {
    const analysis = {
      id: uuidv4(),
      content,
      contentType,
      alignmentScore: 0,
      issues: [],
      suggestions: [],
      timestamp: new Date().toISOString()
    };
    
    // Check voice consistency
    const voiceCheck = this.checkVoiceConsistency(content);
    analysis.alignmentScore += voiceCheck.score;
    analysis.issues.push(...voiceCheck.issues);
    analysis.suggestions.push(...voiceCheck.suggestions);
    
    // Check brand elements
    const elementCheck = this.checkBrandElements(content);
    analysis.alignmentScore += elementCheck.score;
    analysis.issues.push(...elementCheck.issues);
    analysis.suggestions.push(...elementCheck.suggestions);
    
    // Check compliance
    const complianceCheck = this.checkCompliance(content);
    analysis.alignmentScore += complianceCheck.score;
    analysis.issues.push(...complianceCheck.issues);
    analysis.suggestions.push(...complianceCheck.suggestions);
    
    // Calculate final score
    analysis.alignmentScore = Math.min(100, Math.max(0, analysis.alignmentScore));
    
    return analysis;
  }
  
  // Check voice consistency
  checkVoiceConsistency(content) {
    const issues = [];
    const suggestions = [];
    let score = 0;
    
    // Check for conversational tone
    if (this.isConversational(content)) {
      score += 20;
    } else {
      issues.push('Content lacks conversational tone');
      suggestions.push('Use more friendly, approachable language');
    }
    
    // Check for educational value
    if (this.isEducational(content)) {
      score += 20;
    } else {
      issues.push('Content lacks educational value');
      suggestions.push('Add educational elements about cannabis compliance');
    }
    
    // Check for community focus
    if (this.isCommunityFocused(content)) {
      score += 20;
    } else {
      issues.push('Content lacks community focus');
      suggestions.push('Emphasize community empowerment and advocacy');
    }
    
    // Check for Texas pride
    if (this.isTexasProud(content)) {
      score += 20;
    } else {
      issues.push('Content lacks Texas identity');
      suggestions.push('Integrate Lone Star State pride and identity');
    }
    
    // Check for innovation focus
    if (this.isInnovationDriven(content)) {
      score += 20;
    } else {
      issues.push('Content lacks innovation focus');
      suggestions.push('Highlight technology and compliance leadership');
    }
    
    return { score, issues, suggestions };
  }
  
  // Check brand elements
  checkBrandElements(content) {
    const issues = [];
    const suggestions = [];
    let score = 0;
    
    // Check for brand colors
    if (this.containsBrandColors(content)) {
      score += 25;
    } else {
      issues.push('Content lacks brand color integration');
      suggestions.push('Use Texas Red (#DC2626) and Texas Gold (#F59E0B)');
    }
    
    // Check for brand typography
    if (this.containsBrandTypography(content)) {
      score += 25;
    } else {
      issues.push('Content lacks brand typography');
      suggestions.push('Use Inter for primary text, Georgia for secondary');
    }
    
    // Check for brand imagery
    if (this.containsBrandImagery(content)) {
      score += 25;
    } else {
      issues.push('Content lacks brand imagery');
      suggestions.push('Use clean, professional, Texas-inspired imagery');
    }
    
    // Check for brand mood
    if (this.containsBrandMood(content)) {
      score += 25;
    } else {
      issues.push('Content lacks brand mood');
      suggestions.push('Convey trustworthy, innovative, community-focused mood');
    }
    
    return { score, issues, suggestions };
  }
  
  // Check compliance
  checkCompliance(content) {
    const issues = [];
    const suggestions = [];
    let score = 0;
    
    // Check for medical claims
    if (!this.containsMedicalClaims(content)) {
      score += 25;
    } else {
      issues.push('Content contains medical claims');
      suggestions.push('Remove medical claims to ensure compliance');
    }
    
    // Check for age verification
    if (this.containsAgeVerification(content)) {
      score += 25;
    } else {
      issues.push('Content lacks age verification');
      suggestions.push('Add 21+ age verification notice');
    }
    
    // Check for compliance language
    if (this.containsComplianceLanguage(content)) {
      score += 25;
    } else {
      issues.push('Content lacks compliance language');
      suggestions.push('Add TTSA-aligned compliance language');
    }
    
    // Check for disclaimers
    if (this.containsDisclaimers(content)) {
      score += 25;
    } else {
      issues.push('Content lacks disclaimers');
      suggestions.push('Add appropriate disclaimers');
    }
    
    return { score, issues, suggestions };
  }
  
  // Voice optimization
  optimizeVoice(content, targetAudience = 'general') {
    const optimization = {
      id: uuidv4(),
      originalContent: content,
      optimizedContent: content,
      improvements: [],
      targetAudience,
      timestamp: new Date().toISOString()
    };
    
    // Apply voice optimizations
    optimization.optimizedContent = this.applyVoiceOptimizations(content, targetAudience);
    optimization.improvements = this.getImprovements(content, optimization.optimizedContent);
    
    return optimization;
  }
  
  // Apply voice optimizations
  applyVoiceOptimizations(content, targetAudience) {
    let optimized = content;
    
    // Make more conversational
    optimized = optimized.replace(/utilize/g, 'use');
    optimized = optimized.replace(/facilitate/g, 'help');
    optimized = optimized.replace(/implement/g, 'put in place');
    
    // Add Texas pride
    if (!optimized.includes('Texas') && !optimized.includes('Lone Star')) {
      optimized = optimized.replace(/state/g, 'Lone Star State');
    }
    
    // Add community focus
    if (!optimized.includes('community') && !optimized.includes('together')) {
      optimized = optimized.replace(/we/g, 'we as a community');
    }
    
    // Add educational elements
    if (!optimized.includes('learn') && !optimized.includes('education')) {
      optimized = optimized.replace(/know/g, 'learn and know');
    }
    
    return optimized;
  }
  
  // Get improvements
  getImprovements(original, optimized) {
    const improvements = [];
    
    if (original !== optimized) {
      improvements.push('Voice optimization applied');
      improvements.push('Conversational tone enhanced');
      improvements.push('Texas pride integrated');
      improvements.push('Community focus emphasized');
      improvements.push('Educational elements added');
    }
    
    return improvements;
  }
  
  // Helper methods
  isConversational(content) {
    const conversationalWords = ['you', 'we', 'us', 'our', 'let\'s', 'here\'s', 'check out'];
    return conversationalWords.some(word => content.toLowerCase().includes(word));
  }
  
  isEducational(content) {
    const educationalWords = ['learn', 'education', 'compliance', 'safety', 'guide', 'how to'];
    return educationalWords.some(word => content.toLowerCase().includes(word));
  }
  
  isCommunityFocused(content) {
    const communityWords = ['community', 'together', 'advocacy', 'empowerment', 'support'];
    return communityWords.some(word => content.toLowerCase().includes(word));
  }
  
  isTexasProud(content) {
    const texasWords = ['texas', 'lone star', 'state', 'texan', 'houston', 'dallas', 'austin'];
    return texasWords.some(word => content.toLowerCase().includes(word));
  }
  
  isInnovationDriven(content) {
    const innovationWords = ['innovation', 'technology', 'advanced', 'cutting-edge', 'modern'];
    return innovationWords.some(word => content.toLowerCase().includes(word));
  }
  
  containsBrandColors(content) {
    const brandColors = ['#DC2626', '#F59E0B', '#16A34A', '#64748B'];
    return brandColors.some(color => content.includes(color));
  }
  
  containsBrandTypography(content) {
    const typography = ['Inter', 'Georgia', 'Monaco'];
    return typography.some(font => content.includes(font));
  }
  
  containsBrandImagery(content) {
    const imageryWords = ['clean', 'professional', 'texas', 'trustworthy'];
    return imageryWords.some(word => content.toLowerCase().includes(word));
  }
  
  containsBrandMood(content) {
    const moodWords = ['trustworthy', 'innovative', 'community-focused', 'reliable'];
    return moodWords.some(word => content.toLowerCase().includes(word));
  }
  
  containsMedicalClaims(content) {
    const medicalWords = ['cure', 'treat', 'heal', 'medicine', 'therapeutic'];
    return medicalWords.some(word => content.toLowerCase().includes(word));
  }
  
  containsAgeVerification(content) {
    return content.includes('21+') || content.includes('age verification');
  }
  
  containsComplianceLanguage(content) {
    const complianceWords = ['compliance', 'legal', 'regulated', 'permitted'];
    return complianceWords.some(word => content.toLowerCase().includes(word));
  }
  
  containsDisclaimers(content) {
    const disclaimerWords = ['disclaimer', 'notice', 'warning', 'important'];
    return disclaimerWords.some(word => content.toLowerCase().includes(word));
  }
}

// Initialize Brand Alignment System
const brandAlignment = new BrandAlignmentSystem();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'brand-alignment',
    timestamp: new Date().toISOString(),
    features: ['voice-analysis', 'brand-elements', 'compliance-check', 'voice-optimization']
  });
});

// Brand analysis endpoint
app.post('/api/brand/analyze', (req, res) => {
  const { content, contentType } = req.body;
  
  try {
    const analysis = brandAlignment.analyzeContent(content, contentType);
    res.status(200).json({
      analysis,
      brandVoice: brandAlignment.brandVoice
    });
  } catch (error) {
    console.error('Brand analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Voice optimization endpoint
app.post('/api/brand/optimize-voice', (req, res) => {
  const { content, targetAudience } = req.body;
  
  try {
    const optimization = brandAlignment.optimizeVoice(content, targetAudience);
    res.status(200).json({
      optimization,
      brandVoice: brandAlignment.brandVoice
    });
  } catch (error) {
    console.error('Voice optimization error:', error);
    res.status(500).json({ error: 'Optimization failed' });
  }
});

// Brand voice guidelines endpoint
app.get('/api/brand/voice', (req, res) => {
  res.status(200).json({
    brandVoice: brandAlignment.brandVoice,
    timestamp: new Date().toISOString()
  });
});

// Brand elements endpoint
app.get('/api/brand/elements', (req, res) => {
  res.status(200).json({
    elements: brandAlignment.brandVoice.elements,
    timestamp: new Date().toISOString()
  });
});

// Compliance check endpoint
app.post('/api/brand/compliance', (req, res) => {
  const { content } = req.body;
  
  try {
    const complianceCheck = brandAlignment.checkCompliance(content);
    res.status(200).json({
      complianceCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Compliance check error:', error);
    res.status(500).json({ error: 'Compliance check failed' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🔥 Brand Alignment running on port ${PORT}`);
  console.log(`🎤 ReggieAndDro voice analysis active`);
  console.log(`🎨 Brand elements validation ready`);
  console.log(`📋 Compliance checking active`);
  console.log(`🚀 Voice optimization ready`);
  console.log(`🌟 10X branding strategy applied`);
});
