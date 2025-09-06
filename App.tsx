import NetworkVisualization from "./components/NetworkVisualization";
import ScrollCameraController from "./components/ScrollCameraController";
import NetworkTestLoader from "./components/NetworkTestLoader";
import { networkDataService, NetworkConfiguration } from "./components/NetworkDataService";
import exampleImage from "/images/default.png";

import { useState, useEffect } from 'react';

export default function App() {
  // State for network configuration - preserved for server API integration
  const [networkConfig, setNetworkConfig] = useState<NetworkConfiguration>(
    networkDataService.getCurrentConfiguration()
  );

  // Subscribe to network configuration changes for future server integration
  useEffect(() => {
    const unsubscribe = networkDataService.subscribe((config) => {
      setNetworkConfig(config);
    });

    return unsubscribe;
  }, []);

  // Simple camera control function for scroll-based navigation
  const setCameraControls = (
    zoom: number,
    position: [number, number, number],
    target: [number, number, number] = [0, 0, 0]
  ) => {
    const container = document.querySelector('.network-visualization-container[data-main-visualization="true"]') as HTMLElement;
    const element = container || document.body;
    
    element.dataset.cameraZoom = zoom.toString();
    element.dataset.cameraPositionX = position[0].toString();
    element.dataset.cameraPositionY = position[1].toString();
    element.dataset.cameraPositionZ = position[2].toString();
    element.dataset.cameraTargetX = target[0].toString();
    element.dataset.cameraTargetY = target[1].toString();
    element.dataset.cameraTargetZ = target[2].toString();
  };

  // Initialize with default camera position
  useEffect(() => {
    setCameraControls(1, [0, 0.5, 30], [0, 0, 0]);
  }, []);

  return (
    <div id="app-root" className="relative min-h-screen">
      {/* Scroll Camera Controller - production optimized */}
      <ScrollCameraController 
        selector="[data-scroll-camera]"
        enabled={true}
        debug={false}
      />

      {/* Network Test Loader - for demonstration */}
      <NetworkTestLoader />

      {/* Fixed 3D Network Background - flat design, no rotation, with animations */}
      <div id="network-background">
        <div className="network-visualization-container fixed inset-0 w-full h-full -z-10" data-main-visualization="true">
          <div id="network-background-gradient" className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 opacity-80"></div>
          <NetworkVisualization />
        </div>
      </div>

      {/* Main Content */}
      <main id="main-content" className="relative z-10">
        {/* Hero section */}
        <section 
          id="hero-section" 
          className="min-h-screen flex items-center justify-center"
          data-scroll-camera="true"
          data-scroll-start="top center"
          data-scroll-end="bottom center"
          data-scroll-markers="false"
          data-on-enter-zoom="1"
          data-on-enter-position-x="5"
          data-on-enter-position-y="0.5"
          data-on-enter-position-z="30"
          data-on-enter-target-x="5"
          data-on-enter-target-y="0"
          data-on-enter-target-z="0"
          data-on-enter-back-zoom="1"
          data-on-enter-back-position-x="5"
          data-on-enter-back-position-y="0.5"
          data-on-enter-back-position-z="30"
          data-on-enter-back-target-x="5"
          data-on-enter-back-target-y="0"
          data-on-enter-back-target-z="0"
        >
          <div id="hero-container" className="text-center max-w-4xl mx-auto p-8">
            <div id="hero-content" className="rounded-2xl p-12">
              <h1 className="text-6xl font-bold mb-6 text-gray-800">
                Network Visualization
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                Explore complex network structures in an immersive 3D environment 
                with automatic camera transitions, flat design rendering, and smooth JSON state animations
              </p>
              <p className="text-lg text-gray-500 mb-4">
                Current network: <span className="font-semibold text-gray-700">{networkConfig.metadata.name}</span> 
                {' '}({networkConfig.nodes.length} nodes)
              </p>
              <p className="text-sm text-blue-600 mb-8">
                💫 Try the animation test loader to see smooth transitions between network states
              </p>
              <div id="hero-actions" className="flex justify-center gap-4">
                <button 
                  onClick={() => setCameraControls(1, [20, 5, 20], [0, 0, 0])}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Zoom In View
                </button>
                <button 
                  onClick={() => setCameraControls(1, [0, 0.5, 10], [0, 0, 0])}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Default View
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* About section */}
        <section 
          id="about-section" 
          className="min-h-screen flex items-center justify-center py-20"
          data-scroll-camera="true"
          data-scroll-start="top 80%"
          data-scroll-end="bottom 20%"
          data-scroll-markers="false"
          data-on-enter-zoom="1"
          data-on-enter-position-x="5"
          data-on-enter-position-y="2"
          data-on-enter-position-z="20"
          data-on-enter-target-x="0"
          data-on-enter-target-y="0"
          data-on-enter-target-z="0"
          data-on-leave-zoom="1"
          data-on-leave-position-x="0"
          data-on-leave-position-y="0.5"
          data-on-leave-position-z="30"
        >
          <div id="about-container" className="max-w-6xl mx-auto p-8">
            <div id="about-content" className="rounded-2xl p-12">
              <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">
                Interactive Network Analysis with Smooth Animations
              </h2>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-gray-800">
                    Visualize Complex Relationships
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">
                    Our network visualization allows you to explore complex data relationships 
                    in an intuitive and engaging way. Each node represents a data point, 
                    with connections showing relationships and dependencies.
                  </p>
                  <p className="text-lg text-gray-600 mb-6">
                    The highlighted orange nodes draw attention to key elements, while the 
                    varying sizes of blue nodes indicate different levels of importance or 
                    connectivity within the network. Clean flat design provides optimal 
                    performance and clarity.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700">
                        Network nodes with varying importance
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700">
                        Highlighted key elements
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-0.5 bg-blue-600"></div>
                      <span className="text-gray-700">
                        Connection relationships
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-orange-400 rounded-full animate-pulse"></div>
                      <span className="text-gray-700">
                        Smooth JSON state transitions
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <img
                    src={exampleImage}
                    alt="Network structure reference"
                    className="max-w-full h-auto rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section 
          id="features-section" 
          className="min-h-screen flex items-center justify-center py-20"
          data-scroll-camera="true"
          data-scroll-start="top 80%"
          data-scroll-end="bottom 20%"
          data-scroll-markers="false"
          data-on-enter-zoom="1"
          data-on-enter-position-x="12"
          data-on-enter-position-y="3"
          data-on-enter-position-z="10"
          data-on-enter-target-x="0"
          data-on-enter-target-y="0"
          data-on-enter-target-z="0"
          data-on-leave-zoom="1"
          data-on-leave-position-x="5"
          data-on-leave-position-y="2"
          data-on-leave-position-z="20"
        >
          <div className="max-w-6xl mx-auto p-8">
            <div className="rounded-2xl p-12">
              <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">
                Powerful Features
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                <article className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    Optimized Performance
                  </h3>
                  <p className="text-gray-600">
                    Clean flat design rendering optimized for performance 
                    and clarity without sacrificing visual impact.
                  </p>
                </article>

                <article className="text-center p-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    Smooth State Transitions
                  </h3>
                  <p className="text-gray-600">
                    Beautiful animations when loading new JSON configurations 
                    with scale effects for appearing/disappearing nodes and smooth movement.
                  </p>
                </article>

                <article className="text-center p-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-8 h-8 bg-green-600 rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    JSON Data Integration
                  </h3>
                  <p className="text-gray-600">
                    Seamless integration with server-side data through 
                    our JSON API for dynamic network configurations.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* Contact section */}
        <section 
          id="contact-section" 
          className="min-h-screen flex items-center justify-center py-20"
          data-scroll-camera="true"
          data-scroll-start="top 80%"
          data-scroll-end="bottom 20%"
          data-scroll-markers="false"
          data-on-enter-zoom="1"
          data-on-enter-position-x="0"
          data-on-enter-position-y="18"
          data-on-enter-position-z="0"
          data-on-enter-target-x="0"
          data-on-enter-target-y="0"
          data-on-enter-target-z="0"
          data-on-leave-zoom="1"
          data-on-leave-position-x="12"
          data-on-leave-position-y="3"
          data-on-leave-position-z="30"
        >
          <div className="max-w-4xl mx-auto p-8">
            <div className="rounded-2xl p-12 text-center">
              <h2 className="text-4xl font-bold mb-8 text-gray-800">
                Ready to Explore?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Experience the power of optimized network visualization 
                with automatic scroll-based camera control, clean flat design, 
                and smooth JSON state transitions.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">
                  🎮 Try the Animation System
                </h3>
                <p className="text-blue-700 mb-4">
                  Use the test loader in the top-left corner to experience:
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-600">
                  <div>📦 Scale animations for new/removed nodes</div>
                  <div>🔄 Smooth movement transitions</div>
                  <div>⚡ GSAP-powered easing effects</div>
                  <div>🔗 Animated connection lines</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">
                    For Researchers
                  </h3>
                  <p className="text-gray-600">
                    Visualize complex research data with optimized performance 
                    and smooth transitions between different network states.
                  </p>
                </div>
                <div className="p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">
                    For Businesses
                  </h3>
                  <p className="text-gray-600">
                    Present organizational networks with professional flat design 
                    and engaging animations when updating data configurations.
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4 mb-8">
                <button 
                  onClick={() => setCameraControls(1, [5, 15, 5], [0, 0, 0])}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Top View
                </button>
                <button 
                  onClick={() => setCameraControls(1, [25, 2, 25], [0, 0, 0])}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Wide View
                </button>
                <button 
                  onClick={() => setCameraControls(3, [8, 3, 0], [0, 0, 0])}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Side View
                </button>
              </div>
              
              <button 
                onClick={() => setCameraControls(1, [0, 0.5, 10], [0, 0, 0])}
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}