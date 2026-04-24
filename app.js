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
