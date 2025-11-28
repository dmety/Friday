import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  volume: number;
}

export const Visualizer: React.FC<VisualizerProps> = ({ volume }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef(volume);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    // Use ResizeObserver for robust sizing without crashing
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === container) {
            canvas.width = entry.contentRect.width;
            canvas.height = entry.contentRect.height;
        }
      }
    });

    resizeObserver.observe(container);

    const render = () => {
      if (!canvas || !ctx) return;
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // We'll draw 3 overlapping sine waves
      const lines = [
        { color: 'rgba(34, 211, 238, 0.8)', amplitude: 0.6, frequency: 0.03, speed: 0.1 },
        { color: 'rgba(6, 182, 212, 0.5)', amplitude: 0.4, frequency: 0.05, speed: 0.15 },
        { color: 'rgba(165, 243, 252, 0.3)', amplitude: 0.2, frequency: 0.02, speed: 0.05 },
      ];

      lines.forEach((line) => {
        ctx.beginPath();
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 2;

        for (let x = 0; x <= width; x++) {
          const vol = volumeRef.current;
          // Base amplitude + volume reaction
          const effectiveAmp = (vol * line.amplitude * 1.5) + (line.amplitude * 10); 
          
          const y = centerY + 
                    Math.sin(x * line.frequency + phase * line.speed) * effectiveAmp * Math.sin(x / width * Math.PI); 
          
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      phase += 0.2;
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      resizeObserver.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
        <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};