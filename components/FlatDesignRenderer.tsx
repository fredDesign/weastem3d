import { useRef, useEffect, useState, useMemo } from 'react';
import { useThree } from '@react-three/fiber';

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
  const lightingConfig = useMemo(() => ({
    ambient: {
      intensity: config.enableFlatDesign ? config.flatAmbientIntensity : 0.4,
      color: '#ffffff'
    }
  }), [config.enableFlatDesign, config.flatAmbientIntensity]);

  useEffect(() => {
    // console.log('💡 Flat design lighting mode:', config.enableFlatDesign ? 'FLAT' : '3D');
  }, [config.enableFlatDesign]);

  return lightingConfig;
};

/**
 * Composant pour le rendu des lumières flat design
 */
export const FlatDesignLights: React.FC<{ config: FlatDesignConfig }> = ({ config }) => {
  const lightingConfig = useFlatDesignLighting(config);

  return (
    <>
      {/* Éclairage 3D complet avec ombres et relief */}
      <ambientLight 
        intensity={lightingConfig.ambient.intensity} 
        color={lightingConfig.ambient.color} 
      />
      
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
      // console.log('🎨 Flat design mode toggled:', newValue ? 'ENABLED' : 'DISABLED');
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
  FlatDesignLights,
  useFlatDesignToggle,
  DEFAULT_FLAT_DESIGN_CONFIG
};