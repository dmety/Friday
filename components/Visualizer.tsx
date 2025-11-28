import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  volume: number;
}

export const Visualizer: React.FC<VisualizerProps> = ({ volume }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const render = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = canvas.parentElement?.clientHeight || 300;
      const { width, height } = canvas;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Configuration for lines
      // We'll draw 3 overlapping sine waves to create a voice modulation effect
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
          // Use volume to scale the amplitude. 
          // If volume is 0, the line should be flat (amplitude close to 0).
          // We add a small base noise so it's not perfectly dead flat when silent.
          const effectiveAmp = (volume * line.amplitude * 1.5) + 1; 
          
          const y = centerY + 
                    Math.sin(x * line.frequency + phase * line.speed) * effectiveAmp * Math.sin(x / width * Math.PI); // Windowing function to taper ends
          
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Update phase for animation
      phase += 0.2;

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [volume]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};