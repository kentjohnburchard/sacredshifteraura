import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface ConsciousnessVisualizerProps {
  intention?: string;
  frequency?: number;
  intensity?: number;
  className?: string;
}

const ConsciousnessVisualizer: React.FC<ConsciousnessVisualizerProps> = ({
  intention = 'general',
  frequency = 528,
  intensity = 0.5,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const [isActive, setIsActive] = useState(true);

  const getIntentionColors = (intention: string): string[] => {
    switch (intention) {
      case 'soul-remembrance':
        return ['#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE'];
      case 'consciousness-expansion':
        return ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7'];
      case 'heart-connection':
        return ['#10B981', '#059669', '#34D399', '#6EE7B7'];
      case 'sacred-community':
        return ['#EC4899', '#F472B6', '#FBBF24', '#FCD34D'];
      case 'daily-alignment':
        return ['#F59E0B', '#D97706', '#FBBF24', '#FCD34D'];
      case 'healing-frequencies':
        return ['#06B6D4', '#0891B2', '#67E8F9', '#A5F3FC'];
      default:
        return ['#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE'];
    }
  };

  const createParticle = (x: number, y: number): Particle => {
    const colors = getIntentionColors(intention);
    const maxLife = 120 + Math.random() * 180;
    
    return {
      id: Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 0,
      maxLife,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 1 + Math.random() * 3
    };
  };

  const drawSacredGeometryBackground = (ctx: CanvasRenderContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const time = Date.now() * 0.001;

    // Set low opacity for background patterns
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = getIntentionColors(intention)[0];
    ctx.lineWidth = 1;

    // Flower of Life background pattern
    const radius = 30;
    for (let ring = 1; ring <= 3; ring++) {
      const numCircles = ring === 1 ? 6 : ring * 6;
      for (let i = 0; i < numCircles; i++) {
        const angle = (i * (360 / numCircles)) * Math.PI / 180 + time * 0.1;
        const distance = ring * radius;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Rotating sacred geometry
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(time * 0.05);
    
    // Sri Yantra inspired pattern
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = getIntentionColors(intention)[1];
    ctx.lineWidth = 1.5;
    
    // Triangles
    for (let i = 0; i < 9; i++) {
      const angle = (i * 40) * Math.PI / 180;
      const size = 50 + i * 10;
      
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.866, size * 0.5);
      ctx.lineTo(-size * 0.866, size * 0.5);
      ctx.closePath();
      ctx.stroke();
    }
    
    ctx.restore();
    ctx.globalAlpha = 1;
  };

  const drawFrequencyVisualization = (ctx: CanvasRenderContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const time = Date.now() * 0.001;
    
    // Frequency-based ripples
    const numRipples = Math.floor(frequency / 100);
    ctx.globalAlpha = 0.3;
    
    for (let i = 0; i < numRipples; i++) {
      const rippleTime = time + i * 0.5;
      const radius = (Math.sin(rippleTime * 2) + 1) * 50 + i * 20;
      
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.8, getIntentionColors(intention)[i % getIntentionColors(intention).length] + '40');
      gradient.addColorStop(1, 'transparent');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
  };

  const updateParticles = (ctx: CanvasRenderContext2D, width: number, height: number) => {
    const particles = particlesRef.current;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Add new particles based on frequency and intensity
    if (particles.length < frequency / 10 * intensity) {
      const numNew = Math.floor(intensity * 3);
      for (let i = 0; i < numNew; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 100;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        particles.push(createParticle(x, y));
      }
    }

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      particle.life++;
      
      // Apply sacred geometry movement patterns
      const centerForce = 0.001;
      const dx = centerX - particle.x;
      const dy = centerY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        particle.vx += (dx / distance) * centerForce;
        particle.vy += (dy / distance) * centerForce;
      }
      
      // Add slight spiral motion
      const angle = Math.atan2(dy, dx);
      particle.vx += Math.cos(angle + Math.PI / 2) * 0.005;
      particle.vy += Math.sin(angle + Math.PI / 2) * 0.005;
      
      // Damping
      particle.vx *= 0.99;
      particle.vy *= 0.99;
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Calculate alpha based on life
      const alpha = 1 - (particle.life / particle.maxLife);
      
      if (particle.life >= particle.maxLife) {
        particles.splice(i, 1);
        continue;
      }
      
      // Draw particle
      ctx.globalAlpha = alpha * 0.8;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw connection lines to nearby particles
      ctx.globalAlpha = alpha * 0.3;
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = 0.5;
      
      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j];
        const dx = other.x - particle.x;
        const dy = other.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 50) {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    }
    
    ctx.globalAlpha = 1;
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    
    // Clear canvas with slight trail effect
    ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw background sacred geometry
    drawSacredGeometryBackground(ctx, width, height);
    
    // Draw frequency visualization
    drawFrequencyVisualization(ctx, width, height);
    
    // Update and draw particles
    updateParticles(ctx, width, height);
    
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    if (isActive) {
      animate();
    }
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, intention, frequency, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{
        background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.05) 0%, rgba(15, 23, 42, 0.8) 70%)'
      }}
    />
  );
};

export default ConsciousnessVisualizer;