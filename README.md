# Network Visualization App

Interactive 3D Network Visualization with React Three Fiber, smooth JSON state animations, and scroll-based camera controls.

## 🚀 Features

- **3D Network Visualization**: Interactive spheres with dynamic connections
- **Smooth Animations**: GSAP-powered transitions between JSON configurations
- **Scroll Camera Controls**: Automatic camera movements based on scroll position
- **Flat Design Rendering**: Optimized performance with clean visual design
- **JSON API Integration**: Dynamic network configurations with state transitions
- **TypeScript**: Full type safety and developer experience
- **Tailwind CSS v4**: Modern styling with custom design tokens

## 🛠️ Tech Stack

- **React 18** + TypeScript
- **React Three Fiber** for 3D rendering
- **GSAP** for animations
- **Tailwind CSS v4** for styling
- **Vite** for development and building
- **shadcn/ui** components

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd network-visualization-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check

# Clean build artifacts
npm run clean
```

## 🎮 Usage

### Network Test Loader

Use the test loader in the top-left corner to experience different animation states:
- **Default → Simple**: See nodes disappear with scale animations
- **Simple → Expanded**: See new nodes appear with scale animations  
- **Expanded → Moved**: See nodes move with smooth transitions
- **All transitions**: Sinusoidal animation continues throughout

### Camera Controls

The app includes scroll-based camera controls:
- Scroll through sections to see automatic camera movements
- Use the control buttons for manual camera positioning
- Press 'D' key to toggle debug information (if enabled)

### JSON API Integration

The network configuration is managed through the `NetworkDataService`:
- Load different network configurations
- Smooth transitions between states
- Scale animations for appearing/disappearing nodes
- Movement animations for repositioned nodes

## 📁 Project Structure

```
├── App.tsx                 # Main application component
├── main.tsx               # Application entry point
├── components/
│   ├── NetworkVisualization.tsx    # Main 3D network component
│   ├── NetworkAnimations.tsx       # Animation system (optimized)
│   ├── NetworkDataService.tsx      # Data management
│   ├── CameraControls.tsx          # Camera system
│   ├── ScrollCameraController.tsx  # Scroll-based controls
│   ├── NetworkTestLoader.tsx       # Testing interface
│   └── ui/                         # shadcn/ui components
├── styles/
│   └── globals.css        # Tailwind CSS v4 with custom tokens
└── documentation.md       # Detailed technical documentation
```

## ⚡ Performance Optimizations

- **Throttled Updates**: Position updates limited to 60fps
- **Instanced Rendering**: Efficient connection line rendering
- **Memoized Components**: Reduced React re-renders
- **GSAP Animation Management**: Proper cleanup and optimization
- **Flat Design Rendering**: Removed unnecessary lighting and effects

## 🎨 Customization

### Network Configuration

Modify network data in `NetworkDataService.tsx`:
```typescript
interface NetworkNode {
  id: number;
  position: [number, number, number];
  radius: number;
  color: string;
  connections: number[];
}
```

### Animation Settings

Adjust animation parameters in `NetworkAnimations.tsx`:
```typescript
export const ANIMATION_CONFIG = {
  duration: 0.8,
  ease: "power2.inOut",
  staggerDelay: 0.05,
};
```

### Styling

Customize colors and design tokens in `styles/globals.css` using CSS custom properties.

## 📚 Documentation

See `documentation.md` for detailed technical documentation including:
- Camera control system details
- Animation architecture
- Performance optimization techniques
- API integration guide

## 🐛 Troubleshooting

### Common Issues

1. **Three.js warnings**: Ensure proper cleanup of geometries and materials
2. **Animation lag**: Check throttling settings in `PositionUpdateManager`
3. **Camera controls not working**: Verify data attributes on scroll elements

### Development Tips

- Use browser dev tools for debugging Three.js objects
- Enable debug mode in `ScrollCameraController` for camera information
- Check console for detailed animation logs

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🆘 Support

For questions or issues:
- Check the documentation.md file
- Create an issue on GitHub
- Review the code comments for implementation details