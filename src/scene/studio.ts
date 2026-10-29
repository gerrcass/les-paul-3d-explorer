import {
  AdditiveBlending,
  DirectionalLight,
  FogExp2,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PCFShadowMap,
  PlaneGeometry,
  PMREMGenerator,
  RectAreaLight,
  Scene,
  Vector3,
  type WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { GuitarTextures } from './textures';
import type { QualityTier } from './quality';

export interface Studio {
  readonly group: Group;
  readonly keyLight: DirectionalLight;
  readonly setShadowQuality: (size: number) => void;
  readonly dispose: () => void;
}

export function createStudio(
  scene: Scene,
  renderer: WebGLRenderer,
  textures: GuitarTextures,
  tier: QualityTier,
): Studio {
  scene.fog = new FogExp2(0x080706, 0.0035);

  const group = new Group();
  group.name = 'studio';

  const keyLight = new DirectionalLight(0xffeed6, 1.85);
  keyLight.position.set(24, 25, 16);
  keyLight.target.position.set(0, 9, 0);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(tier === 'high' ? 2048 : tier === 'balanced' ? 1024 : 512, tier === 'high' ? 2048 : tier === 'balanced' ? 1024 : 512);
  keyLight.shadow.camera.left = -20;
  keyLight.shadow.camera.right = 20;
  keyLight.shadow.camera.top = 28;
  keyLight.shadow.camera.bottom = -18;
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 90;
  keyLight.shadow.bias = -0.0003;
  keyLight.shadow.normalBias = 0.025;
  group.add(keyLight, keyLight.target);

  const fillLight = new DirectionalLight(0x9db9ff, 0.42);
  fillLight.position.set(-18, 8, 16);
  group.add(fillLight);

  const rimLight = new DirectionalLight(0xffb877, 1.05);
  rimLight.position.set(-4, 16, -18);
  group.add(rimLight);

  const topLight = new DirectionalLight(0xfff4e2, 0.32);
  topLight.position.set(2, 28, 2);
  group.add(topLight);

  const hemi = new HemisphereLight(0x5a4c3c, 0x080706, 0.4);
  group.add(hemi);

  const frontFill = new DirectionalLight(0xffd9b0, 0.3);
  frontFill.position.set(-14, 6, 22);
  group.add(frontFill);

  const rearFill = new DirectionalLight(0xffc49a, 0.55);
  rearFill.position.set(-8, 5, -24);
  group.add(rearFill);

  const floor = new Mesh(
    new PlaneGeometry(80, 80),
    new MeshStandardMaterial({
      map: textures.floor,
      transparent: true,
      roughness: 0.58,
      metalness: 0.12,
      depthWrite: false,
      envMapIntensity: 0.45,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -8.96;
  floor.receiveShadow = true;
  floor.name = 'studio-floor';
  group.add(floor);

  const contact = new Mesh(
    new PlaneGeometry(16, 5.5),
    new MeshBasicMaterial({
      map: textures.contactShadow,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.set(0, -8.94, 0.2);
  group.add(contact);

  const glow = new Mesh(
    new PlaneGeometry(38, 48),
    new MeshBasicMaterial({
      map: textures.glow,
      transparent: true,
      opacity: 0.5,
      blending: AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  glow.position.set(0, 12.5, -16);
  group.add(glow);

  scene.add(group);

  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04).texture;
  pmrem.dispose();
  room.dispose();
  scene.environment = env;
  scene.environmentIntensity = 0.42;

  if (tier !== 'lite') {
    void import('three/addons/lights/RectAreaLightUniformsLib.js').then(({ RectAreaLightUniformsLib }) => {
      RectAreaLightUniformsLib.init();
      const softbox = new RectAreaLight(0xfff1dc, 2.4, 20, 30);
      softbox.position.set(-24, 16, 30);
      softbox.lookAt(0, 5, 0);
      group.add(softbox);
    });
  }

  renderer.shadowMap.type = PCFShadowMap;
  renderer.shadowMap.enabled = true;

  const setShadowQuality = (size: number): void => {
    if (keyLight.shadow.mapSize.x === size) return;
    keyLight.shadow.mapSize.set(size, size);
    keyLight.shadow.map?.dispose();
    keyLight.shadow.map = null;
  };

  const dispose = (): void => {
    scene.remove(group);
    floor.geometry.dispose();
    floor.material.dispose();
    contact.geometry.dispose();
    contact.material.dispose();
    glow.geometry.dispose();
    glow.material.dispose();
    env.dispose();
  };

  return { group, keyLight, setShadowQuality, dispose };
}


export function studioTarget(): Vector3 {
  return new Vector3(0, 10.5, 0);
}
