
let standplaatsen = null
function adminStandplaatsAlpine(geojsonFieldId) {
    return {
        setCenterMode: false,
        standplaatsen: [],
        api: PolygonAPI,
        standplaatsManager: null,
        mapService: null,


        init(){
            this.mapService = new MapService(geojsonFieldId, this);
            this.mapService.initMap();
            this.mapService.initControls();
            this.standplaatsManager = new StandplaatsManager(this.mapService.getMap(), this)
            this.standplaatsen = this.standplaatsManager.standplaatsen
            this.api.fetchPolygons().then( data => {
                data.forEach( iets => {
                    this.standplaatsManager.createStandplaats(iets)
                })
            })

            standplaatsen = this.standplaatsen
        },

        standplaatsClicked(e, standplaats){
            console.log('standplaats clicked')
        },

        verwijderStandPlaatsVanReservering(standplaats){
            axios.delete(standplaats.delete_from_reservation_url)
            standplaats.reservering = null
            standplaats.heeftReservering = null
            standplaats.setReservering(false)
        },

        standplaatsCreated(e){
            console.log('standplaatscreated')
            const layer = e.layer
            const geoJson = layer.toGeoJSON();
//            this.mapService.destroyLayer(layer)
            this.api.savePolygon(geoJson)
            .then((savedPolygon) => {
                this.standplaatsManager.createStandplaats(savedPolygon)
            })
            .catch((error) => {
                console.error('Error saving polygon:', error);
            });
        }
}   ;
}

