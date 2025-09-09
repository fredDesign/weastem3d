import { useRef, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import { Vector3Tuple } from "./ThreeCore";

// Animation configuration
export const ANIMATION_CONFIG = {
  duration: 0.8,
  ease: "power2.inOut",
  staggerDelay: 0.05,
} as const;

// Types for animation states
export type NodeAnimationState = 'appearing' | 'disappearing' | 'moving' | 'stable';

export interface NodeAnimationData {
  state: NodeAnimationState;
  targetPosition: Vector3Tuple;
  targetRadius: number;
  startTime: number;
}

// Optimized sinusoidal animation parameters (generated once and reused)
export interface SinusoidalParams {
  x: number;
  y: number;
  z: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  amplitudeX: number;
  amplitudeY: number;
  amplitudeZ: number;
}
export const dist: number = 0.05;
export const speed: number = 1;

// Generate sinusoidal parameters for a node
export const generateSinusoidalParams = (): SinusoidalParams => ({
  x: Math.random() * Math.PI * 1,
  y: Math.random() * Math.PI * 1,
  z: Math.random() * Math.PI * 1,
  speedX: 0.5 + Math.random() * speed,
  speedY: 0.3 + Math.random() * speed,
  speedZ: 0.4 + Math.random() * speed,
  amplitudeX: 0.1 + Math.random() * dist,
  amplitudeY: 0.1 + Math.random() * dist,
  amplitudeZ: 0.08 + Math.random() * dist,
});

// Calculate sinusoidal offset
export const calculateSinusoidalOffset = (
  time: number, 
  params: SinusoidalParams
): Vector3Tuple => [
  Math.sin(time * params.speedX + params.x) * params.amplitudeX,
  Math.cos(time * params.speedY + params.y) * params.amplitudeY,
  Math.sin(time * params.speedZ + params.z) * params.amplitudeZ,
];

// Optimized node animation hook
export const useNodeAnimation = (
  nodeId: number,
  animationData: NodeAnimationData,
  onAnimationComplete: (id: number) => void
) => {
  // Transition state (scale and position during transitions)
  const transitionState = useRef({
    scale: animationData.state === 'appearing' ? 0 : 1,
    positionX: animationData.targetPosition[0],
    positionY: animationData.targetPosition[1],
    positionZ: animationData.targetPosition[2],
    isTransitioning: animationData.state !== 'stable',
  });

  // Base position for sinusoidal animation
  const basePosition = useRef<Vector3Tuple>(animationData.targetPosition);
  
  // GSAP animation reference
  const transitionRef = useRef<gsap.core.Tween | null>(null);

  // Handle transition animations
  const startTransition = useCallback(() => {
    if (transitionRef.current) {
      transitionRef.current.kill();
    }

    const transState = transitionState.current;

    switch (animationData.state) {
      case 'appearing':
        transState.scale = 0;
        transState.positionX = animationData.targetPosition[0];
        transState.positionY = animationData.targetPosition[1];
        transState.positionZ = animationData.targetPosition[2];
        transState.isTransitioning = true;
        
        transitionRef.current = gsap.to(transState, {
          duration: ANIMATION_CONFIG.duration,
          ease: ANIMATION_CONFIG.ease,
          scale: 1,
          onComplete: () => {
            transState.isTransitioning = false;
            basePosition.current = animationData.targetPosition;
            onAnimationComplete(nodeId);
          }
        });
        break;

      case 'disappearing':
        transState.isTransitioning = true;
        
        transitionRef.current = gsap.to(transState, {
          duration: ANIMATION_CONFIG.duration,
          ease: ANIMATION_CONFIG.ease,
          scale: 0,
          onComplete: () => {
            transState.isTransitioning = false;
            onAnimationComplete(nodeId);
          }
        });
        break;

      case 'moving':
        transState.isTransitioning = true;
        
        transitionRef.current = gsap.to(transState, {
          duration: ANIMATION_CONFIG.duration,
          ease: ANIMATION_CONFIG.ease,
          positionX: animationData.targetPosition[0],
          positionY: animationData.targetPosition[1],
          positionZ: animationData.targetPosition[2],
          onUpdate: () => {
            basePosition.current = [
              transState.positionX,
              transState.positionY,
              transState.positionZ
            ];
          },
          onComplete: () => {
            transState.isTransitioning = false;
            basePosition.current = animationData.targetPosition;
            onAnimationComplete(nodeId);
          }
        });
        break;

      case 'stable':
        transState.isTransitioning = false;
        transState.positionX = animationData.targetPosition[0];
        transState.positionY = animationData.targetPosition[1];
        transState.positionZ = animationData.targetPosition[2];
        basePosition.current = animationData.targetPosition;
        break;
    }
  }, [animationData, nodeId, onAnimationComplete]);

  // Effect to trigger transitions
  useEffect(() => {
    startTransition();
  }, [startTransition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transitionRef.current) {
        transitionRef.current.kill();
      }
    };
  }, []);

  return {
    transitionState: transitionState.current,
    basePosition: basePosition.current,
  };
};

