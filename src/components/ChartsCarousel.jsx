import React from 'react';

// Reversión: un solo embed apuntando al HTML de gráficos original
const defaultCharts = [
  { title: 'Visualización de datos', src: '/charts/graficos.html' },
];

const ChartsCarousel = ({ charts = defaultCharts }) => {
  const current = charts[0];

  return (
    <section className="bg-white py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Gráficos</h2>

        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-50 rounded-xl shadow p-4">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              {current.title}
            </h3>

            <div className="relative w-full h-[600px]">
              <iframe
                title={current.title}
                src={current.src}
                className="absolute inset-0 w-full h-full rounded-lg border"
                allow="fullscreen"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChartsCarousel;