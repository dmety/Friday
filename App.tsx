import React, { useState } from 'react';
import { useFridayLive } from './hooks/useFridayLive';
import { Visualizer } from './components/Visualizer';
import { SystemStatusModule } from './components/SystemStatusModule';
import { LogPanel } from './components/LogPanel';
import { ConnectionState } from './types';
import { Power, Crosshair, AlertOctagon, RefreshCw } from 'lucide-react';

export default function App() {
  const { 
    connect, 
    disconnect, 
    connectionState, 
    videoRef, 
    canvasRef, 
    logs, 
    volume 
  } = useFridayLive();

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Simulate eye tracking by following mouse slightly
  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX - window.innerWidth / 2) / 50;
    const y = (e.clientY - window.innerHeight / 2) / 50;
    setMousePos({ x, y });
  };

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-black text-cyan-400 font-sans selection:bg-cyan-500/30 cursor-crosshair"
      onMouseMove={handleMouseMove}
    >
      
      {/* 1. Background Video Feed (Mirrored & Grayscale) */}
      <div className="absolute inset-0 z-0">
         <video 
           ref={videoRef} 
           className="w-full h-full object-cover scale-x-[-1] opacity-50 grayscale contrast-125 brightness-75" 
           autoPlay 
           playsInline 
           muted 
         />
         {/* Vignette & Scanlines */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)]"></div>
         <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,6px_100%] pointer-events-none opacity-20"></div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* 2. Main HUD Layer */}
      <div className="absolute inset-0 z-20 p-6 grid grid-cols-12 gap-6 pointer-events-none">
        
        {/* Top Header */}
        <div className="col-span-12 flex justify-between items-start border-t-2 border-cyan-500/20 pt-2">
           <div>
              <h1 className="text-4xl font-bold tracking-[0.2em] tech-mono text-cyan-100 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                F.R.I.D.A.Y.
              </h1>
              <div className="text-xs uppercase text-cyan-600 tracking-[0.5em] mt-1 ml-1">TACTICAL SUPPORT SYSTEM</div>
           </div>
           <div className="flex flex-col items-end">
              <div className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${connectionState === ConnectionState.CONNECTED ? 'text-cyan-400' : 'text-red-500 animate-pulse'}`}>
                 {connectionState === ConnectionState.CONNECTED ? 'ONLINE' : connectionState === ConnectionState.ERROR ? 'SYSTEM FAILURE' : 'OFFLINE'}
                 <div className={`w-3 h-3 rounded-full ${connectionState === ConnectionState.CONNECTED ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-red-500'}`}></div>
              </div>
              <div className="text-[10px] text-cyan-700 tech-mono mt-1">
                SECURE_CONNECTION_V2.05
              </div>
           </div>
        </div>

        {/* Left Column: Stats */}
        <div className="col-span-3 flex flex-col justify-center gap-4 pointer-events-auto">
           <SystemStatusModule />
        </div>

        {/* Center: Face Tracking & Visualizer */}
        <div className="col-span-6 relative flex flex-col items-center justify-center">
           
           {/* Dynamic Face Tracking Reticle */}
           <div 
              className="absolute pointer-events-none transition-transform duration-100 ease-out"
              style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
           >
              <div className="w-80 h-80 border border-cyan-500/20 rounded-lg relative flex items-center justify-center">
                  {/* Corners */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/60"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/60"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/60"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/60"></div>
                  
                  {/* Center Cross */}
                  <div className="w-4 h-4 border border-cyan-500/30 rounded-full flex items-center justify-center">
                    <div className="w-0.5 h-0.5 bg-cyan-400"></div>
                  </div>

                  {/* Scanning Line */}
                  <div className="absolute inset-x-0 h-[1px] bg-cyan-400/20 animate-scanline"></div>

                  {/* Label */}
                  <div className="absolute -bottom-8 text-center w-full">
                     <span className="text-[10px] bg-cyan-900/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/50 tracking-widest tech-mono">
                        {connectionState === ConnectionState.CONNECTED ? 'TARGET: MASTER' : 'SEARCHING...'}
                     </span>
                  </div>
              </div>
           </div>

           {/* Audio Visualizer (Core) */}
           <div className="relative z-10 w-full h-full max-w-[400px] max-h-[400px] flex items-center justify-center">
              <Visualizer volume={volume} />
              
              {/* Connect / Control Buttons */}
              <div className="absolute z-50 pointer-events-auto">
                {connectionState === ConnectionState.DISCONNECTED && (
                   <button 
                     onClick={connect}
                     className="group relative flex items-center justify-center w-24 h-24 rounded-full bg-cyan-950/40 border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:border-cyan-300 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-md"
                   >
                      <Power size={40} className="group-hover:animate-pulse" />
                      <span className="absolute -bottom-8 text-xs font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-cyan-300">
                        初始化系统
                      </span>
                   </button>
                )}
                
                {connectionState === ConnectionState.ERROR && (
                   <button 
                     onClick={connect}
                     className="group flex flex-col items-center justify-center w-24 h-24 rounded-full bg-red-950/40 border-2 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-black transition-all duration-300 backdrop-blur-md"
                   >
                      <RefreshCw size={32} />
                      <span className="text-[10px] mt-1 font-bold">REBOOT</span>
                   </button>
                )}
              </div>
           </div>

           {/* Connection Status Text */}
           <div className="absolute bottom-20 text-center">
              {connectionState === ConnectionState.CONNECTING && (
                 <span className="text-cyan-300 animate-pulse tech-mono text-sm uppercase tracking-widest">
                    正在建立神经链接...
                 </span>
              )}
              {connectionState === ConnectionState.CONNECTED && (
                 <button onClick={disconnect} className="pointer-events-auto text-[10px] text-red-400 hover:text-red-200 hover:bg-red-900/30 uppercase tracking-widest border border-red-900/50 px-4 py-1.5 transition-colors">
                    终止协议
                 </button>
              )}
           </div>
        </div>

        {/* Right Column: Logs */}
        <div className="col-span-3 flex flex-col justify-end pointer-events-auto h-[60vh] mt-auto">
           <div className="glass-panel h-full rounded-lg overflow-hidden flex flex-col border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
              <LogPanel logs={logs} />
           </div>
        </div>

        {/* Bottom Bar */}
        <div className="col-span-12 flex justify-between items-end border-b-2 border-cyan-500/20 pb-2 opacity-50">
           <div className="text-[10px] tech-mono text-cyan-700">SYS.23.44.11</div>
           <div className="text-[10px] tech-mono text-cyan-700">MARK 85_UI</div>
        </div>
      </div>

    </div>
  );
}