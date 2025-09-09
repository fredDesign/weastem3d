import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Interface for camera settings from data-attributes
interface CameraSettings {
  zoom?: number;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  targetX?: number;
  targetY?: number;
  targetZ?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
}

// Interface for ScrollTrigger settings
interface ScrollSettings {
  start?: string;
  end?: string;
  markers?: boolean;
  scrub?: boolean | number;
  pin?: boolean;
  toggleActions?: string;
}

// Function to parse camera settings from an element
const parseCameraSettings = (element: Element, prefix: string = ''): CameraSettings => {
  const settings: CameraSettings = {};
  
  const getValue = (attr: string) => {
    const value = element.getAttribute(`data-${prefix}${attr}`);
    return value ? parseFloat(value) : undefined;
  };

  settings.zoom = getValue('zoom');
  settings.positionX = getValue('position-x');
  settings.positionY = getValue('position-y');
  settings.positionZ = getValue('position-z');
  settings.targetX = getValue('target-x');
  settings.targetY = getValue('target-y');
  settings.targetZ = getValue('target-z');
  settings.rotationX = getValue('rotation-x');
  settings.rotationY = getValue('rotation-y');
  settings.rotationZ = getValue('rotation-z');

  return settings;
};

// Function to parse ScrollTrigger settings
const parseScrollSettings = (element: Element): ScrollSettings => {
  const settings: ScrollSettings = {};
  
  const start = element.getAttribute('data-scroll-start');
  if (start) settings.start = start;
  
  const end = element.getAttribute('data-scroll-end');
  if (end) settings.end = end;
  
  const markers = element.getAttribute('data-scroll-markers');
  if (markers) settings.markers = markers === 'true';
  
  const scrub = element.getAttribute('data-scroll-scrub');
  if (scrub) {
    if (scrub === 'true') settings.scrub = true;
    else if (scrub === 'false') settings.scrub = false;
    else settings.scrub = parseFloat(scrub);
  }
  
  const pin = element.getAttribute('data-scroll-pin');
  if (pin) settings.pin = pin === 'true';
  
  const toggleActions = element.getAttribute('data-scroll-toggle-actions');
  if (toggleActions) settings.toggleActions = toggleActions;
  
  return settings;
};

// Function to apply camera settings to the visualization container's data-attributes
const applyCameraSettings = (settings: CameraSettings) => {
  // Target the specific container with data-main-visualization="true" attribute
  const container = document.querySelector('.network-visualization-container[data-main-visualization="true"]') as HTMLElement;
  const element = container || document.body;
  
  if (settings.zoom !== undefined) {
    element.dataset.cameraZoom = settings.zoom.toString();
  }
  if (settings.positionX !== undefined) {
    element.dataset.cameraPositionX = settings.positionX.toString();
  }
  if (settings.positionY !== undefined) {
    element.dataset.cameraPositionY = settings.positionY.toString();
  }
  if (settings.positionZ !== undefined) {
    element.dataset.cameraPositionZ = settings.positionZ.toString();
  }
  if (settings.targetX !== undefined) {
    element.dataset.cameraTargetX = settings.targetX.toString();
  }
  if (settings.targetY !== undefined) {
    element.dataset.cameraTargetY = settings.targetY.toString();
  }
  if (settings.targetZ !== undefined) {
    element.dataset.cameraTargetZ = settings.targetZ.toString();
  }
  if (settings.rotationX !== undefined) {
    element.dataset.cameraRotationX = settings.rotationX.toString();
  }
  if (settings.rotationY !== undefined) {
    element.dataset.cameraRotationY = settings.rotationY.toString();
  }
  if (settings.rotationZ !== undefined) {
    element.dataset.cameraRotationZ = settings.rotationZ.toString();
  }
};

// Function to wait for DOM ready
const waitForDOMReady = (): Promise<void> => {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      const onLoad = () => {
        window.removeEventListener('load', onLoad);
        resolve();
      };
      window.addEventListener('load', onLoad);
    }
  });
};

