import * as THREE from 'three';
import { MeasurementPoint, MeasurementResult } from '../types';

export class MeasurementTool {
  public group: THREE.Group;
  private pointA: MeasurementPoint | null = null;
  private pointB: MeasurementPoint | null = null;
  private markerA?: THREE.Mesh;
  private markerB?: THREE.Mesh;
  private dimensionLine?: THREE.Line;
  public onMeasurementChange?: (res: MeasurementResult | null) => void;

  constructor(private scene: THREE.Scene) {
    this.group = new THREE.Group();
    this.group.name = 'MEASUREMENT_TOOL_ROOT';
    this.scene.add(this.group);
  }

  public handlePointClick(point: THREE.Vector3, label?: string): MeasurementResult | null {
    if (!this.pointA) {
      // First point selected
      this.pointA = { x: point.x, y: point.y, z: point.z, label };
      this.createMarker('A', point);
      this.clearMarker('B');
      this.clearLine();
      if (this.onMeasurementChange) this.onMeasurementChange(null);
      return null;
    } else {
      // Second point selected
      this.pointB = { x: point.x, y: point.y, z: point.z, label };
      this.createMarker('B', point);
      this.drawDimensionLine();

      const dx = this.pointB.x - this.pointA.x;
      const dy = this.pointB.y - this.pointA.y;
      const dz = this.pointB.z - this.pointA.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const result: MeasurementResult = {
        pointA: this.pointA,
        pointB: this.pointB,
        distanceMeters: Math.round(dist * 10) / 10,
        deltaX: Math.round(Math.abs(dx) * 10) / 10,
        deltaY: Math.round(Math.abs(dy) * 10) / 10,
        deltaZ: Math.round(Math.abs(dz) * 10) / 10,
      };

      if (this.onMeasurementChange) this.onMeasurementChange(result);
      return result;
    }
  }

  private createMarker(type: 'A' | 'B', pt: THREE.Vector3): void {
    const mat = new THREE.MeshBasicMaterial({
      color: type === 'A' ? 0x22D3EE : 0xF59E0B,
    });

    const pin = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 16),
      mat
    );
    pin.position.copy(pt);
    this.group.add(pin);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.4, 0.55, 24),
      mat
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(pt.x, pt.y + 0.02, pt.z);
    this.group.add(ring);

    if (type === 'A') {
      this.clearMarker('A');
      this.markerA = pin;
    } else {
      this.clearMarker('B');
      this.markerB = pin;
    }
  }

  private drawDimensionLine(): void {
    if (!this.pointA || !this.pointB) return;
    this.clearLine();

    const points = [
      new THREE.Vector3(this.pointA.x, this.pointA.y, this.pointA.z),
      new THREE.Vector3(this.pointB.x, this.pointB.y, this.pointB.z),
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineDashedMaterial({
      color: 0x22D3EE,
      dashSize: 0.8,
      gapSize: 0.4,
      linewidth: 2,
    });
    this.dimensionLine = new THREE.Line(geo, mat);
    this.dimensionLine.computeLineDistances();
    this.group.add(this.dimensionLine);
  }

  public reset(): void {
    this.pointA = null;
    this.pointB = null;
    this.clearMarker('A');
    this.clearMarker('B');
    this.clearLine();
    if (this.onMeasurementChange) this.onMeasurementChange(null);
  }

  private clearMarker(type: 'A' | 'B'): void {
    if (type === 'A' && this.markerA) {
      this.group.remove(this.markerA);
      this.markerA.geometry.dispose();
      this.markerA = undefined;
    }
    if (type === 'B' && this.markerB) {
      this.group.remove(this.markerB);
      this.markerB.geometry.dispose();
      this.markerB = undefined;
    }
  }

  private clearLine(): void {
    if (this.dimensionLine) {
      this.group.remove(this.dimensionLine);
      this.dimensionLine.geometry.dispose();
      this.dimensionLine = undefined;
    }
  }

  public dispose(): void {
    this.reset();
    this.scene.remove(this.group);
  }
}
