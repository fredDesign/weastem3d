import ScrollScrubExamples from './ScrollScrubExamples';
import ScrollCameraController from './ScrollCameraController';

const ScrubDemoPage = () => {
  return (
    <div className="relative">
      {/* Contrôleur de caméra pour les exemples */}
      <ScrollCameraController 
        selector="[data-scroll-camera]"
        enabled={true}
        debug={true}
      />

      {/* Header explicatif */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-4xl font-bold mb-6">
            Comprendre la propriété `scrub` 📜
          </h1>
          <p className="text-xl opacity-90 mb-8">
            Découvrez comment `scrub` transforme vos animations en les liant directement au scroll
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-bold mb-2">🚀 scrub: false</h3>
              <p className="text-sm opacity-90">
                Animation classique qui se déclenche à l'entrée/sortie de la zone
              </p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-bold mb-2">⚡ scrub: true</h3>
              <p className="text-sm opacity-90">
                Animation liée instantanément à la position de scroll
              </p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-bold mb-2">🌊 scrub: 0.5</h3>
              <p className="text-sm opacity-90">
                Animation avec délai/smoothing pour un effet fluide
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Exemples de scrub */}
      <ScrollScrubExamples />

      {/* Section pratique avec notre système de caméra */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Application pratique : Contrôle de caméra 3D
          </h2>

          {/* Exemple de caméra avec scrub */}
          <div 
            className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 rounded-xl p-8 mb-8 flex items-center justify-center"
            data-scroll-camera="true"
            data-scroll-start="top 80%"
            data-scroll-end="bottom 20%"
            data-scroll-scrub="true"
            data-on-enter-zoom="2"
            data-on-enter-position-x="8"
            data-on-enter-position-y="4"
            data-on-enter-position-z="8"
            data-on-enter-target-x="0"
            data-on-enter-target-y="0"
            data-on-enter-target-z="0"
          >
            <div className="text-center max-w-2xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">
                🎥 Caméra avec scrub: true
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                Cette section utilise <code className="bg-gray-200 px-2 py-1 rounded">scrub: true</code> 
                pour contrôler la caméra 3D. La caméra se déplace progressivement selon votre scroll.
              </p>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="font-semibold mb-3">Configuration utilisée :</h4>
                <pre className="text-left text-sm bg-gray-100 p-3 rounded overflow-x-auto">
{`data-scroll-scrub="true"
data-on-enter-zoom="2"
data-on-enter-position-x="8"
data-on-enter-position-y="4" 
data-on-enter-position-z="8"`}
                </pre>
              </div>
            </div>
          </div>

          {/* Exemple de caméra sans scrub */}
          <div 
            className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 rounded-xl p-8 mb-8 flex items-center justify-center"
            data-scroll-camera="true"
            data-scroll-start="top 80%"
            data-scroll-end="bottom 20%"
            data-scroll-scrub="false"
            data-on-enter-zoom="1.5"
            data-on-enter-position-x="0"
            data-on-enter-position-y="12"
            data-on-enter-position-z="0"
            data-on-enter-target-x="0"
            data-on-enter-target-y="0"
            data-on-enter-target-z="0"
          >
            <div className="text-center max-w-2xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">
                📸 Caméra sans scrub (animation classique)
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                Cette section utilise <code className="bg-gray-200 px-2 py-1 rounded">scrub: false</code>. 
                La caméra se déplace instantanément quand on entre dans la zone.
              </p>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="font-semibold mb-3">Configuration utilisée :</h4>
                <pre className="text-left text-sm bg-gray-100 p-3 rounded overflow-x-auto">
{`data-scroll-scrub="false"
data-on-enter-zoom="1.5"
data-on-enter-position-x="0"
data-on-enter-position-y="12"
data-on-enter-position-z="0"`}
                </pre>
              </div>
            </div>
          </div>

          {/* Exemple de caméra avec scrub délayé */}
          <div 
            className="min-h-screen bg-gradient-to-b from-purple-100 to-purple-200 rounded-xl p-8 flex items-center justify-center"
            data-scroll-camera="true"
            data-scroll-start="top 80%"
            data-scroll-end="bottom 20%"
            data-scroll-scrub="1"
            data-on-enter-zoom="2.5"
            data-on-enter-position-x="15"
            data-on-enter-position-y="2"
            data-on-enter-position-z="0"
            data-on-enter-target-x="0"
            data-on-enter-target-y="0"
            data-on-enter-target-z="0"
          >
            <div className="text-center max-w-2xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">
                🌊 Caméra avec scrub délayé
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                Cette section utilise <code className="bg-gray-200 px-2 py-1 rounded">scrub: 1</code>. 
                La caméra suit le scroll avec un délai de 1 seconde pour un effet fluide.
              </p>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="font-semibold mb-3">Configuration utilisée :</h4>
                <pre className="text-left text-sm bg-gray-100 p-3 rounded overflow-x-auto">
{`data-scroll-scrub="1"
data-on-enter-zoom="2.5"
data-on-enter-position-x="15"
data-on-enter-position-y="2"
data-on-enter-position-z="0"`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé et meilleures pratiques */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            📋 Guide des meilleures pratiques
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-green-400">✅ Quand utiliser scrub</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Parallax scrolling</strong> - Mouvement lié au scroll</li>
                <li>• <strong>Révélation progressive</strong> - Contenu qui apparaît graduellement</li>
                <li>• <strong>Contrôle de caméra 3D</strong> - Mouvement cinématographique fluide</li>
                <li>• <strong>Morphing d'éléments</strong> - Transformation progressive</li>
                <li>• <strong>Narration interactive</strong> - Histoire qui avance avec le scroll</li>
              </ul>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-red-400">❌ Quand éviter scrub</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Animations courtes</strong> - Effets rapides d'apparition</li>
                <li>• <strong>Notifications</strong> - Alertes qui doivent apparaître immédiatement</li>
                <li>• <strong>Interactions utilisateur</strong> - Boutons, hovers, etc.</li>
                <li>• <strong>Contenu critique</strong> - Information importante à montrer rapidement</li>
                <li>• <strong>Mobile avec scroll rapide</strong> - Peut créer des saccades</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-blue-900/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-blue-400">💡 Valeurs recommandées</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">scrub: true</h4>
                <p>Pour un contrôle précis et une réactivité maximale</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">scrub: 0.1-0.5</h4>
                <p>Pour un effet légèrement fluide sans perdre la réactivité</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">scrub: 1-2</h4>
                <p>Pour des effets très fluides et organiques</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrubDemoPage;