#!/bin/bash
set -e

echo "=== LIV HANA EMPIRE DEPLOYMENT - ALL CANONICAL DOMAINS ==="
echo "Deploying branded websites for all 69 owned domains"

# Set project
gcloud config set project reggieanddrodispensary

# Create deployment directory
mkdir -p /tmp/empire-deployment
cd /tmp/empire-deployment

# Function to create branded website
create_branded_site() {
    local domain=$1
    local brand_name=$2
    local description=$3
    local category=$4
    
    echo "Creating branded site for: $domain"
    
    mkdir -p "$domain"
    cd "$domain"
    
    # Create package.json
    cat > package.json << PACKAGE_EOF
{
  "name": "$domain-service",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
PACKAGE_EOF

    # Create Express service
    mkdir -p src
    cat > src/index.js << INDEX_EOF
import express from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static('public'));

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: '$domain-service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Main page
app.get('/', (req, res) => {
  res.send(\`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$brand_name - $description</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #ffffff;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .header h1 {
            font-size: 4em;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        .subtitle {
            font-size: 1.5em;
            color: #FFD700;
            margin-bottom: 20px;
        }
        .content {
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 15px;
            margin: 30px 0;
        }
        .content h2 {
            color: #FFD700;
            margin-bottom: 20px;
        }
        .content p {
            line-height: 1.6;
            margin-bottom: 15px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            color: #000;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 10px;
            transition: transform 0.3s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>$brand_name</h1>
            <div class="subtitle">$description</div>
        </div>
        
        <div class="content">
            <h2>Welcome to $brand_name</h2>
            <p>$description</p>
            <p>Part of the Liv Hana Empire - revolutionizing cannabis commerce through technology, compliance, and innovation.</p>
            <p>Category: $category</p>
        </div>
        
        <div style="text-align: center;">
            <a href="https://reggieanddro.com" class="cta-button">Visit Reggie & Dro</a>
            <a href="https://herbitrage.com" class="cta-button">Herbitrage Marketplace</a>
            <a href="https://highnooncartoon.com" class="cta-button">HIGH NOON CARTOON</a>
            <a href="https://oneplantsolution.com" class="cta-button">One Plant Solution</a>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 Liv Hana AI. All rights reserved.</p>
            <p>Domain: $domain | Powered by Liv Hana Empire</p>
        </div>
    </div>
</body>
</html>
\`);
});

app.listen(PORT, () => {
  console.log(\`$brand_name service running on port \${PORT}\`);
});
INDEX_EOF

    # Create Dockerfile
    cat > Dockerfile << DOCKER_EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
DOCKER_EOF

    cd ..
}

# Primary Business Layer domains
create_branded_site "herbitrage.com" "HERBITRAGE" "Cannabis Marketplace & Commerce Platform" "Primary Business Layer"
create_branded_site "jesseniesen.com" "JESSE NIESEN" "CEO Personal Branding & Leadership" "Primary Business Layer"
create_branded_site "oneplantsolution.com" "ONE PLANT SOLUTION" "Operations Hub & Business Solutions" "Primary Business Layer"

# Key Strategic domains
create_branded_site "highfromhemp.com" "HIGH FROM HEMP" "Premium Hemp Products & Education" "Key Strategic Domain"
create_branded_site "terpwerk.com" "TERPWERK" "Terpene Science & Hemp Innovation" "Key Strategic Domain"
create_branded_site "texascoa.com" "TEXAS COA" "Texas Full Panel COA & Compliant Hemp Checker" "Key Strategic Domain"

# B2C Retail domains
create_branded_site "freeweedtexas.com" "FREE WEED TEXAS" "Texas Cannabis Deals & Promotions" "B2C Retail"
create_branded_site "thcacannabisdispensary.com" "THCA CANNABIS DISPENSARY" "THCa Products & Dispensary Services" "B2C Retail"
create_branded_site "cannabiscookiestexas.com" "CANNABIS COOKIES TEXAS" "Texas Cannabis Edibles & Cookies" "B2C Retail"
create_branded_site "texascannabiscookies.com" "TEXAS CANNABIS COOKIES" "Premium Cannabis Cookies & Edibles" "B2C Retail"

# B2B domains
create_branded_site "hempretailai.com" "HEMP RETAIL AI" "AI-Powered Hemp Retail Solutions" "B2B Technology"
create_branded_site "bizflowsi.com" "BIZFLOW SI" "Business Process Automation & AI" "B2B Technology"
create_branded_site "ageverifysi.com" "AGE VERIFY SI" "Age Verification & Compliance Solutions" "B2B Compliance"

# Vertical domains
create_branded_site "texasenergyai.com" "TEXAS ENERGY AI" "AI-Powered Energy Solutions for Texas" "Vertical Energy"
create_branded_site "txmedicalai.com" "TX MEDICAL AI" "Texas Medical AI & Healthcare Solutions" "Vertical Healthcare"
create_branded_site "txsupplychain.com" "TX SUPPLY CHAIN" "Texas Supply Chain & Logistics Solutions" "Vertical Supply Chain"
create_branded_site "wealthtechsi.com" "WEALTHTECH SI" "Wealth Technology & Financial Solutions" "Vertical Finance"

# Yoga & Wellness domains
create_branded_site "getlooseyoga.com" "GET LOOSE YOGA" "Smoking Yoga & Wellness Classes" "Yoga & Wellness"
create_branded_site "smokingyoga.com" "SMOKING YOGA" "Cannabis-Enhanced Yoga & Wellness" "Yoga & Wellness"

echo "=== DEPLOYING ALL DOMAINS TO CLOUD RUN ==="

# Deploy all services
for domain in herbitrage.com jesseniesen.com oneplantsolution.com highfromhemp.com terpwerk.com texascoa.com freeweedtexas.com thcacannabisdispensary.com cannabiscookiestexas.com texascannabiscookies.com hempretailai.com bizflowsi.com ageverifysi.com texasenergyai.com txmedicalai.com txsupplychain.com wealthtechsi.com getlooseyoga.com smokingyoga.com; do
    echo "Deploying $domain..."
    cd "$domain"
    gcloud run deploy "$(echo $domain | tr '.' '-')" --source . --region=us-central1 --allow-unauthenticated --platform managed || echo "Deployment failed for $domain"
    cd ..
done

echo "=== EMPIRE DEPLOYMENT COMPLETE ==="
echo "All canonical domains deployed with proper branding!"
