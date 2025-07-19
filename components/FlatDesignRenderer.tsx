import { useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { createFog } from './ThreeCore';

/**
 * Flat Design Renderer Module
 * 
 * Ce module gère le rendu flat design pour la visualisation réseau :
 * - Suppression des ombres et dégradés
 * - Matériaux basiques sans relief ni profondeur
 * - Conservation des formes géométriques et couleurs
 * - Maintien des effets de transparence
 */

// Interface pour les propriétés du flat design
export interface FlatDesignConfig {
  enableFlatDesign: boolean;
  preserveTransparency: boolean;
  flatAmbientIntensity: number;
  removeFog: boolean;
}

// Configuration par défaut du flat design
export const DEFAULT_FLAT_DESIGN_CONFIG: FlatDesignConfig = {
  enableFlatDesign: false,
  preserveTransparency: true,
  flatAmbientIntensity: 1.0, // Éclairage uniforme
  removeFog: true, // Pas de brouillard pour éviter la profondeur
};

/**
 * Hook pour configurer l'éclairage flat design
 * Remplace l'éclairage complexe par un éclairage uniforme
 */
export const useFlatDesignLighting = (config: FlatDesignConfig) => {
  const lightingConfig = useRef({
    ambient: {
      intensity: config.enableFlatDesign ? config.flatAmbientIntensity : 0.4,
      color: '#ffffff'
    },
    directional: config.enableFlatDesign ? [] : [
      { intensity: 5, position: [-2, 2, 3.5] as [number, number, number] },
      { intensity: 1.2, position: [10, 10, 8] as [number, number, number], color: '#ffffff' },
      { intensity: 0.6, position: [-5, -5, -5] as [number, number, number], color: '#94a3b8' }
    ],
    point: config.enableFlatDesign ? [] : [
      { intensity: 0.5, position: [0, 5, 10] as [number, number, number], color: '#e2e8f0' },
      { intensity: 0.4, position: [8, -3, 5] as [number, number, number], color: '#60a5fa' },
      { intensity: 0.3, position: [-8, 3, -5] as [number, number, number], color: '#f8fafc' }
    ]
  });

  useEffect(() => {
    console.log('💡 Flat design lighting mode:', config.enableFlatDesign ? 'FLAT' : '3D');
  }, [config.enableFlatDesign]);

  return lightingConfig.current;
};

/**
 * Hook pour configurer le brouillard (fog) selon le mode
 */
export const useFlatDesignFog = (config: FlatDesignConfig) => {
  const { scene } = useThree();

  useEffect(() => {
    if (!scene) return;

    if (config.enableFlatDesign && config.removeFog) {
      console.log('🌫️ Removing fog for flat design mode');
      scene.fog = null;
    } else {
      console.log('🌫️ Adding fog for 3D depth effect');
      // Utilise le module centralisé pour créer le fog
      scene.fog = createFog(0xf1f5f9, 12, 30);
    }
  }, [scene, config.enableFlatDesign, config.removeFog]);
};

/**
 * Composant pour le rendu des lumières flat design
 */
export const FlatDesignLights: React.FC<{ config: FlatDesignConfig }> = ({ config }) => {
  const lightingConfig = useFlatDesignLighting(config);

  if (config.enableFlatDesign) {
    return (
      <>
        {/* Éclairage uniforme pour flat design - pas d'ombres */}
        <ambientLight 
          intensity={lightingConfig.ambient.intensity} 
          color={lightingConfig.ambient.color} 
        />
        {/* Pas de lumières directionnelles ou ponctuelles en mode flat */}
      </>
    );
  }

  return (
    <>
      {/* Éclairage 3D complet avec ombres et relief */}
      <ambientLight 
        intensity={lightingConfig.ambient.intensity} 
        color={lightingConfig.ambient.color} 
      />
      
      {lightingConfig.directional.map((light, index) => (
        <directionalLight
          key={`directional-${index}`}
          intensity={light.intensity}
          position={light.position}
          color={light.color}
          castShadow={false}
        />
      ))}

      {lightingConfig.point.map((light, index) => (
        <pointLight
          key={`point-${index}`}
          position={light.position}
          intensity={light.intensity}
          color={light.color}
        />
      ))}
    </>
  );
};

/**
 * Hook utilitaire pour basculer entre les modes de rendu
 */
export const useFlatDesignToggle = (initialState: boolean = false) => {
  const [enableFlatDesign, setEnableFlatDesign] = useState(initialState);

  const toggleFlatDesign = () => {
    setEnableFlatDesign(prev => {
      const newValue = !prev;
      console.log('🎨 Flat design mode toggled:', newValue ? 'ENABLED' : 'DISABLED');
      return newValue;
    });
  };

  return {
    enableFlatDesign,
    toggleFlatDesign,
    setEnableFlatDesign
  };
};

export default {
  useFlatDesignLighting,
  useFlatDesignFog,
  FlatDesignLights,
  useFlatDesignToggle,
  DEFAULT_FLAT_DESIGN_CONFIG
};