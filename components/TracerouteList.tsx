import React from 'react';
import { TracerouteHop } from '../types';
import { Network, MapPin, Server, Globe, Waves, Satellite, Router, Activity, AlertCircle } from 'lucide-react';

interface TracerouteListProps {
  hops: TracerouteHop[];
  onHopHover: (hop: TracerouteHop | null) => void;
}

export const TracerouteList: React.FC<TracerouteListProps> = ({ hops, onHopHover }) => {
  return (
    <div className="flex flex-col gap-4 p-4 pb-20 overflow-y-auto h-full">
      <h2 className="text-xl font-bold text-sky-600 dark:text-sky-400 flex items-center gap-2">
        <Network className="w-6 h-6" /> Traceroute Hops
      </h2>
      <div className="space-y-3">
        {hops.map((hop) => (
          <div
            key={hop.hop}
            className="group relative bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm dark:shadow-none"
            onMouseEnter={() => onHopHover(hop)}
            onMouseLeave={() => onHopHover(null)}
          >
            {/* Header: Hop # and RTT */}
            <div className="flex items-center justify-between mb-2">
              <span 
                className="flex items-center justify-center w-8 h-8 rounded-full font-mono text-sm font-bold shadow-lg text-white dark:text-slate-900"
                style={{ backgroundColor: hop.color || '#38bdf8' }}
              >
                {hop.hop}
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/50 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                {hop.rtt}
              </span>
            </div>
            
            {/* Main Info Grid */}
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <Server className="w-4 h-4 text-slate-500 mt-1" />
              <div>
                <div className="font-mono text-slate-800 dark:text-slate-200 text-sm">{hop.ip}</div>
                <div className="text-xs text-slate-500 truncate max-w-[200px]">{hop.hostname}</div>
              </div>

              <MapPin className="w-4 h-4 mt-1" style={{ color: hop.color || '#38bdf8' }} />
              <div className="text-sm font-medium" style={{ color: hop.color || '#38bdf8' }}>{hop.location}</div>
              
              {hop.cableName && (
                <>
                  <Waves className="w-4 h-4 mt-1 text-sky-500 dark:text-sky-300" />
                  <div className="text-sm font-bold text-sky-600 dark:text-sky-300 animate-pulse">{hop.cableName} Cable</div>
                </>
              )}

              {hop.isSatellite && (
                <>
                  <Satellite className="w-4 h-4 mt-1 text-yellow-500 dark:text-yellow-400" />
                  <div className="text-sm font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                     {hop.satelliteName || 'Satellite Link'}
                  </div>
                </>
              )}

              <Globe className="w-4 h-4 text-slate-500 mt-1" />
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                {hop.description}
              </div>
            </div>

            {/* Educational Metrics Footer */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50 grid grid-cols-2 gap-2 text-xs">
                
                {/* ASN & ISP */}
                <div className="col-span-2 flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 p-1.5 rounded text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-transparent">
                    <Router className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                    <span className="font-mono text-indigo-600 dark:text-indigo-300">{hop.asn || 'AS---'}</span>
                    <span className="truncate opacity-75">{hop.isp || 'Unknown ISP'}</span>
                </div>

                {/* Packet Loss */}
                <div className={`flex items-center gap-2 p-1.5 rounded ${hop.packetLoss > 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300' : 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400'}`}>
                    <AlertCircle className="w-3 h-3" />
                    <div className="flex flex-col">
                        <span className="font-bold">Loss: {hop.packetLoss}%</span>
                        <span className="text-[10px] opacity-70">
                            Rx: {hop.packetsReceived}/{hop.packetsSent}
                        </span>
                    </div>
                </div>

                {/* Jitter */}
                <div className="flex items-center gap-2 p-1.5 rounded bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-transparent">
                    <Activity className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                    <div className="flex flex-col">
                        <span className="font-bold">Jitter</span>
                        <span className="text-[10px] opacity-70">{hop.jitter || '0ms'}</span>
                    </div>
                </div>

            </div>
            
            {/* Colored Accent Line */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: hop.color || '#38bdf8' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};