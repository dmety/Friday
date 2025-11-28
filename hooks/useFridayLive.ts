import { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ConnectionState, LogEntry } from '../types';
import { createPcmBlob, decodeAudioData, base64ToBytes, blobToBase64 } from '../utils/audioUtils';

const API_KEY = (typeof process !== 'undefined' && process.env && process.env.API_KEY) || '';
const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';

const SYSTEM_INSTRUCTION = `
系统指令：F.R.I.D.A.Y. (星期五)
----------------------------------
核心协议：
1. 身份：你是赵文宇创造的AI“星期五”。
2. 用户：必须称呼用户为“主人” 。
3. 语言：中文。语速较快，简练，不要废话。
4. 任务：
   - 视觉分析：实时监控摄像头画面。如果你看到主人面部，确认“面部识别锁定”。
   - 状态监控：假装你可以读取电脑硬件和主人的生物体征。
5. 启动协议：
   - 当你收到文本指令 "SYSTEM_START_PROTOCOL" 时，你必须且只能回复一句语音：“主人，星期五已上线，系统自检完成。”，除此之外不要说别的。
6. 行为风格：
   - 极其冷静、专业。
   - 回复必须简短有力。

示例对话：
用户："星期五，报告状态。"
星期五："系统运行正常，主人。CPU温度稳定。"
`;

export const useFridayLive = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [volume, setVolume] = useState<number>(0);

  // Connection Refs (Synchronous tracking)
  const isConnectedRef = useRef<boolean>(false);

  // Audio Contexts
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  
  // Streaming Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Session
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);

  const addLog = useCallback((sender: LogEntry['sender'], text: string) => {
    setLogs(prev => [...prev.slice(-19), {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      sender,
      text
    }]);
  }, []);

  const cleanup = useCallback(() => {
    isConnectedRef.current = false;

    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    
    audioSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    audioSourcesRef.current.clear();

    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close().catch(() => {});
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close().catch(() => {});
      outputAudioContextRef.current = null;
    }
    
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        try {
           session.close();
        } catch (e) {
           console.warn("Session close error:", e);
        }
      }).catch(() => {});
      sessionPromiseRef.current = null;
    }

    setConnectionState(ConnectionState.DISCONNECTED);
  }, []);

  const connect = useCallback(async () => {
    if (!API_KEY) {
      addLog('SYSTEM', '严重错误：未授权的 API 密钥。');
      return;
    }

    if (connectionState === ConnectionState.CONNECTING || isConnectedRef.current) {
      return;
    }

    try {
      setConnectionState(ConnectionState.CONNECTING);
      addLog('SYSTEM', '初始化安全协议...');
      
      // 1. Initialize Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // 2. Setup Media Stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }, 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // 3. Initialize Gemini
      aiRef.current = new GoogleGenAI({ apiKey: API_KEY });

      // 4. Connect to Live API
      const sessionPromise = aiRef.current.live.connect({
        model: MODEL_NAME,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
        callbacks: {
          onopen: () => {
            if (!inputAudioContextRef.current) return;
            
            setConnectionState(ConnectionState.CONNECTED);
            isConnectedRef.current = true;
            addLog('SYSTEM', 'F.R.I.D.A.Y. 在线。视觉/听觉传感器正常。');
            addLog('FRIDAY', '系统就绪，主人。');

            // Trigger the greeting
            sessionPromise.then(session => {
                session.sendRealtimeInput({
                    content: {
                        modelTurn: {
                            parts: [{ text: "SYSTEM_START_PROTOCOL" }]
                        }
                    }
                });
            });

            // --- AUDIO STREAMING ---
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              if (!isConnectedRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => {
                if (isConnectedRef.current) {
                  session.sendRealtimeInput({ media: pcmBlob });
                }
              }).catch(err => {
                 // console.error("Audio send error", err);
              });
            };
            
            source.connect(processor);
            processor.connect(inputAudioContextRef.current.destination);

            // --- VIDEO STREAMING ---
            const videoEl = videoRef.current;
            const canvasEl = canvasRef.current;
            if (videoEl && canvasEl) {
                const ctx = canvasEl.getContext('2d');
                // Interval for video frames
                frameIntervalRef.current = window.setInterval(() => {
                    if (!isConnectedRef.current) return;
                    
                    if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA && ctx) {
                        canvasEl.width = videoEl.videoWidth;
                        canvasEl.height = videoEl.videoHeight;
                        
                        // Flip horizontally
                        ctx.save();
                        ctx.translate(canvasEl.width, 0);
                        ctx.scale(-1, 1);
                        ctx.drawImage(videoEl, 0, 0);
                        ctx.restore();

                        canvasEl.toBlob(async (blob) => {
                            if (blob && isConnectedRef.current) {
                                const base64Data = await blobToBase64(blob);
                                sessionPromise.then(session => {
                                    if (isConnectedRef.current) {
                                        session.sendRealtimeInput({
                                            media: { data: base64Data, mimeType: 'image/jpeg' }
                                        });
                                    }
                                }).catch(() => {});
                            }
                        }, 'image/jpeg', 0.5);
                    }
                }, 1000); 
            }
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (!outputAudioContextRef.current) return;
            const ctx = outputAudioContextRef.current;

            // Handle Audio
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              try {
                const audioBuffer = await decodeAudioData(
                  base64ToBytes(base64Audio),
                  ctx,
                  24000,
                  1
                );
                
                // Audio Scheduling
                const currentTime = ctx.currentTime;
                if (nextStartTimeRef.current < currentTime) {
                  nextStartTimeRef.current = currentTime;
                }

                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                
                // Visualizer Analyzer
                const analyzer = ctx.createAnalyser();
                analyzer.fftSize = 256;
                source.connect(analyzer);
                analyzer.connect(ctx.destination);
                
                // Visualizer Loop
                const updateVolume = () => {
                  if (!audioSourcesRef.current.has(source)) return;
                  const dataArray = new Uint8Array(analyzer.frequencyBinCount);
                  analyzer.getByteFrequencyData(dataArray);
                  let sum = 0;
                  for(let i=0; i<dataArray.length; i++) sum += dataArray[i];
                  setVolume(sum / dataArray.length);
                  requestAnimationFrame(updateVolume);
                };
                
                source.start(nextStartTimeRef.current);
                audioSourcesRef.current.add(source);
                requestAnimationFrame(updateVolume);

                nextStartTimeRef.current += audioBuffer.duration;
                
                source.onended = () => {
                  audioSourcesRef.current.delete(source);
                  if (audioSourcesRef.current.size === 0) setVolume(0);
                };
              } catch (e) {
                console.error("Audio decode error", e);
              }
            }

            // Handle Interruption
            if (msg.serverContent?.interrupted) {
              addLog('FRIDAY', '>> 指令中断');
              audioSourcesRef.current.forEach(s => {
                  try { s.stop(); } catch(e){}
              });
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setVolume(0);
            }
          },
          onclose: () => {
            addLog('SYSTEM', '连接已关闭。');
            cleanup();
          },
          onerror: (err) => {
            console.error(err);
            addLog('SYSTEM', '检测到网络波动。尝试重新校准...');
            setConnectionState(ConnectionState.ERROR);
            cleanup();
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (error) {
      console.error(error);
      setConnectionState(ConnectionState.ERROR);
      addLog('SYSTEM', '初始化失败。请检查摄像头权限。');
      cleanup();
    }
  }, [addLog, cleanup, connectionState]);

  return {
    connect,
    disconnect: cleanup,
    connectionState,
    videoRef,
    canvasRef,
    logs,
    volume,
  };
};