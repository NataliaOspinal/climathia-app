import React from 'react';

const DASHBOARD_URL = "https://script.google.com/macros/s/AKfycbwtQiSeAwKY5YBniRyT4d2p39dAzwnJpjaHAmq743fxTim45T7xngon4Dp35Z7GNtzt/exec";

export default function DashboardAmbiental() {
  // Quitar el overlay y mostrar el acceso directo al Apps Script

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">
      <section className="max-w-xl w-full text-center">
        <h1 className="text-2xl font-semibold mb-4">Dashboard Ambiental</h1>
        <p className="text-gray-700 mb-6">
          Abre el dashboard directamente en el enlace oficial de Apps Script.
        </p>
        <a
          href={DASHBOARD_URL}
          className="inline-block bg-green text-white px-6 py-3 rounded-md shadow-sm hover:bg-green/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 transition-colors duration-150"
        >
          Abrir Dashboard Ambiental
        </a>

        <p className="text-sm text-gray-500 mt-4">
          Si tu navegador bloquea la incrustación en iframe, usa este enlace directo.
        </p>
      </section>
    </main>
  );
}