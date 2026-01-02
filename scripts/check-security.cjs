#!/usr/bin/env node
/**
 * Simple security gate: reads security-report.json produced by `npm audit --json`.
 * Fails (exit 1) if any high or critical vulnerabilities are present.
 * Prints counts for visibility and exits 0 if acceptable.
 */
const fs = require('fs');
const path = require('path');
const reportPath = path.resolve(process.cwd(), 'security-report.json');
if (!fs.existsSync(reportPath)) {
  console.error('security-report.json not found. Did the audit step run?');
  process.exit(2);
}
let json;
try {
  json = JSON.parse(fs.readFileSync(reportPath, 'utf8') || '{}');
} catch (e) {
  console.error('Failed to parse security-report.json:', e.message || e);
  process.exit(3);
}
const meta = json.metadata || {};
const vuln = meta.vulnerabilities || {};
const sevOrder = ['critical','high','moderate','low','info'];
const summary = sevOrder.map(s => `${s}:${vuln[s]||0}`).join(', ');
console.log('Vulnerability counts => ' + summary);
if ((vuln.critical||0) > 0 || (vuln.high||0) > 0) {
  console.error('High/critical vulnerabilities found: failing build');
  process.exit(1);
}
console.log('No high/critical vulnerabilities');
process.exit(0);