// Optimized mesh animation hook
export const useMeshAnimation = (
  meshRef: React.RefObject<any>,
  sinusoidalParams: SinusoidalParams,
  transitionState: any,
  basePosition: Vector3Tuple,
  animationData: NodeAnimationData,
  onPositionUpdate: (id: number, position: Vector3Tuple) => void,
  nodeId: number
) => {
  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    
    // Calculate sinusoidal offset
    const [offsetX, offsetY, offsetZ] = calculateSinusoidalOffset(time, sinusoidalParams);

    // Combine base position with sinusoidal animation
    let finalX, finalY, finalZ;
    
    if (transitionState.isTransitioning && animationData.state === 'moving') {
      // During position transition: use transition position + sinusoidal offset
      finalX = transitionState.positionX + offsetX;
      finalY = transitionState.positionY + offsetY;
      finalZ = transitionState.positionZ + offsetZ;
    } else {
      // Normal state: use base position + sinusoidal offset
      finalX = basePosition[0] + offsetX;
      finalY = basePosition[1] + offsetY;
      finalZ = basePosition[2] + offsetZ;
    }

    // Update mesh position and scale (batch updates)
    meshRef.current.position.set(finalX, finalY, finalZ);
    meshRef.current.scale.setScalar(transitionState.scale);

    // Update position for connections (throttled)
    onPositionUpdate(nodeId, [finalX, finalY, finalZ]);
  });
};

// Connection animation manager
export class ConnectionAnimationManager {
  private animations = new Map<string, { scale: number; opacity: number }>();

  public initializeConnection(
    startId: number, 
    endId: number, 
    isAnimating: boolean = false,
    onComplete?: (startId: number, endId: number) => void
  ): void {
    const key = `${startId}-${endId}`;
    
    if (!this.animations.has(key)) {
      const initialScale = isAnimating ? 0 : 1;
      const initialOpacity = isAnimating ? 0 : 0.8;
      
      this.animations.set(key, {
        scale: initialScale,
        opacity: initialOpacity
      });

      if (isAnimating) {
        const animData = this.animations.get(key)!;
        gsap.to(animData, {
          duration: ANIMATION_CONFIG.duration,
          ease: ANIMATION_CONFIG.ease,
          scale: 1,
          opacity: 0.8,
          onComplete: () => {
            onComplete?.(startId, endId);
          }
        });
      }
    }
  }

  public removeConnection(key: string): void {
    const animData = this.animations.get(key);
    if (animData) {
      gsap.to(animData, {
        duration: ANIMATION_CONFIG.duration * 0.5,
        ease: ANIMATION_CONFIG.ease,
        scale: 0,
        opacity: 0,
        onComplete: () => {
          this.animations.delete(key);
        }
      });
    }
  }

  public getConnectionAnimation(key: string) {
    return this.animations.get(key) || { scale: 1, opacity: 0.8 };
  }

  public cleanup(): void {
    // Kill all active animations
    this.animations.clear();
  }
}

// Optimized position update with throttling
export class PositionUpdateManager {
  private updateQueue = new Map<number, Vector3Tuple>();
  private lastUpdate = 0;
  private readonly throttleMs = 16; // ~60fps

  public queueUpdate(id: number, position: Vector3Tuple): void {
    this.updateQueue.set(id, position);
  }

  public flushUpdates(callback: (updates: Map<number, Vector3Tuple>) => void): void {
    const now = Date.now();
    if (now - this.lastUpdate >= this.throttleMs && this.updateQueue.size > 0) {
      callback(new Map(this.updateQueue));
      this.updateQueue.clear();
      this.lastUpdate = now;
    }
  }
}

export default {
  useNodeAnimation,
  useMeshAnimation,
  ConnectionAnimationManager,
  PositionUpdateManager,
  generateSinusoidalParams,
  calculateSinusoidalOffset,
  ANIMATION_CONFIG,
};