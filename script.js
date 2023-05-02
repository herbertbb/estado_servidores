async function loadUbicaciones() {
  const response = await fetch('ubicaciones.json');
  const data = await response.json();
  return data.servers;
}


async function updateMarkers(earth, markers) {
  // Cargar ubicaciones desde ubicaciones.json
  const servers = await loadUbicaciones();

  // Eliminar los marcadores actuales del mapa
  for (const label in markers) {
    markers[label].removeFrom(earth);
  }

  // Agregar nuevos marcadores al mapa
  servers.forEach((server) => {
    ruta_imagen = 'marcador_gps/small/' + server.color + '/1.png';
    const marker = WE.marker([server.lat, server.lon], ruta_imagen, 19, 19).addTo(earth);
    marker
      .bindPopup(`<strong>${server.description}</strong>`, {
        maxWidth: 55,
        closeButton: false,
      })
      .openPopup();
    markers[server.label] = marker;
  });

  // Actualizar la lista de ubicaciones en la página
  const locationsList = servers
    .map((server) => `<li id="location-${server.label.replace(/[\W_]+/g, '-')}">${server.label}</li>`)
    .join('');
  document.getElementById('locations').innerHTML = locationsList;
}

async function initMap() {
  const earthContainer = document.getElementById('earth');
  const earth = new WE.map('earth', {
    zoom: 1.5,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    dragging: false,
  });

  WE.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Estado de los Servidores.',
  }).addTo(earth);

  // Centrar el mapa en el Ecuador
  earth.setView([0, 10]);

  const autoRotateSpeed = 0.07; // Grados por segundo
  const autoRotateTimeout = 50;
  let lastUserInteraction = Date.now();

  function autoRotate() {
    if (Date.now() - lastUserInteraction > autoRotateTimeout) {
      const currentPosition = earth.getCenter();
      const updatedPosition = [
        currentPosition[0],
        currentPosition[1] + autoRotateSpeed,
      ];
      earth.setView(updatedPosition);
    }
    requestAnimationFrame(autoRotate);
  }

  // Cargar ubicaciones desde ubicaciones.json y agregar marcadores al mapa
  const markers = {};
  await updateMarkers(earth, markers);

  // Actualizar las ubicaciones cada 10 segundos
  setInterval(async () => {
    await updateMarkers(earth, markers);
  }, 100000);

  autoRotate();
}

initMap();
