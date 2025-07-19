import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCameraControls, useApplyCameraControls } from "./CameraControls";
import { vector3Utils, createReusableObject3D, Vector3Tuple } from "./ThreeCore";
import { networkDataService, NetworkConfiguration, NetworkNode } from "./NetworkDataService";
import {
  useNodeAnimation,
  useMeshAnimation,
  ConnectionAnimationManager,
  PositionUpdateManager,
  generateSinusoidalParams,
  NodeAnimationData,
  NodeAnimationState,
  SinusoidalParams,
} from "./NetworkAnimations";

// Network material properties for flat design
const FLAT_MATERIAL_PROPERTIES = {
  transparent: false,
  opacity: 1.0,
  fog: false,
} as const;

// Optimized network node component
const NetworkNodeComponent: React.FC<{
  node: NetworkNode;
  animationData: NodeAnimationData;
  onPositionUpdate: (id: number, position: Vector3Tuple) => void;
  onAnimationComplete: (id: number) => void;
}> = ({ node, animationData, onPositionUpdate, onAnimationComplete }) => {
  const meshRef = useRef<any>(null);
  
  // Generate sinusoidal parameters once per node
  const sinusoidalParams = useRef<SinusoidalParams>(generateSinusoidalParams());
  
  // Use optimized animation hooks
  const { transitionState, basePosition } = useNodeAnimation(
    node.id,
    animationData,
    onAnimationComplete
  );

  // Use optimized mesh animation
  useMeshAnimation(
    meshRef,
    sinusoidalParams.current,
    transitionState,
    basePosition,
    animationData,
    onPositionUpdate,
    node.id
  );

  return (
    <mesh
      ref={meshRef}
      position={basePosition}
      userData={{ id: `network-node-${node.id}`, nodeId: node.id, color: node.color }}
    >
      <sphereGeometry args={[node.radius, 32, 32]} />
      <meshBasicMaterial 
        color={node.color}
        {...FLAT_MATERIAL_PROPERTIES}
      />
    </mesh>
  );
};

// Optimized connection lines component
const InstancedConnectionLines: React.FC<{
  connections: { startId: number; endId: number; isAnimating?: boolean }[];
  nodePositions: Map<number, Vector3Tuple>;
  onConnectionAnimationComplete?: (startId: number, endId: number) => void;
}> = ({ connections, nodePositions, onConnectionAnimationComplete }) => {
  const instancedMeshRef = useRef<any>(null);
  const tempObject = useRef<any>(null);
  const animationManager = useRef(new ConnectionAnimationManager());

  // Initialize temp object
  useEffect(() => {
    tempObject.current = createReusableObject3D();
    return () => {
      animationManager.current.cleanup();
    };
  }, []);

  // Manage connection animations
  useEffect(() => {
    connections.forEach((connection) => {
      animationManager.current.initializeConnection(
        connection.startId,
        connection.endId,
        connection.isAnimating,
        onConnectionAnimationComplete
      );
    });

    // Clean up removed connections
    const currentKeys = new Set(
      connections.map(conn => `${conn.startId}-${conn.endId}`)
    );
    
    // Note: We'll need to track previous connections to clean up properly
    // This is a simplified version for now
  }, [connections, onConnectionAnimationComplete]);

  // Optimized render loop
  useFrame(() => {
    if (!instancedMeshRef.current || !tempObject.current) return;

    let validIndex = 0;

    connections.forEach((connection) => {
      const startPos = nodePositions.get(connection.startId);
      const endPos = nodePositions.get(connection.endId);
      const key = `${connection.startId}-${connection.endId}`;
      const animData = animationManager.current.getConnectionAnimation(key);

      if (startPos && endPos && animData.scale > 0.001) {
        const start = vector3Utils.fromTuple(startPos);
        const end = vector3Utils.fromTuple(endPos);
        const midpoint = vector3Utils.midpoint(start, end);
        const distance = vector3Utils.distance(start, end);

        // Update temp object
        tempObject.current.position.copy(midpoint);
        tempObject.current.lookAt(end);
        tempObject.current.rotateX(Math.PI / 2);
        tempObject.current.scale.set(
          animData.scale * 0.8,
          distance * animData.scale,
          animData.scale * 0.8
        );

        tempObject.current.updateMatrix();
        instancedMeshRef.current.setMatrixAt(validIndex, tempObject.current.matrix);
        validIndex++;
      }
    });

    // Hide unused instances
    for (let i = validIndex; i < connections.length; i++) {
      tempObject.current.scale.set(0, 0, 0);
      tempObject.current.updateMatrix();
      instancedMeshRef.current.setMatrixAt(i, tempObject.current.matrix);
    }

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[null, null, Math.max(connections.length, 1)]}
      userData={{ id: 'network-connection-lines', type: 'connections' }}
    >
      <cylinderGeometry args={[0.0375, 0.0375, 1, 8]} />
      <meshBasicMaterial 
        color="#0D49AB"
        transparent={true}
        opacity={0.8}
        fog={false}
      />
    </instancedMesh>
  );
};

