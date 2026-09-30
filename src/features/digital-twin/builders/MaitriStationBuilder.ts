import * as THREE from 'three';
import { StationAsset } from '../../../types';
import { PolarMaterialLibrary } from '../materials/polarMaterials';

export class MaitriStationBuilder {
  public group: THREE.Group;
  public interactiveMap: Map<string, THREE.Object3D> = new Map();
  private windRotors: THREE.Group[] = [];

  constructor(
    private materials: PolarMaterialLibrary,
    private assets: StationAsset[]
  ) {
    this.group = new THREE.Group();
    this.group.name = 'MAITRI_STATION_ROOT';
    this.buildMainModularLivingBlocks();
    this.buildPowerHouseAndWindArray();
    this.buildBoilerThermalAnnex();
    this.buildLakeWaterIntakeSystem();
    this.buildFuelFarm();
    this.buildFuelStation();
    this.buildSummerCamp();
    this.buildContainerizedModules();
    this.buildAccessRoutes();
    this.buildCommunicationsArray();
    this.buildGeomagneticLaboratory();
    this.buildVehicleGarageAndLogistics();
    this.buildTrestleNetwork();
    this.buildMissionControlMonolith();
  }

  private getAsset(id: string): StationAsset | undefined {
    return this.assets.find(a => a.id === id);
  }

