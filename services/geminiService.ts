import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, TracerouteHop, WhoisData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const HOP_COLORS = [
  '#38bdf8', // Sky 400
  '#818cf8', // Indigo 400
  '#c084fc', // Purple 400
  '#f472b6', // Pink 400
  '#fb7185', // Rose 400
  '#22d3ee', // Cyan 400
  '#4ade80', // Green 400
  '#fbbf24', // Amber 400
  '#a78bfa', // Violet 400
  '#f87171', // Red 400
];

// Default Origin: Durango, Mexico
const DEFAULT_LAT = 24.0277;
const DEFAULT_LNG = -104.6532;
const DEFAULT_LOCATION_NAME = "Durango, Mexico";

export const runNetworkAnalysis = async (
  target: string,
  mode: 'traceroute' | 'whois',
  userLocation?: { lat: number; lng: number },
  ispProvider?: string | null
): Promise<AnalysisResult> => {
  
  // Use user location if available, otherwise default to Durango, Mexico
  const startLat = userLocation ? userLocation.lat : DEFAULT_LAT;
  const startLng = userLocation ? userLocation.lng : DEFAULT_LNG;
  const locationDesc = userLocation ? `Latitude ${userLocation.lat}, Longitude ${userLocation.lng}` : DEFAULT_LOCATION_NAME;

  let ispContext = "";
  if (ispProvider) {
    ispContext = `
      CRITICAL CONTEXT: The user is using the ISP "${ispProvider}".
      - Hop 1 MUST be a local gateway/router belonging to "${ispProvider}".
      - The initial ASN MUST match "${ispProvider}" (e.g., Uninet=AS8151, Starlink=AS14593, Totalplay=AS28548).
      - If Starlink is selected, Hop 1 or 2 must be a satellite link.
    `;
  } else {
    ispContext = "- Hop 1 MUST be a local ISP/Gateway in that specific city.";
  }

  const locationContext = `
       The trace originates from: ${locationDesc}.
       CRITICAL INSTRUCTION: The simulation MUST start exactly at (${startLat}, ${startLng}). 
       ${ispContext}
  `;
  
  let prompt = "";
  
  if (mode === 'traceroute') {
    prompt = `
      Perform a simulated educational TRACEROUTE to the target: "${target}".
      ${locationContext}
      
      Generate a realistic network path with 6-12 hops.
      For each hop, provide DETAILED network engineering metrics:

      1. Basic Info: IP, Hostname, City, Country, Coordinates.
      2. Description: Educational note (e.g., "ISP Backbone", "IXP Peering Point").
      
      3. CRITICAL - SUBMARINE CABLES: If crossing an ocean, identify the CABLE SYSTEM (e.g., "MAREA", "TAT-14").
      
      4. CRITICAL - SATELLITE LINKS: Identify Starlink/Viasat links.
         - Set "isSatellite": true.
         - Set "satelliteName": provider name.

      5. ENGINEERING METRICS (Educational):
         - "packetLoss": 0 to 100 (integer). Simulate 0% for most, but add occasional minor loss (10-20%) on busy exchange points or 100% on firewalls that drop ICMP.
         - "packetsSent": Always 3.
         - "packetsReceived": Calculate based on loss (e.g., if 0% loss, 3; if 33% loss, 2).
         - "asn": Autonomous System Number (e.g., "AS8151" for Uninet/Telmex, "AS15169" for Google).
         - "isp": The organization name owning the ASN.
         - "jitter": Latency variation string (e.g., "0.4ms", "12ms" for satellite).

      Output Rules:
      - Return ONLY a valid JSON object.
      - Do not include any introductory or concluding text.
      
      JSON Schema:
      {
        "hops": [
          {
            "hop": number,
            "ip": string,
            "hostname": string,
            "location": string,
            "lat": number,
            "lng": number,
            "rtt": string,
            "description": string,
            "cableName": string | null,
            "isSatellite": boolean,
            "satelliteName": string | null,
            "packetLoss": number,
            "packetsSent": number,
            "packetsReceived": number,
            "asn": string,
            "isp": string,
            "jitter": string
          }
        ]
      }
    `;
  } else {
    prompt = `
      Perform a simulated educational WHOIS lookup for the domain: "${target}".
      
      Provide realistic WHOIS data including Registrar, Dates, and Name Servers.
      Identify the location of the Registrar or Registrant Organization using the googleMaps tool.
      
      Output Rules:
      - Return ONLY a valid JSON object.
      - Do not include any introductory or concluding text.

      JSON Schema:
      {
        "domain": string,
        "registrar": string,
        "creationDate": string,
        "expiryDate": string,
        "nameServers": string[],
        "registrantCountry": string,
        "registrantCity": string,
        "lat": number,
        "lng": number,
        "rawText": string
      }
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }], // Enable Maps Grounding
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: startLat,
              longitude: startLng
            }
          }
        },
      },
    });

    let text = response.text || "{}";
    
    // Robust JSON parsing
    if (text.includes("```")) {
      text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        text = text.substring(firstBrace, lastBrace + 1);
    }

    let json;
    try {
        json = JSON.parse(text);
    } catch (e) {
        console.error("JSON Parse Error", text);
        throw new Error("Received invalid data format from AI. Please try again.");
    }

    // Extract grounding metadata if available to attach Maps URIs
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const mapsUri = chunks.find(c => c.maps?.uri)?.maps?.uri;

    if (mode === 'traceroute') {
      const hops: TracerouteHop[] = json.hops.map((hop: any, index: number) => ({
        ...hop,
        color: HOP_COLORS[index % HOP_COLORS.length]
      }));

      return {
        type: 'traceroute',
        traceroute: hops,
      };
    } else {
      return {
        type: 'whois',
        whois: {
          ...json,
          mapsUri: mapsUri || json.mapsUri
        }
      };
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};