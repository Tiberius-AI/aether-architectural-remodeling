/**
 * ============================================================================
 * VERCEL SERVERLESS ENDPOINT: /api/sms
 * ============================================================================
 * Handles:
 * 1. Inbound SMS Webhooks (Twilio / Telnyx / GHL / Retell SMS)
 * 2. Web Photo Estimator & Consultation Vault Lead -> SMS Handshake
 * 3. Back-Office Manual Employee Replies & AI Co-Pilot Draft Approvals
 * 4. AI Auto-Pilot vs. Manual (Office Hours / Employee Handover) Mode Control
 *
 * CRITICAL HANDOVER RULE:
 * - Default mode is `'manual'` (Office Hours / Employee Handover).
 * - When `mode === 'manual'`, incoming texts are NOT auto-answered by the AI.
 *   Instead, they are queued for a human employee in the Back-Office Room
 *   (with a suggested AI whisper draft ready if the employee wants it).
 * - When `mode === 'ai_autopilot'`, the AI Agent answers incoming texts
 *   automatically and dispatches the SMS reply immediately.
 * ============================================================================
 */

// In-memory state fallback for serverless warm instances (paired with client state)
let globalSmsRoutingMode = process.env.DEFAULT_SMS_ROUTING_MODE || 'manual';

function buildGroundedAiReply({ name, scope, budget, timeline, lift, inboundText }) {
  const clientName = name && name !== 'Homeowner' ? name.split(' ')[0] : 'there';
  const textLower = (inboundText || '').toLowerCase();

  if (textLower.includes('price') || textLower.includes('cost') || textLower.includes('ballpark') || textLower.includes('how much')) {
    return `Hi ${clientName}! This is Alfred, Aether Architectural Remodeling's AI Desk. Based on our fixed-price design-build benchmarks, ${scope || 'a whole-home architectural modernization'} typically ranges from ${budget || '$320,000 – $540,000'} turnkey (${timeline || '14–20 weeks'}) with a projected ${lift || '+$680k+'} appraisal lift. Would you like our Principal Architect to run a complimentary 3D LiDAR site scan this week?`;
  }

  if (textLower.includes('schedule') || textLower.includes('book') || textLower.includes('thursday') || textLower.includes('friday') || textLower.includes('scan') || textLower.includes('visit')) {
    return `Hi ${clientName}! I have provisionally held a Principal Architect & 3D LiDAR Site Scan window for you. Would Thursday at 2:00 PM or Friday at 11:30 AM work best for your property walkthrough?`;
  }

  if (textLower.includes('hoa') || textLower.includes('permit') || textLower.includes('engineer')) {
    return `Hi ${clientName}! Yes—all structural steel engineering, municipal permitting, and HOA architectural review board packets are handled 100% in-house by Aether's licensed architects before construction begins. What neighborhood is your property located in?`;
  }

  return `Hi ${clientName}! Thank you for texting Aether Architectural Remodeling. We received your inquiry regarding "${inboundText || scope || 'Whole-Home Architectural Modernization'}". Preliminary turnkey ballpark: ${budget || '$340,000 – $520,000'} (${timeline || '14–20 weeks'}). Would you like to schedule a complimentary 3D LiDAR property scan with Principal Architect Julian Vance, AIA?`;
}

async function dispatchRealSmsIfConfigured(toPhone, messageBody) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromSmsNumber = process.env.SMS_AGENT_NUMBER;

  if (!accountSid || !authToken || !fromSmsNumber || !toPhone) {
    return {
      dispatchedLive: false,
      provider: 'simulated-until-env-configured',
      from: fromSmsNumber || 'SMS_AGENT_NUMBER'
    };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const params = new URLSearchParams();
    params.append('To', toPhone);
    params.append('From', fromSmsNumber);
    params.append('Body', messageBody);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.json();
    return {
      dispatchedLive: response.ok,
      provider: 'twilio',
      sid: data.sid || null,
      from: fromSmsNumber
    };
  } catch (err) {
    return {
      dispatchedLive: false,
      provider: 'twilio-error',
      error: err.message
    };
  }
}

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
      smsRoutingMode: globalSmsRoutingMode,
      smsAgentNumber: process.env.SMS_AGENT_NUMBER || null,
      retellVoiceNumber: process.env.RETELL_VOICE_NUMBER || null,
      description:
        globalSmsRoutingMode === 'manual'
          ? 'Manual Mode Active (Employee / Office Hours Handover — AI Auto-Reply Paused)'
          : 'AI Auto-Pilot Active (24/7 Automatic AI SMS Replies)'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  // Check if this is a raw Twilio incoming SMS webhook (From, Body)
  const isTwilioWebhook = Boolean(body.From && typeof body.Body === 'string' && !body.action);
  if (isTwilioWebhook) {
    const incomingFrom = body.From;
    const incomingText = body.Body.trim();
    const activeMode = globalSmsRoutingMode;
    const aiSuggestedReply = buildGroundedAiReply({
      name: 'Homeowner',
      inboundText: incomingText
    });

    // If set to MANUAL (Office Hours / Employee Handover), do NOT auto-reply via TwiML
    if (activeMode !== 'ai_autopilot') {
      res.setHeader('Content-Type', 'text/xml');
      return res.status(200).send('<Response></Response>');
    }

    // If set to AI AUTO-PILOT, reply automatically via TwiML
    const escapedReply = aiSuggestedReply
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(`<Response><Message>${escapedReply}</Message></Response>`);
  }

  // Otherwise handle JSON requests from the Website / Back-Office Room
  const action = body.action || 'inbound_sms';
  const requestedMode = body.mode || globalSmsRoutingMode;

  if (action === 'set_mode') {
    if (body.mode === 'manual' || body.mode === 'ai_autopilot' || body.mode === 'draft') {
      globalSmsRoutingMode = body.mode;
    }
    return res.status(200).json({
      ok: true,
      smsRoutingMode: globalSmsRoutingMode
    });
  }

  // Human employee manual reply or draft approval -> always locks thread to manual mode
  if (action === 'manual_reply' || action === 'approve_draft') {
    globalSmsRoutingMode = 'manual';
    const delivery = await dispatchRealSmsIfConfigured(body.phone, body.message);
    return res.status(200).json({
      ok: true,
      action,
      smsRoutingMode: 'manual',
      autoHandoverLocked: true,
      delivery
    });
  }

  // Inbound SMS or Web Lead submission
  const aiGeneratedText = buildGroundedAiReply({
    name: body.name,
    scope: body.scope,
    budget: body.budget,
    timeline: body.timeline,
    lift: body.lift,
    inboundText: body.message || body.visionText
  });

  if (requestedMode === 'ai_autopilot') {
    // AI Auto-Pilot is ON -> Automatically send the AI SMS response right away
    const delivery = await dispatchRealSmsIfConfigured(body.phone, aiGeneratedText);
    return res.status(200).json({
      ok: true,
      status: 'auto_replied',
      smsRoutingMode: 'ai_autopilot',
      autoReplied: true,
      aiReply: aiGeneratedText,
      delivery
    });
  }

  // Default: MANUAL MODE (Office Hours / Employee Handover) or DRAFT MODE
  // Do NOT auto-send the AI response; hold for employee takeover and provide whisper draft
  return res.status(200).json({
    ok: true,
    status: 'queued_for_human',
    smsRoutingMode: requestedMode,
    autoReplied: false,
    aiDraft: aiGeneratedText,
    notice:
      'Manual / Office Hours Mode active: AI auto-reply held so an employee or Principal can respond manually.'
  });
};
