import React, { useState, useEffect } from 'react';
import { runNetworkAnalysis } from './services/geminiService';
import { AnalysisResult, TracerouteHop, WhoisData } from './types';
import { TracerouteList } from './components/TracerouteList';
import { MapVisualizer } from './components/MapVisualizer';
import { WhoisPanel } from './components/WhoisPanel';
import { Activity, Globe, Search, Map, Terminal, AlertTriangle, PlayCircle, Loader2, MapPin, MapPinOff, Wifi, CheckCircle2, Sun, Moon } from 'lucide-react';

const DURANGO_ISPS = [
  { name: 'Uninet (Telmex)', id: 'Uninet' },
  { name: 'Megacable', id: 'Megacable' },
  { name: 'Totalplay', id: 'Totalplay' },
  { name: 'Izzi', id: 'Izzi' },
  { name: 'Starlink', id: 'Starlink' },
  { name: 'AT&T', id: 'AT&T' },
  { name: 'Telcel', id: 'Telcel' },
];

export default function App() {
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightedHop, setHighlightedHop] = useState<TracerouteHop | null>(null);
  const [mode, setMode] = useState<'traceroute' | 'whois'>('traceroute');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [locationStatus, setLocationStatus] = useState<'pending' | 'found' | 'denied'>('pending');
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // ISP Selection State
  const [showIspModal, setShowIspModal] = useState(true);
  const [selectedIsp, setSelectedIsp] = useState<string | null>(null);

  // Toggle Dark Mode Class
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Get user location for Grounding context
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationStatus('found');
        },
        (err) => {
          console.log("Geolocation denied or failed, defaulting to simulation base.");
          setLocationStatus('denied');
        }
      );
    } else {
      setLocationStatus('denied');
    }
  }, []);

  const handleAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!target) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await runNetworkAnalysis(target, mode, userLocation, selectedIsp);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIsp = (isp: string | null) => {
    setSelectedIsp(isp);
    setShowIspModal(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-sky-500/30 transition-colors duration-300">
      
      {/* ISP Selection Modal */}
      {showIspModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-sky-500/20 rounded-lg">
                   <Wifi className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Select Origin ISP</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                To make the network simulation accurate for Durango, please select your current Internet Service Provider.
              </p>
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto bg-white dark:bg-slate-900">
              {DURANGO_ISPS.map((isp) => (
                <button
                  key={isp.id}
                  onClick={() => handleSelectIsp(isp.id)}
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-sky-50 dark:hover:bg-sky-600/20 hover:border-sky-400 dark:hover:border-sky-500/50 transition-all text-left group"
                >
                  <div className="w-4 h-4 rounded-full border border-slate-400 dark:border-slate-500 group-hover:border-sky-500 dark:group-hover:border-sky-400 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-sky-700 dark:group-hover:text-white">{isp.name}</span>
                </button>
              ))}
            </div>

            <div className="p-6 pt-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <button 
                onClick={() => handleSelectIsp(null)}
                className="w-full py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm font-medium"
              >
                I don't know / Skip setup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decorative Guinda Line */}
      <div className="h-2 w-full bg-[#8A0F2E] shadow-[0_0_15px_rgba(138,15,46,0.6)] z-20"></div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 shadow-md transition-colors duration-300">
        <div className="flex items-center gap-4">
          {/* Institution Logo */}
          <img 
            src="https://github.com/gitgubalex/NetTrace/blob/main/logo_itdurango.png?raw=true" 
            alt="IT Durango" 
            className="h-12 w-auto object-contain drop-shadow-lg"
          />

          <div className="h-8 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg shadow-lg shadow-sky-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
                NetTrace Edu
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Network Diagnostic & Visualization</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          
           {/* Dark Mode Toggle */}
           <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Current ISP Display (Mini) */}
          {selectedIsp && (
            <div 
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-full border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                onClick={() => setShowIspModal(true)}
                title="Change ISP"
            >
                <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">ISP: <span className="text-slate-900 dark:text-white">{selectedIsp}</span></span>
            </div>
          )}

           {/* Mode Toggles */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => { setMode('traceroute'); setResult(null); }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'traceroute' 
                  ? 'bg-white dark:bg-sky-600 text-sky-700 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Traceroute
            </button>
            <button
              onClick={() => { setMode('whois'); setResult(null); }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'whois' 
                  ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Globe className="w-4 h-4" />
              WHOIS
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Sidebar - Controls & Data */}
        <div className="w-full md:w-[450px] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 z-10 backdrop-blur-sm relative shadow-2xl transition-colors duration-300">
          
          {/* Search Bar */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <form onSubmit={handleAnalysis} className="relative">
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={mode === 'traceroute' ? "Enter domain or IP (e.g. google.com)" : "Enter domain (e.g. example.com)"}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <button 
                type="submit"
                disabled={loading || !target}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-sky-600 hover:bg-sky-500 text-white p-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
              </button>
            </form>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
                <div className="flex items-center gap-1.5">
                    {locationStatus === 'found' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <MapPin className="w-3 h-3" />
                            <span>Using your location</span>
                        </div>
                    ) : locationStatus === 'denied' ? (
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500" title="Enable browser geolocation for accurate origin">
                            <MapPinOff className="w-3 h-3" />
                            <span>Location hidden (using default)</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-slate-400">
                             <Loader2 className="w-3 h-3 animate-spin" />
                             <span>Locating...</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-600">
                    <AlertTriangle className="w-3 h-3" />
                    <span>AI Simulated</span>
                </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-hidden relative">
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 z-20 backdrop-blur-sm transition-colors">
                <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
                <p className="text-sky-600 dark:text-sky-400 font-medium animate-pulse">Analyzing Network Path...</p>
                <p className="text-slate-500 text-sm mt-2">Querying Maps Grounding...</p>
              </div>
            )}

            {!loading && !result && !error && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 transition-colors">
                  <Map className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">Ready to Trace</h3>
                <p className="text-sm max-w-[250px]">
                  Enter a target domain to visualize the route packets take across the globe.
                </p>
              </div>
            )}

            {error && (
              <div className="p-6 text-center">
                <div className="inline-flex p-3 bg-red-100 dark:bg-red-900/20 rounded-full text-red-500 mb-4 transition-colors">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-red-600 dark:text-red-400 font-bold mb-2">Analysis Failed</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{error}</p>
              </div>
            )}

            {result && result.type === 'traceroute' && result.traceroute && (
              <TracerouteList 
                hops={result.traceroute} 
                onHopHover={setHighlightedHop}
              />
            )}

            {result && result.type === 'whois' && result.whois && (
              <WhoisPanel data={result.whois} />
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 bg-slate-200 dark:bg-slate-950 relative h-full transition-colors duration-300">
          <MapVisualizer 
            hops={result?.traceroute} 
            whois={result?.whois}
            highlightedHop={highlightedHop} 
            userLocation={userLocation}
            isDarkMode={isDarkMode}
          />
          
          {/* Legend / Overlay */}
          <div className="absolute bottom-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-2xl z-[400] max-w-[200px] transition-colors">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 tracking-wider">Map Legend</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white border border-slate-500 shadow-sm"></div>
                <span className="text-slate-600 dark:text-slate-300">My Location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500 border border-white shadow-sm"></div>
                <span className="text-slate-600 dark:text-slate-300">Network Hop</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-6 bg-sky-500 border-t border-dashed border-sky-300"></div>
                <span className="text-slate-600 dark:text-slate-300">Data Path</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}