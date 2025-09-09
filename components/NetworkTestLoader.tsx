import React, { useState, useEffect } from 'react';
import { networkTestService, ConfigurationName } from './NetworkTestService';

const NetworkTestLoader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<ConfigurationName>('default');

  // Set up callbacks for the service
  useEffect(() => {
    networkTestService.onLoadingStateChange((loading, configName) => {
      setIsLoading(loading);
      if (loading) {
        setCurrentConfig(configName as ConfigurationName);
      }
    });

    networkTestService.onLoadingComplete((success, configName, error) => {
      if (!success && error) {
        alert(error);
      }
    });

    // Initialize current config
    setCurrentConfig(networkTestService.getCurrentConfigurationName());
  }, []);

  const loadConfiguration = (configName: ConfigurationName) => {
    networkTestService.loadConfiguration(configName);
  };

  const loadFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      networkTestService.loadFromFile(file);
      event.target.value = ''; // Reset file input
    }
  };

  const exportCurrentConfig = () => {
    networkTestService.exportConfiguration();
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
              <div className="w-100">
                <button
                  onClick={() => {
                    const fileInput = document.getElementById('file-import-input') as HTMLInputElement;
                    fileInput?.click();
                  }}
                  disabled={isLoading}
                  className="btn btn-secondary btn-sm w-100"
                  type="button"
                >
                  📁 Import
                </button>
                <input
                  id="file-import-input"
                  type="file"
                  accept=".json"
                  onChange={loadFromJSON}
                  disabled={isLoading}
                  className="d-none"
                />
              </div>
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