// Hook for controlling camera with scroll and data-attributes
export const useScrollCameraController = (
  selector: string = '[data-scroll-camera]',
  enabled: boolean = true
) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const scrollTriggersRef = useRef<ScrollTrigger[]>([]);
  const retryTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 1000;

    const initScrollCameraController = async () => {
      // Wait for DOM to be completely loaded
      await waitForDOMReady();
      
      // Additional delay for React to finish rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find all elements with data-attributes for camera control
      const elements = document.querySelectorAll(selector);
      
      if (elements.length === 0) {
        retryCount++;
        if (retryCount < maxRetries) {
          retryTimeoutRef.current = window.setTimeout(initScrollCameraController, retryDelay);
          return;
        } else {
          return;
        }
      }

      // Clean up existing ScrollTriggers
      scrollTriggersRef.current.forEach(trigger => trigger.kill());
      scrollTriggersRef.current = [];

      // Create ScrollTrigger for each element
      elements.forEach((element, index) => {
        const elementId = element.id || `scroll-camera-${index}`;

        // Parse scroll settings
        const scrollSettings = parseScrollSettings(element);
        
        // Parse camera settings for different events
        const onEnterSettings = parseCameraSettings(element, 'on-enter-');
        const onLeaveSettings = parseCameraSettings(element, 'on-leave-');
        const onEnterBackSettings = parseCameraSettings(element, 'on-enter-back-');
        const onLeaveBackSettings = parseCameraSettings(element, 'on-leave-back-');

        // ScrollTrigger configuration
        const config: any = {
          trigger: element,
          start: scrollSettings.start || 'top 80%',
          end: scrollSettings.end || 'bottom 20%',
          markers: false, // Always false in production
        };

        // Add optional properties if they exist
        if (scrollSettings.scrub !== undefined) {
          config.scrub = scrollSettings.scrub;
        }
        if (scrollSettings.pin !== undefined) {
          config.pin = scrollSettings.pin;
        }
        if (scrollSettings.toggleActions) {
          config.toggleActions = scrollSettings.toggleActions;
        }

        // Add callbacks if camera settings are defined
        if (Object.keys(onEnterSettings).length > 0) {
          config.onEnter = () => {
            applyCameraSettings(onEnterSettings);
          };
        }

        if (Object.keys(onLeaveSettings).length > 0) {
          config.onLeave = () => {
            applyCameraSettings(onLeaveSettings);
          };
        }

        if (Object.keys(onEnterBackSettings).length > 0) {
          config.onEnterBack = () => {
            applyCameraSettings(onEnterBackSettings);
          };
        }

        if (Object.keys(onLeaveBackSettings).length > 0) {
          config.onLeaveBack = () => {
            applyCameraSettings(onLeaveBackSettings);
          };
        }

        try {
          const trigger = ScrollTrigger.create(config);
          scrollTriggersRef.current.push(trigger);
        } catch (error) {
          console.error('Error creating ScrollTrigger for:', elementId, error);
        }
      });

      setIsInitialized(true);
    };

    // Start initialization
    initScrollCameraController();

    // Cleanup
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      scrollTriggersRef.current.forEach(trigger => trigger.kill());
      scrollTriggersRef.current = [];
      setIsInitialized(false);
    };
  }, [selector, enabled]);

  // Function to refresh ScrollTriggers
  const refresh = () => {
    ScrollTrigger.refresh();
  };

  return {
    isInitialized,
    refresh,
    scrollTriggersCount: scrollTriggersRef.current.length
  };
};

// Props for ScrollCameraController component
interface ScrollCameraControllerProps {
  selector?: string;
  enabled?: boolean;
  debug?: boolean;
  children?: React.ReactNode;
}

// React component for scroll-based camera control - production optimized
const ScrollCameraController: React.FC<ScrollCameraControllerProps> = ({
  selector = '[data-scroll-camera]',
  enabled = true,
  debug = false,
  children
}) => {
  const { isInitialized, refresh, scrollTriggersCount } = 
    useScrollCameraController(selector, enabled);

  // No debug panel in production
  return <>{children}</>;
};

export default ScrollCameraController;