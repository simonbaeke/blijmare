

(function() {
  // Zorg ervoor dat het geojson veld aanwezig is







  class PolygonMapEditor {
    constructor(mapContainerId, geojsonField, apiUrl) {
      this.mapContainerId = mapContainerId;
      this.geojsonField = geojsonField;
      this.apiUrl = apiUrl;
      this.geoJsonLayers = {};
      this.initMap();
    }

    initMap() {
      this.createMapContainer();
      this.map = L.map(this.mapContainerId).setView([51.505, -0.09], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
         maxZoom: 22
      }).addTo(this.map);

      // Initialiseer Leaflet-Geoman controls
      this.map.pm.addControls({
        position: 'topleft',
        drawMarker: false,
        drawCircle: false,
        drawPolyline: false,
        drawRectangle: false,
        drawCircleMarker: false,
      });

      this.map.setView([51.207153391823, 3.1801577098702], 20);

       PolygonAPI.fetchPolygons().then(result => {
            result.forEach( p =>{
                const { name, geojson } = p

                if ( geojson ){
                    L.geoJSON(JSON.parse(geojson)).addTo(this.map);
                }

            })

      })

      // Bij het aanmaken van een nieuwe polygoon: POST
      this.map.on('pm:create', (e) => {
        const layer = e.layer;
        const geoJson = layer.toGeoJSON();
        PolygonAPI.savePolygon(geoJson)
          .then((savedPolygon) => {
            const id = savedPolygon.id;
            layer.feature = savedPolygon;
            this.geoJsonLayers[id] = layer;
            console.log('Polygon created and saved with ID:', id);
            this.updateGeojsonField();
          })
          .catch((error) => {
            console.error('Error saving polygon:', error);
          });
      });

      // Bij het bewerken van polygonen: PUT
      this.map.on('pm:edit', (e) => {
        e.layers.eachLayer((layer) => {
          if (layer.feature && layer.feature.id) {
            const geoJson = layer.toGeoJSON();
            geoJson.id = layer.feature.id; // behoud de ID
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
      });

      // Indien er al bestaande GeoJSON in het veld staat, laden we deze
      const existingGeoJSON = this.loadExistingGeoJSON();
      if (existingGeoJSON) {
        this.addGeoJSON(existingGeoJSON);
      }
    }



    addGeoJSON(geojsonData) {
      L.geoJSON(geojsonData, {
        onEachFeature: (feature, layer) => {
          const id = feature.id;
          this.geoJsonLayers[id] = layer;
          layer.bindPopup(feature.properties.name || `Polygon ${id}`);
        }
      }).addTo(this.map);
    }

    loadExistingGeoJSON() {
      if (this.geojsonField.value) {
        return JSON.parse(this.geojsonField.value);
      }
      return null;
    }

    updateGeojsonField() {
      // Verzamelt alle polygonen en slaat ze op als een FeatureCollection in het geojson veld
      const allLayers = [];
      this.map.eachLayer((layer) => {
        if (layer instanceof L.Polygon) {
          allLayers.push(layer.toGeoJSON());
        }
      });
      const featureCollection = {
        type: "FeatureCollection",
        features: allLayers
      };
      this.geojsonField.value = JSON.stringify(featureCollection);
    }
  }

  class PolygonAPI {
    static savePolygon(polygonGeoJSON) {
      return axios.post('/mysite/api/polygons/', {geojson: JSON.stringify(polygonGeoJSON)})
        .then(function(response) {
          return response.data;
        })
        .catch(function(error) {
          console.error('Error saving polygon:', error);
          return Promise.reject(error);
        });
    }

    static updatePolygon(polygonGeoJSON) {
      return axios.put(`/api/polygons/${polygonGeoJSON.id}/`, polygonGeoJSON)
        .then(function(response) {
          return response.data;
        })
        .catch(function(error) {
          console.error('Error updating polygon:', error);
          return Promise.reject(error);
        });
    }

    static fetchPolygons() {
      return axios.get('/mysite/api/polygons/')
        .then(function(response) {
          return response.data;
        })
        .catch(function(error) {
          console.error('Error fetching polygons:', error);
          return { type: "FeatureCollection", features: [] };
        });
    }
  }

  // Initialiseer de editor als de pagina geladen is
  window.addEventListener("load", () => {
      const geojsonField = document.getElementById('map_div');

    if ( ! geojsonField ) return
    new PolygonMapEditor("polygon-map", geojsonField, "/api/polygons/");
  });
})();
