class StandplaatsManager {
    constructor(map, alpineObject) {
        this.map = map;
        this.alpineObject = alpineObject
        this.standplaatsen = []
    }

    addStandplaats(geojsonObject, naam, id){
        const standplaats = new Standplaats(geojson, this.map, naam, id)
        const geojson = geojsonObject.toGeoJSON();
    }

    getlist(){
        return this.standplaatsen
    }

    createStandplaats(p){
        const { naam, geojson, id, heeft_reservering } = p
        const coordinates = JSON.parse(geojson).geometry?.coordinates
        const standplaats = new Standplaats(p, this.map)
        standplaats.setReservering(heeft_reservering)

        if ( ! heeft_reservering){
            standplaats.addEventListener('click', e => this.alpineObject.standplaatsClicked(standplaats))

        }

        this.standplaatsen.push( standplaats )
    }

    removeStandplaats(id){


    }
}