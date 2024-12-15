const MINNESOTA_MAP = {
    name: "Minnesota",
    population: 5700000,
    color: "#2a9d8f",
    marketShare: 0.01,
    policies: 5700,
    profitMargin: 0.15,
    yearFounded: 1977,
    startingHospital: {
        name: "Hennepin County Medical Center",
        // Converting 44°58′21″N 93°15′43″W to decimal coordinates
        coords: [44.9725, -93.2619],
        city: "Minneapolis"
    }
};

class InsuranceMap {
    constructor(game) {
        this.game = game;
        this.marketShare = MINNESOTA_MAP.marketShare;
        this.policies = MINNESOTA_MAP.policies;
        
        this.setupDisplay();
    }

    setupDisplay() {
        const mapPanel = document.getElementById('map-container');
        mapPanel.innerHTML = `
            <h2>🗺️ Starting at ${MINNESOTA_MAP.startingHospital.name}</h2>
            <div class="map-visualization">
                <div id="minnesota-map"></div>
            </div>
        `;

        // Initialize map centered on HCMC
        this.map = L.map('minnesota-map').setView(MINNESOTA_MAP.startingHospital.coords, 13);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries/USA/MN.geo.json')
            .then(response => response.json())
            .then(data => {
                this.stateLayer = L.geoJSON(data, {
                    style: () => ({
                        fillColor: MINNESOTA_MAP.color,
                        fillOpacity: 0.1,
                        color: '#666',
                        weight: 1
                    })
                }).addTo(this.map);

                // Add HCMC marker
                L.marker(MINNESOTA_MAP.startingHospital.coords, {
                    icon: L.divIcon({
                        html: `<div class="hospital-marker">🏥</div>`,
                        className: 'hospital-icon'
                    })
                }).addTo(this.map);
            });
    }
}

window.InsuranceMap = InsuranceMap;