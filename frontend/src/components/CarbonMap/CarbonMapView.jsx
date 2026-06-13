import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { statesAndUTs } from '../../utils/indiaData';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Map, Info, Compass, ShieldAlert } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function CarbonMapView() {
  const [stateRankings, setStateRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch(`${API_URL}/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          setStateRankings(data.stateRankings);
        }
      } catch (err) {
        console.error('Error fetching carbon map standings:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  // Merge geographic coordinates with rankings data
  const mapData = stateRankings.map(ranking => {
    const geo = statesAndUTs.find(s => s.name.toLowerCase() === ranking.state.toLowerCase());
    if (geo) {
      return {
        ...ranking,
        lat: geo.lat,
        lng: geo.lng,
        program: geo.program,
        recommendation: geo.recommendation
      };
    }
    return null;
  }).filter(Boolean);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Map className="w-8 h-8 text-brand-600" />
          Interactive Carbon Map of India
        </h1>
        <p className="text-slate-500 mt-1">
          Explore state-wise citizen participation and aggregated carbon footprint savings.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error || mapData.length === 0 ? (
        <div className="p-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">Map Loading Notice:</span> Could not load map coordinates from local database. Run backend or register users to populate map points.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Interactive Map */}
          <div className="lg:col-span-3 h-[500px] rounded-3xl overflow-hidden shadow-glass border border-white/60 bg-slate-100 relative">
            <MapContainer 
              center={[22.9734, 78.6569]} 
              zoom={5} 
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {mapData.map((state) => {
                // Scale radius based on user counts
                const radius = 8 + Math.min(22, state.userCount * 4);
                
                return (
                  <CircleMarker
                    key={state.state}
                    center={[state.lat, state.lng]}
                    radius={radius}
                    pathOptions={{
                      fillColor: '#10b981',
                      fillOpacity: 0.6,
                      color: '#047857',
                      weight: 1.5
                    }}
                  >
                    <Popup>
                      <div className="p-2 space-y-2 min-w-[200px] text-xs font-sans">
                        <div className="border-b border-slate-100 pb-1.5">
                          <span className="font-bold text-sm text-slate-800 block">{state.state}</span>
                          <span className="text-4xs font-bold uppercase tracking-wider text-brand-600 mt-0.5 block">
                            Initiative: {state.program}
                          </span>
                        </div>

                        <div className="space-y-1 text-slate-600">
                          <div className="flex justify-between">
                            <span>Active Users:</span>
                            <span className="font-bold text-slate-800">{state.userCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Carbon Score:</span>
                            <span className="font-bold text-slate-800">{state.avgCarbonScore} kg/yr</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-50 pt-1">
                            <span className="font-semibold text-brand-700">Total Savings:</span>
                            <span className="font-bold text-brand-600">{state.carbonSavings.toLocaleString()} kg</span>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-2 rounded text-4xs text-slate-500 leading-normal italic mt-2 border border-slate-100">
                          {state.recommendation}
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          {/* Right Column: Statistics Sidebar */}
          <div className="glass-panel p-6 rounded-3xl shadow-glass border border-white/60 space-y-6">
            <div>
              <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">National Metrics</h3>
              <p className="text-3xs text-slate-400">Aggregated from logged citizen profiles.</p>
            </div>

            {/* General summaries */}
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-brand-100 rounded-2xl">
                <span className="text-3xs font-extrabold uppercase text-brand-800 tracking-wider">Total Saving Impact</span>
                <span className="block text-2xl font-black text-brand-700 mt-1">
                  {mapData.reduce((acc, s) => acc + s.carbonSavings, 0).toLocaleString()} kg CO₂
                </span>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                <span className="text-3xs font-extrabold uppercase text-blue-800 tracking-wider">Top Saving State</span>
                <span className="block text-xl font-bold text-blue-900 mt-1">
                  {mapData.length > 0 ? [...mapData].sort((a,b) => b.carbonSavings - a.carbonSavings)[0].state : 'Delhi'}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-4 flex gap-1.5 items-start">
              <Info className="w-4.5 h-4.5 text-brand-600 shrink-0 mt-0.5" />
              <span>Click on any green circle on the map to inspect detail indices, local schemes, and state carbon savings popups.</span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
