import * as THREE from 'three';
import { SystemFlowEdge } from '../types';

export class DependencyFlowOverlay {
  public group: THREE.Group;
  private flowLines: Array<{
    mesh: THREE.Line;
    curve: THREE.CatmullRomCurve3;
    edge: SystemFlowEdge;
    material: THREE.LineDashedMaterial;
  }> = [];

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
        points: [[36, 2.6, -26], [20, 2.0, -22], [-10, 2.0, -18], [-28, 2.0, -14], [-41, 2.0, -14]],
      },
      {
        id: 'flow_gen01_pdb',
        sourceAssetId: 'bh_gen_01',
        targetAssetId: 'bh_pdb_01',
        type: 'POWER',
        color: '#22D3EE', // Electric Cyan
        flowSpeed: 2.0,
        points: [[-41, 2.0, -14], [-38, 2.0, -12], [-36, 2.0, -9.4]],
      },
      {
        id: 'flow_solar_pdb',
        sourceAssetId: 'bh_solar_01',
        targetAssetId: 'bh_pdb_01',
        type: 'POWER',
        color: '#FACC15', // Yellow
        flowSpeed: 1.5,
        points: [[0, 13.8, 0], [-15, 8.0, -5], [-36, 2.0, -9.4]],
      },
      {
        id: 'flow_bess_pdb',
        sourceAssetId: 'bh_bess_01',
        targetAssetId: 'bh_pdb_01',
        type: 'POWER',
        color: '#38BDF8', // Sky Blue
        flowSpeed: 1.6,
        points: [[-41, 2.0, -9.4], [-36, 2.0, -9.4]],
      },
      {
        id: 'flow_pdb_hvac',
        sourceAssetId: 'bh_pdb_01',
        targetAssetId: 'bh_hvac_01',
        type: 'HEATING',
        color: '#FB923C', // Warm Orange
        flowSpeed: 1.4,
        points: [[-36, 2.0, -9.4], [-24, 6.0, -4], [-10, 14.4, 0]],
      },
      {
        id: 'flow_pdb_water',
        sourceAssetId: 'bh_pdb_01',
        targetAssetId: 'bh_water_01',
        type: 'WATER',
        color: '#0EA5E9', // Water Blue
        flowSpeed: 1.5,
        points: [[-36, 2.0, -9.4], [-18, 2.0, -16], [0, 2.0, -20], [12, 2.0, -24]],
      },
      {
        id: 'flow_pdb_comms',
        sourceAssetId: 'bh_pdb_01',
        targetAssetId: 'bh_comms_01',
        type: 'COMMS',
        color: '#A855F7', // Violet
        flowSpeed: 1.8,
        points: [[-36, 2.0, -9.4], [-10, 2.5, 6], [12, 4.0, 16], [32, 11.2, 24]],
      },
      {
        id: 'flow_pdb_lab',
        sourceAssetId: 'bh_pdb_01',
        targetAssetId: 'bh_lab_01',
        type: 'POWER',
        color: '#10B981', // Emerald
        flowSpeed: 1.3,
        points: [[-36, 2.0, -9.4], [-24, 2.5, 6], [-12, 4.0, 20]],
      },
    ] : [
      {
        id: 'flow_ma_fuel_gen',
        sourceAssetId: 'ma_fuel_tank_01',
        targetAssetId: 'ma_gen_01',
        type: 'FUEL',
        color: '#F59E0B',
        flowSpeed: 1.2,
        points: [[-18, 2.0, 10], [-18, 2.0, 0], [-21, 2.0, -8]],
      },
      {
        id: 'flow_ma_fuel_boiler',
        sourceAssetId: 'ma_fuel_tank_01',
        targetAssetId: 'ma_boiler_01',
        type: 'FUEL',
        color: '#F59E0B',
        flowSpeed: 1.2,
        points: [[-18, 2.0, 10], [-13, 2.0, 9], [-8, 2.0, 8]],
      },
      {
        id: 'flow_ma_gen_pdb',
        sourceAssetId: 'ma_gen_01',
        targetAssetId: 'ma_pdb_01',
        type: 'POWER',
        color: '#22D3EE',
        flowSpeed: 2.0,
        points: [[-21, 2.0, -8], [-10, 2.0, -4], [-2, 2.0, 0]],
      },
      {
        id: 'flow_ma_wind_pdb',
        sourceAssetId: 'ma_wind_01',
        targetAssetId: 'ma_pdb_01',
        type: 'POWER',
        color: '#38BDF8',
        flowSpeed: 1.5,
        points: [[16, 5.0, -16], [8, 3.0, -8], [-2, 2.0, 0]],
      },
      {
        id: 'flow_ma_pdb_boiler',
        sourceAssetId: 'ma_pdb_01',
        targetAssetId: 'ma_boiler_01',
        type: 'HEATING',
        color: '#FB923C',
        flowSpeed: 1.5,
        points: [[-2, 2.0, 0], [-5, 2.0, 4], [-8, 2.0, 8]],
      },
      {
        id: 'flow_ma_pdb_pump',
        sourceAssetId: 'ma_pdb_01',
        targetAssetId: 'ma_water_pump_01',
        type: 'POWER',
        color: '#0EA5E9',
        flowSpeed: 1.8,
        points: [[-2, 2.0, 0], [8, 1.8, 4], [18, 1.5, 8]],
      },
      {
        id: 'flow_ma_pump_reservoir',
        sourceAssetId: 'ma_water_pump_01',
        targetAssetId: 'ma_water_tank_01',
        type: 'WATER',
        color: '#38BDF8',
        flowSpeed: 1.4,
        points: [[18, 1.5, 8], [13, 1.8, 7], [8, 2.0, 6]],
      },
      {
        id: 'flow_ma_pdb_comms',
        sourceAssetId: 'ma_pdb_01',
        targetAssetId: 'ma_comms_01',
        type: 'COMMS',
        color: '#A855F7',
        flowSpeed: 1.7,
        points: [[-2, 2.0, 0], [5, 2.5, -3], [12, 3.0, -6]],
      },
    ];

    edges.forEach(edge => {
      const curvePoints = edge.points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineDashedMaterial({
        color: new THREE.Color(edge.color),
        dashSize: 1.2,
        gapSize: 0.6,
        linewidth: 2,
        transparent: true,
        opacity: 0.85,
      });

      const line = new THREE.Line(geometry, material);
      line.computeLineDistances();
      this.group.add(line);

      this.flowLines.push({
        mesh: line,
        curve,
        edge,
        material,
      });
    });
  }

  public updateAnimation(deltaSeconds: number, failedAssetIds: string[] = []): void {
    this.flowLines.forEach(item => {
      const isSourceFailed = failedAssetIds.includes(item.edge.sourceAssetId);
      const isTargetFailed = failedAssetIds.includes(item.edge.targetAssetId);

      if (isSourceFailed) {
        // Starved or tripped branch: turned red / halted
        item.material.color.setHex(0xEF4444);
        item.material.dashSize = 0.4;
        item.material.gapSize = 1.0;
        item.material.opacity = 0.5;
      } else {
        item.material.color.set(item.edge.color);
        item.material.dashSize = 1.2;
        item.material.gapSize = 0.6;
        item.material.opacity = 0.85;

        // Animate pulse along the line
        const dashOffset = (item.material as any).dashOffset || 0;
        (item.material as any).dashOffset = dashOffset - item.edge.flowSpeed * deltaSeconds * 2.5;
      }
    });
  }

  public setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  public dispose(): void {
    this.scene.remove(this.group);
    this.flowLines.forEach(f => {
      f.mesh.geometry.dispose();
      f.material.dispose();
    });
    this.flowLines = [];
  }
}
