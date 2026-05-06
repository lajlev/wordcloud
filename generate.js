#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-data.json'), 'utf-8'));
const dataJSON = JSON.stringify(data);
const photoB64 = fs.readFileSync(path.join(__dirname, 'anne-face.jpg')).toString('base64');
const photoDataURI = 'data:image/jpeg;base64,' + photoB64;

const html = `<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${data.title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Dancing+Script:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Great+Vibes&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Sacramento&family=Satisfy&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f5f0eb;
    color: #333;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }

  #controls {
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 20px rgba(0,0,0,0.08);
    padding: 20px 28px;
    margin-bottom: 20px;
    max-width: 1200px;
    width: 100%;
  }

  .control-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }
  .control-row:last-child { margin-bottom: 0; }

  .control-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #888;
    min-width: 90px;
    flex-shrink: 0;
  }

  .toggle-group {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .toggle-btn {
    border: 2px solid #e0d8d0;
    background: white;
    border-radius: 10px;
    padding: 7px 14px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #666;
    white-space: nowrap;
  }
  .toggle-btn:hover {
    border-color: #c0b8b0;
    background: #faf8f5;
  }
  .toggle-btn.active {
    border-color: #a08070;
    background: #a08070;
    color: white;
    box-shadow: 0 2px 8px rgba(160,128,112,0.3);
  }

  .palette-preview {
    display: inline-flex;
    gap: 2px;
    margin-right: 6px;
    vertical-align: middle;
  }
  .palette-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }

  .action-group {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }
  .action-btn {
    border: 2px solid #e0d8d0;
    background: white;
    border-radius: 10px;
    padding: 7px 16px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #666;
  }
  .action-btn:hover {
    border-color: #a08070;
    color: #a08070;
  }

  #canvas-wrapper {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 30px rgba(0,0,0,0.1);
    padding: 0;
    overflow: hidden;
    max-width: 1190px;
    width: 100%;
    aspect-ratio: 1190 / 842;
  }

  #cloud-svg {
    display: block;
    width: 100%;
    height: 100%;
    transition: opacity 0.15s ease;
  }

  @media print {
    body {
      background: white;
      padding: 0;
    }
    #controls { display: none !important; }
    #canvas-wrapper {
      box-shadow: none;
      border-radius: 0;
      max-width: none;
      width: 297mm;
      height: 210mm;
    }
    @page {
      size: A4 landscape;
      margin: 0;
    }
  }
</style>
</head>
<body>

<div id="controls">
  <div class="control-row">
    <span class="control-label">Palette</span>
    <div class="toggle-group" id="palette-toggles"></div>
    <div class="action-group">
      <button class="action-btn" id="btn-shuffle" title="Shuffle">&#8635; Shuffle</button>
      <button class="action-btn" id="btn-download" title="Download SVG">&#8681; SVG</button>
      <button class="action-btn" id="btn-print" title="Print / PDF">&#9113; Print</button>
    </div>
  </div>
  <div class="control-row">
    <span class="control-label">Typography</span>
    <div class="toggle-group" id="font-toggles"></div>
  </div>
  <div class="control-row">
    <span class="control-label">Layout</span>
    <div class="toggle-group" id="layout-toggles"></div>
  </div>
  <div class="control-row">
    <span class="control-label">Center</span>
    <div class="toggle-group" id="center-toggles"></div>
  </div>
</div>

<div id="canvas-wrapper">
  <svg id="cloud-svg" viewBox="0 0 1190 842" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

<script>
var DATA = ${dataJSON};
var PHOTO_URI = '${photoDataURI}';

// ── Palettes ──
var PALETTES = [
  {
    name: 'Sunset Glow',
    colors: ['#C8516B','#E0784A','#E8A03C','#B84878','#D46050','#CC7E3E','#D4688A']
  },
  {
    name: 'Rose Garden',
    colors: ['#A8406A','#C86080','#E088A0','#903858','#B85070','#D07898','#984868']
  },
  {
    name: 'Golden Honey',
    colors: ['#B87030','#CC8C44','#A86028','#986020','#D0A058','#C08038','#A87038']
  },
  {
    name: 'Coral Reef',
    colors: ['#CC6050','#D88068','#C05040','#CC7060','#E09888','#C06050','#D08878']
  },
  {
    name: 'Warm Berry',
    colors: ['#803C60','#984878','#6E3050','#884068','#A86090','#B078A8','#884870']
  }
];

// ── Font Sets (serif + script pairs) ──
var FONT_SETS = [
  {
    name: 'Classic Elegance',
    serif: 'Playfair Display',
    script: 'Great Vibes',
    serifFallback: 'Georgia, serif',
    scriptFallback: 'cursive'
  },
  {
    name: 'Refined Grace',
    serif: 'Cormorant Garamond',
    script: 'Sacramento',
    serifFallback: 'Georgia, serif',
    scriptFallback: 'cursive'
  },
  {
    name: 'Timeless',
    serif: 'Libre Baskerville',
    script: 'Dancing Script',
    serifFallback: 'Georgia, serif',
    scriptFallback: 'cursive'
  },
  {
    name: 'Playful Heritage',
    serif: 'EB Garamond',
    script: 'Pacifico',
    serifFallback: 'Georgia, serif',
    scriptFallback: 'cursive'
  },
  {
    name: 'Bold & Beautiful',
    serif: 'Abril Fatface',
    script: 'Satisfy',
    serifFallback: 'Georgia, serif',
    scriptFallback: 'cursive'
  }
];

// ── Layouts ──
var LAYOUTS = [
  { name: 'Gentle Spiral', id: 'gentle' },
  { name: 'Classic', id: 'classic' },
  { name: 'Playful Tilt', id: 'playful' },
  { name: 'Horizontal', id: 'horizontal' },
  { name: 'Starburst', id: 'starburst' }
];

// ── Center Modes ──
var CENTER_MODES = [
  { name: 'Words Only', id: 'none' },
  { name: 'Photo', id: 'photo' },
  { name: 'Name', id: 'name' }
];
var PHOTO_RADIUS = 120;
var PHOTO_EXCLUSION_R = 140;
var CENTER_NAME = 'Anne';
var CENTER_NAME_SIZE = 110;

// ── State ──
var state = {
  palette: 0,
  fonts: 0,
  layout: 0,
  center: 0,
  seed: 42
};

// ── Seeded RNG ──
function mulberry32(a) {
  return function() {
    a |= 0;
    a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ── Text Measurement ──
var mCanvas = document.createElement('canvas');
var mCtx = mCanvas.getContext('2d');

function measureText(text, fontSize, fontFamily) {
  mCtx.font = fontSize + 'px "' + fontFamily + '"';
  var m = mCtx.measureText(text);
  var w = m.width;
  var asc = m.actualBoundingBoxAscent;
  var desc = m.actualBoundingBoxDescent;
  var h;
  if (asc !== undefined && desc !== undefined) {
    h = asc + desc;
  } else {
    h = fontSize * 0.85;
  }
  return { w: w, h: h };
}

// ── OBB Collision Detection (SAT) ──
function makeOBB(cx, cy, hw, hh, angle) {
  return { cx: cx, cy: cy, hw: hw, hh: hh, angle: angle };
}

function obbOverlap(a, b) {
  var cosA = Math.cos(a.angle), sinA = Math.sin(a.angle);
  var cosB = Math.cos(b.angle), sinB = Math.sin(b.angle);
  var dx = b.cx - a.cx, dy = b.cy - a.cy;

  var axes = [
    { x: cosA, y: sinA },
    { x: -sinA, y: cosA },
    { x: cosB, y: sinB },
    { x: -sinB, y: cosB }
  ];

  for (var i = 0; i < 4; i++) {
    var ax = axes[i].x, ay = axes[i].y;
    var projA = Math.abs(a.hw * (ax * cosA + ay * sinA)) +
                Math.abs(a.hh * (-ax * sinA + ay * cosA));
    var projB = Math.abs(b.hw * (ax * cosB + ay * sinB)) +
                Math.abs(b.hh * (-ax * sinB + ay * cosB));
    var dist = Math.abs(dx * ax + dy * ay);
    if (dist > projA + projB) return false;
  }
  return true;
}

function getOBBCorners(o) {
  var c = Math.cos(o.angle), s = Math.sin(o.angle);
  var dx1 = o.hw * c, dy1 = o.hw * s;
  var dx2 = -o.hh * s, dy2 = o.hh * c;
  return [
    { x: o.cx + dx1 + dx2, y: o.cy + dy1 + dy2 },
    { x: o.cx - dx1 + dx2, y: o.cy - dy1 + dy2 },
    { x: o.cx - dx1 - dx2, y: o.cy - dy1 - dy2 },
    { x: o.cx + dx1 - dx2, y: o.cy + dy1 - dy2 }
  ];
}

function isInBounds(obb, W, H, margin) {
  var corners = getOBBCorners(obb);
  for (var i = 0; i < 4; i++) {
    if (corners[i].x < margin || corners[i].x > W - margin ||
        corners[i].y < margin || corners[i].y > H - margin) {
      return false;
    }
  }
  return true;
}

// ── Circle-OBB Collision ──
function circleOBBOverlap(cirX, cirY, cirR, obb) {
  var dx = cirX - obb.cx, dy = cirY - obb.cy;
  var cos = Math.cos(-obb.angle), sin = Math.sin(-obb.angle);
  var localX = dx * cos - dy * sin;
  var localY = dx * sin + dy * cos;
  var closestX = Math.max(-obb.hw, Math.min(obb.hw, localX));
  var closestY = Math.max(-obb.hh, Math.min(obb.hh, localY));
  var distX = localX - closestX, distY = localY - closestY;
  return (distX * distX + distY * distY) <= cirR * cirR;
}

// ── Spiral generators ──
function spiralArchimedean(step, cx, cy, a, aspectX, aspectY) {
  var t = step * 0.08;
  var r = a * t;
  return { x: cx + r * Math.cos(t) * aspectX, y: cy + r * Math.sin(t) * aspectY };
}

function spiralRectangular(step, cx, cy, spacing) {
  var x = 0, y = 0;
  var dxDir = spacing, dyDir = 0;
  var segLen = 1, segPassed = 0, turns = 0;
  for (var i = 0; i < step; i++) {
    x += dxDir;
    y += dyDir;
    segPassed++;
    if (segPassed >= segLen) {
      segPassed = 0;
      var tmp = dxDir;
      dxDir = -dyDir;
      dyDir = tmp;
      turns++;
      if (turns % 2 === 0) segLen++;
    }
  }
  return { x: cx + x, y: cy + y };
}

// ── Angle functions per layout ──
function getWordAngle(layoutId, idx, total, rng, px, py, cx, cy) {
  switch (layoutId) {
    case 'gentle':
      var opts = [0, 0, 0, 0, -0.22, 0.22, -0.15, 0.15];
      return opts[Math.floor(rng() * opts.length)];
    case 'classic':
      return rng() < 0.35 ? Math.PI / 2 : 0;
    case 'playful':
      var angles = [-0.44, -0.17, 0, 0.17, 0.44];
      return angles[Math.floor(rng() * angles.length)];
    case 'horizontal':
      return 0;
    case 'starburst':
      var ang = Math.atan2(py - cy, px - cx);
      if (Math.abs(ang) > Math.PI / 2) ang += Math.PI;
      return ang;
    default:
      return 0;
  }
}

// ── Font assignment ──
function getWordFont(fontSet, idx, total, count, maxCount, rng) {
  var t = count / maxCount;
  var useSerif = t > 0.3 ? rng() < 0.7 : rng() < 0.35;
  if (useSerif) {
    return '"' + fontSet.serif + '", ' + fontSet.serifFallback;
  }
  return '"' + fontSet.script + '", ' + fontSet.scriptFallback;
}

// ── Font size scaling ──
function calcFontSize(count, minC, maxC, minS, maxS) {
  if (maxC === minC) return (minS + maxS) / 2;
  var t = (count - minC) / (maxC - minC);
  return minS + (maxS - minS) * Math.pow(t, 0.65);
}

// ── Main placement engine ──
var SVG_W = 1190, SVG_H = 842;
var MARGIN = 30;
var PADDING = 4;
var CLOUD_BOTTOM = SVG_H - 45;

function placeWords() {
  var rng = mulberry32(state.seed);
  var palette = PALETTES[state.palette];
  var fontSet = FONT_SETS[state.fonts];
  var layoutId = LAYOUTS[state.layout].id;

  var words = DATA.words.slice().sort(function(a, b) { return b.count - a.count; });
  var maxC = words[0].count;
  var minC = words[words.length - 1].count;
  var maxFontSize = 78;
  var minFontSize = 15;

  var cx = SVG_W / 2;
  var cy = (MARGIN + CLOUD_BOTTOM) / 2;
  var placed = [];

  var centerMode = CENTER_MODES[state.center].id;
  if (centerMode === 'name') {
    var nameMeas = measureText(CENTER_NAME, CENTER_NAME_SIZE, fontSet.serif);
    placed.push({ obb: makeOBB(cx, cy, nameMeas.w / 2 + 20, CENTER_NAME_SIZE * 0.55 + 10, 0), isExclusion: true });
  }

  for (var wi = 0; wi < words.length; wi++) {
    var word = words[wi];
    var fontSize = calcFontSize(word.count, minC, maxC, minFontSize, maxFontSize);
    var font = getWordFont(fontSet, wi, words.length, word.count, maxC, rng);
    var color = palette.colors[wi % palette.colors.length];
    var meas = measureText(word.word, fontSize, font.split(',')[0].replace(/"/g, ''));
    var hw = meas.w / 2 + PADDING;
    var hh = meas.h / 2 + PADDING;

    var isPlaced = false;
    var maxSteps = 12000;

    for (var step = 0; step < maxSteps; step++) {
      var pos;
      var spiralA = layoutId === 'classic' ? 1.2 : layoutId === 'horizontal' ? 1.8 : layoutId === 'starburst' ? 2.0 : 1.6;
      pos = spiralArchimedean(step, cx, cy, spiralA, 1.4, 1.0);

      var angle = getWordAngle(layoutId, wi, words.length, rng, pos.x, pos.y, cx, cy);

      var cosA = Math.cos(angle), sinA = Math.sin(angle);
      var rotHW = Math.abs(hw * cosA) + Math.abs(hh * sinA);
      var rotHH = Math.abs(hw * sinA) + Math.abs(hh * cosA);

      if (pos.x - rotHW < MARGIN || pos.x + rotHW > SVG_W - MARGIN ||
          pos.y - rotHH < MARGIN || pos.y + rotHH > CLOUD_BOTTOM) {
        continue;
      }

      var obb = makeOBB(pos.x, pos.y, hw, hh, angle);
      var overlaps = false;
      if (centerMode === 'photo' && circleOBBOverlap(cx, cy, PHOTO_EXCLUSION_R, obb)) {
        overlaps = true;
      }
      if (!overlaps) {
        for (var pi = 0; pi < placed.length; pi++) {
          if (obbOverlap(obb, placed[pi].obb)) {
            overlaps = true;
            break;
          }
        }
      }

      if (!overlaps) {
        placed.push({
          word: word.word,
          count: word.count,
          x: pos.x,
          y: pos.y,
          fontSize: fontSize,
          angle: angle,
          font: font,
          color: color,
          obb: obb
        });
        isPlaced = true;
        break;
      }
    }
  }

  return placed;
}

// ── SVG Rendering ──
function renderSVG(placements) {
  var svg = document.getElementById('cloud-svg');
  svg.style.opacity = '0';

  var fontSet = FONT_SETS[state.fonts];
  var titleFont = '"' + fontSet.serif + '", ' + fontSet.serifFallback;

  var palette = PALETTES[state.palette];
  var centerMode = CENTER_MODES[state.center].id;
  var cx = SVG_W / 2, cy = (MARGIN + CLOUD_BOTTOM) / 2;

  var parts = [];
  parts.push('<rect width="1190" height="842" fill="white"/>');

  if (centerMode === 'photo') {
    parts.push('<defs><clipPath id="photo-clip"><circle cx="' + cx + '" cy="' + cy + '" r="' + PHOTO_RADIUS + '"/></clipPath></defs>');
    parts.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + (PHOTO_RADIUS + 3) + '" fill="none" stroke="#d8c8b8" stroke-width="2.5"/>');
    parts.push('<image href="' + PHOTO_URI + '" x="' + (cx - PHOTO_RADIUS - 10) + '" y="' + (cy - PHOTO_RADIUS - 10) + '" width="' + (PHOTO_RADIUS * 2 + 20) + '" height="' + (PHOTO_RADIUS * 2 + 20) + '" clip-path="url(#photo-clip)" preserveAspectRatio="xMidYMid slice"/>');
  } else if (centerMode === 'name') {
    parts.push('<text x="' + cx + '" y="' + cy + '" text-anchor="middle" dominant-baseline="central"' +
      ' font-family="' + escAttr(titleFont) + '" font-size="' + CENTER_NAME_SIZE + '"' +
      ' fill="' + palette.colors[0] + '" opacity="0.4">' + escXml(CENTER_NAME) + '</text>');
  }

  for (var i = 0; i < placements.length; i++) {
    var p = placements[i];
    if (p.isExclusion) continue;
    var angleDeg = (p.angle * 180 / Math.PI).toFixed(2);
    var op = (0.78 + 0.22 * (p.count / DATA.words[0].count)).toFixed(2);
    parts.push(
      '<text x="0" y="0" transform="translate(' + p.x.toFixed(1) + ',' + p.y.toFixed(1) + ') rotate(' + angleDeg + ')"' +
      ' font-family="' + escAttr(p.font) + '"' +
      ' font-size="' + p.fontSize.toFixed(1) + '"' +
      ' fill="' + p.color + '"' +
      ' opacity="' + op + '"' +
      ' text-anchor="middle" dominant-baseline="central">' +
      escXml(p.word) + '</text>'
    );
  }

  parts.push(
    '<text x="595" y="826" text-anchor="middle" font-family="' + escAttr(titleFont) + '"' +
    ' font-size="13" fill="#b0a090" letter-spacing="2.5" font-variant="small-caps">' +
    escXml(DATA.title) + '</text>'
  );

  svg.innerHTML = parts.join('\\n');
  requestAnimationFrame(function() { svg.style.opacity = '1'; });
}

function escXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

// ── UI Setup ──
function buildToggles() {
  var palBox = document.getElementById('palette-toggles');
  PALETTES.forEach(function(pal, i) {
    var btn = document.createElement('button');
    btn.className = 'toggle-btn' + (i === state.palette ? ' active' : '');
    var dots = '';
    for (var d = 0; d < 4; d++) {
      dots += '<span class="palette-dot" style="background:' + pal.colors[d] + '"></span>';
    }
    btn.innerHTML = '<span class="palette-preview">' + dots + '</span>' + pal.name;
    btn.onclick = function() { state.palette = i; updateToggles(); regenerate(); };
    palBox.appendChild(btn);
  });

  var fontBox = document.getElementById('font-toggles');
  FONT_SETS.forEach(function(fs, i) {
    var btn = document.createElement('button');
    btn.className = 'toggle-btn' + (i === state.fonts ? ' active' : '');
    btn.style.fontFamily = '"' + fs.serif + '", serif';
    btn.textContent = fs.name;
    btn.onclick = function() { state.fonts = i; updateToggles(); regenerate(); };
    fontBox.appendChild(btn);
  });

  var layBox = document.getElementById('layout-toggles');
  LAYOUTS.forEach(function(lay, i) {
    var btn = document.createElement('button');
    btn.className = 'toggle-btn' + (i === state.layout ? ' active' : '');
    btn.textContent = lay.name;
    btn.onclick = function() { state.layout = i; updateToggles(); regenerate(); };
    layBox.appendChild(btn);
  });

  var cenBox = document.getElementById('center-toggles');
  CENTER_MODES.forEach(function(mode, i) {
    var btn = document.createElement('button');
    btn.className = 'toggle-btn' + (i === state.center ? ' active' : '');
    btn.textContent = mode.name;
    btn.onclick = function() { state.center = i; updateToggles(); regenerate(); };
    cenBox.appendChild(btn);
  });

  document.getElementById('btn-shuffle').onclick = function() {
    state.seed = Math.floor(Math.random() * 100000);
    regenerate();
  };

  document.getElementById('btn-download').onclick = downloadSVG;
  document.getElementById('btn-print').onclick = function() { window.print(); };
}

function updateToggles() {
  var groups = [
    { el: 'palette-toggles', val: state.palette },
    { el: 'font-toggles', val: state.fonts },
    { el: 'layout-toggles', val: state.layout },
    { el: 'center-toggles', val: state.center }
  ];
  groups.forEach(function(g) {
    var btns = document.getElementById(g.el).children;
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', i === g.val);
    }
  });
}

function downloadSVG() {
  var svg = document.getElementById('cloud-svg');
  var content = '<?xml version="1.0" encoding="UTF-8"?>\\n' + svg.outerHTML;
  var blob = new Blob([content], { type: 'image/svg+xml' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'wordcloud.svg';
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── URL Params ──
function stateToURL() {
  var params = new URLSearchParams();
  params.set('p', state.palette);
  params.set('f', state.fonts);
  params.set('l', state.layout);
  params.set('c', state.center);
  params.set('s', state.seed);
  history.replaceState(null, '', '?' + params.toString());
}

function stateFromURL() {
  var params = new URLSearchParams(window.location.search);
  if (params.has('p')) state.palette = Math.min(parseInt(params.get('p'), 10) || 0, PALETTES.length - 1);
  if (params.has('f')) state.fonts = Math.min(parseInt(params.get('f'), 10) || 0, FONT_SETS.length - 1);
  if (params.has('l')) state.layout = Math.min(parseInt(params.get('l'), 10) || 0, LAYOUTS.length - 1);
  if (params.has('c')) state.center = Math.min(parseInt(params.get('c'), 10) || 0, CENTER_MODES.length - 1);
  if (params.has('s')) state.seed = parseInt(params.get('s'), 10) || 42;
}

function regenerate() {
  stateToURL();
  var placements = placeWords();
  renderSVG(placements);
}

// ── Init ──
stateFromURL();
buildToggles();
updateToggles();
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(function() { regenerate(); });
} else {
  window.addEventListener('load', regenerate);
}
</script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('Generated index.html — open it in your browser or run: npm start');