// Optimized responsive scene
const ResponsiveScene: React.FC<{
  viewport: { width: number; height: number };
  mousePosition: { normalizedX: number; normalizedY: number };
  networkConfig: NetworkConfiguration;
}> = ({ viewport, mousePosition, networkConfig }) => {
  const { scene } = useThree();

  // Optimized state management
  const [nodeAnimations, setNodeAnimations] = useState<Map<number, NodeAnimationData>>(new Map());
  const [nodePositions, setNodePositions] = useState<Map<number, Vector3Tuple>>(
    new Map(networkConfig.nodes.map((node) => [node.id, node.position]))
  );
  
  const previousConfigRef = useRef<NetworkConfiguration>(networkConfig);
  const positionManager = useRef(new PositionUpdateManager());

  // Optimized configuration change detection
  const configChangeId = useMemo(() => {
    return `${networkConfig.metadata.name}-${networkConfig.nodes.length}-${Date.now()}`;
  }, [networkConfig]);

  // Effect to handle configuration changes
  useEffect(() => {
    const prevConfig = previousConfigRef.current;
    const newConfig = networkConfig;

    // Create a unique key for comparison
    const prevKey = `${prevConfig.metadata.name}-${prevConfig.nodes.length}`;
    const newKey = `${newConfig.metadata.name}-${newConfig.nodes.length}`;

    // Skip if it's the same configuration
    if (prevKey === newKey && prevConfig.metadata.modifiedAt === newConfig.metadata.modifiedAt) {
      return;
    }

    console.log('🎬 Configuration change detected:', prevKey, '->', newKey);

    const newAnimations = new Map<number, NodeAnimationData>();
    const prevNodeMap = new Map(prevConfig.nodes.map(node => [node.id, node]));
    const newNodeMap = new Map(newConfig.nodes.map(node => [node.id, node]));

    // Process all nodes in the new configuration
    newConfig.nodes.forEach(newNode => {
      const prevNode = prevNodeMap.get(newNode.id);
      
      if (!prevNode) {
        // New node - ensure it appears
        console.log(`🆕 NEW NODE ${newNode.id} appearing`);
        newAnimations.set(newNode.id, {
          state: 'appearing',
          targetPosition: newNode.position,
          targetRadius: newNode.radius,
          startTime: Date.now(),
        });
      } else {
        // Existing node - check if moved
        const positionChanged = 
          Math.abs(prevNode.position[0] - newNode.position[0]) > 0.1 ||
          Math.abs(prevNode.position[1] - newNode.position[1]) > 0.1 ||
          Math.abs(prevNode.position[2] - newNode.position[2]) > 0.1;

        if (positionChanged) {
          console.log(`🔄 Node ${newNode.id} moving`);
          newAnimations.set(newNode.id, {
            state: 'moving',
            targetPosition: newNode.position,
            targetRadius: newNode.radius,
            startTime: Date.now(),
          });
        } else {
          newAnimations.set(newNode.id, {
            state: 'stable',
            targetPosition: newNode.position,
            targetRadius: newNode.radius,
            startTime: Date.now(),
          });
        }
      }
    });

    // Process disappeared nodes
    prevConfig.nodes.forEach(prevNode => {
      if (!newNodeMap.has(prevNode.id)) {
        console.log(`🗑️ Node ${prevNode.id} disappearing`);
        newAnimations.set(prevNode.id, {
          state: 'disappearing',
          targetPosition: prevNode.position,
          targetRadius: prevNode.radius,
          startTime: Date.now(),
        });
      }
    });

    setNodeAnimations(newAnimations);
    previousConfigRef.current = newConfig;

    // Update positions immediately for stable and new nodes
    const newPositions = new Map(nodePositions);
    newConfig.nodes.forEach(node => {
      const animData = newAnimations.get(node.id);
      if (animData && (animData.state === 'stable' || animData.state === 'appearing')) {
        newPositions.set(node.id, node.position);
      }
    });
    setNodePositions(newPositions);

  }, [configChangeId, nodePositions]);

  // Optimized animation completion handler
  const handleNodeAnimationComplete = useCallback((nodeId: number) => {
    console.log(`✅ Animation completed for node ${nodeId}`);
    setNodeAnimations(prev => {
      const newAnimations = new Map(prev);
      const animData = newAnimations.get(nodeId);
      
      if (animData) {
        if (animData.state === 'disappearing') {
          newAnimations.delete(nodeId);
          setNodePositions(prevPos => {
            const newPos = new Map(prevPos);
            newPos.delete(nodeId);
            return newPos;
          });
        } else {
          newAnimations.set(nodeId, {
            ...animData,
            state: 'stable',
          });
        }
      }
      
      return newAnimations;
    });
  }, []);

  // Optimized position update handler with throttling
  const handlePositionUpdate = useCallback((id: number, position: Vector3Tuple) => {
    positionManager.current.queueUpdate(id, position);
  }, []);

  // Flush position updates periodically
  useFrame(() => {
    positionManager.current.flushUpdates((updates) => {
      setNodePositions(prev => {
        const newMap = new Map(prev);
        updates.forEach((position, id) => {
          newMap.set(id, position);
        });
        return newMap;
      });
    });
  });

  // Camera controls
  const { currentCameraControls, isTransitioning: cameraTransitioning } = useCameraControls();

  // Scene setup
  useEffect(() => {
    scene.background = null;
    scene.fog = null;
  }, [scene]);

  const applyCameraControls = useApplyCameraControls(
    currentCameraControls,
    mousePosition,
    viewport,
    cameraTransitioning
  );

  useFrame((state, delta) => {
    applyCameraControls(state, delta);
  });

  // Optimized connections generation
  const connections = useMemo(() => {
    const connectionList: { startId: number; endId: number; isAnimating?: boolean }[] = [];
    
    const currentNodes = networkConfig.nodes.filter(node => {
      const animData = nodeAnimations.get(node.id);
      return !animData || animData.state !== 'disappearing';
    });

    currentNodes.forEach((node) => {
      node.connections.forEach((connId) => {
        const connectedNodeAnimData = nodeAnimations.get(connId);
        const connectedNodeExists = currentNodes.some(n => n.id === connId);
        
        if (connectedNodeExists && 
            (!connectedNodeAnimData || connectedNodeAnimData.state !== 'disappearing')) {
          
          const connectionExists = connectionList.some(
            (conn) =>
              (conn.startId === node.id && conn.endId === connId) ||
              (conn.startId === connId && conn.endId === node.id)
          );

          if (!connectionExists) {
            const nodeAnimData = nodeAnimations.get(node.id);
            const isNewConnection = 
              (nodeAnimData && nodeAnimData.state === 'appearing') ||
              (connectedNodeAnimData && connectedNodeAnimData.state === 'appearing');

            connectionList.push({
              startId: node.id,
              endId: connId,
              isAnimating: isNewConnection,
            });
          }
        }
      });
    });
    
    return connectionList;
  }, [networkConfig.nodes, nodeAnimations]);

  // Optimized nodes to render
  const allNodesToRender = useMemo(() => {
    const nodesToRender = [...networkConfig.nodes];
    
    // Add disappearing nodes
    nodeAnimations.forEach((animData, nodeId) => {
      if (animData.state === 'disappearing' && 
          !networkConfig.nodes.some(n => n.id === nodeId)) {
        const disappearingNode = previousConfigRef.current.nodes.find(n => n.id === nodeId);
        if (disappearingNode) {
          nodesToRender.push(disappearingNode);
        }
      }
    });
    
    return nodesToRender;
  }, [networkConfig.nodes, nodeAnimations]);

  return (
    <>
      <ambientLight intensity={1.0} color="#ffffff" />

      <group>
        {allNodesToRender.map((node) => {
          const animData = nodeAnimations.get(node.id) || {
            state: 'stable' as NodeAnimationState,
            targetPosition: node.position,
            targetRadius: node.radius,
            startTime: Date.now(),
          };

          return (
            <NetworkNodeComponent
              key={node.id}
              node={node}
              animationData={animData}
              onPositionUpdate={handlePositionUpdate}
              onAnimationComplete={handleNodeAnimationComplete}
            />
          );
        })}

        <InstancedConnectionLines
          connections={connections}
          nodePositions={nodePositions}
        />
      </group>
    </>
  );
};

