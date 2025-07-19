import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const ScrollScrubExamples = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Exemple 1: scrub: false (par défaut)
    // Animation se déclenche instantanément quand on entre dans la zone
    ScrollTrigger.create({
      trigger: "#example-no-scrub",
      start: "top 80%",
      end: "bottom 20%",
      scrub: false, // Animation normale, non liée au scroll
      onEnter: () => {
        gsap.to("#box-no-scrub", {
          duration: 1,
          x: 200,
          rotation: 360,
          backgroundColor: "#ff6b6b"
        });
      },
      onLeave: () => {
        gsap.to("#box-no-scrub", {
          duration: 1,
          x: 0,
          rotation: 0,
          backgroundColor: "#4ecdc4"
        });
      },
      markers: true
    });

    // Exemple 2: scrub: true
    // Animation directement liée à la position de scroll
    gsap.to("#box-scrub-true", {
      x: 200,
      rotation: 360,
      backgroundColor: "#45b7d1",
      scrollTrigger: {
        trigger: "#example-scrub-true",
        start: "top 80%",
        end: "bottom 20%",
        scrub: true, // Animation suit exactement le scroll
        markers: true
      }
    });

    // Exemple 3: scrub: 1 (avec délai)
    // Animation suit le scroll avec un léger délai/smoothing
    gsap.to("#box-scrub-delay", {
      x: 200,
      rotation: 360,
      backgroundColor: "#f9ca24",
      scrollTrigger: {
        trigger: "#example-scrub-delay",
        start: "top 80%",
        end: "bottom 20%",
        scrub: 1, // 1 seconde de délai/smoothing
        markers: true
      }
    });

    // Exemple 4: Animation complexe avec scrub
    gsap.timeline({
      scrollTrigger: {
        trigger: "#example-complex-scrub",
        start: "top 80%",
        end: "bottom 20%",
        scrub: 0.5,
        markers: true
      }
    })
    .to("#box-complex", { scale: 1.5, duration: 1 })
    .to("#box-complex", { x: 200, duration: 1 })
    .to("#box-complex", { rotation: 720, backgroundColor: "#e056fd", duration: 1 });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <div className="bg-gray-100 p-8 rounded-lg mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          📜 Propriété `scrub` dans ScrollTrigger
        </h2>
        <div className="bg-white p-4 rounded border-l-4 border-blue-500">
          <h3 className="font-semibold text-lg mb-2">Qu'est-ce que `scrub` ?</h3>
          <p className="text-gray-700 mb-4">
            La propriété `scrub` lie directement la progression de l'animation à la position de scroll. 
            Au lieu que l'animation se joue automatiquement, elle avance et recule selon le scroll.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-600">Valeurs possibles :</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li><code>false</code> - Pas de scrub (défaut)</li>
                <li><code>true</code> - Scrub instantané</li>
                <li><code>0.5</code> - Scrub avec 0.5s de délai</li>
                <li><code>2</code> - Scrub avec 2s de délai</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-600">Cas d'usage :</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Parallax scrolling</li>
                <li>Animations de révélation progressive</li>
                <li>Contrôle de caméra 3D fluide</li>
                <li>Morphing d'éléments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Exemple 1: Sans scrub */}
      <div id="example-no-scrub" className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 to-pink-400 mb-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-8">
            Exemple 1: scrub: false (Animation normale)
          </h3>
          <div 
            id="box-no-scrub" 
            className="w-16 h-16 bg-teal-400 mx-auto rounded-lg shadow-lg"
          ></div>
          <p className="text-white mt-4 max-w-md mx-auto">
            L'animation se déclenche instantanément quand on entre dans la zone, 
            indépendamment de la vitesse de scroll.
          </p>
        </div>
      </div>

      {/* Exemple 2: Scrub true */}
      <div id="example-scrub-true" className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-cyan-400 mb-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-8">
            Exemple 2: scrub: true (Scrub instantané)
          </h3>
          <div 
            id="box-scrub-true" 
            className="w-16 h-16 bg-teal-400 mx-auto rounded-lg shadow-lg"
          ></div>
          <p className="text-white mt-4 max-w-md mx-auto">
            L'animation suit exactement votre scroll. Scrollez vers le haut/bas 
            pour voir l'animation aller et venir.
          </p>
        </div>
      </div>

      {/* Exemple 3: Scrub avec délai */}
      <div id="example-scrub-delay" className="min-h-screen flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-400 mb-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-8">
            Exemple 3: scrub: 1 (Scrub avec délai)
          </h3>
          <div 
            id="box-scrub-delay" 
            className="w-16 h-16 bg-teal-400 mx-auto rounded-lg shadow-lg"
          ></div>
          <p className="text-white mt-4 max-w-md mx-auto">
            L'animation suit le scroll mais avec un délai de 1 seconde, 
            créant un effet de "catch-up" fluide.
          </p>
        </div>
      </div>

      {/* Exemple 4: Animation complexe avec scrub */}
      <div id="example-complex-scrub" className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 to-purple-600 mb-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-8">
            Exemple 4: Timeline complexe avec scrub: 0.5
          </h3>
          <div 
            id="box-complex" 
            className="w-16 h-16 bg-teal-400 mx-auto rounded-lg shadow-lg"
          ></div>
          <p className="text-white mt-4 max-w-md mx-auto">
            Animation multi-étapes (scale → translation → rotation) 
            contrôlée par le scroll avec un léger smoothing.
          </p>
        </div>
      </div>

      {/* Section d'explication technique */}
      <div className="bg-gray-900 text-white p-8 rounded-lg">
        <h3 className="text-xl font-bold mb-4">🔧 Implémentation technique</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-blue-400 mb-2">Pour les contrôles de caméra :</h4>
            <pre className="bg-gray-800 p-3 rounded text-sm overflow-x-auto">
{`// Caméra suit le scroll fluide
data-scroll-scrub="true"

// Caméra avec délai de 0.5s
data-scroll-scrub="0.5"

// Caméra instantanée (défaut)
data-scroll-scrub="false"`}
            </pre>
          </div>
          <div>
            <h4 className="font-semibold text-green-400 mb-2">Avantages du scrub :</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Contrôle précis de l'utilisateur</li>
              <li>Bidirectionnel (scroll up/down)</li>
              <li>Performance optimisée</li>
              <li>Expérience interactive fluide</li>
              <li>Prévisibilité du mouvement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollScrubExamples;