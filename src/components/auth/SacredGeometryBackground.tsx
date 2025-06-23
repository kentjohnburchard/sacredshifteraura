import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const SacredGeometryBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Draw sacred geometry
    const drawSacredGeometry = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate center of canvas
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Constants
      const goldenRatio = 1.618033988749895;
      const scale = Math.min(canvas.width, canvas.height) * 0.4;
      
      // Flower of Life
      drawFlowerOfLife(ctx, centerX, centerY, scale * 0.35, time);
      
      // Sri Yantra (simplified)
      drawSriYantra(ctx, centerX, centerY, scale * 0.25, time);
      
      // Metatron's Cube (outer elements only, for performance)
      drawMetatronsCube(ctx, centerX, centerY, scale * 0.4, time);
      
      // Request next frame
      requestAnimationFrame(drawSacredGeometry);
    };
    
    // Start animation
    const animationId = requestAnimationFrame(drawSacredGeometry);
    
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  // Draw Flower of Life
  const drawFlowerOfLife = (
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    radius: number, 
    time: number
  ) => {
    const rotationSpeed = 0.0001;
    const rotation = time * rotationSpeed;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 0.5;
    
    // Center circle
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // First ring of 6 circles
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Second ring of 12 circles
    radius *= 0.95; // Slightly smaller for visual effect
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + rotation * 2;
      const distance = radius * 1.7;
      const x = distance * Math.cos(angle);
      const y = distance * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.restore();
  };
  
  // Draw Sri Yantra (simplified)
  const drawSriYantra = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ) => {
    const pulseSpeed = 0.001;
    const pulse = 0.9 + 0.1 * Math.sin(time * pulseSpeed);
    
    ctx.save();
    ctx.translate(centerX, centerY);
    
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 0.5;
    
    // Draw triangles
    for (let i = 0; i < 9; i++) {
      const scale = 1 - i * 0.1;
      const rotation = (i % 2) * Math.PI;
      
      ctx.save();
      ctx.rotate(rotation + time * 0.0001);
      ctx.scale(scale * pulse, scale * pulse);
      
      // Draw triangle
      ctx.beginPath();
      ctx.moveTo(0, -radius);
      ctx.lineTo(radius * Math.sin(Math.PI / 3), radius * Math.cos(Math.PI / 3));
      ctx.lineTo(-radius * Math.sin(Math.PI / 3), radius * Math.cos(Math.PI / 3));
      ctx.closePath();
      ctx.stroke();
      
      ctx.restore();
    }
    
    // Draw central dot (bindu)
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#d8b4fe';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.05, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };
  
  // Draw Metatron's Cube (simplified)
  const drawMetatronsCube = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ) => {
    const rotationSpeed = 0.00005;
    const rotation = time * rotationSpeed;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 0.5;
    
    // Draw hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();
    
    // Draw inner lines
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      points.push({ x, y });
    }
    
    // Connect opposite points
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(points[i].x, points[i].y);
      ctx.lineTo(points[i + 3].x, points[i + 3].y);
      ctx.stroke();
    }
    
    ctx.restore();
  };
  
  return (
    <>
      {/* Sacred geometry canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />
      
      {/* Additional background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Rays of light */}
        <motion.div
          className="absolute top-0 left-1/4 w-[30rem] h-[60rem] bg-gradient-to-b from-purple-500/5 to-transparent rounded-full blur-3xl"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 3, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div
          className="absolute -top-20 right-1/4 w-[40rem] h-[30rem] bg-gradient-to-b from-indigo-500/5 to-transparent rounded-full blur-3xl"
          animate={{
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -2, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        
        {/* Subtle particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    </>
  );
};