class MapService {
    constructor(geojsonFieldId, alpineObject) {
        this.mapContainerId = 'polygon-map';
        this.geojsonField = document.getElementById(geojsonFieldId);
        this.map = null;
        this.geoJsonLayers = {};
        this.alpineObject = alpineObject
        this.initialized = false
    }

    createMapContainer() {
        const mapContainer = document.createElement("div");
        mapContainer.id = this.mapContainerId;
        mapContainer.style.height = "400px";
        this.geojsonField.parentNode.insertBefore(mapContainer, this.geojsonField);
    }

    getMap(){
        return this.map
    }

    destroyLayer(layer){
        this.map.removeLayer(layer)
    }

    initMap() {
        if ( this.initialized ) return

        this.initialized =  true
        if (  this.map !== null) return
        if (!this.geojsonField) {
          console.error('GeoJSON field not found!');
          return;
        }

        this.createMapContainer()


        this.map = L.map(this.mapContainerId).setView([51.209, 3.176], 17);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors',
            maxZoom: 22
        }).addTo(this.map);


        this.addEventListeners();
    }

    initControls(){
         this.map.pm.addControls({
            position: 'topleft',
            drawMarker: false,
            drawCircle: false,
            drawPolyline: false,
            drawRectangle: false,
            drawCircleMarker: false,
            drawText: false,
            editMode: false,         // Geen bewerkingsmodus (edit)
            removalMode: false,      // Geen gummodus (remove)
            cutPolygon: false,
              dragMode: false,         // Geen drag (slepen) tool
            rotateMode: false
        });
    }




addEventListeners() {
    this.map.on('pm:create', (e) => this.alpineObject.standplaatsCreated(e));
    this.map.on('pm:edit', (e) => this.handlePolygonEdit(e));
}


  handlePolygonEdit(e) {
    e.layers.eachLayer((layer) => {
      if (layer.feature && layer.feature.id) {
        const geoJson = layer.toGeoJSON();
        geoJson.id = layer.feature.id;
        PolygonAPI.updatePolygon(geoJson)
          .then((updatedPolygon) => {
            console.log('Polygon updated:', updatedPolygon);
            layer.feature = updatedPolygon;
            this.updateGeojsonField();
          })
          .catch((error) => {
            console.error('Error updating polygon:', error);
          });
      }
    });
  }

  updateGeojsonField() {
    const allLayers = [];
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Polygon) {
        allLayers.push(layer.toGeoJSON());
      }
    });

    const featureCollection = {
      type: 'FeatureCollection',
      features: allLayers
    };

    this.geojsonField.value = JSON.stringify(featureCollection);
  }
}
