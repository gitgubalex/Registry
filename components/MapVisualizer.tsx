import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { TracerouteHop, WhoisData } from '../types';
import L from 'leaflet';
import { Waves, Satellite } from 'lucide-react';

// Standard WHOIS icon
const iconWhois = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom function to create colored circle markers
const createColorIcon = (color: string, isOrigin: boolean = false) => {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        background-color: ${color};
        width: ${isOrigin ? '20px' : '16px'};
        height: ${isOrigin ? '20px' : '16px'};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 10px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${isOrigin ? '<div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>' : ''}
      </div>
    `,
    iconSize: isOrigin ? [20, 20] : [16, 16],
    iconAnchor: isOrigin ? [10, 10] : [8, 8],
    popupAnchor: [0, -10]
  });
};

const MapUpdater: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom ?? map.getZoom());
  }, [center, zoom, map]);
  return null;
};

interface MapVisualizerProps {
  hops?: TracerouteHop[];
  whois?: WhoisData;
  highlightedHop?: TracerouteHop | null;
  userLocation?: { lat: number; lng: number };
  isDarkMode?: boolean;
}

export const MapVisualizer: React.FC<MapVisualizerProps> = ({ hops, whois, highlightedHop, userLocation, isDarkMode = true }) => {
  const [center, setCenter] = useState<[number, number]>([20, 0]);
  const [zoom, setZoom] = useState(2);

  // Initialize with user location if available, otherwise Durango default
  useEffect(() => {
    if (!hops && !whois) {
        // If userLocation exists use it, otherwise use Durango
        const lat = userLocation ? userLocation.lat : 24.0277;
        const lng = userLocation ? userLocation.lng : -104.6532;
        setCenter([lat, lng]);
        setZoom(4);
    }
  }, [userLocation]);

  useEffect(() => {
    if (highlightedHop) {
      setCenter([highlightedHop.lat, highlightedHop.lng]);
      setZoom(6);
    } else if (hops && hops.length > 0) {
       // Center on the middle of the path or last hop
       const lastHop = hops[hops.length - 1];
       setCenter([lastHop.lat, lastHop.lng]);
       setZoom(3);
    } else if (whois && whois.lat && whois.lng) {
      setCenter([whois.lat, whois.lng]);
      setZoom(5);
    }
  }, [highlightedHop, hops, whois]);

  // Determine Origin display coords
  const originLat = userLocation ? userLocation.lat : 24.0277;
  const originLng = userLocation ? userLocation.lng : -104.6532;

  // Calculate a continuous path where longitudes are adjusted to avoid world wrapping issues
  const visualPath = useMemo(() => {
    const start = { lat: originLat, lng: originLng };
    if (!hops || hops.length === 0) return { origin: start, hops: [] };

    let currentLng = start.lng;
    
    // Process hops to generate visualLng
    const processedHops = hops.map(hop => {
        const nextLng = hop.lng;
        // Find the shortest path wrap adjustment
        // We want the difference (next - current) to be in [-180, 180]
        const adjustment = Math.round((currentLng - nextLng) / 360) * 360;
        const visualLng = nextLng + adjustment;
        
        currentLng = visualLng;
        
        return {
            ...hop,
            visualLng
        };
    });

    return { origin: start, hops: processedHops };
  }, [hops, originLat, originLng]);

  // Dynamic Tile Layer URL based on theme
  const tileLayerUrl = isDarkMode 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const mapBackground = isDarkMode ? '#0f172a' : '#e2e8f0';

  return (
    <div className="w-full h-full relative z-0 transition-colors duration-300">
      <MapContainer 
        center={[originLat, originLng]} 
        zoom={4} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%", background: mapBackground }}
        worldCopyJump={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileLayerUrl}
        />
        
        <MapUpdater center={center} zoom={zoom} />

        {/* Origin Marker */}
        <Marker 
          position={[visualPath.origin.lat, visualPath.origin.lng]} 
          icon={createColorIcon(isDarkMode ? '#ffffff' : '#475569', true)}
        >
          <Popup className="text-slate-900 font-sans">
            <div className="font-bold">{userLocation ? "My Location" : "Durango, Mexico"}</div>
            <div className="text-xs">Start of Trace</div>
          </Popup>
        </Marker>

        {/* Connect Origin to First Hop */}
        {visualPath.hops.length > 0 && (
          <Polyline
            positions={[
                [visualPath.origin.lat, visualPath.origin.lng],
                [visualPath.hops[0].lat, visualPath.hops[0].visualLng]
            ]}
            pathOptions={{ 
              color: visualPath.hops[0].color || '#38bdf8', 
              weight: 2, 
              opacity: 0.6, 
              dashArray: '5, 10' 
            }}
          />
        )}

        {/* Traceroute Markers and Segments */}
        {visualPath.hops.map((hop, index) => {
          // Draw line from previous hop to current hop
          const prevHop = visualPath.hops[index - 1];
          const isCable = !!hop.cableName;
          const isSatellite = !!hop.isSatellite;
          
          return (
            <React.Fragment key={hop.hop}>
               {/* Line from prev hop to current hop */}
               {prevHop && (
                 <Polyline 
                   positions={[
                       [prevHop.lat, prevHop.visualLng],
                       [hop.lat, hop.visualLng]
                   ]}
                   pathOptions={{ 
                     color: isSatellite ? '#facc15' : hop.color, 
                     weight: isCable || isSatellite ? 4 : 3, 
                     opacity: 0.8,
                     dashArray: isSatellite ? '1, 12' : (isCable ? '10, 10' : undefined) 
                   }}
                 >
                    {(isCable || isSatellite) && (
                        <Popup>
                            <div className={`flex items-center gap-2 font-bold ${isSatellite ? 'text-yellow-600' : 'text-sky-600'}`}>
                                {isSatellite ? <Satellite size={16} /> : <Waves size={16} />}
                                <span>{isSatellite ? hop.satelliteName : hop.cableName}</span>
                            </div>
                            <div className="text-xs text-slate-500">
                                {isSatellite ? 'Orbital Connection' : 'Submarine Cable System'}
                            </div>
                        </Popup>
                    )}
                 </Polyline>
               )}

              <Marker 
                position={[hop.lat, hop.visualLng]} 
                icon={createColorIcon(hop.color || '#38bdf8')}
                opacity={highlightedHop && highlightedHop.hop !== hop.hop ? 0.4 : 1}
              >
                <Popup className="text-slate-900 font-sans">
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-xs font-bold px-1.5 py-0.5 rounded text-white" style={{background: hop.color}}>{hop.hop}</span>
                     <span className="font-bold">{hop.ip}</span>
                  </div>
                  <div className="text-sm font-medium">{hop.location}</div>
                  
                  {hop.cableName && (
                    <div className="flex items-center gap-1.5 mt-1.5 p-1.5 bg-sky-50 rounded text-sky-700 font-bold text-xs border border-sky-200">
                        <Waves size={14} />
                        <span>Via: {hop.cableName}</span>
                    </div>
                  )}

                  {hop.isSatellite && (
                    <div className="flex items-center gap-1.5 mt-1.5 p-1.5 bg-yellow-50 rounded text-yellow-700 font-bold text-xs border border-yellow-200">
                        <Satellite size={14} />
                        <span>Via: {hop.satelliteName}</span>
                    </div>
                  )}

                  <div className="text-xs mt-1 italic text-slate-600 border-t border-slate-200 pt-1 mb-2">{hop.description}</div>
                  
                  {/* Educational Popup Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200 pt-1">
                    <div>
                        <span className="font-bold text-slate-500 block">Organization</span>
                        <span className="text-slate-700">{hop.isp}</span>
                    </div>
                     <div>
                        <span className="font-bold text-slate-500 block">ASN</span>
                        <span className="font-mono text-slate-700">{hop.asn}</span>
                    </div>
                  </div>

                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* WHOIS Marker */}
        {whois && whois.lat && whois.lng && (
           <Marker position={[whois.lat, whois.lng]} icon={iconWhois}>
             <Popup className="text-slate-900 font-sans">
               <div className="font-bold">{whois.domain}</div>
               <div>Registrant: {whois.registrar}</div>
               <div>{whois.registrantCity}, {whois.registrantCountry}</div>
             </Popup>
           </Marker>
        )}
      </MapContainer>
    </div>
  );
};