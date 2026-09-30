import * as THREE from 'three';
import { SystemFlowEdge } from '../types';

interface FlowItem {
  edge: SystemFlowEdge;
  curve: THREE.CatmullRomCurve3;
  tubeMesh: THREE.Mesh;
  tubeMat: THREE.MeshStandardMaterial;
  lineMesh: THREE.Line;
  beads: THREE.Mesh[];
  arrows: THREE.Mesh[];
  progress: number;
}

export class DependencyFlowOverlay {
  public group: THREE.Group;
  private flowItems: FlowItem[] = [];
  private highlightedAssetId: string | null = null;

  constructor(
    private scene: THREE.Scene,
    private stationId: string
  ) {
    this.group = new THREE.Group();
    this.group.name = 'DEPENDENCY_FLOW_OVERLAY';
    this.buildEdges();
    this.scene.add(this.group);
  }

  private buildEdges(): void {
    const isBharati = this.stationId === 'station_bharati';

    const edges: SystemFlowEdge[] = isBharati ? [
      {
        id: 'flow_fuel_gen01',
        sourceAssetId: 'bh_fuel_tank_01',
        targetAssetId: 'bh_gen_01',
        type: 'FUEL',
        color: '#F59E0B', // Amber
        flowSpeed: 1.2,
        points: [[36, 2.6, -26], [20, 2.2, -22], [-10, 2.2, -18], [-28, 2.2, -14], [-41, 2.2, -14]],
      },
      {
        id: 'flow_gen01_pdb',
        sourceAssetId: 'bh_gen_01',
        targetAssetId: 'bh_pdb_01',
        type: 'POWER',
        color: '#22D3EE', // Electric Cyan
        flowSpeed: 2.0,
        points: [[-41, 2.2, -14], [-38, 2.2, -12], [-36, 2.2, -9.4]],
      },
      {
        id: 'flow_solar_pdb',
        sourceAssetId: 'bh_solar_01',
        targetAssetId: 'bh_pdb_01',
        type: 'POWER',
        color: '#FACC15', // Solar Yellow
        flowSpeed: 1.5,
        points: [[0, 14.2, 0], [-15, 8.5, -5], [-36, 2.2, -9.4]],
      },
      {
        id: 'flow_bess_pdb',
        sourceAssetId: 'bh_bess_01',
        targetAssetId: 'bh_pdb_01',
        type: 'POWER',
        color: '#38BDF8', // Battery Sky Blue
        flowSpeed: 1.6,
        points: [[-41, 2.2, -9.4], [-36, 2.2, -9.4]],
      },
      {
        id: 'flow_pdb_hvac',
        sourceAssetId: 'bh_pdb_01',
        targetAssetId: 'bh_hvac_01',
        type: 'HEATING',
        color: '#FB923C', // Warm Orange
        flowSpeed: 1.4,
        points: [[-36, 2.2, -9.4], [-24, 6.5, -4], [-10, 14.5, 0]],
      },
      {
        id: 'flow_pdb_water',
        sourceAssetId: 'bh_pdb_01',
        targetAssetId: 'bh_water_01',
        type: 'WATER',
        color: '#0EA5E9', // Water Cyan
        flowSpeed: 1.5,
        points: [[-36, 2.2, -9.4], [-18, 2.2, -16], [0, 2.2, -20], [12, 2.2, -24]],
      },
      {
        id: 'flow_pdb_comms',
        sourceAssetId: 'bh_pdb_01',
        targetAssetId: 'bh_comms_01',
        type: 'COMMS',
        color: '#A855F7', // Telemetry Violet
        flowSpeed: 1.8,
        points: [[-36, 2.2, -9.4], [-10, 3.0, 6], [12, 5.0, 16], [32, 11.5, 24]],
      },
      {
        id: 'flow_pdb_lab',
        sourceAssetId: 'bh_pdb_01',
        targetAssetId: 'bh_lab_01',
        type: 'POWER',
        color: '#10B981', // Science Emerald
        flowSpeed: 1.3,
        points: [[-36, 2.2, -9.4], [-24, 3.0, 6], [-12, 4.5, 20]],
      },
    ] : [
      {
        id: 'flow_ma_fuel_gen',
        sourceAssetId: 'ma_fuel_tank_01',
        targetAssetId: 'ma_gen_01',
        type: 'FUEL',
        color: '#F59E0B',
        flowSpeed: 1.2,
        points: [[-18, 2.2, 10], [-18, 2.2, 0], [-21, 2.2, -8]],
      },
      {
        id: 'flow_ma_fuel_boiler',
        sourceAssetId: 'ma_fuel_tank_01',
        targetAssetId: 'ma_boiler_01',
        type: 'FUEL',
        color: '#F59E0B',
        flowSpeed: 1.2,
        points: [[-18, 2.2, 10], [-13, 2.2, 9], [-8, 2.2, 8]],
      },
      {
        id: 'flow_ma_gen_pdb',
        sourceAssetId: 'ma_gen_01',
        targetAssetId: 'ma_pdb_01',
        type: 'POWER',
        color: '#22D3EE',
        flowSpeed: 2.0,
        points: [[-21, 2.2, -8], [-10, 2.2, -4], [-2, 2.2, 0]],
      },
      {
        id: 'flow_ma_wind_pdb',
        sourceAssetId: 'ma_wind_01',
        targetAssetId: 'ma_pdb_01',
        type: 'POWER',
        color: '#38BDF8',
        flowSpeed: 1.5,
        points: [[16, 5.5, -16], [8, 3.5, -8], [-2, 2.2, 0]],
      },
      {
        id: 'flow_ma_pdb_boiler',
        sourceAssetId: 'ma_pdb_01',
        targetAssetId: 'ma_boiler_01',
        type: 'HEATING',
        color: '#FB923C',
        flowSpeed: 1.5,
        points: [[-2, 2.2, 0], [-5, 2.2, 4], [-8, 2.2, 8]],
      },
      {
        id: 'flow_ma_pdb_pump',
        sourceAssetId: 'ma_pdb_01',
        targetAssetId: 'ma_water_pump_01',
        type: 'POWER',
        color: '#0EA5E9',
        flowSpeed: 1.8,
        points: [[-2, 2.2, 0], [8, 2.0, 4], [18, 1.8, 8]],
      },
      {
        id: 'flow_ma_pump_reservoir',
        sourceAssetId: 'ma_water_pump_01',
        targetAssetId: 'ma_water_tank_01',
        type: 'WATER',
        color: '#38BDF8',
        flowSpeed: 1.4,
        points: [[18, 1.8, 8], [13, 2.0, 7], [8, 2.2, 6]],
      },
      {
        id: 'flow_ma_pdb_comms',
        sourceAssetId: 'ma_pdb_01',
        targetAssetId: 'ma_comms_01',
        type: 'COMMS',
        color: '#A855F7',
        flowSpeed: 1.7,
        points: [[-2, 2.2, 0], [5, 2.8, -3], [12, 3.4, -6]],
      },
    ];

    edges.forEach(edge => {
      const curvePoints = edge.points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
      const curve = new THREE.CatmullRomCurve3(curvePoints);

      // 1. High-visibility 3D glowing volumetric conduit tube
      const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.16, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(edge.color),
        emissive: new THREE.Color(edge.color),
        emissiveIntensity: 0.65,
        roughness: 0.25,
        metalness: 0.5,
        transparent: true,
        opacity: 0.88,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      this.group.add(tubeMesh);

      // 2. High-contrast central line core for crisp edge definition
      const points = curve.getPoints(48);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.6,
      });
      const lineMesh = new THREE.Line(lineGeo, lineMat);
      this.group.add(lineMesh);

      // 3. Directional flow arrow cones along the conduit
      const arrows: THREE.Mesh[] = [];
      const arrowFractions = [0.35, 0.70];
      const arrowGeo = new THREE.ConeGeometry(0.28, 0.65, 8);
      arrowGeo.rotateX(Math.PI / 2); // Point forward along Z

      arrowFractions.forEach(frac => {
        const pt = curve.getPointAt(frac);
        const tangent = curve.getTangentAt(frac);
        const arrowMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(edge.color),
          transparent: true,
          opacity: 0.9,
        });
        const arrow = new THREE.Mesh(arrowGeo, arrowMat);
        arrow.position.copy(pt);
        arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent.normalize());
        this.group.add(arrow);
        arrows.push(arrow);
      });

      // 4. Animated glowing pulse beads moving along the flow curve
      const beads: THREE.Mesh[] = [];
      const beadGeo = new THREE.SphereGeometry(0.28, 12, 12);
      const beadMat = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        emissive: new THREE.Color(edge.color),
        emissiveIntensity: 1.4,
        roughness: 0.1,
      });

      for (let i = 0; i < 4; i++) {
        const bead = new THREE.Mesh(beadGeo, beadMat);
        const initialPos = curve.getPointAt(i / 4);
        bead.position.copy(initialPos);
        this.group.add(bead);
        beads.push(bead);
      }

      this.flowItems.push({
        edge,
        curve,
        tubeMesh,
        tubeMat,
        lineMesh,
        beads,
        arrows,
        progress: 0,
      });
    });
  }

  public updateAnimation(deltaSeconds: number, failedAssetIds: string[] = []): void {
    const timeNow = Date.now() * 0.005;

    this.flowItems.forEach(item => {
      const isSourceFailed = failedAssetIds.includes(item.edge.sourceAssetId);
      const isTargetFailed = failedAssetIds.includes(item.edge.targetAssetId);
      const isFailed = isSourceFailed || isTargetFailed;

      if (isFailed) {
        // Starved or tripped branch: pulsing alert red
        item.tubeMat.color.setHex(0xEF4444);
        item.tubeMat.emissive.setHex(0xEF4444);
        item.tubeMat.emissiveIntensity = 0.4 + Math.sin(timeNow) * 0.35;
        item.tubeMat.opacity = 0.65;
        item.beads.forEach(b => { b.visible = false; });
        item.arrows.forEach(a => {
          (a.material as THREE.MeshBasicMaterial).color.setHex(0xEF4444);
        });
      } else {
        // Normal or highlighted active branch
        const isHighlighted = this.highlightedAssetId === null || 
          item.edge.sourceAssetId === this.highlightedAssetId || 
          item.edge.targetAssetId === this.highlightedAssetId;

        if (this.highlightedAssetId !== null && !isHighlighted) {
          // Dim non-selected flow branches
          item.tubeMat.color.set(item.edge.color);
          item.tubeMat.emissive.set(item.edge.color);
          item.tubeMat.emissiveIntensity = 0.12;
          item.tubeMat.opacity = 0.18;
          item.lineMesh.visible = false;
          item.beads.forEach(b => { b.visible = false; });
          item.arrows.forEach(a => {
            (a.material as THREE.MeshBasicMaterial).opacity = 0.18;
          });
        } else {
          // Prominent active or traced branch
          item.tubeMat.color.set(item.edge.color);
          item.tubeMat.emissive.set(item.edge.color);
          item.tubeMat.emissiveIntensity = this.highlightedAssetId ? 1.2 : 0.65;
          item.tubeMat.opacity = this.highlightedAssetId ? 1.0 : 0.88;
          item.lineMesh.visible = true;

          // Advance flow pulse beads
          const speedMultiplier = this.highlightedAssetId ? 1.5 : 1.0;
          item.progress = (item.progress + deltaSeconds * item.edge.flowSpeed * 0.18 * speedMultiplier) % 1.0;

          item.beads.forEach((bead, idx) => {
            bead.visible = true;
            const t = (item.progress + idx / item.beads.length) % 1.0;
            const pos = item.curve.getPointAt(t);
            bead.position.copy(pos);
          });

          item.arrows.forEach(a => {
            (a.material as THREE.MeshBasicMaterial).color.set(item.edge.color);
            (a.material as THREE.MeshBasicMaterial).opacity = this.highlightedAssetId ? 1.0 : 0.9;
          });
        }
      }
    });
  }

  public setHighlightedAsset(assetId: string | null): void {
    this.highlightedAssetId = assetId;
  }

  public setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  public dispose(): void {
    this.scene.remove(this.group);
    this.flowItems.forEach(item => {
      item.tubeMesh.geometry.dispose();
      item.tubeMat.dispose();
      item.lineMesh.geometry.dispose();
      (item.lineMesh.material as THREE.Material).dispose();
      item.beads.forEach(b => {
        b.geometry.dispose();
        (b.material as THREE.Material).dispose();
      });
      item.arrows.forEach(a => {
        a.geometry.dispose();
        (a.material as THREE.Material).dispose();
      });
    });
    this.flowItems = [];
  }
}
