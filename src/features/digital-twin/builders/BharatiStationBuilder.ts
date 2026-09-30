import * as THREE from 'three';
import { StationAsset } from '../../../types';
import { PolarMaterialLibrary } from '../materials/polarMaterials';

export class BharatiStationBuilder {
  public group: THREE.Group;
  public interactiveMap: Map<string, THREE.Object3D> = new Map();

  constructor(
    private materials: PolarMaterialLibrary,
    private assets: StationAsset[]
  ) {
    this.group = new THREE.Group();
    this.group.name = 'BHARATI_STATION_ROOT';
    this.buildMainHabitatBlock();
    this.buildEnergyHub();
    this.buildWaterTreatmentPlant();
    this.buildBulkFuelFarm();
    this.buildFuelStation();
    this.buildSeaWaterPumpHouse();
    this.buildSummerCamp();
    this.buildContainerizedModules();
    this.buildRoadsAndAccessPaths();
    this.buildSatelliteComms();
    this.buildScienceLab();
    this.buildLogisticsAndVehicles();
    this.buildPipeTrestleNetwork();
    this.buildMissionControlMonolith();
  }

  private getAsset(id: string): StationAsset | undefined {
    return this.assets.find(a => a.id === id);
  }

  private registerInteractive(assetId: string, obj: THREE.Object3D): void {
    obj.userData = { assetId, stationId: 'station_bharati' };
    this.interactiveMap.set(assetId, obj);
    // Recursively tag children for robust raycasting
    obj.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.userData = { assetId, stationId: 'station_bharati' };
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
   * 1. Main Bharati Aerodynamic Habitat Structure
   * Documented baseline: 30 m × 50 m footprint, ~2,162 m² gross floor area
   * 3-tiered aerodynamic vacuum-insulated envelope elevated 3.6m on 24 heavy tubular steel pilotis
   * NCPOR space breakdown: 43% utilities, 23% circulation, 15% living, 12% laboratories, 7% storage
   */
  private buildMainHabitatBlock(): void {
    const habGroup = new THREE.Group();
    habGroup.name = 'MAIN_HABITAT_BUILDING';

    // 24 Heavy Tubular Steel Stilts in a 6 × 4 structural grid (Larsemann Hills permafrost bedrock)
    const stiltHeight = 3.6;
    const xColumns = [-20.0, -12.0, -4.0, 4.0, 12.0, 20.0];
    const zRows = [-11.0, -3.7, 3.7, 11.0];

    xColumns.forEach(x => {
      zRows.forEach(z => {
        // Reinforced concrete foundation pad anchored to bedrock
        const pad = new THREE.Mesh(
          new THREE.CylinderGeometry(0.95, 1.1, 0.45, 14),
          this.materials.structuralSteel
        );
        pad.position.set(x, 0.225, z);
        pad.receiveShadow = true;
        habGroup.add(pad);

        // Heavy tubular steel column (pilot)
        const stilt = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.38, stiltHeight, 16),
          this.materials.steelStilts
        );
        stilt.position.set(x, stiltHeight / 2 + 0.3, z);
        stilt.castShadow = true;
        stilt.receiveShadow = true;
        habGroup.add(stilt);

        // Diagonal anti-sway wind brace
        if (x < 20.0) {
          const brace = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 8.8, 8),
            this.materials.steelStilts
          );
          brace.position.set(x + 4.0, stiltHeight / 2 + 0.3, z);
          brace.rotation.z = Math.PI / 7.2;
          habGroup.add(brace);
        }
      });
    });

    // Heavy Underfloor Structural Steel Truss Grid (49m × 0.8m × 29m)
    const trussGrid = new THREE.Mesh(
      new THREE.BoxGeometry(49, 0.8, 29),
      this.materials.structuralSteel
    );
    trussGrid.position.set(0, stiltHeight + 0.4, 0);
    trussGrid.castShadow = true;
    habGroup.add(trussGrid);

    // Main 3-Tier Aerodynamic Enclosure (47m length × 9.6m height × 28.5m width)
    const mainHull = new THREE.Mesh(
      new THREE.BoxGeometry(47, 9.6, 28.5),
      this.materials.bharatiHull
    );
    mainHull.position.set(0, stiltHeight + 5.2, 0);
    mainHull.castShadow = true;
    mainHull.receiveShadow = true;
    habGroup.add(mainHull);

    // Aerodynamic Windward Chamfer Nose (North/East facing prevailing katabatic winds)
    const noseGeo = new THREE.CylinderGeometry(14.25, 14.25, 9.6, 24, 1, false, -Math.PI / 2, Math.PI);
    const nose = new THREE.Mesh(noseGeo, this.materials.bharatiHull);
    nose.position.set(23.5, stiltHeight + 5.2, 0);
    nose.castShadow = true;
    habGroup.add(nose);

    // Upper Observation Deck Facade Accent (Level 2 & Terrace)
    const roofDeck = new THREE.Mesh(
      new THREE.BoxGeometry(48.5, 0.5, 28.5),
      this.materials.bharatiHullAccent
    );
    roofDeck.position.set(0, stiltHeight + 10.25, 0);
    habGroup.add(roofDeck);

    // Register Main Aerodynamic Habitat Core for Direct Raycast Interaction
    this.registerInteractive('bh_hab_core', mainHull);
    this.registerInteractive('bh_hab_core', nose);
    this.registerInteractive('bh_hab_core', roofDeck);

    // Panoramic Double-Glazed Observation Windows (facing ocean ice at +Z)
    for (let x = -21; x <= 21; x += 3.5) {
      // Upper Level 2 Windows (Laboratories & Living)
      const winL2 = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 1.8),
        this.materials.insulatedGlass
      );
      winL2.position.set(x, stiltHeight + 7.2, 14.3);
      habGroup.add(winL2);

      // Lower Level 1 Windows (Circulation & Living)
      const winL1 = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 1.4),
        this.materials.insulatedGlass
      );
      winL1.position.set(x, stiltHeight + 3.4, 14.3);
      habGroup.add(winL1);
    }

    // Entrance Airlock Gantry with Access Staircase & Handrails
    const gantry = new THREE.Mesh(
      new THREE.BoxGeometry(6.0, 0.35, 4.0),
      this.materials.catwalkGrate
    );
    gantry.position.set(0, stiltHeight + 0.6, 14.0);
    habGroup.add(gantry);

    const stairRail = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, stiltHeight + 0.6, 5.5),
      this.materials.structuralSteel
    );
    stairRail.position.set(0, (stiltHeight + 0.6) / 2, 16.5);
    stairRail.rotation.x = -Math.PI / 4.8;
    habGroup.add(stairRail);

    // ==========================================
    // OFFICIAL POLAR-TWIN MISSION EMBLEM PLAQUE
    // ==========================================
    const emblemGroup = new THREE.Group();
    emblemGroup.name = 'POLAR_TWIN_FACADE_EMBLEM';

    // Structural Bezel Ring (Galvanized Aerospace Steel with Cyan Accents)
    const bezel = new THREE.Mesh(
      new THREE.CylinderGeometry(1.85, 1.85, 0.14, 32),
      this.materials.structuralSteel
    );
    bezel.rotation.x = Math.PI / 2;
    bezel.position.set(0, stiltHeight + 5.5, 12.06);
    emblemGroup.add(bezel);

    // High-Resolution POLAR-TWIN Mission Logo Medallion (Planar Circular UV Mapping)
    const logoDisc = new THREE.Mesh(
      new THREE.CircleGeometry(1.65, 64),
      this.materials.missionLogoBadge
    );
    logoDisc.position.set(0, stiltHeight + 5.5, 12.14);
    logoDisc.castShadow = true;
    emblemGroup.add(logoDisc);

    // Illuminating Twilight Spotlight
    const emblemSpot = new THREE.PointLight(0x00E5FF, 1.2, 12);
    emblemSpot.position.set(0, stiltHeight + 5.8, 13.5);
    emblemGroup.add(emblemSpot);

    this.registerInteractive('bh_mission_emblem', emblemGroup);
    habGroup.add(emblemGroup);

    // Rooftop Solar PV Arrays (BH-PV-01) - 4 Rows × 6 Columns
    const solarGroup = new THREE.Group();
    solarGroup.name = 'ROOFTOP_SOLAR_ARRAY';

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) {
        // PV Panel Rack at 35° Polar Angle
        const panel = new THREE.Mesh(
          new THREE.BoxGeometry(3.6, 0.12, 1.8),
          this.materials.solarPvCell
        );
        panel.rotation.x = -Math.PI / 5.2; // Optimized Antarctic solar tilt
        panel.position.set(-14 + c * 5.0, stiltHeight + 10.2, -5 + r * 3.2);
        panel.castShadow = true;
        solarGroup.add(panel);

        // Frame support
        const frame = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.7, 6),
          this.materials.solarFrame
        );
        frame.position.set(-14 + c * 5.0, stiltHeight + 9.8, -5 + r * 3.2);
        solarGroup.add(frame);
      }
    }

    // Status indicator beacon on solar array
    const solarBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 12, 12),
      this.getStatusMaterial('bh_solar_01')
    );
    solarBeacon.position.set(16, stiltHeight + 10.6, 0);
    solarGroup.add(solarBeacon);

    this.registerInteractive('bh_solar_01', solarGroup);
    habGroup.add(solarGroup);

    // Rooftop HVAC Heat Recovery Units (BH-HVAC-01)
    const hvacGroup = new THREE.Group();
    hvacGroup.name = 'BHARATI_HVAC_SYSTEM';

    const hvacCabinet = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 2.6, 3.8),
      this.materials.machineryCast
    );
    hvacCabinet.position.set(-10, stiltHeight + 10.8, 0);
    hvacCabinet.castShadow = true;
    hvacGroup.add(hvacCabinet);

    // Ventilation intake cowls & exhaust hoods
    for (let i = 0; i < 2; i++) {
      const cowl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 1.4, 12),
        this.materials.exhaustStack
      );
      cowl.position.set(-12 + i * 4, stiltHeight + 12.2, 0);
      hvacGroup.add(cowl);
    }

    const hvacBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 12, 12),
      this.getStatusMaterial('bh_hvac_01')
    );
    hvacBeacon.position.set(-10, stiltHeight + 12.2, 2.2);
    hvacGroup.add(hvacBeacon);

    this.registerInteractive('bh_hvac_01', hvacGroup);
    habGroup.add(hvacGroup);

    this.group.add(habGroup);
  }

  /**
   * 2. Energy Hub (Gensets 01, 02, 03, BESS, Switchgear)
   */
  private buildEnergyHub(): void {
    const energyGroup = new THREE.Group();
    energyGroup.name = 'ENERGY_HUB_MODULES';
    energyGroup.position.set(-36, 0, -14);

    // Concrete Pad
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(18, 0.4, 12),
      this.materials.structuralSteel
    );
    pad.position.set(0, 0.2, 0);
    pad.receiveShadow = true;
    energyGroup.add(pad);

    // 3 Containerized Genset Bays
    const gensets = [
      { id: 'bh_gen_01', x: -5, label: 'GEN-01 (Primary)' },
      { id: 'bh_gen_02', x: 0, label: 'GEN-02 (Auxiliary)' },
      { id: 'bh_gen_03', x: 5, label: 'GEN-03 (Backup)' },
    ];

    gensets.forEach(g => {
      const genBay = new THREE.Group();
      genBay.name = g.id;

      // Acoustic enclosure container
      const enclosure = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 2.8, 6.2),
        this.materials.bharatiHullAccent
      );
      enclosure.position.set(g.x, 1.8, 0);
      enclosure.castShadow = true;
      genBay.add(enclosure);

      // Louvers
      const louver = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 1.6),
        this.materials.radiatorGrille
      );
      louver.position.set(g.x, 2.0, 3.12);
      genBay.add(louver);

      // Twin Stainless Exhaust Silencer Stacks with Rain Flaps
      for (let s = -0.4; s <= 0.4; s += 0.8) {
        const stack = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.18, 2.6, 12),
          this.materials.exhaustStack
        );
        stack.position.set(g.x + s, 4.2, -1.8);
        stack.castShadow = true;
        genBay.add(stack);

        const flap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.24, 0.06, 12),
          this.materials.machineryCast
        );
        flap.position.set(g.x + s, 5.5, -1.8);
        flap.rotation.z = Math.PI / 6;
        genBay.add(flap);
      }

      // External Fuel Day Tank with Sight Glass
      const dayTank = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 2.2, 16),
        this.materials.fuelTankBharati
      );
      dayTank.rotation.x = Math.PI / 2;
      dayTank.position.set(g.x, 3.6, 1.2);
      genBay.add(dayTank);

      // Status Beacon
      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 12, 12),
        this.getStatusMaterial(g.id)
      );
      beacon.position.set(g.x, 4.4, 1.2);
      genBay.add(beacon);

      this.registerInteractive(g.id, genBay);
      energyGroup.add(genBay);
    });

    // Central Microgrid Switchgear (BH-PDB-01)
    const pdbGroup = new THREE.Group();
    pdbGroup.name = 'BH_PDB_01';

    const switchboard = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 2.4, 2.2),
      this.materials.switchgearCabinet
    );
    switchboard.position.set(0, 1.6, 4.6);
    pdbGroup.add(switchboard);

    // Transformer with cooling fins
    const transformer = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 2.0, 1.8),
      this.materials.transformerFins
    );
    transformer.position.set(4.0, 1.4, 4.6);
    pdbGroup.add(transformer);

    const pdbBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      this.getStatusMaterial('bh_pdb_01')
    );
    pdbBeacon.position.set(0, 3.0, 4.6);
    pdbGroup.add(pdbBeacon);

    this.registerInteractive('bh_pdb_01', pdbGroup);
    energyGroup.add(pdbGroup);

    // Battery Storage Container (BH-BESS-01)
    const bessGroup = new THREE.Group();
    bessGroup.name = 'BH_BESS_01';

    const bessBox = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 2.6, 4.8),
      this.materials.bharatiHull
    );
    bessBox.position.set(-4.5, 1.7, 4.6);
    bessGroup.add(bessBox);

    const bessHvac = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.2, 0.6),
      this.materials.machineryCast
    );
    bessHvac.position.set(-4.5, 2.2, 6.8);
    bessGroup.add(bessHvac);

    const bessBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      this.getStatusMaterial('bh_bess_01')
    );
    bessBeacon.position.set(-4.5, 3.2, 4.6);
    bessGroup.add(bessBeacon);

    this.registerInteractive('bh_bess_01', bessGroup);
    energyGroup.add(bessGroup);

    this.group.add(energyGroup);
  }

  /**
   * 3. Snow Melt & RO Water Purification Plant (BH-RO-01)
   */
  private buildWaterTreatmentPlant(): void {
    const waterGroup = new THREE.Group();
    waterGroup.name = 'BH_WATER_01';
    waterGroup.position.set(12, 0, -24);

    // Concrete Pad
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(9, 0.3, 7),
      this.materials.structuralSteel
    );
    pad.position.set(0, 0.15, 0);
    pad.receiveShadow = true;
    waterGroup.add(pad);

    // Insulated Utility Shelter
    const plantHouse = new THREE.Mesh(
      new THREE.BoxGeometry(5.4, 3.2, 5.2),
      this.materials.bharatiHullAccent
    );
    plantHouse.position.set(-1.2, 1.75, 0);
    plantHouse.castShadow = true;
    waterGroup.add(plantHouse);

    // Multi-Tube RO Membrane Rack (3-tier horizontal pressure vessels)
    for (let tier = 0; tier < 3; tier++) {
      for (let row = 0; row < 2; row++) {
        const membraneTube = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.22, 3.2, 16),
          this.materials.roMembraneVessel
        );
        membraneTube.rotation.z = Math.PI / 2;
        membraneTube.position.set(2.4, 1.0 + tier * 0.7, -1.0 + row * 1.4);
        waterGroup.add(membraneTube);
      }
    }

    // High Pressure Booster Pumps & Motors
    for (let p = 0; p < 2; p++) {
      const pump = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.9, 12),
        this.materials.pumpMotor
      );
      pump.position.set(2.4, 0.45, -1.0 + p * 1.4);
      waterGroup.add(pump);
    }

    // Treated Potable Water Holding Tank
    const waterTank = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.4, 2.8, 24),
      this.materials.stainlessPipe
    );
    waterTank.position.set(-2.0, 1.6, 3.5);
    waterTank.castShadow = true;
    waterGroup.add(waterTank);

    // Dial Pressure Gauge & Status Beacon
    const gauge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.08, 16),
      this.materials.machineryCast
    );
    gauge.position.set(2.4, 3.2, 0);
    waterGroup.add(gauge);

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 12),
      this.getStatusMaterial('bh_water_01')
    );
    beacon.position.set(2.4, 3.6, 0);
    waterGroup.add(beacon);

    this.registerInteractive('bh_water_01', waterGroup);
    this.group.add(waterGroup);
  }

  /**
   * 4. Bulk Fuel Storage Farm (BH-TK-01, BH-TK-02)
   */
  private buildBulkFuelFarm(): void {
    const fuelGroup = new THREE.Group();
    fuelGroup.name = 'BULK_FUEL_FARM';
    fuelGroup.position.set(36, 0, -26);

    // Safety Containment Berm (Bund)
    const bundWall = new THREE.Mesh(
      new THREE.BoxGeometry(14, 0.8, 10),
      this.materials.structuralSteel
    );
    bundWall.position.set(0, 0.4, 0);
    bundWall.receiveShadow = true;
    fuelGroup.add(bundWall);

    const bundInterior = new THREE.Mesh(
      new THREE.BoxGeometry(13, 0.7, 9),
      this.materials.machineryCast
    );
    bundInterior.position.set(0, 0.45, 0);
    fuelGroup.add(bundInterior);

    // 2x 100,000L Horizontal Double-Walled Cylindrical Tanks
    const tanks = [
      { id: 'bh_fuel_tank_01', z: -2.4, label: 'TK-01 (Alpha)' },
      { id: 'bh_fuel_tank_02', z: 2.4, label: 'TK-02 (Bravo)' },
    ];

    tanks.forEach(t => {
      const tankObj = new THREE.Group();
      tankObj.name = t.id;

      // Tank cylinder
      const cyl = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.2, 8.5, 24),
        this.materials.fuelTankBharati
      );
      cyl.rotation.z = Math.PI / 2;
      cyl.position.set(0, 2.6, t.z);
      cyl.castShadow = true;
      tankObj.add(cyl);

      // Dished end caps
      for (let s = -4.25; s <= 4.25; s += 8.5) {
        const cap = new THREE.Mesh(
          new THREE.SphereGeometry(2.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 3),
          this.materials.fuelTankBharati
        );
        cap.rotation.z = s > 0 ? -Math.PI / 2 : Math.PI / 2;
        cap.position.set(s, 2.6, t.z);
        tankObj.add(cap);
      }

      // Concrete saddle cradles
      for (let s = -2.8; s <= 2.8; s += 5.6) {
        const saddle = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 1.4, 3.2),
          this.materials.structuralSteel
        );
        saddle.position.set(s, 1.0, t.z);
        tankObj.add(saddle);
      }

      // Top inspection manhole & breather vent
      const manhole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.4, 12),
        this.materials.machineryCast
      );
      manhole.position.set(0, 4.9, t.z);
      tankObj.add(manhole);

      // Status Beacon
      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 12, 12),
        this.getStatusMaterial(t.id)
      );
      beacon.position.set(0, 5.4, t.z);
      tankObj.add(beacon);

      this.registerInteractive(t.id, tankObj);
      fuelGroup.add(tankObj);
    });

    this.registerInteractive('bh_fuel_farm', fuelGroup);
    this.group.add(fuelGroup);
  }

  /**
   * 4b. Bharati Polar Vehicle Fueling Station & Dispenser (BH-FUEL-STAT)
   */
  private buildFuelStation(): void {
    const statGroup = new THREE.Group();
    statGroup.name = 'BHARATI_FUEL_STATION';
    statGroup.position.set(28, 0, 18);

    // Concrete Service Pad
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(8.0, 0.4, 6.0),
      this.materials.structuralSteel
    );
    pad.position.y = 0.2;
    pad.receiveShadow = true;
    statGroup.add(pad);

    // Weather-Protected Steel Canopy Roof
    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(8.4, 0.35, 6.4),
      this.materials.bharatiHullAccent
    );
    canopy.position.y = 3.8;
    canopy.castShadow = true;
    statGroup.add(canopy);

    // 4 Tubular Support Columns
    const colCoords = [
      [-3.6, -2.6], [-3.6, 2.6], [3.6, -2.6], [3.6, 2.6]
    ];
    colCoords.forEach(([cx, cz]) => {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 3.6, 12),
        this.materials.steelStilts
      );
      col.position.set(cx, 2.0, cz);
      col.castShadow = true;
      statGroup.add(col);
    });

    // High-Flow Polar Fuel Dispenser Unit
    const dispenser = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 2.2, 1.0),
      this.materials.statusWarning
    );
    dispenser.position.set(0, 1.3, 0);
    dispenser.castShadow = true;
    statGroup.add(dispenser);

    // Hose Booms and Grounding Reel
    const hoseBoom = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8),
      this.materials.structuralSteel
    );
    hoseBoom.rotation.z = Math.PI / 4;
    hoseBoom.position.set(0.6, 2.8, 0);
    statGroup.add(hoseBoom);

    this.registerInteractive('bh_fuel_station', statGroup);
    this.group.add(statGroup);
  }

  /**
   * 4c. Sea-Water Intake Pump House (Thala Fjord / Quilty Bay Shoreline) (BH-SW-PUMP)
   */
  private buildSeaWaterPumpHouse(): void {
    const pumpGroup = new THREE.Group();
    pumpGroup.name = 'SEAWATER_PUMP_HOUSE';
    pumpGroup.position.set(-38, -1.5, -48);

    // Bedrock Marine Anchor Footing Pad
    const anchorPad = new THREE.Mesh(
      new THREE.CylinderGeometry(4.8, 5.2, 0.6, 16),
      this.materials.structuralSteel
    );
    anchorPad.position.y = 0.3;
    anchorPad.receiveShadow = true;
    pumpGroup.add(anchorPad);

    // Heavily Insulated Marine GRP Pump Enclosure (8.5m × 5.5m × 3.4m)
    const building = new THREE.Mesh(
      new THREE.BoxGeometry(8.5, 3.4, 5.5),
      this.materials.bharatiHull
    );
    building.position.y = 2.0;
    building.castShadow = true;
    building.receiveShadow = true;
    pumpGroup.add(building);

    // Marine Service Intake Pipe Manifold extending into coastal depression
    const intakeLine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 16.0, 12),
      this.materials.machineryCast
    );
    intakeLine.rotation.z = Math.PI / 2.3;
    intakeLine.position.set(-6.0, 0.2, 0);
    pumpGroup.add(intakeLine);

    // Heat-Traced Delivery Line rising up to Station RO Plant
    const deliveryLine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 38.0, 12),
      this.materials.pipeBlue
    );
    deliveryLine.rotation.x = Math.PI / 2.5;
    deliveryLine.position.set(0, 3.5, 18.0);
    pumpGroup.add(deliveryLine);

    // Status beacon
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 12, 12),
      this.getStatusMaterial('bh_seawater_pump')
    );
    beacon.position.set(0, 4.0, 0);
    pumpGroup.add(beacon);

    this.registerInteractive('bh_seawater_pump', pumpGroup);
    this.group.add(pumpGroup);
  }

  /**
   * 4d. Bharati Summer Camp Containerized Living Modules (BH-SUMMER-CAMP)
   */
  private buildSummerCamp(): void {
    const campGroup = new THREE.Group();
    campGroup.name = 'BHARATI_SUMMER_CAMP';
    campGroup.position.set(32, 1.2, -18);

    // 4 Interconnected 20ft/40ft Insulated Container Modules
    const moduleOffsets = [
      { x: -6, z: 0 }, { x: 0, z: 0 }, { x: 6, z: 0 }, { x: 0, z: -5 }
    ];

    moduleOffsets.forEach((mo, idx) => {
      const pod = new THREE.Mesh(
        new THREE.BoxGeometry(5.8, 2.8, 2.6),
        this.materials.maitriOrangeHull // High-visibility international orange for field camp
      );
      pod.position.set(mo.x, 1.4, mo.z);
      pod.castShadow = true;
      pod.receiveShadow = true;
      campGroup.add(pod);

      // Elevated Support Jack Posts
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8),
        this.materials.steelStilts
      );
      post.position.set(mo.x, 0.6, mo.z);
      campGroup.add(post);

      // Window
      const win = new THREE.Mesh(
        new THREE.PlaneGeometry(1.0, 0.8),
        this.materials.insulatedGlass
      );
      win.position.set(mo.x, 1.8, mo.z + 1.32);
      campGroup.add(win);
    });

    this.registerInteractive('bh_summer_camp', campGroup);
    this.group.add(campGroup);
  }

  /**
   * 4e. Specialized Containerized Utility & Scientific Modules (BH-CONTAINERS)
   */
  private buildContainerizedModules(): void {
    const contGroup = new THREE.Group();
    contGroup.name = 'BHARATI_CONTAINER_UNITS';
    contGroup.position.set(-24, 0.9, 22);

    const configs = [
      { x: -4, z: 0, rot: 0, label: 'Radio Science Pod' },
      { x: 2, z: 0, rot: 0, label: 'Emergency Survival Shelter' },
      { x: -1, z: 4, rot: Math.PI / 2, label: 'Spares Storage Pod' }
    ];

    configs.forEach(c => {
      const container = new THREE.Mesh(
        new THREE.BoxGeometry(6.0, 2.6, 2.4),
        this.materials.containerRed
      );
      container.position.set(c.x, 1.3, c.z);
      container.rotation.y = c.rot;
      container.castShadow = true;
      contGroup.add(container);
    });

    this.registerInteractive('bh_containers', contGroup);
    this.group.add(contGroup);
  }

  /**
   * 4f. Station Service Roads & Heavy Vehicle Access Paths (BH-ROADS)
   */
  private buildRoadsAndAccessPaths(): void {
    const roadsGroup = new THREE.Group();
    roadsGroup.name = 'BHARATI_ROADS_NETWORK';

    // Primary Service Spine from Habitat to Fuel Farm & Helipad
    const mainRoadGeo = new THREE.PlaneGeometry(6.0, 80.0);
    const mainRoad = new THREE.Mesh(mainRoadGeo, this.materials.structuralSteel);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(16, 0.08, 4);
    mainRoad.rotation.z = Math.PI / 6;
    mainRoad.receiveShadow = true;
    roadsGroup.add(mainRoad);

    // Route markers along roadway
    for (let s = -35; s <= 35; s += 10) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 2.4, 8),
        this.materials.statusWarning
      );
      pole.position.set(16 + s * Math.cos(Math.PI / 6) + 3.2, 1.2, 4 + s * Math.sin(Math.PI / 6));
      roadsGroup.add(pole);
    }

    this.registerInteractive('bh_roads_access', roadsGroup);
    this.group.add(roadsGroup);
  }

  /**
   * 5. Satellite Earth Terminal & Comms Tower (BH-SAT-01)
   */
  private buildSatelliteComms(): void {
    const commsGroup = new THREE.Group();
    commsGroup.name = 'BH_COMMS_01';
    commsGroup.position.set(32, 0, 24);

    // Structural Base Pad
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.6, 0.6, 16),
      this.materials.structuralSteel
    );
    pad.position.set(0, 0.3, 0);
    commsGroup.add(pad);

    // 12m Steel Lattice Mast
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 1.4, 10, 16),
      this.materials.antennaSteel
    );
    tower.position.set(0, 5.3, 0);
    tower.castShadow = true;
    commsGroup.add(tower);

    // 4.2m Geodesic Radome Sphere
    const radome = new THREE.Mesh(
      new THREE.SphereGeometry(2.4, 32, 24),
      this.materials.radomeDome
    );
    radome.position.set(0, 11.2, 0);
    radome.castShadow = true;
    commsGroup.add(radome);

    // Secondary Microwave Parabolic Dish
    const dish = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 0.2, 0.4, 24, 1, true),
      this.materials.antennaSteel
    );
    dish.position.set(1.4, 7.5, 0.8);
    dish.rotation.x = Math.PI / 4;
    commsGroup.add(dish);

    // Status Beacon
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 12, 12),
      this.getStatusMaterial('bh_comms_01')
    );
    beacon.position.set(0, 13.8, 0);
    commsGroup.add(beacon);

    this.registerInteractive('bh_comms_01', commsGroup);
    this.group.add(commsGroup);
  }

  /**
   * 6. Space & Atmospheric Science Lab (BH-LAB-01)
   */
  private buildScienceLab(): void {
    const labGroup = new THREE.Group();
    labGroup.name = 'BH_LAB_01';
    labGroup.position.set(-12, 0, 20); // Outside North facade on elevated platform

    // Laboratory Optical Observation Dome (for LIDAR & airglow studies)
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(1.3, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      this.materials.antennaSteel
    );
    dome.position.set(0, 5.8, 0);
    labGroup.add(dome);

    // Air Sampling Mast
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8),
      this.materials.stainlessPipe
    );
    mast.position.set(1.4, 6.6, 0);
    labGroup.add(mast);

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      this.getStatusMaterial('bh_lab_01')
    );
    beacon.position.set(0, 7.2, 0);
    labGroup.add(beacon);

    this.registerInteractive('bh_lab_01', labGroup);
    this.group.add(labGroup);
  }

  /**
   * 7. Logistics, Cargo Containers, PistenBully Snowcat, & Helipad
   */
  private buildLogisticsAndVehicles(): void {
    const logGroup = new THREE.Group();
    logGroup.name = 'LOGISTICS_AND_VEHICLES';

    // Engineered Helipad (Octagonal with perimeter beacons & high-contrast marking)
    const padGroup = new THREE.Group();
    padGroup.position.set(-36, 0, 24);

    const helipad = new THREE.Mesh(
      new THREE.CylinderGeometry(7.5, 7.8, 0.35, 8),
      this.materials.helipadSurface
    );
    helipad.position.set(0, 0.18, 0);
    helipad.receiveShadow = true;
    padGroup.add(helipad);

    // Outer Yellow Ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(6.4, 6.8, 32),
      this.materials.helipadMarking
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.36;
    padGroup.add(ring);

    // 'H' Marking
    const hBar1 = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 4.0), this.materials.helipadMarking);
    hBar1.rotation.x = -Math.PI / 2;
    hBar1.position.set(-1.2, 0.37, 0);
    padGroup.add(hBar1);

    const hBar2 = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 4.0), this.materials.helipadMarking);
    hBar2.rotation.x = -Math.PI / 2;
    hBar2.position.set(1.2, 0.37, 0);
    padGroup.add(hBar2);

    const hCross = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.7), this.materials.helipadMarking);
    hCross.rotation.x = -Math.PI / 2;
    hCross.position.set(0, 0.37, 0);
    padGroup.add(hCross);

    // Perimeter Green LED Obstruction Beacons
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2;
      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        this.materials.statusNormal
      );
      beacon.position.set(Math.cos(angle) * 7.2, 0.45, Math.sin(angle) * 7.2);
      padGroup.add(beacon);
    }
    logGroup.add(padGroup);

    // ISO Shipping Containers on Dunnage (Color-coded)
    const containerData = [
      { x: -24, z: 18, rot: 0.1, mat: this.materials.containerRed },   // Emergency spares
      { x: -24, z: 22, rot: 0.1, mat: this.materials.containerBlue }, // Engineering
      { x: -20, z: 18, rot: -0.05, mat: this.materials.containerWhite }, // Provisions
      { x: -20, z: 22, rot: -0.05, mat: this.materials.containerGreen }, // Science
    ];

    containerData.forEach(c => {
      const cont = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 2.6, 6.0),
        c.mat
      );
      cont.position.set(c.x, 1.4, c.z);
      cont.rotation.y = c.rot;
      cont.castShadow = true;
      logGroup.add(cont);
    });

    // PistenBully Tracked Snowcat Vehicle
    const snowcat = new THREE.Group();
    snowcat.position.set(-26, 0, 14);
    snowcat.rotation.y = 0.4;

    // Chassis & Cabin
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.8, 3.8),
      this.materials.snowcatYellow
    );
    cabin.position.set(0, 1.6, 0);
    cabin.castShadow = true;
    snowcat.add(cabin);

    // Front Windshield
    const windshield = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 1.0),
      this.materials.insulatedGlass
    );
    windshield.position.set(0, 1.9, 1.92);
    snowcat.add(windshield);

    // Tracks (Left & Right)
    for (let t = -1.3; t <= 1.3; t += 2.6) {
      const track = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.8, 4.4),
        this.materials.snowcatTrack
      );
      track.position.set(t, 0.45, 0);
      track.castShadow = true;
      snowcat.add(track);
    }

    // Front Hydraulic Snow Blade
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.8, 0.2),
      this.materials.machineryCast
    );
    blade.position.set(0, 0.45, 2.6);
    blade.castShadow = true;
    snowcat.add(blade);

    logGroup.add(snowcat);
    this.group.add(logGroup);
  }

  /**
   * 8. Elevated Pipeline & Electrical Cable Trestles Interconnecting Facilities
   */
  private buildPipeTrestleNetwork(): void {
    const trestleGroup = new THREE.Group();
    trestleGroup.name = 'PIPELINE_AND_CABLE_TRESTLES';

    // Route 1: Bulk Fuel Farm -> Energy Hub (Fuel Line)
    const fuelPoints = [
      new THREE.Vector3(36, 1.8, -26),
      new THREE.Vector3(20, 1.8, -22),
      new THREE.Vector3(-10, 1.8, -18),
      new THREE.Vector3(-28, 1.8, -14),
    ];
    this.createTrestleRun(trestleGroup, fuelPoints, this.materials.fuelTankBharati);

    // Route 2: Water RO Plant -> Main Habitat Building (Potable Water Line)
    const waterPoints = [
      new THREE.Vector3(12, 1.6, -24),
      new THREE.Vector3(6, 1.8, -16),
      new THREE.Vector3(0, 2.2, -12),
    ];
    this.createTrestleRun(trestleGroup, waterPoints, this.materials.stainlessPipe);

    // Route 3: Energy Hub -> Main Habitat Building (High Voltage Busway & Heat Recovery)
    const powerPoints = [
      new THREE.Vector3(-28, 2.2, -14),
      new THREE.Vector3(-24, 2.2, -8),
      new THREE.Vector3(-22, 3.6, 0),
    ];
    this.createTrestleRun(trestleGroup, powerPoints, this.materials.structuralSteel);

    this.group.add(trestleGroup);
  }

  private createTrestleRun(
    parent: THREE.Group,
    points: THREE.Vector3[],
    pipeMat: THREE.Material
  ): void {
    const curve = new THREE.CatmullRomCurve3(points);
    const pipeGeo = new THREE.TubeGeometry(curve, 32, 0.16, 8, false);
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.castShadow = true;
    parent.add(pipe);

    // Vertical Support Stanchions every 6 meters
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      const stanchion = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, pt.y, 8),
        this.materials.structuralSteel
      );
      stanchion.position.set(pt.x, pt.y / 2, pt.z);
      parent.add(stanchion);
    }
  }

  /**
   * 9. POLAR-TWIN Official Mission Control Monolith
   * Stands prominently at the entrance road approach connecting helipad & main base
   */
  private buildMissionControlMonolith(): void {
    const monolithGroup = new THREE.Group();
    monolithGroup.name = 'POLAR_TWIN_MISSION_MONOLITH';
    monolithGroup.position.set(-16, 0, 18);

    // Concrete & Moraine Rock Foundation Base
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.6, 2.2),
      this.materials.moraineRock
    );
    plinth.position.set(0, 0.3, 0);
    plinth.receiveShadow = true;
    monolithGroup.add(plinth);

    // Stepped Structural Steel Pedestal
    const stepPedestal = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 0.4, 1.6),
      this.materials.structuralSteel
    );
    stepPedestal.position.set(0, 0.8, 0);
    monolithGroup.add(stepPedestal);

    // Aerospace Brushed Titanium Vertical Stele / Pylon
    const stele = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 4.4, 0.45),
      this.materials.structuralSteel
    );
    stele.position.set(0, 3.2, 0);
    stele.castShadow = true;
    monolithGroup.add(stele);

    // High-Visibility Orange Trim Band
    const orangeBand = new THREE.Mesh(
      new THREE.BoxGeometry(2.82, 0.3, 0.47),
      this.materials.bharatiHullAccent
    );
    orangeBand.position.set(0, 5.2, 0);
    monolithGroup.add(orangeBand);

    // Front-Facing POLAR-TWIN Logo Medallion (Planar Circular UV Mapping)
    const frontLogo = new THREE.Mesh(
      new THREE.CircleGeometry(1.15, 64),
      this.materials.missionLogoBadge
    );
    frontLogo.position.set(0, 3.4, 0.28);
    monolithGroup.add(frontLogo);

    // Rear-Facing POLAR-TWIN Logo Medallion
    const backLogo = new THREE.Mesh(
      new THREE.CircleGeometry(1.15, 64),
      this.materials.missionLogoBadge
    );
    backLogo.rotation.y = Math.PI;
    backLogo.position.set(0, 3.4, -0.28);
    monolithGroup.add(backLogo);

    // Upward Night-Illumination Uplight
    const uplight = new THREE.PointLight(0x00E5FF, 1.4, 12);
    uplight.position.set(0, 5.6, 0);
    monolithGroup.add(uplight);

    this.registerInteractive('bh_mission_monolith', monolithGroup);
    this.group.add(monolithGroup);
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
  }
}