// Main component
const NetworkVisualization: React.FC = () => {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState({
    x: 0, y: 0, normalizedX: 0, normalizedY: 0
  });
  const [networkConfig, setNetworkConfig] = useState<NetworkConfiguration>(
    networkDataService.getCurrentConfiguration()
  );

  // Subscribe to network configuration changes
  useEffect(() => {
    const unsubscribe = networkDataService.subscribe((config) => {
      console.log('🌐 NetworkVisualization: New config received', config.metadata.name, config.nodes.length, 'nodes');
      setNetworkConfig(config);
    });

    return unsubscribe;
  }, []);

  // Optimized event handlers
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const { innerWidth, innerHeight } = window;

      setMousePosition({
        x: clientX,
        y: clientY,
        normalizedX: (clientX / innerWidth) * 2 - 1,
        normalizedY: -((clientY / innerHeight) * 2 - 1),
      });
    };

    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Responsive camera settings
  const cameraSettings = useMemo(() => {
    const isMobile = viewport.width < 768;
    const isTablet = viewport.width < 1024 && viewport.width >= 768;

    if (isMobile) {
      return { position: [15, 1, 15] as Vector3Tuple, fov: 65, near: 0.1, far: 100 };
    } else if (isTablet) {
      return { position: [12, 0.8, 12] as Vector3Tuple, fov: 55, near: 0.1, far: 100 };
    } else {
      return { position: [0, 0.5, 10] as Vector3Tuple, fov: 50, near: 0.1, far: 100 };
    }
  }, [viewport]);

  return (
    <div id="network-visualization-container" className="fixed inset-0 w-full h-full -z-10">
      <div id="network-background-gradient" className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 opacity-80"></div>

      <Canvas
        id="network-3d-canvas"
        camera={cameraSettings}
        style={{ background: "transparent", width: "100%", height: "100%" }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
        }}
      >
        <ResponsiveScene
          viewport={viewport}
          mousePosition={mousePosition}
          networkConfig={networkConfig}
        />
      </Canvas>
    </div>
  );
};

export default NetworkVisualization;