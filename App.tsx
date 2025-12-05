import React, { useState, useCallback } from 'react';
import ThreeCanvas from './components/ThreeCanvas';
import UIOverlay from './components/UIOverlay';
import { ParticleShape } from './types';

const App: React.FC = () => {
  // Application State
  const [color, setColor] = useState<string>('#00f3ff');
  const [shape, setShape] = useState<ParticleShape>('sphere');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Handlers
  const handleToggleExpansion = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);

  // Listen for native fullscreen changes (ESC key)
  React.useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  return (
    <div className="relative w-full h-screen bg-neutral-950 overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* 3D Scene Layer */}
      <ThreeCanvas 
        color={color}
        shape={shape}
        isExpanded={isExpanded}
        rotationSpeed={isExpanded ? 0.2 : 1.0} // Slow down rotation when dispersed
        onCanvasClick={handleToggleExpansion}
      />

      {/* UI Layer */}
      <UIOverlay 
        color={color}
        setColor={setColor}
        shape={shape}
        setShape={setShape}
        isExpanded={isExpanded}
        toggleExpansion={handleToggleExpansion}
        isFullscreen={isFullscreen}
        toggleFullscreen={handleToggleFullscreen}
      />
      
    </div>
  );
};

export default App;
