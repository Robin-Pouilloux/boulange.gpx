// Initialiser la carte Leaflet centrée sur la France
const map = L.map('map').setView([46.603354, 1.888334], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// Fonction pour lire le fichier GPX
document.getElementById('file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const gpx = new gpxParser(); // Utilise gpx.js pour parser
        gpx.parse(e.target.result);
        const geoJSON = gpx.toGeoJSON(); // Convertir en GeoJSON
        L.geoJSON(geoJSON).addTo(map); // Afficher le tracé
        map.fitBounds(L.geoJSON(geoJSON).getBounds()); // Zoomer sur le tracé
        // Appeler la fonction pour trouver les boulangeries
        findBakeries(geoJSON);
    };
    reader.readAsText(file);
});

// Fonction pour trouver les boulangeries (à compléter)
function findBakeries(gpxGeoJSON) {
    console.log("Tracé GPX chargé, recherche des boulangeries...");
    // Logique à ajouter ici (Étape 4)
}

async function findBakeries(gpxGeoJSON) {
    // Extraire les coordonnées du tracé GPX
    const coordinates = gpxGeoJSON.features[0].geometry.coordinates;
    // Créer une requête Overpass pour les boulangeries dans un rayon de 5 km
    const overpassQuery = `
    [out:json];
    (
        node["amenity"="bakery"](around:5000,${coordinates[0][1]},${coordinates[0][0]});
        node["shop"="bakery"](around:5000,${coordinates[0][1]},${coordinates[0][0]});
        node["shop"="pastry"](around:5000,${coordinates[0][1]},${coordinates[0][0]});
    );
    out;
    `;
    // Appeler Overpass API
    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
    const data = await response.json();
    // Afficher les boulangeries sur la carte
    data.elements.forEach(bakery => {
        L.marker([bakery.lat, bakery.lon])
            .addTo(map)
            .bindPopup(`<b>${bakery.tags.name || "Boulangerie"}</b><br>Pas d'avis disponibles`);
    });
}
