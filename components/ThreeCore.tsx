/**
 * Three.js Core Module
 * 
 * Module centralisé pour gérer une seule instance de Three.js
 * et éviter les imports multiples qui causent des conflits.
 */

import * as THREE from 'three';

// Export centralisé de Three.js
export const ThreeCore = THREE;

// Types utilitaires
export type Vector3Tuple = [number, number, number];
export type ColorString = string;

// Helpers pour matériaux
export const createBasicMaterial = (color: ColorString, options: Partial<THREE.MeshBasicMaterialParameters> = {}) => {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    ...options
  });
};

export const createPhysicalMaterial = (color: ColorString, options: Partial<THREE.MeshPhysicalMaterialParameters> = {}) => {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    ...options
  });
};

// Helper pour fog
export const createFog = (color: number | string, near: number, far: number) => {
  return new THREE.Fog(color, near, far);
};

// Helper pour texture canvas
export const createCanvasTexture = (canvas: HTMLCanvasElement, options: Partial<THREE.CanvasTextureParameters> = {}) => {
  const texture = new THREE.CanvasTexture(canvas);
  Object.assign(texture, options);
  return texture;
};

// Helper pour calculs vectoriels
export const vector3Utils = {
  create: (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z),
  fromTuple: (tuple: Vector3Tuple) => new THREE.Vector3(...tuple),
  toTuple: (vector: THREE.Vector3): Vector3Tuple => [vector.x, vector.y, vector.z],
  distance: (a: THREE.Vector3, b: THREE.Vector3) => a.distanceTo(b),
  midpoint: (a: THREE.Vector3, b: THREE.Vector3) => {
    return new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  }
};

// Helper pour Object3D réutilisable
export const createReusableObject3D = () => new THREE.Object3D();

export default ThreeCore;