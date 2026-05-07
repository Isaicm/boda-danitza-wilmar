/* ══════════════════════════════════════════════════════
   BODA DANITZA & WILMAR — map.js
   Leaflet interactive map — Hacienda Castellazo, Cali
══════════════════════════════════════════════════════ */

'use strict';

// Coordenadas de Hacienda Castellazo, Cali, Valle del Cauca
// Verifica estas coordenadas buscando "Hacienda Castellazo Cali" en Google Maps
// y haz clic derecho → "¿Qué hay aquí?" para obtener las coordenadas exactas.
var MAP_LAT = 3.4312;
var MAP_LNG = -76.5558;
var mapInstance = null;

function initMap() {
  if (mapInstance) return; // ya iniciado
  if (typeof L === 'undefined') return;

  mapInstance = L.map('map', {
    center:           [MAP_LAT, MAP_LNG],
    zoom:             15,
    scrollWheelZoom:  false,
    zoomControl:      true
  });

  // CartoDB Positron tiles (clean, elegant, no API key needed)
  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>' +
        ' &copy; <a href="https://carto.com/" target="_blank">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }
  ).addTo(mapInstance);

  // Custom palo de rosa marker
  var icon = L.divIcon({
    className: '',
    html:
      '<div style="' +
        'width:36px;height:36px;' +
        'background:linear-gradient(135deg,#C97B8A,#E8A0AE);' +
        'border:3px solid #FFFFFF;' +
        'border-radius:50% 50% 50% 0;' +
        'transform:rotate(-45deg);' +
        'box-shadow:0 4px 14px rgba(0,0,0,0.28);' +
      '"></div>' +
      '<div style="' +
        'position:absolute;top:50%;left:50%;' +
        'transform:translate(-50%,-50%) rotate(45deg);' +
        'color:white;font-size:14px;margin-top:-3px;' +
      '">♡</div>',
    iconSize:   [36, 36],
    iconAnchor: [18, 36],
    popupAnchor:[0,  -40]
  });

  L.marker([MAP_LAT, MAP_LNG], { icon: icon })
    .addTo(mapInstance)
    .bindPopup(
      '<div style="font-family:\'Cormorant Garamond\',serif;text-align:center;padding:4px 8px;">' +
        '<strong style="color:#687461;font-size:1rem;">Hacienda Castellazo</strong><br>' +
        '<span style="font-size:0.85rem;color:#66554C;">Cali, Valle del Cauca</span><br>' +
        '<em style="font-size:0.8rem;color:#9A6758;">9 de Agosto, 2026 · 5:00 PM</em>' +
      '</div>',
      { maxWidth: 220 }
    )
    .openPopup();

  // Invalidate size after CSS transition (section was hidden)
  setTimeout(function () {
    mapInstance.invalidateSize();
  }, 300);
}

// Lazy init — only load Leaflet tiles when map section scrolls into view
var mapObserver = new IntersectionObserver(
  function (entries) {
    if (entries[0].isIntersecting) {
      initMap();
      mapObserver.disconnect();
    }
  },
  { threshold: 0.2 }
);

var mapSection = document.getElementById('sectionMap');
if (mapSection) {
  mapObserver.observe(mapSection);
}
