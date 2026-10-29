import { CanvasTexture, SRGBColorSpace, type Texture } from 'three';

export interface GuitarTextures {
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
  gradient.addColorStop(0, '#1a1712');
  gradient.addColorStop(0.55, '#0d0b09');
  gradient.addColorStop(0.88, '#070605');
  gradient.addColorStop(1, '#020202');
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(center, center, radius * 0.985, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = 'rgba(215, 178, 100, 0.95)';
  context.lineWidth = 4;
  context.beginPath();
  context.arc(center, center, radius * 0.9, 0, Math.PI * 2);
  context.stroke();
  context.strokeStyle = 'rgba(215, 178, 100, 0.4)';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(center, center, radius * 0.84, 0, Math.PI * 2);
  context.stroke();

  context.fillStyle = '#e2c283';
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
    context.strokeStyle = '#d7b264';
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
  context.fillStyle = '#d7b264';
  context.beginPath();
  context.arc(center, center, radius * 0.08, 0, Math.PI * 2);
  context.fill();
  context.font = '600 20px Helvetica, Arial, sans-serif';
  context.fillStyle = '#e2c283';
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
  context.fillStyle = '#090807';
  context.fill();
  context.strokeStyle = 'rgba(215, 178, 100, 0.9)';
  context.lineWidth = 4;
  context.stroke();
  context.restore();

  context.fillStyle = '#e2c283';
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
  context.fillText('C U S T O M', width / 2, height * 0.78);
}

function drawStandard(context: CanvasRenderingContext2D, width: number, height: number): void {
  context.clearRect(0, 0, width, height);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#efe6d2';
  context.font = '500 64px Georgia, serif';
  context.fillText('Custom', width / 2, height / 2);
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
