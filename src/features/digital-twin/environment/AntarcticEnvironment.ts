import * as THREE from 'three';
import { PolarMaterialLibrary } from '../materials/polarMaterials';
import { LightingViewMode } from '../types';

export class AntarcticEnvironment {
  public group: THREE.Group;
  public terrainMesh!: THREE.Mesh;
  public iceMesh?: THREE.Mesh;
  public gridHelper!: THREE.GridHelper;
  public snowParticles?: THREE.Points;
  public humanScaleAvatar?: THREE.Group;
  private hemiLight!: THREE.HemisphereLight;
  private sunLight!: THREE.DirectionalLight;
  private rimLight!: THREE.DirectionalLight;
  private coreLight!: THREE.PointLight;
  private particlePositions?: Float32Array;
  private particleVelocities?: Float32Array;
  private nunatakMat?: THREE.MeshStandardMaterial;
  private currentLightingMode: LightingViewMode = 'OPERATIONAL';
  private isCurrentDark: boolean = true;

  constructor(
    private scene: THREE.Scene,
    private materials: PolarMaterialLibrary,
    private stationId: string
  ) {
    this.group = new THREE.Group();
    this.group.name = 'ANTARCTIC_ENVIRONMENT';
    this.setupLighting();
    this.buildTerrain();
    this.buildHorizonFeatures();
    this.buildSnowfallSystem();
    this.buildHumanScaleAvatar();
    this.scene.add(this.group);
  }

  private setupLighting(): void {
    // 1. Atmosphere / Fog: Cold Antarctic atmospheric scattering
    this.scene.background = new THREE.Color(0x060E1A);
    this.scene.fog = new THREE.FogExp2(0x060E1A, 0.0075);

    // 2. Ambient Hemisphere Light: Cold crisp sky and deep permafrost ground
    this.hemiLight = new THREE.HemisphereLight(0xBAE6FD, 0x0F172A, 0.85);
    this.hemiLight.position.set(0, 50, 0);
    this.group.add(this.hemiLight);

    // 3. Key Light: Low-angle Antarctic Sun (Larsemann / Schirmacher latitude ~70°S)
    this.sunLight = new THREE.DirectionalLight(0xFFF7ED, 1.5);
    this.sunLight.position.set(45, 32, 28);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 5;
    this.sunLight.shadow.camera.far = 160;
    this.sunLight.shadow.camera.left = -45;
    this.sunLight.shadow.camera.right = 45;
    this.sunLight.shadow.camera.top = 45;
    this.sunLight.shadow.camera.bottom = -45;
    this.sunLight.shadow.bias = -0.0004;
    this.group.add(this.sunLight);

    // 4. Subtle Rim / Backlight for structural depth
    this.rimLight = new THREE.DirectionalLight(0x38BDF8, 0.55);
    this.rimLight.position.set(-35, 20, -35);
    this.group.add(this.rimLight);

    // 5. Localized Warm Mission Lighting for station operational core
    this.coreLight = new THREE.PointLight(0xFDE68A, 0.6, 50, 1.2);
    this.coreLight.position.set(0, 8, 0);
    this.group.add(this.coreLight);
  }

  private buildTerrain(): void {
    const isBharati = this.stationId === 'station_bharati';

    if (isBharati) {
      // Bharati: Coastal Larsemann Hills promontory with sastrugi wind ripples & sea ice slope
      const terrainGeo = new THREE.PlaneGeometry(180, 180, 72, 72);
      const pos = terrainGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        // Sastrugi wave patterns oriented along prevailing katabatic wind (NE to SW)
        const sastrugi = Math.sin(vx * 0.12 + vy * 0.18) * 0.45 + Math.cos(vx * 0.06 - vy * 0.08) * 0.65;
        // Central plateau for station stability
        const distFromCenter = Math.sqrt(vx * vx + vy * vy);
        const flattenFactor = Math.max(0, Math.min(1, (distFromCenter - 25) / 45));
        // Slope down towards northern sea ice shelf
        const coastalSlope = vy > 25 ? (vy - 25) * -0.06 : 0;
        pos.setZ(i, (sastrugi * flattenFactor) + coastalSlope);
      }
      terrainGeo.computeVertexNormals();

      this.terrainMesh = new THREE.Mesh(terrainGeo, this.materials.snowTerrain);
      this.terrainMesh.rotation.x = -Math.PI / 2;
      this.terrainMesh.position.y = -0.05;
      this.terrainMesh.receiveShadow = true;
      this.group.add(this.terrainMesh);

      // Sea Ice Shelf patch to the North
      const iceGeo = new THREE.PlaneGeometry(160, 45, 16, 16);
      this.iceMesh = new THREE.Mesh(iceGeo, this.materials.iceSurface);
      this.iceMesh.rotation.x = -Math.PI / 2;
      this.iceMesh.position.set(0, -0.6, 55);
      this.iceMesh.receiveShadow = true;
      this.group.add(this.iceMesh);

    } else {
      // Maitri: Schirmacher Oasis rocky permafrost terrain & Lake Priyadarshini
      const terrainGeo = new THREE.PlaneGeometry(180, 180, 72, 72);
      const pos = terrainGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        // Moraine rocky knolls
        const moraine = Math.sin(vx * 0.09) * Math.cos(vy * 0.09) * 0.85 + Math.sin(vx * 0.2) * 0.3;
        const distFromCenter = Math.sqrt(vx * vx + vy * vy);
        const flattenFactor = Math.max(0, Math.min(1, (distFromCenter - 22) / 40));
        // Lake depression towards the South-East
        const lakeDepression = (vx > 5 && vy > -10 && vy < 35) ? -0.8 : 0;
        pos.setZ(i, (moraine * flattenFactor) + lakeDepression);
      }
      terrainGeo.computeVertexNormals();

