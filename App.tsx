import NetworkVisualization from "./components/NetworkVisualization";
import ScrollCameraController from "./components/ScrollCameraController";
import NetworkTestLoader from "./components/NetworkTestLoader";
import { networkDataService, NetworkConfiguration } from "./components/NetworkDataService";
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function App() {
  // State for network configuration - preserved for server API integration
  const [networkConfig, setNetworkConfig] = useState<NetworkConfiguration>(
    networkDataService.getCurrentConfiguration()
  );

  // Subscribe to network configuration changes for future server integration
  useEffect(() => {
    const unsubscribe = networkDataService.subscribe((config) => {
      setNetworkConfig(config);
      
      // Update HTML elements with current network info
      const nameElement = document.getElementById('current-network-name');
      const nodesElement = document.getElementById('current-network-nodes');
      
      if (nameElement) {
        nameElement.textContent = config.metadata.name;
      }
      if (nodesElement) {
        nodesElement.textContent = config.nodes.length.toString();
      }
    });

    return unsubscribe;
  }, []);

  // Initialize network info in HTML
  useEffect(() => {
    const nameElement = document.getElementById('current-network-name');
    const nodesElement = document.getElementById('current-network-nodes');
    
    if (nameElement) {
      nameElement.textContent = networkConfig.metadata.name;
    }
    if (nodesElement) {
      nodesElement.textContent = networkConfig.nodes.length.toString();
    }
  }, [networkConfig]);

  return (
    <>
      {/* Scroll Camera Controller - production optimized */}
      <ScrollCameraController 
        selector="[data-scroll-camera]"
        enabled={true}
        debug={false}
      />

      {/* Network Visualization Portal - renders into #network-visualization-root */}
      {ReactDOM.createPortal(
        <NetworkVisualization />,
        document.getElementById('network-visualization-root') || document.body
      )}

      {/* Test Loader Portal - renders into #test-loader-container */}
      {ReactDOM.createPortal(
        <NetworkTestLoader />,
        document.getElementById('test-loader-container') || document.body
      )}
    </>
  );
}
