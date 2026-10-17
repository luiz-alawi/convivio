import type { RefObject } from 'react';
import type MapView from 'react-native-maps';
import type { LatLng } from 'react-native-maps';

// Aproxima a câmera do ponto com inclinação, no estilo Google Earth.
// `zoom` vale para o Google Maps (Android); `altitude`, em metros, para o Apple Maps (iOS).
export function flyTo(map: RefObject<MapView | null>, center: LatLng, { zoom = 16, altitude = 1500 } = {}) {
  map.current?.animateCamera({ center, zoom, altitude, pitch: 45, heading: 0 }, { duration: 1500 });
}

// Volta a câmera para cima, sem inclinação, olhando o mapa de longe.
export function flyOut(map: RefObject<MapView | null>, center: LatLng, { zoom = 1.5, altitude = 20_000_000 } = {}) {
  map.current?.animateCamera({ center, zoom, altitude, pitch: 0, heading: 0 }, { duration: 1200 });
}
