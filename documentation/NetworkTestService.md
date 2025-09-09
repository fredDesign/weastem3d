# NetworkTestService - Guide d'utilisation

Le `NetworkTestService` permet d'utiliser les méthodes de l'Animation Test Loader en dehors du composant React, avec des triggers de click classiques.

## 🚀 Installation et Utilisation

### 1. Importation du service

```typescript
import { networkTestService } from './components/NetworkTestService';
```

### 2. Utilisation globale (dans le navigateur)

Le service est automatiquement disponible dans le scope global :

```javascript
// Via l'instance du service
window.networkTestService.loadConfiguration('simple');

// Via la fonction simplifiée
window.loadNetworkConfiguration('expanded');
```

## 📋 API du NetworkTestService

### Méthodes principales

#### `loadConfiguration(configName: ConfigurationName): Promise<boolean>`
Charge une configuration réseau par son nom.

```javascript
// Configurations disponibles : 'default', 'simple', 'expanded', 'moved', 'complex'
await networkTestService.loadConfiguration('simple');
```

#### `loadFromFile(file: File): Promise<boolean>`
Charge une configuration depuis un fichier JSON.

```javascript
const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    await networkTestService.loadFromFile(file);
  }
});
```

#### `loadFromJSONString(jsonString: string): Promise<boolean>`
Charge une configuration depuis une chaîne JSON.

```javascript
const jsonConfig = '{"version": "1.0.0", "nodes": [...]}';
await networkTestService.loadFromJSONString(jsonConfig);
```

#### `exportConfiguration(): void`
Exporte la configuration actuelle en fichier JSON.

```javascript
networkTestService.exportConfiguration();
```

### Méthodes utilitaires

#### `getCurrentConfigurationName(): ConfigurationName`
Retourne le nom de la configuration actuelle.

#### `getAvailableConfigurations(): ConfigurationName[]`
Retourne la liste des configurations disponibles.

#### `createClickHandler(configName: ConfigurationName)`
Crée un gestionnaire de click optimisé pour les boutons.

```javascript
const button = document.getElementById('simple-btn');
button.addEventListener('click', networkTestService.createClickHandler('simple'));
```

#### `createFileHandler()`
Crée un gestionnaire de changement pour les inputs de type file.

```javascript
const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', networkTestService.createFileHandler());
```

### Callbacks et événements

#### `onLoadingStateChange(callback: LoadingStateCallback | null)`
Définit un callback appelé lors des changements d'état de chargement.

```javascript
networkTestService.onLoadingStateChange((isLoading, configName) => {
  console.log(`Loading ${configName}: ${isLoading}`);
});
```

#### `onLoadingComplete(callback: LoadingCompleteCallback | null)`
Définit un callback appelé à la fin du chargement.

```javascript
networkTestService.onLoadingComplete((success, configName, error) => {
  if (success) {
    console.log(`✅ ${configName} loaded successfully`);
  } else {
    console.error(`❌ Error loading ${configName}: ${error}`);
  }
});
```

## 📝 Exemples d'utilisation

### Exemple 1: Boutons avec gestionnaires d'événements

```html
<button id="simple-btn">Load Simple</button>
<button id="export-btn">Export</button>
<input type="file" id="import-file" accept=".json">

<script>
document.addEventListener('DOMContentLoaded', () => {
  // Charger une configuration
  document.getElementById('simple-btn').addEventListener('click', 
    () => networkTestService.loadConfiguration('simple'));
  
  // Exporter
  document.getElementById('export-btn').addEventListener('click', 
    () => networkTestService.exportConfiguration());
  
  // Importer
  document.getElementById('import-file').addEventListener('change', 
    networkTestService.createFileHandler());
});
</script>
```

### Exemple 2: Utilisation avec onclick inline

```html
<button onclick="loadNetworkConfiguration('simple')">Load Simple</button>
<button onclick="networkTestService.loadConfiguration('expanded')">Load Expanded</button>
<button onclick="networkTestService.exportConfiguration()">Export</button>
```

### Exemple 3: Interface dynamique

```javascript
function createNetworkControls() {
  const container = document.getElementById('controls');
  const configs = networkTestService.getAvailableConfigurations();
  
  configs.forEach(configName => {
    const button = document.createElement('button');
    button.textContent = configName;
    button.addEventListener('click', networkTestService.createClickHandler(configName));
    container.appendChild(button);
  });
}
```

### Exemple 4: Séquence automatique

```javascript
async function runSequence() {
  const configs = ['simple', 'expanded', 'moved', 'complex'];
  
  for (const config of configs) {
    await networkTestService.loadConfiguration(config);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('Sequence completed!');
}
```

### Exemple 5: Interface avec feedback visuel

```javascript
// Configuration des callbacks
networkTestService.onLoadingStateChange((isLoading, configName) => {
  const loader = document.getElementById('loader');
  const buttons = document.querySelectorAll('button[data-config]');
  
  loader.style.display = isLoading ? 'block' : 'none';
  buttons.forEach(btn => btn.disabled = isLoading);
});

networkTestService.onLoadingComplete((success, configName, error) => {
  const status = document.getElementById('status');
  
  if (success) {
    status.textContent = `✅ ${configName} loaded`;
    status.className = 'success';
  } else {
    status.textContent = `❌ Error: ${error}`;
    status.className = 'error';
  }
});
```

## 🎯 Configurations disponibles

| Nom | Description | Nœuds |
|-----|-------------|-------|
| `'default'` | Configuration par défaut du système | Variable |
| `'simple'` | Réseau simple pour les tests | 3 nœuds |
| `'expanded'` | Réseau étendu avec plus de connexions | 6 nœuds |
| `'moved'` | Réseau avec nœuds repositionnés | 3 nœuds |
| `'complex'` | Réseau complexe multi-niveaux | 11 nœuds |
| `'custom'` | Configuration importée depuis JSON | Variable |

## 🔄 Types TypeScript

```typescript
type ConfigurationName = 'default' | 'simple' | 'expanded' | 'moved' | 'complex' | 'custom';

type LoadingStateCallback = (isLoading: boolean, configName: string) => void;
type LoadingCompleteCallback = (success: boolean, configName: string, error?: string) => void;
```

## 📁 Fichier de démonstration

Consultez `examples/network-test-demo.html` pour voir un exemple complet d'utilisation avec interface Bootstrap et console de logs.

## 🔧 Intégration

Pour utiliser le service dans votre application :

1. **Importer le service** dans vos modules TypeScript/JavaScript
2. **Configurer les callbacks** pour le feedback visuel
3. **Créer les gestionnaires d'événements** pour vos éléments d'interface
4. **Tester** avec les configurations prédéfinies

Le service est automatiquement disponible dans `window.networkTestService` pour une utilisation globale, et la fonction simplifiée `window.loadNetworkConfiguration` est également disponible pour les onclick inline.

## ⚠️ Notes importantes

- Le service utilise des **Promises** - n'oubliez pas d'utiliser `await` ou `.then()`
- Les **callbacks sont optionnels** mais recommandés pour le feedback utilisateur
- Le service maintient l'**état de la configuration actuelle**
- Les **erreurs sont automatiquement loggées** dans la console
- Compatible avec les **gestionnaires d'événements classiques** et les **onclick inline**
