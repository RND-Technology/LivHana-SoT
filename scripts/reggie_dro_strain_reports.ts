#!/usr/bin/env ts-node
/**
 * Reggie & Dro Strain Reports Generator
 *
 * Creates 4 comprehensive reports:
 * 1. In-stock strains catalog, listing and ranking
 * 2. Comprehensive review data analysis (look, smell, taste, effect, ratings)
 * 3. Review keyword and phrase extraction
 * 4. Overall aggregated strain performance and insights
 *
 * Data sources:
 * - LightSpeed inventory (reggieandro.com)
 * - Google Reviews
 * - Leafly Reviews
 * - YouTube comments (Reggie & Dro channel)
 */

import * as fs from 'fs';
import * as path from 'path';

// Mock data for now - will integrate with real APIs
interface StrainData {
  name: string;
  quantityOnHand: number;
  price: number;
  sku: string;
  category: string;
  reviews: {
    look: number; // 1-5 stars
    smell: number; // 1-5 stars
    taste: number; // 1-5 stars
    effect: number; // 1-5 stars (double weighted)
    source: 'google' | 'leafly' | 'youtube';
    text: string;
    keywords: string[];
  }[];
}

// Sample strain data (placeholder - will pull from LightSpeed + reviews)
const sampleStrains: StrainData[] = [
  {
    name: 'Lemon Cherry Gelato',
    quantityOnHand: 150,
    price: 45.0,
    sku: 'LCG-001',
    category: 'Hybrid',
    reviews: [
      {
        look: 5,
        smell: 5,
        taste: 4,
        effect: 5,
        source: 'leafly',
        text: 'Beautiful dense buds with vibrant colors. Citrus and cherry aroma. Smooth smoke, relaxing high.',
        keywords: ['dense', 'vibrant', 'citrus', 'cherry', 'smooth', 'relaxing'],
      },
      {
        look: 4,
        smell: 5,
        taste: 5,
        effect: 5,
        source: 'google',
        text: 'Amazing taste and effects. Perfect for evening relaxation.',
        keywords: ['amazing', 'evening', 'relaxation'],
      },
    ],
  },
  {
    name: 'GMO Cookies',
    quantityOnHand: 120,
    price: 50.0,
    sku: 'GMO-001',
    category: 'Indica',
    reviews: [
      {
        look: 5,
        smell: 5,
        taste: 5,
        effect: 5,
        source: 'leafly',
        text: 'Pungent garlic and diesel smell. Dense frosty buds. Powerful body high.',
        keywords: ['pungent', 'garlic', 'diesel', 'dense', 'frosty', 'powerful', 'body high'],
      },
    ],
  },
  {
    name: 'Modified Grapes',
    quantityOnHand: 100,
    price: 48.0,
    sku: 'MG-001',
    category: 'Indica',
    reviews: [
      {
        look: 5,
        smell: 4,
        taste: 5,
        effect: 4,
        source: 'youtube',
        text: 'Grape flavor is on point. Great for sleep.',
        keywords: ['grape', 'flavor', 'sleep'],
      },
    ],
  },
];

/**
 * Calculate weighted overall rating
 * Effect is double-weighted per user request
 */
function calculateWeightedRating(reviews: StrainData['reviews']): number {
  if (reviews.length === 0) return 0;

  let totalScore = 0;
  let totalWeight = 0;

  reviews.forEach((review) => {
    // Normal weights: look=1, smell=1, taste=1
    // Double weight: effect=2
    const score =
      review.look * 1 +
      review.smell * 1 +
      review.taste * 1 +
      review.effect * 2; // Double weighted

    const weight = 1 + 1 + 1 + 2; // Total weight = 5

    totalScore += score;
    totalWeight += weight;
  });

  return totalScore / totalWeight;
}

/**
 * Extract all unique keywords from reviews
 */
