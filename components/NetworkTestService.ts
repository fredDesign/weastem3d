import { networkDataService, NetworkConfiguration } from './NetworkDataService';

// Test configurations for demonstrating animations - fixed format
export const testConfigurations = {
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

// Type for configuration names
export type ConfigurationName = keyof typeof testConfigurations | 'default' | 'custom';

// Callback types for loading states and events
export type LoadingStateCallback = (isLoading: boolean, configName: string) => void;
export type LoadingCompleteCallback = (success: boolean, configName: string, error?: string) => void;

/**
 * Network Test Service - Standalone service for loading network configurations
 * Can be used independently from React components with classic DOM event handlers
 */
class NetworkTestService {
  private loadingStateCallback: LoadingStateCallback | null = null;
  private loadingCompleteCallback: LoadingCompleteCallback | null = null;
  private currentConfig: ConfigurationName = 'default';

  /**
   * Set callback for loading state changes
   */
  onLoadingStateChange(callback: LoadingStateCallback | null) {
    this.loadingStateCallback = callback;
  }

  /**
   * Set callback for loading completion
   */
  onLoadingComplete(callback: LoadingCompleteCallback | null) {
    this.loadingCompleteCallback = callback;
  }

  /**
   * Get current configuration name
   */
  getCurrentConfigurationName(): ConfigurationName {
    return this.currentConfig;
  }

  /**
   * Get available configuration names
   */
  getAvailableConfigurations(): ConfigurationName[] {
    return ['default', ...Object.keys(testConfigurations) as Array<keyof typeof testConfigurations>];
  }

  /**
   * Load a network configuration by name
   * This method can be called from anywhere, including classic DOM event handlers
   */
  async loadConfiguration(configName: ConfigurationName): Promise<boolean> {
    // Notify loading state
    if (this.loadingStateCallback) {
      this.loadingStateCallback(true, configName);
    }

    this.currentConfig = configName;
    
    try {
      if (configName === 'default') {
        // Load default configuration
        networkDataService.resetToDefault();
        console.log('✅ Default configuration loaded');
        
        // Notify completion
        if (this.loadingCompleteCallback) {
          this.loadingCompleteCallback(true, configName);
        }
        return true;
        
      } else if (testConfigurations[configName as keyof typeof testConfigurations]) {
        // Load test configuration
        const config = testConfigurations[configName as keyof typeof testConfigurations];
        const result = networkDataService.setConfiguration(config);
        
        if (result.success) {
          console.log(`✅ Configuration "${configName}" loaded successfully`);
          
          // Notify completion
          if (this.loadingCompleteCallback) {
            this.loadingCompleteCallback(true, configName);
          }
          return true;
        } else {
          const errorMsg = `Failed to load configuration "${configName}": ${result.errors?.join(', ')}`;
          console.error(`❌ ${errorMsg}`);
          
          // Notify completion with error
          if (this.loadingCompleteCallback) {
            this.loadingCompleteCallback(false, configName, errorMsg);
          }
          return false;
        }
      } else {
        const errorMsg = `Unknown configuration: ${configName}`;
        console.error(`❌ ${errorMsg}`);
        
        // Notify completion with error
        if (this.loadingCompleteCallback) {
          this.loadingCompleteCallback(false, configName, errorMsg);
        }
        return false;
      }
    } catch (error) {
      const errorMsg = `Error loading configuration: ${error}`;
      console.error('❌', errorMsg);
      
      // Notify completion with error
      if (this.loadingCompleteCallback) {
        this.loadingCompleteCallback(false, configName, errorMsg);
      }
      return false;
    } finally {
      // Add a small delay to see the loading state, then notify loading complete
      setTimeout(() => {
        if (this.loadingStateCallback) {
          this.loadingStateCallback(false, configName);
        }
      }, 300);
    }
  }

  /**
   * Load configuration from JSON string
   */
  async loadFromJSONString(jsonString: string): Promise<boolean> {
    if (this.loadingStateCallback) {
      this.loadingStateCallback(true, 'custom');
    }

    try {
      const result = networkDataService.importConfiguration(jsonString);
      
      if (result.success) {
        this.currentConfig = 'custom';
        console.log('✅ Custom JSON configuration loaded successfully');
        
        if (this.loadingCompleteCallback) {
          this.loadingCompleteCallback(true, 'custom');
        }
        return true;
      } else {
        const errorMsg = `Failed to load JSON configuration: ${result.errors?.join(', ')}`;
        console.error(`❌ ${errorMsg}`);
        
        if (this.loadingCompleteCallback) {
          this.loadingCompleteCallback(false, 'custom', errorMsg);
        }
        return false;
      }
    } catch (error) {
      const errorMsg = `Error parsing JSON: ${error}`;
      console.error('❌', errorMsg);
      
      if (this.loadingCompleteCallback) {
        this.loadingCompleteCallback(false, 'custom', errorMsg);
      }
      return false;
    } finally {
      setTimeout(() => {
        if (this.loadingStateCallback) {
          this.loadingStateCallback(false, 'custom');
        }
      }, 300);
    }
  }

  /**
   * Load configuration from file input
   * Usage: networkTestService.loadFromFile(event.target.files[0])
   */
  async loadFromFile(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const success = await this.loadFromJSONString(content);
        resolve(success);
      };
      
      reader.onerror = () => {
        console.error('❌ Error reading file');
        if (this.loadingCompleteCallback) {
          this.loadingCompleteCallback(false, 'custom', 'Error reading file');
        }
        resolve(false);
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Export current configuration
   */
  exportConfiguration(): void {
    const configJson = networkDataService.exportConfiguration();
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `network-config-${this.currentConfig}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Configuration exported');
  }

  /**
   * Create DOM event handlers for buttons
   * Usage: button.addEventListener('click', networkTestService.createClickHandler('simple'))
   */
  createClickHandler(configName: ConfigurationName) {
    return (event: Event) => {
      event.preventDefault();
      this.loadConfiguration(configName);
    };
  }

  /**
   * Create file input change handler
   * Usage: input.addEventListener('change', networkTestService.createFileHandler())
   */
  createFileHandler() {
    return async (event: Event) => {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      if (file) {
        await this.loadFromFile(file);
        input.value = ''; // Reset input
      }
    };
  }
}

// Create and export singleton instance
export const networkTestService = new NetworkTestService();

// Export for global access (can be used in HTML onclick handlers)
if (typeof window !== 'undefined') {
  (window as any).networkTestService = networkTestService;
  (window as any).loadNetworkConfiguration = (configName: string) => {
    networkTestService.loadConfiguration(configName as ConfigurationName);
  };
}

export default NetworkTestService;
