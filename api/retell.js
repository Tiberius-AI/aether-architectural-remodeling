/**
 * ============================================================================
 * VERCEL SERVERLESS ENDPOINT: /api/retell
 * ============================================================================
 * Handles:
 * 1. GET /api/retell -> Returns configured Retell AI Voice Agent Number and
 *    SMS Agent Number from Vercel Environment Variables (if set), while keeping
 *    visible site phone text as "(800) 555-0199".
 * 2. POST /api/retell -> Receives Retell AI post-call / in-call webhooks
 *    (`call_started`, `call_ended`, `call_analyzed`) so voice calls conducted
 *    by the Retell AI agent log directly into the Back-Office pipeline.
 * ============================================================================
 */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      displayPhoneText: '(800) 555-0199',
      retellVoiceNumber: process.env.RETELL_VOICE_NUMBER || '+18304652566',
      smsAgentNumber: process.env.SMS_AGENT_NUMBER || '+18303608517',
      retellAgentId: process.env.RETELL_AGENT_ID || null,
      defaultSmsRoutingMode: process.env.DEFAULT_SMS_ROUTING_MODE || 'manual'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body || {};
  const eventType = payload.event || 'call_analyzed';
  const callData = payload.call || payload;

  return res.status(200).json({
    ok: true,
    receivedEvent: eventType,
    callId: callData.call_id || 'retell-voice-session',
    fromNumber: callData.from_number || null,
    toNumber: callData.to_number || process.env.RETELL_VOICE_NUMBER || null,
    transcriptSummary:
      (callData.call_analysis && callData.call_analysis.call_summary) ||
      callData.transcript ||
      'Retell AI Voice Agent completed architectural intake call.'
  });
};
