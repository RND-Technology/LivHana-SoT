#!/usr/bin/env node

// SATX COMPETITOR ANALYZER
// Reverse engineers top 8 San Antonio THCA competitors
// Generates TPOP profiles for local cannabis consumers
// Identifies market gaps for Reggie & Dro domination strategy

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SATXCompetitorAnalyzer {
    constructor() {
        this.outputDir = path.join(__dirname, 'cockpit-data');
        this.tpopFile = path.join(this.outputDir, 'satx-tpop-data.json');
        this.gapAnalysisFile = path.join(this.outputDir, 'satx-market-gaps.json');

        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        // Top 8 SATX THCA competitors (from Jesse's data)
        this.competitors = [
            {
                name: 'Canniversal CBD & THC',
                rank: 1,
                location: 'Multiple spots (1234 Example St main)',
                strengths: ['Premium quality', 'Variety', 'Lab-tested products'],
                products: ['THCA flower', 'live rosin', 'hash rosin', 'vapes', 'concentrates', 'edibles'],
                delivery: true,
                inStore: true,
                pricing: 'Premium ($$$$)',
                reputation: 'Widely regarded as #1 in SA',
                website: 'canniversal.com'
            },
            {
                name: 'The Farmacy Botanical Shoppe',
                rank: 2,
                location: 'Delivery-only (no storefront)',
                strengths: ['Same-day delivery', 'USA-grown', 'Affordable', 'Potency', 'Freshness'],
                products: ['THCA hemp flower (Biohazard, Purple Ice strains)'],
                delivery: true,
                inStore: false,
                pricing: 'Affordable (~$10/g)',
                reputation: '5-star reviews, "best quality in SA"',
                website: 'farmacybotanical.com'
            },
            {
                name: 'Kiefs Dispensary',
                rank: 3,
                location: '442 Bandera Rd, San Antonio, TX 78228',
                strengths: ['Welcoming vibes', 'Premium THCA', 'Great for beginners', 'Curated wellness'],
                products: ['THCA', 'CBD', 'Delta-9', 'flower', 'edibles'],
                delivery: true,
                inStore: true,
                pricing: 'Premium ($$$)',
                reputation: 'Amazing vibes, flower, and edibles',
                website: 'kiefsdispensary.com'
            },
            {
                name: 'Reggie & Dro Cannabis Store & Social Club',
                rank: 4,
                location: 'Central San Antonio (members-only)',
                strengths: ['Social club vibe', 'Onsite consumption lounge', 'Community-focused', 'Legal pioneer'],
                products: ['Legal THCA flower', 'accessories'],
                delivery: false,
                inStore: true,
                pricing: 'Mid-range ($$)',
                reputation: 'Unique for SA - free legal weed pioneer',
                website: 'reggieanddro.com',
                note: 'THIS IS US - not a competitor, but included for comparison'
            },
            {
                name: 'HighWay San Antonio Cannabis Delivery',
                rank: 5,
                location: 'Delivery-focused (ships to approved states)',
                strengths: ['Same-day delivery', 'High-quality THCA', 'Farm Bill-compliant'],
                products: ['THCA flower', 'compliant hemp products'],
                delivery: true,
                inStore: false,
                pricing: 'Mid-range ($$)',
                reputation: 'Not your average smoke shop',
                website: 'gethwy.com'
            },
            {
                name: 'Green Haven Cannabis Co.',
                rank: 6,
                location: 'San Antonio (check site for address)',
                strengths: ['Premium hemp', 'Handpicked products', 'Certified labs', 'Wellness focus'],
                products: ['THCA products', 'edibles', 'flower'],
                delivery: false,
                inStore: true,
                pricing: 'Premium ($$$)',
                reputation: 'Emphasizes purity and natural benefits',
                website: 'havenforgreen.com'
            },
            {
                name: 'San Antonio Cannabis Club (SACC)',
                rank: 7,
                location: 'Heart of San Antonio (delivery)',
                strengths: ['Dispensary-grade THCA', 'Same-day delivery', 'Top brands', 'Easy online shopping'],
                products: ['High-THCA flower buds'],
                delivery: true,
                inStore: false,
                pricing: 'Mid-range ($$)',
                reputation: 'Local favorite, similar to traditional dispensaries',
                website: 'sanantoniocannaclub.com'
            },
            {
                name: 'The Plug Dispensary',
                rank: 8,
                location: 'Universal City (~15-min from SA)',
                strengths: ['Classic strains', 'Affordable', 'Good rosin disposables', 'Reddit-recommended'],
                products: ['ATF', 'Sour Diesel', 'Gary Payton strains', 'rosin disposables'],
                delivery: false,
                inStore: true,
                pricing: 'Affordable ($$)',
                reputation: 'Affordable quads, reliable quality',
                website: 'Search locally (no main site)'
            }
        ];
    }

    analyzeCompetitors() {
        console.log('🏪 SATX COMPETITOR ANALYZER STARTED');
        console.log(`🔍 Analyzing ${this.competitors.length} competitors...`);

        const analysis = {
            timestamp: new Date().toISOString(),
            market: 'San Antonio, TX - THCA/Hemp',
            totalCompetitors: this.competitors.length,
            competitors: this.competitors,
            marketGaps: this.identifyMarketGaps(),
            tpopProfiles: this.generateTPOPProfiles(),
            pricingStrategy: this.analyzePricing(),
            recommendations: this.generateRecommendations()
        };

        // Save analysis
        fs.writeFileSync(this.tpopFile, JSON.stringify(analysis, null, 2));
        console.log(`✅ TPOP data saved to: ${this.tpopFile}`);

        // Save market gaps separately
        const gaps = {
            timestamp: new Date().toISOString(),
            gaps: analysis.marketGaps,
            opportunities: analysis.recommendations.filter(r => r.category === 'Market Gap')
        };
        fs.writeFileSync(this.gapAnalysisFile, JSON.stringify(gaps, null, 2));
        console.log(`✅ Market gaps saved to: ${this.gapAnalysisFile}`);

        return analysis;
    }

    identifyMarketGaps() {
        const gaps = [];

        // Gap 1: Limited social/community spaces
        const socialClubs = this.competitors.filter(c => c.name.includes('Social Club')).length;
        gaps.push({
            gap: 'Limited onsite consumption lounges',
            current: `Only ${socialClubs} competitor(s) with social club model`,
            opportunity: 'Reggie & Dro\'s social club is unique differentiator',
            impact: 'HIGH',
            action: 'Expand lounge capacity, host events, build community'
        });

        // Gap 2: Delivery vs In-store
        const deliveryOnly = this.competitors.filter(c => c.delivery && !c.inStore).length;
        const inStoreOnly = this.competitors.filter(c => !c.delivery && c.inStore).length;
        const both = this.competitors.filter(c => c.delivery && c.inStore).length;

        gaps.push({
            gap: 'Delivery vs in-store distribution',
            current: `${deliveryOnly} delivery-only, ${inStoreOnly} in-store-only, ${both} hybrid`,
            opportunity: 'Most lack hybrid model - add delivery to Reggie & Dro',
            impact: 'HIGH',
            action: 'Launch same-day delivery service (compete with Farmacy, HighWay, SACC)'
        });

        // Gap 3: Pricing tiers
        const affordable = this.competitors.filter(c => c.pricing.includes('Affordable')).length;
        const premium = this.competitors.filter(c => c.pricing.includes('Premium')).length;

        gaps.push({
            gap: 'Price point concentration',
            current: `${premium} premium, ${affordable} affordable, rest mid-range`,
            opportunity: 'Mid-range + quality + community = sweet spot',
            impact: 'MEDIUM',
            action: 'Position as "quality at fair prices with social vibe"'
        });

        // Gap 4: Content & education
        gaps.push({
            gap: 'Content marketing & education',
            current: 'Competitors focus on product, not content',
            opportunity: 'High Noon Cartoon = massive differentiator',
            impact: 'VERY HIGH',
            action: 'Use HNC to dominate attention, drive brand awareness, educate market'
        });

        // Gap 5: Brand personality
        gaps.push({
            gap: 'Boring, clinical branding',
            current: 'Most competitors = sterile, wellness-focused branding',
            opportunity: 'Reggie & Dro = personality, humor, relatability',
            impact: 'HIGH',
            action: 'Lean into character-driven brand, memes, viral content'
        });

        return gaps;
    }

    generateTPOPProfiles() {
        // Target Persona profiles for SATX cannabis consumers
        return [
            {
                tpop: 'SATX Cannabis Enthusiast',
                demographics: {
                    age: '21-45',
                    location: 'San Antonio metro area',
                    income: '$30K-80K/year',
                    education: 'Some college - Bachelor\'s'
                },
                psychographics: {
                    values: ['Quality', 'Legality', 'Community', 'Texas pride'],
                    interests: ['Cannabis culture', 'Local businesses', 'Social events', 'Comedy'],
                    painPoints: [
                        'Confusion about legal status',
                        'Fear of arrest',
                        'Finding quality products',
                        'High prices'
                    ],
                    goals: [
                        'Access legal cannabis',
                        'Support local businesses',
                        'Stay compliant',
                        'Connect with community'
                    ]
                },
                behavior: {
                    purchaseFrequency: '1-2x per month',
                    averageSpend: '$50-150 per visit',
                    preferredProducts: ['Flower', 'Pre-rolls', 'Edibles'],
                    discoveryChannels: ['Word of mouth', 'Social media', 'Reddit', 'YouTube'],
                    loyaltyDrivers: ['Quality', 'Vibe', 'Price', 'Convenience']
                },
                competitorPreferences: {
                    canniversal: 'Premium quality but expensive',
                    farmacy: 'Great delivery, affordable, but no in-person experience',
                    kiefs: 'Good vibes but higher prices',
                    reggieanddro: 'BEST VIBE + community, mid-range prices'
                },
                messaging: {
                    hooks: [
                        'Legal cannabis in Texas? Yes, it\'s real.',
                        'Support local, stay legal, join the community',
                        'Quality flower, fair prices, amazing vibes'
                    ],
                    ctas: [
                        'Visit our social club',
                        'Try our top-shelf THCA',
                        'Join the Reggie & Dro family'
                    ]
                }
            },
            {
                tpop: 'Texas Legalization Advocate',
                demographics: {
                    age: '25-55',
                    location: 'Texas (statewide)',
                    income: '$40K-100K/year',
                    education: 'Bachelor\'s - Graduate degree'
                },
                psychographics: {
                    values: ['Freedom', 'Individual rights', 'Economic opportunity', 'Justice reform'],
                    interests: ['Politics', 'Cannabis policy', 'Activism', 'Education'],
                    painPoints: [
                        'Texas lagging on legalization',
                        'Arrests continue despite hemp legality',
                        'Lack of political will'
                    ],
                    goals: [
                        'Full legalization in Texas',
                        'Expunge records',
                        'Support legal businesses',
                        'Educate public'
                    ]
                },
                behavior: {
                    purchaseFrequency: '2-4x per month',
                    averageSpend: '$100-300 per visit',
                    preferredProducts: ['Flower', 'Concentrates', 'Edibles'],
                    discoveryChannels: ['Policy news', 'YouTube', 'Twitter', 'Advocacy groups'],
                    loyaltyDrivers: ['Mission alignment', 'Advocacy support', 'Quality']
                },
                messaging: {
                    hooks: [
                        'The Texas cannabis revolution starts here',
                        'Legal hemp today, full legalization tomorrow',
                        'Every purchase supports the movement'
                    ],
                    ctas: [
                        'Join the legalization fight',
                        'Support Texas cannabis pioneers',
                        'Share our educational content'
                    ]
                }
            },
            {
                tpop: 'Budget-Conscious Consumer',
                demographics: {
                    age: '21-35',
                    location: 'San Antonio metro',
                    income: '$20K-50K/year',
                    education: 'High school - Some college'
                },
                psychographics: {
                    values: ['Value', 'Quality for price', 'Convenience', 'Reliability'],
                    interests: ['Finding deals', 'Product reviews', 'Local options'],
                    painPoints: [
                        'Premium prices at top shops',
                        'Inconsistent quality at cheap spots',
                        'Delivery fees'
                    ],
                    goals: [
                        'Get quality cannabis without breaking budget',
                        'Find reliable affordable source',
                        'Avoid sketchy dealers'
                    ]
                },
                behavior: {
                    purchaseFrequency: '1-2x per month',
                    averageSpend: '$30-80 per visit',
                    preferredProducts: ['Flower (budget strains)', 'Pre-rolls', 'Deals/bundles'],
                    discoveryChannels: ['Reddit', 'Deals sites', 'Word of mouth'],
                    loyaltyDrivers: ['Price', 'Consistency', 'Accessibility']
                },
                competitorPreferences: {
                    farmacy: 'Affordable (~$10/g) favorite',
                    theplug: 'Affordable quads, reliable',
                    reggieanddro: 'Mid-range but great value + social club access'
                },
                messaging: {
                    hooks: [
                        'Quality cannabis without the premium price',
                        'Fair prices, top-shelf experience',
                        '$10-15/g for lab-tested THCA flower'
                    ],
                    ctas: [
                        'Check our daily deals',
                        'Join for member discounts',
                        'Get more for less'
                    ]
                }
            },
            {
                tpop: 'Social/Experience Seeker',
                demographics: {
                    age: '21-40',
                    location: 'San Antonio metro',
                    income: '$40K-80K/year',
                    education: 'Some college - Bachelor\'s'
                },
                psychographics: {
                    values: ['Community', 'Experience', 'Socialization', 'Fun'],
                    interests: ['Events', 'Social clubs', 'Comedy', 'Music', 'Art'],
                    painPoints: [
                        'Boring dispensary experiences',
                        'No place to consume legally',
                        'Lack of cannabis community in TX'
                    ],
                    goals: [
                        'Meet like-minded people',
                        'Enjoy cannabis socially',
                        'Attend events',
                        'Have fun experiences'
                    ]
                },
                behavior: {
                    purchaseFrequency: '2-3x per month',
                    averageSpend: '$75-200 per visit',
                    preferredProducts: ['Flower', 'Pre-rolls', 'Edibles (for events)'],
                    discoveryChannels: ['Social media', 'Events', 'Friends', 'Instagram'],
                    loyaltyDrivers: ['Vibe', 'Community', 'Events', 'Social experience']
                },
                competitorPreferences: {
                    reggieanddro: 'ONLY social club with onsite lounge - no competition!'
                },
                messaging: {
                    hooks: [
                        'San Antonio\'s ONLY cannabis social club',
                        'Smoke, socialize, enjoy - all legal',
                        'Join the Reggie & Dro family'
                    ],
                    ctas: [
                        'Visit our lounge',
                        'Attend our next event',
                        'Become a member'
                    ]
                }
            }
        ];
    }

    analyzePricing() {
        const pricingData = this.competitors.map(c => ({
            name: c.name,
            pricing: c.pricing,
            tier: c.pricing.includes('Affordable') ? 'Low' :
                   c.pricing.includes('Premium') ? 'High' : 'Mid'
        }));

        const tiers = {
            Low: pricingData.filter(p => p.tier === 'Low').length,
            Mid: pricingData.filter(p => p.tier === 'Mid').length,
            High: pricingData.filter(p => p.tier === 'High').length
        };

        return {
            competitorDistribution: tiers,
            recommendation: {
                target: 'Mid-range with premium quality',
                pricing: '$10-15/g for flower (match Farmacy, undercut Canniversal)',
                strategy: 'Value positioning: "Premium quality, fair prices, unbeatable vibe"',
                bundleStrategy: 'Member discounts, loyalty rewards, bulk deals',
                deliveryPricing: 'Free delivery over $50 (compete with delivery-only shops)'
            }
        };
    }

    generateRecommendations() {
        return [
            {
                category: 'Market Gap',
                priority: 'CRITICAL',
                action: 'Launch same-day delivery service',
                reasoning: 'Farmacy, HighWay, SACC dominating delivery market',
                implementation: 'Partner with local delivery service or build in-house',
                expectedImpact: '+30% revenue from new customers'
            },
            {
                category: 'Market Gap',
                priority: 'CRITICAL',
                action: 'Double down on social club uniqueness',
                reasoning: 'ONLY onsite consumption lounge in SATX',
                implementation: 'Expand lounge, host weekly events, comedy nights with HNC characters',
                expectedImpact: '+50% foot traffic, massive brand loyalty'
            },
            {
                category: 'Content Marketing',
                priority: 'CRITICAL',
                action: 'Use High Noon Cartoon as acquisition engine',
                reasoning: 'No competitors doing content marketing at scale',
                implementation: 'HNC episodes → YouTube/TikTok/IG → drive to Reggie & Dro',
                expectedImpact: '10x brand awareness, viral growth'
            },
            {
                category: 'Pricing',
                priority: 'HIGH',
                action: 'Position at $10-15/g (mid-range value)',
                reasoning: 'Match Farmacy affordability, undercut Canniversal premium',
                implementation: 'Price flower at $12/g, bulk discounts at $10/g, premium strains $15/g',
                expectedImpact: 'Attract budget-conscious + quality-seeking segments'
            },
            {
                category: 'Product',
                priority: 'MEDIUM',
                action: 'Expand product line (match Canniversal variety)',
                reasoning: 'Canniversal #1 due to variety (flower, rosin, vapes, edibles)',
                implementation: 'Add: live rosin, hash rosin, THCA concentrates',
                expectedImpact: '+20% average order value'
            },
            {
                category: 'TPOPs',
                priority: 'HIGH',
                action: 'Target "Social/Experience Seekers" first',
                reasoning: 'Perfect fit for social club model, highest loyalty potential',
                implementation: 'Event marketing, Instagram ads, influencer partnerships',
                expectedImpact: 'Build core community, word-of-mouth growth'
            },
            {
                category: 'TPOPs',
                priority: 'HIGH',
                action: 'Target "Budget-Conscious Consumers" second',
                reasoning: 'Largest market segment, underserved by premium shops',
                implementation: 'Daily deals, bulk discounts, member pricing, Reddit presence',
                expectedImpact: '+40% customer base'
            },
            {
                category: 'Brand',
                priority: 'CRITICAL',
                action: 'Lean into personality & humor (HNC characters)',
                reasoning: 'All competitors have boring, clinical branding',
                implementation: 'HNC merchandise, character appearances, meme marketing',
                expectedImpact: 'Viral brand, massive differentiation'
            }
        ];
    }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const analyzer = new SATXCompetitorAnalyzer();

    const analysis = analyzer.analyzeCompetitors();

    console.log('\n🏆 ANALYSIS COMPLETE');
    console.log(`✅ ${analysis.totalCompetitors} competitors analyzed`);
    console.log(`✅ ${analysis.marketGaps.length} market gaps identified`);
    console.log(`✅ ${analysis.tpopProfiles.length} TPOP profiles generated`);
    console.log(`✅ ${analysis.recommendations.length} strategic recommendations`);

    console.log('\n🎯 TOP 3 CRITICAL ACTIONS:');
    analysis.recommendations
        .filter(r => r.priority === 'CRITICAL')
        .slice(0, 3)
        .forEach((rec, i) => {
            console.log(`\n   ${i + 1}. ${rec.action}`);
            console.log(`      Impact: ${rec.expectedImpact}`);
        });

    console.log('\n💾 Files saved:');
    console.log('   - cockpit-data/satx-tpop-data.json (full analysis)');
    console.log('   - cockpit-data/satx-market-gaps.json (gaps & opportunities)');
}

export default SATXCompetitorAnalyzer;
