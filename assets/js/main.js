/**
 * Resume — Three.js + GSAP + Parallax
 * Interactive resume with 3D background, mouse parallax, and smooth animations.
 */
(function () {
  'use strict';

  // ─── State ───
  let currentView = 'resume'; // 'resume' | 'cover'
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  // ═══════════════════════════════════════
  // THREE.JS — Floating Yellow Particles
  // ═══════════════════════════════════════

  function initThreeBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // ─── Particles ───
    const PARTICLE_COUNT = 80;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = [];
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      sizes[i] = Math.random() * 2 + 0.5;
      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.01,
      });
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xf4d03f,
      size: 1.5,
      transparent: true,
      opacity: 0.25,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // ─── Geometric Lines (arcs reacting to mouse) ───
    const lines = [];
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xf4d03f,
      transparent: true,
      opacity: 0.08,
    });

    for (let i = 0; i < 4; i++) {
      const curve = new THREE.EllipseCurve(
        0, 0,
        20 + i * 10, 15 + i * 8,
        0, Math.PI * 0.6,
        false, 0
      );
      const pts = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geometry, lineMaterial);
      line.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        -10 - i * 5
      );
      line.rotation.z = Math.random() * Math.PI;
      scene.add(line);
      lines.push(line);
    }

    // ─── Animation Loop ───
    let frameId;
    function animate() {
      frameId = requestAnimationFrame(animate);

      // Update particles
      const pos = particleGeometry.attributes.position.array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        pos[i * 3] += velocities[i].x;
        pos[i * 3 + 1] += velocities[i].y;
        pos[i * 3 + 2] += velocities[i].z;

        // Wrap around
        if (pos[i * 3] > 50) pos[i * 3] = -50;
        if (pos[i * 3] < -50) pos[i * 3] = 50;
        if (pos[i * 3 + 1] > 50) pos[i * 3 + 1] = -50;
        if (pos[i * 3 + 1] < -50) pos[i * 3 + 1] = 50;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      // Mouse-reactive lines
      lines.forEach((line, i) => {
        line.rotation.z += 0.001 * (i % 2 === 0 ? 1 : -1);
        line.position.x += mouse.x * 0.001 * (i + 1) * 0.3;
        line.position.y += mouse.y * 0.001 * (i + 1) * 0.3;
      });

      // Subtle camera movement
      camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.02;
      camera.position.y += (-mouse.y * 0.3 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    animate();

    // ─── Resize ───
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
    });
  }

  // ═══════════════════════════════════════
  // MOUSE PARALLAX
  // ═══════════════════════════════════════

  function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (!parallaxElements.length) return;

    document.addEventListener('mousemove', (e) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function updateParallax() {
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      parallaxElements.forEach((el) => {
        const factor = parseFloat(el.getAttribute('data-parallax')) || 0.01;
        const moveX = mouse.x * factor * 100;
        const moveY = mouse.y * factor * 100;
        el.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });

      requestAnimationFrame(updateParallax);
    }

    updateParallax();
  }

  // ═══════════════════════════════════════
  // GSAP ANIMATIONS
  // ═══════════════════════════════════════

  function initAnimations() {
    if (typeof gsap === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // ─── Header fade-in ───
    gsap.from('.about-box', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      delay: 0.2,
      ease: 'power2.out',
    });

    gsap.from('.role-circle', {
      scale: 0,
      duration: 0.6,
      delay: 0.5,
      ease: 'back.out(1.7)',
    });

    gsap.from('.header-name h1', {
      opacity: 0,
      x: 30,
      duration: 0.8,
      delay: 0.3,
      ease: 'power2.out',
    });

    gsap.from('.header-name .subtitle', {
      opacity: 0,
      y: 15,
      duration: 0.6,
      delay: 0.6,
      ease: 'power2.out',
    });

    // ─── Contact bar ───
    gsap.from('.contact-item', {
      opacity: 0,
      y: 10,
      duration: 0.5,
      stagger: 0.1,
      delay: 0.7,
      ease: 'power2.out',
    });

    // ─── Timeline items pop-in ───
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, i) => {
      gsap.fromTo(item,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          delay: 0.8 + i * 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            once: true,
          },
        }
      );
    });

    // ─── Timeline year circles pop-in ───
    const yearCircles = document.querySelectorAll('.timeline-year');
    yearCircles.forEach((circle, i) => {
      gsap.fromTo(circle,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          delay: 0.9 + i * 0.12,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: circle,
            start: 'top 85%',
            once: true,
          },
        }
      );
    });

    // ─── Education year circles ───
    const eduCircles = document.querySelectorAll('.edu-year');
    eduCircles.forEach((circle, i) => {
      gsap.fromTo(circle,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          delay: 1.2 + i * 0.15,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: circle,
            start: 'top 85%',
            once: true,
          },
        }
      );
    });

    // ─── Skill bars animate ───
    const skillFills = document.querySelectorAll('.skill-fill');
    skillFills.forEach((fill) => {
      const targetWidth = fill.getAttribute('data-width');
      gsap.to(fill, {
        width: targetWidth + '%',
        duration: 1.2,
        delay: 0.3,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: fill,
          start: 'top 90%',
          once: true,
        },
      });
    });

    // ─── Section headers ───
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach((header) => {
      gsap.from(header, {
        opacity: 0,
        x: -15,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          once: true,
        },
      });
    });

    // ─── Arcs subtle rotation ───
    gsap.to('.arc-1', {
      rotation: 360,
      duration: 60,
      repeat: -1,
      ease: 'none',
    });
    gsap.to('.arc-2', {
      rotation: -360,
      duration: 45,
      repeat: -1,
      ease: 'none',
    });
  }

  // ═══════════════════════════════════════
  // VIEW TOGGLE (Resume ↔ Cover Letter)
  // ═══════════════════════════════════════

  function initViewToggle() {
    const toggle = document.getElementById('view-toggle');
    const label = document.getElementById('toggle-label');
    const resumeView = document.getElementById('resume-view');
    const coverView = document.getElementById('cover-view');

    if (!toggle || !resumeView || !coverView) return;

    toggle.addEventListener('click', () => {
      const isResume = currentView === 'resume';

      // Animate out current view
      const outView = isResume ? resumeView : coverView;
      const inView = isResume ? coverView : resumeView;

      if (typeof gsap !== 'undefined') {
        gsap.to(outView, {
          opacity: 0,
          y: 20,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            outView.classList.add('hidden');
            outView.classList.remove('active');
            inView.classList.remove('hidden');
            inView.classList.add('active');

            gsap.fromTo(inView,
              { opacity: 0, y: -20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: 'power2.out',
              }
            );

            // Re-trigger skill bar animations if switching to resume
            if (isResume) {
              const skillFills = resumeView.querySelectorAll('.skill-fill');
              skillFills.forEach((fill) => {
                const targetWidth = fill.getAttribute('data-width');
                fill.style.width = '0%';
                gsap.to(fill, {
                  width: targetWidth + '%',
                  duration: 1.2,
                  delay: 0.3,
                  ease: 'power2.out',
                });
              });
            }
          },
        });
      } else {
        // Fallback without GSAP
        outView.style.display = 'none';
        inView.style.display = 'block';
      }

      currentView = isResume ? 'cover' : 'resume';
      label.textContent = isResume ? 'Currículo' : 'Apresentação';
    });
  }

  // ═══════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════

  document.addEventListener('DOMContentLoaded', () => {
    initThreeBackground();
    initParallax();
    initAnimations();
    initViewToggle();
  });

})();
