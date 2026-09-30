import { GeodeticCoordinate, ProjectedCoordinate, LocalEnuCoordinate } from '../../geospatial/GeoReferenceEngine';

/**
 * MAITRI ANTARCTIC RESEARCH STATION — GEOGRAPHIC REFERENCE & COORDINATE SYSTEM
 * 
 * Authoritative Primary Baseline: National Centre for Polar and Ocean Research (NCPOR), MoES, India
 * 
 * Location:
 * - Latitude: 70° 45′ 52″ S (-70.764444° decimal)
 * - Longitude: 11° 44′ 03″ E (11.734167° decimal)
 * - Elevation: 50.0 m Above Mean Sea Level (ASL)
 * - Region: Schirmacher Oasis, Queen Maud Land (Dronning Maud Land), East Antarctica
 * - Geographic Setting: Ice-free rocky oasis plateau ~100 km inland from the Princess Astrid Coast, adjacent to Lake Priyadarshini
 * - Commissioned: 1989 (India's second permanent Antarctic station)
 */

export const MAITRI_COORDINATES: {
  stationId: string;
  name: string;
  code: string;
  region: string;
  geographicContext: string;
  commissionedDate: string;
  wgs84: GeodeticCoordinate;
  projectedEpsg3031: ProjectedCoordinate;
  localEnuOrigin: LocalEnuCoordinate;
  magneticDeclinationDeg: number;
  utmGridZone: string;
  landmarks: Array<{
    name: string;
    bearingDeg: number;
    distanceMeters: number;
    feature: 'LAKE' | 'OASIS' | 'ICE_SHEET' | 'NUNATAK' | 'COAST';
    description: string;
  }>;
} = {
  stationId: 'station_maitri',
  name: 'Maitri Antarctic Research Station',
  code: 'MAITRI',
  region: 'Schirmacher Oasis, Queen Maud Land',
  geographicContext: 'Inland rocky oasis ~100 km from the Princess Astrid Coast, adjacent to Lake Priyadarshini',
  commissionedDate: '1989-01-01',
  wgs84: {
    latitude: -70.764444, // 70° 45′ 52″ S
    longitude: 11.734167, // 11° 44′ 03″ E
    elevationM: 50.0,
  },
  projectedEpsg3031: {
    eastingM: 428920.20,
    northingM: 2064975.31,
    elevationM: 50.0,
    epsg: 'EPSG:3031',
  },
  localEnuOrigin: {
    eastM: 0.0,
    northM: 0.0,
    upM: 2.2, // Elevated on steel stilts 2.2m above moraine bedrock
  },
  magneticDeclinationDeg: -23.2,
  utmGridZone: '32E',
  landmarks: [
    {
      name: 'Lake Priyadarshini',
      bearingDeg: 65.0, // East-Northeast
      distanceMeters: 250.0,
      feature: 'LAKE',
      description: 'Pristine freshwater periglacial lake providing year-round station water supply',
    },
    {
      name: 'Schirmacher Oasis Moraine Ridge',
      bearingDeg: 270.0, // Due West
      distanceMeters: 600.0,
      feature: 'OASIS',
      description: 'Ice-free undulating gneissic moraine landscape with permafrost scree',
    },
    {
      name: 'Continental Polar Ice Sheet Margin',
      bearingDeg: 180.0, // Due South
      distanceMeters: 1400.0,
      feature: 'ICE_SHEET',
      description: 'Rising Antarctic continental ice sheet rising towards the polar plateau',
    },
    {
      name: 'Princess Astrid Coast Shelf Ice',
      bearingDeg: 0.0, // Due North
      distanceMeters: 100000.0, // ~100 km inland
      feature: 'COAST',
      description: 'Nivlisen ice shelf extending ~100 km northwards to the Southern Ocean',
    },
    {
      name: 'Wohlthat Mountains Nunataks',
      bearingDeg: 140.0, // South-East
      distanceMeters: 45000.0,
      feature: 'NUNATAK',
      description: 'Spectacular alpine peaks piercing through the continental inland ice',
    },
  ],
};