      this.terrainMesh = new THREE.Mesh(terrainGeo, this.materials.moraineRock);
      this.terrainMesh.rotation.x = -Math.PI / 2;
      this.terrainMesh.position.y = -0.05;
      this.terrainMesh.receiveShadow = true;
      this.group.add(this.terrainMesh);

      // Lake Priyadarshini water & ice surface
      const lakeGeo = new THREE.CircleGeometry(26, 32);
      this.iceMesh = new THREE.Mesh(lakeGeo, this.materials.lakePriyadarshini);
      this.iceMesh.rotation.x = -Math.PI / 2;
      this.iceMesh.position.set(22, 0.02, 12);
      this.iceMesh.receiveShadow = true;
      this.group.add(this.iceMesh);
    }

    // Engineering Ground Coordinate Grid Helper
    this.gridHelper = new THREE.GridHelper(120, 24, 0x22D3EE, 0x1E293B);
    this.gridHelper.position.y = 0.05;
    (this.gridHelper.material as THREE.Material).transparent = true;
    (this.gridHelper.material as THREE.Material).opacity = 0.35;
    this.group.add(this.gridHelper);
  }

  private buildHorizonFeatures(): void {
    // Distant nunataks & ice shelf cliffs around the perimeter (eliminates black void)
    const horizonGroup = new THREE.Group();
    this.nunatakMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B,
      roughness: 0.95,
      metalness: 0.1,
    });

    const nunatakCoords = [
      { x: -75, z: -70, radius: 18, height: 14 },
      { x: 20, z: -80, radius: 24, height: 18 },
      { x: 80, z: -40, radius: 20, height: 15 },
      { x: -80, z: 30, radius: 22, height: 12 },
      { x: 70, z: 65, radius: 25, height: 10 },
    ];

    nunatakCoords.forEach(c => {
      const geo = new THREE.ConeGeometry(c.radius, c.height, 7);
      const mesh = new THREE.Mesh(geo, this.nunatakMat);
      mesh.position.set(c.x, c.height / 2 - 3, c.z);
      mesh.rotation.y = Math.random() * Math.PI;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      horizonGroup.add(mesh);
    });

    this.group.add(horizonGroup);
  }

  private buildSnowfallSystem(): void {
    // 1,200 gentle snow particles with wind drift
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(particleCount * 3);
    this.particleVelocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      this.particlePositions[i * 3] = (Math.random() - 0.5) * 140;
      this.particlePositions[i * 3 + 1] = Math.random() * 40;
      this.particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 140;

      // Katabatic wind angle: downward with southward drift
      this.particleVelocities[i * 3] = -0.06 - Math.random() * 0.08;
      this.particleVelocities[i * 3 + 1] = -0.08 - Math.random() * 0.12;
      this.particleVelocities[i * 3 + 2] = 0.04 + Math.random() * 0.06;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xE2EEF8,
      size: 0.35,
      transparent: true,
      opacity: 0.65,
    });

    this.snowParticles = new THREE.Points(geometry, particleMat);
    this.group.add(this.snowParticles);
  }

  private buildHumanScaleAvatar(): void {
    // 1.8m technical surveyor silhouette for scale comprehension
    this.humanScaleAvatar = new THREE.Group();
    this.humanScaleAvatar.name = 'HUMAN_SCALE_REFERENCE';

    const avatarMat = new THREE.MeshStandardMaterial({
      color: 0x38BDF8,
      metalness: 0.3,
      roughness: 0.5,
      emissive: new THREE.Color(0x0284C7),
      emissiveIntensity: 0.3,
    });

    // Body
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.9, 12), avatarMat);
    torso.position.y = 1.05;
    this.humanScaleAvatar.add(torso);

    // Head / Polar Helmet
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), avatarMat);
    head.position.y = 1.65;
    this.humanScaleAvatar.add(head);

    // Legs
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8), avatarMat);
    legL.position.set(-0.1, 0.3, 0);
    this.humanScaleAvatar.add(legL);

    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8), avatarMat);
    legR.position.set(0.1, 0.3, 0);
    this.humanScaleAvatar.add(legR);

    // Stand base with 1.8m measurement marker
    const baseRing = new THREE.Mesh(
      new THREE.RingGeometry(0.35, 0.45, 24),
      new THREE.MeshBasicMaterial({ color: 0x22D3EE, side: THREE.DoubleSide })
    );
    baseRing.rotation.x = -Math.PI / 2;
    baseRing.position.y = 0.02;
    this.humanScaleAvatar.add(baseRing);

    // Place beside the entrance gantry
    this.humanScaleAvatar.position.set(4, 0, 7);
    this.humanScaleAvatar.visible = false; // Hidden by default, toggled via toolbar
    this.group.add(this.humanScaleAvatar);
  }

  public updateAnimation(deltaSeconds: number): void {
    if (!this.snowParticles || !this.particlePositions || !this.particleVelocities) return;

    const pos = this.particlePositions;
    const vel = this.particleVelocities;
    const count = pos.length / 3;
    const speedMult = this.currentLightingMode === 'WEATHER' ? 3.4 : 1.0;

    for (let i = 0; i < count; i++) {
      pos[i * 3] += vel[i * 3] * speedMult;
      pos[i * 3 + 1] += vel[i * 3 + 1] * speedMult;
      pos[i * 3 + 2] += vel[i * 3 + 2] * speedMult;

      // Recycle snow particles that reach ground level or drift past bounds
      if (pos[i * 3 + 1] < 0 || pos[i * 3] < -70 || pos[i * 3 + 2] > 70) {
        pos[i * 3] = (Math.random() - 0.5) * 140;
        pos[i * 3 + 1] = 35 + Math.random() * 10;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 140;
      }
    }

    this.snowParticles.geometry.attributes.position.needsUpdate = true;
  }

  public setGridVisible(visible: boolean): void {
    if (this.gridHelper) this.gridHelper.visible = visible;
  }

  public setSnowVisible(visible: boolean): void {
    if (this.snowParticles) this.snowParticles.visible = visible;
  }

  public setHumanScaleVisible(visible: boolean): void {
    if (this.humanScaleAvatar) this.humanScaleAvatar.visible = visible;
  }

  public setLightingViewMode(mode: LightingViewMode): void {
    this.currentLightingMode = mode;
    this.applyLightingConfiguration();
  }

  public updateTheme(isDark: boolean): void {
    this.isCurrentDark = isDark;
    const currentGridVisible = this.gridHelper ? this.gridHelper.visible : true;
    if (this.gridHelper) {
      this.group.remove(this.gridHelper);
      this.gridHelper.geometry.dispose();
    }
    const centerColor = isDark ? 0x22D3EE : 0x0284C7;
    const gridColor = isDark ? 0x1E293B : 0x94A3B8;
    this.gridHelper = new THREE.GridHelper(120, 24, centerColor, gridColor);
    this.gridHelper.position.y = 0.05;
    (this.gridHelper.material as THREE.Material).transparent = true;
    (this.gridHelper.material as THREE.Material).opacity = isDark ? 0.35 : 0.45;
    this.gridHelper.visible = currentGridVisible;
    this.group.add(this.gridHelper);

    this.applyLightingConfiguration();

    if (this.nunatakMat) {
      this.nunatakMat.color.setHex(isDark ? 0x1E293B : 0x475569);
    }
    if (this.materials.snowTerrain) {
      this.materials.snowTerrain.color.setHex(isDark ? 0xE2EEF8 : 0xF8FAFC);
    }
    if (this.materials.wireframeEngineering) {
      this.materials.wireframeEngineering.color.setHex(isDark ? 0x06B6D4 : 0x0284C7);
    }
  }

  private applyLightingConfiguration(): void {
    const isDark = this.isCurrentDark;

    switch (this.currentLightingMode) {
      case 'OPERATIONAL': {
        if (isDark) {
          this.scene.background = new THREE.Color(0x060E1A);
          if (this.scene.fog instanceof THREE.FogExp2) {
            this.scene.fog.color.setHex(0x060E1A);
            this.scene.fog.density = 0.0075;
          }
          if (this.hemiLight) {
            this.hemiLight.color.setHex(0xBAE6FD);
            this.hemiLight.groundColor.setHex(0x0F172A);
            this.hemiLight.intensity = 0.85;
          }
          if (this.sunLight) {
            this.sunLight.color.setHex(0xFFF7ED);
            this.sunLight.intensity = 1.5;
          }
          if (this.rimLight) {
            this.rimLight.color.setHex(0x38BDF8);
            this.rimLight.intensity = 0.55;
          }
          if (this.coreLight) {
            this.coreLight.intensity = 0.6;
          }
        } else {
          this.scene.background = new THREE.Color(0xD9E6F2);
          if (this.scene.fog instanceof THREE.FogExp2) {
            this.scene.fog.color.setHex(0xD9E6F2);
            this.scene.fog.density = 0.0065;
          }
          if (this.hemiLight) {
            this.hemiLight.color.setHex(0xFFFFFF);
            this.hemiLight.groundColor.setHex(0xC3D5E8);
            this.hemiLight.intensity = 1.25;
          }
          if (this.sunLight) {
            this.sunLight.color.setHex(0xFFFFFF);
            this.sunLight.intensity = 1.85;
          }
          if (this.rimLight) {
            this.rimLight.color.setHex(0x0284C7);
            this.rimLight.intensity = 0.4;
          }
          if (this.coreLight) {
            this.coreLight.intensity = 0.45;
          }
        }
        break;
      }

      case 'SCIENTIFIC': {
        const skyCol = isDark ? 0x0A131F : 0xEDF2F7;
        this.scene.background = new THREE.Color(skyCol);
        if (this.scene.fog instanceof THREE.FogExp2) {
          this.scene.fog.color.setHex(skyCol);
          this.scene.fog.density = 0.0020;
        }
        if (this.hemiLight) {
          this.hemiLight.color.setHex(0xFFFFFF);
          this.hemiLight.groundColor.setHex(isDark ? 0x1E293B : 0xCBD5E1);
          this.hemiLight.intensity = 1.5;
        }
        if (this.sunLight) {
          this.sunLight.color.setHex(0xF8FAFC);
          this.sunLight.intensity = 1.6;
        }
        if (this.rimLight) {
          this.rimLight.color.setHex(0x94A3B8);
          this.rimLight.intensity = 0.4;
        }
        if (this.coreLight) {
          this.coreLight.intensity = 0.4;
        }
        break;
      }

      case 'NIGHT': {
        const skyCol = 0x020813;
        this.scene.background = new THREE.Color(skyCol);
        if (this.scene.fog instanceof THREE.FogExp2) {
          this.scene.fog.color.setHex(skyCol);
          this.scene.fog.density = 0.0085;
        }
        if (this.hemiLight) {
          this.hemiLight.color.setHex(0x1E1B4B);
          this.hemiLight.groundColor.setHex(0x020617);
          this.hemiLight.intensity = 0.35;
        }
        if (this.sunLight) {
          this.sunLight.color.setHex(0x38BDF8);
          this.sunLight.intensity = 0.4;
        }
        if (this.rimLight) {
          this.rimLight.color.setHex(0x06B6D4);
          this.rimLight.intensity = 0.65;
        }
        if (this.coreLight) {
          this.coreLight.color.setHex(0xF59E0B);
          this.coreLight.intensity = 2.2;
        }
        break;
      }

      case 'WEATHER': {
        const skyCol = isDark ? 0x1E293B : 0x94A3B8;
        this.scene.background = new THREE.Color(skyCol);
        if (this.scene.fog instanceof THREE.FogExp2) {
          this.scene.fog.color.setHex(skyCol);
          this.scene.fog.density = 0.018;
        }
        if (this.hemiLight) {
          this.hemiLight.color.setHex(0x94A3B8);
          this.hemiLight.groundColor.setHex(0x334155);
          this.hemiLight.intensity = 0.7;
        }
        if (this.sunLight) {
          this.sunLight.color.setHex(0xE2E8F0);
          this.sunLight.intensity = 0.55;
        }
        if (this.rimLight) {
          this.rimLight.color.setHex(0x64748B);
          this.rimLight.intensity = 0.25;
        }
        if (this.coreLight) {
          this.coreLight.color.setHex(0xF59E0B);
          this.coreLight.intensity = 1.4;
        }
        break;
      }
    }
  }

  public dispose(): void {
    this.scene.remove(this.group);
    if (this.terrainMesh) this.terrainMesh.geometry.dispose();
    if (this.iceMesh) this.iceMesh.geometry.dispose();
    if (this.snowParticles) this.snowParticles.geometry.dispose();
    if (this.nunatakMat) this.nunatakMat.dispose();
  }
}
