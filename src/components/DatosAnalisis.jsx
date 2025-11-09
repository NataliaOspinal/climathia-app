import React, { useState } from 'react'; 
import { useInView } from 'react-intersection-observer';

// Sección resumida de métricas: 3 cuadros con estilo específico

const DatosAnalisis = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Glassmorphism + Neomorphism base style con paleta pastel ambiental
  const cardBaseStyle = {
    width: 'clamp(120px, 32vw, 170px)',
    height: 'clamp(140px, 38vw, 175px)',
    borderRadius: '14px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontFamily: 'Roboto, sans-serif',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    position: 'relative',
    overflow: 'hidden',
    // Fallback pastel claro si el gradient no aplica
    backgroundColor: '#EAF7F0', // mint pastel
    border: '1px solid rgba(255,255,255,0.30)',
    boxShadow: '0 10px 18px rgba(0,0,0,0.10), 0 0 18px rgba(173,216,230,0.35), 0 0 12px rgba(198,232,216,0.35)',
    // Transiciones suaves para cambios de color y transformaciones
    transition: 'all 0.3s ease',
    willChange: 'transform',
  };

  // Texto con buen contraste, evitando negro puro
  const titleStyle = {
    fontSize: '18px',
    fontWeight: 700,
    color: '#264653', // slate verde-azulado (no negro)
    textAlign: 'center',
    letterSpacing: 0.2,
    transition: 'all 0.3s ease',
  };
  // Números en tono verde-azulado profundo para legibilidad sin negro
  const valueStyle = {
    fontSize: '32px',
    fontWeight: 800,
    color: '#2A9D8F', // teal profundo pastel
    textShadow: 'none',
    transition: 'all 0.3s ease',
  };

  const [hoverTemp, setHoverTemp] = useState(false);
  const [hoverHum, setHoverHum] = useState(false);
  const [hoverIca, setHoverIca] = useState(false);
  const [clickTemp, setClickTemp] = useState(false);
  const [clickHum, setClickHum] = useState(false);
  const [clickIca, setClickIca] = useState(false);

  const tempEmojis = ['🌡️', '🔥', '❄️'];
  const humEmojis = ['💧', '🌧️', '💦'];
  const icaEmojis = ['📊', '🌬️', '🌿'];
  const [tempEmojiIndex, setTempEmojiIndex] = useState(0);
  const [humEmojiIndex, setHumEmojiIndex] = useState(0);
  const [icaEmojiIndex, setIcaEmojiIndex] = useState(0);

  const handleClick = (type) => {
    // Micro-interacción de click: pequeño pulso y cambio de emoji
    const pulso = (setClick, setIndex, current, list) => {
      setClick(true);
      setIndex((current + 1) % list.length);
      setTimeout(() => setClick(false), 180);
    };
    if (type === 'temp') pulso(setClickTemp, setTempEmojiIndex, tempEmojiIndex, tempEmojis);
    if (type === 'hum') pulso(setClickHum, setHumEmojiIndex, humEmojiIndex, humEmojis);
    if (type === 'ica') pulso(setClickIca, setIcaEmojiIndex, icaEmojiIndex, icaEmojis);
  };

  // Paleta ambiental pastel consistente (verde suave -> azul claro)
  const bgPastelAmbient = 'linear-gradient(135deg, rgba(198,232,216,0.85) 0%, rgba(173,216,230,0.85) 100%)';

  // Aro destacado dorado para los emojis (elemento destacado)
  const emojiRingStyle = {
    width: 56,
    height: 56,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
    border: '2px solid rgba(255,215,0,0.85)', // dorado por defecto
    boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 0 10px rgba(54,116,181,0.35), 0 0 10px rgba(26,188,156,0.35)',
  };
  const ringGold = { border: '2px solid rgba(255,215,0,0.85)', boxShadow: '0 0 8px rgba(255,215,0,0.45)' };
  const ringSilver = { border: '2px solid rgba(176,176,176,0.90)', boxShadow: '0 0 8px rgba(176,176,176,0.45)' };
  const ringPlatinum = { border: '2px solid rgba(168,192,255,0.90)', boxShadow: '0 0 8px rgba(168,192,255,0.45)' };

  return (
    <section 
      ref={ref}
      className={`
        bg-green py-20 px-4 text-white
        ${inView ? 'fade-in-top-normal' : 'opacity-0'}
      `}
    >
      {/* Fuente Roboto solo para esta sección */}
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet" />

      <h2 className="text-4xl font-bold text-center mb-16">
        Análisis general
      </h2>

      <div
        className="container mx-auto max-w-5xl flex flex-wrap items-center justify-center"
        style={{ gap: '15px' }}
      >
        {/* Temp. Promedio */}
        <div
          style={{
            ...cardBaseStyle,
            background: bgPastelAmbient,
            transform: `scale(${hoverTemp ? (clickTemp ? 1.2 : 1.12) : 1})`,
          }}
          onMouseEnter={() => setHoverTemp(true)}
          onMouseLeave={() => setHoverTemp(false)}
        >
          {/* Brillo holo al hover */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: -1,
              borderRadius: 'inherit',
              background: 'linear-gradient(120deg, rgba(255,255,255,0.00) 30%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.00) 70%)',
              transform: hoverTemp ? 'translateX(40%)' : 'translateX(-60%)',
              transition: 'transform 800ms ease-in-out',
              pointerEvents: 'none',
            }}
          />
          <span
            role="img"
            aria-label="termómetro"
            tabIndex={0}
            onClick={() => handleClick('temp')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick('temp')}
            style={{
              ...emojiRingStyle,
              border: '2px solid rgba(245,230,204,0.90)', // beige pastel
              boxShadow: '0 0 8px rgba(173,216,230,0.45)',
              fontSize: 28,
              cursor: 'pointer',
              transition: 'transform 300ms ease-in-out',
              transform: clickTemp ? 'scale(1.08)' : 'scale(1.0)',
            }}
          >
            {tempEmojis[tempEmojiIndex]}
          </span>
          <div style={titleStyle}>Temp. Promedio</div>
          <div style={valueStyle}>22.3 °C</div>
        </div>

        {/* Humedad Promedio */}
        <div
          style={{
            ...cardBaseStyle,
            background: bgPastelAmbient,
            transform: `scale(${hoverHum ? (clickHum ? 1.2 : 1.12) : 1})`,
          }}
          onMouseEnter={() => setHoverHum(true)}
          onMouseLeave={() => setHoverHum(false)}
        >
          {/* Brillo holo al hover */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: -1,
              borderRadius: 'inherit',
              background: 'linear-gradient(120deg, rgba(255,255,255,0.00) 30%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.00) 70%)',
              transform: hoverHum ? 'translateX(40%)' : 'translateX(-60%)',
              transition: 'transform 800ms ease-in-out',
              pointerEvents: 'none',
            }}
          />
          <span
            role="img"
            aria-label="humedad"
            tabIndex={0}
            onClick={() => handleClick('hum')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick('hum')}
            style={{
              ...emojiRingStyle,
              border: '2px solid rgba(245,230,204,0.90)',
              boxShadow: '0 0 8px rgba(173,216,230,0.45)',
              fontSize: 28,
              cursor: 'pointer',
              transition: 'transform 300ms ease-in-out',
              transform: clickHum ? 'scale(1.08)' : 'scale(1.0)',
            }}
          >
            {humEmojis[humEmojiIndex]}
          </span>
          <div style={titleStyle}>Humedad Promedio</div>
          <div style={valueStyle}>74.2 %</div>
        </div>

        {/* ICA Promedio */}
        <div
          style={{
            ...cardBaseStyle,
            background: bgPastelAmbient,
            transform: `scale(${hoverIca ? (clickIca ? 1.2 : 1.12) : 1})`,
          }}
          onMouseEnter={() => setHoverIca(true)}
          onMouseLeave={() => setHoverIca(false)}
        >
          {/* Brillo holo al hover */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: -1,
              borderRadius: 'inherit',
              background: 'linear-gradient(120deg, rgba(255,255,255,0.00) 30%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.00) 70%)',
              transform: hoverIca ? 'translateX(40%)' : 'translateX(-60%)',
              transition: 'transform 800ms ease-in-out',
              pointerEvents: 'none',
            }}
          />
          <span
            role="img"
            aria-label="índice de calidad del aire"
            tabIndex={0}
            onClick={() => handleClick('ica')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick('ica')}
            style={{
              ...emojiRingStyle,
              border: '2px solid rgba(245,230,204,0.90)',
              boxShadow: '0 0 8px rgba(173,216,230,0.45)',
              fontSize: 28,
              cursor: 'pointer',
              transition: 'transform 300ms ease-in-out',
              transform: clickIca ? 'scale(1.08)' : 'scale(1.0)',
            }}
          >
            {icaEmojis[icaEmojiIndex]}
          </span>
          <div style={titleStyle}>ICA Promedio</div>
          <div style={valueStyle}>22.7</div>
        </div>
      </div>
    </section>
  );
};

export default DatosAnalisis;