function extractKeywords(reviews: StrainData['reviews']): { keyword: string; count: number }[] {
  const keywordMap = new Map<string, number>();

  reviews.forEach((review) => {
    review.keywords.forEach((keyword) => {
      keywordMap.set(keyword, (keywordMap.get(keyword) || 0) + 1);
    });
  });

  return Array.from(keywordMap.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * REPORT 1: In-stock strains catalog, listing and ranking
 */
function generateReport1(strains: StrainData[]): string {
  const rankedStrains = strains
    .map((strain) => ({
      name: strain.name,
      sku: strain.sku,
      category: strain.category,
      quantity: strain.quantityOnHand,
      price: strain.price,
      rating: calculateWeightedRating(strain.reviews),
      reviewCount: strain.reviews.length,
    }))
    .sort((a, b) => b.rating - a.rating);

  let report = '# REPORT 1: IN-STOCK STRAINS CATALOG, LISTING AND RANKING\n\n';
  report += `Generated: ${new Date().toLocaleString()}\n`;
  report += `Total Strains: ${strains.length}\n\n`;
  report += '## Top Ranked Strains\n\n';
  report += '| Rank | Strain Name | Category | Qty | Price | Rating | Reviews |\n';
  report += '|------|-------------|----------|-----|-------|--------|----------|\n';

  rankedStrains.forEach((strain, index) => {
    report += `| ${index + 1} | ${strain.name} | ${strain.category} | ${strain.quantity} | $${strain.price} | ${strain.rating.toFixed(2)}/5.00 | ${strain.reviewCount} |\n`;
  });

  return report;
}

/**
 * REPORT 2: Comprehensive review data analysis
 */
function generateReport2(strains: StrainData[]): string {
  let report = '# REPORT 2: COMPREHENSIVE REVIEW DATA ANALYSIS\n\n';
  report += `Generated: ${new Date().toLocaleString()}\n\n`;

  strains.forEach((strain) => {
    report += `## ${strain.name} (${strain.category})\n\n`;

    const avgLook =
      strain.reviews.reduce((sum, r) => sum + r.look, 0) / strain.reviews.length || 0;
    const avgSmell =
      strain.reviews.reduce((sum, r) => sum + r.smell, 0) / strain.reviews.length || 0;
    const avgTaste =
      strain.reviews.reduce((sum, r) => sum + r.taste, 0) / strain.reviews.length || 0;
    const avgEffect =
      strain.reviews.reduce((sum, r) => sum + r.effect, 0) / strain.reviews.length || 0;

    report += '### Rating Breakdown\n\n';
    report += `- **Look**: ${avgLook.toFixed(2)}/5.00 ⭐\n`;
    report += `- **Smell**: ${avgSmell.toFixed(2)}/5.00 ⭐\n`;
    report += `- **Taste**: ${avgTaste.toFixed(2)}/5.00 ⭐\n`;
    report += `- **Effect**: ${avgEffect.toFixed(2)}/5.00 ⭐ (double weighted)\n`;
    report += `- **Overall**: ${calculateWeightedRating(strain.reviews).toFixed(2)}/5.00 ⭐\n\n`;

    report += '### Reviews by Source\n\n';
    const sources = { google: 0, leafly: 0, youtube: 0 };
    strain.reviews.forEach((r) => sources[r.source]++);
    report += `- Google: ${sources.google} reviews\n`;
    report += `- Leafly: ${sources.leafly} reviews\n`;
    report += `- YouTube: ${sources.youtube} reviews\n\n`;

    report += '---\n\n';
  });

  return report;
}

/**
 * REPORT 3: Review keyword and phrase extraction
 */
function generateReport3(strains: StrainData[]): string {
  let report = '# REPORT 3: REVIEW KEYWORD AND PHRASE EXTRACTION\n\n';
  report += `Generated: ${new Date().toLocaleString()}\n\n`;

  strains.forEach((strain) => {
    const keywords = extractKeywords(strain.reviews);

    report += `## ${strain.name}\n\n`;
    report += '### Top Keywords\n\n';

    if (keywords.length === 0) {
      report += '_No keywords available_\n\n';
    } else {
      keywords.slice(0, 10).forEach((kw) => {
        report += `- **${kw.keyword}** (${kw.count}x)\n`;
      });
      report += '\n';
    }

    report += '---\n\n';
  });

  return report;
}

/**
 * REPORT 4: Overall aggregated strain performance and insights
 */
function generateReport4(strains: StrainData[]): string {
  let report = '# REPORT 4: OVERALL AGGREGATED STRAIN PERFORMANCE AND INSIGHTS\n\n';
  report += `Generated: ${new Date().toLocaleString()}\n\n`;

  const totalStrains = strains.length;
  const totalReviews = strains.reduce((sum, s) => sum + s.reviews.length, 0);
  const avgRating =
    strains.reduce((sum, s) => sum + calculateWeightedRating(s.reviews), 0) / totalStrains || 0;

  report += '## Executive Summary\n\n';
  report += `- **Total In-Stock Strains**: ${totalStrains}\n`;
  report += `- **Total Reviews Analyzed**: ${totalReviews}\n`;
  report += `- **Average Rating**: ${avgRating.toFixed(2)}/5.00 ⭐\n\n`;

  report += '## Category Breakdown\n\n';
  const categoryMap = new Map<string, StrainData[]>();
  strains.forEach((strain) => {
    const existing = categoryMap.get(strain.category) || [];
    existing.push(strain);
    categoryMap.set(strain.category, existing);
  });

  categoryMap.forEach((categoryStrains, category) => {
    const avgCategoryRating =
      categoryStrains.reduce((sum, s) => sum + calculateWeightedRating(s.reviews), 0) /
        categoryStrains.length || 0;

    report += `### ${category}\n\n`;
    report += `- Strains: ${categoryStrains.length}\n`;
    report += `- Avg Rating: ${avgCategoryRating.toFixed(2)}/5.00 ⭐\n`;
    report += `- Top Strain: ${categoryStrains.sort((a, b) => calculateWeightedRating(b.reviews) - calculateWeightedRating(a.reviews))[0].name}\n\n`;
  });

  report += '## Top Performing Strains (Overall)\n\n';
  const topStrains = strains
    .map((s) => ({ name: s.name, rating: calculateWeightedRating(s.reviews) }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  topStrains.forEach((strain, index) => {
    report += `${index + 1}. **${strain.name}** - ${strain.rating.toFixed(2)}/5.00 ⭐\n`;
  });

  report += '\n## Key Insights\n\n';
  report += '- **Most Common Keywords**: ';
  const allKeywords = extractKeywords(strains.flatMap((s) => s.reviews));
  report += allKeywords
    .slice(0, 10)
    .map((kw) => kw.keyword)
    .join(', ');
  report += '\n';
  report += `- **Customer Satisfaction**: ${((avgRating / 5) * 100).toFixed(0)}%\n`;
  report += '- **Recommendation**: Focus marketing on top 5 strains with highest ratings\n\n';

  return report;
}

/**
 * Main execution
 */
function main() {
  console.log('🎯 Generating Reggie & Dro Strain Reports...\n');

  const outputDir = path.join(__dirname, '../docs/reggie_dro_reports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate all 4 reports
  const report1 = generateReport1(sampleStrains);
  const report2 = generateReport2(sampleStrains);
  const report3 = generateReport3(sampleStrains);
  const report4 = generateReport4(sampleStrains);

  // Write to files
  fs.writeFileSync(path.join(outputDir, 'REPORT_1_CATALOG.md'), report1);
  fs.writeFileSync(path.join(outputDir, 'REPORT_2_REVIEW_ANALYSIS.md'), report2);
  fs.writeFileSync(path.join(outputDir, 'REPORT_3_KEYWORDS.md'), report3);
  fs.writeFileSync(path.join(outputDir, 'REPORT_4_INSIGHTS.md'), report4);

  console.log('✅ Report 1: In-stock strains catalog, listing and ranking');
  console.log('✅ Report 2: Comprehensive review data analysis');
  console.log('✅ Report 3: Review keyword and phrase extraction');
  console.log('✅ Report 4: Overall aggregated strain performance and insights');
  console.log(`\n📁 Reports saved to: ${outputDir}`);
}

main();
