const MOBILE_SCROLL_SCRUB = false; // Set to true to enable damped scroll-scrubbing on viewports <= 768px

(function () {
  'use strict';

  /* =========================================================================
     1. STATE & CONFIGURATION
     ========================================================================= */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isMobileViewport = window.innerWidth <= 768;

  // Hero manual scrub state (defaults to 1.0 / 100% Completed Remodel on all viewports)
  let targetProgress = 1.0;
  let currentProgress = 1.0;
  let activeStageIndex = 3;
  let pointerNormX = 0;
  let pointerNormY = 0;

  // Image assets & 60-frame synthesized buffer for sub-frame blending
  const TOTAL_SYNTH_FRAMES = 60;
  const heroFrames = [];
  let heroBeforeImg = null;
  let heroAfterImg = null;
  let heroImagesLoaded = false;

  /* =========================================================================
     2. CAPABILITY LIGHTBOX DATA (6 BENTO CAPABILITIES)
     ========================================================================= */
  const CAPABILITY_SPECS = {
    'reskinning': {
      eyebrow: '01 // WHOLE-HOME EXTERIOR TRANSFORMATION',
      title: 'Whole-Home Architectural Re-Skinning',
      subtitle: 'Complete structural envelope modernization transforming dated 1970s–1990s homes into contemporary woodland sanctuaries.',
      beforeText: 'Weathered cedar or lap siding, compartmentalized small windows with poor thermal performance, dated gable overhangs, and dark interiors disconnected from surrounding views.',
      afterText: 'Clear vertical-grain western red cedar rain-screen cladding, floor-to-ceiling low-iron thermal window walls, knife-edge blackened steel fascia, and recessed warm architectural soffit lighting.',
      timeline: '14–22 Weeks',
      investment: '$280,000 – $540,000',
      estimatorPill: 'Whole-Home Exterior Modernization',
      estimatorPrompt: 'Whole-Home Architectural Re-Skinning — cedar rain-screen, black steel fascia & expanded glazing',
      specs: [
        'Kiln-dried Clear Vertical Grain (CVG) Western Red Cedar soffits & rain-screen siding',
        'Triple-pane thermally broken aluminum & steel-profile window walls (U-factor 0.18)',
        'Continuous exterior rigid mineral wool insulation & commercial vapor-permeable membrane',
        'Quarried architectural basalt stone veneer base & integrated concealed gutter detailing',
        '3D LiDAR pre-construction scan ensuring 100% millimeter cladding fitment'
      ]
    },
    'glazing-additions': {
      eyebrow: '02 // STRUCTURAL EXPANSION & GLAZING',
      title: 'Structural Steel & Floor-to-Ceiling Glazing Additions',
      subtitle: 'Engineered W-section steel moment frames enabling dramatic cantilevers and unobstructed 24-foot glass spans.',
      beforeText: 'Load-bearing exterior walls and bulky corner posts blocking forest or water views, cramped living rooms, and decaying bolt-on timber decks.',
      afterText: 'Cantilevered matte-black structural steel additions with zero-post corner glass walls, soaring 14-foot ceilings, and seamless indoor-outdoor terrace transitions.',
      timeline: '16–26 Weeks',
      investment: '$360,000 – $720,000',
      estimatorPill: 'Glass & Structural Addition',
      estimatorPrompt: 'Structural Steel & Floor-to-Ceiling Glazing Addition — cantilevered glass great room',
      specs: [
        'In-house stamped structural engineering with AISC-certified architectural steel fabrication',
        'Zero-sightline motorized pocketing and lift-and-slide low-iron glass doors',
        'Micropile & cantilevered grade-beam foundations for sloped or sensitive woodland lots',
        'Integrated hydronic radiant floor heating beneath large-format stone tile spans',
        'Marine-grade fluoropolymer matte-black steel finish warrantied against corrosion'
      ]
    },
    'woodland-landscape': {
      eyebrow: '03 // ESTATE GROUNDS & TERRAIN ENGINEERING',
      title: 'Woodland & Estate Landscape Architecture',
      subtitle: 'Reclaiming untamed brush and sloped forest clearings into monolithic stone terraces and illuminated outdoor living sanctuaries.',
      beforeText: 'Overgrown ferns, invasive brush, mossy uneven flagstones, poor hillside drainage, and dark uninviting perimeter grounds.',
      afterText: 'Selective arborist canopy framing, tiered monolithic basalt retaining walls, floating stone stair treads with recessed 2700K LED linear lighting, and covered outdoor hearths.',
      timeline: '8–14 Weeks',
      investment: '$145,000 – $340,000',
      estimatorPill: 'Outdoor Living & Landscape Overhaul',
      estimatorPrompt: 'Woodland & Estate Landscape Overhaul — tiered basalt stone terraces & architectural lighting',
      specs: [
        'Precision laser-graded tiered basalt and granite dry-stack & structural retaining walls',
        'Flamed thermal bluestone and porphyry terraces with concealed slot drainage',
        'Low-voltage 2700K warm architectural step, soffit, and tree-canopy uplighting',
        'Covered cantilevered cedar-and-steel outdoor dining pavilions with gas/wood fireplaces',
        'Native Pacific Northwest woodland restoration plantings (sword ferns, moss, maples)'
      ]
    },
    'kitchen-greatroom': {
      eyebrow: '04 // INTERIOR STRUCTURAL ARCHITECTURE',
      title: "Chef's Kitchens & Cantilevered Indoor-Outdoor Great Rooms",
      subtitle: 'Removing interior load-bearing partitions to unite culinary craft with panoramic forest and terrace views.',
      beforeText: 'Closed-off kitchens, dropped soffits, dated cabinetry, and walls separating indoor dining from outdoor entertaining areas.',
      afterText: 'Flush-recessed steel structural beams, 14-foot waterfall quartzite islands, custom rift-sawn white oak cabinetry, and motorized glass walls opening onto stone terraces.',
      timeline: '12–18 Weeks',
      investment: '$210,000 – $440,000',
      estimatorPill: 'Luxury Kitchen & Great Room Open-Concept',
      estimatorPrompt: "Luxury Chef's Kitchen & Cantilevered Open-Concept Great Room with flush steel beams",
      specs: [
        'Flush-pocketed structural steel LVL/W-beam headers eliminating dropped ceiling bulkheads',
        ' Custom architectural millwork in quartersawn white oak, walnut, and matte lacquer',
        'Bookmatched Taj Mahal quartzite or honed Pietra Grey marble monolithic islands',
        'Integrated Gaggenau, Sub-Zero, and Wolf architectural appliance walls',
        'Acoustic plaster ceilings and museum-grade trimless recessed lighting'
      ]
    },
    'roofline-engineering': {
      eyebrow: '05 // ROOFLINE & THERMAL ENVELOPE',
      title: 'Standing-Seam Metal & Cedar Roofline Engineering',
      subtitle: 'Re-pitching dated hip and gable roofs into dramatic modern architectural profiles built to last 50+ years.',
      beforeText: 'Aging composite shingles, shallow eaves, exposed residential gutters, and poor attic ventilation prone to moss and heat loss.',
      afterText: 'Architectural 24-gauge PVDF matte-black standing-seam metal rooflines, 4-foot cantilevered cedar soffits, and concealed structural box gutters.',
      timeline: '6–12 Weeks',
      investment: '$115,000 – $260,000',
      estimatorPill: 'Roofline, Siding & Architectural Windows',
      estimatorPrompt: 'Standing-Seam Black Metal Roofline Re-Engineering & Warm Cedar Soffit Overhangs',
      specs: [
        '24-gauge Kynar 500® / PVDF matte-black concealed-fastener standing-seam metal panels',
        'Structural steel outriggers supporting deep 3ft to 5ft cantilevered roof overhangs',
        'Clear tongue-and-groove western red cedar soffits with integrated linear LED troffers',
        'High-temp ice-and-water shield membrane with R-49 vented structural roof assembly',
        'Seamless custom-fabricated dark bronze and matte-black architectural flashings'
      ]
    },
    'digital-twin': {
      eyebrow: '06 // PRE-CONSTRUCTION CERTAINTY',
      title: '3D Digital Twin & Fixed-Price Pre-Construction',
      subtitle: 'We build your transformation digitally to the millimeter before a single crew steps onto your property.',
      beforeText: 'Vague contractor allowances, rough 2D sketches, mid-project structural surprises, and escalating change orders.',
      afterText: 'Full LiDAR point-cloud scan, interactive 3D architectural model, stamped structural engineering, and a locked Fixed-Price Milestone Contract.',
      timeline: '3–5 Weeks Pre-Build',
      investment: 'Credited 100% Toward Build',
      estimatorPill: 'Whole-Home Exterior Modernization',
      estimatorPrompt: '3D Digital Twin Pre-Construction Scan & Fixed-Price Whole-Home Feasibility Study',
      specs: [
        'Sub-2mm terrestrial LiDAR laser scan of existing structure, framing, and site contours',
        'Photorealistic 3D twilight & daylight architectural renders from every vantage point',
        'Complete structural steel, glazing, and municipal permitting documentation',
        'Full material take-off and pre-procurement schedule locking vendor pricing',
        'Binding Zero-Unapproved-Change-Order Fixed-Price Construction Agreement'
      ]
    }
  };

  /* =========================================================================
     3. PROCEDURAL ARCHITECTURAL RENDERER (FALLBACK & FRAME SYNTHESIZER)
     ========================================================================= */
  function drawProceduralArchitecture(ctx, width, height, progress, options = {}) {
    const mode = options.mode || 'hero';
    ctx.save();

    // 1. Twilight Woodland Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.65);
    skyGrad.addColorStop(0, '#050811');
    skyGrad.addColorStop(0.45, '#0F1B2E');
    skyGrad.addColorStop(1, '#1A2A3A');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Distant Misty Conifer Ridge
    ctx.fillStyle = 'rgba(12, 22, 34, 0.85)';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.62);
    for (let x = 0; x <= width; x += 28) {
      const treeH = 50 + Math.sin(x * 0.04) * 28 + Math.cos(x * 0.11) * 18;
      ctx.lineTo(x, height * 0.52 - treeH);
      ctx.lineTo(x + 14, height * 0.54);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    const drawBeforeState = (clipW) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, clipW, height);
      ctx.clip();

      // Overgrown woodland ground
      const groundGrad = ctx.createLinearGradient(0, height * 0.58, 0, height);
      groundGrad.addColorStop(0, '#132019');
      groundGrad.addColorStop(1, '#09110D');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, height * 0.58, width, height * 0.42);

      // Dated 1970s weathered woodland gable house
      const hx = width * 0.27;
      const hy = height * 0.34;
      const hw = width * 0.44;
      const hh = height * 0.30;

      // Weathered dark timber body
      ctx.fillStyle = '#2B2623';
      ctx.fillRect(hx, hy + hh * 0.32, hw, hh * 0.68);

      // Steep dated gable roof
      ctx.fillStyle = '#1E2229';
      ctx.beginPath();
      ctx.moveTo(hx - 24, hy + hh * 0.34);
      ctx.lineTo(hx + hw * 0.45, hy - hh * 0.18);
      ctx.lineTo(hx + hw + 20, hy + hh * 0.34);
      ctx.closePath();
      ctx.fill();

      // River rock chimney
      ctx.fillStyle = '#3B3D40';
      ctx.fillRect(hx + hw * 0.68, hy - hh * 0.22, hw * 0.09, hh * 0.86);

      // Small dim dated windows
      ctx.fillStyle = 'rgba(217, 148, 68, 0.35)';
      ctx.fillRect(hx + hw * 0.14, hy + hh * 0.48, hw * 0.14, hh * 0.22);
      ctx.fillRect(hx + hw * 0.42, hy + hh * 0.48, hw * 0.14, hh * 0.22);

      // Untamed brush & mossy stones in foreground
      ctx.strokeStyle = '#1E3524';
      ctx.lineWidth = 2;
      for (let i = 0; i < 45; i++) {
        const bx = (i / 45) * width;
        const by = height * (0.64 + (i % 5) * 0.06);
        ctx.beginPath();
        ctx.moveTo(bx, by + 24);
        ctx.quadraticCurveTo(bx - 14, by, bx - 22, by + 10);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawAfterState = (startX) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(startX, 0, width - startX, height);
      ctx.clip();

      // Manicured dark architectural slate & lawn grade
      const lawnGrad = ctx.createLinearGradient(0, height * 0.58, 0, height);
      lawnGrad.addColorStop(0, '#0E1920');
      lawnGrad.addColorStop(1, '#070A0F');
      ctx.fillStyle = lawnGrad;
      ctx.fillRect(0, height * 0.58, width, height * 0.42);

      const hx = width * 0.22;
      const hy = height * 0.28;
      const hw = width * 0.56;
      const hh = height * 0.36;

      // Warm interior architectural amber glow
      const glowGrad = ctx.createRadialGradient(
        hx + hw * 0.48,
        hy + hh * 0.55,
        10,
        hx + hw * 0.48,
        hy + hh * 0.55,
        hw * 0.65
      );
      glowGrad.addColorStop(0, 'rgba(255, 196, 107, 0.42)');
      glowGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Upper & Lower Floor-to-Ceiling Glass Volumes
      const glassGrad = ctx.createLinearGradient(hx, hy, hx, hy + hh);
      glassGrad.addColorStop(0, '#F5B041');
      glassGrad.addColorStop(0.5, '#FAD7A0');
      glassGrad.addColorStop(1, '#D68910');
      ctx.fillStyle = glassGrad;
      ctx.fillRect(hx + hw * 0.06, hy + hh * 0.18, hw * 0.78, hh * 0.76);

      // Warm Western Red Cedar Soffits
      ctx.fillStyle = '#9C5A25';
      ctx.fillRect(hx - 18, hy + hh * 0.14, hw * 0.92, 10);
      ctx.fillRect(hx - 10, hy + hh * 0.52, hw * 0.98, 8);

      // Matte-Black Structural Steel Columns & Cantilevered Roof Fascia
      ctx.fillStyle = '#0B0F17';
      ctx.fillRect(hx - 24, hy + hh * 0.09, hw * 0.96, 9);
      ctx.fillRect(hx - 14, hy + hh * 0.48, hw * 1.02, 8);

      // Vertical Steel Mullions
      for (let m = 0.06; m <= 0.84; m += 0.13) {
        ctx.fillRect(hx + hw * m, hy + hh * 0.16, 5, hh * 0.78);
      }

      // Stacked Basalt Stone Chimney Core
      ctx.fillStyle = '#333942';
      ctx.fillRect(hx + hw * 0.64, hy - hh * 0.06, hw * 0.12, hh * 1.0);

      // Tiered Basalt Stone Terraces & Warm LED Step Strips
      for (let t = 0; t < 3; t++) {
        const ty = height * (0.65 + t * 0.085);
        const tw = hw * (0.95 - t * 0.12);
        const tx = hx + (hw - tw) * 0.35;
        ctx.fillStyle = '#1C2430';
        ctx.fillRect(tx, ty, tw, height * 0.065);
        ctx.fillStyle = '#D4AF37';
        ctx.fillRect(tx + tw * 0.18, ty + 2, tw * 0.45, 3);
      }

      ctx.restore();
    };

    const splitX = width * progress;
    drawBeforeState( width );
    drawAfterState( width * (1 - progress) );

    // Scanline divider in procedural mode
    if (mode !== 'static' && progress > 0.01 && progress < 0.99) {
      const sx = width * progress;
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();
    }

    ctx.restore();
  }

  /* =========================================================================
     4. BUILD 60-FRAME PROGRESSIVE BUFFER FOR SUB-FRAME ALPHA BLENDING
     ========================================================================= */
  function buildSynthesizedHeroFrames() {
    heroFrames.length = 0;
    const offWidth = 960;
    const offHeight = 540;

    for (let i = 0; i < TOTAL_SYNTH_FRAMES; i++) {
      const p = i / (TOTAL_SYNTH_FRAMES - 1);
      const c = document.createElement('canvas');
      c.width = offWidth;
      c.height = offHeight;
      const cctx = c.getContext('2d');

      if (heroImagesLoaded && heroBeforeImg && heroAfterImg) {
        // Draw cover-fitted Before image
        drawCoverImage(cctx, heroBeforeImg, offWidth, offHeight);

        // Progressive architectural transformation reveal with soft feathered transition + cross-blend
        const sweepX = offWidth * p;
        const feather = offWidth * 0.09;

        // Also blend global subtle architectural lighting progression
        cctx.save();
        cctx.globalAlpha = Math.pow(p, 1.35) * 0.35;
        drawCoverImage(cctx, heroAfterImg, offWidth, offHeight);
        cctx.restore();

        // Clipped directional reveal of After state behind the 3D scan wave
        cctx.save();
        cctx.beginPath();
        cctx.rect(0, 0, Math.max(0, sweepX + feather), offHeight);
        cctx.clip();
        drawCoverImage(cctx, heroAfterImg, offWidth, offHeight);
        cctx.restore();
      } else {
        drawProceduralArchitecture(cctx, offWidth, offHeight, p, { mode: 'static' });
      }

      heroFrames.push(c);
    }
  }

  function drawCoverImage(ctx, img, canvasW, canvasH) {
    const imgW = img.naturalWidth || img.width || 1600;
    const imgH = img.naturalHeight || img.height || 900;
    const scale = Math.max(canvasW / imgW, canvasH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const offsetX = (canvasW - drawW) * 0.5;
    const offsetY = (canvasH - drawH) * 0.5;
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }

  /* =========================================================================
     5. HERO TRANSFORMATION CANVAS + SUB-FRAME ALPHA BLENDING + 3D SCANLINE
     ========================================================================= */
  const heroCanvas = document.getElementById('hero-transformation-canvas');
  const heroCtx = heroCanvas ? heroCanvas.getContext('2d') : null;

  function resizeHeroCanvas() {
    if (!heroCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = heroCanvas.parentElement.getBoundingClientRect();
    heroCanvas.width = Math.max(320, Math.floor(rect.width * dpr));
    heroCanvas.height = Math.max(320, Math.floor(rect.height * dpr));
  }

  function renderHeroTransformationCanvas(progress) {
    if (!heroCtx || !heroCanvas) return;
    const w = heroCanvas.width;
    const h = heroCanvas.height;

    heroCtx.clearRect(0, 0, w, h);

    // 1. Sub-Frame Alpha Crossfading across the 60-frame progressive sequence
    if (heroFrames.length > 1) {
      const frameIndex = Math.min(
        heroFrames.length - 1,
        Math.max(0, progress * (heroFrames.length - 1))
      );
      const lowIndex = Math.floor(frameIndex);
      const highIndex = Math.min(heroFrames.length - 1, Math.ceil(frameIndex));
      const subFrameAlpha = frameIndex % 1;

      heroCtx.globalAlpha = 1;
      heroCtx.drawImage(heroFrames[lowIndex], 0, 0, w, h);

      if (highIndex !== lowIndex && subFrameAlpha > 0.001) {
        heroCtx.globalAlpha = subFrameAlpha;
        heroCtx.drawImage(heroFrames[highIndex], 0, 0, w, h);
      }
      heroCtx.globalAlpha = 1;
    } else {
      drawProceduralArchitecture(heroCtx, w, h, progress);
    }

    // 2. High-Resolution Direct Before/After Sharp Composite + 3D LiDAR Blueprint Scan Wave
    if (heroImagesLoaded && heroBeforeImg && heroAfterImg) {
      const scanX = w * progress;
      const bandWidth = Math.max(60, w * 0.065);

      // Draw crisp high-res Before on right of scan wave
      heroCtx.save();
      heroCtx.globalAlpha = 1.0;
      heroCtx.beginPath();
      heroCtx.rect(scanX, 0, w - scanX, h);
      heroCtx.clip();
      drawCoverImage(heroCtx, heroBeforeImg, w, h);
      heroCtx.restore();

      // Draw crisp high-res After on left of scan wave
      heroCtx.save();
      heroCtx.globalAlpha = 1.0;
      heroCtx.beginPath();
      heroCtx.rect(0, 0, scanX, h);
      heroCtx.clip();
      drawCoverImage(heroCtx, heroAfterImg, w, h);
      heroCtx.restore();

      // 3. Glowing Golden-and-Cyan 3D Architectural Scanline & LiDAR Blueprint Grid
      if (progress > 0.005 && progress < 0.995) {
        renderArchitecturalScanWave(heroCtx, w, h, scanX, bandWidth, progress);
      }
    }
  }

  function renderArchitecturalScanWave(ctx, w, h, scanX, bandWidth, progress) {
    ctx.save();

    // Cyan LiDAR structural blueprint band around scanX
    const lidarGrad = ctx.createLinearGradient(scanX - bandWidth, 0, scanX + bandWidth, 0);
    lidarGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
    lidarGrad.addColorStop(0.38, 'rgba(56, 189, 248, 0.24)');
    lidarGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.52)');
    lidarGrad.addColorStop(0.62, 'rgba(56, 189, 248, 0.24)');
    lidarGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

    ctx.fillStyle = lidarGrad;
    ctx.fillRect(scanX - bandWidth, 0, bandWidth * 2, h);

    // Architectural Blueprint Grid inside the scan band
    ctx.save();
    ctx.beginPath();
    ctx.rect(scanX - bandWidth * 0.85, 0, bandWidth * 1.7, h);
    ctx.clip();

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.lineWidth = 1;
    const gridStep = Math.max(28, Math.floor(w / 38));

    for (let gx = Math.floor((scanX - bandWidth) / gridStep) * gridStep; gx < scanX + bandWidth; gx += gridStep) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let gy = 0; gy < h; gy += gridStep) {
      ctx.beginPath();
      ctx.moveTo(scanX - bandWidth, gy);
      ctx.lineTo(scanX + bandWidth, gy);
      ctx.stroke();
    }

    // Structural elevation dimension ticks along scanline
    ctx.fillStyle = 'rgba(212, 175, 55, 0.88)';
    for (let gy = gridStep * 2; gy < h - gridStep; gy += gridStep * 2) {
      ctx.fillRect(scanX - 6, gy - 1, 12, 2);
      ctx.beginPath();
      ctx.arc(scanX + Math.sin(gy * 0.05 + progress * 12) * 18, gy, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Primary Golden Laser Core Line (#D4AF37)
    ctx.shadowColor = '#D4AF37';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(scanX, 0);
    ctx.lineTo(scanX, h);
    ctx.stroke();

    // Secondary Cyan LiDAR Leading Edge (#38BDF8)
    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(scanX + 10, 0);
    ctx.lineTo(scanX + 10, h);
    ctx.stroke();

    ctx.restore();
  }

  /* =========================================================================
     6. THREE.JS 3D LIDAR PARTICLES, WIREFRAME HOUSE & LASER WAVE OVERLAY
     ========================================================================= */
  let threeScene = null;
  let threeCamera = null;
  let threeRenderer = null;
  let lidarParticles = null;
  let houseWireframeGroup = null;
  let laserWaveMesh = null;

  function initThreeJsHeroOverlay() {
    const webglCanvas = document.getElementById('hero-webgl-canvas');
    if (!webglCanvas || typeof window.THREE === 'undefined') return;

    const THREE = window.THREE;
    try {
      threeRenderer = new THREE.WebGLRenderer({
        canvas: webglCanvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      // Fallback gracefully if headless WebGL context is unavailable
      return;
    }

    const rect = webglCanvas.parentElement.getBoundingClientRect();
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    threeRenderer.setSize(rect.width || window.innerWidth, rect.height || window.innerHeight);

    threeScene = new THREE.Scene();
    threeCamera = new THREE.PerspectiveCamera(
      42,
      (rect.width || window.innerWidth) / (rect.height || window.innerHeight),
      0.1,
      100
    );
    threeCamera.position.set(0, 1.6, 11.5);

    // 1. 3D Architectural Structural Wireframe Model (Cantilevered Sanctuary + Terraces)
    houseWireframeGroup = new THREE.Group();

    const goldWireMat = new THREE.LineBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.32
    });
    const cyanWireMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28
    });

    // Main double-height glazing pavilion volume
    const mainPavilionGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(5.2, 2.4, 3.2));
    const mainPavilionLines = new THREE.LineSegments(mainPavilionGeo, cyanWireMat);
    mainPavilionLines.position.set(0.2, 0.4, 0);
    houseWireframeGroup.add(mainPavilionLines);

    // Cantilevered upper roof plane
    const roofPlaneGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(6.4, 0.16, 3.8));
    const roofPlaneLines = new THREE.LineSegments(roofPlaneGeo, goldWireMat);
    roofPlaneLines.position.set(0.1, 1.68, 0.1);
    roofPlaneLines.rotation.z = 0.06;
    houseWireframeGroup.add(roofPlaneLines);

    // Left cantilevered wing
    const leftWingGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.8, 1.5, 2.8));
    const leftWingLines = new THREE.LineSegments(leftWingGeo, goldWireMat);
    leftWingLines.position.set(-2.1, -0.05, 0.35);
    houseWireframeGroup.add(leftWingLines);

    // Vertical Stone Chimney Core
    const chimneyGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.85, 3.4, 0.9));
    const chimneyLines = new THREE.LineSegments(chimneyGeo, cyanWireMat);
    chimneyLines.position.set(1.55, 0.9, 0.2);
    houseWireframeGroup.add(chimneyLines);

    // 3 Tiered Basalt Stone Terraces in foreground
    for (let t = 0; t < 3; t++) {
      const terraceGeo = new THREE.EdgesGeometry(
        new THREE.BoxGeometry(5.6 - t * 0.7, 0.22, 1.1)
      );
      const terraceLines = new THREE.LineSegments(terraceGeo, goldWireMat);
      terraceLines.position.set(0.1, -0.95 - t * 0.32, 1.6 + t * 0.85);
      houseWireframeGroup.add(terraceLines);
    }

    houseWireframeGroup.position.set(0, -0.1, 0);
    threeScene.add(houseWireframeGroup);

    // 2. Ambient 3D LiDAR Depth Particles (#D4AF37 & #38BDF8)
    const particleCount = 360;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorGold = new THREE.Color(0xd4af37);
    const colorCyan = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 7;

      const c = i % 2 === 0 ? colorGold : colorCyan;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.65
    });

    lidarParticles = new THREE.Points(particleGeo, particleMat);
    threeScene.add(lidarParticles);

    // 3. 3D Laser Scan Wave Plane
    const waveGeo = new THREE.PlaneGeometry(0.18, 8.5);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.48,
      side: THREE.DoubleSide
    });
    laserWaveMesh = new THREE.Mesh(waveGeo, waveMat);
    threeScene.add(laserWaveMesh);
  }

  function updateThreeJsHeroOverlay(progress, timeMs) {
    if (!threeRenderer || !threeScene || !threeCamera) return;

    // Emphasize 3D structural wireframe most strongly during Stage 2 (0.20 - 0.78)
    const blueprintIntensity = Math.sin(Math.min(1, Math.max(0, progress)) * Math.PI);

    if (houseWireframeGroup) {
      houseWireframeGroup.rotation.y =
        (progress - 0.5) * 0.22 + pointerNormX * 0.08;
      houseWireframeGroup.rotation.x = pointerNormY * 0.04;
      houseWireframeGroup.children.forEach((lineObj, idx) => {
        if (lineObj.material) {
          lineObj.material.opacity =
            0.06 + blueprintIntensity * (idx % 2 === 0 ? 0.36 : 0.28);
        }
      });
    }

    if (lidarParticles) {
      lidarParticles.rotation.y = timeMs * 0.00008 + progress * 0.35;
      lidarParticles.position.y = Math.sin(timeMs * 0.0005) * 0.12;
    }

    if (laserWaveMesh) {
      laserWaveMesh.position.x = (progress - 0.5) * 11.2;
      laserWaveMesh.material.opacity =
        progress > 0.01 && progress < 0.99 ? 0.45 : 0.0;
    }

    threeRenderer.render(threeScene, threeCamera);
  }

  /* =========================================================================
     7. HERO MANUAL SLIDER CONTROLLER (STATIC HEADLINE + 100% DEFAULT REMODEL)
     ========================================================================= */
  const heroScrubRange = document.getElementById('hero-scrub-range');
  const heroScrubFill = document.getElementById('hero-scrub-fill');
  const stageStepBtns = document.querySelectorAll('.stage-step-btn');
  const topNavbar = document.getElementById('top-navbar');

  function applyMobileHeroMode() {
    isMobileViewport = window.innerWidth <= 768;
  }

  function updateNavbarScrollState() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    if (topNavbar) {
      topNavbar.classList.toggle('is-scrolled', scrollY > 24);
    }
  }

  function updateHeroNarrativeStage(progress) {
    let nextStage = 1;
    if (progress >= 0.67) {
      nextStage = 3;
    } else if (progress >= 0.34) {
      nextStage = 2;
    }

    activeStageIndex = nextStage;
    stageStepBtns.forEach((btn, idx) => {
      btn.classList.toggle('is-active', idx + 1 === activeStageIndex);
    });

    if (heroScrubRange && document.activeElement !== heroScrubRange) {
      heroScrubRange.value = String(Math.round(progress * 100));
    }
    if (heroScrubFill) {
      heroScrubFill.style.width = `${(progress * 100).toFixed(1)}%`;
    }
  }

  if (heroScrubRange) {
    heroScrubRange.value = '100';
    heroScrubRange.addEventListener('input', (e) => {
      targetProgress = Math.min(1, Math.max(0, Number(e.target.value) / 100));
    });
  }

  stageStepBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetVal = parseFloat(btn.getAttribute('data-target-progress') || '1');
      targetProgress = Math.min(1, Math.max(0, targetVal));
      if (heroScrubRange) {
        heroScrubRange.value = String(Math.round(targetProgress * 100));
      }
    });
  });

  window.addEventListener('scroll', updateNavbarScrollState, { passive: true });
  window.addEventListener('mousemove', (e) => {
    pointerNormX = (e.clientX / window.innerWidth - 0.5) * 2;
    pointerNormY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* =========================================================================
     8. MAIN REQUESTANIMATIONFRAME LERP ENGINE
     ========================================================================= */
  function animateHeroLoop(timeMs) {
    // Smooth linear interpolation (currentProgress += (targetProgress - currentProgress) * 0.08)
    currentProgress += (targetProgress - currentProgress) * 0.08;
    if (Math.abs(targetProgress - currentProgress) < 0.0004) {
      currentProgress = targetProgress;
    }

    renderHeroTransformationCanvas(currentProgress);
    updateThreeJsHeroOverlay(currentProgress, timeMs || 0);
    updateHeroNarrativeStage(currentProgress);

    requestAnimationFrame(animateHeroLoop);
  }

  /* =========================================================================
     9. LOAD HERO BEFORE & AFTER ASSETS
     ========================================================================= */
  function loadHeroImages() {
    let loadedCount = 0;
    const bImg = new Image();
    const aImg = new Image();

    const onAssetReady = () => {
      loadedCount++;
      if (loadedCount === 2) {
        heroBeforeImg = bImg;
        heroAfterImg = aImg;
        heroImagesLoaded = true;
        buildSynthesizedHeroFrames();
        renderCalculatorVisualizer();
      }
    };

    bImg.onload = onAssetReady;
    aImg.onload = onAssetReady;
    bImg.onerror = () => {};
    aImg.onerror = () => {};

    bImg.src = 'before-remodel.webp';
    aImg.src = 'after-remodel.webp';
  }

  /* =========================================================================
     10. MOBILE NAVIGATION DRAWER
     ========================================================================= */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');

  if (mobileMenuBtn && mobileNavDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', String(!isExpanded));
      mobileNavDrawer.hidden = isExpanded;
    });

    mobileNavDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileNavDrawer.hidden = true;
      });
    });
  }

  /* =========================================================================
     11. SINGLE-CARD AI / PHOTO REMODEL ESTIMATOR
     ========================================================================= */
  const scopePills = document.querySelectorAll('.scope-pill');
  const visionInput = document.getElementById('estimator-vision-input');
  const phoneInput = document.getElementById('estimator-phone-input');
  const photoInput = document.getElementById('property-photo-input');
  const uploadThumbPreview = document.getElementById('upload-thumb-preview');
  const uploadThumbImg = document.getElementById('upload-thumb-img');
  const uploadCameraIcon = document.getElementById('upload-camera-icon');
  const uploadBtnText = document.getElementById('upload-btn-text');
  const estimatorForm = document.getElementById('photo-estimator-form');

  const SCOPE_PROMPTS = {
    'Whole-Home Exterior Modernization':
      'Whole-Home Exterior Modernization — floor-to-ceiling glazing & cedar soffits',
    'Glass & Structural Addition':
      'Glass & Structural Addition — cantilevered black steel great room & view glazing',
    'Outdoor Living & Landscape Overhaul':
      'Outdoor Living & Landscape Overhaul — tiered basalt stone terraces & warm lighting',
    'Luxury Kitchen & Great Room Open-Concept':
      'Luxury Kitchen & Great Room Open-Concept — structural wall removal & quartzite island',
    'Roofline, Siding & Architectural Windows':
      'Roofline, Siding & Architectural Windows — standing-seam metal roof & cedar cladding'
  };

  const SCOPE_ESTIMATES = {
    'Whole-Home Exterior Modernization': {
      range: '$310,000 – $485,000',
      timeline: 'Est. Duration: 14–20 Weeks',
      lift: 'Projected Value Lift: +$640k+'
    },
    'Glass & Structural Addition': {
      range: '$390,000 – $640,000',
      timeline: 'Est. Duration: 18–24 Weeks',
      lift: 'Projected Value Lift: +$880k+'
    },
    'Outdoor Living & Landscape Overhaul': {
      range: '$165,000 – $320,000',
      timeline: 'Est. Duration: 8–14 Weeks',
      lift: 'Projected Value Lift: +$410k+'
    },
    'Luxury Kitchen & Great Room Open-Concept': {
      range: '$235,000 – $410,000',
      timeline: 'Est. Duration: 12–16 Weeks',
      lift: 'Projected Value Lift: +$530k+'
    },
    'Roofline, Siding & Architectural Windows': {
      range: '$185,000 – $340,000',
      timeline: 'Est. Duration: 10–15 Weeks',
      lift: 'Projected Value Lift: +$460k+'
    }
  };

  let selectedScopeName = 'Whole-Home Exterior Modernization';

  function selectEstimatorScope(scopeName, customVisionText, shouldFocus) {
    selectedScopeName = scopeName;
    scopePills.forEach((pill) => {
      const matches = pill.getAttribute('data-scope') === scopeName;
      pill.classList.toggle('is-selected', matches);
    });
    if (visionInput) {
      visionInput.value = customVisionText || SCOPE_PROMPTS[scopeName] || scopeName;
      if (shouldFocus) {
        visionInput.focus();
      }
    }
  }

  scopePills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const scope = pill.getAttribute('data-scope');
      if (scope) {
        selectEstimatorScope(scope, null, true);
      }
    });
  });

  // Silent background photo processing via createImageBitmap
  if (photoInput) {
    photoInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      try {
        if (typeof window.createImageBitmap === 'function') {
          const bitmap = await window.createImageBitmap(file);
          const maxDim = 640;
          const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
          const offCanvas = document.createElement('canvas');
          offCanvas.width = Math.max(1, Math.round(bitmap.width * scale));
          offCanvas.height = Math.max(1, Math.round(bitmap.height * scale));
          const offCtx = offCanvas.getContext('2d');
          offCtx.drawImage(bitmap, 0, 0, offCanvas.width, offCanvas.height);
          const dataUrl = offCanvas.toDataURL('image/jpeg', 0.85);
          if (uploadThumbImg && uploadThumbPreview) {
            uploadThumbImg.src = dataUrl;
            uploadThumbPreview.hidden = false;
          }
          if (uploadCameraIcon) uploadCameraIcon.style.display = 'none';
          if (uploadBtnText) uploadBtnText.textContent = 'Photo Attached';
        }
      } catch (err) {
        if (uploadBtnText) uploadBtnText.textContent = 'Photo Attached';
      }
    });
  }

  const estimateModal = document.getElementById('estimate-result-modal');
  const estimateModalClose = document.getElementById('estimate-modal-close');
  const modalEstRange = document.getElementById('modal-est-range');
  const modalEstTimeline = document.getElementById('modal-est-timeline');
  const modalEstLift = document.getElementById('modal-est-lift');
  const modalSmsStatus = document.getElementById('modal-sms-status');
  const modalEstSub = document.getElementById('estimate-modal-sub');
  const modalBookBtn = document.getElementById('modal-book-walkthrough-btn');

  if (estimatorForm) {
    estimatorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const visionVal = (visionInput && visionInput.value.trim()) || selectedScopeName;
      const phoneVal = (phoneInput && phoneInput.value.trim()) || '(800) 555-0199';
      const estData = SCOPE_ESTIMATES[selectedScopeName] || SCOPE_ESTIMATES['Whole-Home Exterior Modernization'];

      if (modalEstRange) modalEstRange.textContent = estData.range;
      if (modalEstTimeline) modalEstTimeline.textContent = estData.timeline;
      if (modalEstLift) modalEstLift.textContent = estData.lift;
      if (modalEstSub) {
        modalEstSub.textContent = `Prepared for scope: "${visionVal}"`;
      }
      if (modalSmsStatus) {
        modalSmsStatus.textContent = `✓ Instant SMS architectural concept & scope packet dispatched to ${phoneVal}.`;
      }

      if (estimateModal) {
        estimateModal.hidden = false;
        estimateModal.setAttribute('aria-hidden', 'false');
      }

      // Sync new lead into 3-Pane Back-Office Conversation Room
      addNewBackofficeLead({
        name: 'New Photo Estimator Inquiry',
        phone: phoneVal,
        scope: selectedScopeName,
        budget: estData.range,
        lift: estData.lift.replace('Projected Value Lift: ', ''),
        timeline: estData.timeline.replace('Est. Duration: ', ''),
        visionText: visionVal
      });
    });
  }

  function closeEstimateModal() {
    if (!estimateModal) return;
    estimateModal.hidden = true;
    estimateModal.setAttribute('aria-hidden', 'true');
  }

  if (estimateModalClose) {
    estimateModalClose.addEventListener('click', closeEstimateModal);
  }
  if (modalBookBtn) {
    modalBookBtn.addEventListener('click', closeEstimateModal);
  }

  /* =========================================================================
     12. INTERACTIVE BENTO GRID & CAPABILITY LIGHTBOX MODAL
     ========================================================================= */
  const bentoCards = document.querySelectorAll('.bento-card');
  const capabilityLightbox = document.getElementById('capability-lightbox');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxEyebrow = document.getElementById('lightbox-eyebrow');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxSubtitle = document.getElementById('lightbox-subtitle');
  const lightboxBeforeText = document.getElementById('lightbox-before-text');
  const lightboxAfterText = document.getElementById('lightbox-after-text');
  const lightboxTimeline = document.getElementById('lightbox-timeline');
  const lightboxInvestment = document.getElementById('lightbox-investment');
  const lightboxSpecsList = document.getElementById('lightbox-specs-list');
  const lightboxPriceScopeBtn = document.getElementById('lightbox-price-scope-btn');

  let activeCapabilityId = 'reskinning';

  function openCapabilityLightbox(capId) {
    const spec = CAPABILITY_SPECS[capId];
    if (!spec || !capabilityLightbox) return;
    activeCapabilityId = capId;

    if (lightboxEyebrow) lightboxEyebrow.textContent = spec.eyebrow;
    if (lightboxTitle) lightboxTitle.textContent = spec.title;
    if (lightboxSubtitle) lightboxSubtitle.textContent = spec.subtitle;
    if (lightboxBeforeText) lightboxBeforeText.textContent = spec.beforeText;
    if (lightboxAfterText) lightboxAfterText.textContent = spec.afterText;
    if (lightboxTimeline) lightboxTimeline.textContent = spec.timeline;
    if (lightboxInvestment) lightboxInvestment.textContent = spec.investment;

    if (lightboxSpecsList) {
      lightboxSpecsList.innerHTML = '';
      spec.specs.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        lightboxSpecsList.appendChild(li);
      });
    }

    capabilityLightbox.hidden = false;
    capabilityLightbox.setAttribute('aria-hidden', 'false');
  }

  function closeCapabilityLightbox() {
    if (!capabilityLightbox) return;
    capabilityLightbox.hidden = true;
    capabilityLightbox.setAttribute('aria-hidden', 'true');
  }

  bentoCards.forEach((card) => {
    // Cursor-tracking radial glow
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });

    card.addEventListener('click', () => {
      const capId = card.getAttribute('data-capability-id');
      if (capId) openCapabilityLightbox(capId);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const capId = card.getAttribute('data-capability-id');
        if (capId) openCapabilityLightbox(capId);
      }
    });
  });

  document.querySelectorAll('[data-open-capability]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const capId = link.getAttribute('data-open-capability');
      if (capId) openCapabilityLightbox(capId);
    });
  });

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeCapabilityLightbox);
  }

  if (lightboxPriceScopeBtn) {
    lightboxPriceScopeBtn.addEventListener('click', () => {
      const spec = CAPABILITY_SPECS[activeCapabilityId];
      closeCapabilityLightbox();
      const estSection = document.getElementById('photo-estimator');
      if (spec) {
        selectEstimatorScope(spec.estimatorPill, spec.estimatorPrompt, true);
      }
      if (estSection) {
        estSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Backdrop click & Escape key close for all modals
  [capabilityLightbox, estimateModal].forEach((backdrop) => {
    if (!backdrop) return;
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.hidden = true;
        backdrop.setAttribute('aria-hidden', 'true');
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCapabilityLightbox();
      closeEstimateModal();
    }
  });

  /* =========================================================================
     13. BENTO MINI ARCHITECTURAL CANVAS ILLUSTRATIONS
     ========================================================================= */
  function renderBentoCanvases() {
    document.querySelectorAll('.bento-mini-canvas').forEach((canvas) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      const type = canvas.getAttribute('data-bento-art') || 'reskinning';

      // Dark architectural blueprint base
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#070B12');
      bg.addColorStop(1, '#101C2E');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Subtle CAD grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.11)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 28) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (type === 'reskinning') {
        drawProceduralArchitecture(ctx, w, h, 0.62);
      } else if (type === 'glazing-additions') {
        // Cantilevered steel and glass frame diagram
        ctx.fillStyle = 'rgba(245, 176, 65, 0.25)';
        ctx.fillRect(w * 0.18, h * 0.24, w * 0.64, h * 0.56);
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(w * 0.18, h * 0.24, w * 0.64, h * 0.56);
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        for (let m = 0.34; m < 0.8; m += 0.16) {
          ctx.beginPath();
          ctx.moveTo(w * m, h * 0.24);
          ctx.lineTo(w * m, h * 0.80);
          ctx.stroke();
        }
        ctx.fillStyle = '#D4AF37';
        ctx.fillRect(w * 0.12, h * 0.20, w * 0.76, 5);
      } else if (type === 'woodland-landscape') {
        // Tiered stone terraces & warm step lighting
        for (let t = 0; t < 4; t++) {
          const ty = h * (0.28 + t * 0.16);
          const tw = w * (0.50 + t * 0.10);
          const tx = (w - tw) * 0.5;
          ctx.fillStyle = '#1E293B';
          ctx.fillRect(tx, ty, tw, h * 0.12);
          ctx.strokeStyle = 'rgba(255,255,255,0.22)';
          ctx.strokeRect(tx, ty, tw, h * 0.12);
          ctx.fillStyle = '#D4AF37';
          ctx.fillRect(tx + tw * 0.2, ty + 2, tw * 0.6, 3);
        }
      } else if (type === 'kitchen-greatroom') {
        // Waterfall island & glass wall perspective
        ctx.strokeStyle = '#38BDF8';
        ctx.strokeRect(w * 0.12, h * 0.16, w * 0.76, h * 0.64);
        ctx.fillStyle = 'rgba(212, 175, 55, 0.22)';
        ctx.fillRect(w * 0.26, h * 0.52, w * 0.48, h * 0.24);
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2;
        ctx.strokeRect(w * 0.26, h * 0.52, w * 0.48, h * 0.24);
      } else if (type === 'roofline-engineering') {
        // Knife-edge cantilevered roofline profile
        ctx.beginPath();
        ctx.moveTo(w * 0.08, h * 0.62);
        ctx.lineTo(w * 0.58, h * 0.24);
        ctx.lineTo(w * 0.92, h * 0.44);
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.2;
        for (let r = 0.16; r <= 0.84; r += 0.08) {
          ctx.beginPath();
          ctx.moveTo(w * r, h * 0.35);
          ctx.lineTo(w * r, h * 0.78);
          ctx.stroke();
        }
      } else {
        // 3D Digital Twin LiDAR point-cloud matrix
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(w * 0.24, h * 0.25, w * 0.52, h * 0.50);
        ctx.fillStyle = '#D4AF37';
        for (let px = 0.2; px <= 0.8; px += 0.075) {
          for (let py = 0.2; py <= 0.8; py += 0.14) {
            ctx.beginPath();
            ctx.arc(w * px, h * py, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    });
  }

  /* =========================================================================
     14. INTERACTIVE REMODEL VALUE & EQUITY CALCULATOR + VISUALIZER
     ========================================================================= */
  const sqftSlider = document.getElementById('calc-sqft-slider');
  const sqftDisplay = document.getElementById('calc-sqft-display');
  const tierBtns = document.querySelectorAll('.calc-tier-btn');
  const gradeBtns = document.querySelectorAll('.calc-grade-btn');
  const calcInvestmentRange = document.getElementById('calc-investment-range');
  const calcEquityLift = document.getElementById('calc-equity-lift');
  const calcRoiBadge = document.getElementById('calc-roi-badge');
  const calcTimelineWeeks = document.getElementById('calc-timeline-weeks');
  const calcTimelineBreakdown = document.getElementById('calc-timeline-breakdown');
  const calcDeliverablesList = document.getElementById('calc-deliverables-list');
  const calcScrubCanvas = document.getElementById('calc-scrub-canvas');
  const calcScrubSlider = document.getElementById('calc-scrub-slider');
  const calcVizPctLabel = document.getElementById('calc-viz-pct-label');
  const calcLockEvalBtn = document.getElementById('calc-lock-eval-btn');

  let calcState = {
    sqft: 3600,
    tier: 'structural-addition',
    grade: 'organic-woodland',
    scrubPct: 68
  };

  const TIER_CONFIG = {
    'curb-appeal': {
      baseRatePerSqft: 82,
      roiMultiplier: 1.42,
      minWeeks: 12,
      maxWeeks: 16,
      engWeeks: 3,
      buildWeeks: 11,
      vaultOption: 'Whole-Home Architectural Re-Skinning & Modernization',
      deliverables: [
        'Full 3D LiDAR exterior envelope scan & twilight architectural renderings',
        'Architectural siding, thermal window package & knife-edge roofline upgrade',
        'Entryway stone terrace & warm 2700K architectural soffit illumination',
        'Guaranteed Fixed-Price Milestone Schedule with 10-Year Structural Warranty'
      ]
    },
    'structural-addition': {
      baseRatePerSqft: 142,
      roiMultiplier: 1.51,
      minWeeks: 18,
      maxWeeks: 22,
      engWeeks: 4,
      buildWeeks: 16,
      vaultOption: 'Structural Steel & Floor-to-Ceiling Glass Addition',
      deliverables: [
        'Millimeter-accurate 3D LiDAR property scan & digital twin walkthrough',
        'Cantilevered structural steel framing & thermal curtain-wall glazing',
        'Clear western red cedar soffits & tiered basalt terrace stonework',
        'Guaranteed Fixed-Price Milestone Schedule with zero unapproved change orders'
      ]
    },
    'full-estate': {
      baseRatePerSqft: 225,
      roiMultiplier: 1.58,
      minWeeks: 24,
      maxWeeks: 32,
      engWeeks: 5,
      buildWeeks: 23,
      vaultOption: 'Full Estate Down-to-Studs Transformation',
      deliverables: [
        'Complete down-to-studs structural re-engineering & cantilevered glass wing additions',
        "Chef's kitchen, primary suite sanctuary & whole-home acoustic/thermal rebuild",
        'Full woodland lot clearing, tiered basalt terraces & covered outdoor fireplace pavilion',
        'Dedicated Master Superintendent & binding Fixed-Price Turnkey Guarantee'
      ]
    }
  };

  const GRADE_MULTIPLIER = {
    'architectural-modern': 0.88,
    'organic-woodland': 1.0,
    'ultra-custom': 1.24
  };

  function formatCurrency(val) {
    const rounded = Math.round(val / 5000) * 5000;
    return '$' + rounded.toLocaleString('en-US');
  }

  function updateCalculatorReadout() {
    const tierInfo = TIER_CONFIG[calcState.tier] || TIER_CONFIG['structural-addition'];
    const gradeMult = GRADE_MULTIPLIER[calcState.grade] || 1.0;

    // Non-linear scale factor for larger estates
    const effectiveSqft = Math.pow(calcState.sqft / 3200, 0.82) * 3200;
    const midCost = effectiveSqft * tierInfo.baseRatePerSqft * gradeMult;
    const lowCost = midCost * 0.91;
    const highCost = midCost * 1.12;

    const lowLift = lowCost * tierInfo.roiMultiplier;
    const highLift = highCost * tierInfo.roiMultiplier;
    const retentionPct = Math.round(tierInfo.roiMultiplier * 100);

    if (sqftDisplay) {
      sqftDisplay.textContent =
        calcState.sqft >= 7500
          ? '7,500+ sq ft'
          : `${calcState.sqft.toLocaleString('en-US')} sq ft`;
    }
    if (calcInvestmentRange) {
      calcInvestmentRange.textContent = `${formatCurrency(lowCost)} – ${formatCurrency(highCost)}`;
    }
    if (calcEquityLift) {
      calcEquityLift.textContent = `+${formatCurrency(lowLift)} – ${formatCurrency(highLift)}`;
    }
    if (calcRoiBadge) {
      calcRoiBadge.textContent = `Est. ${retentionPct}% Value Retention & Neighborhood Equity Lift`;
    }

    const sizeWeekAdd = Math.round((calcState.sqft - 3000) / 1400);
    const wMin = Math.max(8, tierInfo.minWeeks + sizeWeekAdd);
    const wMax = Math.max(wMin + 3, tierInfo.maxWeeks + sizeWeekAdd);

    if (calcTimelineWeeks) {
      calcTimelineWeeks.textContent = `${wMin} – ${wMax} Weeks`;
    }
    if (calcTimelineBreakdown) {
      calcTimelineBreakdown.textContent = `${tierInfo.engWeeks} wks 3D Engineering • ${wMin - tierInfo.engWeeks}–${wMax - tierInfo.engWeeks} wks Protected Site Build`;
    }

    if (calcDeliverablesList) {
      calcDeliverablesList.innerHTML = '';
      tierInfo.deliverables.forEach((d) => {
        const li = document.createElement('li');
        li.textContent = d;
        calcDeliverablesList.appendChild(li);
      });
    }

    renderCalculatorVisualizer();
  }

  function renderCalculatorVisualizer() {
    if (!calcScrubCanvas) return;
    const ctx = calcScrubCanvas.getContext('2d');
    if (!ctx) return;
    const w = calcScrubCanvas.width;
    const h = calcScrubCanvas.height;
    const progress = calcState.scrubPct / 100;

    ctx.clearRect(0, 0, w, h);

    if (heroImagesLoaded && heroBeforeImg && heroAfterImg) {
      drawCoverImage(ctx, heroBeforeImg, w, h);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w * progress, h);
      ctx.clip();
      drawCoverImage(ctx, heroAfterImg, w, h);
      ctx.restore();
    } else {
      drawProceduralArchitecture(ctx, w, h, progress);
    }

    // Divider line
    const sx = w * progress;
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, h);
    ctx.stroke();

    // Handle circle
    ctx.fillStyle = '#07090E';
    ctx.beginPath();
    ctx.arc(sx, h * 0.5, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  if (sqftSlider) {
    sqftSlider.addEventListener('input', (e) => {
      calcState.sqft = Number(e.target.value);
      updateCalculatorReadout();
    });
  }

  tierBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tier = btn.getAttribute('data-tier');
      if (!tier) return;
      calcState.tier = tier;
      tierBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-checked', String(active));
      });
      updateCalculatorReadout();
    });
  });

  gradeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const grade = btn.getAttribute('data-grade');
      if (!grade) return;
      calcState.grade = grade;
      gradeBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-checked', String(active));
      });
      updateCalculatorReadout();
    });
  });

  if (calcScrubSlider) {
    calcScrubSlider.addEventListener('input', (e) => {
      calcState.scrubPct = Number(e.target.value);
      if (calcVizPctLabel) {
        calcVizPctLabel.textContent = `${calcState.scrubPct}% Transformed`;
      }
      renderCalculatorVisualizer();
    });
  }

  if (calcLockEvalBtn) {
    calcLockEvalBtn.addEventListener('click', () => {
      const vaultSection = document.getElementById('consultation-vault');
      const vaultScopeSelect = document.getElementById('vault-scope');
      const tierInfo = TIER_CONFIG[calcState.tier];
      if (vaultScopeSelect && tierInfo) {
        vaultScopeSelect.value = tierInfo.vaultOption;
      }
      if (vaultSection) {
        vaultSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  /* =========================================================================
     15. HYPER-LOCAL CASE STUDY BEFORE/AFTER SLIDER CARDS
     ========================================================================= */
  const CASE_ASSETS = {
    'cedar-creek': {
      beforeSrc: 'assets/before-remodel.webp',
      afterSrc: 'assets/after-remodel.webp',
      beforeImg: null,
      afterImg: null,
      loaded: false,
      pct: 50
    },
    'timberline-ridge': {
      beforeSrc: 'assets/timberline-before.webp',
      afterSrc: 'assets/timberline-after.webp',
      beforeImg: null,
      afterImg: null,
      loaded: false,
      pct: 50
    },
    'westlake-mcm': {
      beforeSrc: 'assets/westlake-before.webp',
      afterSrc: 'assets/westlake-after.webp',
      beforeImg: null,
      afterImg: null,
      loaded: false,
      pct: 50
    }
  };

  function renderCaseStudyCanvas(caseId) {
    const canvas = document.querySelector(`.case-comparison-canvas[data-case-id="${caseId}"]`);
    const asset = CASE_ASSETS[caseId];
    if (!canvas || !asset) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const progress = asset.pct / 100;

    ctx.clearRect(0, 0, w, h);

    if (asset.loaded && asset.beforeImg && asset.afterImg) {
      // Draw After on full canvas, then clip Before to left side [0..w*progress] matching left BEFORE / right AFTER tags
      drawCoverImage(ctx, asset.afterImg, w, h);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w * progress, h);
      ctx.clip();
      drawCoverImage(ctx, asset.beforeImg, w, h);
      ctx.restore();
    } else {
      drawProceduralArchitecture(ctx, w, h, progress);
    }
  }

  function initCaseStudySliders() {
    Object.keys(CASE_ASSETS).forEach((caseId) => {
      const cfg = CASE_ASSETS[caseId];
      const bImg = new Image();
      const aImg = new Image();
      let count = 0;

      const checkDone = () => {
        count++;
        if (count === 2) {
          cfg.beforeImg = bImg;
          cfg.afterImg = aImg;
          cfg.loaded = true;
          renderCaseStudyCanvas(caseId);
        }
      };

      bImg.onload = checkDone;
      aImg.onload = checkDone;
      bImg.src = cfg.beforeSrc;
      aImg.src = cfg.afterSrc;

      renderCaseStudyCanvas(caseId);
    });

    document.querySelectorAll('.case-slider-viewport').forEach((viewport) => {
      const caseId = viewport.getAttribute('data-case-slider');
      const rangeInput = viewport.querySelector('.case-range-input');
      const handleLine = viewport.querySelector('.case-handle-line');
      if (!caseId || !rangeInput) return;

      rangeInput.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        if (CASE_ASSETS[caseId]) {
          CASE_ASSETS[caseId].pct = val;
        }
        if (handleLine) {
          handleLine.style.left = `${val}%`;
        }
        renderCaseStudyCanvas(caseId);
      });
    });
  }

  /* =========================================================================
     16. CONVERSION VAULT FORM SUBMISSION
     ========================================================================= */
  const vaultBookingForm = document.getElementById('vault-booking-form');
  const vaultBookingFeedback = document.getElementById('vault-booking-feedback');

  if (vaultBookingForm) {
    vaultBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('vault-name');
      const phoneInputEl = document.getElementById('vault-phone');
      const scopeSelect = document.getElementById('vault-scope');

      const clientName = (nameInput && nameInput.value.trim()) || 'Homeowner';
      const clientPhone = (phoneInputEl && phoneInputEl.value.trim()) || 'your mobile';
      const selectedScope = (scopeSelect && scopeSelect.value) || '3D Property Evaluation';

      if (vaultBookingFeedback) {
        vaultBookingFeedback.hidden = false;
        vaultBookingFeedback.textContent = `✓ Thank you, ${clientName}. Our Principal Architect’s studio has reserved your 3D LiDAR Site Evaluation for "${selectedScope}" and dispatched confirmation details to ${clientPhone}.`;
      }

      addNewBackofficeLead({
        name: clientName,
        phone: clientPhone,
        scope: selectedScope,
        budget: '$480,000 – $650,000',
        lift: '+$820k+',
        timeline: '16–22 Weeks',
        visionText: `Requested Principal 3D Property Evaluation for ${selectedScope}`
      });
    });
  }

  /* =========================================================================
     17. PILLAR 2: 3-PANE UNIFIED ARCHITECTURAL BACK-OFFICE CONVERSATION ROOM
     ========================================================================= */
  const boThreads = [
    {
      id: 'vance-cedar',
      name: 'Harrison & Elena Vance',
      phone: '(425) 891-4420',
      location: 'Cedar Creek / Bellevue, WA',
      program: 'Whole-Home Re-Skin + Steel Wing',
      budget: '$540,000 – $680,000',
      lift: '+$890,000 Equity Lift',
      timeline: '18 – 22 Weeks',
      sqft: '4,100 sq ft · Woodland Lot',
      grade: 'Organic Woodland Luxury',
      architect: 'Julian Vance, AIA',
      status: 'Draft',
      badgeLabel: 'Needs Approval',
      timeAgo: '2m ago',
      draftText:
        'Hi Harrison & Elena! We analyzed your Cedar Creek exterior photo. Re-skinning in clear vertical-grain western red cedar with a cantilevered W12 steel & low-iron glass great room falls in the $540k–$680k turnkey tier (18–22 wks). Would you like Julian Vance, AIA out this Thursday at 2:00 PM for your complimentary 3D LiDAR site scan?',
      messages: [
        {
          sender: 'homeowner',
          meta: 'Harrison & Elena Vance · SMS + Photo Upload · 10:14 AM',
          text: 'We love our forested lot in Cedar Creek, but the 1974 cedar cabin is dark and weathered. We want to open the rear wall with black structural steel, floor-to-ceiling glass, and tiered basalt stone terraces.',
          attachment: '📷 Attached: cedar-creek-exterior-lot.webp (LiDAR Pre-Check Ready)'
        },
        {
          sender: 'ai-reply',
          meta: 'Alfred AI Architect Co-Pilot · Instant Ballpark · 10:14 AM',
          text: 'Welcome to Aether, Harrison & Elena! Based on your 4,100 sq ft woodland footprint, a Structural Steel + Low-Iron Curtain Wall addition paired with Clear Western Red Cedar re-skinning and tiered basalt terraces models at $540,000 – $680,000 turnkey (projected +$890k post-remodel appraisal lift).'
        },
        {
          sender: 'homeowner',
          meta: 'Harrison & Elena Vance · SMS · 10:16 AM',
          text: 'That aligns with our budget. How soon can your structural engineer and architect scan the slope and trees so we get a fixed-price milestone contract?'
        }
      ]
    },
    {
      id: 'thorne-timberline',
      name: 'Dr. Marcus & Claire Thorne',
      phone: '(206) 742-8810',
      location: 'Timberline Ridge / Issaquah, WA',
      program: 'Cantilevered Glass Great Room',
      budget: '$420,000 – $560,000',
      lift: '+$780,000 Equity Lift',
      timeline: '18 – 22 Weeks',
      sqft: '3,850 sq ft · Ridge Slope',
      grade: 'Ultra-Custom Glass & Steel',
      architect: 'Julian Vance, AIA',
      status: 'AI',
      badgeLabel: 'AI Active',
      timeAgo: '14m ago',
      draftText:
        'Dr. Thorne, our in-house structural engineering team uses micropile grade beams and cantilevered W12 steel moment frames so zero bulky corner posts obstruct your ridge panorama. Shall I lock in Friday at 11:30 AM for an on-site laser scan?',
      messages: [
        {
          sender: 'homeowner',
          meta: 'Dr. Marcus Thorne · Web Concierge · 9:58 AM',
          text: 'Our 1986 hillside home has an aging timber deck overlooking the valley. Can we replace it with a two-story cantilevered glass and black steel addition without massive corner columns blocking the view?'
        },
        {
          sender: 'ai-reply',
          meta: 'Alfred AI Architect Co-Pilot · Structural Brief · 9:58 AM',
          text: 'Absolutely. We engineer cantilevered W-section steel moment frames in-house with zero-post mitered low-iron glass corners and standing-seam black metal rooflines. Typical turnkey investment is $420k–$560k over 18–22 weeks.'
        }
      ]
    },
    {
      id: 'kapoor-westlake',
      name: 'Julian & Priya Kapoor',
      phone: '(425) 319-6044',
      location: 'Westlake Reserve / Lake Oswego',
      program: 'Standing-Seam Roof & Courtyard',
      budget: '$295,000 – $385,000',
      lift: '+$510,000 Equity Lift',
      timeline: '14 – 16 Weeks',
      sqft: '3,200 sq ft · Estate Lot',
      grade: 'Organic Woodland Luxury',
      architect: 'Elena Rostova, AIA',
      status: 'Booked',
      badgeLabel: '3D Scan Booked',
      timeAgo: '41m ago',
      draftText:
        'Looking forward to Thursday at 10:00 AM! Our terrestrial LiDAR scanner will map the entire 1964 ranch roofline and oak canopy in under 90 minutes.',
      messages: [
        {
          sender: 'homeowner',
          meta: 'Priya Kapoor · SMS · 9:15 AM',
          text: 'We want to transform our 1964 single-story ranch into a warm mid-century pavilion with standing-seam black metal roofing, horizontal cedar cladding, and a bluestone courtyard.'
        },
        {
          sender: 'architect-reply',
          meta: 'Principal Architect Julian Vance, AIA · 9:22 AM',
          text: '✓ Cal.com 3D LiDAR Site Scan & Feasibility Walkthrough confirmed for Thursday · 10:00 AM PST. We will bring physical samples of clear vertical-grain cedar and flamed bluestone.'
        }
      ]
    },
    {
      id: 'sterling-mercer',
      name: 'Victoria Sterling',
      phone: '(206) 904-1182',
      location: 'Mercer Island Woodlands, WA',
      program: 'Woodland Landscape & Basalt Tiers',
      budget: '$185,000 – $275,000',
      lift: '+$390,000 Equity Lift',
      timeline: '10 – 14 Weeks',
      sqft: '4,800 sq ft · Wooded Slope',
      grade: 'Organic Woodland Luxury',
      architect: 'Elena Rostova, AIA',
      status: 'AI',
      badgeLabel: 'AI Active',
      timeAgo: '1h ago',
      draftText:
        'Hi Victoria! Every basalt terrace includes concealed slot drainage and 2700K marine-grade recessed LED step illumination. Would tomorrow at 10:00 AM work for a site walk?',
      messages: [
        {
          sender: 'homeowner',
          meta: 'Victoria Sterling · SMS · 8:45 AM',
          text: 'Our lower woodland slope is completely overgrown with ferns and brush. We want tiered basalt stone terraces, an outdoor fireplace pavilion, and recessed step lighting.'
        },
        {
          sender: 'ai-reply',
          meta: 'Alfred AI Architect Co-Pilot · 8:45 AM',
          text: 'We specialize in woodland terrain reclamation—replacing overgrown brush with laser-graded basalt retaining tiers, cantilevered stone steps, and covered cedar hearth pavilions ($185k–$275k turnkey).'
        }
      ]
    }
  ];

  let selectedBoThreadId = 'vance-cedar';
  let activeBoFilter = 'all';

  const boThreadListEl = document.getElementById('boThreadList');
  const boThreadCountEl = document.getElementById('boThreadCount');
  const boMobileThreadCountEl = document.getElementById('boMobileThreadCount');
  const navBoCountEl = document.getElementById('navBoCount');
  const boCurrentNameEl = document.getElementById('boCurrentName');
  const boCurrentSubEl = document.getElementById('boCurrentSub');
  const boMessagesListEl = document.getElementById('boMessagesList');
  const boDraftTextEl = document.getElementById('boDraftText');
  const boAiDraftBannerEl = document.getElementById('boAiDraftBanner');
  const boApproveDraftBtn = document.getElementById('boApproveDraftBtn');
  const boEditDraftBtn = document.getElementById('boEditDraftBtn');
  const boComposerForm = document.getElementById('boComposerForm');
  const boComposerInput = document.getElementById('boComposerInput');

  const boSumScopeEl = document.getElementById('boSumScope');
  const boSumBudgetEl = document.getElementById('boSumBudget');
  const boSumLiftEl = document.getElementById('boSumLift');
  const boSumTimelineEl = document.getElementById('boSumTimeline');
  const boSumSqftEl = document.getElementById('boSumSqft');
  const boSumGradeEl = document.getElementById('boSumGrade');
  const boSumLocationEl = document.getElementById('boSumLocation');
  const boSumArchitectEl = document.getElementById('boSumArchitect');

  const crossPillarToast = document.getElementById('crossPillarToast');
  const closeToastBtn = document.getElementById('closeToastBtn');
  const toastTitleEl = document.getElementById('toastTitle');
  const toastMessageEl = document.getElementById('toastMessage');

  function getSelectedThread() {
    return boThreads.find((t) => t.id === selectedBoThreadId) || boThreads[0];
  }

  function renderBoThreadList() {
    if (!boThreadListEl) return;
    boThreadListEl.innerHTML = '';

    const visibleThreads = boThreads.filter((t) => {
      if (activeBoFilter === 'all') return true;
      return t.status === activeBoFilter;
    });

    visibleThreads.forEach((thread) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `bo-thread-item${thread.id === selectedBoThreadId ? ' is-selected' : ''}`;
      const badgeClass =
        thread.status === 'Booked' ? 'booked' : thread.status === 'Draft' ? 'draft' : 'ai';
      const lastMsg = thread.messages[thread.messages.length - 1];

      btn.innerHTML = `
        <div class="bo-thread-top">
          <span class="bo-thread-name">${thread.name}</span>
          <span class="bo-thread-time">${thread.timeAgo}</span>
        </div>
        <div class="bo-thread-program">${thread.program} · ${thread.budget}</div>
        <div class="bo-thread-preview">${lastMsg ? lastMsg.text : ''}</div>
        <div class="bo-thread-badges">
          <span class="bo-badge ${badgeClass}">${thread.badgeLabel}</span>
          <span class="bo-badge ai">${thread.location.split('/')[0].trim()}</span>
        </div>
      `;

      btn.addEventListener('click', () => {
        selectedBoThreadId = thread.id;
        renderBoThreadList();
        renderBoActiveThread();
        if (window.innerWidth <= 860) {
          switchBoMobilePane('timeline');
        }
      });

      boThreadListEl.appendChild(btn);
    });

    const totalCount = String(boThreads.length);
    if (boThreadCountEl) boThreadCountEl.textContent = totalCount;
    if (boMobileThreadCountEl) boMobileThreadCountEl.textContent = totalCount;
    if (navBoCountEl) navBoCountEl.textContent = totalCount;
  }

  function renderBoActiveThread() {
    const thread = getSelectedThread();
    if (!thread) return;

    if (boCurrentNameEl) boCurrentNameEl.textContent = thread.name;
    if (boCurrentSubEl) {
      boCurrentSubEl.textContent = `${thread.phone} · ${thread.program} · ${thread.location}`;
    }

    if (boMessagesListEl) {
      boMessagesListEl.innerHTML = '';
      thread.messages.forEach((m) => {
        const div = document.createElement('div');
        div.className = `bo-msg ${m.sender}`;
        const metaEl = document.createElement('div');
        metaEl.className = 'bo-msg-meta';
        metaEl.textContent = m.meta;
        const bodyEl = document.createElement('div');
        bodyEl.textContent = m.text;
        div.appendChild(metaEl);
        div.appendChild(bodyEl);

        if (m.attachment) {
          const attEl = document.createElement('div');
          attEl.className = 'bo-photo-attachment';
          attEl.textContent = m.attachment;
          div.appendChild(attEl);
        }
        boMessagesListEl.appendChild(div);
      });
      boMessagesListEl.scrollTop = boMessagesListEl.scrollHeight;
    }

    if (boDraftTextEl) {
      boDraftTextEl.textContent = `"${thread.draftText}"`;
    }
    if (boAiDraftBannerEl) {
      boAiDraftBannerEl.style.display = thread.draftText ? 'flex' : 'none';
    }

    if (boSumScopeEl) boSumScopeEl.textContent = thread.program;
    if (boSumBudgetEl) boSumBudgetEl.textContent = thread.budget;
    if (boSumLiftEl) boSumLiftEl.textContent = thread.lift;
    if (boSumTimelineEl) boSumTimelineEl.textContent = thread.timeline;
    if (boSumSqftEl) boSumSqftEl.textContent = thread.sqft;
    if (boSumGradeEl) boSumGradeEl.textContent = thread.grade;
    if (boSumLocationEl) boSumLocationEl.textContent = thread.location;
    if (boSumArchitectEl) boSumArchitectEl.textContent = thread.architect;
  }

  function addNewBackofficeLead(lead) {
    const newId = 'lead-' + Date.now();
    const newThread = {
      id: newId,
      name: lead.name || 'New Estate Inquiry',
      phone: lead.phone || '(425) 555-0199',
      location: 'Bellevue / Pacific NW Enclave',
      program: lead.scope || 'Whole-Home Exterior Modernization',
      budget: lead.budget || '$390,000 – $580,000',
      lift: lead.lift || '+$720,000 Equity Lift',
      timeline: lead.timeline || '16 – 20 Weeks',
      sqft: `${calcState.sqft.toLocaleString('en-US')} sq ft · Custom Site`,
      grade: 'Organic Woodland Luxury',
      architect: 'Julian Vance, AIA',
      status: 'Draft',
      badgeLabel: 'Needs Approval',
      timeAgo: 'Just now',
      draftText: `Hi ${lead.name}! I reviewed your "${lead.scope}" inquiry (${lead.budget} turnkey ballpark). Can we bring our 3D LiDAR scanner out this Thursday at 2:00 PM for your complimentary feasibility study?`,
      messages: [
        {
          sender: 'homeowner',
          meta: `${lead.name} · Instant Estimator · Just now`,
          text: lead.visionText || lead.scope,
          attachment: '📷 Property Scope & Ballpark Queued for 3D LiDAR Scan'
        },
        {
          sender: 'ai-reply',
          meta: 'Alfred AI Architect Co-Pilot · Instant SMS Dispatched · Just now',
          text: `Prepared preliminary turnkey range of ${lead.budget} (${lead.timeline}) with projected ${lead.lift} neighborhood value lift.`
        }
      ]
    };

    boThreads.unshift(newThread);
    selectedBoThreadId = newId;
    renderBoThreadList();
    renderBoActiveThread();

    if (toastTitleEl) {
      toastTitleEl.textContent = `Lead Synced → 3-Pane Back-Office (${lead.scope})`;
    }
    if (toastMessageEl) {
      toastMessageEl.textContent = `Added ${lead.name} (${lead.budget}) to Principal Architect queue.`;
    }
    if (crossPillarToast) {
      crossPillarToast.hidden = false;
    }
  }

  function openBackofficeRoom() {
    closeCapabilityLightbox();
    closeEstimateModal();
    if (crossPillarToast) crossPillarToast.hidden = true;
    if (mobileNavDrawer) mobileNavDrawer.hidden = true;
    document.body.classList.add('backoffice-active');
    window.scrollTo(0, 0);
    renderBoThreadList();
    renderBoActiveThread();
  }

  function closeBackofficeRoom() {
    document.body.classList.remove('backoffice-active');
    window.scrollTo(0, 0);
    handleResize();
  }

  function switchBoMobilePane(paneName) {
    const panes = {
      queue: document.getElementById('boPaneQueue'),
      timeline: document.getElementById('boPaneTimeline'),
      summary: document.getElementById('boPaneSummary')
    };
    Object.keys(panes).forEach((key) => {
      if (panes[key]) {
        panes[key].classList.toggle('mobile-pane-active', key === paneName);
      }
    });
    document.querySelectorAll('.bo-mobile-tab').forEach((tab) => {
      const matches = tab.getAttribute('data-bo-mobile-pane') === paneName;
      tab.classList.toggle('is-active', matches);
    });
  }

  function initBackofficeRoom() {
    document.querySelectorAll('[data-open-backoffice]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openBackofficeRoom();
      });
    });

    const closeBoBtn = document.getElementById('closeBackofficeBtn');
    if (closeBoBtn) {
      closeBoBtn.addEventListener('click', closeBackofficeRoom);
    }

    if (closeToastBtn && crossPillarToast) {
      closeToastBtn.addEventListener('click', () => {
        crossPillarToast.hidden = true;
      });
    }

    // Mobile 3-pane switcher tabs
    document.querySelectorAll('.bo-mobile-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const pane = tab.getAttribute('data-bo-mobile-pane');
        if (pane) switchBoMobilePane(pane);
      });
    });

    // Thread filter pills
    document.querySelectorAll('.bo-filter-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        activeBoFilter = pill.getAttribute('data-bo-filter') || 'all';
        document.querySelectorAll('.bo-filter-pill').forEach((p) => {
          p.classList.toggle('is-active', p === pill);
        });
        renderBoThreadList();
      });
    });

    // Lead routing toggle (Phase 1 vs Phase 2)
    const routingLabel = document.getElementById('boActiveRoutingLabel');
    document.querySelectorAll('.bo-route-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bo-route-btn').forEach((b) => {
          b.classList.toggle('is-active', b === btn);
        });
        const mode = btn.getAttribute('data-route-mode');
        if (routingLabel) {
          routingLabel.textContent =
            mode === 'client'
              ? 'Phase 2 · Aether Principal Architect Desk'
              : 'Phase 1 · My Accounts (Tiberius)';
        }
      });
    });

    // Co-Pilot mode buttons
    document.querySelectorAll('.bo-copilot-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bo-copilot-btn').forEach((b) => {
          b.classList.toggle('is-active', b === btn);
        });
      });
    });

    // Approve AI Draft button
    if (boApproveDraftBtn) {
      boApproveDraftBtn.addEventListener('click', () => {
        const thread = getSelectedThread();
        if (!thread || !thread.draftText) return;
        thread.messages.push({
          sender: 'architect-reply',
          meta: `Principal Architect ${thread.architect} · Approved AI SMS · Just now`,
          text: thread.draftText
        });
        thread.draftText = '';
        thread.status = 'AI';
        thread.badgeLabel = 'AI Active';
        renderBoThreadList();
        renderBoActiveThread();
      });
    }

    // Edit AI Draft in composer
    if (boEditDraftBtn && boComposerInput) {
      boEditDraftBtn.addEventListener('click', () => {
        const thread = getSelectedThread();
        if (!thread) return;
        boComposerInput.value = thread.draftText || '';
        boComposerInput.focus();
      });
    }

    // Live Reply Composer
    if (boComposerForm && boComposerInput) {
      boComposerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = boComposerInput.value.trim();
        if (!text) return;
        const thread = getSelectedThread();
        if (!thread) return;

        thread.messages.push({
          sender: 'architect-reply',
          meta: `Principal Architect ${thread.architect} · Direct SMS · Just now`,
          text
        });
        boComposerInput.value = '';
        renderBoThreadList();
        renderBoActiveThread();
      });
    }

    // 1-Click Cal.com 3D LiDAR Scan Slot Dispatch
    document.querySelectorAll('[data-book-slot]').forEach((slotBtn) => {
      slotBtn.addEventListener('click', () => {
        const slotName = slotBtn.getAttribute('data-book-slot');
        const thread = getSelectedThread();
        if (!thread || !slotName) return;

        thread.messages.push({
          sender: 'architect-reply',
          meta: `Cal.com 3D LiDAR Dispatch · ${thread.architect} · Just now`,
          text: `📅 Confirmed: ${slotName} for ${thread.name} at ${thread.location}. Terrestrial LiDAR scanner & material sample kit reserved.`
        });
        thread.status = 'Booked';
        thread.badgeLabel = '3D Scan Booked';
        renderBoThreadList();
        renderBoActiveThread();

        if (window.innerWidth <= 860) {
          switchBoMobilePane('timeline');
        }
      });
    });

    renderBoThreadList();
    renderBoActiveThread();

    // Auto-open Back-Office if URL contains ?view=backoffice or #backoffice
    if (
      window.location.search.includes('view=backoffice') ||
      window.location.hash === '#backoffice'
    ) {
      openBackofficeRoom();
    }
  }

  /* =========================================================================
     17. INITIALIZATION & RESIZE HANDLERS
     ========================================================================= */
  function handleResize() {
    applyMobileHeroMode();
    resizeHeroCanvas();

    if (threeRenderer && threeCamera) {
      const webglCanvas = document.getElementById('hero-webgl-canvas');
      if (webglCanvas && webglCanvas.parentElement) {
        const rect = webglCanvas.parentElement.getBoundingClientRect();
        threeRenderer.setSize(rect.width, rect.height);
        threeCamera.aspect = rect.width / Math.max(1, rect.height);
        threeCamera.updateProjectionMatrix();
      }
    }

    updateNavbarScrollState();
    renderHeroTransformationCanvas(currentProgress);
  }

  window.addEventListener('resize', handleResize);

  // Boot sequence
  applyMobileHeroMode();
  resizeHeroCanvas();
  buildSynthesizedHeroFrames();
  initThreeJsHeroOverlay();
  loadHeroImages();
  renderBentoCanvases();
  updateCalculatorReadout();
  initCaseStudySliders();
  initBackofficeRoom();
  updateNavbarScrollState();
  requestAnimationFrame(animateHeroLoop);
})();
