import React, { useState } from 'react';
import { networkDataService, NetworkConfiguration } from './NetworkDataService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

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
    <Card className="fixed top-4 left-4 z-50 w-80 bg-white/95 backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Animation Test Loader</CardTitle>
        <CardDescription>
          Load different configurations to test JSON state transitions
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => loadConfiguration('default')}
            disabled={isLoading}
            variant={currentConfig === 'default' ? 'default' : 'outline'}
            size="sm"
          >
            {isLoading && currentConfig === 'default' ? '⏳' : '🏠'} Default
          </Button>
          
          <Button
            onClick={() => loadConfiguration('simple')}
            disabled={isLoading}
            variant={currentConfig === 'simple' ? 'default' : 'outline'}
            size="sm"
          >
            {isLoading && currentConfig === 'simple' ? '⏳' : '🔹'} Simple
          </Button>
          
          <Button
            onClick={() => loadConfiguration('expanded')}
            disabled={isLoading}
            variant={currentConfig === 'expanded' ? 'default' : 'outline'}
            size="sm"
          >
            {isLoading && currentConfig === 'expanded' ? '⏳' : '📈'} Expanded
          </Button>
          
          <Button
            onClick={() => loadConfiguration('moved')}
            disabled={isLoading}
            variant={currentConfig === 'moved' ? 'default' : 'outline'}
            size="sm"
          >
            {isLoading && currentConfig === 'moved' ? '⏳' : '🔄'} Moved
          </Button>
        </div>
        
        <Button
          onClick={() => loadConfiguration('complex')}
          disabled={isLoading}
          variant={currentConfig === 'complex' ? 'default' : 'outline'}
          size="sm"
          className="w-full"
        >
          {isLoading && currentConfig === 'complex' ? '⏳' : '🌐'} Complex Network
        </Button>
        
        <div className="flex gap-2">
          <Button
            onClick={exportCurrentConfig}
            disabled={isLoading}
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            💾 Export
          </Button>
          
          <label className="flex-1">
            <Button
              disabled={isLoading}
              variant="secondary"
              size="sm"
              className="w-full cursor-pointer"
              asChild
            >
              <span>📁 Import</span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={loadFromJSON}
              disabled={isLoading}
              className="hidden"
            />
          </label>
        </div>
        
        {isLoading && (
          <div className="text-center py-2">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Loading configuration...
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 pt-2 border-t">
          <p><strong>Animation Features:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>📦 Scale: New/removed nodes</li>
            <li>🔄 Move: Repositioned nodes</li>
            <li>⚡ Easing: Smooth transitions</li>
            <li>🔗 Connections: Animated lines</li>
          </ul>
          <p className="mt-2 text-xs text-blue-600">
            Current: <strong>{currentConfig}</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkTestLoader;