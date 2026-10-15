document.addEventListener('DOMContentLoaded', () => {
  // Inicializar el mapa centrado en Soacha
  const map = L.map('map').setView([4.57, -74.25], 12);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China, TomTom',
    maxZoom: 19
  }).addTo(map);

  async function cargarPuntosMapa() {
    try {
      const res = await fetch('/api/puntos');
      
      if (!res.ok) {
        console.error('Error del servidor al cargar puntos:', res.status);
        return;
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         console.error("Formato incorrecto: El servidor no devolvió JSON en /api/puntos.");
         return;
      }

      const puntos = await res.json();

      puntos.forEach(punto => {
        const coordenadas = punto.coords ? punto.coords : [punto.latitud, punto.longitud];
        
        if (!coordenadas[0] || !coordenadas[1]) return;

        // Icono personalizado: Punto verde con borde blanco
        const iconoPersonalizado = L.divIcon({
          className: 'bg-emerald-600 rounded-full border-2 border-white shadow-lg',
          html: '<div style="width:12px;height:12px;background:white;border-radius:50%;"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12]
        });

        const marker = L.marker(coordenadas, { icon: iconoPersonalizado }).addTo(map);
        
        marker.bindPopup(`<b>${punto.nombre}</b><br><span class="text-xs text-stone-500">${punto.categoria}</span>`);

        marker.on('click', () => {
          const elNombre = document.getElementById('sitio-nombre');
          const elCat = document.getElementById('sitio-categoria');
          const elDesc = document.getElementById('sitio-descripcion');

          if (elNombre) elNombre.innerText = punto.nombre;
          if (elCat) elCat.innerText = punto.categoria;
          if (elDesc) elDesc.innerText = punto.descripcion;
        });
      });
    } catch (err) {
      console.error('Error de conexión al cargar puntos del mapa:', err);
    }
  }

  cargarPuntosMapa();
});