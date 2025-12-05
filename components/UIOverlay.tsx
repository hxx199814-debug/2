import React from 'react';
import { ParticleShape } from '../types';
import { Settings2, Maximize2, Minimize2, MousePointerClick } from 'lucide-react';

interface UIOverlayProps {
  color: string;
  setColor: (c: string) => void;
  shape: ParticleShape;
  setShape: (s: ParticleShape) => void;
  isExpanded: boolean;
  toggleExpansion: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

const SHAPES: { id: ParticleShape; label: string }[] = [
  { id: 'sphere', label: 'Orb' },
  { id: 'snowflake', label: 'Snow' },
  { id: 'petal', label: 'Petal' },
  { id: 'star', label: 'Star' },
];

const PRESET_COLORS = [
  '#00f3ff', // Cyan
  '#ff0055', // Magenta
  '#ffcc00', // Gold
  '#55ff00', // Lime
  '#ffffff', // White
  '#aa00ff', // Violet
];

const UIOverlay: React.FC<UIOverlayProps> = ({
  color,
  setColor,
  shape,
  setShape,
  isExpanded,
  toggleExpansion,
  isFullscreen,
  toggleFullscreen,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
      
      {/* Header / Top Bar */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tighter drop-shadow-md">
            Particle<span className="text-cyan-400">Sphere</span>
          </h1>
          <p className="text-white/60 text-sm mt-1 max-w-xs">
            Interactive 3D System. Click the void to disperse.
          </p>
        </div>
        
        <button
          onClick={toggleFullscreen}
          className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all text-white"
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* Helper Text (Middle) - Only show if not expanded */}
      {!isExpanded && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/30 text-center animate-pulse hidden md:block">
          <MousePointerClick className="mx-auto mb-2" size={32} />
          <span className="uppercase tracking-widest text-xs">Click to Disperse</span>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="pointer-events-auto w-full max-w-2xl mx-auto backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          
          {/* Shape Selector */}
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <label className="text-xs uppercase tracking-wider text-white/50 font-semibold flex items-center gap-2">
              <Settings2 size={12} /> Model Type
            </label>
            <div className="flex bg-black/30 rounded-lg p-1 border border-white/5">
              {SHAPES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setShape(s.id)}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    shape === s.id
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">
              Particle Color
            </label>
            <div className="flex gap-2 items-center">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    color === c ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
              <div className="w-px h-8 bg-white/10 mx-2"></div>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 bg-transparent border-0 cursor-pointer rounded overflow-hidden p-0"
                title="Custom Color"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
