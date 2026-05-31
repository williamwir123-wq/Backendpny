import { useEffect, useMemo, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CircleMarker, LayerGroup, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from '../../components/Layout';
import HeroIcon from '../../components/HeroIcon';
import api from '../../utils/api';
import './Peta.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const ICONS = {
  'Rumah Sakit': { icon: 'health', color: '#e74c3c' },
  'Sekolah':     { icon: 'school', color: '#043CB1' },
  'Taman':       { icon: 'park', color: '#F0C98A' },
  'Kantor Pemerintah': { icon: 'government', color: '#7C5CFF' },
  'Pasar':       { icon: 'banknotes', color: '#E67E22' },
  'Masjid':      { icon: 'building', color: '#E3B473' },
};

const createCustomIcon = (jenis) => {
  const cfg = ICONS[jenis] || { icon: 'mapPin', color: '#E3B473' };
  const iconMarkup = renderToStaticMarkup(<HeroIcon name={cfg.icon} style={{ width: 18, height: 18 }} />);
  return L.divIcon({
    html: `<div style="
      background:${cfg.color};
      width:36px;height:36px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      color:white;
    "><span style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;">${iconMarkup}</span></div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const FILTER_OPTIONS = ['Semua', 'Rumah Sakit', 'Sekolah', 'Taman', 'Kantor Pemerintah', 'Pasar', 'Masjid'];
const DEFAULT_CENTER = [3.5896, 98.6739];

function MapController({ facilities, selectedFacility, selectedRoad, userLocation, resetVersion }) {
  const map = useMap();

  useEffect(() => {
    if (!facilities.length) return;
    const bounds = L.latLngBounds(facilities.map(facility => [facility.lat, facility.lng]));
    map.fitBounds(bounds, { padding: [44, 44], maxZoom: 14 });
  }, [facilities, map, resetVersion]);

  useEffect(() => {
    if (selectedFacility) {
      map.flyTo([selectedFacility.lat, selectedFacility.lng], Math.max(map.getZoom(), 15), { duration: 0.55 });
    }
  }, [map, selectedFacility]);

  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 15, { duration: 0.55 });
    }
  }, [map, userLocation]);

  useEffect(() => {
    if (selectedRoad) {
      map.flyTo([selectedRoad.lat, selectedRoad.lng], 16, { duration: 0.55 });
    }
  }, [map, selectedRoad]);

  return null;
}

export default function PetaInteraktif() {
  const [facilities, setFacilities] = useState([]);
  const [filter, setFilter] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState('');
  const [resetVersion, setResetVersion] = useState(0);
  const [roadQuery, setRoadQuery] = useState('');
  const [roadSuggestions, setRoadSuggestions] = useState([]);
  const [roadSearchLoading, setRoadSearchLoading] = useState(false);
  const [roadSearchFocused, setRoadSearchFocused] = useState(false);
  const [selectedRoad, setSelectedRoad] = useState(null);

  useEffect(() => {
    api.get('/facilities').then(r => {
      setFacilities(r.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const normalizedQuery = roadQuery.trim();
    if (normalizedQuery.length < 3 || !roadSearchFocused) {
      setRoadSuggestions([]);
      setRoadSearchLoading(false);
      return undefined;
    }

    let cancelled = false;
    setRoadSearchLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const response = await api.get('/city-services/roads/search', { params: { q: normalizedQuery } });
        if (!cancelled) setRoadSuggestions(response.data.data || []);
      } catch {
        if (!cancelled) setRoadSuggestions([]);
      } finally {
        if (!cancelled) setRoadSearchLoading(false);
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [roadQuery, roadSearchFocused]);

  const categoryCounts = useMemo(() => facilities.reduce((counts, facility) => ({
    ...counts,
    [facility.jenis]: (counts[facility.jenis] || 0) + 1,
  }), {}), [facilities]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return facilities.filter(facility => {
      const matchesFilter = filter === 'Semua' || facility.jenis === filter;
      const matchesQuery = !normalizedQuery || [facility.nama, facility.alamat, facility.kecamatan]
        .some(value => value?.toLowerCase().includes(normalizedQuery));
      return matchesFilter && matchesQuery;
    });
  }, [facilities, filter, query]);

  const selectFacility = facility => {
    setSelectedFacility(facility);
    setSelectedRoad(null);
    setLocationMessage('');
  };

  const selectRoad = road => {
    setSelectedFacility(null);
    setUserLocation(null);
    setSelectedRoad(road);
    setRoadQuery(`${road.nama} - ${road.ruas}`);
    setRoadSearchFocused(false);
    setLocationMessage(`Menampilkan ${road.nama}.`);
  };

  const resetMap = () => {
    setFilter('Semua');
    setQuery('');
    setSelectedFacility(null);
    setUserLocation(null);
    setLocationMessage('');
    setResetVersion(version => version + 1);
    setRoadQuery('');
    setRoadSuggestions([]);
    setSelectedRoad(null);
  };

  const locateUser = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Browser tidak mendukung deteksi lokasi.');
      return;
    }

    setLocationMessage('Mengambil lokasi Anda...');
    navigator.geolocation.getCurrentPosition(
      position => {
        setSelectedFacility(null);
        setSelectedRoad(null);
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setLocationMessage('Lokasi Anda ditemukan.');
      },
      () => setLocationMessage('Lokasi tidak dapat diakses. Periksa izin browser Anda.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  return (
    <Layout title="Peta Interaktif" subtitle="Fasilitas publik Kota Medan">
      <div className="peta-wrap">
        <div className="peta-toolbar">
          <label className="peta-search">
            <HeroIcon name="search" />
            <input
              type="search"
              placeholder="Cari nama fasilitas, alamat, atau kecamatan"
              value={query}
              onChange={event => {
                setQuery(event.target.value);
                setSelectedFacility(null);
              }}
            />
          </label>
          <button type="button" className="peta-toolbar-btn" onClick={locateUser}>
            <HeroIcon name="mapPin" /> Lokasi Saya
          </button>
          <button type="button" className="peta-toolbar-btn secondary" onClick={resetMap}>
            <HeroIcon name="arrowPath" /> Reset
          </button>
        </div>

        <div className="peta-road-search-wrap">
          <label className="peta-road-search">
            <HeroIcon name="road" />
            <input
              type="search"
              placeholder="Cari jalan di Kota Medan, contoh: Gatot Subroto"
              value={roadQuery}
              onChange={event => {
                setRoadQuery(event.target.value);
                setSelectedRoad(null);
              }}
              onFocus={() => setRoadSearchFocused(true)}
              onBlur={() => window.setTimeout(() => setRoadSearchFocused(false), 120)}
            />
            {roadSearchLoading && <span>Mencari...</span>}
          </label>
          {roadSearchFocused && roadSuggestions.length > 0 && (
            <div className="peta-road-suggestions">
              {roadSuggestions.map(road => (
                <button
                  type="button"
                  key={`${road.nama}-${road.ruas}-${road.lat}-${road.lng}`}
                  onMouseDown={() => selectRoad(road)}
                >
                  <HeroIcon name="mapPin" />
                  <span>
                    <strong>{road.nama}</strong>
                    <small>{road.ruas}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="peta-filters">
          <span className="peta-filter-label">Filter:</span>
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => {
                setFilter(opt);
                setSelectedFacility(null);
              }}
              className={`peta-filter-btn ${filter === opt ? 'active' : ''}`}
            >
              {opt !== 'Semua' && <HeroIcon name={ICONS[opt]?.icon} />}
              {opt}{opt !== 'Semua' && ` (${categoryCounts[opt] || 0})`}
            </button>
          ))}
          <span className="peta-count">{filtered.length} lokasi</span>
        </div>

        <div className="peta-layout">
          <aside className="peta-sidebar">
            <div className="peta-sidebar-head">
              <div>
                <strong>Daftar Fasilitas</strong>
                <span>{filtered.length} lokasi ditemukan</span>
              </div>
              {locationMessage && <small>{locationMessage}</small>}
            </div>
            <div className="peta-facility-list">
              {filtered.map(facility => (
                <button
                  type="button"
                  key={facility.id}
                  className={`peta-facility-item ${selectedFacility?.id === facility.id ? 'active' : ''}`}
                  onClick={() => selectFacility(facility)}
                >
                  <span className="peta-facility-icon" style={{ background: ICONS[facility.jenis]?.color }}>
                    <HeroIcon name={ICONS[facility.jenis]?.icon || 'mapPin'} />
                  </span>
                  <span>
                    <strong>{facility.nama}</strong>
                    <small>{facility.alamat || facility.kecamatan}</small>
                  </span>
                </button>
              ))}
              {!loading && filtered.length === 0 && <p className="peta-empty">Fasilitas tidak ditemukan.</p>}
            </div>
          </aside>

          <div className="peta-map-column">
            <div className="map-container">
              {!loading && (
                <MapContainer
                  center={DEFAULT_CENTER}
                  zoom={13}
                  style={{ height: '100%', width: '100%', borderRadius: 22 }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  />
                  <MapController
                    facilities={filtered}
                    selectedFacility={selectedFacility}
                    selectedRoad={selectedRoad}
                    userLocation={userLocation}
                    resetVersion={resetVersion}
                  />
                  {userLocation && (
                    <CircleMarker center={userLocation} radius={9} pathOptions={{ color: '#FFFFFF', fillColor: '#043CB1', fillOpacity: 1, weight: 4 }}>
                      <Popup>Lokasi Anda</Popup>
                    </CircleMarker>
                  )}
                  {selectedRoad && (
                    <CircleMarker
                      center={[selectedRoad.lat, selectedRoad.lng]}
                      radius={11}
                      pathOptions={{ color: '#FFFFFF', fillColor: '#E67E22', fillOpacity: 1, weight: 4 }}
                    >
                      <Popup>
                        <strong>{selectedRoad.nama}</strong><br />
                        {selectedRoad.ruas}
                      </Popup>
                    </CircleMarker>
                  )}
                  <LayerGroup>
                    {filtered.map(f => (
                      <Marker
                        key={f.id}
                        position={[f.lat, f.lng]}
                        icon={createCustomIcon(f.jenis)}
                        eventHandlers={{ click: () => selectFacility(f) }}
                      >
                        <Popup maxWidth={260}>
                          <div className="popup-content">
                            <div className="popup-header">
                              <span className="popup-emoji"><HeroIcon name={ICONS[f.jenis]?.icon || 'mapPin'} /></span>
                              <div>
                                <div className="popup-nama">{f.nama}</div>
                                <span className="popup-jenis" style={{ background: ICONS[f.jenis]?.color + '22', color: ICONS[f.jenis]?.color }}>
                                  {f.jenis}
                                </span>
                              </div>
                            </div>
                            <div className="popup-body">
                              {f.alamat && <p><HeroIcon name="mapPin" /> {f.alamat}</p>}
                              {f.kecamatan && <p><HeroIcon name="city" /> {f.kecamatan}</p>}
                              {f.telepon && <p><HeroIcon name="phone" /> {f.telepon}</p>}
                              {f.jam_buka && <p><HeroIcon name="clock" /> {f.jam_buka}</p>}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </LayerGroup>
                </MapContainer>
              )}
              {loading && <div className="map-loading"><span className="icon-inline"><HeroIcon name="arrowPath" /> Memuat peta...</span></div>}
            </div>

            {selectedFacility && (
              <article className="peta-detail">
                <span className="peta-detail-icon" style={{ background: ICONS[selectedFacility.jenis]?.color }}>
                  <HeroIcon name={ICONS[selectedFacility.jenis]?.icon || 'mapPin'} />
                </span>
                <div>
                  <span className="peta-detail-type">{selectedFacility.jenis}</span>
                  <h2>{selectedFacility.nama}</h2>
                  <p>{selectedFacility.alamat} · {selectedFacility.kecamatan}</p>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.lat},${selectedFacility.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Petunjuk Arah
                </a>
              </article>
            )}

            {selectedRoad && (
              <article className="peta-detail">
                <span className="peta-detail-icon peta-road-detail-icon">
                  <HeroIcon name="road" />
                </span>
                <div>
                  <span className="peta-detail-type">Jalan Kota Medan</span>
                  <h2>{selectedRoad.nama}</h2>
                  <p>{selectedRoad.ruas}</p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedRoad.lat},${selectedRoad.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Buka di Maps
                </a>
              </article>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
