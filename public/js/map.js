const latitude = listing.geometry.coordinates[1];
const longitude = listing.geometry.coordinates[0];

const map = L.map("map").setView([latitude, longitude], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

L.marker([latitude, longitude])
    .addTo(map)
    .bindPopup(`
        <b>${listing.title}</b><br>
        Exact location will be provided after booking.
    `)
    .openPopup();