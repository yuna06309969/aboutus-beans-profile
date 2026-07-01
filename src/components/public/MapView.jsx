import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, GeoJSON, TileLayer, Marker, Popup, useMap, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { feature } from 'topojson-client';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const WORLD_CENTER = [-5, 115];
const WORLD_BOUNDS = [[-90, -185], [90, 185]];

const LAND_STYLE  = { fillColor: '#e8e0d5', fillOpacity: 1, color: '#b8b0a0', weight: 0.5 };
const RIVER_STYLE = { color: '#89b4c8', weight: 1, opacity: 0.7, fill: false };
const LAKE_STYLE  = { fillColor: '#89b4c8', fillOpacity: 0.5, color: '#7aa8bc', weight: 0.5 };

const makePinIcon = (bg, ring) =>
  L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${bg};border:3px solid white;box-shadow:0 0 0 2px ${ring},0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -12],
  });

const ACTIVE_PIN   = makePinIcon('#c2410c', '#fb923c');
const INACTIVE_PIN = makePinIcon('#78716c', '#d6d3d1');

function InteractionController({ locked }) {
  const map = useMap();
  useEffect(() => {
    if (locked) {
      map.dragging.disable();
      map.scrollWheelZoom.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
    } else {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.touchZoom.enable();
    }
  }, [locked, map]);
  return null;
}

function MapSetup({ onWorldZoom }) {
  const map = useMap();
  useEffect(() => {
    [
      ['landPane', 250],
      ['hillPane', 255],
      ['riverPane', 260],
      ['labelPane', 450],
    ].forEach(([name, z]) => {
      if (!map.getPane(name)) {
        const pane = map.createPane(name);
        pane.style.zIndex = String(z);
      }
    });

    let initialized = false;
    const updateMinZoom = () => {
      const z = Math.log2(map.getSize().x / 256);
      map.setMinZoom(z);
      if (!initialized || map.getZoom() < z) map.setZoom(z);
      initialized = true;
      onWorldZoom(z);
    };
    updateMinZoom();
    map.on('resize', updateMinZoom);
    return () => { map.off('resize', updateMinZoom); };
  }, [map, onWorldZoom]);
  return null;
}

function FlyTo({ lat, lng, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) map.flyTo([lat, lng], zoom, { duration: 1.2 });
  }, [lat, lng, zoom, map]);
  return null;
}

function regionKey(location) {
  if (!location) return '不明';
  return location.split(/\s*[\/,]\s*/)[0].trim();
}

function centroid(farmList) {
  const valid = farmList.filter(f => f.lat && f.lng);
  if (!valid.length) return null;
  return {
    lat: valid.reduce((s, f) => s + f.lat, 0) / valid.length,
    lng: valid.reduce((s, f) => s + f.lng, 0) / valid.length,
  };
}