  private registerInteractive(assetId: string, obj: THREE.Object3D): void {
    obj.userData = { assetId, stationId: 'station_maitri' };
    this.interactiveMap.set(assetId, obj);
    obj.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.userData = { assetId, stationId: 'station_maitri' };
      }
    });
  }

  private getStatusMaterial(assetId: string): THREE.MeshStandardMaterial {
    const asset = this.getAsset(assetId);
    if (!asset) return this.materials.statusNormal;
    switch (asset.status) {
      case 'NORMAL': return this.materials.statusNormal;
      case 'WATCH':
      case 'WARNING': return this.materials.statusWarning;
      case 'CRITICAL':
      case 'FAILED': return this.materials.statusCritical;
      case 'OFFLINE': return this.materials.statusOffline;
      default: return this.materials.statusNormal;
    }
  }

  /**
   * 1. Maitri Main Modular Accommodation & Laboratory Blocks
   * Structurally elevated 2.2m on tubular steel stilts with bedrock pier footings
   * High-clearance wind-scour underfloor zone prevents snow accumulation
   */
  private buildMainModularLivingBlocks(): void {
    const mainGroup = new THREE.Group();
    mainGroup.name = 'MAITRI_MAIN_BLOCKS';

    // Pod Layout (A, B, C wings interconnected by central corridor)
    const pods = [
      { x: -6, z: 0, w: 10, d: 8, label: 'Wing A (Living & Galley)' },
      { x: 6, z: 0, w: 10, d: 8, label: 'Wing B (Labs & Ops)' },
      { x: 0, z: -6, w: 8, d: 6, label: 'Wing C (Medical & Comms)' },
      { x: 0, z: 0, w: 4, d: 10, label: 'Central Corridor' },
    ];

    // Structural Steel Stilts & Moraine Bedrock Anchor Footings (Schirmacher Oasis)
    const stiltHeight = 2.2;
    pods.forEach(p => {
      const xOffsets = [-p.w / 2 + 1.0, 0, p.w / 2 - 1.0];
      const zOffsets = [-p.d / 2 + 1.0, p.d / 2 - 1.0];
      xOffsets.forEach((ox, oIdx) => {
        zOffsets.forEach(oz => {
          // Moraine concrete anchor footing
          const footing = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.65, 0.4, 14),
            this.materials.structuralSteel
          );
          footing.position.set(p.x + ox, 0.2, p.z + oz);
          footing.receiveShadow = true;
          mainGroup.add(footing);

          // Elevated tubular steel stilt column (visibly elevating the station)
          const stilt = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, stiltHeight, 14),
            this.materials.steelStilts
          );
          stilt.position.set(p.x + ox, stiltHeight / 2 + 0.2, p.z + oz);
          stilt.castShadow = true;
          stilt.receiveShadow = true;
          mainGroup.add(stilt);

          // Diagonal cross wind bracing between stilts
          if (oIdx < xOffsets.length - 1) {
            const nextOx = xOffsets[oIdx + 1];
            const brace = new THREE.Mesh(
              new THREE.CylinderGeometry(0.08, 0.08, Math.hypot(nextOx - ox, stiltHeight), 8),
              this.materials.steelStilts
            );
            brace.position.set(p.x + (ox + nextOx) / 2, stiltHeight / 2 + 0.2, p.z + oz);
            brace.rotation.z = Math.atan2(stiltHeight, nextOx - ox);
            mainGroup.add(brace);
          }
        });
      });

      // Underfloor structural steel grid
      const underGrid = new THREE.Mesh(
        new THREE.BoxGeometry(p.w, 0.35, p.d),
        this.materials.structuralSteel
      );
      underGrid.position.set(p.x, stiltHeight + 0.175, p.z);
      underGrid.castShadow = true;
      mainGroup.add(underGrid);
    });

    pods.forEach(p => {
      // Wall Module
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(p.w, 3.2, p.d),
        this.materials.maitriOrangeHull
      );
      wall.position.set(p.x, stiltHeight + 1.8, p.z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      mainGroup.add(wall);

      // Gabled Roof
      const roofGeo = new THREE.ConeGeometry(Math.max(p.w, p.d) * 0.72, 1.4, 4);
      const roof = new THREE.Mesh(roofGeo, this.materials.maitriRoof);
      roof.position.set(p.x, stiltHeight + 4.1, p.z);
      roof.rotation.y = Math.PI / 4;
      roof.scale.set(p.w / Math.max(p.w, p.d), 1, p.d / Math.max(p.w, p.d));
      roof.castShadow = true;
      mainGroup.add(roof);

      // Windows
      for (let w = -p.w / 2 + 1.2; w <= p.w / 2 - 1.2; w += 2.2) {
        const win = new THREE.Mesh(
          new THREE.PlaneGeometry(1.2, 0.9),
          this.materials.insulatedGlass
        );
        win.position.set(p.x + w, stiltHeight + 2.1, p.z + p.d / 2 + 0.02);
        mainGroup.add(win);
      }
    });

    this.registerInteractive('ma_hab_core', mainGroup);

    // Register Living & Science Blocks for Raycast Interaction
    this.registerInteractive('ma_hab_core', mainGroup);

    // ==========================================
    // OFFICIAL POLAR-TWIN MISSION CREST ON ENTRANCE
    // ==========================================
    const crestGroup = new THREE.Group();
    crestGroup.name = 'MAITRI_POLAR_TWIN_CREST';

    const bezel = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.3, 0.1, 32),
      this.materials.structuralSteel
    );
    bezel.rotation.x = Math.PI / 2;
    bezel.position.set(0, 3.6, 5.06);
    crestGroup.add(bezel);

    const logoDisc = new THREE.Mesh(
      new THREE.CircleGeometry(1.2, 64),
      this.materials.missionLogoBadge
    );
    logoDisc.position.set(0, 3.6, 5.12);
    crestGroup.add(logoDisc);

    const crestSpot = new THREE.PointLight(0x00E5FF, 0.8, 8);
    crestSpot.position.set(0, 3.8, 6.2);
    crestGroup.add(crestSpot);

    this.registerInteractive('maitri_mission_crest', crestGroup);
    mainGroup.add(crestGroup);

    // Central Switchgear & Bus inside Central Block (MA-PDB-01)
    const pdbGroup = new THREE.Group();
    pdbGroup.name = 'MA_PDB_01';
    const pdbBox = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 2.0, 1.6),
      this.materials.switchgearCabinet
    );
    pdbBox.position.set(-2, 1.8, 0);
    pdbGroup.add(pdbBox);

    const pdbBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      this.getStatusMaterial('ma_pdb_01')
    );
    pdbBeacon.position.set(-2, 3.2, 0);
    pdbGroup.add(pdbBeacon);

    this.registerInteractive('ma_pdb_01', pdbGroup);
    mainGroup.add(pdbGroup);

    this.group.add(mainGroup);
  }

  /**
   * 2. Power House (4x 125 kVA Gensets) & Micro-Wind Turbine Array
   */
  private buildPowerHouseAndWindArray(): void {
    const powerGroup = new THREE.Group();
    powerGroup.name = 'MAITRI_POWER_HOUSE';
    powerGroup.position.set(-16, 0, -8);

    // Concrete Pad
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.4, 8),
      this.materials.structuralSteel
    );
    pad.position.set(0, 0.2, 0);
    pad.receiveShadow = true;
    powerGroup.add(pad);

    // 3 Active/Standby Genset Bays (Kirloskar 125 kVA)
    const gens = [
      { id: 'ma_gen_01', x: -5, label: 'GEN-01' },
      { id: 'ma_gen_02', x: 0, label: 'GEN-02' },
      { id: 'ma_gen_03', x: 5, label: 'GEN-03' },
    ];

    gens.forEach(g => {
      const bay = new THREE.Group();
      bay.name = g.id;

      // Housing
      const house = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 2.5, 4.8),
        this.materials.maitriOrangeHull
      );
      house.position.set(g.x, 1.65, 0);
      house.castShadow = true;
      bay.add(house);

      // Exhaust Pipe with silencer
      const exhaust = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 2.4, 12),
        this.materials.exhaustStack
      );
      exhaust.position.set(g.x, 3.8, -1.2);
      exhaust.castShadow = true;
      bay.add(exhaust);

      // Day tank
      const dt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 1.6, 16),
        this.materials.fuelTankMaitri
      );
      dt.rotation.x = Math.PI / 2;
      dt.position.set(g.x, 3.2, 0.8);
      bay.add(dt);

      // Status Beacon
      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 12, 12),
        this.getStatusMaterial(g.id)
      );
      beacon.position.set(g.x, 4.2, 0.8);
      bay.add(beacon);

      this.registerInteractive(g.id, bay);
      powerGroup.add(bay);
    });
    this.group.add(powerGroup);

    // Micro-Wind Turbine Array on North Ridge (MA-WIND-01)
    const windGroup = new THREE.Group();
    windGroup.name = 'MA_WIND_01';
    windGroup.position.set(16, 0, -16);

    for (let w = -4; w <= 4; w += 4) {
      const turbine = new THREE.Group();
      turbine.position.set(w, 0, 0);

      // Lattice Tower Mast
      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.35, 10, 8),
        this.materials.antennaSteel
      );
      mast.position.y = 5.0;
      mast.castShadow = true;
      turbine.add(mast);

      // Nacelle
      const nacelle = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.6, 1.2),
        this.materials.machineryCast
      );
      nacelle.position.y = 10.0;
      turbine.add(nacelle);

      // Rotating Hub & 3 Aerodynamic Rotor Blades
      const rotorHub = new THREE.Group();
      rotorHub.position.set(0, 10.0, 0.65);

      const spinner = new THREE.Mesh(
        new THREE.ConeGeometry(0.25, 0.5, 12),
        this.materials.windTurbineBlade
      );
      spinner.rotation.x = Math.PI / 2;
      rotorHub.add(spinner);

      for (let b = 0; b < 3; b++) {
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 3.2, 0.05),
          this.materials.windTurbineBlade
        );
        blade.position.y = 1.6;
        blade.rotation.z = (b * Math.PI * 2) / 3;
        rotorHub.add(blade);
      }
      this.windRotors.push(rotorHub);
      turbine.add(rotorHub);

      windGroup.add(turbine);
    }

    const windBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 12, 12),
      this.getStatusMaterial('ma_wind_01')
    );
    windBeacon.position.set(0, 11.2, 0);
    windGroup.add(windBeacon);

    this.registerInteractive('ma_wind_01', windGroup);
    this.group.add(windGroup);
  }

  /**
   * 3. Central Hydronic Space Heating Boiler Plant (MA-BLR-01)
   */
  private buildBoilerThermalAnnex(): void {
    const boilerGroup = new THREE.Group();
    boilerGroup.name = 'MA_BOILER_01';
    boilerGroup.position.set(-8, 0, 8);

    const house = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 3.0, 4.6),
      this.materials.maitriOrangeHull
    );
    house.position.set(0, 1.65, 0);
    house.castShadow = true;
    boilerGroup.add(house);

    // Twin Hydronic Heating Boilers with Flues
    for (let i = -1.2; i <= 1.2; i += 2.4) {
      const boiler = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.65, 2.0, 16),
        this.materials.boilerVessel
      );
      boiler.position.set(i, 1.6, 2.5);
      boilerGroup.add(boiler);

      const flue = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 2.6, 12),
        this.materials.exhaustStack
      );
      flue.position.set(i, 4.0, -1.0);
      boilerGroup.add(flue);
    }

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      this.getStatusMaterial('ma_boiler_01')
    );
    beacon.position.set(0, 3.8, 0);
    boilerGroup.add(beacon);

    this.registerInteractive('ma_boiler_01', boilerGroup);
    this.group.add(boilerGroup);
  }

  /**
   * 4. Lake Priyadarshini Water Intake Pump Station & Storage Reservoir
   */
  private buildLakeWaterIntakeSystem(): void {
    const waterGroup = new THREE.Group();
    waterGroup.name = 'MA_WATER_SYSTEM';

    // Primary Shoreline Pump House (MA-PUMP-01)
    const pumpGroup = new THREE.Group();
    pumpGroup.name = 'MA_PUMP_01';
    pumpGroup.position.set(18, 0, 8);

    const pumpHouse = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 2.4, 3.4),
      this.materials.maitriOrangeHull
    );
    pumpHouse.position.set(0, 1.35, 0);
    pumpHouse.castShadow = true;
    pumpGroup.add(pumpHouse);

    // Intake Pipe heading into the Lake
    const intakePipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 6.0, 12),
      this.materials.stainlessPipe
    );
    intakePipe.rotation.x = Math.PI / 3;
    intakePipe.position.set(0, 0.4, 3.5);
    pumpGroup.add(intakePipe);

    const pumpBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      this.getStatusMaterial('ma_water_pump_01')
    );
    pumpBeacon.position.set(0, 2.8, 0);
    pumpGroup.add(pumpBeacon);

    this.registerInteractive('ma_water_pump_01', pumpGroup);
    waterGroup.add(pumpGroup);

    // Lake Priyadarshini Deep Water Intake Pump House (MA-LAKE-PUMP)
    const lakePumpGroup = new THREE.Group();
    lakePumpGroup.name = 'MA_LAKE_PUMP';
    lakePumpGroup.position.set(22.0, 0.4, -12.0);

    // Moraine stilt piers supporting pump house over shoreline
    for (let ox of [-2.8, 2.8]) {
      for (let oz of [-1.8, 1.8]) {
        const pier = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.22, 1.2, 12),
          this.materials.steelStilts
        );
        pier.position.set(ox, 0.6, oz);
        pier.castShadow = true;
        lakePumpGroup.add(pier);
      }
    }

    // Insulated Timber & GRP Pump House (7.2m × 5.2m × 3.2m)
    const lakeShed = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 3.2, 5.2),
      this.materials.maitriOrangeHull
    );
    lakeShed.position.set(0, 2.2, 0);
    lakeShed.castShadow = true;
    lakeShed.receiveShadow = true;
    lakePumpGroup.add(lakeShed);

    // Pitched Gable Roof
    const lakeRoof = new THREE.Mesh(
      new THREE.ConeGeometry(5.2, 1.4, 4),
      this.materials.maitriRoof
    );
    lakeRoof.position.set(0, 4.4, 0);
    lakeRoof.rotation.y = Math.PI / 4;
    lakeRoof.scale.set(7.2 / 5.2, 1, 1);
    lakePumpGroup.add(lakeRoof);

    // Deep Submerged Intake Manifold entering Lake Priyadarshini
    const lakeManifold = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 14.0, 12),
      this.materials.stainlessPipe
    );
    lakeManifold.rotation.z = Math.PI / 2.5;
    lakeManifold.position.set(6.0, 0.2, 0);
    lakePumpGroup.add(lakeManifold);

    const lakeBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 12, 12),
      this.getStatusMaterial('ma_lake_pump')
    );
    lakeBeacon.position.set(0, 5.2, 0);
    lakePumpGroup.add(lakeBeacon);

    this.registerInteractive('ma_lake_pump', lakePumpGroup);
    waterGroup.add(lakePumpGroup);

    // Potable Water Storage Reservoir (MA-RES-01)
    const resGroup = new THREE.Group();
    resGroup.name = 'MA_RES_01';
    resGroup.position.set(8, 0, 6);

    const tank1 = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 3.2, 24),
      this.materials.stainlessPipe
    );
    tank1.position.set(-1.4, 1.75, 0);
    tank1.castShadow = true;
    resGroup.add(tank1);

    const tank2 = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 3.2, 24),
      this.materials.stainlessPipe
    );
    tank2.position.set(1.4, 1.75, 0);
    tank2.castShadow = true;
    resGroup.add(tank2);

    const resBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      this.getStatusMaterial('ma_water_tank_01')
    );
    resBeacon.position.set(0, 3.8, 0);
    resGroup.add(resBeacon);

    this.registerInteractive('ma_water_tank_01', resGroup);
    waterGroup.add(resGroup);

    this.group.add(waterGroup);
  }

  /**
   * 5. Fuel Storage Farm & Environmental Catchment Berm (MA-FUEL-FARM, MA-TK-01)
   */
  private buildFuelFarm(): void {
    const fuelGroup = new THREE.Group();
    fuelGroup.name = 'MA_FUEL_FARM';
    fuelGroup.position.set(-18, 0, -10);

    // Reinforced Moraine Earthen Catchment Berm (18m × 14m × 1.0m)
    const bundWall = new THREE.Mesh(
      new THREE.BoxGeometry(18.0, 1.0, 14.0),
      this.materials.moraineRock
    );
    bundWall.position.set(0, 0.5, 0);
    bundWall.receiveShadow = true;
    fuelGroup.add(bundWall);

    const bundFloor = new THREE.Mesh(
      new THREE.BoxGeometry(16.5, 0.8, 12.5),
      this.materials.structuralSteel
    );
    bundFloor.position.set(0, 0.55, 0);
    bundFloor.receiveShadow = true;
    fuelGroup.add(bundFloor);

    // Primary Bulk Polar Diesel Tank (Alpha)
    const tankObj = new THREE.Group();
    tankObj.name = 'ma_fuel_tank_01';

    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(2.0, 2.0, 7.5, 24),
      this.materials.fuelTankMaitri
    );
    cyl.rotation.z = Math.PI / 2;
    cyl.position.set(0, 2.3, -2.5);
    cyl.castShadow = true;
    tankObj.add(cyl);

    // Secondary Reserve Tank (Bravo)
    const cyl2 = new THREE.Mesh(
      new THREE.CylinderGeometry(2.0, 2.0, 7.5, 24),
      this.materials.fuelTankMaitri
    );
    cyl2.rotation.z = Math.PI / 2;
    cyl2.position.set(0, 2.3, 2.5);
    cyl2.castShadow = true;
    tankObj.add(cyl2);

    for (let s = -2.5; s <= 2.5; s += 5.0) {
      for (let tz of [-2.5, 2.5]) {
        const saddle = new THREE.Mesh(
          new THREE.BoxGeometry(1.0, 1.2, 2.8),
          this.materials.structuralSteel
        );
        saddle.position.set(s, 0.8, tz);
        tankObj.add(saddle);
      }
    }

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 12, 12),
      this.getStatusMaterial('ma_fuel_tank_01')
    );
    beacon.position.set(0, 4.6, 0);
    tankObj.add(beacon);

    this.registerInteractive('ma_fuel_tank_01', tankObj);
    fuelGroup.add(tankObj);

    this.registerInteractive('ma_fuel_farm', fuelGroup);
    this.group.add(fuelGroup);
  }

  /**
   * 5b. Maitri Polar Vehicle Dispenser Station (MA-FUEL-STAT)
   */
  private buildFuelStation(): void {
    const statGroup = new THREE.Group();
    statGroup.name = 'MA_FUEL_STATION';
    statGroup.position.set(-12.0, 0.8, -6.0);

    // Concrete Base Skid
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(7.0, 0.4, 5.0),
      this.materials.structuralSteel
    );
    pad.position.y = 0.2;
    pad.receiveShadow = true;
    statGroup.add(pad);

    // Weather Canopy Roof
    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(7.4, 0.3, 5.4),
      this.materials.maitriRoof
    );
    canopy.position.y = 3.2;
    canopy.castShadow = true;
    statGroup.add(canopy);

    // Steel Support Pillars
    const colCoords = [
      [-3.2, -2.2], [-3.2, 2.2], [3.2, -2.2], [3.2, 2.2]
    ];
    colCoords.forEach(([cx, cz]) => {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 3.0, 12),
        this.materials.steelStilts
      );
      col.position.set(cx, 1.7, cz);
      col.castShadow = true;
      statGroup.add(col);
    });

    // PistenBully Polar Diesel Dispenser
    const dispenser = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.8, 0.9),
      this.materials.maitriOrangeHull
    );
    dispenser.position.set(0, 1.1, 0);
    dispenser.castShadow = true;
    statGroup.add(dispenser);

    // Hose boom & grounding line
    const boom = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2.0, 8),
      this.materials.structuralSteel
    );
    boom.rotation.z = Math.PI / 4;
    boom.position.set(0.5, 2.3, 0);
    statGroup.add(boom);

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      this.getStatusMaterial('ma_fuel_station')
    );
    beacon.position.set(0, 3.5, 0);
    statGroup.add(beacon);

    this.registerInteractive('ma_fuel_station', statGroup);
    this.group.add(statGroup);
  }

  /**
   * 5c. Maitri Summer Camp Modular Living Chalets (MA-SUMMER-CAMP)
   */
  private buildSummerCamp(): void {
    const campGroup = new THREE.Group();
    campGroup.name = 'MA_SUMMER_CAMP';
    campGroup.position.set(18.0, 1.2, 12.0);

    // 3 Interconnected Modular Living Chalets
    const chalets = [
      { x: -6.0, z: 0, w: 5.5, d: 8.0, label: 'Chalet 1' },
      { x: 0.0, z: 0, w: 5.5, d: 8.0, label: 'Chalet 2' },
      { x: 6.0, z: 0, w: 5.5, d: 8.0, label: 'Chalet 3' },
    ];

    chalets.forEach(ch => {
      // Elevated pier footings
      for (let px of [-ch.w / 2 + 0.6, ch.w / 2 - 0.6]) {
        for (let pz of [-ch.d / 2 + 0.6, ch.d / 2 - 0.6]) {
          const footing = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.18, 0.8, 8),
            this.materials.steelStilts
          );
          footing.position.set(ch.x + px, 0.4, ch.z + pz);
          footing.castShadow = true;
          campGroup.add(footing);
        }
      }

      // Chalet Living Unit
      const unit = new THREE.Mesh(
        new THREE.BoxGeometry(ch.w, 2.6, ch.d),
        this.materials.maitriOrangeHull
      );
      unit.position.set(ch.x, 2.1, ch.z);
      unit.castShadow = true;
      unit.receiveShadow = true;
      campGroup.add(unit);

      // Pitched roof
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(ch.w * 0.72, 1.2, 4),
        this.materials.maitriRoof
      );
      roof.position.set(ch.x, 3.9, ch.z);
      roof.rotation.y = Math.PI / 4;
      roof.scale.set(1, 1, ch.d / ch.w);
      roof.castShadow = true;
      campGroup.add(roof);

      // Insulated windows
      for (let wz of [-2.0, 0, 2.0]) {
        const win = new THREE.Mesh(
          new THREE.PlaneGeometry(0.8, 0.7),
          this.materials.insulatedGlass
        );
        win.position.set(ch.x + ch.w / 2 + 0.02, 2.2, ch.z + wz);
        win.rotation.y = Math.PI / 2;
        campGroup.add(win);
      }
    });

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 12, 12),
      this.getStatusMaterial('ma_summer_camp')
    );
    beacon.position.set(0, 4.8, 0);
    campGroup.add(beacon);

    this.registerInteractive('ma_summer_camp', campGroup);
    this.group.add(campGroup);
  }

  /**
   * 5d. Maitri Containerized Field Science & Storage Pods (MA-CONTAINERS)
   */
  private buildContainerizedModules(): void {
    const contGroup = new THREE.Group();
    contGroup.name = 'MA_CONTAINERS';
    contGroup.position.set(-16.0, 0.8, -14.0);

    // 3x 20ft ISO Polar Storage & Science Containers on Steel Skids
    const containers = [
      { x: -5.0, z: 0, mat: this.materials.containerWhite, label: 'Geo-Lab Spares' },
      { x: 0.0, z: 0, mat: this.materials.containerBlue, label: 'Scientific Equipment' },
      { x: 5.0, z: 0, mat: this.materials.containerRed, label: 'Emergency Rations' },
    ];

    containers.forEach(c => {
      // Bedrock steel skid
      const skid = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.3, 6.2),
        this.materials.structuralSteel
      );
      skid.position.set(c.x, 0.15, 0);
      skid.receiveShadow = true;
      contGroup.add(skid);

      // Container Body (2.4m × 2.6m × 6.0m)
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 2.6, 6.0),
        c.mat
      );
      box.position.set(c.x, 1.6, 0);
      box.castShadow = true;
      box.receiveShadow = true;
      contGroup.add(box);

      // Corrugated texture ribs / corner castings
      for (let rz of [-2.8, -1.4, 0, 1.4, 2.8]) {
        const rib = new THREE.Mesh(
          new THREE.BoxGeometry(2.44, 2.64, 0.08),
          this.materials.structuralSteel
        );
        rib.position.set(c.x, 1.6, rz);
        contGroup.add(rib);
      }
    });

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 12),
      this.getStatusMaterial('ma_containers')
    );
    beacon.position.set(0, 3.4, 0);
    contGroup.add(beacon);

    this.registerInteractive('ma_containers', contGroup);
    this.group.add(contGroup);
  }

  /**
   * 5e. Maitri Schirmacher Oasis Moraine Vehicle Routes & Markers (MA-ROUTES)
   */
  private buildAccessRoutes(): void {
    const routeGroup = new THREE.Group();
    routeGroup.name = 'MA_ACCESS_ROUTES';
    routeGroup.position.set(0, 0.05, 0);

    // Compacted moraine tracks connecting core infrastructure
    const trackSegments = [
      // Core -> Priyadarshini Water Pump House
      { from: new THREE.Vector3(0, 0.05, 0), to: new THREE.Vector3(22.0, 0.05, -12.0) },
      // Core -> Fuel Farm
      { from: new THREE.Vector3(0, 0.05, 0), to: new THREE.Vector3(-18.0, 0.05, -10.0) },
      // Core -> Vehicle Garage
      { from: new THREE.Vector3(0, 0.05, 0), to: new THREE.Vector3(10.0, 0.05, 16.0) },
      // Core -> Summer Camp
      { from: new THREE.Vector3(0, 0.05, 0), to: new THREE.Vector3(18.0, 0.05, 12.0) },
      // Core -> Geomagnetic Lab
      { from: new THREE.Vector3(0, 0.05, 0), to: new THREE.Vector3(-14.0, 0.05, -16.0) },
    ];

    trackSegments.forEach(seg => {
      const mid = new THREE.Vector3().addVectors(seg.from, seg.to).multiplyScalar(0.5);
      const dist = seg.from.distanceTo(seg.to);
      const angleY = Math.atan2(seg.to.x - seg.from.x, seg.to.z - seg.from.z);

      const track = new THREE.Mesh(
        new THREE.PlaneGeometry(3.6, dist),
        this.materials.moraineRock
      );
      track.rotation.x = -Math.PI / 2;
      track.rotation.z = -angleY;
      track.position.set(mid.x, 0.06, mid.z);
      track.receiveShadow = true;
      routeGroup.add(track);

      // Route Marker Poles along edges (Orange polar markers with reflective bands)
      for (let t of [0.25, 0.5, 0.75]) {
        const markerPos = new THREE.Vector3().lerpVectors(seg.from, seg.to, t);
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 2.4, 8),
          this.materials.maitriOrangeHull
        );
        pole.position.set(markerPos.x + 2.2 * Math.cos(angleY), 1.2, markerPos.z - 2.2 * Math.sin(angleY));
        pole.castShadow = true;
        routeGroup.add(pole);

        // Reflective top beacon flag
        const flag = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.2, 0.04),
          this.materials.statusWarning
        );
        flag.position.set(pole.position.x, 2.3, pole.position.z);
        routeGroup.add(flag);
      }
    });

    this.registerInteractive('ma_access_routes', routeGroup);
    this.group.add(routeGroup);
  }

  /**
   * 6. Inmarsat & HF Communications Array (MA-SAT-01)
   */
  private buildCommunicationsArray(): void {
    const commsGroup = new THREE.Group();
    commsGroup.name = 'MA_COMMS_01';
    commsGroup.position.set(12, 0, -6);

    // Mast
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.8, 8, 12),
      this.materials.antennaSteel
    );
    mast.position.y = 4.2;
    mast.castShadow = true;
    commsGroup.add(mast);

    // Radome
    const radome = new THREE.Mesh(
      new THREE.SphereGeometry(1.8, 24, 18),
      this.materials.radomeDome
    );
    radome.position.y = 8.8;
    radome.castShadow = true;
    commsGroup.add(radome);

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 12),
      this.getStatusMaterial('ma_comms_01')
    );
    beacon.position.set(0, 11.0, 0);
    commsGroup.add(beacon);

    this.registerInteractive('ma_comms_01', commsGroup);
    this.group.add(commsGroup);
  }

  /**
   * 7. Geomagnetic & Seismological Lab (MA-LAB-GEO)
   */
  private buildGeomagneticLaboratory(): void {
    const geoGroup = new THREE.Group();
    geoGroup.name = 'MA_LAB_GEO';
    geoGroup.position.set(-14, 0, -16); // Isolated away from power cables

    // Non-magnetic wooden/composite hut
    const hut = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 2.6, 3.8),
      this.materials.containerWhite
    );
    hut.position.set(0, 1.45, 0);
    hut.castShadow = true;
    geoGroup.add(hut);

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      this.getStatusMaterial('ma_lab_geo')
    );
    beacon.position.set(0, 3.2, 0);
    geoGroup.add(beacon);

    this.registerInteractive('ma_lab_geo', geoGroup);
    this.group.add(geoGroup);
  }

  /**
   * 8. Vehicle Maintenance Garage & Sledges (MA-GAR-01)
   */
  private buildVehicleGarageAndLogistics(): void {
    const garGroup = new THREE.Group();
    garGroup.name = 'MA_GARAGE_01';
    garGroup.position.set(10, 0, 16);

    const garage = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 3.6, 9.0),
      this.materials.maitriOrangeHull
    );
    garage.position.set(0, 2.0, 0);
    garage.castShadow = true;
    garGroup.add(garage);

    // Large Vehicle Access Roll-up Door
    const rollDoor = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 2.8),
      this.materials.radiatorGrille
    );
    rollDoor.position.set(0, 1.6, -4.52);
    rollDoor.rotation.y = Math.PI;
    garGroup.add(rollDoor);

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      this.getStatusMaterial('ma_garage_01')
    );
    beacon.position.set(0, 4.2, 0);
    garGroup.add(beacon);

    this.registerInteractive('ma_garage_01', garGroup);
    this.group.add(garGroup);
  }

  /**
   * 9. Interconnecting Heated Pipeline Trestle from Lake Priyadarshini
   */
  private buildTrestleNetwork(): void {
    const trestle = new THREE.Group();
    trestle.name = 'MAITRI_HEATED_WATER_TRESTLE';

    // Route: Lake Pump House (18, 0, 8) -> Water Reservoir (8, 0, 6) -> Main Block (0, 0, 0)
    const points = [
      new THREE.Vector3(18, 1.0, 8),
      new THREE.Vector3(13, 1.2, 7),
      new THREE.Vector3(8, 1.4, 6),
      new THREE.Vector3(3, 1.4, 2),
      new THREE.Vector3(0, 1.6, 0),
    ];

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.14, 8, false);
    const pipe = new THREE.Mesh(tubeGeo, this.materials.stainlessPipe);
    pipe.castShadow = true;
    trestle.add(pipe);

    // Support legs
    points.forEach(pt => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, pt.y, 8),
        this.materials.structuralSteel
      );
      leg.position.set(pt.x, pt.y / 2, pt.z);
      trestle.add(leg);
    });

    this.group.add(trestle);
  }

  /**
   * 10. POLAR-TWIN Official Mission Control Monolith for Maitri
   */
  private buildMissionControlMonolith(): void {
    const monolithGroup = new THREE.Group();
    monolithGroup.name = 'MAITRI_MISSION_MONOLITH';
    monolithGroup.position.set(-12, 0, 14);

    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.5, 2.0),
      this.materials.moraineRock
    );
    plinth.position.set(0, 0.25, 0);
    plinth.receiveShadow = true;
    monolithGroup.add(plinth);

    const stele = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 4.0, 0.4),
      this.materials.structuralSteel
    );
    stele.position.set(0, 2.25, 0);
    stele.castShadow = true;
    monolithGroup.add(stele);

    const orangeBand = new THREE.Mesh(
      new THREE.BoxGeometry(2.62, 0.3, 0.42),
      this.materials.maitriOrangeHull
    );
    orangeBand.position.set(0, 4.1, 0);
    monolithGroup.add(orangeBand);

    const frontLogo = new THREE.Mesh(
      new THREE.CircleGeometry(1.05, 64),
      this.materials.missionLogoBadge
    );
    frontLogo.position.set(0, 2.4, 0.24);
    monolithGroup.add(frontLogo);

    const backLogo = new THREE.Mesh(
      new THREE.CircleGeometry(1.05, 64),
      this.materials.missionLogoBadge
    );
    backLogo.rotation.y = Math.PI;
    backLogo.position.set(0, 2.4, -0.24);
    monolithGroup.add(backLogo);

    const uplight = new THREE.PointLight(0x00E5FF, 1.2, 10);
    uplight.position.set(0, 4.5, 0);
    monolithGroup.add(uplight);

    this.registerInteractive('maitri_mission_monolith', monolithGroup);
    this.group.add(monolithGroup);
  }

  public updateAnimation(deltaSeconds: number): void {
    // Spin wind turbine rotors realistically
    const spinSpeed = 2.4 * deltaSeconds;
    this.windRotors.forEach(r => {
      r.rotation.z += spinSpeed;
    });
  }

  public updateBeacons(): void {
    this.interactiveMap.forEach((obj, assetId) => {
      const mat = this.getStatusMaterial(assetId);
      obj.traverse(child => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry) {
          child.material = mat;
        }
      });
    });
  }

  public dispose(): void {
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
    this.group.traverse(child => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose();
      }
    });
    this.group.clear();
    this.interactiveMap.clear();
    this.windRotors = [];
  }
}
