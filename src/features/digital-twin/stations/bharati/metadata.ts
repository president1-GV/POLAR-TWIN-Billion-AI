/**
 * BHARATI ANTARCTIC RESEARCH STATION — NCPOR OFFICIAL METADATA SPECIFICATION
 * 
 * Authoritative Reference: National Centre for Polar and Ocean Research (NCPOR), MoES, Govt. of India
 * Station Documentation & Significant Achievement Archival Data
 */

export interface BharatiStationMetadata {
  stationCode: 'BHARATI';
  fullName: string;
  managingAgency: string;
  parentMinistry: string;
  commissionedDate: string;
  operatingStatus: 'YEAR_ROUND_ACTIVE';
  personnelCapacity: {
    overwinterNominal: number;
    summerExpeditionMax: number;
    currentOccupants: number;
  };
  mainBuildingSpecification: {
    lengthM: number;
    widthM: number;
    heightM: number;
    grossFloorAreaM2: number;
    tierCount: number;
    pilotisCount: number;
    elevationAboveBedrockM: number;
    structuralConcept: string;
    modularUnitsCount: number;
    spaceDistributionPercentages: {
      utilities: number;
      circulation: number;
      living: number;
      laboratories: number;
      storage: number;
    };
    functionalDescriptions: {
      utilities: string;
      circulation: string;
      living: string;
      laboratories: string;
      storage: string;
    };
  };
  primaryInfrastructureComponents: string[];
  scientificProgrammes: string[];
}

export const BHARATI_METADATA: BharatiStationMetadata = {
  stationCode: 'BHARATI',
  fullName: 'Bharati Antarctic Research Station',
  managingAgency: 'National Centre for Polar and Ocean Research (NCPOR)',
  parentMinistry: 'Ministry of Earth Sciences (MoES), Government of India',
  commissionedDate: '2012-03-18',
  operatingStatus: 'YEAR_ROUND_ACTIVE',
  personnelCapacity: {
    overwinterNominal: 25,
    summerExpeditionMax: 47,
    currentOccupants: 18,
  },
  mainBuildingSpecification: {
    lengthM: 50.0,
    widthM: 30.0,
    heightM: 10.5,
    grossFloorAreaM2: 2162.0,
    tierCount: 3,
    pilotisCount: 24,
    elevationAboveBedrockM: 3.6,
    structuralConcept: 'Aerodynamic Bionic Double-Skin Envelope on Heavy Tubular Steel Pilotis',
    modularUnitsCount: 134,
    spaceDistributionPercentages: {
      utilities: 43.0,
      circulation: 23.0,
      living: 15.0,
      laboratories: 12.0,
      storage: 7.0,
    },
    functionalDescriptions: {
      utilities: '43% Utilities: Dual-loop combined heat & power recovery, 3 × 250 kVA diesel gensets, sea-water RO desalination plant, fire suppression, 415V switchgear, and Lithium BESS',
      circulation: '23% Circulation: Pressurized thermal interlock corridors, double-airlock transition halls, central vertical atrium, and emergency exit stairs',
      living: '15% Living: 25 private climate-controlled officer cabins, medical surgery suite, hospital ward, commercial galley, dining hall, lounge, and sauna',
      laboratories: '12% Laboratories: Upper-tier cleanrooms, atmospheric chemistry, optical auroral observatory, seismology room, meteorology office, and satellite communications terminal',
      storage: '7% Storage: Temperature-controlled provisions storage, frozen food lockers, mechanical hardware depot, and hazardous chemical containment',
    },
  },
  primaryInfrastructureComponents: [
    'Main Building (30m × 50m, 3-Tier Aerodynamic Enclosure, 2,162 m²)',
    'Fuel Farm (Double-Walled Steel Tanks, Impervious Bunding & Containment Berm)',
    'Fuel Station (Weather-Protected Polar Vehicle Dispenser Station)',
    'Sea-Water Pump House (Coastal Intake Station at Thala Fjord / Quilty Bay with Heat-Traced Lines)',
    'Summer Camp (Modular Interconnected Living Blocks for Seasonal Scientists)',
    'Containerized Modules (Atmospheric Physics Pod, Seismological Bunker, Radio Science)',
    'Roads & Access Paths (Compacted Regolith Heavy Transport Corridors)',
    'Elevated Pipe Trestles (Glycol Heat Recovery, Power Bus & Potable Water Distribution)',
  ],
  scientificProgrammes: [
    'Upper Atmospheric Physics & Magnetospheric Dynamics',
    'Polar Meteorology & Katabatic Wind Profiling (NCPOR AWS)',
    'Geological & Glaciological Evolution of Larsemann Hills',
    'Coastal Oceanography & Sea-Ice Dynamics (Thala Fjord / Prydz Bay)',
    'Satellite Telemetry & Remote Sensing (GSAT-11 / IRS Downlink)',
  ],
};
