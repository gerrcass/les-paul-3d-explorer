import { CanvasTexture, SRGBColorSpace, type Texture } from 'three';

export interface GuitarTextures {
  readonly sunburst: Texture;
  readonly mahogany: Texture;
  readonly rosewood: Texture;
  readonly veneer: Texture;
  readonly knobTopVolume: Texture;
  readonly knobTopTone: Texture;
  readonly pokerChip: Texture;
  readonly logo: Texture;
  readonly script: Texture;
  readonly standard: Texture;
  readonly floor: Texture;
  readonly glow: Texture;
  readonly contactShadow: Texture;
}

type Draw = (context: CanvasRenderingContext2D, width: number, height: number) => void;

function createTexture(width: number, height: number, draw: Draw, anisotropy: number): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context unavailable');
  draw(context, width, height);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
  return texture;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawSunburst(context: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = context.createRadialGradient(
    width * 0.5,
    height * 0.5,
    width * 0.02,
    width * 0.5,
    height * 0.48,
    width * 0.67,
  );
  gradient.addColorStop(0, '#efbe66');
  gradient.addColorStop(0.14, '#e4a94f');
  gradient.addColorStop(0.3, '#d18f40');
  gradient.addColorStop(0.45, '#b86a2c');
  gradient.addColorStop(0.6, '#99451f');
  gradient.addColorStop(0.72, '#792b15');
  gradient.addColorStop(0.84, '#53160b');
  gradient.addColorStop(0.94, '#2b0904');
  gradient.addColorStop(1, '#160302');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  const random = mulberry32(1959);

  // Flame figure: soft horizontal ribbons across the vertical grain.
  context.save();
  context.globalCompositeOperation = 'overlay';
  for (let i = 0; i < 90; i += 1) {
    const y = random() * height;
    const thickness = 2 + random() * 16;
    const alpha = 0.05 + random() * 0.12;
    const wobble = 3 + random() * 12;
    const phase = random() * Math.PI * 2;
    context.beginPath();
    for (let x = -20; x <= width + 20; x += 16) {
      const yy = y + Math.sin(x / 90 + phase) * wobble + Math.sin(x / 23 + phase * 2) * 2;
      if (x === -20) context.moveTo(x, yy);
      else context.lineTo(x, yy);
    }
    context.strokeStyle = random() > 0.5 ? `rgba(255, 219, 156, ${alpha})` : `rgba(86, 24, 8, ${alpha})`;
    context.lineWidth = thickness;
    context.stroke();
  }
  context.restore();

  // Fine grain.
  context.save();
  context.globalAlpha = 0.045;
  for (let i = 0; i < 1400; i += 1) {
    const y = random() * height;
    const tone = random() > 0.5 ? 30 : 230;
    context.strokeStyle = `rgb(${tone}, ${tone * 0.55}, ${tone * 0.38})`;
    context.lineWidth = 0.6;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y + (random() - 0.5) * 4);
    context.stroke();
  }
  context.restore();

  // Edge falloff and a little pore texture near the rim.
  const vignette = context.createRadialGradient(
    width * 0.5,
    height * 0.5,
    width * 0.3,
    width * 0.5,
    height * 0.5,
    width * 0.78,
  );
  vignette.addColorStop(0, 'rgba(20, 6, 2, 0)');
  vignette.addColorStop(0.72, 'rgba(28, 8, 3, 0.08)');
  vignette.addColorStop(1, 'rgba(12, 3, 1, 0.5)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);
}

