import { ParticleShape } from '../types';

/**
 * Generates a Data URL for a sprite texture based on the shape and color.
 * We use canvas to avoid external asset dependencies and CORS issues.
 */
export const generateParticleTexture = (shape: ParticleShape, color: string): HTMLCanvasElement => {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  // willReadFrequently optimizes the canvas for frequent readback (like creating textures)
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) return canvas;

  const center = size / 2;
  const radius = size / 2 - 4;

  ctx.clearRect(0, 0, size, size);

  // Helper for glow
  const createGlow = () => {
    const gradient = ctx.createRadialGradient(center, center, radius * 0.2, center, center, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.4, color); // The core color
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)'); // The narrow halo
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    return gradient;
  };

  ctx.fillStyle = createGlow();

  switch (shape) {
    case 'sphere':
      ctx.beginPath();
      ctx.arc(center, center, radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
      // Add a narrow ring/halo
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(center, center, radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case 'snowflake':
      ctx.save();
      ctx.translate(center, center);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;

      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -radius * 0.8);
        ctx.stroke();
        
        // Branches
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.4);
        ctx.lineTo(radius * 0.2, -radius * 0.6);
        ctx.moveTo(0, -radius * 0.4);
        ctx.lineTo(-radius * 0.2, -radius * 0.6);
        ctx.stroke();

        ctx.rotate(Math.PI / 3);
      }
      ctx.restore();
      
      // Soft center glow
      ctx.beginPath();
      ctx.arc(center, center, radius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.fill();
      break;

    case 'petal':
      ctx.save();
      ctx.translate(center, center);
      ctx.fillStyle = color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'white';
      
      // Draw 5 petals
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(20, -radius, 0, -radius);
        ctx.quadraticCurveTo(-20, -radius, 0, 0);
        ctx.fill();
        ctx.rotate((Math.PI * 2) / 5);
      }
      ctx.restore();
      break;
    
    case 'star':
      ctx.save();
      ctx.translate(center, center);
      ctx.fillStyle = color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'white';
      
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(0, -radius * 0.8);
        ctx.rotate(Math.PI / 5);
        ctx.lineTo(0, -radius * 0.3);
        ctx.rotate(Math.PI / 5);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
  }

  return canvas;
};