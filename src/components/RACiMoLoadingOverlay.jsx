import { useEffect, useRef, useState } from "react";

// RACiMo – Orquídeas: Overlay de carga con glassmorphism y estados
// Props:
// - isOpen: boolean
// - onClose: () => void
// - dashboardUrl: string (Apps Script URL)
// - demoUrl?: string (ruta a demo local)
export default function RACiMoLoadingOverlay({ isOpen, onClose, dashboardUrl, demoUrl = "/graficos.html", onEnter }) {
  const [progress, setProgress] = useState(0);
  const [layer, setLayer] = useState("sensores");
  const [ready, setReady] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [error, setError] = useState(false);
  const intervalRef = useRef(null);

  const layers = [
    "sensores",
    "capas base",
    "series temporales",
    "mapas térmicos",
    "etiquetas y filtros",
    "exportadores (PNG/SVG/CSV)"
  ];

  useEffect(() => {
    if (!isOpen) return;
    // Reiniciar estados cada vez que se abre
    setProgress(0);
    setLayer(layers[0]);
    setReady(false);
    setShowGuide(false);
    setError(false);

    // Simulación de progreso con cambios de capa
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + Math.floor(Math.random() * 8) + 2);
        const layerIndex = Math.min(layers.length - 1, Math.floor(next / (100 / layers.length)));
        setLayer(layers[layerIndex]);
        if (next >= 95) setReady(true);
        return next;
      });
    }, 350);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOpen]);

  const handleEnterDashboard = () => {
    if (!ready && progress < 90) return;
    if (typeof onEnter === 'function') {
      onEnter();
    } else {
      window.open(dashboardUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleViewDemo = () => {
    window.open(demoUrl, "_blank", "noopener,noreferrer");
  };

  const handleRetry = () => {
    setError(false);
    setProgress(0);
    setReady(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="racimo-overlay-title"
    >
      {/* Contenedor principal con glassmorphism */}
      <div className="relative mx-4 w-full max-w-xl rounded-3xl bg-white/75 backdrop-blur-2xl shadow-2xl border border-white/50">
        {/* Partículas discretas (polen) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute left-8 top-6 h-1.5 w-1.5 rounded-full bg-[#A1E3F9] opacity-60 animate-ping" />
          <span className="absolute right-10 top-10 h-1 w-1 rounded-full bg-[#B1F0F7] opacity-60 animate-ping" />
          <span className="absolute left-1/2 bottom-10 h-1 w-1 rounded-full bg-[#D4EBF8] opacity-60 animate-ping" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between p-6">
          <div>
            <h2 id="racimo-overlay-title" className="text-xl md:text-2xl font-semibold text-[#3674B5]">
              Bienvenido/a al Monitoreo en Vivo – RACiMo: Orquídeas
            </h2>
            <p className="mt-1 text-sm md:text-base text-[#206276]">
              Dataset Red Ambiental (sensores + reportes)
            </p>
          </div>
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="ml-4 rounded-full p-2 text-[#3674B5] hover:bg-[#D4EBF8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3674B5]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* Cuerpo */}
        <div className="px-6 pb-6">
          {/* Texto principal */}
          <p className="text-base text-[#206276]">
            Estamos preparando tus visualizaciones interactivas. Podrás explorar, filtrar y descargar cada gráfico.
          </p>

          {/* Ventajas */}
          <ul className="mt-4 space-y-1 text-sm text-[#206276]">
            <li>Gráficos 100% interactivos (zoom, hover, filtros).</li>
            <li>Descarga inmediata en PNG, SVG o CSV.</li>
            <li>Actualización en vivo de series temporales.</li>
          </ul>

          {/* Aviso técnico */}
          <p className="mt-4 text-sm text-[#206276]">
            La carga inicial puede tardar unos segundos según tu conexión. Fuente: Red Ambiental Comunitaria RACiMo.
          </p>

          {/* Spinner + estado dinámico */}
          <div className="mt-6 flex items-center gap-4">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-4 border-[#A1E3F9] opacity-60" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#3674B5] border-transparent animate-spin" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[#3674B5] shadow" />
            </div>
            <div className="flex-1 text-sm text-[#206276]">
              {error ? (
                <span>No pudimos cargar los datos. Reintentar</span>
              ) : ready ? (
                <span>Listo para explorar — {progress}%</span>
              ) : (
                <span>
                  Cargando datos… {progress}% — Conectando a sensores y preparando capas: {layer}
                </span>
              )}
            </div>
          </div>

          {/* Barra de progreso accesible */}
          <div className="mt-3" aria-label="Progreso de carga" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className="h-2 w-full rounded-full bg-[#DFF2EB]">
              <div className="h-2 rounded-full bg-[#3674B5]" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleViewDemo}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white bg-[#3674B5] shadow-md hover:bg-[#3674B5]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3674B5]"
            >
              Ver demo
            </button>
            <button
              onClick={() => setShowGuide(true)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-[#A1E3F9] text-[#3674B5] bg-white/60 hover:bg-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A1E3F9]"
            >
              Guía rápida
            </button>
            <button
              onClick={handleEnterDashboard}
              disabled={!ready && progress < 90}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 shadow-md focus:outline-none focus-visible:ring-2 ${
                !ready && progress < 90
                  ? "bg-[#3674B5]/40 text-white cursor-not-allowed"
                  : "bg-[#3674B5] text-white hover:bg-[#3674B5]/90 focus-visible:ring-[#3674B5]"
              }`}
              aria-disabled={!ready && progress < 90}
            >
              Entrar al dashboard
            </button>

            {error && (
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white bg-red-600 hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                Reintentar
              </button>
            )}
          </div>

          {/* Tips mini */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#206276]">
            <div className="rounded-lg bg-[#D4EBF8]/60 p-3">Zoom: arrastra sobre el gráfico.</div>
            <div className="rounded-lg bg-[#D4EBF8]/60 p-3">Descargar: usa el icono ↧ en cada tarjeta.</div>
            <div className="rounded-lg bg-[#D4EBF8]/60 p-3">Filtrar: alterna series con las etiquetas superiores.</div>
          </div>

          {/* Pie */}
          <p className="mt-5 text-xs text-[#206276]">
            Tus datos de uso se emplean para mejorar la experiencia. Consulta la Política de Privacidad.
          </p>
        </div>

        {/* Guía rápida (modal interno) */}
        {showGuide && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20">
            <div className="mx-6 w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl p-6 shadow-xl border border-white/50">
              <h3 className="text-lg font-semibold text-[#3674B5]">Guía rápida</h3>
              <ul className="mt-3 space-y-2 text-sm text-[#206276]">
                <li>Zoom: arrastra sobre el gráfico.</li>
                <li>Descargar: usa el icono ↧ en cada tarjeta.</li>
                <li>Filtrar: alterna series con las etiquetas superiores.</li>
              </ul>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowGuide(false)}
                  className="rounded-xl px-4 py-2 border border-[#A1E3F9] text-[#3674B5] bg-white/70 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A1E3F9]"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}