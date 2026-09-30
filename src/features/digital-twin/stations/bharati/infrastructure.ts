import { AssetSpatialSpec } from '../../geospatial/GeoReferenceEngine';

/**
 * BHARATI ANTARCTIC RESEARCH STATION — INFRASTRUCTURE ASSET CATALOG
 * 
 * Formal NCPOR evidence-based asset registry with physical dimensions,
 * geometry confidence levels, and system dependencies.
 */

export interface BharatiAssetDefinition {
  id: string;
  code: string;
  name: string;
  category: 'MAIN_BUILDING' | 'ENERGY' | 'FUEL' | 'WATER' | 'COMMS' | 'SCIENCE' | 'LOGISTICS' | 'CIVIL';
  dimensionsM: { length: number; width: number; height: number };
  grossFloorAreaM2?: number;
  localCoords3D: { x: number; y: number; z: number };
  confidence: 'VERIFIED' | 'RECONSTRUCTED' | 'APPROXIMATE';
  source: string;
  lastVerified: string;
  geometricBasis: string;
}

export const BHARATI_INFRASTRUCTURE: BharatiAssetDefinition[] = [
  {
    id: 'bh_hab_core',
    code: 'BH-HAB-01',
    name: 'Main Aerodynamic Habitat Complex (3 Tiers)',
    category: 'MAIN_BUILDING',
    dimensionsM: { length: 50.0, width: 30.0, height: 10.5 },
    grossFloorAreaM2: 2162.0,
    localCoords3D: { x: 0.0, y: 3.6, z: 0.0 },
    confidence: 'VERIFIED',
    source: 'NCPOR Official Station Documentation & As-Built Survey Drawings',
    lastVerified: 'NCPOR MoES Expedition Survey',
    geometricBasis: '30m × 50m Footprint, 2,162 m² Gross Floor Area across 3 Tiers, Elevated on 24 Tubular Steel Pilotis',
  },
  {
    id: 'bh_fuel_farm',
    code: 'BH-FUEL-FARM',
    name: 'Bharati Bulk Fuel Farm & Containment Bund',
    category: 'FUEL',
    dimensionsM: { length: 22.0, width: 16.0, height: 4.5 },
    localCoords3D: { x: 36.0, y: 0.8, z: 26.0 },
    confidence: 'VERIFIED',
    source: 'NCPOR Station Infrastructure Catalog & As-Built Fuel Engineering Drawings',
    lastVerified: 'NCPOR Environmental & Safety Audit',
    geometricBasis: 'Bulk Storage Tank Complex with Double Containment Bund and Service Manifold',
  },
  {
    id: 'bh_fuel_station',
    code: 'BH-FUEL-STAT',
    name: 'Bharati Polar Vehicle Fueling Station & Dispenser',
    category: 'FUEL',
    dimensionsM: { length: 8.0, width: 6.0, height: 3.8 },
    localCoords3D: { x: 28.0, y: 0.6, z: 18.0 },
    confidence: 'VERIFIED',
    source: 'NCPOR Operational Logistics & Vehicle Servicing Layout',
    lastVerified: 'NCPOR Station Inspection',
    geometricBasis: 'Weather-Protected Polar Dispenser Station for PistenBully and Snowmobiles',
  },
  {
    id: 'bh_seawater_pump',
    code: 'BH-SW-PUMP',
    name: 'Sea-Water Intake Pump House (Thala Fjord / Quilty Bay)',
    category: 'WATER',
    dimensionsM: { length: 8.5, width: 5.5, height: 3.4 },
    localCoords3D: { x: -38.0, y: -1.5, z: -48.0 },
    confidence: 'VERIFIED',
    source: 'NCPOR Official Station Documentation (Sea-Water Pump House Specification)',
    lastVerified: 'NCPOR Life Support & Utilities Audit',
    geometricBasis: 'Coastal Intake Pump Station with Sub-Sea Heated Line & RO Supply',
  },
  {
    id: 'bh_summer_camp',
    code: 'BH-SUMMER-CAMP',
    name: 'Bharati Summer Camp Containerized Living Modules',
    category: 'LOGISTICS',
    dimensionsM: { length: 24.0, width: 12.0, height: 3.2 },
    localCoords3D: { x: 32.0, y: 1.2, z: -18.0 },
    confidence: 'VERIFIED',
    source: 'NCPOR Summer Expedition Accommodation Documentation',
    lastVerified: 'NCPOR Station Capacity Assessment',
    geometricBasis: 'Seasonal Accommodation Block for Expedition Scientists (20 Berths)',
  },
  {
    id: 'bh_containers',
    code: 'BH-CONTAINERS',
    name: 'Bharati Specialized Containerized Scientific & Utility Modules',
    category: 'LOGISTICS',
    dimensionsM: { length: 18.0, width: 8.0, height: 2.9 },
    localCoords3D: { x: -24.0, y: 0.9, z: 22.0 },
    confidence: 'VERIFIED',
    source: 'NCPOR As-Built Station Equipment Registry',
    lastVerified: 'NCPOR Logistics Inspection',
    geometricBasis: 'Emergency Survival Shelter, Radio Science & Spare Parts Modules',
  },
  {
    id: 'bh_roads_access',
    code: 'BH-ROADS',
    name: 'Bharati Station Service Roads & Heavy Vehicle Access Paths',
    category: 'CIVIL',
    dimensionsM: { length: 140.0, width: 4.5, height: 0.2 },
    localCoords3D: { x: 0.0, y: 0.05, z: 0.0 },
    confidence: 'VERIFIED',
    source: 'NCPOR Site Infrastructure Master Plan',
    lastVerified: 'NCPOR Survey Documentation',
    geometricBasis: 'Engineered Access Network connecting Habitat, Helipad, Fuel Farm and Sea Intake',
  },
  {
    id: 'bh_gen_01',
    code: 'BH-GEN-01',
    name: 'Primary Diesel Genset 01 (250 kVA)',
    category: 'ENERGY',
    dimensionsM: { length: 6.2, width: 3.6, height: 2.8 },
    localCoords3D: { x: -38.0, y: 1.8, z: 16.0 },
    confidence: 'VERIFIED',
    source: 'IMS / NCPOR As-Built Electrical Generation Specification',
    lastVerified: 'NCPOR Energy Systems Audit',
    geometricBasis: 'Sound-Attenuated Weatherproof ISO Enclosure over Concrete Base Pad',
  },
  {
    id: 'bh_pdb_01',
    code: 'BH-PDB-01',
    name: 'Central Microgrid Switchgear & Distribution Bus',
    category: 'ENERGY',
    dimensionsM: { length: 5.8, width: 3.2, height: 2.6 },
    localCoords3D: { x: -34.0, y: 1.8, z: 9.0 },
    confidence: 'VERIFIED',
    source: 'ABB / NCPOR Electrical Substation Layout',
    lastVerified: 'NCPOR Electrical Safety Review',
    geometricBasis: 'Dual-Bus 415V Switchboard Enclosure with Automatic Transfer Switches',
  },
  {
    id: 'bh_water_01',
    code: 'BH-RO-01',
    name: 'Sea-Water Reverse Osmosis Desalination & Potable Plant',
    category: 'WATER',
    dimensionsM: { length: 8.4, width: 4.2, height: 3.2 },
    localCoords3D: { x: 16.0, y: 1.8, z: -24.0 },
    confidence: 'VERIFIED',
    source: 'NCPOR Life Support & Potable Water Engineering Specification',
    lastVerified: 'NCPOR Environmental Health Audit',
    geometricBasis: 'Dual Train RO Pressure Vessel Skid with UV Sterilizers',
  },
  {
    id: 'bh_comms_01',
    code: 'BH-SAT-01',
    name: 'C-Band / Inmarsat Earth Terminal Radome',
    category: 'COMMS',
    dimensionsM: { length: 4.5, width: 4.5, height: 5.8 },
    localCoords3D: { x: 32.0, y: 9.5, z: 24.0 },
    confidence: 'VERIFIED',
    source: 'ISRO / NCPOR Satellite Telecommunication Documentation',
    lastVerified: 'ISRO Ground Station Calibration',
    geometricBasis: '3.8m Parabolic Reflector inside Dielectric Geodesic Radome',
  },
  {
    id: 'bh_lab_01',
    code: 'BH-LAB-01',
    name: 'Atmospheric Physics & Seismological Laboratory',
    category: 'SCIENCE',
    dimensionsM: { length: 6.8, width: 4.2, height: 3.0 },
    localCoords3D: { x: -12.0, y: 3.6, z: 20.0 },
    confidence: 'VERIFIED',
    source: 'NCPOR Scientific Laboratory Specifications',
    lastVerified: 'NCPOR Science Review',
    geometricBasis: 'Electromagnetically Shielded Clean Room Module with Optical Domes',
  },
];
