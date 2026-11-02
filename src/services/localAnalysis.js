import { adaptScanResponse } from './api';

// Offline preview only. These weights are not the server's full detection rules.
const rules = [
  ['urgency', 'Pressure to act quickly', /urgent|immediately|within \d+|act now|last chance|suspend|blocked|expire/i, 20, 'The message pressures you to act before you can verify it.'],
  ['credentials', 'Request for sensitive details', /share.{0,25}(otp|password|pin)|enter.{0,25}(otp|password|pin)|verify.{0,25}(account|kyc)|update.{0,15}kyc/i, 30, 'Requests for credentials or account verification need independent confirmation.'],
  ['reward', 'Unexpected reward or payment', /won|winner|lottery|claim.{0,20}(prize|reward)|refund|processing fee|pay.{0,15}fee/i, 25, 'Unexpected rewards and fees are common scam signals.'],
  ['link', 'Link needs verification', /https?:\/\/|www\.|bit\.ly\//i, 15, 'A link is present. This offline preview cannot verify its destination.'],
];
export function localAnalysis(message) {
  const findings = rules.filter(([, , pattern]) => pattern.test(message)).map(([rule_id, label, , points, why]) => ({ rule_id, label, points, why, severity: points >= 25 ? 'high' : 'medium', advice: 'Contact the sender through a channel you already trust.' }));
  const score = Math.min(100, findings.reduce((sum, finding) => sum + finding.points, 0));
  return { ...adaptScanResponse({ id: `local-${Date.now()}`, message, score, level: score >= 60 ? 'high_risk' : score >= 30 ? 'suspicious' : 'safe', findings, summary: findings.length ? 'These text patterns deserve a closer look. Verify the sender independently.' : 'No listed text patterns matched. That does not verify the sender or prove this message is safe.', next_steps: ['Verify the sender using their official app, website, or a number you already know.', 'Keep passwords, OTPs and payment PINs private.'], engine: { ai_used: false } }), local: true };
}
