/**
 * Network Data Service
 * 
 * Service pour gérer les données JSON des nœuds du réseau 3D
 * Permet l'importation, exportation et validation des configurations de nœuds
 */

import { Vector3Tuple } from './ThreeCore';

// Interface pour un nœud de réseau
export interface NetworkNode {
  id: number;
  position: Vector3Tuple;
  radius: number;
  color: string;
  connections: number[];
}

// Interface pour la configuration complète du réseau
export interface NetworkConfiguration {
  version: string;
  metadata: {
    name: string;
    description: string;
    createdAt: string;
    modifiedAt: string;
  };
  nodes: NetworkNode[];
}

// Configuration par défaut du réseau
export const DEFAULT_NETWORK_CONFIG: NetworkConfiguration = {
  version: "1.0.0",
  metadata: {
    name: "Default Network",
    description: "Configuration réseau par défaut avec 10 nœuds",
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
  nodes: [
    // Top row - varied z positions for depth
    {
      id: 0,
      position: [-3, 1, -1.5],
      radius: 0.6,
      color: "#0E48A9",
      connections: [1, 3, 4, 8],
    },
    {
      id: 1,
      position: [0, 2.5, 0.5],
      radius: 0.4,
      color: "#0E48A9",
      connections: [0, 2, 4],
    },
    {
      id: 2,
      position: [3, 1, -0.5],
      radius: 0.5,
      color: "#0E48A9",
      connections: [1, 6],
    },
    // Middle row - more z variation
    {
      id: 3,
      position: [-4, 0, 2],
      radius: 0.8,
      color: "#0E48A9",
      connections: [0, 7],
    },
    {
      id: 4,
      position: [-1, 1, -2],
      radius: 0.4,
      color: "#0E48A9",
      connections: [0, 1, 5],
    },
    {
      id: 5,
      position: [1, 0.75, 0.5],
      radius: 0.5,
      color: "#f97316", // Orange - highlighted key element
      connections: [4, 6, 8],
    },
    {
      id: 6,
      position: [2.5, -1, 1.5],
      radius: 0.6,
      color: "#0E48A9",
      connections: [2, 5, 7, 8, 9],
    },
    // Bottom row - deep z positions
    {
      id: 7,
      position: [-2, -2, 1.5],
      radius: 0.3,
      color: "#0E48A9",
      connections: [3, 6, 8, 9],
    },
    {
      id: 8,
      position: [0, -0.5, 2],
      radius: 0.6,
      color: "#0E48A9",
      connections: [0, 5, 7],
    },
    {
      id: 9,
      position: [-0.5, -3.5, 0],
      radius: 0.7,
      color: "#0E48A9",
      connections: [7, 6],
    },
  ],
};

// Classe de service pour gérer les données du réseau
export class NetworkDataService {
  private static instance: NetworkDataService;
  private currentConfig: NetworkConfiguration;
  private subscribers: ((config: NetworkConfiguration) => void)[] = [];

  private constructor() {
    this.currentConfig = { ...DEFAULT_NETWORK_CONFIG };
  }

  public static getInstance(): NetworkDataService {
    if (!NetworkDataService.instance) {
      NetworkDataService.instance = new NetworkDataService();
    }
    return NetworkDataService.instance;
  }

  // Validation des données
  public validateNetworkNode(node: any): node is NetworkNode {
    return (
      typeof node.id === 'number' &&
      Array.isArray(node.position) &&
      node.position.length === 3 &&
      node.position.every((p: any) => typeof p === 'number') &&
      typeof node.radius === 'number' &&
      node.radius > 0 &&
      typeof node.color === 'string' &&
      node.color.match(/^#[0-9A-Fa-f]{6}$/) &&
      Array.isArray(node.connections) &&
      node.connections.every((c: any) => typeof c === 'number')
    );
  }

  public validateNetworkConfiguration(config: any): config is NetworkConfiguration {
    return (
      config &&
      typeof config.version === 'string' &&
      config.metadata &&
      typeof config.metadata.name === 'string' &&
      typeof config.metadata.description === 'string' &&
      Array.isArray(config.nodes) &&
      config.nodes.every((node: any) => this.validateNetworkNode(node))
    );
  }

  // Validation des connexions
  public validateConnections(nodes: NetworkNode[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const nodeIds = new Set(nodes.map(n => n.id));

    // Vérifier que tous les IDs sont uniques
    if (nodeIds.size !== nodes.length) {
      errors.push("Duplicate node IDs found");
    }

    // Vérifier que toutes les connexions pointent vers des nœuds existants
    nodes.forEach(node => {
      node.connections.forEach(connId => {
        if (!nodeIds.has(connId)) {
          errors.push(`Node ${node.id} has invalid connection to non-existent node ${connId}`);
        }
        if (connId === node.id) {
          errors.push(`Node ${node.id} cannot connect to itself`);
        }
      });
    });

    return { isValid: errors.length === 0, errors };
  }

  // Gestion de la configuration
  public getCurrentConfiguration(): NetworkConfiguration {
    return { ...this.currentConfig };
  }

  public setConfiguration(config: NetworkConfiguration): { success: boolean; errors?: string[] } {
    console.log('🔄 Setting new network configuration:', config);

    if (!this.validateNetworkConfiguration(config)) {
      return { success: false, errors: ['Invalid network configuration format'] };
    }

    const connectionValidation = this.validateConnections(config.nodes);
    if (!connectionValidation.isValid) {
      return { success: false, errors: connectionValidation.errors };
    }

    // Mettre à jour la configuration
    this.currentConfig = {
      ...config,
      metadata: {
        ...config.metadata,
        modifiedAt: new Date().toISOString()
      }
    };

    // Notifier les abonnés
    this.notifySubscribers();

    console.log('✅ Network configuration updated successfully');
    return { success: true };
  }

  // Gestion des abonnements
  public subscribe(callback: (config: NetworkConfiguration) => void): () => void {
    this.subscribers.push(callback);
    
    // Retourner la fonction de désabonnement
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.currentConfig));
  }

  // Import/Export
  public exportConfiguration(): string {
    return JSON.stringify(this.currentConfig, null, 2);
  }

  public importConfiguration(jsonString: string): { success: boolean; errors?: string[] } {
    try {
      const config = JSON.parse(jsonString);
      return this.setConfiguration(config);
    } catch (error) {
      return { 
        success: false, 
        errors: [`Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      };
    }
  }

  // Manipulation des nœuds
  public addNode(node: NetworkNode): { success: boolean; errors?: string[] } {
    if (!this.validateNetworkNode(node)) {
      return { success: false, errors: ['Invalid node format'] };
    }

    const nodeIds = new Set(this.currentConfig.nodes.map(n => n.id));
    if (nodeIds.has(node.id)) {
      return { success: false, errors: [`Node with ID ${node.id} already exists`] };
    }

    const newConfig = {
      ...this.currentConfig,
      nodes: [...this.currentConfig.nodes, node],
      metadata: {
        ...this.currentConfig.metadata,
        modifiedAt: new Date().toISOString()
      }
    };

    return this.setConfiguration(newConfig);
  }

  public updateNode(id: number, updates: Partial<NetworkNode>): { success: boolean; errors?: string[] } {
    const nodeIndex = this.currentConfig.nodes.findIndex(n => n.id === id);
    if (nodeIndex === -1) {
      return { success: false, errors: [`Node with ID ${id} not found`] };
    }

    const updatedNode = { ...this.currentConfig.nodes[nodeIndex], ...updates };
    if (!this.validateNetworkNode(updatedNode)) {
      return { success: false, errors: ['Invalid node format after update'] };
    }

    const newNodes = [...this.currentConfig.nodes];
    newNodes[nodeIndex] = updatedNode;

    const newConfig = {
      ...this.currentConfig,
      nodes: newNodes,
      metadata: {
        ...this.currentConfig.metadata,
        modifiedAt: new Date().toISOString()
      }
    };

    return this.setConfiguration(newConfig);
  }

  public removeNode(id: number): { success: boolean; errors?: string[] } {
    const nodeIndex = this.currentConfig.nodes.findIndex(n => n.id === id);
    if (nodeIndex === -1) {
      return { success: false, errors: [`Node with ID ${id} not found`] };
    }

    // Supprimer le nœud et toutes les connexions vers ce nœud
    const newNodes = this.currentConfig.nodes
      .filter(n => n.id !== id)
      .map(n => ({
        ...n,
        connections: n.connections.filter(connId => connId !== id)
      }));

    const newConfig = {
      ...this.currentConfig,
      nodes: newNodes,
      metadata: {
        ...this.currentConfig.metadata,
        modifiedAt: new Date().toISOString()
      }
    };

    return this.setConfiguration(newConfig);
  }

  // Configurations prédéfinies
  public getPresetConfigurations(): { [key: string]: NetworkConfiguration } {
    return {
      default: DEFAULT_NETWORK_CONFIG,
      simple: {
        version: "1.0.0",
        metadata: {
          name: "Simple Network",
          description: "Configuration simple avec 5 nœuds",
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
        },
        nodes: [
          { id: 0, position: [0, 0, 0], radius: 0.5, color: "#0E48A9", connections: [1, 2] },
          { id: 1, position: [-2, 1, 0], radius: 0.4, color: "#0E48A9", connections: [0, 3] },
          { id: 2, position: [2, 1, 0], radius: 0.4, color: "#0E48A9", connections: [0, 4] },
          { id: 3, position: [-1, -1, 1], radius: 0.3, color: "#f97316", connections: [1] },
          { id: 4, position: [1, -1, 1], radius: 0.3, color: "#0E48A9", connections: [2] },
        ],
      },
      complex: {
        version: "1.0.0",
        metadata: {
          name: "Complex Network",
          description: "Configuration complexe avec 15 nœuds",
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
        },
        nodes: Array.from({ length: 15 }, (_, i) => ({
          id: i,
          position: [
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 4
          ] as Vector3Tuple,
          radius: 0.2 + Math.random() * 0.6,
          color: i === 7 ? "#f97316" : "#0E48A9",
          connections: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => 
            Math.floor(Math.random() * 15)).filter(id => id !== i)
        })),
      }
    };
  }

  // Reset vers la configuration par défaut
  public resetToDefault(): void {
    this.setConfiguration({ ...DEFAULT_NETWORK_CONFIG });
  }
}

// Instance singleton
export const networkDataService = NetworkDataService.getInstance();

export default NetworkDataService;