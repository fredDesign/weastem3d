import React, { useState, useRef, useEffect } from 'react';
import { networkDataService, NetworkConfiguration, NetworkNode } from './NetworkDataService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { Upload, Download, RefreshCw, Plus, Trash2, Save, Eye, EyeOff, Edit, X, Check } from 'lucide-react';

interface NetworkDataManagerProps {
  onConfigurationChange?: (config: NetworkConfiguration) => void;
  className?: string;
}

const NetworkDataManager: React.FC<NetworkDataManagerProps> = ({
  onConfigurationChange,
  className = ""
}) => {
  const [currentConfig, setCurrentConfig] = useState<NetworkConfiguration>(
    networkDataService.getCurrentConfiguration()
  );
  const [jsonInput, setJsonInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingNode, setEditingNode] = useState<NetworkNode | null>(null);
  const [editNodeData, setEditNodeData] = useState<NetworkNode | null>(null);
  const [newNodeData, setNewNodeData] = useState<Partial<NetworkNode>>({
    id: 0,
    position: [0, 0, 0],
    radius: 0.5,
    color: '#0E48A9',
    connections: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // S'abonner aux changements de configuration
  useEffect(() => {
    const unsubscribe = networkDataService.subscribe((config) => {
      setCurrentConfig(config);
      onConfigurationChange?.(config);
      // Reset editing state if node no longer exists
      if (editingNode && !config.nodes.find(n => n.id === editingNode.id)) {
        setEditingNode(null);
        setEditNodeData(null);
      }
    });

    return unsubscribe;
  }, [onConfigurationChange, editingNode]);

  // Mettre à jour l'affichage JSON quand la configuration change
  useEffect(() => {
    if (activeTab === 'json') {
      setJsonInput(networkDataService.exportConfiguration());
    }
  }, [currentConfig, activeTab]);

  // Initialize new node ID when config changes
  useEffect(() => {
    const maxId = currentConfig.nodes.length > 0 
      ? Math.max(...currentConfig.nodes.map(n => n.id)) 
      : -1;
    setNewNodeData(prev => ({
      ...prev,
      id: maxId + 1
    }));
  }, [currentConfig.nodes]);

  // Gestion de l'importation de fichier
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = networkDataService.importConfiguration(content);
      
      if (result.success) {
        toast.success('Configuration imported successfully');
      } else {
        toast.error(`Import failed: ${result.errors?.join(', ')}`);
      }
    };
    reader.readAsText(file);
  };

  // Export de la configuration
  const handleExport = () => {
    const configJson = networkDataService.exportConfiguration();
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `network-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Configuration exported');
  };

  // Application d'une configuration JSON
  const handleJsonApply = () => {
    const result = networkDataService.importConfiguration(jsonInput);
    
    if (result.success) {
      toast.success('JSON configuration applied');
    } else {
      toast.error(`Failed to apply configuration: ${result.errors?.join(', ')}`);
    }
  };

  // Chargement d'une configuration prédéfinie
  const handlePresetLoad = (presetName: string) => {
    const presets = networkDataService.getPresetConfigurations();
    const preset = presets[presetName];
    
    if (preset) {
      const result = networkDataService.setConfiguration(preset);
      if (result.success) {
        toast.success(`Preset "${presetName}" loaded`);
      } else {
        toast.error(`Failed to load preset: ${result.errors?.join(', ')}`);
      }
    }
  };

  // Ajout d'un nouveau nœud
  const handleAddNode = () => {
    if (newNodeData.id !== undefined && newNodeData.position && newNodeData.radius && newNodeData.color) {
      const node: NetworkNode = {
        id: newNodeData.id,
        position: newNodeData.position,
        radius: newNodeData.radius,
        color: newNodeData.color,
        connections: newNodeData.connections || []
      };

      const result = networkDataService.addNode(node);
      if (result.success) {
        toast.success(`Node ${node.id} added`);
        // Reset form
        const maxId = Math.max(...currentConfig.nodes.map(n => n.id), node.id);
        setNewNodeData({
          id: maxId + 1,
          position: [0, 0, 0],
          radius: 0.5,
          color: '#0E48A9',
          connections: []
        });
      } else {
        toast.error(`Failed to add node: ${result.errors?.join(', ')}`);
      }
    }
  };

  // Suppression d'un nœud
  const handleDeleteNode = (id: number) => {
    const result = networkDataService.removeNode(id);
    if (result.success) {
      toast.success(`Node ${id} deleted`);
      // Cancel editing if this node was being edited
      if (editingNode?.id === id) {
        setEditingNode(null);
        setEditNodeData(null);
      }
    } else {
      toast.error(`Failed to delete node: ${result.errors?.join(', ')}`);
    }
  };

  // Démarrer l'édition d'un nœud
  const handleStartEdit = (node: NetworkNode) => {
    setEditingNode(node);
    setEditNodeData({ ...node });
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditingNode(null);
    setEditNodeData(null);
  };

  // Sauvegarder l'édition
  const handleSaveEdit = () => {
    if (!editNodeData || !editingNode) return;

    const result = networkDataService.updateNode(editingNode.id, editNodeData);
    if (result.success) {
      toast.success(`Node ${editingNode.id} updated`);
      setEditingNode(null);
      setEditNodeData(null);
    } else {
      toast.error(`Failed to update node: ${result.errors?.join(', ')}`);
    }
  };

  // Mettre à jour les connexions en format string pour l'input
  const connectionsToString = (connections: number[]): string => {
    return connections.join(', ');
  };

  // Parser les connexions depuis un string
  const parseConnectionsString = (connectionsStr: string): number[] => {
    return connectionsStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== '')
      .map(s => parseInt(s))
      .filter(n => !isNaN(n));
  };

  if (!isExpanded) {
    return (
      <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
        <Button
          onClick={() => setIsExpanded(true)}
          className="bg-black/90 text-white hover:bg-black/80 backdrop-blur-sm"
          size="sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          Network Data Manager
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
      <Card className="w-96 max-h-[80vh] overflow-hidden bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Network Data Manager</CardTitle>
              <CardDescription>
                Manage network configuration with {currentConfig.nodes.length} nodes
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mx-4 mb-4">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="nodes" className="text-xs">Nodes</TabsTrigger>
              <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
              <TabsTrigger value="presets" className="text-xs">Presets</TabsTrigger>
            </TabsList>

            <div className="max-h-[50vh] overflow-y-auto px-4 pb-4">
              <TabsContent value="overview" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Configuration Info</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span> {currentConfig.metadata.name}
                      </div>
                      <div>
                        <span className="text-gray-600">Nodes:</span> {currentConfig.nodes.length}
                      </div>
                      <div>
                        <span className="text-gray-600">Connections:</span>{' '}
                        {currentConfig.nodes.reduce((sum, node) => sum + node.connections.length, 0)}
                      </div>
                      <div>
                        <span className="text-gray-600">Modified:</span>{' '}
                        {new Date(currentConfig.metadata.modifiedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleExport}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Import
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => networkDataService.resetToDefault()}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Reset to Default
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="nodes" className="mt-0">
                <div className="space-y-4">
                  {/* Add New Node Section */}
                  <div>
                    <h4 className="font-medium mb-2">Add New Node</h4>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="ID"
                          value={newNodeData.id || ''}
                          onChange={(e) => setNewNodeData(prev => ({ 
                            ...prev, 
                            id: parseInt(e.target.value) || 0 
                          }))}
                        />
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Radius"
                          value={newNodeData.radius || ''}
                          onChange={(e) => setNewNodeData(prev => ({ 
                            ...prev, 
                            radius: parseFloat(e.target.value) || 0.5 
                          }))}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="X"
                          value={newNodeData.position?.[0] || ''}
                          onChange={(e) => setNewNodeData(prev => ({ 
                            ...prev, 
                            position: [parseFloat(e.target.value) || 0, prev.position?.[1] || 0, prev.position?.[2] || 0] 
                          }))}
                        />
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Y"
                          value={newNodeData.position?.[1] || ''}
                          onChange={(e) => setNewNodeData(prev => ({ 
                            ...prev, 
                            position: [prev.position?.[0] || 0, parseFloat(e.target.value) || 0, prev.position?.[2] || 0] 
                          }))}
                        />
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Z"
                          value={newNodeData.position?.[2] || ''}
                          onChange={(e) => setNewNodeData(prev => ({ 
                            ...prev, 
                            position: [prev.position?.[0] || 0, prev.position?.[1] || 0, parseFloat(e.target.value) || 0] 
                          }))}
                        />
                      </div>
                      <Input
                        type="color"
                        value={newNodeData.color || '#0E48A9'}
                        onChange={(e) => setNewNodeData(prev => ({ ...prev, color: e.target.value }))}
                      />
                      <Input
                        placeholder="Connections (e.g., 1, 2, 3)"
                        value={connectionsToString(newNodeData.connections || [])}
                        onChange={(e) => setNewNodeData(prev => ({ 
                          ...prev, 
                          connections: parseConnectionsString(e.target.value)
                        }))}
                      />
                      <Button onClick={handleAddNode} size="sm" className="w-full">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Node
                      </Button>
                    </div>
                  </div>

                  {/* Existing Nodes Section */}
                  <div>
                    <h4 className="font-medium mb-2">Existing Nodes</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {currentConfig.nodes.map(node => (
                        <div key={node.id}>
                          {/* Non-editing view */}
                          {editingNode?.id !== node.id && (
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: node.color }}
                                />
                                <span>Node {node.id}</span>
                                <Badge variant="secondary" className="text-xs">
                                  r: {node.radius}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {node.connections.length} conn
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleStartEdit(node)}
                                  className="p-1 h-6 w-6"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteNode(node.id)}
                                  className="p-1 h-6 w-6 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Editing view */}
                          {editingNode?.id === node.id && editNodeData && (
                            <div className="p-2 bg-blue-50 rounded border border-blue-200">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">Editing Node {node.id}</span>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={handleSaveEdit}
                                      className="p-1 h-6 w-6 text-green-600 hover:text-green-700"
                                    >
                                      <Check className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={handleCancelEdit}
                                      className="p-1 h-6 w-6 text-gray-600 hover:text-gray-700"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-1">
                                  <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="Radius"
                                    value={editNodeData.radius}
                                    onChange={(e) => setEditNodeData(prev => prev ? ({
                                      ...prev,
                                      radius: parseFloat(e.target.value) || 0.5
                                    }) : null)}
                                    className="text-xs h-7"
                                  />
                                  <Input
                                    type="color"
                                    value={editNodeData.color}
                                    onChange={(e) => setEditNodeData(prev => prev ? ({
                                      ...prev,
                                      color: e.target.value
                                    }) : null)}
                                    className="text-xs h-7"
                                  />
                                </div>

                                <div className="grid grid-cols-3 gap-1">
                                  <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="X"
                                    value={editNodeData.position[0]}
                                    onChange={(e) => setEditNodeData(prev => prev ? ({
                                      ...prev,
                                      position: [parseFloat(e.target.value) || 0, prev.position[1], prev.position[2]]
                                    }) : null)}
                                    className="text-xs h-7"
                                  />
                                  <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="Y"
                                    value={editNodeData.position[1]}
                                    onChange={(e) => setEditNodeData(prev => prev ? ({
                                      ...prev,
                                      position: [prev.position[0], parseFloat(e.target.value) || 0, prev.position[2]]
                                    }) : null)}
                                    className="text-xs h-7"
                                  />
                                  <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="Z"
                                    value={editNodeData.position[2]}
                                    onChange={(e) => setEditNodeData(prev => prev ? ({
                                      ...prev,
                                      position: [prev.position[0], prev.position[1], parseFloat(e.target.value) || 0]
                                    }) : null)}
                                    className="text-xs h-7"
                                  />
                                </div>

                                <Input
                                  placeholder="Connections (e.g., 1, 2, 3)"
                                  value={connectionsToString(editNodeData.connections)}
                                  onChange={(e) => setEditNodeData(prev => prev ? ({
                                    ...prev,
                                    connections: parseConnectionsString(e.target.value)
                                  }) : null)}
                                  className="text-xs h-7"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="json" className="mt-0">
                <div className="space-y-4">
                  <Textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="Paste JSON configuration here..."
                    className="h-48 text-xs font-mono"
                  />
                  <Button onClick={handleJsonApply} className="w-full">
                    <Save className="w-4 h-4 mr-1" />
                    Apply JSON Configuration
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="presets" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Load Preset Configuration</h4>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handlePresetLoad('default')}
                        className="w-full justify-start"
                      >
                        Default Network (10 nodes)
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handlePresetLoad('simple')}
                        className="w-full justify-start"
                      >
                        Simple Network (5 nodes)
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handlePresetLoad('complex')}
                        className="w-full justify-start"
                      >
                        Complex Network (15 nodes)
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        className="hidden"
      />
    </div>
  );
};

export default NetworkDataManager;