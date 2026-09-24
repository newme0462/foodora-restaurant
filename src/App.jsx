import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import {
  ArrowRight, Star, Clock, MapPin, Phone, ChefHat,
  Leaf, ShieldCheck, Award,
  Menu, X, Play
} from 'lucide-react';

// Brand icons were removed from newer Lucide versions, so we use small inline SVGs instead.
const svgProps = { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' };
const Facebook = ({ size = 20 }) => (
  <svg {...svgProps} width={size} height={size} aria-hidden="true">
    <path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.6V3.4c-.3 0-1.2-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.4H7.6V13h2.7v8h3.2z" />
  </svg>
);
const Twitter = ({ size = 20 }) => (
  <svg {...svgProps} width={size} height={size} aria-hidden="true">
    <path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z" />
  </svg>
);
const Instagram = ({ size = 20 }) => (
  <svg {...svgProps} width={size} height={size} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

// Custom hook for scroll animations to replace GSAP
const useInView = (options = { threshold: 0.1 }) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: options.threshold });

    observer.observe(node);
    return () => observer.disconnect();
  }, [options.threshold]);

  return [ref, isInView];
};

// Colors for the procedural 3D food
const COLORS = {
  bun: 0xe59c3f,
  meat: 0x381c0e,
  cheese: 0xfacc15,
  lettuce: 0x4ade80,
  tomato: 0xef4444,
  onion: 0xf1f5f9
};

