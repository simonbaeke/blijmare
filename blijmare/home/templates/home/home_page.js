
const polygonMap = {

    map: null,

    init(){
        this.map = L.map('map').setView([51.2093, 3.2247], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenblablaMap contributors', maxZoom: 22
        }).addTo(this.map);

        if (this.map.pm) {
            this.map.pm.addControls({
                position: 'topleft',
                drawCircle: false // als voorbeeld: uitschakelen van cirkels
            });
        }

        this.map.on("pm:create", (e) => {
            e.layer.options.pmIgnore = false;
            L.PM.reInitLayer(e.layer);
        });
    }
}