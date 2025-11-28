import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface LogPanelProps {
  logs: LogEntry[];
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full border-l border-cyan-900/30 bg-black/40 backdrop-blur-sm">
      <div className="p-2 bg-cyan-950/30 text-cyan-400 text-xs font-bold tracking-widest uppercase border-b border-cyan-900">
        通信日志
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 tech-mono text-sm">
        {logs.map((log) => (
          <div key={log.id} className={`flex flex-col ${log.sender === 'SYSTEM' ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] uppercase font-bold px-1 rounded ${
                log.sender === 'FRIDAY' ? 'bg-cyan-900 text-cyan-200' :
                log.sender === 'USER' ? 'bg-slate-800 text-slate-300' :
                'bg-red-900/50 text-red-300'
              }`}>
                {log.sender}
              </span>
              <span className="text-[10px] text-slate-600">
                {log.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="text-cyan-100/90 leading-snug break-words">
              {log.text}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};