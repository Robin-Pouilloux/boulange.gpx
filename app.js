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
    data.elements.forEach(async (bakery) => {
    // 1. Créer un marqueur basique
    const marker = L.marker([bakery.lat, bakery.lon]).addTo(map);

    // 2. Récupérer les détails Foursquare
    const fsqDetails = await getFoursquareDetails(bakery.lat, bakery.lon, bakery.tags.name);

    // 3. Personnaliser la popup en fonction des données disponibles
    let popupContent = `<b>${bakery.tags.name || "Boulangerie"}</b><br>`;
    if (fsqDetails) {
        popupContent += `
            Note Foursquare: ${fsqDetails.rating || "Non disponible"}<br>
            Adresse: ${fsqDetails.location?.formatted_address || "Inconnue"}<br>
            Catégorie: ${fsqDetails.categories?.map(c => c.name).join(", ") || "Inconnue"}
        `;
    } else {
        popupContent += "Pas d'informations supplémentaires disponibles.";
    }

    // 4. Ajouter un lien vers Google Maps (pour les avis/photos)
    popupContent += `<br><a href="https://www.google.com/maps/search/?api=1&query=${bakery.lat},${bakery.lon}" target="_blank">Voir sur Google Maps</a>`;

    // 5. Associer la popup au marqueur
    marker.bindPopup(popupContent);
});
    
}

// Fonction pour récupérer les détails d'un lieu via Foursquare
async function getFoursquareDetails(lat, lon, name) {
    const query = encodeURIComponent(name);
    const url = `https://api.foursquare.com/v3/places/search?ll=${lat},${lon}&query=${query}&limit=1`;
    try {
        const response = await fetch(url, {
            headers: {
                "Authorization": "fsq3O43CKNpHgleJMCFUbOT5lBW5rjuqgQULigNVcgGquwc=
" // Remplace par ta clé
            }
        });
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return data.results[0]; // Retourne le premier résultat
        } else {
            return null;
        }
    } catch (error) {
        console.error("Erreur Foursquare :", error);
        return null;
    }
}
