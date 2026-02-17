import React from 'react';
import { WhoisData } from '../types';
import { Search, Calendar, Globe, Building, ShieldCheck, Map } from 'lucide-react';

interface WhoisPanelProps {
  data: WhoisData;
}

export const WhoisPanel: React.FC<WhoisPanelProps> = ({ data }) => {
  return (
    <div className="p-6 overflow-y-auto h-full space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
          <Search className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{data.domain}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">WHOIS Record</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
          <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-3 flex items-center gap-2">
            <Building className="w-4 h-4" /> Registrar Info
          </h3>
          <div className="text-lg text-slate-800 dark:text-white font-medium mb-1">{data.registrar}</div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Globe className="w-3 h-3" />
            {data.registrantCity}, {data.registrantCountry}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Created
            </h3>
            <div className="text-emerald-600 dark:text-emerald-400 font-mono">{data.creationDate}</div>
          </div>
          <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Expires
            </h3>
            <div className="text-orange-500 dark:text-orange-400 font-mono">{data.expiryDate}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
          <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-3">Name Servers</h3>
          <ul className="space-y-1">
            {data.nameServers.map((ns, idx) => (
              <li key={idx} className="font-mono text-sm text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/20 px-2 py-1 rounded inline-block mr-2 mb-1">
                {ns}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 italic">
          "{data.rawText}"
        </div>
        
        {data.mapsUri && (
           <a 
             href={data.mapsUri} 
             target="_blank" 
             rel="noopener noreferrer"
             className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white p-3 rounded-lg transition-colors border border-slate-300 dark:border-slate-600 font-medium"
           >
             <Map className="w-4 h-4" /> View Organization on Google Maps
           </a>
        )}
      </div>
    </div>
  );
};