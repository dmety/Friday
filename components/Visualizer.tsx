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

    let circles: { r: number, a: number }[] = [];
    let animationId: number;

    const render = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = canvas.parentElement?.clientHeight || 300;
      const { width, height } = canvas;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Add new ripple if volume is high enough
      if (volume > 5) {
        circles.push({ r: 20, a: volume / 200 }); // Initial radius and opacity
      }

      // Draw and update circles
      for (let i = 0; i < circles.length; i++) {
        const c = circles[i];
        ctx.beginPath();
        ctx.arc(centerX, centerY, c.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34, 211, 238, ${c.a})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Update
        c.r += 2; // Expand speed
        c.a -= 0.02; // Fade speed
      }

      // Remove invisible circles
      circles = circles.filter(c => c.a > 0);

      // Center "Core"
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10 + volume/5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34, 211, 238, ${0.5 + volume/255})`;
      ctx.fill();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#22d3ee';

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [volume]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};