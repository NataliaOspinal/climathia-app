# Climathia

Aplicación web para visualización y análisis ambiental construida con React + Vite y Tailwind CSS. Integra un panel externo de Google Apps Script para el "Dashboard Ambiental" y secciones propias para búsqueda, mapas y análisis.

## Tecnologías
- React 19 y Vite 5
- Tailwind CSS 4 (`@tailwindcss/vite`)
- Leaflet y React-Leaflet (mapas)
- Recharts (gráficos)
- Axios y PapaParse (datos)
- Headless UI y Lucide (UI/íconos)

## Estructura del proyecto
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

## Requisitos
- Node.js 18 o superior
- npm 9 o superior

## Instalación
1. Clonar el repositorio.
2. Instalar dependencias de la app:
   ```bash
   npm install
   ```
3. (Opcional) Instalar dependencias del servidor Express:
   ```bash
   cd server && npm install
   ```

## Scripts disponibles (cliente)
- `npm run dev`: inicia el servidor de desarrollo de Vite (por defecto en `http://localhost:5173/`). Si el puerto está ocupado, Vite elegirá otro (ej. `5174`).
- `npm run build`: genera el build de producción en `dist/`.
- `npm run preview`: sirve el build de `dist/` para revisión local.
- `npm run lint`: ejecuta ESLint.

## Dashboard Ambiental (URL externa)
- La app enlaza a un panel de Google Apps Script con la constante `DASHBOARD_URL`.
- URL actual:
  ```
  https://script.google.com/macros/s/AKfycbwtQiSeAwKY5YBniRyT4d2p39dAzwnJpjaHAmq743fxTim45T7xngon4Dp35Z7GNtzt/exec
  ```
- Lugares donde se configura:
  - `src/components/Header.tsx` (botón en el encabezado)
  - `src/pages/DashboardAmbiental.jsx` (página dedicada)

Para actualizar el enlace, cambiar la constante `DASHBOARD_URL` en ambos archivos.

## Rutas principales
- `HomePage` (`/`): portada.
- `DatosPage` (`/datos`): secciones de análisis y visualización.
- `DashboardAmbiental` (`/dashboard` o botón en Header): redirección al panel externo.

## Desarrollo
- Estilos: Tailwind con paleta pastel ambiental (ver `src/components/DatosAnalisis.jsx` y `src/index.css`).
- Mapas: `MapComponent.jsx` y `DatosMapSection.jsx` usan Leaflet; asegúrate de que los estilos de Leaflet se importen.
- Gráficos: `ChartsCarousel.jsx` y secciones en `DatosPage.jsx` usan Recharts.

## Construcción y despliegue
1. Construir:
   ```bash
   npm run build
   ```
2. Previsualizar el build:
   ```bash
   npm run preview
   ```
3. Desplegar los contenidos de `dist/` en tu hosting preferido.

## Servidor (opcional)
- El directorio `server/` contiene un servidor Express simple (`server.js`).
- Para ejecutarlo localmente:
  ```bash
  node server/server.js
  ```

## Contribución
- Usa ramas de feature y Pull Requests hacia `main`.
- Ejecuta `npm run lint` antes de subir cambios.
- Evita commitear `dist/` y archivos generados.

## Licencia
Este proyecto está licenciado bajo **MIT** (licencia permisiva).
- Permite usar, copiar, modificar y distribuir el código.
- Requiere mantener el aviso de copyright y el texto de la licencia.
- Se proporciona “tal cual”, sin garantías.

Consulta el archivo `LICENSE` para el texto completo.

Si deseas licenciar contenidos (imágenes/medios) bajo **Creative Commons** además del código MIT, indícame la variante (por ejemplo, `CC BY 4.0`) y lo añadimos al README.

### Atribución de medios (Creative Commons)
- Elementos mínimos de atribución: título del recurso, autor, fuente/enlace al recurso, nombre y enlace de la licencia.
- Plantilla recomendada (CC BY 4.0): `"[Título del recurso]" por [Autor], disponible en [URL del recurso], bajo licencia [CC BY 4.0] ([https://creativecommons.org/licenses/by/4.0/]).`
- Ejemplo (imagen): `"Mapa de estaciones 2024" por Climathia, disponible en https://tu-dominio/imagen.png, bajo licencia CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).`
- Si usas **CC0** (Dominio Público), puedes omitir la atribución, pero se recomienda citar la fuente cuando sea posible.

## Créditos
- Climathia — proyecto de visualización ambiental.

