document.addEventListener('DOMContentLoaded', () => {
  // Inicializar mapa centrado en Soacha, Cundinamarca
  const map = L.map('map').setView([4.5794, -74.2168], 13);

  // Capa Esri Maps libre de bloqueos de origen
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China, TomTom',
    maxZoom: 19
  }).addTo(map);

  // Obtener puntos geolocalizados desde el backend Node.js
  async function cargarPuntosMapa() {
    try {
      const res = await fetch('/api/puntos');
      const puntos = await res.json();

      puntos.forEach(punto => {
        const marker = L.marker(punto.coords).addTo(map);
        marker.bindPopup(`<b>${punto.nombre}</b><br><span class="text-xs text-stone-500">${punto.categoria}</span>`);

        marker.on('click', () => {
          document.getElementById('sitio-nombre').innerText = punto.nombre;
          document.getElementById('sitio-categoria').innerText = punto.categoria;
          document.getElementById('sitio-descripcion').innerText = punto.descripcion;
        });
      });
    } catch (err) {
      console.error('Error al cargar puntos del mapa:', err);
    }
  }

  cargarPuntosMapa();
});