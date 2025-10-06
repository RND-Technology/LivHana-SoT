import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 8087;

// Square Email Test System
class SquareEmailTest {
  constructor() {
    this.emailTemplates = {
      hempress3Seeds: {
        subject: '🌱 Hempress3 Premium Seeds - Texas Takeover Special!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #DC2626 0%, #F59E0B 50%, #16A34A 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">🤠 Texas Takeover Seeds</h1>
              <p style="color: white; margin: 10px 0;">Premium Hempress3 Seeds Now Available!</p>
            </div>
            
            <div style="padding: 30px; background: white;">
              <h2 style="color: #DC2626;">🌱 Hempress3 Premium Seeds</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Everything's bigger in Texas - including our seed quality! 
                Introducing Hempress3 Premium Seeds, now available through our Square integration.
              </p>
              
              <div style="background: #f0f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #DC2626; margin-top: 0;">✨ What Makes Hempress3 Special:</h3>
                <ul style="color: #333;">
                  <li>🌿 Premium genetics for optimal growth</li>
                  <li>📊 Full compliance with Texas regulations</li>
                  <li>🔬 Lab-tested for quality assurance</li>
                  <li>🚀 Ready for immediate cultivation</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://exoticcanopysolutions.com/products/hempress3-seeds" 
                   style="background: #DC2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  🛒 Order Hempress3 Seeds - $49.99
                </a>
              </div>
              
              <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #16A34A; font-weight: bold;">
                  ⚡ Cheetah Power Special: Free shipping on orders over $100!
                </p>
              </div>
              
              <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
                This email was sent from our Square integration system.<br>
                <strong>21+ Only. Educational purposes. No medical claims.</strong>
              </p>
            </div>
            
            <div style="background: #64748B; padding: 20px; text-align: center;">
              <p style="color: white; margin: 0; font-size: 14px;">
                🤠 Texas Takeover | Liv Hana | Cheetah Power
              </p>
            </div>
          </div>
        `,
        text: `
          Texas Takeover Seeds - Premium Hempress3 Seeds Now Available!
          
          Everything's bigger in Texas - including our seed quality! 
          Introducing Hempress3 Premium Seeds, now available through our Square integration.
          
          What Makes Hempress3 Special:
          - Premium genetics for optimal growth
          - Full compliance with Texas regulations
          - Lab-tested for quality assurance
          - Ready for immediate cultivation
          
          Order Now: https://exoticcanopysolutions.com/products/hempress3-seeds
          Price: $49.99
          
          Cheetah Power Special: Free shipping on orders over $100!
          
          21+ Only. Educational purposes. No medical claims.
          
          Texas Takeover | Liv Hana | Cheetah Power
        `
      },
      
      cbdProducts: {
        subject: '💚 CBD Wellness Products - Texas Compliant & Ready!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #16A34A 0%, #F59E0B 50%, #DC2626 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">💚 CBD Wellness Collection</h1>
              <p style="color: white; margin: 10px 0;">Texas Compliant CBD Products Now Available!</p>
            </div>
            
            <div style="padding: 30px; background: white;">
              <h2 style="color: #16A34A;">🌿 Premium CBD Products</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Discover our curated selection of Texas-compliant CBD wellness products. 
                Each product is lab-tested, compliant, and ready for your wellness journey.
              </p>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #16A34A; margin-top: 0;">✨ Product Highlights:</h3>
                <ul style="color: #333;">
                  <li>🧪 Lab-tested for purity and potency</li>
                  <li>📋 Full Texas compliance documentation</li>
                  <li>🌱 Natural, premium ingredients</li>
                  <li>📦 Fast, secure shipping</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://exoticcanopysolutions.com/products/cbd-wellness" 
                   style="background: #16A34A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  🛒 Shop CBD Products - Starting at $29.99
                </a>
              </div>
              
              <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #16A34A; font-weight: bold;">
                  ⚡ Cheetah Power Special: 15% off your first order!
                </p>
              </div>
              
              <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
                This email was sent from our Square integration system.<br>
                <strong>21+ Only. Educational purposes. No medical claims.</strong>
              </p>
            </div>
            
            <div style="background: #64748B; padding: 20px; text-align: center;">
              <p style="color: white; margin: 0; font-size: 14px;">
                🤠 Texas Takeover | Liv Hana | Cheetah Power
              </p>
            </div>
          </div>
        `,
        text: `
          CBD Wellness Collection - Texas Compliant CBD Products Now Available!
          
          Discover our curated selection of Texas-compliant CBD wellness products. 
          Each product is lab-tested, compliant, and ready for your wellness journey.
          
          Product Highlights:
          - Lab-tested for purity and potency
          - Full Texas compliance documentation
          - Natural, premium ingredients
          - Fast, secure shipping
          
          Shop Now: https://exoticcanopysolutions.com/products/cbd-wellness
          Starting at: $29.99
          
          Cheetah Power Special: 15% off your first order!
          
          21+ Only. Educational purposes. No medical claims.
          
          Texas Takeover | Liv Hana | Cheetah Power
        `
      },
      
      educationalMaterials: {
        subject: '📚 Cannabis Education Materials - Learn Texas Compliance!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #F59E0B 0%, #DC2626 50%, #16A34A 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">📚 Cannabis Education Hub</h1>
              <p style="color: white; margin: 10px 0;">Master Texas Cannabis Compliance!</p>
            </div>
            
            <div style="padding: 30px; background: white;">
              <h2 style="color: #F59E0B;">🎓 Educational Materials</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Stay ahead of the curve with our comprehensive cannabis education materials. 
                Learn Texas compliance, regulations, and best practices from industry experts.
              </p>
              
              <div style="background: #fefce8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #F59E0B; margin-top: 0;">📖 What You'll Learn:</h3>
                <ul style="color: #333;">
                  <li>📋 Texas cannabis regulations and compliance</li>
                  <li>🔬 COA interpretation and validation</li>
                  <li>💼 Business best practices</li>
                  <li>⚖️ Legal considerations and updates</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://exoticcanopysolutions.com/products/education" 
                   style="background: #F59E0B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  📚 Access Education Materials - $19.99
                </a>
              </div>
              
              <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #16A34A; font-weight: bold;">
                  ⚡ Cheetah Power Special: Free COA checker tool included!
                </p>
              </div>
              
              <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
                This email was sent from our Square integration system.<br>
                <strong>21+ Only. Educational purposes. No medical claims.</strong>
              </p>
            </div>
            
            <div style="background: #64748B; padding: 20px; text-align: center;">
              <p style="color: white; margin: 0; font-size: 14px;">
                🤠 Texas Takeover | Liv Hana | Cheetah Power
              </p>
            </div>
          </div>
        `,
        text: `
          Cannabis Education Hub - Master Texas Cannabis Compliance!
          
          Stay ahead of the curve with our comprehensive cannabis education materials. 
          Learn Texas compliance, regulations, and best practices from industry experts.
          
          What You'll Learn:
          - Texas cannabis regulations and compliance
          - COA interpretation and validation
          - Business best practices
          - Legal considerations and updates
          
          Access Now: https://exoticcanopysolutions.com/products/education
          Price: $19.99
          
          Cheetah Power Special: Free COA checker tool included!
          
          21+ Only. Educational purposes. No medical claims.
          
          Texas Takeover | Liv Hana | Cheetah Power
        `
      }
    };
  }
  
  // Send test email
  sendTestEmail(templateType, recipientEmail) {
    const template = this.emailTemplates[templateType];
    if (!template) {
      throw new Error(`Template ${templateType} not found`);
    }
    
    const emailData = {
      id: uuidv4(),
      template: templateType,
      recipient: recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      sentAt: new Date().toISOString(),
      status: 'sent'
    };
    
    console.log(`📧 Test email sent: ${templateType} to ${recipientEmail}`);
    return emailData;
  }
  
  // Get all email templates
  getAllTemplates() {
    return Object.keys(this.emailTemplates).map(key => ({
      type: key,
      subject: this.emailTemplates[key].subject,
      preview: this.emailTemplates[key].text.substring(0, 100) + '...'
    }));
  }
}

// Initialize Square Email Test
const emailTest = new SquareEmailTest();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'square-email-test',
    timestamp: new Date().toISOString(),
    features: ['email-templates', 'test-sending', 'square-integration']
  });
});

// Send test email endpoint
app.post('/api/email/send-test', (req, res) => {
  const { templateType, recipientEmail } = req.body;
  
  try {
    const emailData = emailTest.sendTestEmail(templateType, recipientEmail);
    res.status(200).json({
      message: 'Test email sent successfully',
      emailData
    });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: 'Email sending failed' });
  }
});

// Get email templates endpoint
app.get('/api/email/templates', (req, res) => {
  try {
    const templates = emailTest.getAllTemplates();
    res.status(200).json({ templates });
  } catch (error) {
    console.error('Templates retrieval error:', error);
    res.status(500).json({ error: 'Templates retrieval failed' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`📧 Square Email Test running on port ${PORT}`);
  console.log(`🌱 Hempress3 seeds email ready`);
  console.log(`💚 CBD products email ready`);
  console.log(`📚 Educational materials email ready`);
  console.log(`🚀 AM traffic kickoff prepared`);
  console.log(`⚡ Cheetah Power email system active`);
});
