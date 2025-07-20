import { useRef, useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { gsap } from "gsap";

// Camera control interface
export interface CameraControls {
  zoom: number;
  position: [number, number, number];
  targetPosition: [number, number, number];
  rotation: [number, number, number];
}

// Default camera controls
export const DEFAULT_CAMERA_CONTROLS: CameraControls = {
  zoom: 1,
  position: [0, 0.5, 10],
  targetPosition: [0, 0, 0],
  rotation: [0, 0, 0],
};

// Function to parse data attributes from the active network visualization container
export const parseDataAttributes = (): CameraControls => {
  // Chercher spécifiquement le conteneur avec l'attribut data-main-visualization
  // Cela permet de cibler avec précision la visualisation principale
  const container = document.querySelector('.network-visualization-container[data-main-visualization="true"]') as HTMLElement;
  const element = container || document.body;
  
  // Parse data attributes with fallback to defaults
  const zoom = parseFloat(element.dataset.cameraZoom || '1');
  const positionX = parseFloat(element.dataset.cameraPositionX || '0');
  const positionY = parseFloat(element.dataset.cameraPositionY || '0.5');
  const positionZ = parseFloat(element.dataset.cameraPositionZ || '10');
  const targetX = parseFloat(element.dataset.cameraTargetX || '0');
  const targetY = parseFloat(element.dataset.cameraTargetY || '0');
  const targetZ = parseFloat(element.dataset.cameraTargetZ || '0');
  const rotationX = parseFloat(element.dataset.cameraRotationX || '0');
  const rotationY = parseFloat(element.dataset.cameraRotationY || '0');
  const rotationZ = parseFloat(element.dataset.cameraRotationZ || '0');

  return {
    zoom: isNaN(zoom) ? DEFAULT_CAMERA_CONTROLS.zoom : zoom,
    position: [
      isNaN(positionX) ? DEFAULT_CAMERA_CONTROLS.position[0] : positionX,
      isNaN(positionY) ? DEFAULT_CAMERA_CONTROLS.position[1] : positionY,
      isNaN(positionZ) ? DEFAULT_CAMERA_CONTROLS.position[2] : positionZ,
    ],
    targetPosition: [
      isNaN(targetX) ? DEFAULT_CAMERA_CONTROLS.targetPosition[0] : targetX,
      isNaN(targetY) ? DEFAULT_CAMERA_CONTROLS.targetPosition[1] : targetY,
      isNaN(targetZ) ? DEFAULT_CAMERA_CONTROLS.targetPosition[2] : targetZ,
    ],
    rotation: [
      isNaN(rotationX) ? DEFAULT_CAMERA_CONTROLS.rotation[0] : rotationX,
      isNaN(rotationY) ? DEFAULT_CAMERA_CONTROLS.rotation[1] : rotationY,
      isNaN(rotationZ) ? DEFAULT_CAMERA_CONTROLS.rotation[2] : rotationZ,
    ],
  };
};

// Custom hook for camera controls with data-attribute management
export const useCameraControls = () => {
  const [currentCameraControls, setCurrentCameraControls] = useState<CameraControls>(DEFAULT_CAMERA_CONTROLS);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // GSAP animation objects for smooth transitions
  const cameraAnimationObject = useRef({
    zoom: DEFAULT_CAMERA_CONTROLS.zoom,
    positionX: DEFAULT_CAMERA_CONTROLS.position[0],
    positionY: DEFAULT_CAMERA_CONTROLS.position[1],
    positionZ: DEFAULT_CAMERA_CONTROLS.position[2],
    targetX: DEFAULT_CAMERA_CONTROLS.targetPosition[0],
    targetY: DEFAULT_CAMERA_CONTROLS.targetPosition[1],
    targetZ: DEFAULT_CAMERA_CONTROLS.targetPosition[2],
    rotationX: DEFAULT_CAMERA_CONTROLS.rotation[0],
    rotationY: DEFAULT_CAMERA_CONTROLS.rotation[1],
    rotationZ: DEFAULT_CAMERA_CONTROLS.rotation[2],
  });

  const cameraTransitionRef = useRef<gsap.core.Tween | null>(null);

  // Initialize GSAP object with current camera controls
  useEffect(() => {
    cameraAnimationObject.current.zoom = currentCameraControls.zoom;
    cameraAnimationObject.current.positionX = currentCameraControls.position[0];
    cameraAnimationObject.current.positionY = currentCameraControls.position[1];
    cameraAnimationObject.current.positionZ = currentCameraControls.position[2];
    cameraAnimationObject.current.targetX = currentCameraControls.targetPosition[0];
    cameraAnimationObject.current.targetY = currentCameraControls.targetPosition[1];
    cameraAnimationObject.current.targetZ = currentCameraControls.targetPosition[2];
    cameraAnimationObject.current.rotationX = currentCameraControls.rotation[0];
    cameraAnimationObject.current.rotationY = currentCameraControls.rotation[1];
    cameraAnimationObject.current.rotationZ = currentCameraControls.rotation[2];
  }, []);

  // Function to animate camera to new controls using GSAP
  const animateToControls = (newControls: CameraControls) => {
    // Set transitioning state to temporarily disable mouse influence
    setIsTransitioning(true);
    
    // Kill existing animation
    if (cameraTransitionRef.current) {
      cameraTransitionRef.current.kill();
    }

    // Animate to new values
    cameraTransitionRef.current = gsap.to(cameraAnimationObject.current, {
      duration: 1.5,
      ease: "power2.inOut",
      zoom: newControls.zoom,
      positionX: newControls.position[0],
      positionY: newControls.position[1],
      positionZ: newControls.position[2],
      targetX: newControls.targetPosition[0],
      targetY: newControls.targetPosition[1],
      targetZ: newControls.targetPosition[2],
      rotationX: newControls.rotation[0],
      rotationY: newControls.rotation[1],
      rotationZ: newControls.rotation[2],
      onUpdate: () => {
        // Update the current controls state
        setCurrentCameraControls({
          zoom: cameraAnimationObject.current.zoom,
          position: [
            cameraAnimationObject.current.positionX,
            cameraAnimationObject.current.positionY,
            cameraAnimationObject.current.positionZ,
          ],
          targetPosition: [
            cameraAnimationObject.current.targetX,
            cameraAnimationObject.current.targetY,
            cameraAnimationObject.current.targetZ,
          ],
          rotation: [
            cameraAnimationObject.current.rotationX,
            cameraAnimationObject.current.rotationY,
            cameraAnimationObject.current.rotationZ,
          ],
        });
      },
      onComplete: () => {
        setIsTransitioning(false); // Re-enable mouse influence
      }
    });
  };

  // Data attributes observer for camera control
  useEffect(() => {
    let lastCheckedControls = { ...currentCameraControls };
    
    const checkDataAttributes = () => {
      const newControls = parseDataAttributes();
      
      // Check if controls have changed with tolerance for floating point precision
      const tolerance = 0.001;
      const hasChanged = 
        Math.abs(newControls.zoom - lastCheckedControls.zoom) > tolerance ||
        Math.abs(newControls.position[0] - lastCheckedControls.position[0]) > tolerance ||
        Math.abs(newControls.position[1] - lastCheckedControls.position[1]) > tolerance ||
        Math.abs(newControls.position[2] - lastCheckedControls.position[2]) > tolerance ||
        Math.abs(newControls.targetPosition[0] - lastCheckedControls.targetPosition[0]) > tolerance ||
        Math.abs(newControls.targetPosition[1] - lastCheckedControls.targetPosition[1]) > tolerance ||
        Math.abs(newControls.targetPosition[2] - lastCheckedControls.targetPosition[2]) > tolerance ||
        Math.abs(newControls.rotation[0] - lastCheckedControls.rotation[0]) > tolerance ||
        Math.abs(newControls.rotation[1] - lastCheckedControls.rotation[1]) > tolerance ||
        Math.abs(newControls.rotation[2] - lastCheckedControls.rotation[2]) > tolerance;

      if (hasChanged) {
        lastCheckedControls = { ...newControls };
        animateToControls(newControls);
      }
    };

    // Initial check with delay to ensure DOM is ready
    const initialCheck = setTimeout(() => {
      checkDataAttributes();
    }, 100);

    // Create a MutationObserver to watch for data attribute changes
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            mutation.attributeName && 
            mutation.attributeName.startsWith('data-camera')) {
          shouldCheck = true;
        }
      });
      
      if (shouldCheck) {
        checkDataAttributes();
      }
    });

    // Get the specific container element with data-main-visualization attribute
    const container = document.querySelector('.network-visualization-container[data-main-visualization="true"]') as HTMLElement;
    const elementToObserve = container || document.body;

    // Start observing
    observer.observe(elementToObserve, {
      attributes: true,
      attributeFilter: [
        'data-camera-zoom',
        'data-camera-position-x',
        'data-camera-position-y',
        'data-camera-position-z',
        'data-camera-target-x',
        'data-camera-target-y',
        'data-camera-target-z',
        'data-camera-rotation-x',
        'data-camera-rotation-y',
        'data-camera-rotation-z',
      ],
    });

    return () => {
      clearTimeout(initialCheck);
      observer.disconnect();
      if (cameraTransitionRef.current) {
        cameraTransitionRef.current.kill();
      }
    };
  }, []);

  return {
    currentCameraControls,
    setCurrentCameraControls,
    animateToControls,
    isTransitioning,
  };
};

