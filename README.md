# 🌿 Climathia — Plataforma de Visualización Ambiental

<div align="center">

![Climathia](https://img.shields.io/badge/Climathia-Ambiental-green?style=for-the-badge&logo=leaflet)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Leaflet](https://img.shields.io/badge/Leaflet-Map-199900?style=for-the-badge&logo=leaflet)
![Recharts](https://img.shields.io/badge/Recharts-Visualizacion-orange?style=for-the-badge)

<em>Una plataforma sencilla y moderna para explorar datos ambientales: mapas interactivos, análisis visual y acceso rápido al Dashboard Ambiental externo.</em>

</div>

## 📖 Descripción
Climathia integra componentes de mapas y visualización con una experiencia ligera en React + Vite. El proyecto incluye páginas de inicio y datos, además de un enlace directo a un Dashboard Ambiental construido en Google Apps Script.
## ❤️ Youtube - Video OFICIAL 
https://youtu.be/s-nEq7f-RbQ?si=VKrlYZjPpaIBvtes 

## ✨ Características Principales
- Mapas interactivos con Leaflet (estaciones, capas y markers).
- Secciones de análisis con gráficos usando Recharts.
- Carga y manejo de datos con Axios y PapaParse.
- Navegación simple y responsiva con Tailwind.
- Acceso directo al Dashboard Ambiental externo (Google Apps Script).


## 🛠️ Tecnologías
- React 19 y Vite 5
- Tailwind CSS 4 (`@tailwindcss/vite`)
- Leaflet y React-Leaflet (mapas)
- Recharts (gráficos)
- Axios y PapaParse (datos)
- Headless UI y Lucide (UI/íconos)

## 📁 Estructura del Proyecto
```
climathia-app/
├── public/                  # Recursos estáticos (imágenes, CSV)
├── src/
│   ├── components/          # Componentes reutilizables (Header, Map, etc.)
│   ├── pages/               # Páginas (Home, Datos, DashboardAmbiental)
│   ├── services/            # API y utilidades
│   ├── index.css            # Estilos globales
│   └── main.jsx             # Entrada de la app
├── server/                  # Servidor Express simple (opcional)
├── package.json             # Scripts y dependencias del cliente
└── README.md
```

## 🔧 Requisitos
- `Node.js` 18 o superior
- `npm` 9 o superior

## 🚀 Instalación y Configuración
1. Clonar el repositorio.
2. Instalar dependencias del cliente:
   ```bash
   npm install
   ```
3. (Opcional) Instalar dependencias del servidor Express:
   ```bash
   cd server && npm install
   ```

## 🚀 Scripts Disponibles (Cliente)
- `npm run dev`: inicia el servidor de desarrollo de Vite (por defecto en `http://localhost:5173/`; si está ocupado, usa otro puerto como `5174`).
- `npm run build`: genera el build de producción en `dist/`.
- `npm run preview`: sirve el build de `dist/` para revisión local.
- `npm run lint`: ejecuta ESLint.

## 🧭 Dashboard Ambiental (URL externa)
- La app enlaza a un panel de Google Apps Script mediante la constante `DASHBOARD_URL`.
- URL actual:
  ```
  https://script.google.com/macros/s/AKfycbwtQiSeAwKY5YBniRyT4d2p39dAzwnJpjaHAmq743fxTim45T7xngon4Dp35Z7GNtzt/exec
  ```
- Dónde se configura:
  - `src/components/Header.tsx` (botón del encabezado)
  - `src/pages/DashboardAmbiental.jsx` (página dedicada)

Para actualizar el enlace, cambia `DASHBOARD_URL` en ambos archivos.

## 🧩 Rutas Principales
- `HomePage` (`/`): portada.
- `DatosPage` (`/datos`): secciones de análisis y visualización.
- `DashboardAmbiental` (`/dashboard` o botón en Header): redirección al panel externo.

## 🧪 Desarrollo
- Estilos: Tailwind con paleta pastel ambiental (ver `src/components/DatosAnalisis.jsx` y `src/index.css`).
- Mapas: `MapComponent.jsx` y `DatosMapSection.jsx` usan Leaflet; asegúrate de importar los estilos de Leaflet.
- Gráficos: `ChartsCarousel.jsx` y secciones en `DatosPage.jsx` usan Recharts.

## 📦 Construcción y Despliegue
1. Construir:
   ```bash
   npm run build
   ```
2. Previsualizar el build:
   ```bash
   npm run preview
   ```
3. Desplegar los contenidos de `dist/` en tu hosting preferido.

## 🌐 Servidor (opcional)
- El directorio `server/` contiene un servidor Express simple (`server.js`).
- Para ejecutarlo localmente:
  ```bash
  node server/server.js
  ```

## 🤝 Contribución
- Usa ramas de feature y Pull Requests hacia `main`.
- Ejecuta `npm run lint` antes de subir cambios.
- Evita commitear `dist/` y archivos generados.

## ⚖️ Licencia
Este proyecto está licenciado bajo **MIT** (licencia permisiva).
- Permite usar, copiar, modificar y distribuir el código.
- Requiere mantener el aviso de copyright y el texto de la licencia.
- Se proporciona “tal cual”, sin garantías.

Consulta el archivo `LICENSE` para el texto completo.


### Créditos de imágenes
- Las imágenes usadas en el proyecto (carpeta `public/images/`) se publican bajo **CC0 (Dominio Público)**: https://creativecommons.org/publicdomain/zero/1.0/
- Atribución opcional (por cortesía): `"Logotipo Climathia" por Vivian Rivas, disponible en public/images/logoheader.png, liberado bajo CC0 (https://creativecommons.org/publicdomain/zero/1.0/).`

## 🙌 Créditos
- Climathia — proyecto de visualización ambiental.

