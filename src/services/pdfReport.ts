import { jsPDF } from 'jspdf';
import type { WebsiteAnalysis } from '../types/analysis';

export function generatePDFReport(analysis: WebsiteAnalysis): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const colors = {
    primary: [139, 92, 246] as [number, number, number], // violet
    secondary: [16, 185, 129] as [number, number, number], // emerald
    dark: [17, 24, 39] as [number, number, number],
    gray: [107, 114, 128] as [number, number, number],
    light: [243, 244, 246] as [number, number, number],
  };

  // Helper functions
  const addText = (text: string, x: number, yPos: number, options: { size?: number; color?: [number, number, number]; bold?: boolean; align?: 'left' | 'center' | 'right' } = {}) => {
    const { size = 12, color = colors.dark, bold = false, align = 'left' } = options;
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');

    let xPos = x;
    if (align === 'center') xPos = pageWidth / 2;
    else if (align === 'right') xPos = pageWidth - x;

    doc.text(text, xPos, yPos, { align });
    return yPos + (size * 0.5);
  };

  const addLine = (yPos: number, color: [number, number, number] = colors.light) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    return yPos + 5;
  };

  const formatCurrency = (num: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(num);

  const formatNumber = (num: number) => num.toLocaleString();

  // === HEADER ===
  doc.setFillColor(139, 92, 246);
  doc.rect(0, 0, pageWidth, 45, 'F');

  addText("What's It Worth?", 20, 20, { size: 24, color: [255, 255, 255], bold: true });
  addText('Website Valuation Report', 20, 32, { size: 12, color: [200, 200, 255] });
  addText(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 0, 32, { size: 10, color: [200, 200, 255], align: 'right' });

  y = 60;

  // === DOMAIN INFO ===
  addText('Analysis for:', 20, y, { size: 10, color: colors.gray });
  y = addText(analysis.domain.domain, 20, y + 8, { size: 18, bold: true });
  y += 10;

  // === MAIN VALUE ===
  doc.setFillColor(245, 243, 255);
  doc.roundedRect(20, y, pageWidth - 40, 50, 3, 3, 'F');

  addText('Estimated Website Value', 0, y + 15, { size: 12, color: colors.gray, align: 'center' });
  addText(formatCurrency(analysis.estimatedValue), 0, y + 35, { size: 28, color: colors.primary, bold: true, align: 'center' });
  addText(`Range: ${formatCurrency(analysis.valueRange.min)} - ${formatCurrency(analysis.valueRange.max)}`, 0, y + 45, { size: 9, color: colors.gray, align: 'center' });

  y += 60;

  // === CONFIDENCE & DATA SOURCES ===
  addText(`Confidence Score: ${analysis.confidenceScore}%`, 20, y, { size: 11, bold: true });
  y += 8;
  addText(`Data Sources: ${analysis.dataSourcesUsed.join(', ')}`, 20, y, { size: 9, color: colors.gray });
  y += 15;

  y = addLine(y);

  // === VALUATION BREAKDOWN ===
  addText('Valuation Breakdown', 20, y, { size: 14, bold: true });
  y += 12;

  const breakdown = [
    { label: 'Domain Value', value: analysis.valuationBreakdown.domainIntrinsicValue },
    { label: 'Traffic Value', value: analysis.valuationBreakdown.trafficValue },
    { label: 'Content Value', value: analysis.valuationBreakdown.contentValue },
    { label: 'Technical Value', value: analysis.valuationBreakdown.technicalValue },
    { label: 'Brand Value', value: analysis.valuationBreakdown.brandValue },
    { label: 'Revenue Multiple', value: analysis.valuationBreakdown.revenueMultiple },
  ];

  breakdown.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 20 + (col * 60);
    const yPos = y + (row * 20);

    addText(item.label, x, yPos, { size: 9, color: colors.gray });
    addText(formatCurrency(item.value), x, yPos + 7, { size: 11, bold: true });
  });

  y += 50;
  y = addLine(y);

  // === SCORES SECTION ===
  addText('Performance Scores', 20, y, { size: 14, bold: true });
  y += 12;

  const scores = [
    { label: 'Domain', score: analysis.scores.domain },
    { label: 'SEO', score: analysis.scores.seo },
    { label: 'Content', score: analysis.scores.content },
    { label: 'Technical', score: analysis.scores.technical },
    { label: 'Performance', score: analysis.scores.performance },
    { label: 'Security', score: analysis.scores.security },
    { label: 'Social', score: analysis.scores.social },
    { label: 'Monetization', score: analysis.scores.monetization },
  ];

  scores.forEach((item, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 20 + (col * 45);
    const yPos = y + (row * 18);

    const scoreColor: [number, number, number] = item.score >= 70 ? [16, 185, 129] : item.score >= 40 ? [245, 158, 11] : [239, 68, 68];

    addText(item.label, x, yPos, { size: 8, color: colors.gray });
    addText(`${item.score}/100`, x, yPos + 6, { size: 10, bold: true, color: scoreColor });
  });

  y += 45;
  y = addLine(y);

  // === TRAFFIC SECTION ===
  addText('Traffic Estimation', 20, y, { size: 14, bold: true });
  y += 12;

  addText('Monthly Visitors:', 20, y, { size: 10, color: colors.gray });
  addText(formatNumber(analysis.traffic.estimatedMonthlyVisitors), 70, y, { size: 10, bold: true });
  y += 8;

  addText('Traffic Tier:', 20, y, { size: 10, color: colors.gray });
  addText(analysis.traffic.trafficTier.replace('-', ' ').toUpperCase(), 55, y, { size: 10, bold: true });
  y += 8;

  addText('Est. Pageviews:', 20, y, { size: 10, color: colors.gray });
  addText(formatNumber(analysis.traffic.estimatedPageviews), 70, y, { size: 10, bold: true });
  y += 15;

  // === KEY FINDINGS ===
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  y = addLine(y);
  addText('Key Findings', 20, y, { size: 14, bold: true });
  y += 12;

  // Domain
  addText(`Domain Age: ${analysis.domain.ageYears > 0 ? `${analysis.domain.ageYears} years` : 'Unknown'}`, 20, y, { size: 10 });
  y += 7;
  addText(`TLD: .${analysis.domain.tld} (Score: ${analysis.domain.tldScore}/100)`, 20, y, { size: 10 });
  y += 7;
  addText(`Archive Snapshots: ${analysis.domain.archiveSnapshots}`, 20, y, { size: 10 });
  y += 12;

  // Technical
  addText(`HTTPS: ${analysis.technical.hasHttps ? 'Yes' : 'No'}`, 20, y, { size: 10 });
  addText(`Security Grade: ${analysis.security.securityGrade}`, 100, y, { size: 10 });
  y += 12;

  // === RECOMMENDATIONS ===
  if (analysis.recommendations.length > 0) {
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    y = addLine(y);
    addText('Recommendations to Increase Value', 20, y, { size: 14, bold: true });
    y += 12;

    analysis.recommendations.slice(0, 5).forEach((rec) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      const impactColor: [number, number, number] =
        rec.impact === 'critical' ? [239, 68, 68] :
        rec.impact === 'high' ? [245, 158, 11] :
        [16, 185, 129];

      doc.setFillColor(...impactColor);
      doc.circle(23, y - 1.5, 2, 'F');

      addText(rec.title, 28, y, { size: 10, bold: true });
      y += 6;
      addText(rec.description, 28, y, { size: 9, color: colors.gray });
      y += 6;
      addText(`Potential Value Increase: ${formatCurrency(rec.potentialValueIncrease)}`, 28, y, { size: 9, color: colors.secondary });
      y += 10;
    });
  }

  // === FOOTER ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...colors.gray);
    doc.text(
      `Generated by What's It Worth? | whatsitworth.netlify.app | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Download the PDF
  doc.save(`website-valuation-${analysis.domain.domain.replace(/\./g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
}