// Utility function to get optimized animation settings based on device performance
const getMouseAnimationSettings = (viewport: { width: number; height: number }) => {
  const isMobile = viewport.width < 768;
  
  if (isMobile) {
    return {
      duration: 0.8, // Slower on mobile for battery optimization
      ease: "power1.out",
      throttle: 32, // 30fps on mobile
    };
  }
  
  return {
    duration: 0.6, // Faster on desktop
    ease: "power2.out", 
    throttle: 16, // 60fps on desktop
  };
};

// Hook for applying camera controls in Three.js useFrame with smooth mouse movement
export const useApplyCameraControls = (
  controls: CameraControls,
  mousePosition: { normalizedX: number; normalizedY: number },
  viewport: { width: number; height: number },
  isTransitioning?: boolean
) => {
  const { camera } = useThree();
  
  // GSAP animation objects for smooth mouse influence
  const mouseInfluenceObject = useRef({
    tiltHorizontal: 0,
    tiltVertical: 0,
    positionOffsetX: 0,
    positionOffsetY: 0,
    positionOffsetZ: 0,
    targetOffsetX: 0,
    targetOffsetY: 0,
  });

  const mouseAnimationRef = useRef<gsap.core.Tween | null>(null);

  // Get optimized animation settings based on device
  const animSettings = getMouseAnimationSettings(viewport);
  
  // Throttle mouse updates to avoid too many GSAP animations
  const lastMouseUpdate = useRef(0);

  // Update mouse influence with GSAP animation whenever mouse position changes
  useEffect(() => {
    // Skip mouse updates during camera transitions
    if (isTransitioning) {
      return;
    }

    const now = Date.now();
    
    // Throttle updates to avoid performance issues
    if (now - lastMouseUpdate.current < animSettings.throttle) {
      return;
    }
    lastMouseUpdate.current = now;

    // Apply subtle mouse tilt effect (maximum 15 degrees = π/12 radians for subtlety)
    const maxTiltAngle = Math.PI / 12; // 15 degrees
    const targetTiltHorizontal = mousePosition.normalizedX * maxTiltAngle * 0.2;
    const targetTiltVertical = mousePosition.normalizedY * maxTiltAngle * 0.3;

    // Calculate target position offsets
    const targetPositionOffsetX = Math.sin(targetTiltHorizontal) * 2;
    const targetPositionOffsetY = Math.sin(targetTiltVertical) * 1.5;
    const targetPositionOffsetZ = Math.cos(targetTiltHorizontal) * 2;

    // Calculate target look-at offsets
    const targetTargetOffsetX = mousePosition.normalizedX * 0.5;
    const targetTargetOffsetY = mousePosition.normalizedY * 0.3;

    // Kill existing mouse animation
    if (mouseAnimationRef.current) {
      mouseAnimationRef.current.kill();
    }

    // Animate to new mouse influence values with GSAP for fluid movement
    mouseAnimationRef.current = gsap.to(mouseInfluenceObject.current, {
      duration: animSettings.duration,
      ease: animSettings.ease,
      tiltHorizontal: targetTiltHorizontal,
      tiltVertical: targetTiltVertical,
      positionOffsetX: targetPositionOffsetX,
      positionOffsetY: targetPositionOffsetY,
      positionOffsetZ: targetPositionOffsetZ,
      targetOffsetX: targetTargetOffsetX,
      targetOffsetY: targetTargetOffsetY,
    });
  }, [mousePosition.normalizedX, mousePosition.normalizedY, animSettings, isTransitioning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mouseAnimationRef.current) {
        mouseAnimationRef.current.kill();
      }
    };
  }, []);

  return (state: any, delta: number) => {
    const isMobile = viewport.width < 768;
    
    // Use smoothed mouse influence from GSAP animation
    const mouseInfluence = mouseInfluenceObject.current;

    // Calculate final camera position with smooth mouse influence and data attribute controls
    const finalX = controls.position[0] + mouseInfluence.positionOffsetX;
    const finalY = controls.position[1] + mouseInfluence.positionOffsetY;
    const finalZ = controls.position[2] + mouseInfluence.positionOffsetZ;

    // Set camera position
    camera.position.set(finalX, finalY, finalZ);

    // Look at target position (with smooth mouse influence)
    const targetX = controls.targetPosition[0] + mouseInfluence.targetOffsetX;
    const targetY = controls.targetPosition[1] + mouseInfluence.targetOffsetY;
    const targetZ = controls.targetPosition[2];
    
    camera.lookAt(targetX, targetY, targetZ);

    // Apply zoom through FOV adjustment
    if ("fov" in camera) {
      const baseFov = isMobile ? 65 : 50;
      const zoomFovFactor = Math.max(0.3, 1 / controls.zoom);
      camera.fov = baseFov * zoomFovFactor;
      camera.updateProjectionMatrix();
    }

    // Apply rotation to camera (optional - can be applied to camera or network group)
    if (controls.rotation[0] !== 0 || controls.rotation[1] !== 0 || controls.rotation[2] !== 0) {
      camera.rotation.set(
        controls.rotation[0],
        controls.rotation[1],
        controls.rotation[2]
      );
    }
  };
};