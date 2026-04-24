// 1. Initialiser la carte Leaflet
const map = L.map('map').setView([46.603354, 1.888334], 6); // Centré sur la France
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// 2. Fonction pour lire le fichier GPX
document.getElementById('file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const gpx = new gpxParser();
        gpx.parse(e.target.result);
        const geoJSON = gpx.toGeoJSON();

        // 3. Afficher le tracé GPX sur la carte
        const gpxLayer = L.geoJSON(geoJSON, {
            style: { color: 'red', weight: 3 }
        }).addTo(map);
        map.fitBounds(gpxLayer.getBounds());

        // 4. Rechercher les boulangeries autour du tracé
        findBakeries(geoJSON);
    };
    reader.readAsText(file);
});

// 5. Fonction pour trouver les boulangeries via Overpass API
async function findBakeries(gpxGeoJSON) {
    const coordinates = gpxGeoJSON.features[0].geometry.coordinates;

    // Requête Overpass pour les boulangeries dans un rayon de 5 km autour de chaque point du GPX
    for (let i = 0; i < coordinates.length; i += 20) { // Échantillonner tous les 20 points pour éviter trop de requêtes
        const lat = coordinates[i][1];
        const lon = coordinates[i][0];

        const overpassQuery = `
        [out:json];
        (
            node["amenity"="bakery"](around:5000,${lat},${lon});
            node["shop"="bakery"](around:5000,${lat},${lon});
            node["shop"="pastry"](around:5000,${lat},${lon});
        );
        out;
        `;

        try {
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
            const data = await response.json();

            // 6. Afficher les boulangeries sur la carte avec un lien vers Google Maps
            data.elements.forEach(bakery => {
                if (bakery.lat && bakery.lon) {
                    L.marker([bakery.lat, bakery.lon], {
                        icon: L.icon({
                            iconUrl: 'https://cdn-icons-png.flaticon.com/512/136/136676.png', // Icône de boulangerie
                            iconSize: [25, 25]
                        })
                    })
                    .addTo(map)
                    .bindPopup(`
                        <b>${bakery.tags.name || "Boulangerie"}</b><br>
                        <a href="https://www.google.com/maps/search/?api=1&query=${bakery.lat},${bakery.lon}" target="_blank">
                            Voir les avis et photos sur Google Maps
                        </a>
                    `);
                }
            });
        } catch (error) {
            console.error("Erreur Overpass API :", error);
        }
    }
}
