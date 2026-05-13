import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const route = [
  [19.432608, -99.133209],
  [19.684979, -99.195576],
  [19.706897, -98.986269],
  [19.850449, -98.977153]
];

export default function RouteMap() {
  return (
    <div className="map-panel">
      <div className="panel-header">
        <div>
          <p className="panel-label">Mapa de rutas</p>
          <h3>Estado del recorrido</h3>
        </div>
      </div>
      <MapContainer center={[19.6, -99.08]} zoom={10} scrollWheelZoom={false} className="delivery-map">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline pathOptions={{ color: '#facf5a', weight: 5, opacity: 0.88 }} positions={route} />
        <CircleMarker center={route[0]} pathOptions={{ color: '#34d399', fillColor: '#34d399' }} radius={6}>
          <Tooltip direction="top">Origen: Centro de distribución</Tooltip>
        </CircleMarker>
        <CircleMarker center={route[route.length - 1]} pathOptions={{ color: '#38bdf8', fillColor: '#38bdf8' }} radius={6}>
          <Tooltip direction="top">Destino: Cliente final</Tooltip>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
