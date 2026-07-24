---
name: webpage-3d-animator
description: Use when adding 3D visuals, particle effects, scroll-triggered 3D animations, hero animations, or decorative WebGL/Three.js scenes to the frontend. Knows how to integrate 3D libraries without bloating the app.
---

# Webpage 3D Animator

## Philosophy
- 3D is **progressive enhancement** — the app must work and look good without WebGL
- Keep 3D to **hero sections, backgrounds, and decorative elements only**
- Never put 3D in critical UI (buttons, forms, maps)
- Lazy-load 3D libraries so they don't block initial render

## Library Choices (in order of preference)

### 1. Three.js (full 3D scenes)
Use for: floating 3D objects, particle systems, background geometries.

```bash
npm install three @types/three
```

Lazy-load pattern:
```tsx
import { lazy, Suspense } from "react";

const Scene3D = lazy(() => import("@/components/3d/HeroScene"));

export function LandingPage() {
  return (
    <Suspense fallback={<div className="h-[500px]" />}>
      <Scene3D />
    </Suspense>
  );
}
```

### 2. CSS 3D transforms (no deps)
Use for: card tilt effects, perspective scrolling, 3D flip animations.

```tsx
<div
  className="transform-gpu transition-transform duration-300"
  style={{ perspective: "1000px" }}
  onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    e.currentTarget.style.transform = `rotateY(${x * 10}deg) rotateX(${y * -10}deg)`;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "rotateY(0) rotateX(0)";
  }}
/>
```

### 3. Framer Motion (spring animations)
Use for: staggered child animations, scroll reveals, layout animations.

```bash
npm install framer-motion
```

```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
  viewport={{ once: true }}
/>
```

## Project conventions (ON MY WAY)
- All 3D components go in `src/components/3d/`
- Each 3D component must have a `loading`/`fallback` state
- Use `animate-fade-in` for the container of 3D elements as a graceful fallback
- 3D scenes should not block interaction with underlying UI (use `pointer-events-none` on canvas)
- Match the app's dark theme (`#0B1121` background, `#10B981` primary accent)
- If using Three.js, use `@react-three/fiber` and `@react-three/drei` for declarative API:

```bash
npm install @react-three/fiber @react-three/drei three
```

Example Three.js scene component:
```tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, MeshDistortMaterial } from "@react-three/drei";

export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 5, 5]} intensity={0.8} color="#10B981" />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <mesh>
            <icosahedronGeometry args={[1, 1]} />
            <MeshDistortMaterial
              color="#10B981"
              emissive="#10B981"
              emissiveIntensity={0.2}
              distort={0.3}
              speed={2}
              transparent
              opacity={0.8}
            />
          </mesh>
        </Float>
      </Canvas>
    </div>
  );
}
```

## Performance rules
- Keep polygon count low (icosahedron, sphere, torus — no high-poly models)
- Limit `pixelRatio` to `Math.min(window.devicePixelRatio, 2)`
- Use `frameloop="demand"` on Three.js Canvas unless animating continuously
- Destroy Three.js renderer on component unmount (Fiber handles this)
- Add `will-change: transform` to animated CSS elements
- GPU-accelerated: use `transform-gpu` for all CSS 3D transforms
- **Mobile**: disable heavy 3D on mobile via `window.matchMedia("(max-width: 768px)")`

## Where to add 3D (suitable pages)
| Page | What | Library |
|------|------|---------|
| Landing page hero | Floating geometric shapes or particle field | Three.js + Fiber |
| Create/Join room | Subtle card tilt on hover | CSS 3D transforms |
| Room loading screen | Spinning ring or pulsing orb | CSS animations |
| Footer or decorative bg | Slow-moving gradient + particle field | Three.js |

## What NOT to 3D
- Navigation bars
- Buttons (use existing hover/active states)
- Form inputs
- The live map
- Modals
- Chat messages