function drawMahogany(context: CanvasRenderingContext2D, width: number, height: number): void {
  context.fillStyle = '#5b2f1e';
  context.fillRect(0, 0, width, height);
  const random = mulberry32(42);
  context.save();
  for (let i = 0; i < 170; i += 1) {
    const x = random() * width;
    const alpha = 0.04 + random() * 0.14;
    const wobble = 4 + random() * 18;
    const phase = random() * Math.PI * 2;
    context.beginPath();
    for (let y = -10; y <= height + 10; y += 12) {
      const xx = x + Math.sin(y / 80 + phase) * wobble + Math.sin(y / 22 + phase) * 2;
      if (y === -10) context.moveTo(xx, y);
      else context.lineTo(xx, y);
    }
    context.strokeStyle = random() > 0.42 ? `rgba(44, 18, 10, ${alpha})` : `rgba(148, 84, 49, ${alpha * 0.8})`;
    context.lineWidth = 0.8 + random() * 4.5;
    context.stroke();
  }
  // Broad tonal variation.
  for (let i = 0; i < 26; i += 1) {
    const x = random() * width;
    const y = random() * height;
    const radius = 30 + random() * 130;
    const tone = context.createRadialGradient(x, y, 0, x, y, radius);
    const warm = random() > 0.5;
    tone.addColorStop(0, warm ? 'rgba(129, 66, 37, 0.13)' : 'rgba(33, 14, 8, 0.16)');
    tone.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = tone;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  context.restore();
}

function drawRosewood(context: CanvasRenderingContext2D, width: number, height: number): void {
  context.fillStyle = '#3c241a';
  context.fillRect(0, 0, width, height);
  const random = mulberry32(7);
  for (let i = 0; i < 340; i += 1) {
    const x = random() * width;
    const alpha = 0.05 + random() * 0.2;
    context.strokeStyle = random() > 0.4 ? `rgba(24, 12, 8, ${alpha})` : `rgba(109, 68, 48, ${alpha * 0.8})`;
    context.lineWidth = 0.6 + random() * 3;
    context.beginPath();
    context.moveTo(x, 0);
    context.bezierCurveTo(x + 10, height * 0.33, x - 8, height * 0.66, x + 4, height);
    context.stroke();
  }
  for (let i = 0; i < 900; i += 1) {
    const x = random() * width;
    const y = random() * height;
    context.fillStyle = `rgba(12, 7, 5, ${0.1 + random() * 0.25})`;
    context.fillRect(x, y, 1 + random() * 2, 1 + random() * 3);
  }
}

function drawVeneer(context: CanvasRenderingContext2D, width: number, height: number): void {
  context.fillStyle = '#050403';
  context.fillRect(0, 0, width, height);
  const random = mulberry32(99);
  for (let i = 0; i < 90; i += 1) {
    const y = random() * height;
    context.strokeStyle = `rgba(52, 45, 38, ${0.02 + random() * 0.04})`;
    context.lineWidth = 0.5 + random() * 1.5;
    context.beginPath();
    context.moveTo(0, y);
    context.bezierCurveTo(width * 0.3, y + 4, width * 0.7, y - 4, width, y + 1);
    context.stroke();
  }
}

function drawKnobTop(context: CanvasRenderingContext2D, width: number, height: number, label: string): void {
  context.clearRect(0, 0, width, height);
  const center = width / 2;
  const radius = width * 0.5;
  const gradient = context.createRadialGradient(center, center, 2, center, center, radius);
  gradient.addColorStop(0, '#f6d987');
  gradient.addColorStop(0.55, '#d9a544');
  gradient.addColorStop(0.88, '#a46f27');
  gradient.addColorStop(1, '#6f4514');
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(center, center, radius * 0.985, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = 'rgba(47, 25, 5, 0.9)';
  context.lineWidth = 4;
  context.beginPath();
  context.arc(center, center, radius * 0.9, 0, Math.PI * 2);
  context.stroke();
  context.strokeStyle = 'rgba(255, 240, 190, 0.32)';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(center, center, radius * 0.84, 0, Math.PI * 2);
  context.stroke();

  context.fillStyle = '#1e1206';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  for (let value = 0; value <= 10; value += 1) {
    const angle = (-225 + (value / 10) * 270) * (Math.PI / 180);
    const inner = radius * 0.68;
    const outer = radius * 0.82;
    context.save();
    context.translate(center, center);
    context.rotate(angle);
    context.lineWidth = 3;
    context.strokeStyle = '#2a1808';
    context.beginPath();
    context.moveTo(inner, 0);
    context.lineTo(outer, 0);
    context.stroke();
    context.translate(radius * 0.56, 0);
    context.rotate(Math.PI / 2);
    context.font = '600 22px Georgia, serif';
    context.fillText(String(value), 0, 0);
    context.restore();
  }
  context.fillStyle = '#241505';
  context.beginPath();
  context.arc(center, center, radius * 0.08, 0, Math.PI * 2);
  context.fill();
  context.font = '600 20px Helvetica, Arial, sans-serif';
  context.fillText(label, center, center + radius * 0.36);
}

function drawPokerChip(context: CanvasRenderingContext2D, width: number, height: number): void {
  context.clearRect(0, 0, width, height);
  const center = width / 2;
  const outer = width * 0.49;
  const inner = width * 0.27;
  context.save();
  context.beginPath();
  context.arc(center, center, outer, 0, Math.PI * 2);
  context.arc(center, center, inner, 0, Math.PI * 2, true);
  context.fillStyle = '#ecdcb8';
  context.fill();
  context.strokeStyle = 'rgba(48, 34, 14, 0.35)';
  context.lineWidth = 3;
  context.stroke();
  context.restore();

  context.fillStyle = '#191006';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = '700 42px Helvetica, Arial, sans-serif';
  context.fillText('RHYTHM', center, center - width * 0.39);
  context.fillText('TREBLE', center, center + width * 0.39);
}

function drawLogo(context: CanvasRenderingContext2D, width: number, height: number): void {
  context.clearRect(0, 0, width, height);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = 'italic 700 108px Georgia, "Times New Roman", serif';
  context.fillStyle = '#f4ead2';
  context.shadowColor = 'rgba(255, 244, 214, 0.55)';
  context.shadowBlur = 10;
  context.fillText('Gibson', width / 2, height / 2);
  context.shadowBlur = 0;
  context.strokeStyle = 'rgba(96, 78, 50, 0.55)';
  context.lineWidth = 2;
  context.strokeText('Gibson', width / 2, height / 2);
}

function drawScript(context: CanvasRenderingContext2D, width: number, height: number): void {
  context.clearRect(0, 0, width, height);
  context.textAlign = 'center';
  context.fillStyle = '#eadfc4';
  context.font = 'italic 600 68px Georgia, "Times New Roman", serif';
  context.fillText('Les Paul', width / 2, height * 0.44);
  context.font = '600 22px Helvetica, Arial, sans-serif';
  context.fillText('M O D E L', width / 2, height * 0.78);
}

function drawStandard(context: CanvasRenderingContext2D, width: number, height: number): void {
  context.clearRect(0, 0, width, height);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#efe6d2';
  context.font = '500 64px Georgia, serif';
  context.fillText('Standard', width / 2, height / 2);
}

function drawFloor(context: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = context.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.03,
    width / 2,
    height / 2,
    width * 0.52,
  );
  gradient.addColorStop(0, 'rgba(33, 28, 23, 0.95)');
  gradient.addColorStop(0.45, 'rgba(23, 19, 16, 0.7)');
  gradient.addColorStop(0.75, 'rgba(12, 10, 9, 0.28)');
  gradient.addColorStop(1, 'rgba(6, 5, 4, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function drawGlow(context: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = context.createRadialGradient(
    width / 2,
    height * 0.52,
    0,
    width / 2,
    height * 0.52,
    width * 0.5,
  );
  gradient.addColorStop(0, 'rgba(208, 148, 76, 0.34)');
  gradient.addColorStop(0.45, 'rgba(132, 82, 39, 0.14)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function drawContactShadow(context: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = context.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    width * 0.5,
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.82)');
  gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.45)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

export function createGuitarTextures(anisotropy = 8): GuitarTextures {
  return {
    sunburst: createTexture(1024, 1400, drawSunburst, anisotropy),
    mahogany: createTexture(512, 1024, drawMahogany, anisotropy),
    rosewood: createTexture(512, 1024, drawRosewood, anisotropy),
    veneer: createTexture(512, 512, drawVeneer, anisotropy),
    knobTopVolume: createTexture(256, 256, (context, width, height) => drawKnobTop(context, width, height, 'VOL'), anisotropy),
    knobTopTone: createTexture(256, 256, (context, width, height) => drawKnobTop(context, width, height, 'TONE'), anisotropy),
    pokerChip: createTexture(512, 512, drawPokerChip, anisotropy),
    logo: createTexture(512, 160, drawLogo, anisotropy),
    script: createTexture(512, 160, drawScript, anisotropy),
    standard: createTexture(256, 96, drawStandard, anisotropy),
    floor: createTexture(1024, 1024, drawFloor, anisotropy),
    glow: createTexture(512, 512, drawGlow, anisotropy),
    contactShadow: createTexture(512, 256, drawContactShadow, anisotropy),
  };
}
