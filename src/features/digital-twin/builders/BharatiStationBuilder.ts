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
    this.buildSatelliteComms();
    this.buildScienceLab();
    this.buildLogisticsAndVehicles();
    this.buildPipeTrestleNetwork();
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
   * Elevated on heavy steel stilts with bionic aerodynamic envelope
   */
  private buildMainHabitatBlock(): void {
    const habGroup = new THREE.Group();
    habGroup.name = 'MAIN_HABITAT_BUILDING';

    // 24 Heavy Tubular Steel Stilts with foundation footings (Larsemann Hills permafrost)
    const stiltHeight = 3.6;
    for (let x = -13; x <= 13; x += 6.5) {
      for (let z = -5.5; z <= 5.5; z += 5.5) {
        // Concrete foundation pad
        const pad = new THREE.Mesh(
          new THREE.CylinderGeometry(0.7, 0.8, 0.4, 12),
          this.materials.structuralSteel
        );
        pad.position.set(x, 0.2, z);
        pad.receiveShadow = true;
        habGroup.add(pad);

        // Tubular steel column
        const stilt = new THREE.Mesh(
          new THREE.CylinderGeometry(0.28, 0.28, stiltHeight, 16),
          this.materials.steelStilts
        );
        stilt.position.set(x, stiltHeight / 2 + 0.3, z);
        stilt.castShadow = true;
        stilt.receiveShadow = true;
        habGroup.add(stilt);

        // Diagonal wind brace
        if (Math.abs(x) < 13) {
          const brace = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 7.2, 8),
            this.materials.steelStilts
          );
          brace.position.set(x + 3.25, stiltHeight / 2 + 0.3, z);
          brace.rotation.z = Math.PI / 6;
          habGroup.add(brace);
        }
      }
    }

    // Heavy Underfloor Truss Grid
    const trussGrid = new THREE.Mesh(
      new THREE.BoxGeometry(29, 0.6, 13),
      this.materials.structuralSteel
    );
    trussGrid.position.set(0, stiltHeight + 0.4, 0);
    trussGrid.castShadow = true;
    habGroup.add(trussGrid);

    // Main Bionic Aerodynamic Enclosure (3-tiered envelope)
    const mainHull = new THREE.Mesh(
      new THREE.BoxGeometry(28, 5.2, 12),
      this.materials.bharatiHull
    );
    mainHull.position.set(0, stiltHeight + 3.3, 0);
    mainHull.castShadow = true;
    mainHull.receiveShadow = true;
    habGroup.add(mainHull);

    // Aerodynamic Windward Chamfer Nose (North/East facing)
    const noseGeo = new THREE.CylinderGeometry(6, 6, 5.2, 16, 1, false, -Math.PI / 2, Math.PI);
    const nose = new THREE.Mesh(noseGeo, this.materials.bharatiHull);
    nose.position.set(14, stiltHeight + 3.3, 0);
    nose.castShadow = true;
    habGroup.add(nose);

    // Upper Observation Deck Facade Accent
    const roofDeck = new THREE.Mesh(
      new THREE.BoxGeometry(27, 0.4, 11),
      this.materials.bharatiHullAccent
    );
    roofDeck.position.set(0, stiltHeight + 6.0, 0);
    habGroup.add(roofDeck);

    // Panoramic Double-Glazed Observation Windows (facing ocean ice)
    for (let x = -10; x <= 10; x += 2.8) {
      const windowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 1.4),
        this.materials.insulatedGlass
      );
      windowMesh.position.set(x, stiltHeight + 4.2, 6.05);
      habGroup.add(windowMesh);
    }

    // Entrance Airlock Gantry with Access Staircase & Handrails
    const gantry = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 0.3, 3.5),
      this.materials.catwalkGrate
    );
    gantry.position.set(0, stiltHeight + 0.55, 7.8);
    habGroup.add(gantry);

    const stairRail = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, stiltHeight + 0.5, 4.5),
      this.materials.structuralSteel
    );
    stairRail.position.set(0, (stiltHeight + 0.5) / 2, 9.8);
    stairRail.rotation.x = -Math.PI / 5;
    habGroup.add(stairRail);

    // Rooftop Solar PV Arrays (BH-PV-01)
    const solarGroup = new THREE.Group();
    solarGroup.name = 'ROOFTOP_SOLAR_ARRAY';

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        // PV Panel Rack at 35° Polar Angle
        const panel = new THREE.Mesh(
          new THREE.BoxGeometry(3.6, 0.12, 1.8),
          this.materials.solarPvCell
        );
        panel.rotation.x = -Math.PI / 5.2; // Optimized Antarctic solar tilt
        panel.position.set(-8 + c * 4.6, stiltHeight + 6.6, -3 + r * 2.8);
        panel.castShadow = true;
        solarGroup.add(panel);

        // Frame support
        const frame = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.7, 6),
          this.materials.solarFrame
        );
        frame.position.set(-8 + c * 4.6, stiltHeight + 6.3, -3 + r * 2.8);
        solarGroup.add(frame);
      }
    }

    // Status indicator beacon on solar array
    const solarBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      this.getStatusMaterial('bh_solar_01')
    );
    solarBeacon.position.set(10, stiltHeight + 6.8, 0);
    solarGroup.add(solarBeacon);

    this.registerInteractive('bh_solar_01', solarGroup);
    habGroup.add(solarGroup);

    // Rooftop HVAC Heat Recovery Units (BH-HVAC-01)
    const hvacGroup = new THREE.Group();
    hvacGroup.name = 'BHARATI_HVAC_SYSTEM';

    const hvacCabinet = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 2.2, 3.2),
      this.materials.machineryCast
    );
    hvacCabinet.position.set(-8, stiltHeight + 7.1, 0);
    hvacCabinet.castShadow = true;
    hvacGroup.add(hvacCabinet);

    // Ventilation intake cowls & exhaust hoods
    for (let i = 0; i < 2; i++) {
      const cowl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 1.2, 12),
        this.materials.exhaustStack
      );
      cowl.position.set(-9 + i * 2, stiltHeight + 8.4, 0);
      hvacGroup.add(cowl);
    }

    const hvacBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      this.getStatusMaterial('bh_hvac_01')
    );
    hvacBeacon.position.set(-8, stiltHeight + 8.4, 1.8);
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
    energyGroup.position.set(-18, 0, -4);

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
    waterGroup.position.set(10, 0, -8);

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
    fuelGroup.position.set(22, 0, -14);

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

    this.group.add(fuelGroup);
  }

  /**
   * 5. Satellite Earth Terminal & Comms Tower (BH-SAT-01)
   */
  private buildSatelliteComms(): void {
    const commsGroup = new THREE.Group();
    commsGroup.name = 'BH_COMMS_01';
    commsGroup.position.set(16, 0, 8);

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
    labGroup.position.set(8, 3.6, 3.8); // Integrated into East Wing level 2

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
    padGroup.position.set(-20, 0, 16);

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
      { x: -10, z: 12, rot: 0.1, mat: this.materials.containerRed },   // Emergency spares
      { x: -10, z: 15.5, rot: 0.1, mat: this.materials.containerBlue }, // Engineering
      { x: -6, z: 13, rot: -0.05, mat: this.materials.containerWhite }, // Provisions
      { x: -6, z: 16.5, rot: -0.05, mat: this.materials.containerGreen }, // Science
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
    snowcat.position.set(-14, 0, 10);
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
      new THREE.Vector3(22, 1.8, -14),
      new THREE.Vector3(12, 1.8, -12),
      new THREE.Vector3(0, 1.8, -8),
      new THREE.Vector3(-14, 1.8, -4),
    ];
    this.createTrestleRun(trestleGroup, fuelPoints, this.materials.fuelTankBharati);

    // Route 2: Water RO Plant -> Main Habitat Building (Potable Water Line)
    const waterPoints = [
      new THREE.Vector3(10, 1.6, -8),
      new THREE.Vector3(5, 1.6, -4),
      new THREE.Vector3(2, 2.2, 0),
    ];
    this.createTrestleRun(trestleGroup, waterPoints, this.materials.stainlessPipe);

    // Route 3: Energy Hub -> Main Habitat Building (High Voltage Busway & Heat Recovery)
    const powerPoints = [
      new THREE.Vector3(-18, 2.2, -2),
      new THREE.Vector3(-8, 2.2, -1),
      new THREE.Vector3(-2, 3.6, 0),
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
    // Clear references
    this.interactiveMap.clear();
  }
}
