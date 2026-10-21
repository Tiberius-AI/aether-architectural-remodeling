const MOBILE_SCROLL_SCRUB = false; // Set to true to enable damped scroll-scrubbing on viewports <= 768px

(function () {
  'use strict';

  /* =========================================================================
     1. STATE & CONFIGURATION (DAYLIGHT SUBURBAN EDITION)
     ========================================================================= */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isMobileViewport = window.innerWidth <= 768;

  let targetProgress = 0;
  let currentProgress = 0;
  let inspectionMode = 'scroll'; // 'scroll' | 'manual'
  let activeStageIndex = 1;
  let pointerNormX = 0;
  let pointerNormY = 0;

  const TOTAL_SYNTH_FRAMES = 60;
  const heroFrames = [];
  let heroBeforeImg = null;
  let heroAfterImg = null;
  let heroImagesLoaded = false;

  /* =========================================================================
     2. SUBURBAN CAPABILITY LIGHTBOX DATA (6 NEIGHBORHOOD-FIT CAPABILITIES)
     ========================================================================= */
  const CAPABILITY_SPECS = {
    'facade-siding': {
      eyebrow: '01 // FLAGSHIP SUBURBAN FACADE TRANSFORMATION',
      title: 'Facade & Siding Modernization',
      subtitle: 'Complete exterior envelope re-skinning that transforms dated 1980s–1990s brick and vinyl suburban homes into modern architectural showcases.',
      beforeText: 'Aged red brick, faded beige vinyl or lap siding, weathered asphalt shingles, faux colonial shutters, and dated front elevation proportions.',
      afterText: 'Crisp charcoal and alabaster architectural facade panels, warm natural western red cedar inserts, standing-seam matte-black metal rooflines, and recessed soffit lighting.',
      timeline: '10–16 Weeks',
      investment: '$195,000 – $385,000',
      estimatorPill: 'Facade & Siding Modernization',
      estimatorPrompt: 'Facade & Siding Modernization — charcoal/white panels, warm cedar inserts & dark window casings',
      specs: [
        'Commercial-grade architectural fiber-cement panels in matte charcoal and alabaster white',
        'Kiln-dried Clear Vertical Grain (CVG) Western Red Cedar gable & garage inserts',
        'Continuous exterior rigid insulation board & commercial rain-screen drainage plane',
        '24-gauge PVDF matte-black standing-seam metal roof accents & concealed gutters',
        'Complete HOA architectural review board submission & municipal permit package included'
      ]
    },
    'suburban-additions': {
      eyebrow: '02 // DAYLIGHT EXPANSION & OPEN-CONCEPT LIVING',
      title: 'Suburban Additions & Indoor-Outdoor Great Rooms',
      subtitle: 'Sun-drenched structural expansions engineered cleanly within suburban lot setbacks.',
      beforeText: 'Compartmentalized 1990s formal dining rooms, low 8-foot ceilings, load-bearing partition walls, and disconnected rear patios.',
      afterText: 'Flush-recessed steel moment beams, vaulted daylight family rooms, waterfall quartzite kitchen islands, and multi-slide glass walls opening to a covered patio.',
      timeline: '14–22 Weeks',
      investment: '$275,000 – $540,000',
      estimatorPill: 'Suburban Addition & Great Room',
      estimatorPrompt: 'Suburban Addition & Daylight Indoor-Outdoor Great Room with multi-slide glass doors',
      specs: [
        'In-house stamped structural steel engineering eliminating interior load-bearing columns',
        '16-to-24-foot thermally broken matte-black multi-slide and folding patio glass systems',
        'Covered indoor-outdoor patio extensions with cedar tongue-and-groove ceilings & heaters',
        'Seamless foundation & roofline integration matching your modernized suburban elevation',
        'Full municipal zoning & lot-coverage setback verification prior to construction'
      ]
    },
    'entryways-landscaping': {
      eyebrow: '03 // STREETSCAPE & ARRIVAL ARCHITECTURE',
      title: 'Architectural Entryways & Front Yard Landscaping',
      subtitle: 'Re-engineering front entries, walkways, and driveways for commanding neighborhood curb appeal.',
      beforeText: 'Cracked concrete sidewalks, overgrown foundation bushes hiding windows, and dated two-story colonial entry porticos.',
      afterText: 'Cantilevered steel-and-cedar entrance canopy, oversized solid white-oak pivot door, geometric limestone step walkways, and manicured ornamental landscaping.',
      timeline: '6–12 Weeks',
      investment: '$95,000 – $220,000',
      estimatorPill: 'Entryway & Front Yard Landscaping',
      estimatorPrompt: 'Cantilevered Cedar Entryway, Pivot Door, Geometric Stone Walkway & Front Yard Landscaping',
      specs: [
        'Cantilevered structural steel front entrance canopy with warm cedar soffits & linear LEDs',
        'Custom 48-inch wide architectural wood-and-glass pivot or flush entry door system',
        'Large-format flamed limestone and bluestone floating front walkway & porch terrace',
        'Architectural saw-cut concrete driveway replacement with clean modern border joints',
        'Low-maintenance tailored boxwood, ornamental grass, and specimen tree streetscape design'
      ]
    },
    'glass-wood': {
      eyebrow: '04 // DAYLIGHT FENESTRATION & WARM WOOD ACCENTS',
      title: 'Whole-Home Glass & Natural Wood Upgrades',
      subtitle: 'Flooding suburban interiors with natural daylight while adding warm organic cedar contrast outside.',
      beforeText: 'Small double-hung white vinyl windows with colonial grids, drafty seals, and flat monochrome siding.',
      afterText: 'Expanded floor-to-ceiling matte-black architectural casement & picture windows paired with warm horizontal cedar cladding and soffits.',
      timeline: '8–14 Weeks',
      investment: '$135,000 – $290,000',
      estimatorPill: 'Whole-Home Glass & Wood Upgrades',
      estimatorPrompt: 'Whole-Home Matte-Black Architectural Windows & Warm Natural Cedar Cladding Upgrades',
      specs: [
        'Structural header resizing to expand cramped window openings into floor-to-ceiling spans',
        'Narrow-sightline thermally broken black aluminum & fiberglass-clad architectural windows',
        'Low-E solar-control daylight glazing for year-round energy efficiency and UV protection',
        'Pre-finished UV-stabilized natural western red cedar horizontal rain-screen accents',
        'Interior drywall returns and modern minimal window casing trim package included'
      ]
    },
    'modern-garage': {
      eyebrow: '05 // FRONT ELEVATION & GARAGE TRANSFORMATION',
      title: 'Modern Garage & Curb Appeal Re-Skinning',
      subtitle: 'Turning front-facing suburban two- and three-car garages into an architectural focal point.',
      beforeText: 'Dated white stamped-panel garage doors, exposed brick lintels, and worn shingle garage roof overhangs.',
      afterText: 'Flush horizontal cedar plank garage doors with frosted tempered glass lites, charcoal architectural surrounds, and a standing-seam black metal roof.',
      timeline: '6–10 Weeks',
      investment: '$85,000 – $190,000',
      estimatorPill: 'Modern Garage & Curb Appeal Re-Skinning',
      estimatorPrompt: 'Modern Flush Cedar-and-Glass Garage Doors, Standing-Seam Roof & Curb Appeal Re-Skin',
      specs: [
        'Custom insulated flush cedar-plank and anodized black aluminum garage doors',
        'Etched frosted tempered glass vertical lite panels for natural daylight inside the garage',
        'Whisper-quiet wall-mounted jackshaft smart openers with battery backup',
        'Architectural cedar header wrap & matte-black standing-seam metal garage roof plane',
        'Integrated warm 2700K architectural downlighting across garage and driveway apron'
      ]
    },
    'digital-mockups': {
      eyebrow: '06 // PRE-CONSTRUCTION CERTAINTY & HOA APPROVAL',
      title: 'Digital Pre-Construction & 3D Site Mockups',
      subtitle: 'Inspect your transformed suburban home in bright natural daylight 3D before a single crew arrives.',
      beforeText: 'Guessing how paint, siding, or window changes will look from 2D elevation drawings or small sample boards.',
      afterText: 'Millimeter-accurate 3D LiDAR facade scan, photorealistic daylight 3D renders from the street, HOA approval packet, and a Fixed-Price Milestone Contract.',
      timeline: '3–4 Weeks Pre-Build',
      investment: 'Credited 100% Toward Build',
      estimatorPill: 'Facade & Siding Modernization',
      estimatorPrompt: '3D Daylight Suburban Mockup, LiDAR Facade Scan & Fixed-Price Pre-Construction Study',
      specs: [
        'Terrestrial 3D LiDAR scan of your existing suburban facade, roofline, and front yard',
        'Photorealistic daytime 3D architectural renderings from your exact street vantage point',
        'Side-by-side material palette comparisons (cedar tones, charcoal/white panels, stone)',
        'Complete HOA architectural committee presentation & city building permit drawings',
        'Binding Zero-Unapproved-Change-Order Fixed-Price Construction Agreement'
      ]
    }
  };

  /* =========================================================================
     3. DAYLIGHT SUBURBAN PROCEDURAL RENDERER (FALLBACK & BENTO CANVASES)
     ========================================================================= */
  function drawProceduralSuburbanArchitecture(ctx, width, height, progress, options = {}) {
    const mode = options.mode || 'hero';
    ctx.save();

    // 1. Bright Partly-Cloudy Daylight Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.62);
    skyGrad.addColorStop(0, '#93C5FD');
    skyGrad.addColorStop(0.55, '#DBEAFE');
    skyGrad.addColorStop(1, '#F8FAFC');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Soft daylight clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(width * 0.25, height * 0.18, 48, 0, Math.PI * 2);
    ctx.arc(width * 0.31, height * 0.16, 62, 0, Math.PI * 2);
    ctx.arc(width * 0.72, height * 0.15, 55, 0, Math.PI * 2);
    ctx.fill();

    // Neighborhood deciduous trees on left & right
    ctx.fillStyle = '#3F6212';
    ctx.beginPath();
    ctx.arc(width * 0.12, height * 0.45, 72, 0, Math.PI * 2);
    ctx.arc(width * 0.89, height * 0.40, 88, 0, Math.PI * 2);
    ctx.fill();

    const drawBeforeSuburban = (clipW) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, clipW, height);
      ctx.clip();

      // Lawn & street
      ctx.fillStyle = '#4D7C0F';
      ctx.fillRect(0, height * 0.62, width, height * 0.25);
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(0, height * 0.84, width, height * 0.16);

      // Driveway
      ctx.fillStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.moveTo(width * 0.54, height * 0.64);
      ctx.lineTo(width * 0.80, height * 0.64);
      ctx.lineTo(width * 0.74, height);
      ctx.lineTo(width * 0.42, height);
      ctx.closePath();
      ctx.fill();

      // Dated 1990s 2-story brick & beige siding house
      const hx = width * 0.22;
      const hy = height * 0.26;
      const hw = width * 0.58;
      const hh = height * 0.38;

      // Upper beige vinyl siding
      ctx.fillStyle = '#D6D3C4';
      ctx.fillRect(hx + hw * 0.18, hy + hh * 0.18, hw * 0.46, hh * 0.42);

      // Lower red brick & garage wing
      ctx.fillStyle = '#7C3F2C';
      ctx.fillRect(hx, hy + hh * 0.25, hw * 0.22, hh * 0.75);
      ctx.fillRect(hx + hw * 0.18, hy + hh * 0.56, hw * 0.82, hh * 0.44);

      // Weathered grey shingle roof
      ctx.fillStyle = '#4B5563';
      ctx.beginPath();
      ctx.moveTo(hx + hw * 0.14, hy + hh * 0.20);
      ctx.lineTo(hx + hw * 0.42, hy);
      ctx.lineTo(hx + hw * 0.66, hy + hh * 0.20);
      ctx.closePath();
      ctx.fill();

      // White paneled garage doors
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(hx + hw * 0.62, hy + hh * 0.64, hw * 0.16, hh * 0.36);
      ctx.fillRect(hx + hw * 0.80, hy + hh * 0.64, hw * 0.16, hh * 0.36);

      ctx.restore();
    };

    const drawAfterSuburban = (startX) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(startX, 0, width - startX, height);
      ctx.clip();

      // Manicured lawn & fresh concrete street/driveway
      ctx.fillStyle = '#3F6212';
      ctx.fillRect(0, height * 0.62, width, height * 0.25);
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(0, height * 0.86, width, height * 0.14);

      ctx.fillStyle = '#F1F5F9';
      ctx.beginPath();
      ctx.moveTo(width * 0.54, height * 0.64);
      ctx.lineTo(width * 0.80, height * 0.64);
      ctx.lineTo(width * 0.74, height);
      ctx.lineTo(width * 0.42, height);
      ctx.closePath();
      ctx.fill();

      const hx = width * 0.22;
      const hy = height * 0.26;
      const hw = width * 0.58;
      const hh = height * 0.38;

      // Crisp white & charcoal architectural panels
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(hx, hy + hh * 0.22, hw * 0.22, hh * 0.78);
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(hx + hw * 0.22, hy + hh * 0.18, hw * 0.78, hh * 0.82);

      // Warm natural cedar inserts & cantilevered entry canopy
      ctx.fillStyle = '#B45309';
      ctx.fillRect(hx + hw * 0.04, hy + hh * 0.26, hw * 0.14, hh * 0.34);
      ctx.fillRect(hx + hw * 0.19, hy + hh * 0.54, hw * 0.42, hh * 0.06);

      // Flush cedar & frosted glass modern garage doors
      ctx.fillStyle = '#B45309';
      ctx.fillRect(hx + hw * 0.62, hy + hh * 0.62, hw * 0.16, hh * 0.38);
      ctx.fillRect(hx + hw * 0.80, hy + hh * 0.62, hw * 0.16, hh * 0.38);

      // Standing-seam matte-black metal roof
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.moveTo(hx + hw * 0.14, hy + hh * 0.20);
      ctx.lineTo(hx + hw * 0.42, hy - 4);
      ctx.lineTo(hx + hw * 0.66, hy + hh * 0.20);
      ctx.closePath();
      ctx.fill();

      // Matte-black floor-to-ceiling windows
      ctx.fillStyle = '#38BDF8';
      ctx.globalAlpha = 0.35;
      ctx.fillRect(hx + hw * 0.05, hy + hh * 0.34, hw * 0.12, hh * 0.20);
      ctx.fillRect(hx + hw * 0.28, hy + hh * 0.26, hw * 0.08, hh * 0.22);
      ctx.fillRect(hx + hw * 0.44, hy + hh * 0.26, hw * 0.08, hh * 0.22);
      ctx.globalAlpha = 1;

      ctx.restore();
    };

    drawBeforeSuburban(width);
    drawAfterSuburban(width * (1 - progress));

    if (mode !== 'static' && progress > 0.01 && progress < 0.99) {
      const sx = width * progress;
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 2.5;
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
        drawCoverImage(cctx, heroBeforeImg, offWidth, offHeight);

        const sweepX = offWidth * p;
        const feather = offWidth * 0.08;

        cctx.save();
        cctx.globalAlpha = Math.pow(p, 1.35) * 0.30;
        drawCoverImage(cctx, heroAfterImg, offWidth, offHeight);
        cctx.restore();

        cctx.save();
        cctx.beginPath();
        cctx.rect(0, 0, Math.max(0, sweepX + feather), offHeight);
        cctx.clip();
        drawCoverImage(cctx, heroAfterImg, offWidth, offHeight);
        cctx.restore();
      } else {
        drawProceduralSuburbanArchitecture(cctx, offWidth, offHeight, p, { mode: 'static' });
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
     5. HERO TRANSFORMATION CANVAS + SUB-FRAME ALPHA BLENDING + GOLDEN-BRASS WAVE
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
      drawProceduralSuburbanArchitecture(heroCtx, w, h, progress);
    }

    // 2. High-Resolution Direct Before/After Sharp Composite + Warm Golden-Brass LiDAR Scan Wave
    if (heroImagesLoaded && heroBeforeImg && heroAfterImg) {
      const scanX = w * progress;
      const bandWidth = Math.max(60, w * 0.065);

      // Crisp high-res Before on right of scan wave
      heroCtx.save();
      heroCtx.globalAlpha = 0.72;
      heroCtx.beginPath();
      heroCtx.rect(scanX, 0, w - scanX, h);
      heroCtx.clip();
      drawCoverImage(heroCtx, heroBeforeImg, w, h);
      heroCtx.restore();

      // Crisp high-res After on left of scan wave
      heroCtx.save();
      heroCtx.globalAlpha = 0.88;
      heroCtx.beginPath();
      heroCtx.rect(0, 0, scanX, h);
      heroCtx.clip();
      drawCoverImage(heroCtx, heroAfterImg, w, h);
      heroCtx.restore();

      // 3. Warm Natural Light-Refraction / Golden-Brass LiDAR Wireframe Wave
      if (progress > 0.005 && progress < 0.995) {
        renderDaylightScanWave(heroCtx, w, h, scanX, bandWidth, progress);
      }
    }
  }

  function renderDaylightScanWave(ctx, w, h, scanX, bandWidth, progress) {
    ctx.save();

    // Warm Golden-Brass & Natural Sunlight Refraction Band
    const lidarGrad = ctx.createLinearGradient(scanX - bandWidth, 0, scanX + bandWidth, 0);
    lidarGrad.addColorStop(0, 'rgba(212, 175, 55, 0)');
    lidarGrad.addColorStop(0.35, 'rgba(254, 243, 199, 0.32)');
    lidarGrad.addColorStop(0.5, 'rgba(180, 83, 9, 0.48)');
    lidarGrad.addColorStop(0.65, 'rgba(254, 243, 199, 0.32)');
    lidarGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');

    ctx.fillStyle = lidarGrad;
    ctx.fillRect(scanX - bandWidth, 0, bandWidth * 2, h);

    // Architectural CAD Grid inside the scan band
    ctx.save();
    ctx.beginPath();
    ctx.rect(scanX - bandWidth * 0.85, 0, bandWidth * 1.7, h);
    ctx.clip();

    ctx.strokeStyle = 'rgba(180, 83, 9, 0.30)';
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
    ctx.fillStyle = 'rgba(180, 83, 9, 0.90)';
    for (let gy = gridStep * 2; gy < h - gridStep; gy += gridStep * 2) {
      ctx.fillRect(scanX - 6, gy - 1, 12, 2);
      ctx.beginPath();
      ctx.arc(scanX + Math.sin(gy * 0.05 + progress * 12) * 18, gy, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Primary Architectural Bronze Core Line (#B45309)
    ctx.shadowColor = '#D4AF37';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(scanX, 0);
    ctx.lineTo(scanX, h);
    ctx.stroke();

    // Secondary Warm Gold Leading Edge (#D4AF37)
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.92)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(scanX + 10, 0);
    ctx.lineTo(scanX + 10, h);
    ctx.stroke();

    ctx.restore();
  }

  /* =========================================================================
     6. THREE.JS 3D SUBURBAN WIREFRAME HOUSE & GOLDEN-BRASS WAVE OVERLAY
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
    threeCamera.position.set(0, 1.5, 11.5);

    houseWireframeGroup = new THREE.Group();

    const bronzeWireMat = new THREE.LineBasicMaterial({
      color: 0xb45309,
      transparent: true,
      opacity: 0.34
    });
    const goldWireMat = new THREE.LineBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.30
    });

    // 2-Story Suburban Main Volume
    const mainHouseGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(4.8, 2.5, 3.0));
    const mainHouseLines = new THREE.LineSegments(mainHouseGeo, bronzeWireMat);
    mainHouseLines.position.set(-0.6, 0.45, 0);
    houseWireframeGroup.add(mainHouseLines);

    // Front Gable Wing (Left)
    const gableWingGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.9, 2.8, 3.3));
    const gableWingLines = new THREE.LineSegments(gableWingGeo, goldWireMat);
    gableWingLines.position.set(-2.3, 0.55, 0.25);
    houseWireframeGroup.add(gableWingLines);

    // 2-Car Suburban Garage Volume (Right)
    const garageGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(3.2, 1.8, 3.1));
    const garageLines = new THREE.LineSegments(garageGeo, bronzeWireMat);
    garageLines.position.set(2.2, 0.05, 0.2);
    houseWireframeGroup.add(garageLines);

    // Cantilevered Modern Front Entry Canopy
    const canopyGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.8, 0.14, 1.4));
    const canopyLines = new THREE.LineSegments(canopyGeo, goldWireMat);
    canopyLines.position.set(-0.4, 0.15, 1.65);
    houseWireframeGroup.add(canopyLines);

    houseWireframeGroup.position.set(0, -0.1, 0);
    threeScene.add(houseWireframeGroup);

    // Ambient Daylight Golden-Brass Particles
    const particleCount = 280;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorBronze = new THREE.Color(0xb45309);
    const colorGold = new THREE.Color(0xd4af37);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 7;

      const c = i % 2 === 0 ? colorBronze : colorGold;
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
      opacity: 0.55
    });

    lidarParticles = new THREE.Points(particleGeo, particleMat);
    threeScene.add(lidarParticles);

    const waveGeo = new THREE.PlaneGeometry(0.18, 8.5);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0xb45309,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide
    });
    laserWaveMesh = new THREE.Mesh(waveGeo, waveMat);
    threeScene.add(laserWaveMesh);
  }

  function updateThreeJsHeroOverlay(progress, timeMs) {
    if (!threeRenderer || !threeScene || !threeCamera) return;

    const blueprintIntensity = Math.sin(Math.min(1, Math.max(0, progress)) * Math.PI);

    if (houseWireframeGroup) {
      houseWireframeGroup.rotation.y = (progress - 0.5) * 0.20 + pointerNormX * 0.07;
      houseWireframeGroup.rotation.x = pointerNormY * 0.04;
      houseWireframeGroup.children.forEach((lineObj, idx) => {
        if (lineObj.material) {
          lineObj.material.opacity =
            0.05 + blueprintIntensity * (idx % 2 === 0 ? 0.34 : 0.26);
        }
      });
    }

    if (lidarParticles) {
      lidarParticles.rotation.y = timeMs * 0.00008 + progress * 0.32;
      lidarParticles.position.y = Math.sin(timeMs * 0.0005) * 0.10;
    }

    if (laserWaveMesh) {
      laserWaveMesh.position.x = (progress - 0.5) * 11.2;
      laserWaveMesh.material.opacity = progress > 0.01 && progress < 0.99 ? 0.40 : 0.0;
    }

    threeRenderer.render(threeScene, threeCamera);
  }

  /* =========================================================================
     7. HERO SCROLL CONTROLLER, PINNING & 3-STAGE HUD NARRATIVE
     ========================================================================= */
  const heroTrack = document.getElementById('hero-top');
  const heroStage = document.getElementById('hero-sticky-stage');
  const stageCards = [
    document.getElementById('hero-stage-1'),
    document.getElementById('hero-stage-2'),
    document.getElementById('hero-stage-3')
  ];
  const heroScrubRange = document.getElementById('hero-scrub-range');
  const heroScrubFill = document.getElementById('hero-scrub-fill');
  const stageStepBtns = document.querySelectorAll('.stage-step-btn');
  const modeScrollBtn = document.getElementById('mode-scroll-btn');
  const modeManualBtn = document.getElementById('mode-manual-btn');
  const topNavbar = document.getElementById('top-navbar');

  function applyMobileHeroMode() {
    isMobileViewport = window.innerWidth <= 768;
    if (isMobileViewport && !MOBILE_SCROLL_SCRUB) {
      document.body.classList.add('mobile-static-hero');
      if (heroStage) {
        heroStage.style.transform = 'none';
      }
      if (targetProgress === 0) {
        targetProgress = 0.30;
        currentProgress = 0.30;
      }
    } else {
      document.body.classList.remove('mobile-static-hero');
    }
  }

  function updateScrollTargetFromWindow() {
    if (!heroTrack || !heroStage) return;

    const scrollY = window.scrollY || window.pageYOffset || 0;
    if (topNavbar) {
      topNavbar.classList.toggle('is-scrolled', scrollY > 24);
    }

    if ((isMobileViewport && !MOBILE_SCROLL_SCRUB) || prefersReducedMotion) {
      heroStage.style.transform = 'none';
      return;
    }

    const trackHeight = heroTrack.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollableDistance = Math.max(1, trackHeight - viewportHeight);

    const trackRect = heroTrack.getBoundingClientRect();
    if (heroStage.offsetTop === 0 && trackRect.top <= 0) {
      const pinOffset = Math.min(scrollableDistance, Math.max(0, -trackRect.top));
      heroStage.style.transform = `translate3d(0, ${pinOffset}px, 0)`;
    } else {
      heroStage.style.transform = 'none';
    }

    if (inspectionMode === 'scroll') {
      targetProgress = Math.min(1, Math.max(0, scrollY / scrollableDistance));
    }
  }

  function updateHeroNarrativeStage(progress) {
    let nextStage = 1;
    if (progress >= 0.67) {
      nextStage = 3;
    } else if (progress >= 0.34) {
      nextStage = 2;
    }

    if (nextStage !== activeStageIndex) {
      activeStageIndex = nextStage;
      stageCards.forEach((card, idx) => {
        if (!card) return;
        const isCurrent = idx + 1 === activeStageIndex;
        card.classList.toggle('is-active', isCurrent);
        card.setAttribute('aria-hidden', isCurrent ? 'false' : 'true');
      });
    }

    stageStepBtns.forEach((btn, idx) => {
      btn.classList.toggle('is-active', idx + 1 === activeStageIndex);
    });

    if (heroScrubRange && document.activeElement !== heroScrubRange) {
      heroScrubRange.value = String(Math.round(progress * 1000));
    }
    if (heroScrubFill) {
      heroScrubFill.style.width = `${(progress * 100).toFixed(1)}%`;
    }
  }

  function setInspectionMode(mode) {
    inspectionMode = mode;
    if (modeScrollBtn && modeManualBtn) {
      modeScrollBtn.classList.toggle('is-active', mode === 'scroll');
      modeManualBtn.classList.toggle('is-active', mode === 'manual');
    }
  }

  if (modeScrollBtn) {
    modeScrollBtn.addEventListener('click', () => {
      setInspectionMode('scroll');
      updateScrollTargetFromWindow();
    });
  }

  if (modeManualBtn) {
    modeManualBtn.addEventListener('click', () => {
      setInspectionMode('manual');
      if (targetProgress < 0.1 || targetProgress > 0.9) {
        targetProgress = 0.5;
      }
    });
  }

  if (heroScrubRange) {
    heroScrubRange.addEventListener('input', (e) => {
      setInspectionMode('manual');
      targetProgress = Number(e.target.value) / 1000;
    });
  }

  stageStepBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetVal = parseFloat(btn.getAttribute('data-target-progress') || '0');
      setInspectionMode('manual');
      targetProgress = targetVal;
    });
  });

  window.addEventListener('scroll', updateScrollTargetFromWindow, { passive: true });
  window.addEventListener('mousemove', (e) => {
    pointerNormX = (e.clientX / window.innerWidth - 0.5) * 2;
    pointerNormY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* =========================================================================
     8. MAIN REQUESTANIMATIONFRAME LERP ENGINE
     ========================================================================= */
  function animateHeroLoop(timeMs) {
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
     9. LOAD SUBURBAN HERO BEFORE & AFTER ASSETS
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
        renderBentoCanvases();
      }
    };

    bImg.onload = onAssetReady;
    aImg.onload = onAssetReady;
    bImg.onerror = () => {};
    aImg.onerror = () => {};

    bImg.src = 'assets/suburban-before.webp';
    aImg.src = 'assets/suburban-after.webp';
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
     11. SINGLE-CARD AI / PHOTO REMODEL ESTIMATOR (SUBURBAN EDITION)
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
    'Facade & Siding Modernization':
      'Facade & Siding Modernization — charcoal/white panels, warm cedar inserts & dark window casings',
    'Suburban Addition & Great Room':
      'Suburban Addition & Daylight Great Room — multi-slide glass doors & vaulted family room',
    'Entryway & Front Yard Landscaping':
      'Architectural Entryway & Front Yard Landscaping — cantilevered cedar canopy & stone walkway',
    'Whole-Home Glass & Wood Upgrades':
      'Whole-Home Glass & Natural Wood Upgrades — enlarged black casement windows & cedar soffits',
    'Modern Garage & Curb Appeal Re-Skinning':
      'Modern Garage & Curb Appeal Re-Skinning — flush cedar-and-glass garage doors & metal roof'
  };

  const SCOPE_ESTIMATES = {
    'Facade & Siding Modernization': {
      range: '$210,000 – $365,000',
      timeline: 'Est. Duration: 10–15 Weeks',
      lift: 'Projected Value Lift: +$540k+'
    },
    'Suburban Addition & Great Room': {
      range: '$295,000 – $510,000',
      timeline: 'Est. Duration: 14–20 Weeks',
      lift: 'Projected Value Lift: +$780k+'
    },
    'Entryway & Front Yard Landscaping': {
      range: '$110,000 – $215,000',
      timeline: 'Est. Duration: 6–11 Weeks',
      lift: 'Projected Value Lift: +$360k+'
    },
    'Whole-Home Glass & Wood Upgrades': {
      range: '$145,000 – $275,000',
      timeline: 'Est. Duration: 8–13 Weeks',
      lift: 'Projected Value Lift: +$450k+'
    },
    'Modern Garage & Curb Appeal Re-Skinning': {
      range: '$95,000 – $185,000',
      timeline: 'Est. Duration: 6–10 Weeks',
      lift: 'Projected Value Lift: +$320k+'
    }
  };

  let selectedScopeName = 'Facade & Siding Modernization';

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
      const estData = SCOPE_ESTIMATES[selectedScopeName] || SCOPE_ESTIMATES['Facade & Siding Modernization'];

      if (modalEstRange) modalEstRange.textContent = estData.range;
      if (modalEstTimeline) modalEstTimeline.textContent = estData.timeline;
      if (modalEstLift) modalEstLift.textContent = estData.lift;
      if (modalEstSub) {
        modalEstSub.textContent = `Prepared for suburban scope: "${visionVal}"`;
      }
      if (modalSmsStatus) {
        modalSmsStatus.textContent = `✓ Instant SMS suburban concept & scope packet dispatched to ${phoneVal}.`;
      }

      if (estimateModal) {
        estimateModal.hidden = false;
        estimateModal.setAttribute('aria-hidden', 'false');
      }

      addNewBackofficeLead({
        name: 'New Suburban Photo Inquiry',
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

  let activeCapabilityId = 'facade-siding';

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
     13. BENTO MINI DAYLIGHT ARCHITECTURAL CANVAS ILLUSTRATIONS
     ========================================================================= */
  function renderBentoCanvases() {
    document.querySelectorAll('.bento-mini-canvas').forEach((canvas) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      const type = canvas.getAttribute('data-bento-art') || 'facade-siding';

      // Bright daylight architectural paper background
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#E0F2FE');
      bg.addColorStop(0.6, '#F1F5F9');
      bg.addColorStop(1, '#E2E8F0');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Subtle architectural drafting grid
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 26) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 26) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (type === 'facade-siding') {
        if (heroImagesLoaded && heroBeforeImg && heroAfterImg) {
          drawCoverImage(ctx, heroBeforeImg, w, h);
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, w * 0.62, h);
          ctx.clip();
          drawCoverImage(ctx, heroAfterImg, w, h);
          ctx.restore();
          ctx.strokeStyle = '#B45309';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(w * 0.62, 0);
          ctx.lineTo(w * 0.62, h);
          ctx.stroke();
        } else {
          drawProceduralSuburbanArchitecture(ctx, w, h, 0.62);
        }
      } else if (type === 'suburban-additions') {
        // Daylight indoor-outdoor great room elevation
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(w * 0.14, h * 0.22, w * 0.72, h * 0.58);
        ctx.fillStyle = 'rgba(186, 230, 253, 0.65)';
        ctx.fillRect(w * 0.20, h * 0.30, w * 0.60, h * 0.46);
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(w * 0.14, h * 0.22, w * 0.72, h * 0.58);
        for (let m = 0.35; m <= 0.65; m += 0.15) {
          ctx.beginPath();
          ctx.moveTo(w * m, h * 0.30);
          ctx.lineTo(w * m, h * 0.76);
          ctx.stroke();
        }
        ctx.fillStyle = '#B45309';
        ctx.fillRect(w * 0.10, h * 0.18, w * 0.80, 6);
      } else if (type === 'entryways-landscaping') {
        // Cantilevered cedar entry & geometric limestone walkway
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(w * 0.26, h * 0.16, w * 0.48, h * 0.52);
        ctx.fillStyle = '#B45309';
        ctx.fillRect(w * 0.20, h * 0.32, w * 0.60, 7);
        ctx.fillRect(w * 0.45, h * 0.38, w * 0.10, h * 0.30);
        for (let s = 0; s < 3; s++) {
          const sy = h * (0.70 + s * 0.09);
          const sw = w * (0.34 + s * 0.10);
          ctx.fillStyle = '#CBD5E1';
          ctx.fillRect((w - sw) * 0.5, sy, sw, h * 0.06);
        }
      } else if (type === 'glass-wood') {
        // Matte-black window grid + natural cedar cladding
        ctx.fillStyle = '#B45309';
        ctx.fillRect(w * 0.15, h * 0.18, w * 0.30, h * 0.64);
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(w * 0.45, h * 0.18, w * 0.40, h * 0.64);
        ctx.fillStyle = '#BAE6FD';
        ctx.fillRect(w * 0.50, h * 0.26, w * 0.30, h * 0.48);
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 3;
        ctx.strokeRect(w * 0.50, h * 0.26, w * 0.30, h * 0.48);
      } else if (type === 'modern-garage') {
        // Modern flush cedar-and-frosted-glass 2-car garage elevation
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(w * 0.12, h * 0.24, w * 0.76, h * 0.60);
        ctx.fillStyle = '#B45309';
        ctx.fillRect(w * 0.18, h * 0.38, w * 0.29, h * 0.44);
        ctx.fillRect(w * 0.53, h * 0.38, w * 0.29, h * 0.44);
        ctx.fillStyle = '#E0F2FE';
        for (let r = 0; r < 4; r++) {
          ctx.fillRect(w * 0.39, h * (0.42 + r * 0.095), w * 0.06, h * 0.055);
          ctx.fillRect(w * 0.74, h * (0.42 + r * 0.095), w * 0.06, h * 0.055);
        }
      } else {
        // 3D Daylight Site Mockup wireframe
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(w * 0.22, h * 0.24, w * 0.56, h * 0.52);
        ctx.fillStyle = '#B45309';
        for (let px = 0.2; px <= 0.8; px += 0.075) {
          for (let py = 0.22; py <= 0.78; py += 0.14) {
            ctx.beginPath();
            ctx.arc(w * px, h * py, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    });
  }

  /* =========================================================================
     14. INTERACTIVE SUBURBAN REMODEL VALUE & EQUITY CALCULATOR + VISUALIZER
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
    sqft: 3100,
    tier: 'structural-addition',
    grade: 'organic-woodland',
    scrubPct: 68
  };

  const TIER_CONFIG = {
    'curb-appeal': {
      baseRatePerSqft: 74,
      roiMultiplier: 1.56,
      minWeeks: 10,
      maxWeeks: 14,
      engWeeks: 3,
      vaultOption: 'Facade & Siding Modernization',
      deliverables: [
        'Full 3D LiDAR facade scan, daylight 3D mockups & HOA approval submission',
        'Charcoal & white architectural panels with warm natural cedar gable/garage inserts',
        'Flush cedar-and-glass garage doors, cantilevered entry canopy & limestone walk',
        'Guaranteed Fixed-Price Milestone Schedule with 10-Year Structural Warranty'
      ]
    },
    'structural-addition': {
      baseRatePerSqft: 118,
      roiMultiplier: 1.54,
      minWeeks: 14,
      maxWeeks: 18,
      engWeeks: 3,
      vaultOption: 'Suburban Addition & Indoor-Outdoor Great Room',
      deliverables: [
        '3D daylight architectural mockup & complete HOA/municipal permit package',
        'Charcoal & white architectural facade panels with warm natural cedar inserts',
        'Enlarged matte-black window casings, standing-seam metal roof & modern garage doors',
        'Guaranteed Fixed-Price Milestone Schedule with zero unapproved change orders'
      ]
    },
    'full-estate': {
      baseRatePerSqft: 182,
      roiMultiplier: 1.58,
      minWeeks: 20,
      maxWeeks: 26,
      engWeeks: 4,
      vaultOption: 'Whole-Home Glass & Natural Wood Upgrades',
      deliverables: [
        'Complete whole-home interior/exterior architectural overhaul & open-concept addition',
        'Standing-seam matte-black metal roof, floor-to-ceiling window walls & cedar millwork',
        'New architectural concrete driveway, sculpted limestone entry court & front landscaping',
        'Dedicated Master Superintendent & binding Fixed-Price Turnkey Guarantee'
      ]
    }
  };

  const GRADE_MULTIPLIER = {
    'architectural-modern': 0.90,
    'organic-woodland': 1.0,
    'ultra-custom': 1.22
  };

  function formatCurrency(val) {
    const rounded = Math.round(val / 5000) * 5000;
    return '$' + rounded.toLocaleString('en-US');
  }

  function updateCalculatorReadout() {
    const tierInfo = TIER_CONFIG[calcState.tier] || TIER_CONFIG['structural-addition'];
    const gradeMult = GRADE_MULTIPLIER[calcState.grade] || 1.0;

    const effectiveSqft = Math.pow(calcState.sqft / 3000, 0.84) * 3000;
    const midCost = effectiveSqft * tierInfo.baseRatePerSqft * gradeMult;
    const lowCost = midCost * 0.91;
    const highCost = midCost * 1.12;

    // Clamp neighborhood lift nicely into the $450k – $1.2M+ upscale suburban range
    const lowLift = Math.max(450000, lowCost * tierInfo.roiMultiplier);
    const highLift = Math.max(lowLift + 135000, highCost * tierInfo.roiMultiplier);
    const retentionPct = Math.round(tierInfo.roiMultiplier * 100);

    if (sqftDisplay) {
      sqftDisplay.textContent =
        calcState.sqft >= 6000
          ? '6,000+ sq ft'
          : `${calcState.sqft.toLocaleString('en-US')} sq ft`;
    }
    if (calcInvestmentRange) {
      calcInvestmentRange.textContent = `${formatCurrency(lowCost)} – ${formatCurrency(highCost)}`;
    }
    if (calcEquityLift) {
      calcEquityLift.textContent = `+${formatCurrency(lowLift)} – ${formatCurrency(highLift)}`;
    }
    if (calcRoiBadge) {
      calcRoiBadge.textContent = `Est. ${retentionPct}% Value Lift (Typical Upscale Lot: $450k – $1.2M+)`;
    }

    const sizeWeekAdd = Math.round((calcState.sqft - 2800) / 1400);
    const wMin = Math.max(8, tierInfo.minWeeks + sizeWeekAdd);
    const wMax = Math.max(wMin + 3, tierInfo.maxWeeks + sizeWeekAdd);

    if (calcTimelineWeeks) {
      calcTimelineWeeks.textContent = `${wMin} – ${wMax} Weeks`;
    }
    if (calcTimelineBreakdown) {
      calcTimelineBreakdown.textContent = `${tierInfo.engWeeks} wks 3D & HOA • ${wMin - tierInfo.engWeeks}–${wMax - tierInfo.engWeeks} wks Clean Site Build`;
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
      drawProceduralSuburbanArchitecture(ctx, w, h, progress);
    }

    const sx = w * progress;
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, h);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
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
     15. SUBURBAN CASE STUDY BEFORE/AFTER SLIDER CARDS
     ========================================================================= */
  const CASE_ASSETS = {
    'suburban-flagship': {
      beforeSrc: 'assets/suburban-before.webp',
      afterSrc: 'assets/suburban-after.webp',
      beforeImg: null,
      afterImg: null,
      loaded: false,
      pct: 50
    },
    'suburban-colonial': {
      beforeSrc: 'assets/suburban-colonial-before.webp',
      afterSrc: 'assets/suburban-colonial-after.webp',
      beforeImg: null,
      afterImg: null,
      loaded: false,
      pct: 50
    },
    'suburban-ranch': {
      beforeSrc: 'assets/suburban-ranch-before.webp',
      afterSrc: 'assets/suburban-ranch-after.webp',
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
      drawCoverImage(ctx, asset.afterImg, w, h);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w * progress, h);
      ctx.clip();
      drawCoverImage(ctx, asset.beforeImg, w, h);
      ctx.restore();
    } else {
      drawProceduralSuburbanArchitecture(ctx, w, h, progress);
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
      const selectedScope = (scopeSelect && scopeSelect.value) || '3D Suburban Property Evaluation';

      if (vaultBookingFeedback) {
        vaultBookingFeedback.hidden = false;
        vaultBookingFeedback.textContent = `✓ Thank you, ${clientName}. Our Principal Architect’s studio has reserved your 3D Suburban Site Evaluation for "${selectedScope}" and dispatched confirmation details to ${clientPhone}.`;
      }

      addNewBackofficeLead({
        name: clientName,
        phone: clientPhone,
        scope: selectedScope,
        budget: '$340,000 – $485,000',
        lift: '+$680k+',
        timeline: '12–16 Weeks',
        visionText: `Requested Principal 3D Suburban Evaluation for ${selectedScope}`
      });
    });
  }

  /* =========================================================================
     17. PILLAR 2: 3-PANE UNIFIED SUBURBAN BACK-OFFICE CONVERSATION ROOM
     ========================================================================= */
  const boThreads = [
    {
      id: 'mitchell-clydehill',
      name: 'David & Lauren Mitchell',
      phone: '(425) 891-4420',
      location: 'Clyde Hill / Bellevue, WA',
      program: 'Facade, Roof & Garage Re-Skin',
      budget: '$320,000 – $410,000',
      lift: '+$780,000 Equity Lift',
      timeline: '12 – 15 Weeks',
      sqft: '3,250 sq ft · Suburban Lot',
      grade: 'Warm Cedar, Panels & Stone',
      architect: 'Julian Vance, AIA',
      status: 'Draft',
      badgeLabel: 'Needs Approval',
      timeAgo: '3m ago',
      draftText:
        'Hi David & Lauren! We analyzed your 1992 Clyde Hill front elevation photo. Replacing the red brick and vinyl siding with charcoal/white architectural panels, warm cedar inserts, flush cedar-and-glass garage doors, and a standing-seam black metal roof models at $320k–$410k turnkey (12–15 wks). Can Julian Vance, AIA stop by Thursday at 2:00 PM for your complimentary 3D facade scan?',
      messages: [
        {
          sender: 'homeowner',
          meta: 'David & Lauren Mitchell · SMS + Photo Upload · 11:05 AM',
          text: 'We love our neighborhood in Clyde Hill, but our 1992 two-story brick and beige siding exterior looks dated. We want charcoal and white panels, warm cedar accents, black windows, and modern cedar garage doors.',
          attachment: '📷 Attached: clyde-hill-front-elevation-1992.webp (3D Scan Ready)'
        },
        {
          sender: 'ai-reply',
          meta: 'Alfred AI Architect Co-Pilot · Instant Ballpark · 11:05 AM',
          text: 'Welcome to Aether, David & Lauren! For your 3,250 sq ft two-story suburban residence, a complete Facade, Standing-Seam Metal Roof & Modern Garage Modernization models at $320,000 – $410,000 turnkey (projected +$780k neighborhood appraisal lift).'
        },
        {
          sender: 'homeowner',
          meta: 'David & Lauren Mitchell · SMS · 11:08 AM',
          text: 'That fits our plan much better than moving. Do you handle our Clyde Hill HOA architectural submission and 3D daylight mockups?'
        }
      ]
    },
    {
      id: 'reynolds-somerset',
      name: 'Andrew & Sophia Reynolds',
      phone: '(206) 742-8810',
      location: 'Somerset / Bellevue, WA',
      program: 'Colonial-to-Modern Facade & Entry',
      budget: '$245,000 – $330,000',
      lift: '+$640,000 Equity Lift',
      timeline: '10 – 14 Weeks',
      sqft: '2,950 sq ft · Cul-de-Sac Lot',
      grade: 'Crisp White & Charcoal',
      architect: 'Julian Vance, AIA',
      status: 'AI',
      badgeLabel: 'AI Active',
      timeAgo: '18m ago',
      draftText:
        'Andrew, our in-house architectural team prepares the entire Somerset HOA submission with photorealistic 3D daylight street-view renders. Shall I reserve Friday at 11:30 AM for an on-site laser scan?',
      messages: [
        {
          sender: 'homeowner',
          meta: 'Andrew Reynolds · Web Concierge · 10:42 AM',
          text: 'Our 1985 colonial has faded cream siding, faux shutters, and a cracked concrete walkway. Can we modernize the entire front facade in smooth alabaster stucco, black casement windows, and a limestone walkway?'
        },
        {
          sender: 'ai-reply',
          meta: 'Alfred AI Architect Co-Pilot · Suburban Brief · 10:42 AM',
          text: 'Absolutely. We specialize in Colonial-to-Contemporary suburban overhauls—removing dated shutters, enlarging window openings for black architectural casements, and adding a standing-seam porch canopy ($245k–$330k turnkey).'
        }
      ]
    },
    {
      id: 'chen-kirkland',
      name: 'Michael & Hannah Chen',
      phone: '(425) 319-6044',
      location: 'Kirkland Highlands, WA',
      program: 'Suburban Ranch + Daylight Great Room',
      budget: '$360,000 – $470,000',
      lift: '+$920,000 Equity Lift',
      timeline: '14 – 18 Weeks',
      sqft: '2,800 sq ft · Residential Lot',
      grade: 'Warm Cedar, Panels & Stone',
      architect: 'Elena Rostova, AIA',
      status: 'Booked',
      badgeLabel: '3D Scan Booked',
      timeAgo: '45m ago',
      draftText:
        'Looking forward to Thursday at 10:00 AM! Our terrestrial LiDAR scanner will map the entire ranch facade, driveway, and setback lines in under 60 minutes.',
      messages: [
        {
          sender: 'homeowner',
          meta: 'Hannah Chen · SMS · 9:30 AM',
          text: 'We want to modernize our 1984 Kirkland ranch with a standing-seam black metal roof, cantilevered cedar entry soffit, flush wood garage door, and larger black front windows.'
        },
        {
          sender: 'architect-reply',
          meta: 'Principal Architect Julian Vance, AIA · 9:38 AM',
          text: '✓ Cal.com 3D Facade Scan & Setback Walkthrough confirmed for Thursday · 10:00 AM PST. We will bring physical samples of our charcoal/white architectural panels and western red cedar.'
        }
      ]
    },
    {
      id: 'patel-redmond',
      name: 'Vikram & Meera Patel',
      phone: '(206) 904-1182',
      location: 'Redmond Education Hill, WA',
      program: 'Modern Garage & Entryway Overhaul',
      budget: '$135,000 – $195,000',
      lift: '+$450,000 Equity Lift',
      timeline: '8 – 10 Weeks',
      sqft: '3,400 sq ft · Suburban Lot',
      grade: 'Warm Cedar, Panels & Stone',
      architect: 'Elena Rostova, AIA',
      status: 'AI',
      badgeLabel: 'AI Active',
      timeAgo: '1h ago',
      draftText:
        'Hi Vikram! Our flush cedar-and-frosted-glass garage doors include concealed structural steel headers and smart jackshaft openers. Would tomorrow at 10:00 AM work for a quick front-elevation scan?',
      messages: [
        {
          sender: 'homeowner',
          meta: 'Vikram Patel · SMS · 8:50 AM',
          text: 'Our two white paneled garage doors and old front porch make the whole house look stuck in 1994. Can we upgrade the garage facade, entryway canopy, and driveway?'
        },
        {
          sender: 'ai-reply',
          meta: 'Alfred AI Architect Co-Pilot · 8:50 AM',
          text: 'Yes! Front-facing garages represent up to 40% of a suburban home’s street elevation. Re-skinning with flush horizontal cedar-and-glass doors, a cantilevered entry canopy, and saw-cut concrete driveway models at $135k–$195k.'
        }
      ]
    }
  ];

  let selectedBoThreadId = 'mitchell-clydehill';
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
      name: lead.name || 'New Suburban Inquiry',
      phone: lead.phone || '(425) 555-0199',
      location: 'Bellevue / Clyde Hill Suburban Lot',
      program: lead.scope || 'Facade & Siding Modernization',
      budget: lead.budget || '$265,000 – $395,000',
      lift: lead.lift || '+$580,000 Equity Lift',
      timeline: lead.timeline || '12 – 16 Weeks',
      sqft: `${calcState.sqft.toLocaleString('en-US')} sq ft · Suburban Lot`,
      grade: 'Warm Cedar, Panels & Stone',
      architect: 'Julian Vance, AIA',
      status: 'Draft',
      badgeLabel: 'Needs Approval',
      timeAgo: 'Just now',
      draftText: `Hi ${lead.name}! I reviewed your "${lead.scope}" inquiry (${lead.budget} turnkey ballpark). Can we bring our 3D LiDAR facade scanner out this Thursday at 2:00 PM for your complimentary suburban feasibility study?`,
      messages: [
        {
          sender: 'homeowner',
          meta: `${lead.name} · Instant Suburban Estimator · Just now`,
          text: lead.visionText || lead.scope,
          attachment: '📷 Suburban Elevation Scope Queued for 3D LiDAR Scan'
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

    document.querySelectorAll('.bo-mobile-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const pane = tab.getAttribute('data-bo-mobile-pane');
        if (pane) switchBoMobilePane(pane);
      });
    });

    document.querySelectorAll('.bo-filter-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        activeBoFilter = pill.getAttribute('data-bo-filter') || 'all';
        document.querySelectorAll('.bo-filter-pill').forEach((p) => {
          p.classList.toggle('is-active', p === pill);
        });
        renderBoThreadList();
      });
    });

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

    document.querySelectorAll('.bo-copilot-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bo-copilot-btn').forEach((b) => {
          b.classList.toggle('is-active', b === btn);
        });
      });
    });

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

    if (boEditDraftBtn && boComposerInput) {
      boEditDraftBtn.addEventListener('click', () => {
        const thread = getSelectedThread();
        if (!thread) return;
        boComposerInput.value = thread.draftText || '';
        boComposerInput.focus();
      });
    }

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

    document.querySelectorAll('[data-book-slot]').forEach((slotBtn) => {
      slotBtn.addEventListener('click', () => {
        const slotName = slotBtn.getAttribute('data-book-slot');
        const thread = getSelectedThread();
        if (!thread || !slotName) return;

        thread.messages.push({
          sender: 'architect-reply',
          meta: `Cal.com 3D Facade Scan Dispatch · ${thread.architect} · Just now`,
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

    if (
      window.location.search.includes('view=backoffice') ||
      window.location.hash === '#backoffice'
    ) {
      openBackofficeRoom();
    }
  }

  /* =========================================================================
     18. INITIALIZATION & RESIZE HANDLERS
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

    updateScrollTargetFromWindow();
    renderHeroTransformationCanvas(currentProgress);
  }

  window.addEventListener('resize', handleResize);

  applyMobileHeroMode();
  resizeHeroCanvas();
  buildSynthesizedHeroFrames();
  initThreeJsHeroOverlay();
  loadHeroImages();
  renderBentoCanvases();
  updateCalculatorReadout();
  initCaseStudySliders();
  initBackofficeRoom();
  updateScrollTargetFromWindow();
  requestAnimationFrame(animateHeroLoop);
})();
