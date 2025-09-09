import React, { useState } from 'react';
import { networkDataService, NetworkConfiguration } from './NetworkDataService';

// Test configurations for demonstrating animations - fixed format
const testConfigurations = {
  simple: {
    version: "1.0.0",
    metadata: {
      name: "Simple Test Network",
      description: "A simple network for testing animations",
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
    nodes: [
      { id: 0, position: [-2, 0, 0] as [number, number, number], radius: 0.5, color: "#0E48A9", connections: [1, 2] },
      { id: 1, position: [2, 0, 0] as [number, number, number], radius: 0.6, color: "#0E48A9", connections: [0, 2] },
      { id: 2, position: [0, 2, 0] as [number, number, number], radius: 0.4, color: "#f97316", connections: [0, 1] },
    ]
  } as NetworkConfiguration,
  expanded: {
    version: "1.0.0",
    metadata: {
      name: "Expanded Test Network",
      description: "An expanded network for testing animations",
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
    nodes: [
      { id: 0, position: [-3, 0, 0] as [number, number, number], radius: 0.5, color: "#0E48A9", connections: [1, 2, 3] },
      { id: 1, position: [3, 0, 0] as [number, number, number], radius: 0.6, color: "#0E48A9", connections: [0, 2, 4] },
      { id: 2, position: [0, 3, 0] as [number, number, number], radius: 0.4, color: "#f97316", connections: [0, 1, 5] },
      { id: 3, position: [-1.5, -2, 0] as [number, number, number], radius: 0.35, color: "#0E48A9", connections: [0, 4] },
      { id: 4, position: [1.5, -2, 0] as [number, number, number], radius: 0.45, color: "#0E48A9", connections: [1, 3, 5] },
      { id: 5, position: [0, 0, -2] as [number, number, number], radius: 0.3, color: "#0E48A9", connections: [2, 4] },
    ]
  } as NetworkConfiguration,
  moved: {
    version: "1.0.0",
    metadata: {
      name: "Moved Test Network",
      description: "Network with moved nodes for testing animations",
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
    nodes: [
      { id: 0, position: [-1, 1, 1] as [number, number, number], radius: 0.5, color: "#0E48A9", connections: [1, 2] },
      { id: 1, position: [1, -1, 1] as [number, number, number], radius: 0.6, color: "#0E48A9", connections: [0, 2] },
      { id: 2, position: [0, 0, -1] as [number, number, number], radius: 0.4, color: "#f97316", connections: [0, 1] },
    ]
  } as NetworkConfiguration,
  complex: {
    version: "1.0.0",
    metadata: {
      name: "Complex Test Network",
      description: "A complex network for testing animations",
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
    nodes: [
      { id: 0, position: [0, 0, 0] as [number, number, number], radius: 0.6, color: "#f97316", connections: [1, 2, 3, 4] },
      { id: 1, position: [-3, 2, 1] as [number, number, number], radius: 0.4, color: "#0E48A9", connections: [0, 5, 6] },
      { id: 2, position: [3, 2, 1] as [number, number, number], radius: 0.4, color: "#0E48A9", connections: [0, 7, 8] },
      { id: 3, position: [-3, -2, 1] as [number, number, number], radius: 0.4, color: "#0E48A9", connections: [0, 9] },
      { id: 4, position: [3, -2, 1] as [number, number, number], radius: 0.4, color: "#0E48A9", connections: [0, 10] },
      { id: 5, position: [-5, 3, 0] as [number, number, number], radius: 0.3, color: "#0E48A9", connections: [1] },
      { id: 6, position: [-5, 1, 2] as [number, number, number], radius: 0.3, color: "#0E48A9", connections: [1] },
      { id: 7, position: [5, 3, 0] as [number, number, number], radius: 0.3, color: "#0E48A9", connections: [2] },
      { id: 8, position: [5, 1, 2] as [number, number, number], radius: 0.3, color: "#0E48A9", connections: [2] },
      { id: 9, position: [-5, -3, 2] as [number, number, number], radius: 0.3, color: "#0E48A9", connections: [3] },
      { id: 10, position: [5, -3, 2] as [number, number, number], radius: 0.3, color: "#0E48A9", connections: [4] },
    ]
  } as NetworkConfiguration
};

const NetworkTestLoader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentConfig, setCurrentConfig] = useState('default');

  const loadConfiguration = async (configName: string) => {
    setIsLoading(true);
    setCurrentConfig(configName);
    
    try {
      if (configName === 'default') {
        // Load default configuration
        networkDataService.resetToDefault();
        console.log('✅ Default configuration loaded');
      } else if (testConfigurations[configName as keyof typeof testConfigurations]) {
        // Load test configuration
        const config = testConfigurations[configName as keyof typeof testConfigurations];
        const result = networkDataService.setConfiguration(config);
        
        if (result.success) {
          console.log(`✅ Configuration "${configName}" loaded successfully`);
        } else {
          console.error(`❌ Failed to load configuration "${configName}":`, result.errors);
        }
      }
    } catch (error) {
      console.error('❌ Error loading configuration:', error);
    } finally {
      // Add a small delay to see the loading state
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };

  const loadFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const result = networkDataService.importConfiguration(content);
        
        if (result.success) {
          setCurrentConfig('custom');
          console.log('✅ Custom JSON configuration loaded successfully');
        } else {
          console.error('❌ Failed to load JSON configuration:', result.errors);
          alert(`Failed to load JSON: ${result.errors?.join(', ')}`);
        }
      } catch (error) {
        console.error('❌ Error parsing JSON:', error);
        alert('Error parsing JSON file. Please check the format.');
      } finally {
        setIsLoading(false);
        // Reset file input
        event.target.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  const exportCurrentConfig = () => {
    const configJson = networkDataService.exportConfiguration();
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `network-config-${currentConfig}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Configuration exported');
  };

  return (
    <div className="position-fixed top-0 start-0 mt-3 ms-3" style={{ zIndex: 50, width: '320px' }}>
      <div className="card bg-light bg-opacity-95 shadow-lg">
        <div className="card-header pb-2">
          <h5 className="card-title mb-1">Animation Test Loader</h5>
          <p className="card-text small text-secondary mb-0">
            Load different configurations to test JSON state transitions
          </p>
        </div>
        
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-6">
              <button
                onClick={() => loadConfiguration('default')}
                disabled={isLoading}
                className={`btn btn-sm w-100 ${currentConfig === 'default' ? 'btn-primary' : 'btn-outline-primary'}`}
              >
                {isLoading && currentConfig === 'default' ? '⏳' : '🏠'} Default
              </button>
            </div>
            
            <div className="col-6">
              <button
                onClick={() => loadConfiguration('simple')}
                disabled={isLoading}
                className={`btn btn-sm w-100 ${currentConfig === 'simple' ? 'btn-primary' : 'btn-outline-primary'}`}
              >
                {isLoading && currentConfig === 'simple' ? '⏳' : '🔹'} Simple
              </button>
            </div>
            
            <div className="col-6">
              <button
                onClick={() => loadConfiguration('expanded')}
                disabled={isLoading}
                className={`btn btn-sm w-100 ${currentConfig === 'expanded' ? 'btn-primary' : 'btn-outline-primary'}`}
              >
                {isLoading && currentConfig === 'expanded' ? '⏳' : '📈'} Expanded
              </button>
            </div>
            
            <div className="col-6">
              <button
                onClick={() => loadConfiguration('moved')}
                disabled={isLoading}
                className={`btn btn-sm w-100 ${currentConfig === 'moved' ? 'btn-primary' : 'btn-outline-primary'}`}
              >
                {isLoading && currentConfig === 'moved' ? '⏳' : '🔄'} Moved
              </button>
            </div>
          </div>
          
          <button
            onClick={() => loadConfiguration('complex')}
            disabled={isLoading}
            className={`btn btn-sm w-100 mb-3 ${currentConfig === 'complex' ? 'btn-primary' : 'btn-outline-primary'}`}
          >
            {isLoading && currentConfig === 'complex' ? '⏳' : '🌐'} Complex Network
          </button>
          
          <div className="row g-2 mb-3">
            <div className="col-6">
              <button
                onClick={exportCurrentConfig}
                disabled={isLoading}
                className="btn btn-secondary btn-sm w-100"
              >
                💾 Export
              </button>
            </div>
            
            <div className="col-6">
              <label className="w-100">
                <button
                  disabled={isLoading}
                  className="btn btn-secondary btn-sm w-100"
                  style={{ cursor: 'pointer' }}
                  type="button"
                >
                  📁 Import
                </button>
                <input
                  type="file"
                  accept=".json"
                  onChange={loadFromJSON}
                  disabled={isLoading}
                  className="d-none"
                />
              </label>
            </div>
          </div>
          
          {isLoading && (
            <div className="text-center py-2">
              <div className="d-inline-flex align-items-center gap-2 small text-secondary">
                <div className="spinner-border spinner-border-sm text-primary" role="status" style={{ width: '1rem', height: '1rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                Loading configuration...
              </div>
            </div>
          )}
          
          <div className="small text-secondary pt-2 border-top">
            <p className="mb-1"><strong>Animation Features:</strong></p>
            <ul className="list-unstyled ps-3 mb-2">
              <li>📦 Scale: New/removed nodes</li>
              <li>🔄 Move: Repositioned nodes</li>
              <li>⚡ Easing: Smooth transitions</li>
              <li>🔗 Connections: Animated lines</li>
            </ul>
            <p className="mb-0 small text-info">
              Current: <strong>{currentConfig}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTestLoader;