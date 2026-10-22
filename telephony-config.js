/**
 * ============================================================================
 * TIBERIUS AI // AETHER ARCHITECTURAL TELEPHONY & AI ROUTING CONFIGURATION
 * ============================================================================
 * IMPORTANT RULE:
 * - Visible display phone numbers on the website ALWAYS remain "(800) 555-0199".
 * - Only click-to-call (`tel:`) and click-to-text (`sms:`) links/buttons route
 *   to `retellVoiceNumber` (+18304652566) and `smsAgentNumber` (+18303608517).
 * - `smsRoutingMode` is set to `'manual'` ("Manual / Office Hours Handover")
 *   by default so employees or the owner can handle back-office communication
 *   during office hours, and can be toggled to `'ai_autopilot'` when 24/7
 *   automatic AI SMS responses are desired.
 * ============================================================================
 */
(function () {
  'use strict';

  const STORAGE_KEY_CONFIG = 'tiberius_aether_telephony_v2';

  const DEFAULT_CONFIG = {
    // Visible display text on the website (NEVER changed in page copy)
    displayPhoneText: '(800) 555-0199',

    // Click-to-Call destination -> Retell AI Voice Agent Number (E.164 format)
    retellVoiceNumber: '+18304652566',

    // Click-to-Text destination -> Twilio SMS AI Agent Number (E.164 format)
    smsAgentNumber: '+18303608517',

    // Default SMS Routing Mode:
    // 'manual'       -> Manual / Office Hours Employee Handover (DEFAULT: AI does NOT auto-reply; holds for staff)
    // 'ai_autopilot' -> AI Agent answers incoming texts automatically 24/7
    // 'draft'        -> AI Co-Pilot prepares draft for Principal Architect approval
    smsRoutingMode: 'manual',

    // Gemini Model & Optional Client/Admin Key Override (Server uses process.env.GEMINI_API_KEY first)
    geminiModel: 'gemini-2.5-flash',
    geminiApiKey: '',

    // Default pre-filled SMS body when a visitor clicks a Click-to-Text link
    defaultSmsBody:
      'Hi Aether Architectural Remodeling, I would like a ballpark estimate and 3D evaluation for my property.'
  };

  function loadConfig() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_CONFIG);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Object.assign({}, DEFAULT_CONFIG, parsed, {
          displayPhoneText: '(800) 555-0199' // Strictly preserve visible text
        });
      }
    } catch (_err) {
      // Ignore storage access errors
    }
    return Object.assign({}, DEFAULT_CONFIG);
  }

  function saveConfig(partial) {
    const current = loadConfig();
    const updated = Object.assign({}, current, partial, {
      displayPhoneText: '(800) 555-0199'
    });
    try {
      window.localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
    } catch (_err) {
      // Ignore storage errors
    }
    window.TIBERIUS_TELEPHONY = updated;
    applyClickTargetsToDom(updated);
    return updated;
  }

  function normalizeE164(input, fallback) {
    if (!input || typeof input !== 'string') return fallback;
    const digits = input.replace(/[^\d+]/g, '');
    if (!digits) return fallback;
    if (digits.startsWith('+')) return digits;
    if (digits.length === 10) return '+1' + digits;
    if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
    return '+' + digits;
  }

  /**
   * Updates ONLY the `href` attributes of click-to-call (`tel:`) and click-to-text (`sms:`)
   * buttons and links across the page.
   * NEVER modifies the visible text content of any phone number on the site.
   */
  function applyClickTargetsToDom(cfg) {
    const activeCfg = cfg || loadConfig();
    const voiceE164 = normalizeE164(activeCfg.retellVoiceNumber, DEFAULT_CONFIG.retellVoiceNumber);
    const smsE164 = normalizeE164(activeCfg.smsAgentNumber, DEFAULT_CONFIG.smsAgentNumber);
    const encodedBody = encodeURIComponent(activeCfg.defaultSmsBody || DEFAULT_CONFIG.defaultSmsBody);

    // 1. All Click-to-Call links (`a[href^="tel:"]` or `[data-click-to-call]`)
    // Route href to Retell AI Voice Agent number (+18304652566) while leaving visible text untouched
    document.querySelectorAll('a[href^="tel:"], a[data-click-to-call]').forEach((el) => {
      el.setAttribute('href', `tel:${voiceE164}`);
      el.setAttribute('data-retell-voice-target', voiceE164);
    });

    // 2. All Click-to-Text links (`a[href^="sms:"]` or `[data-click-to-text]`)
    // Route href to Twilio SMS Agent number (+18303608517) while leaving visible text untouched
    document.querySelectorAll('a[href^="sms:"], a[data-click-to-text]').forEach((el) => {
      const customBody = el.getAttribute('data-sms-body');
      const bodyParam = customBody ? encodeURIComponent(customBody) : encodedBody;
      el.setAttribute('href', `sms:${smsE164}?&body=${bodyParam}`);
      el.setAttribute('data-sms-agent-target', smsE164);
    });
  }

  // Initialize global singleton
  const currentConfig = loadConfig();
  window.TIBERIUS_TELEPHONY = currentConfig;
  window.TiberiusTelephony = {
    getConfig: loadConfig,
    saveConfig: saveConfig,
    normalizeE164: normalizeE164,
    applyClickTargetsToDom: applyClickTargetsToDom
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyClickTargetsToDom(loadConfig());
    });
  } else {
    applyClickTargetsToDom(currentConfig);
  }
})();
