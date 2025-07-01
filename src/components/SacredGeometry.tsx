import React, { useEffect, useRef } from 'react';

interface SacredGeometryProps {
  pattern: 'flower-of-life' | 'metatrons-cube' | 'sri-yantra' | 'merkaba' | 'torus' | 'vesica-piscis';
  size?: number;
  className?: string;
  animate?: boolean;
  glow?: boolean;
}

const SacredGeometry: React.FC<SacredGeometryProps> = ({ 
  pattern, 
  size = 200, 
  className = '', 
  animate = true,
  glow = true 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (animate && svgRef.current) {
      const svg = svgRef.current;
      svg.style.animation = `sacredSpin 30s linear infinite`;
    }
  }, [animate]);

  const renderFlowerOfLife = () => (
    <g>
      {/* Central circle */}
      <circle cx="100" cy="100" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      
      {/* First ring of 6 circles */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i * 60) * Math.PI / 180;
        const x = 100 + 25 * Math.cos(angle);
        const y = 100 + 25 * Math.sin(angle);
        return (
          <circle key={`ring1-${i}`} cx={x} cy={y} r="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        );
      })}
      
      {/* Second ring of 12 circles */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30) * Math.PI / 180;
        const x = 100 + 50 * Math.cos(angle);
        const y = 100 + 50 * Math.sin(angle);
        return (
          <circle key={`ring2-${i}`} cx={x} cy={y} r="25" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.8" />
        );
      })}
    </g>
  );

  const renderMetatronsCube = () => (
    <g>
      {/* Outer hexagon */}
      <polygon 
        points="100,30 150,50 150,100 100,120 50,100 50,50" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      />
      
      {/* Inner lines creating the cube */}
      <line x1="100" y1="30" x2="100" y2="120" stroke="currentColor" strokeWidth="1.5" />
      <line x1="50" y1="50" x2="150" y2="100" stroke="currentColor" strokeWidth="1.5" />
      <line x1="50" y1="100" x2="150" y2="50" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Central star */}
      <polygon 
        points="100,50 115,75 100,100 85,75" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
      />
      
      {/* Connection points */}
      {[
        [100, 30], [150, 50], [150, 100], [100, 120], [50, 100], [50, 50],
        [100, 50], [115, 75], [100, 100], [85, 75]
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="currentColor" />
      ))}
    </g>
  );

  const renderSriYantra = () => (
    <g>
      {/* Outer square */}
      <rect x="20" y="20" width="160" height="160" fill="none" stroke="currentColor" strokeWidth="2" />
      
      {/* Outer circle */}
      <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Lotus petals (outer) */}
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i * 22.5) * Math.PI / 180;
        const x1 = 100 + 60 * Math.cos(angle);
        const y1 = 100 + 60 * Math.sin(angle);
        const x2 = 100 + 70 * Math.cos(angle);
        const y2 = 100 + 70 * Math.sin(angle);
        return (
          <line key={`petal-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" />
        );
      })}
      
      {/* Central triangles */}
      <polygon points="100,60 130,120 70,120" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <polygon points="100,140 70,80 130,80" fill="none" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Inner intersecting triangles */}
      <polygon points="100,75 120,110 80,110" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.8" />
      <polygon points="100,125 80,90 120,90" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.8" />
      
      {/* Central point */}
      <circle cx="100" cy="100" r="4" fill="currentColor" />
    </g>
  );

  const renderMerkaba = () => (
    <g>
      {/* Upper tetrahedron */}
      <polygon 
        points="100,30 70,110 130,110" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      
      {/* Lower tetrahedron (inverted) */}
      <polygon 
        points="100,170 130,90 70,90" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      
      {/* Connecting lines */}
      <line x1="100" y1="30" x2="100" y2="170" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="70" y1="90" x2="70" y2="110" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="130" y1="90" x2="130" y2="110" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      
      {/* Central sphere */}
      <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Energy field */}
      <circle cx="100" cy="100" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </g>
  );

  const renderTorus = () => (
    <g>
      {/* Main torus shape */}
      <ellipse cx="100" cy="100" rx="60" ry="30" fill="none" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="100" cy="100" rx="40" ry="20" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
      <ellipse cx="100" cy="100" rx="20" ry="10" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      
      {/* Vertical cross-section */}
      <ellipse cx="100" cy="100" rx="30" ry="60" fill="none" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="100" cy="100" rx="20" ry="40" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
      <ellipse cx="100" cy="100" rx="10" ry="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      
      {/* Central point */}
      <circle cx="100" cy="100" r="3" fill="currentColor" />
      
      {/* Energy flow lines */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 45) * Math.PI / 180;
        const x = 100 + 25 * Math.cos(angle);
        const y = 100 + 25 * Math.sin(angle);
        return (
          <circle key={`flow-${i}`} cx={x} cy={y} r="1.5" fill="currentColor" opacity="0.7" />
        );
      })}
    </g>
  );

  const renderVesicaPiscis = () => (
    <g>
      {/* Two intersecting circles */}
      <circle cx="80" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="120" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
      
      {/* Intersection highlighting */}
      <path 
        d="M 100 60 A 40 40 0 0 1 100 140 A 40 40 0 0 1 100 60" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3" 
        opacity="0.6"
      />
      
      {/* Central vertical line */}
      <line x1="100" y1="60" x2="100" y2="140" stroke="currentColor" strokeWidth="1" opacity="0.8" />
      
      {/* Horizontal axis */}
      <line x1="40" y1="100" x2="160" y2="100" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      
      {/* Key points */}
      <circle cx="100" cy="60" r="2" fill="currentColor" />
      <circle cx="100" cy="100" r="2" fill="currentColor" />
      <circle cx="100" cy="140" r="2" fill="currentColor" />
    </g>
  );

  const renderPattern = () => {
    switch (pattern) {
      case 'flower-of-life':
        return renderFlowerOfLife();
      case 'metatrons-cube':
        return renderMetatronsCube();
      case 'sri-yantra':
        return renderSriYantra();
      case 'merkaba':
        return renderMerkaba();
      case 'torus':
        return renderTorus();
      case 'vesica-piscis':
        return renderVesicaPiscis();
      default:
        return renderFlowerOfLife();
    }
  };

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={`${className} ${glow ? 'sacred-glow' : ''}`}
      style={{
        filter: glow ? 'drop-shadow(0 0 10px currentColor)' : 'none'
      }}
    >
      {renderPattern()}
    </svg>
  );
};

export default SacredGeometry;

export { SacredGeometry }