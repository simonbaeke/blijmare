class Reservering{
    constructor(json){
        if (json === null) return

        const { voornaam, familienaam, standplaatsen } = json
        this.voornaam = voornaam,
        this.familienaam = familienaam
        this.standplaatsen = standplaatsen
        this.fullName = this.voornaam + " " + this.familienaam

    }
}

class Standplaats{
    constructor(json, map){
        const { naam, geojson, id, heeft_reservering , reservering, url} = json
        this.geojsonObject = L.geoJSON(JSON.parse(geojson), {color: 'green'})
        this.markers = []
        this.geojsonObject.addTo(map)
        this.name = naam
        this.map = map
        this.addLabel()
        this.id = id
        this.heeftReservering = false
        this.delete_from_reservation_url = json.delete_from_reservation_url
        this.url  = url
        if ( json.reservering === null ) return
        this.reservering = new Reservering(json.reservering)
    }

    setReservering( heeftReservering){
        const color = heeftReservering? 'blue' : 'green'
        this.heeftReservering = heeftReservering;
        this.geojsonObject.setStyle({color: color})
    }

    addLabel(){

       this.geojsonObject.eachLayer((layer) => {
            const centroid = turf.centroid(layer.feature).geometry.coordinates; // Use Turf.js for centroid calculation
            const customIcon = L.divIcon({
                className: 'custom-label',
                html:`<span>${this.name}</span>`,
                iconAnchor: [0, 0],  // Pas de positie aan (50% naar links voor horizontale centrering)
                iconSize: [0, 0]
            });
            const marker = L.marker([centroid[1], centroid[0]], { icon: customIcon })
            marker.addTo(this.map);
            this.markers.push(marker)
        });
    }

    toggleSelected(selected=true){
        const color = selected? 'orange' : 'green'
        this.geojsonObject.setStyle({color: color})
    }

    addEventListener(event, callback){
        this.geojsonObject.on(event, callback)
    }

    destroy(){
        if (this.geojsonObject) {
            this.geojsonObject.remove();
            this.markers.forEach( m => m.remove())
            this.geojsonObject = null; // Optioneel: reset de variabele
        }
    }
}