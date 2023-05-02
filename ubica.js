async function loadUbicaciones() {
  const response = await fetch('ubicaciones.json');
  const data = await response.json();
  return data.servers;
}

  

  