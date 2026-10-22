/**
 * ============================================================================
 * VERCEL SERVERLESS ENDPOINT: /api/ai-estimate
 * ============================================================================
 * Multimodal Gemini 2.5 Flash Architectural Photo & Scope Estimator
 * - Uses Google Gemini API (`gemini-2.5-flash`) to analyze uploaded homeowner
 *   property photos (base64 inlineData) + remodel scope descriptions.
 * - Returns structured JSON with turnkey investment range, build timeline,
 *   projected appraisal equity lift, architectural feasibility note, and a
 *   tailored SMS follow-up draft for the 3-Pane Back-Office Room.
 * - Gracefully falls back to deterministic architectural pricing benchmarks if
 *   GEMINI_API_KEY is not yet configured.
 * ============================================================================
 */

const FALLBACK_ESTIMATES = {
  'Whole-Home Exterior Modernization': {
    range: '$340,000 – $520,000',
    timeline: 'Est. Duration: 14–20 Weeks',
    lift: 'Projected Value Lift: +$680k+',
    architecturalNote:
      'Feasibility Pre-Check: Existing structural footprint is well-suited for full facade re-skinning in clear vertical-grain western red cedar, architectural facade panels, and oversized low-iron thermal window spans.'
  },
  'Facade & Siding Modernization': {
    range: '$265,000 – $395,000',
    timeline: 'Est. Duration: 12–16 Weeks',
    lift: 'Projected Value Lift: +$580k+',
    architecturalNote:
      'Suburban Elevation Pre-Check: High curb-appeal ROI potential by replacing dated brick/siding with architectural composite panels, warm cedar accents, and a standing-seam metal roof overhang.'
  },
  'Glass & Structural Addition': {
    range: '$380,000 – $640,000',
    timeline: 'Est. Duration: 18–24 Weeks',
    lift: 'Projected Value Lift: +$850k+',
    architecturalNote:
      'Structural Pre-Check: Recommended cantilevered W12 structural steel moment frame to eliminate corner posts and open unobstructed floor-to-ceiling low-iron glass views.'
  },
  'Suburban Addition & Indoor-Outdoor Great Room': {
    range: '$340,000 – $540,000',
    timeline: 'Est. Duration: 16–22 Weeks',
    lift: 'Projected Value Lift: +$740k+',
    architecturalNote:
      'Great Room Pre-Check: Ideal candidate for a structural steel rear span with 20-foot pocketing glass doors opening flush to a covered cedar-soffit patio.'
  },
  'Outdoor Living & Landscape Overhaul': {
    range: '$165,000 – $310,000',
    timeline: 'Est. Duration: 10–14 Weeks',
    lift: 'Projected Value Lift: +$390k+',
    architecturalNote:
      'Site & Terrain Pre-Check: Laser-graded tiered basalt stone retaining terraces with concealed slot drainage and 2700K recessed architectural step illumination.'
  },
  'Architectural Entryway & Front Yard Landscaping': {
    range: '$145,000 – $260,000',
    timeline: 'Est. Duration: 8–12 Weeks',
    lift: 'Projected Value Lift: +$340k+',
    architecturalNote:
      'Entryway Pre-Check: Cantilevered cedar-soffit front canopy paired with a pivot glass entry door and sculpted limestone courtyard walkway.'
  },
  'Luxury Kitchen & Great Room Open-Concept': {
    range: '$240,000 – $420,000',
    timeline: 'Est. Duration: 12–16 Weeks',
    lift: 'Projected Value Lift: +$520k+',
    architecturalNote:
      'Interior Structural Pre-Check: Load-bearing partition removal via flush concealed steel beam, unlocking an open-concept chef kitchen with bookmatched quartzite island.'
  },
  'Roofline, Siding & Architectural Windows': {
    range: '$190,000 – $340,000',
    timeline: 'Est. Duration: 10–14 Weeks',
    lift: 'Projected Value Lift: +$440k+',
    architecturalNote:
      'Envelope Pre-Check: Standing-seam matte black metal roof upgrade with deep cantilevered eaves, triple-pane architectural glazing, and high-R exterior insulation.'
  }
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const scope = body.scope || 'Whole-Home Exterior Modernization';
  const visionText = body.visionText || scope;
  const imageBase64 = body.imageBase64 || null;
  const geminiKey =
    body.geminiApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const fallback =
    FALLBACK_ESTIMATES[scope] || FALLBACK_ESTIMATES['Whole-Home Exterior Modernization'];

  if (!geminiKey) {
    return res.status(200).json({
      ok: true,
      provider: 'deterministic-fallback',
      model: 'aether-pricing-engine-v1',
      range: fallback.range,
      timeline: fallback.timeline,
      lift: fallback.lift,
      architecturalNote: fallback.architecturalNote,
      smsDraft: `Hi! We reviewed your "${scope}" inquiry (${fallback.range} turnkey ballpark, ${fallback.timeline.replace('Est. Duration: ', '')}). Would you like Principal Architect Julian Vance, AIA out this Thursday at 2:00 PM for a complimentary 3D LiDAR site scan?`
    });
  }

  try {
    const parts = [
      {
        text: `You are Julian Vance, AIA, Principal Architect at Aether Architectural Remodeling (licensed luxury design-build firm #AETHEAR884K1).
A homeowner submitted a property remodel estimate request:
- Selected Scope Category: "${scope}"
- Homeowner Vision / Notes: "${visionText}"
${imageBase64 ? '- An actual photo of their property is attached. Inspect its architecture, roofline, siding, windows, and yard.' : ''}

Return a JSON object with these exact keys:
- "range": Realistic luxury turnkey design-build price range string (e.g. "$360,000 – $490,000")
- "timeline": Estimated engineering + construction window string prefixed with "Est. Duration: " (e.g. "Est. Duration: 14–18 Weeks")
- "lift": Projected post-remodel appraisal equity lift prefixed with "Projected Value Lift: " (e.g. "Projected Value Lift: +$690k+")
- "architecturalNote": A concise, authoritative 2-sentence architectural & structural observation tailored to their property/vision.
- "smsDraft": A warm, high-converting 2-sentence SMS message from Aether Architectural Remodeling referencing their specific scope and ballpark range, offering a complimentary on-site 3D LiDAR scan this Thursday at 2:00 PM.`
      }
    ];

    if (imageBase64 && typeof imageBase64 === 'string' && imageBase64.includes('base64,')) {
      const [header, b64Data] = imageBase64.split('base64,');
      const mimeMatch = header.match(/data:(image\/[a-zA-Z0-9+.-]+);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      parts.push({
        inlineData: {
          mimeType,
          data: b64Data
        }
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${encodeURIComponent(geminiKey)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.35,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API status ${response.status}`);
    }

    const data = await response.json();
    const rawText =
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text;

    const parsed = JSON.parse(rawText);
    return res.status(200).json({
      ok: true,
      provider: 'google-gemini',
      model: geminiModel,
      range: parsed.range || fallback.range,
      timeline: parsed.timeline || fallback.timeline,
      lift: parsed.lift || fallback.lift,
      architecturalNote: parsed.architecturalNote || fallback.architecturalNote,
      smsDraft:
        parsed.smsDraft ||
        `Hi! We reviewed your "${scope}" inquiry (${parsed.range || fallback.range} turnkey ballpark). Would Thursday at 2:00 PM work for your complimentary 3D LiDAR site scan?`
    });
  } catch (err) {
    return res.status(200).json({
      ok: true,
      provider: 'deterministic-fallback',
      model: 'aether-pricing-engine-v1',
      fallbackReason: err.message,
      range: fallback.range,
      timeline: fallback.timeline,
      lift: fallback.lift,
      architecturalNote: fallback.architecturalNote,
      smsDraft: `Hi! We reviewed your "${scope}" inquiry (${fallback.range} turnkey ballpark, ${fallback.timeline.replace('Est. Duration: ', '')}). Would you like Principal Architect Julian Vance, AIA out this Thursday at 2:00 PM for a complimentary 3D LiDAR site scan?`
    });
  }
};