export default function MapView({ countries, farms, beans, onNavigate }) {
  const [level, setLevel]                       = useState('world');
  const [selectedCountry, setSelectedCountry]   = useState(null);
  const [selectedRegion, setSelectedRegion]     = useState(null);
  const [flyTarget, setFlyTarget]               = useState(null);
  const [interactionLocked, setInteractionLocked] = useState(true);
  const [countriesGeo, setCountriesGeo]         = useState(null);
  const [riverGeo, setRiverGeo]                 = useState(null);
  const [lakeGeo, setLakeGeo]                   = useState(null);
  const [worldZoom, setWorldZoom]               = useState(1);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(r => r.json())
      .then(topo => setCountriesGeo(feature(topo, topo.objects.countries)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_rivers_lake_centerlines.geojson')
      .then(r => r.json()).then(setRiverGeo).catch(() => {});
  }, []);

  useEffect(() => {
    fetch('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_lakes.geojson')
      .then(r => r.json()).then(setLakeGeo).catch(() => {});
  }, []);

  const activeFarmSlugs = useMemo(() => new Set(
    beans
      .filter(b => b.status === '販売中' || b.status === '確認中')
      .flatMap(b => [...(b.region ?? '').matchAll(/farm:([\w-]+)/g)].map(m => m[1]))
  ), [beans]);

  const farmsForCountry = useMemo(() => {
    if (!selectedCountry) return [];
    return farms.filter(
      f => (f.country_slug === selectedCountry.slug || f.country_name === selectedCountry.name) && f.lat && f.lng
    );
  }, [selectedCountry, farms]);

  const regionGroups = useMemo(() => {
    const groups = {};
    farmsForCountry.forEach(f => {
      const key = regionKey(f.location);
      if (!groups[key]) groups[key] = [];
      groups[key].push(f);
    });
    return groups;
  }, [farmsForCountry]);

  const farmsInRegion = useMemo(() => {
    if (!selectedRegion) return [];
    return regionGroups[selectedRegion] ?? [];
  }, [selectedRegion, regionGroups]);

  const goToWorld = () => {
    setLevel('world');
    setSelectedCountry(null);
    setSelectedRegion(null);
    setInteractionLocked(true);
    setFlyTarget({ lat: WORLD_CENTER[0], lng: WORLD_CENTER[1], zoom: worldZoom });
  };

  const handleCountryClick = (country) => {
    setSelectedCountry(country);
    setSelectedRegion(null);
    setLevel('country');
    setInteractionLocked(false);
    setFlyTarget({ lat: country.lat, lng: country.lng, zoom: country.zoom ?? 5 });
  };

  const handleRegionClick = (key, farmList) => {
    const c = centroid(farmList);
    if (!c) return;
    setSelectedRegion(key);
    setLevel('region');
    setFlyTarget({ lat: c.lat, lng: c.lng, zoom: 9 });
  };

  const countriesWithCoords = countries.filter(c => c.lat && c.lng);

  const breadcrumb = [
    { label: '🌍 世界', onClick: goToWorld },
    selectedCountry && { label: `${selectedCountry.flag} ${selectedCountry.name}`, onClick: () => { setLevel('country'); setSelectedRegion(null); setFlyTarget({ lat: selectedCountry.lat, lng: selectedCountry.lng, zoom: selectedCountry.zoom ?? 5 }); } },
    selectedRegion  && { label: selectedRegion, onClick: null },
  ].filter(Boolean);

  const onSetWorldZoom = useCallback((z) => setWorldZoom(z), []);

  return (
    <div>
      {/* パンくず */}
      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-3 flex-wrap">
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-stone-300">›</span>}
            {b.onClick
              ? <button type="button" onClick={b.onClick} className="underline decoration-dotted cursor-pointer hover:text-stone-800">{b.label}</button>
              : <span className="text-stone-800 font-medium">{b.label}</span>
            }
          </span>
        ))}
      </div>

      {/* 凡例 */}
      <div className="flex gap-4 mb-3 text-[11px] text-stone-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-orange-700 border-2 border-white shadow" />販売中・確認中
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-stone-400 border-2 border-white shadow" />その他
        </span>
        {!interactionLocked && (
          <span className="ml-auto text-stone-400">ドラッグ・ズーム有効</span>
        )}
      </div>

      {/* マップ */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ height: 'clamp(220px, 35vw, 56vh)', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', position: 'relative' }}
      >
        <div style={{ position: 'absolute', top: '-110px', left: 0, right: 0, bottom: '-20px' }}>
        <MapContainer
          center={WORLD_CENTER}
          zoom={1}
          style={{ height: '100%', width: '100%', background: `url(${import.meta.env.BASE_URL}無題18.png) center/cover` }}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          keyboard={false}
          zoomControl={false}
          maxBounds={WORLD_BOUNDS}
          maxBoundsViscosity={1.0}
        >
          <MapSetup onWorldZoom={onSetWorldZoom} />
          <InteractionController locked={interactionLocked} />
          {flyTarget && <FlyTo lat={flyTarget.lat} lng={flyTarget.lng} zoom={flyTarget.zoom} />}

          {/* ヒルシェード（山岳部を微妙に濃く） */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}"
            opacity={0.15}
            pane="hillPane"
            attribution=""
          />

          {/* 陸地（国別ポリゴン＝国境線自動表示） */}
          {countriesGeo && <GeoJSON data={countriesGeo} style={LAND_STYLE} pane="landPane" />}

          {/* 河川 */}
          {riverGeo && <GeoJSON data={riverGeo} style={RIVER_STYLE} pane="riverPane" />}

          {/* 湖 */}
          {lakeGeo && <GeoJSON data={lakeGeo} style={LAKE_STYLE} pane="riverPane" />}

          {/* ラベル（大陸名→国名、ズームで自動切替） */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
            opacity={0.85}
            pane="labelPane"
            attribution=""
          />

          {/* 世界ビュー：国マーカー */}
          {level === 'world' && countriesWithCoords.map(c => (
            <CircleMarker
              key={c.slug}
              center={[c.lat, c.lng]}
              radius={10}
              pathOptions={{ color: '#fff', weight: 2.5, fillColor: '#92400e', fillOpacity: 0.9 }}
              eventHandlers={{ click: () => handleCountryClick(c) }}
            >
              <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
                <span style={{ fontWeight: 600 }}>{c.flag} {c.name}</span>
              </Tooltip>
            </CircleMarker>
          ))}

          {/* 国ビュー：地域マーカー */}
          {level === 'country' && Object.entries(regionGroups).map(([key, farmList]) => {
            const c = centroid(farmList);
            if (!c) return null;
            return (
              <CircleMarker
                key={key}
                center={[c.lat, c.lng]}
                radius={11}
                pathOptions={{ color: '#fff', weight: 2.5, fillColor: '#d97706', fillOpacity: 0.92 }}
                eventHandlers={{ click: () => handleRegionClick(key, farmList) }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                  <span className="text-xs font-medium">{key}</span>
                  <span className="text-[10px] text-stone-500 ml-1">({farmList.length}農園)</span>
                </Tooltip>
              </CircleMarker>
            );
          })}

          {/* 地域ビュー：農園ピン */}
          {level === 'region' && farmsInRegion.map(farm => {
            const isActive = activeFarmSlugs.has(farm.slug);
            const relatedBeans = beans.filter(b => (b.region ?? '').includes(`farm:${farm.slug}`));
            return (
              <Marker key={farm.slug} position={[farm.lat, farm.lng]} icon={isActive ? ACTIVE_PIN : INACTIVE_PIN}>
                <Popup minWidth={200}>
                  <div className="text-sm leading-relaxed">
                    <div className="font-bold mb-1">{farm.name}</div>
                    {farm.location && <div className="text-stone-500 text-xs mb-1">{farm.location}</div>}
                    {farm.altitude && <div className="text-xs text-stone-500 mb-2">🏔 {farm.altitude}</div>}
                    <button type="button" onClick={() => onNavigate('farms', farm.slug)}
                      className="text-xs underline text-orange-700 block mb-1 cursor-pointer">
                      農園ページへ →
                    </button>
                    {relatedBeans.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-stone-100">
                        <div className="text-[10px] text-stone-400 mb-1 tracking-wide">関連する豆</div>
                        {relatedBeans.map(b => (
                          <button key={b.id} type="button" onClick={() => onNavigate('beans', b.id)}
                            className="text-xs underline text-orange-700 block cursor-pointer">
                            {b.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        </div>
      </div>

      {/* 地域ボタン一覧（国ビュー） */}
      {level === 'country' && Object.keys(regionGroups).length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] text-stone-400 mb-2 tracking-wide">地域をクリックしてズーム</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(regionGroups).map(([key, farmList]) => (
              <button key={key} type="button" onClick={() => handleRegionClick(key, farmList)}
                className="px-3 py-1.5 text-xs border border-stone-300 bg-white hover:border-stone-600 transition-colors cursor-pointer">
                {key} <span className="text-stone-400">({farmList.length})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 農園リスト（地域ビュー） */}
      {level === 'region' && farmsInRegion.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] text-stone-400 mb-2 tracking-wide">ピンをタップ、または農園名をクリック</p>
          <div className="space-y-1">
            {farmsInRegion.map(farm => (
              <button key={farm.slug} type="button" onClick={() => onNavigate('farms', farm.slug)}
                className="w-full text-left px-3 py-2 text-sm border border-stone-200 bg-white hover:bg-stone-50 transition-colors cursor-pointer flex justify-between items-center">
                <span className="underline decoration-dotted">{farm.name}</span>
                {activeFarmSlugs.has(farm.slug) && (
                  <span className="text-[10px] text-orange-700 border border-orange-200 px-1.5 py-0.5">販売中</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {level === 'world' && (
        <p className="text-[11px] text-stone-400 mt-3 text-center">国のマーカーをクリックして産地に絞り込む</p>
      )}
    </div>
  );
}