const ThreeScene = () => {
  const mountRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const getSize = () => ({
      w: mount.clientWidth || window.innerWidth,
      h: mount.clientHeight || window.innerHeight
    });
    const { w, h } = getSize();

    // 1. Core Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // 2. Lighting (intensities tuned for current Three.js physical lighting)
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(5, 8, 6);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0xffffff, 250, 0, 0.5, 0.6, 2);
    spotLight.position.set(10, 10, 10);
    scene.add(spotLight);

    const pointLight = new THREE.PointLight(0xffa500, 120, 0, 2);
    pointLight.position.set(-8, -6, 6);
    scene.add(pointLight);

    // 3. Burger Construction
    const burgerGroup = new THREE.Group();

    const bunMat = new THREE.MeshStandardMaterial({ color: COLORS.bun, roughness: 0.6 });
    const meatMat = new THREE.MeshStandardMaterial({ color: COLORS.meat, roughness: 1.0 });
    const cheeseMat = new THREE.MeshStandardMaterial({ color: COLORS.cheese, roughness: 0.3 });
    const lettuceMat = new THREE.MeshStandardMaterial({ color: COLORS.lettuce, roughness: 0.4 });
    const tomatoMat = new THREE.MeshStandardMaterial({ color: COLORS.tomato, roughness: 0.2 });

    const topBun = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), bunMat);
    topBun.position.set(0, 1.1, 0);
    const topBunBase = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.1, 32), bunMat);
    topBunBase.position.set(0, 1.1, 0);

    const lettuce = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.6, 0.15, 16), lettuceMat);
    lettuce.position.set(0, 0.85, 0);
    lettuce.rotation.y = Math.PI / 4;

    const lettuceTorus = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.1, 16, 32), lettuceMat);
    lettuceTorus.position.set(0.2, 0.85, 0.2);
    lettuceTorus.rotation.x = Math.PI / 2 + 0.1;

    const tomatoGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.08, 32);
    const t1 = new THREE.Mesh(tomatoGeo, tomatoMat); t1.position.set(-0.5, 0.65, 0.4); t1.rotation.x = 0.05;
    const t2 = new THREE.Mesh(tomatoGeo, tomatoMat); t2.position.set(0.6, 0.65, -0.3); t2.rotation.set(-0.05, 0.1, 0);
    const t3 = new THREE.Mesh(tomatoGeo, tomatoMat); t3.position.set(0.1, 0.65, -0.7); t3.rotation.set(-0.02, 0, -0.1);

    const cheese = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.05, 2.2), cheeseMat);
    cheese.position.set(0, 0.5, 0); cheese.rotation.set(0.1, Math.PI / 3, 0);
    const cheeseMelt = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.6), cheeseMat);
    cheeseMelt.position.set(1.05, 0.25, 1.05); cheeseMelt.rotation.set(0, Math.PI / 4, 0.5);

    const meat = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.5, 0.5, 32), meatMat);
    meat.position.set(0, 0.1, 0);

    const botBun = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.35, 0.4, 32), bunMat);
    botBun.position.set(0, -0.4, 0);
    const botBunCurve = new THREE.Mesh(new THREE.SphereGeometry(1.35, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), bunMat);
    botBunCurve.position.set(0, -0.6, 0);

    burgerGroup.add(topBun, topBunBase, lettuce, lettuceTorus, t1, t2, t3, cheese, cheeseMelt, meat, botBun, botBunCurve);
    burgerGroup.rotation.x = 0.25; // slight tilt so the layers are visible while it spins

    // Responsive placement/scale: burger sits to the right on desktop, centered on small screens
    const layoutBurger = (width) => {
      const s = width < 768 ? 0.8 : width < 1024 ? 1.0 : 1.2;
      burgerGroup.scale.set(s, s, s);
      burgerGroup.userData.baseX = width >= 1024 ? 2.6 : 0;
    };
    layoutBurger(w);

    // 4. Floating Background Ingredients
    const floatingGroup = new THREE.Group();
    const ft1 = new THREE.Mesh(tomatoGeo, tomatoMat); ft1.position.set(4, 2, -2);
    const ft2 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16), tomatoMat); ft2.position.set(-4, -1, -3);
    const fc1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.8), cheeseMat); fc1.position.set(-3, 2, -1);
    const fc2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.6), cheeseMat); fc2.position.set(3, -2, -2);
    const fl1 = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 8, 16), lettuceMat); fl1.position.set(2, 3, -4);
    floatingGroup.add(ft1, ft2, fc1, fc2, fl1);
    floatingGroup.children.forEach((child) => {
      child.userData.base = child.position.clone();
    });

    // 5. Sparkles Particle System
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 150;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xfacc15,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particles = new THREE.Points(particleGeo, particleMat);

    // Main group for parallax tracking
    const mainGroup = new THREE.Group();
    mainGroup.add(burgerGroup);
    mainGroup.add(floatingGroup);
    mainGroup.add(particles);
    scene.add(mainGroup);

    // 6. Event Listeners
    const onMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onWindowResize = () => {
      const size = getSize();
      camera.aspect = size.w / size.h;
      camera.updateProjectionMatrix();
      renderer.setSize(size.w, size.h);
      layoutBurger(size.w);
    };
    window.addEventListener('resize', onWindowResize);

    // 7. Render Loop (runs continuously)
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Spinning + breathing burger
      burgerGroup.rotation.y = t * 0.6;
      burgerGroup.position.x = burgerGroup.userData.baseX;
      burgerGroup.position.y = Math.sin(t * 1.5) * 0.15;

      // Floating ingredients: orbit, tumble and bob around their base position
      floatingGroup.rotation.y = t * 0.15;
      floatingGroup.children.forEach((child, i) => {
        const base = child.userData.base;
        child.rotation.x = t * 0.8 + i;
        child.rotation.z = t * 0.5 + i;
        child.position.y = base.y + Math.sin(t * 1.4 + i * 1.3) * 0.45;
        child.position.x = base.x + Math.cos(t * 0.9 + i) * 0.2;
      });

      // Rotating particles
      particles.rotation.y = t * 0.08;
      particles.position.y = Math.sin(t * 0.5) * 0.2;

      // Smooth mouse parallax
      mainGroup.rotation.y += (mouse.current.x * 0.4 - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (mouse.current.y * 0.2 - mainGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    // 8. Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onWindowResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
      });
      [bunMat, meatMat, cheeseMat, lettuceMat, tomatoMat, particleMat].forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

