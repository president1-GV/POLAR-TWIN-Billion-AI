/**
 * MAITRI ANTARCTIC RESEARCH STATION — NCPOR OFFICIAL METADATA SPECIFICATION
 * 
 * Authoritative Reference: National Centre for Polar and Ocean Research (NCPOR), MoES, Govt. of India
 * Historical & Engineering Documentation
 */

export interface MaitriStationMetadata {
  stationCode: 'MAITRI';
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
    structuralArchitecture: 'ELEVATED_STEEL_STILTS';
    stiltElevationMeters: number;
    lengthM: number;
    widthM: number;
    heightM: number;
    grossFloorAreaM2: number;
    structuralDescription: string;
    spaceDistributionPercentages: {
      utilities: number;
      circulation: number;
      living: number;
      laboratories: number;
      storage: number;
    };
    wings: {
      wingA: string;
      wingB: string;
      wingC: string;
      centralSpine: string;
    };
  };
  primaryInfrastructureComponents: string[];
  waterSource: {
    name: string;
    type: string;
    intakeSystem: string;
  };
  scientificProgrammes: string[];
}

export const MAITRI_METADATA: MaitriStationMetadata = {
  stationCode: 'MAITRI',
  fullName: 'Maitri Antarctic Research Station',
  managingAgency: 'National Centre for Polar and Ocean Research (NCPOR)',
  parentMinistry: 'Ministry of Earth Sciences (MoES), Government of India',
  commissionedDate: '1989-01-01',
  operatingStatus: 'YEAR_ROUND_ACTIVE',
  personnelCapacity: {
    overwinterNominal: 25,
    summerExpeditionMax: 65,
    currentOccupants: 22,
  },
  mainBuildingSpecification: {
    structuralArchitecture: 'ELEVATED_STEEL_STILTS',
    stiltElevationMeters: 2.2,
    lengthM: 42.0,
    widthM: 22.0,
    heightM: 5.4,
    grossFloorAreaM2: 920.0,
    structuralDescription: 'Elevated multi-pod structural steel complex supported on tubular steel stilts with reinforced concrete footing pads anchored directly into Schirmacher Oasis moraine bedrock. Designed with 2.2m wind-scour underfloor clearance to prevent drift accumulation.',
    spaceDistributionPercentages: {
      utilities: 35.0,
      circulation: 20.0,
      living: 25.0,
      laboratories: 15.0,
      storage: 5.0,
    },
    wings: {
      wingA: 'Wing A: Living accommodation, dining mess hall, and kitchen/galley',
      wingB: 'Wing B: Operations control, atmospheric science, and meteorology laboratories',
      wingC: 'Wing C: Medical surgery, communications room, and officer cabins',
      centralSpine: 'Central Service Spine: Enclosed thermal corridor, hydronic heating risers, and electrical trunking',
    },
  },
  primaryInfrastructureComponents: [
    'Elevated Main Building on Steel Stilts (Living, Labs, Utilities, Circulation)',
    'Fuel Farm (Bulk Horizontal Tanks with Impervious Berm Containment)',
    'Fuel Station (Polar Vehicle Dispenser for PistenBully and Snowmobiles)',
    'Lake-Water Pump House (Lake Priyadarshini Intake with Insulated Heat-Traced Pipeline)',
    'Summer Camp (Modular Accommodation Chalets for Expedition Support)',
    'Containerized Modules (Geomagnetic Observatory Hut, Atmospheric Radar Container)',
    'Access Routes (Marked Moraine Heavy Transport Trails with Beacon Cairn Markers)',
    'Power House & Micro-Wind Array (3 × 125 kVA Kirloskar Gensets + Wind Rotors)',
  ],
  waterSource: {
    name: 'Lake Priyadarshini',
    type: 'Freshwater Periglacial Bedrock Basin',
    intakeSystem: 'Elevated, Insulated and Heat-Traced Submerged Pump Station traversing 250m to Main Station Reservoir',
  },
  scientificProgrammes: [
    'Geomagnetism & Paleomagnetic Survey (Non-Magnetic Observation Hut)',
    'Meteorological Profiling & Blizzard Forecasting (NCPOR AWS)',
    'Limnology & Microbial Ecology of Lake Priyadarshini',
    'Solid Earth Geophysics & Seismology',
    'Human Physiology in Polar Isolation',
  ],
};
