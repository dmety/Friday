import React, { useEffect, useState } from 'react';
import { SystemStats } from '../types';
import { Cpu, Fan, Zap, Activity, HardDrive, Wifi } from 'lucide-react';

export const SystemStatusModule: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    batteryLevel: 100,
    isCharging: true,
    online: navigator.onLine,
    latitude: null,
    longitude: null,
    cpuLoad: 12,
    memoryUsage: 34
  });

  const [hwStats, setHwStats] = useState({
    cpuTemp: 42,
    gpuTemp: 38,
    fanSpeed: 1200,
    fps: 60
  });

  useEffect(() => {
    // Battery API simulation
    const updateBattery = async () => {
      try {
        const battery: any = await (navigator as any).getBattery();
        setStats(s => ({ ...s, batteryLevel: battery.level * 100, isCharging: battery.charging }));
        battery.addEventListener('levelchange', () => setStats(s => ({ ...s, batteryLevel: battery.level * 100 })));
      } catch { /* Fallback */ }
    };
    updateBattery();

    const interval = setInterval(() => {
      // Simulate fluctuating hardware stats
      setStats(prev => ({
        ...prev,
        cpuLoad: Math.min(100, Math.max(5, prev.cpuLoad + (Math.random() * 20 - 10))),
        memoryUsage: Math.min(100, Math.max(20, prev.memoryUsage + (Math.random() * 5 - 2.5)))
      }));
      setHwStats(prev => ({
        cpuTemp: Math.min(85, Math.max(35, prev.cpuTemp + (Math.random() * 4 - 2))),
        gpuTemp: Math.min(80, Math.max(30, prev.gpuTemp + (Math.random() * 3 - 1.5))),
        fanSpeed: Math.floor(1000 + prev.cpuTemp * 25 + Math.random() * 100),
        fps: Math.floor(58 + Math.random() * 5)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full max-w-[280px]">
      
      {/* 1. Hardware Monitor */}
      <div className="glass-panel p-4 rounded-tl-xl rounded-br-xl relative overflow-hidden group border-l-2 border-cyan-500">
        <div className="absolute top-0 right-0 p-1 opacity-50">
          <Activity size={12} className="text-cyan-600 animate-pulse" />
        </div>
        <h3 className="text-xs font-bold text-cyan-400 mb-3 tracking-widest flex items-center gap-2">
          <Cpu size={14} /> 核心硬件监控
        </h3>
        
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 font-mono text-xs">
           <div className="flex flex-col">
             <span className="text-[10px] text-cyan-700 uppercase">CPU 温度</span>
             <span className={`text-lg font-bold ${hwStats.cpuTemp > 80 ? 'text-red-500 animate-pulse' : 'text-cyan-300'}`}>
               {hwStats.cpuTemp.toFixed(1)}°C
             </span>
           </div>
           
           <div className="flex flex-col">
             <span className="text-[10px] text-cyan-700 uppercase">GPU 温度</span>
             <span className="text-lg font-bold text-cyan-300">
               {hwStats.gpuTemp.toFixed(1)}°C
             </span>
           </div>

           <div className="flex flex-col">
             <span className="text-[10px] text-cyan-700 uppercase">风扇转速</span>
             <span className="text-cyan-300 flex items-center gap-1">
                <Fan size={10} className={hwStats.fanSpeed > 2000 ? 'animate-spin' : ''} />
                {hwStats.fanSpeed}
             </span>
           </div>

           <div className="flex flex-col">
             <span className="text-[10px] text-cyan-700 uppercase">帧率</span>
             <span className="text-cyan-300">
                {hwStats.fps} FPS
             </span>
           </div>
        </div>

        {/* Memory Bar */}
        <div className="mt-3">
           <div className="flex justify-between text-[10px] mb-1">
             <span className="text-cyan-700">内存负载</span>
             <span className="text-cyan-300">{Math.round(stats.memoryUsage)}%</span>
           </div>
           <div className="w-full h-1 bg-cyan-900/50">
             <div className="h-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]" style={{ width: `${stats.memoryUsage}%` }}></div>
           </div>
        </div>
      </div>

      {/* 2. Environment / Network */}
      <div className="glass-panel p-3 rounded-bl-xl rounded-tr-xl border-r-2 border-yellow-500/50">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-bold text-yellow-500 tracking-widest flex items-center gap-2">
            <Zap size={14} /> 能源 & 网络
          </h3>
        </div>
        
        <div className="space-y-2">
           <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-cyan-900/30">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stats.online ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500'}`}></div>
                <span className="text-[10px] text-cyan-300 uppercase">网络链路</span>
              </div>
              <Wifi size={12} className="text-cyan-600" />
           </div>

           <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-cyan-900/30">
              <div className="flex items-center gap-2">
                 <span className="text-[10px] text-yellow-600 uppercase">反应堆输出</span>
              </div>
              <span className="text-sm font-bold text-yellow-400 tech-mono">{Math.round(stats.batteryLevel)}%</span>
           </div>
        </div>
      </div>
      
    </div>
  );
};