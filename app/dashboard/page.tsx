"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AlertCircle, ShieldOff, RefreshCw, XCircle, Search, Activity, UserX, ShieldCheck, ChevronRight, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import force-graph to avoid SSR issues with canvas
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function AnalystDashboard() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/evaluate');
      const data = await res.json();
      setAlerts(data);
      // Auto-select first alert if none selected and alerts exist
      if (!selectedAlert && data.length > 0) {
        setSelectedAlert(data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAlerts = async () => {
    try {
      await fetch('/api/evaluate', { method: 'DELETE' });
      setAlerts([]);
      setSelectedAlert(null);
    } catch (error) {
      console.error(error);
    }
  };

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle graph dimensions
  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedAlert]);

  // Update graph data when selection changes
  useEffect(() => {
    if (selectedAlert) {
      setGraphData({
        nodes: [
          { id: 'ip', group: 1, name: 'Flagged IP (192.168.x.x)', color: '#ef4444', val: 30 },
          { id: selectedAlert.accountId, group: 2, name: `Src: ${selectedAlert.accountId}`, color: '#f59e0b', val: 20 },
          { id: 'mule1', group: 2, name: 'Known Mule A', color: '#64748b', val: 15 },
          { id: 'mule2', group: 2, name: 'Known Mule B', color: '#64748b', val: 15 },
          { id: selectedAlert.destinationAccount, group: 3, name: `Dst: ${selectedAlert.destinationAccount}`, color: '#3b82f6', val: 20 }
        ] as any,
        links: [
          { source: selectedAlert.accountId, target: 'ip' },
          { source: 'mule1', target: 'ip' },
          { source: 'mule2', target: 'ip' },
          { source: selectedAlert.accountId, target: selectedAlert.destinationAccount }
        ] as any
      });
    }
  }, [selectedAlert]);

  return (
    <div className="h-screen bg-slate-950 text-slate-300 font-sans flex flex-col overflow-hidden">
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-lg z-10 flex-shrink-0">
        <div className="flex items-center">
          <div className="bg-red-500/20 p-2 rounded-lg mr-3 border border-red-500/30">
            <ShieldOff className="text-red-500 h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide leading-tight">FraudOps Console</h1>
            <p className="text-xs text-slate-500">AI Mule Detection Engine</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button onClick={clearAlerts} className="flex items-center text-sm bg-red-900/50 hover:bg-red-800/60 text-red-200 py-2 px-4 rounded-lg border border-red-800/50 transition shadow-sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Alerts
          </button>
          <button onClick={fetchAlerts} className="flex items-center text-sm bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-lg border border-slate-700 transition shadow-sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Alerts
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-1 p-2 bg-slate-950 min-h-0">
        
        {/* Left Column: Live Alert Queue */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-xl">
          <div className="bg-slate-800/80 p-4 flex justify-between items-center border-b border-slate-700/80">
            <h2 className="font-semibold text-slate-100 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-blue-400" /> Live Intercepts
            </h2>
            <span className="bg-red-500/20 text-red-400 text-xs px-2.5 py-1 rounded-full border border-red-500/30 font-bold">
              {alerts.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm p-6">
                <ShieldCheck className="w-12 h-12 mb-3 text-slate-700" />
                <p>No suspicious activities detected.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${selectedAlert?.id === alert.id ? 'bg-slate-800 border-blue-500 shadow-md transform scale-[1.02]' : 'bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-800/80'}`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md flex items-center ${alert.score >= 80 ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-orange-500/20 text-orange-400 border border-orange-500/50'}`}>
                      Risk: {alert.score}
                    </span>
                  </div>
                  <div className="text-sm text-slate-200 font-semibold truncate flex items-center">
                    {alert.accountId}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 truncate flex items-center">
                    <ChevronRight className="w-3 h-3 mr-1" /> {alert.destinationAccount}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Middle Column: Detail & XAI */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-xl">
          {selectedAlert ? (
            <>
              <div className="p-5 border-b border-slate-800 bg-slate-800/40">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center">
                    Alert Details
                  </h2>
                  <span className="text-slate-500 text-xs font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">ID: {selectedAlert.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-slate-900 p-4 rounded-lg border border-slate-800">
                  <div>
                    <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1 font-semibold">Source Account</span>
                    <span className="font-mono text-slate-200">{selectedAlert.accountId}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1 font-semibold">Destination Account</span>
                    <span className="font-mono text-slate-200">{selectedAlert.destinationAccount}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 overflow-y-auto">
                <h3 className="font-semibold text-slate-200 mb-4 flex items-center text-sm uppercase tracking-wider">
                  <Search className="w-4 h-4 mr-2 text-purple-400" /> AI Risk Breakdown (XAI)
                </h3>
                <div className="space-y-3">
                  {selectedAlert.explanations.map((exp: string, idx: number) => {
                    const [points, ...rest] = exp.split(':');
                    const reason = rest.join(':');
                    return (
                      <div key={idx} className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-lg flex items-start shadow-sm">
                        <div className="bg-red-500/20 text-red-400 font-bold px-2 py-1 rounded text-sm mr-4 border border-red-500/20 whitespace-nowrap">
                          {points}
                        </div>
                        <span className="text-sm text-slate-300 leading-relaxed pt-0.5">{reason}</span>
                      </div>
                    )
                  })}
                  {selectedAlert.explanations.length === 0 && (
                    <div className="text-sm text-slate-500 italic p-4 bg-slate-800/50 rounded-lg text-center border border-slate-700/50">No specific AI flags generated.</div>
                  )}
                </div>
              </div>

              <div className="p-5 border-t border-slate-800 bg-slate-900 flex space-x-3">
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg flex items-center justify-center font-medium text-sm transition shadow-lg shadow-red-900/20">
                  <XCircle className="w-4 h-4 mr-2" /> Freeze Account
                </button>
                <button className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 py-2.5 rounded-lg flex items-center justify-center font-medium text-sm transition">
                  <UserX className="w-4 h-4 mr-2" /> Step-Up KYC
                </button>
                <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 py-2.5 rounded-lg flex items-center justify-center font-medium text-sm transition">
                  <ShieldCheck className="w-4 h-4 mr-2" /> Dismiss
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-lg font-medium text-slate-400">Select an alert to view XAI details</p>
              <p className="text-sm text-slate-600 mt-2 text-center">Click on any intercepted transaction in the queue to analyze the AI risk breakdown.</p>
            </div>
          )}
        </div>

        {/* Right Column: Syndicate Network */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-xl relative">
          <div className="p-4 border-b border-slate-800 absolute top-0 w-full z-10 bg-slate-900/80 backdrop-blur-sm pointer-events-none">
            <h2 className="font-semibold text-slate-100 flex items-center text-sm uppercase tracking-wider">
              <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> 
              Syndicate Visualizer
            </h2>
          </div>
          
          <div ref={containerRef} className="flex-1 bg-slate-950 relative flex items-center justify-center pt-14">
            {selectedAlert ? (
              <ForceGraph2D
                graphData={graphData}
                width={dimensions.width}
                height={dimensions.height - 56} // Adjust for header
                nodeLabel="name"
                nodeRelSize={6}
                linkColor={() => 'rgba(148, 163, 184, 0.3)'}
                linkWidth={2}
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                  const label = node.name;
                  const fontSize = 12/globalScale;
                  ctx.font = `${fontSize}px Inter, sans-serif`;
                  const textWidth = ctx.measureText(label).width;
                  const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.8); // padding

                  // Node background
                  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
                  ctx.beginPath();
                  ctx.roundRect(
                    node.x - bckgDimensions[0] / 2, 
                    node.y - bckgDimensions[1] / 2, 
                    bckgDimensions[0], 
                    bckgDimensions[1],
                    4 / globalScale // border radius
                  );
                  ctx.fill();

                  // Border
                  ctx.strokeStyle = node.color;
                  ctx.lineWidth = 1.5 / globalScale;
                  ctx.stroke();

                  // Text
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = '#f8fafc'; // light text
                  ctx.fillText(label, node.x, node.y);

                  node.__bckgDimensions = bckgDimensions;
                }}
                nodePointerAreaPaint={(node: any, color, ctx) => {
                  ctx.fillStyle = color;
                  const bckgDimensions = node.__bckgDimensions;
                  if (bckgDimensions) {
                    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
                  }
                }}
                d3VelocityDecay={0.3}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-600 h-full">
                <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <span>Graph view inactive</span>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Global CSS for custom scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5); 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(51, 65, 85, 0.8); 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 1); 
        }
      `}} />
    </div>
  );
}
