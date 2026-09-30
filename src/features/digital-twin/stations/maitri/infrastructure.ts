/**
 * MAITRI ANTARCTIC RESEARCH STATION — INFRASTRUCTURE ASSET CATALOG
 * 
 * Formal NCPOR evidence-based asset registry with physical dimensions,
 * elevated steel-stilt structural specifications, and system dependencies.
 */

export interface MaitriAssetDefinition {
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

export const MAITRI_INFRASTRUCTURE: MaitriAssetDefinition[] = [
  {
    id: 'ma_hab_core',
    code: 'MA-HAB-01',
    name: 'Elevated Main Building on Steel Stilts',
    category: 'MAIN_BUILDING',
    dimensionsM: { length: 42.0, width: 22.0, height: 5.4 },
    grossFloorAreaM2: 920.0,
    localCoords3D: { x: 0.0, y: 2.2, z: 0.0 },
    confidence: 'VERIFIED',
    source: 'NCPOR Official Station Documentation & Structural Engineering Records',
    lastVerified: 'NCPOR Maitri Structural Integrity Assessment',
    geometricBasis: 'Elevated Steel Stilt Structure (Living, Laboratories, Utilities, Circulation) with 2.2m Wind Clearance over Moraine Bedrock',
  },
  {
    id: 'ma_fuel_farm',
    code: 'MA-FUEL-FARM',
    name: 'Maitri Bulk Fuel Farm & Containment Facility',
    category: 'FUEL',
    dimensionsM: { length: 18.0, width: 14.0, height: 3.8 },
    localCoords3D: { x: -18.0, y: 1.0, z: -10.0 },
    confidence: 'VERIFIED',
    source: 'NCPOR Maitri Station Engineering Archival Records',
    lastVerified: 'NCPOR Environmental Compliance Inspection',
    geometricBasis: 'Bulk Storage Tanks with Double Berm Containment Barrier',
  },
  {
    id: 'ma_fuel_station',
    code: 'MA-FUEL-STAT',
    name: 'Maitri Polar Vehicle Dispenser Station',
    category: 'FUEL',
    dimensionsM: { length: 7.0, width: 5.0, height: 3.2 },
    localCoords3D: { x: -12.0, y: 0.8, z: -6.0 },
    confidence: 'VERIFIED',
    source: 'NCPOR Station Maintenance Plan',
    lastVerified: 'NCPOR Operational Review',
    geometricBasis: 'Service Dispenser Station for Heavy Tracked Vehicles and Snowmobiles',
  },
  {
    id: 'ma_lake_pump',
    code: 'MA-LAKE-PUMP',
    name: 'Lake-Water Pump House (Lake Priyadarshini Intake)',
    category: 'WATER',
    dimensionsM: { length: 7.2, width: 5.2, height: 3.2 },
    localCoords3D: { x: 22.0, y: 0.4, z: -12.0 },
    confidence: 'VERIFIED',
    source: 'NCPOR Official Station Documentation (Lake-Water Pump House Specification)',
    lastVerified: 'NCPOR Water Supply & Quality Assurance',
    geometricBasis: 'Lake Priyadarshini Submerged Heated Intake Pump House with Trace-Heated Pipeline to Main Complex',
  },
  {
    id: 'ma_summer_camp',
    code: 'MA-SUMMER-CAMP',
    name: 'Maitri Summer Camp Modular Living Chalets',
    category: 'LOGISTICS',
    dimensionsM: { length: 20.0, width: 10.0, height: 3.4 },
    localCoords3D: { x: 18.0, y: 1.2, z: 12.0 },
    confidence: 'VERIFIED',
    source: 'NCPOR Summer Expedition Accommodation Records',
    lastVerified: 'NCPOR Station Operations',
    geometricBasis: 'Seasonal Field Units for Scientists & Logistics Crews (15 Berths)',
  },
  {
    id: 'ma_containers',
    code: 'MA-CONTAINERS',
    name: 'Maitri Containerized Field Science & Storage Pods',
    category: 'LOGISTICS',
    dimensionsM: { length: 16.0, width: 7.5, height: 2.8 },
    localCoords3D: { x: -16.0, y: 0.8, z: -14.0 },
    confidence: 'VERIFIED',
    source: 'NCPOR Field Equipment Catalog',
    lastVerified: 'NCPOR Logistics Inventory',
    geometricBasis: 'Geological Sampling Storage and Field Gear Repository',
  },
  {
    id: 'ma_access_routes',
    code: 'MA-ROUTES',
    name: 'Maitri Schirmacher Oasis Moraine Vehicle Routes',
    category: 'CIVIL',
    dimensionsM: { length: 120.0, width: 4.0, height: 0.15 },
    localCoords3D: { x: 0.0, y: 0.05, z: 0.0 },
    confidence: 'VERIFIED',
    source: 'NCPOR Maitri Field Navigation Chart',
    lastVerified: 'NCPOR Safety Audit',
    geometricBasis: 'Clear Moraine Access Track from Station to Priyadarshini Pump House and Fuel Depot',
  },
  {
    id: 'ma_gen_01',
    code: 'MA-GEN-01',
    name: 'Primary Genset 01 (125 kVA Kirloskar)',
    category: 'ENERGY',
    dimensionsM: { length: 5.4, width: 3.2, height: 2.6 },
    localCoords3D: { x: -21.0, y: 1.65, z: -8.0 },
    confidence: 'VERIFIED',
    source: 'NCPOR Electrical Equipment Manifest',
    lastVerified: 'NCPOR Power Audit',
    geometricBasis: 'Stationary Heavy Industrial Diesel Generator Enclosure',
  },
  {
    id: 'ma_boiler_01',
    code: 'MA-BOILER-01',
    name: 'Central Hydronic Heating Boiler Plant',
    category: 'ENERGY',
    dimensionsM: { length: 6.8, width: 4.0, height: 3.2 },
    localCoords3D: { x: 4.0, y: 1.7, z: -8.0 },
    confidence: 'VERIFIED',
    source: 'NCPOR Thermal Life Support Blueprint',
    lastVerified: 'NCPOR Mechanical Systems Inspection',
    geometricBasis: 'Dual Boiler Enclosure with Flue Stacks and Primary Heat Exchangers',
  },
  {
    id: 'ma_comms_01',
    code: 'MA-SAT-01',
    name: 'Inmarsat & HF Communications Array',
    category: 'COMMS',
    dimensionsM: { length: 4.0, width: 4.0, height: 8.5 },
    localCoords3D: { x: 12.0, y: 8.8, z: -6.0 },
    confidence: 'VERIFIED',
    source: 'NCPOR Telecommunications Registry',
    lastVerified: 'NCPOR Radio Comms Review',
    geometricBasis: 'Lattice Comms Mast with Tracking Radome and HF Dipole Array',
  },
  {
    id: 'ma_lab_geo',
    code: 'MA-GEO-01',
    name: 'Geomagnetic & Seismological Laboratory',
    category: 'SCIENCE',
    dimensionsM: { length: 5.6, width: 3.8, height: 2.8 },
    localCoords3D: { x: -14.0, y: 1.45, z: -16.0 },
    confidence: 'VERIFIED',
    source: 'IAGA Geomagnetic Observatory Specifications',
    lastVerified: 'Survey of India / IAGA Certification',
    geometricBasis: 'Non-Magnetic Timber & Brass Construction on Granite Pillars',
  },
];