const MagneticButton = ({ children, className = '', variant = 'primary', ...props }) => {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) * 0.2;
    const y = (e.clientY - top - height / 2) * 0.2;
    setPosition({ x, y });
    setTextPosition({ x: x * 0.5, y: y * 0.5 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
    setTextPosition({ x: 0, y: 0 });
  };

  const baseStyle = "relative inline-flex items-center justify-center px-8 py-4 font-bold tracking-wider uppercase rounded-full overflow-hidden group transition-all duration-300 ease-out";
  const variants = {
    primary: "bg-amber-500 text-zinc-950 hover:bg-amber-400",
    outline: "border border-zinc-700 text-zinc-100 hover:border-amber-500 hover:text-amber-500 bg-zinc-950/50 backdrop-blur-sm"
  };

  return (
    <button
      ref={buttonRef}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      {...props}
    >
      <span
        className="relative z-10 flex items-center gap-2 transition-transform duration-300 ease-out"
        style={{ transform: `translate(${textPosition.x}px, ${textPosition.y}px)` }}
      >
        {children}
      </span>
    </button>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-zinc-950/90 backdrop-blur-md py-2 shadow-lg shadow-black/50' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="text-2xl font-black tracking-tighter text-amber-500 flex items-center gap-2 cursor-pointer">
          <ChefHat size={28} />
          FOODORA<span className="text-zinc-100">.</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
          <a href="#menu" className="hover:text-amber-500 transition-colors">Menu</a>
          <a href="#story" className="hover:text-amber-500 transition-colors">Our Story</a>
          <a href="#reviews" className="hover:text-amber-500 transition-colors">Reviews</a>
          <MagneticButton variant="primary" className="!py-2 !px-6 !text-xs">
            Reserve Table
          </MagneticButton>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-zinc-100" aria-label="Toggle menu" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-zinc-950 border-t border-zinc-900 p-6 flex flex-col gap-4">
          <a href="#menu" onClick={() => setIsOpen(false)} className="text-lg font-medium text-zinc-300 hover:text-amber-500">Menu</a>
          <a href="#story" onClick={() => setIsOpen(false)} className="text-lg font-medium text-zinc-300 hover:text-amber-500">Our Story</a>
          <a href="#reviews" onClick={() => setIsOpen(false)} className="text-lg font-medium text-zinc-300 hover:text-amber-500">Reviews</a>
          <button className="bg-amber-500 text-zinc-950 font-bold py-3 rounded-full mt-4">
            Reserve Table
          </button>
        </div>
      )}
    </nav>
  );
};

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen h-screen w-full flex items-center overflow-hidden">
      {/* 3D Canvas Background */}
      <ThreeScene />

      {/* Content Overlay */}
      <div className="container mx-auto px-6 relative z-10 pointer-events-none mt-20">
        <div className="max-w-3xl">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 backdrop-blur-md border border-zinc-800 text-amber-500 text-xs sm:text-sm font-bold tracking-widest mb-6 transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Star size={16} className="fill-amber-500" /> #1 RATED STEAK & BURGER HOUSE
          </div>
          <h1 className={`text-5xl md:text-7xl lg:text-8xl font-black text-zinc-100 leading-[1.1] tracking-tighter mb-6 uppercase transition-all duration-1000 delay-150 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Taste The <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              Extraordinary
            </span>
          </h1>
          <p className={`text-lg md:text-xl text-zinc-400 mb-10 max-w-lg leading-relaxed transition-all duration-1000 delay-300 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Experience culinary perfection with our signature handcrafted meals, premium ingredients, and unforgettable flavors.
          </p>

          <div className={`flex flex-wrap items-center gap-4 pointer-events-auto transition-all duration-1000 delay-500 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <MagneticButton>
              Order Now <ArrowRight size={18} />
            </MagneticButton>
            <MagneticButton variant="outline">
              <Play size={18} className="fill-zinc-100" /> Watch Video
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50 z-10">
        <span className="text-xs tracking-widest text-zinc-400 uppercase">Scroll</span>
        <div className="w-px h-8 bg-zinc-400"></div>
      </div>
    </section>
  );
};

const meals = [
  {
    id: 1,
    name: "Truffle Beef Burger",
    desc: "Wagyu beef patty, truffle mayo, caramelized onions, aged cheddar.",
    price: "$24",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    name: "Smoked Ribeye Steak",
    desc: "12oz prime ribeye, garlic herb butter, roasted asparagus.",
    price: "$48",
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    name: "Spicy Volcano Chicken",
    desc: "Crispy chicken breast, ghost pepper slaw, brioche bun.",
    price: "$19",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800"
  }
];

const PopularMeals = () => {
  const [ref, inView] = useInView({ threshold: 0.1 });

  return (
    <section id="menu" ref={ref} className="py-32 bg-zinc-950 relative z-10">
      <div className="container mx-auto px-6">
        <div className={`flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 transition-all duration-1000 transform ${inView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="max-w-2xl">
            <h2 className="text-amber-500 font-bold tracking-widest text-sm uppercase mb-3">Popular Menu</h2>
            <h3 className="text-4xl md:text-5xl font-black text-zinc-100 tracking-tighter">Signature Dishes</h3>
          </div>
          <MagneticButton variant="outline" className="hidden md:inline-flex">
            View Full Menu
          </MagneticButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {meals.map((meal, idx) => (
            <div
              key={meal.id}
              className={`group bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-amber-500/50 transition-all duration-700 transform ${inView ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={meal.image}
                  alt={meal.name}
                  loading="lazy"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                <div className="absolute top-4 right-4 bg-amber-500 text-zinc-950 font-black py-1 px-3 rounded-full">
                  {meal.price}
                </div>
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-bold text-zinc-100 mb-3">{meal.name}</h4>
                <p className="text-zinc-400 mb-6 line-clamp-2">{meal.desc}</p>
                <button className="text-amber-500 font-bold uppercase tracking-wider text-sm flex items-center gap-2 hover:gap-4 transition-all">
                  Order Now <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const OurStory = () => {
  const [ref, inView] = useInView({ threshold: 0.2 });

  return (
    <section id="story" ref={ref} className="py-32 bg-zinc-900 relative z-10 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className={`relative h-[400px] md:h-[600px] rounded-3xl overflow-hidden border border-zinc-800 transition-all duration-1000 ease-out transform ${inView ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            <img
              src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=1200"
              alt="Restaurant Interior"
              loading="lazy"
              className="w-full h-full object-cover origin-bottom hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-zinc-950/20"></div>
          </div>

          <div className="max-w-xl">
            <div className={`transition-all duration-1000 delay-200 transform ${inView ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <h2 className="text-amber-500 font-bold tracking-widest text-sm uppercase mb-3">Our Story</h2>
              <h3 className="text-4xl md:text-5xl font-black text-zinc-100 tracking-tighter mb-6">
                A Legacy of Culinary Excellence.
              </h3>
              <p className="text-zinc-400 text-lg mb-6 leading-relaxed">
                Founded in 1998, FOODORA started as a small neighborhood grill. Today, we're a premier destination for food lovers seeking extraordinary flavors and an unforgettable dining atmosphere.
              </p>
              <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
                We source our ingredients from local farmers and artisan purveyors, ensuring every bite is a celebration of freshness and quality.
              </p>
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-4xl font-black text-amber-500 mb-1">25+</div>
                  <div className="text-sm text-zinc-500 uppercase tracking-wider font-bold">Years of Trust</div>
                </div>
                <div className="w-px h-12 bg-zinc-800"></div>
                <div>
                  <div className="text-4xl font-black text-amber-500 mb-1">3M+</div>
                  <div className="text-sm text-zinc-500 uppercase tracking-wider font-bold">Meals Served</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const features = [
  { icon: <Leaf size={32} />, title: "Fresh Ingredients", desc: "Farm-to-table produce sourced daily." },
  { icon: <ChefHat size={32} />, title: "Master Chefs", desc: "Award-winning culinary experts." },
  { icon: <ShieldCheck size={32} />, title: "Premium Quality", desc: "No compromises on taste or safety." },
  { icon: <Award size={32} />, title: "Award Winning", desc: "Voted best restaurant in the city." }
];

const WhyChooseUs = () => {
  const [ref, inView] = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-24 bg-zinc-950 relative z-10 border-y border-zinc-900">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center text-center transition-all duration-700 transform ${inView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500 mb-6 group hover:bg-amber-500 hover:text-zinc-950 transition-colors duration-300">
                {feat.icon}
              </div>
              <h4 className="text-xl font-bold text-zinc-100 mb-2">{feat.title}</h4>
              <p className="text-zinc-400">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Reviews = () => {
  const reviews = [
    { name: "Sarah Jenkins", role: "Food Critic", text: "The truffle burger is an absolute masterpiece. The ambiance and service are unmatched in the city." },
    { name: "David Chen", role: "Local Guide", text: "I've been coming here for years. The quality never drops. Their steaks are cooked to absolute perfection every single time." },
    { name: "Elena Rodriguez", role: "Food Blogger", text: "A sensory experience from start to finish. The attention to detail in every dish is simply extraordinary." }
  ];

  return (
    <section id="reviews" className="py-32 bg-zinc-900 relative z-10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-amber-500 font-bold tracking-widest text-sm uppercase mb-3">Testimonials</h2>
          <h3 className="text-4xl md:text-5xl font-black text-zinc-100 tracking-tighter">What Our Guests Say</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800 relative">
              <div className="flex text-amber-500 mb-6">
                {[...Array(5)].map((_, i) => <Star key={i} size={18} className="fill-amber-500" />)}
              </div>
              <p className="text-zinc-300 text-lg mb-8 leading-relaxed">"{review.text}"</p>
              <div>
                <h4 className="font-bold text-zinc-100">{review.name}</h4>
                <span className="text-sm text-zinc-500">{review.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-zinc-950 pt-24 pb-8 relative z-10 border-t border-zinc-900">
      <div className="container mx-auto px-6">
        {/* Newsletter */}
        <div className="bg-zinc-900 rounded-3xl p-8 md:p-16 mb-20 flex flex-col md:flex-row items-center justify-between gap-8 border border-zinc-800">
          <div className="max-w-lg">
            <h3 className="text-3xl font-black text-zinc-100 mb-4">Join The Club</h3>
            <p className="text-zinc-400">Subscribe to our newsletter for exclusive offers, secret menus, and event invitations.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-full px-6 py-4 text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <MagneticButton className="!py-4">Subscribe</MagneticButton>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="text-2xl font-black tracking-tighter text-amber-500 flex items-center gap-2 mb-6">
              <ChefHat size={28} /> FOODORA<span className="text-zinc-100">.</span>
            </div>
            <p className="text-zinc-500 mb-6">Elevating the standard of dining with passion, precision, and extraordinary flavor.</p>
            <div className="flex items-center gap-4 text-zinc-400">
              <a href="#" aria-label="Facebook" className="hover:text-amber-500 transition-colors"><Facebook size={20} /></a>
              <a href="#" aria-label="Twitter" className="hover:text-amber-500 transition-colors"><Twitter size={20} /></a>
              <a href="#" aria-label="Instagram" className="hover:text-amber-500 transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-zinc-100 mb-6 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-4 text-zinc-400">
              <li className="flex items-center gap-3"><MapPin size={18} className="text-amber-500" /> 123 Culinary Ave, NY 10012</li>
              <li className="flex items-center gap-3"><Phone size={18} className="text-amber-500" /> +1 (555) 123-4567</li>
              <li className="flex items-center gap-3"><Clock size={18} className="text-amber-500" /> Mon-Sun: 11AM - 11PM</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-zinc-100 mb-6 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3 text-zinc-400">
              <li><a href="#menu" className="hover:text-amber-500 transition-colors">Our Menu</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Make a Reservation</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Private Events</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Gift Cards</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-zinc-100 mb-6 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3 text-zinc-400">
              <li><a href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-zinc-900 text-zinc-600 text-sm">
          &copy; {new Date().getFullYear()} FOODORA. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 font-sans selection:bg-amber-500/30">
      <style dangerouslySetInnerHTML={{ __html: `
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #09090b; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #f59e0b; }
      `}} />

      <Navbar />
      <main>
        <HeroSection />
        <PopularMeals />
        <OurStory />
        <WhyChooseUs />
        <Reviews />
      </main>
      <Footer />
    </div>
  );
}
