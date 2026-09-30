import { GeodeticCoordinate, ProjectedCoordinate, LocalEnuCoordinate } from '../../geospatial/GeoReferenceEngine';

/**
 * BHARATI ANTARCTIC RESEARCH STATION — GEOGRAPHIC REFERENCE & COORDINATE SYSTEM
 * 
 * Authoritative Primary Baseline: National Centre for Polar and Ocean Research (NCPOR), MoES, India
 * 
 * Location:
 * - Latitude: 69° 24.41′ S (-69.406833° decimal)
 * - Longitude: 76° 11.72′ E (76.195333° decimal)
 * - Elevation: 35.0 m Above Mean Sea Level (ASL)
 * - Region: Larsemann Hills, Ingrid Christensen Coast, Princess Elizabeth Land, East Antarctica
 * - Geographic Setting: Rocky promontory between Thala Fjord (west) and Quilty Bay (east), east of Stornes Peninsula
 * - Commissioned: 18 March 2012
 */

export const BHARATI_COORDINATES: {
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
    feature: 'FJORD' | 'BAY' | 'PENINSULA' | 'SEA_ICE' | 'NUNATAK';
    description: string;
  }>;
} = {
  stationId: 'station_bharati',
  name: 'Bharati Antarctic Research Station',
  code: 'BHARATI',
  region: 'Larsemann Hills, East Antarctica',
  geographicContext: 'Promontory between Thala Fjord and Quilty Bay, East of Stornes Peninsula',
  commissionedDate: '2012-03-18',
  wgs84: {
    latitude: -69.406833, // 69° 24.41′ S
    longitude: 76.195333, // 76° 11.72′ E
    elevationM: 35.0,
  },
  projectedEpsg3031: {
    eastingM: 2195619.49,
    northingM: 539485.51,
    elevationM: 35.0,
    epsg: 'EPSG:3031',
  },
  localEnuOrigin: {
    eastM: 0.0,
    northM: 0.0,
    upM: 3.6, // Habitat structural floor elevation above bedrock
  },
  magneticDeclinationDeg: -64.8,
  utmGridZone: '43D',
  landmarks: [
    {
      name: 'Thala Fjord',
      bearingDeg: 285.0, // West-Northwest
      distanceMeters: 450.0,
      feature: 'FJORD',
      description: 'Deep coastal fjord providing marine approach and sea-water intake basin',
    },
    {
      name: 'Quilty Bay',
      bearingDeg: 75.0, // East-Northeast
      distanceMeters: 600.0,
      feature: 'BAY',
      description: 'Protected coastal embayment on eastern flank of the station ridge',
    },
    {
      name: 'Stornes Peninsula',
      bearingDeg: 245.0, // West-Southwest
      distanceMeters: 2800.0,
      feature: 'PENINSULA',
      description: 'Major Antarctic Specially Protected Area (ASPA No. 174) with boron-bearing pegmatites',
    },
    {
      name: 'Prydz Bay Sea Ice Shelf',
      bearingDeg: 0.0, // Due North
      distanceMeters: 180.0,
      feature: 'SEA_ICE',
      description: 'Seasonal fast-ice and pack-ice shelf fronting the Southern Ocean',
    },
    {
      name: 'Broknes Peninsula Ridge',
      bearingDeg: 160.0, // South-Southeast
      distanceMeters: 1200.0,
      feature: 'NUNATAK',
      description: 'Ice-free metamorphic gneiss and granulite rock hills rising to 130m ASL',
    },
  ],
};
