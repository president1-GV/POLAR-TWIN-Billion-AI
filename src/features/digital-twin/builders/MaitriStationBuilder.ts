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
    this.buildCommunicationsArray();
    this.buildGeomagneticLaboratory();
    this.buildVehicleGarageAndLogistics();
    this.buildTrestleNetwork();
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
   * Historic multi-pod container structure with orange insulated cladding & gabled roofs
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

    pods.forEach(p => {
      // Wall Module
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(p.w, 3.2, p.d),
        this.materials.maitriOrangeHull
      );
      wall.position.set(p.x, 1.8, p.z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      mainGroup.add(wall);

      // Gabled Roof
      const roofGeo = new THREE.ConeGeometry(Math.max(p.w, p.d) * 0.72, 1.4, 4);
      const roof = new THREE.Mesh(roofGeo, this.materials.maitriRoof);
      roof.position.set(p.x, 4.1, p.z);
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
        win.position.set(p.x + w, 2.1, p.z + p.d / 2 + 0.02);
        mainGroup.add(win);
      }
    });

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

    // Pump House by Lake Shore (MA-PUMP-01)
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
   * 5. Fuel Storage Farm (MA-TK-01)
   */
  private buildFuelFarm(): void {
    const fuelGroup = new THREE.Group();
    fuelGroup.name = 'MA_FUEL_FARM';
    fuelGroup.position.set(-18, 0, 10);

    const tankObj = new THREE.Group();
    tankObj.name = 'ma_fuel_tank_01';

    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(2.0, 2.0, 7.5, 24),
      this.materials.fuelTankMaitri
    );
    cyl.rotation.z = Math.PI / 2;
    cyl.position.set(0, 2.3, 0);
    cyl.castShadow = true;
    tankObj.add(cyl);

    for (let s = -2.5; s <= 2.5; s += 5.0) {
      const saddle = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 1.2, 2.8),
        this.materials.structuralSteel
      );
      saddle.position.set(s, 0.8, 0);
      tankObj.add(saddle);
    }

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      this.getStatusMaterial('ma_fuel_tank_01')
    );
    beacon.position.set(0, 4.6, 0);
    tankObj.add(beacon);

    this.registerInteractive('ma_fuel_tank_01', tankObj);
    fuelGroup.add(tankObj);
    this.group.add(fuelGroup);
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
    this.interactiveMap.clear();
    this.windRotors = [];
  }
}
