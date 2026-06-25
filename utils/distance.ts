// Distance calculation using Haversine formula

export interface Coordinates {
  lat: number;
  lng: number;
}

export const haversineDistance = (
  coords1: Coordinates,
  coords2: Coordinates
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coords2.lat - coords1.lat);
  const dLng = toRadians(coords2.lng - coords1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coords1.lat)) *
      Math.cos(toRadians(coords2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${Math.round(distanceKm)} km away`;
};

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
