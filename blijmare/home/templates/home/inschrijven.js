

(function() {
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
      this.map.setView([51.207153391823, 3.1801577098702], 20);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

        // Add event delegation to the map
        this.map.on('click', function (event) {
            // Check if the clicked layer is a polygon
            if (event.layer instanceof L.Polygon) {
                alert('Polygon clicked!');
                console.log('Clicked polygon:', event.layer); // Access the polygon object
                console.log('Lat/Lng of click:', event.latlng); // Access the click location
            }
        });



       PolygonAPI.fetchPolygons().then(result => {
            const featureGroup = result.map( p =>{
                const { naam, geojson } = p
                const coordinates = JSON.parse(geojson).geometry?.coordinates
                const geojsonObject =  L.geoJSON(JSON.parse(geojson), {color: 'green'})
                geojsonObject.addEventListener('click', () => alert(naam))
                geojsonObject.eachLayer((layer) => {
                    const centroid = turf.centroid(layer.feature).geometry.coordinates; // Use Turf.js for centroid calculation
                    const customIcon = L.divIcon({
                        className: 'custom-label',
                        html:`<span>${naam}</span>`,
                        iconAnchor: [0, 0],  // Pas de positie aan (50% naar links voor horizontale centrering)
                        iconSize: [0, 0]
                    });

                    // Add a marker at the centroid with the custom label
                    L.marker([centroid[1], centroid[0]], { icon: customIcon }).addTo(this.map);
                });
                geojsonObject.addTo(this.map);
            })
      })

      // Indien er al bestaande GeoJSON in het veld staat, laden we deze
      const existingGeoJSON = this.loadExistingGeoJSON();
      if (existingGeoJSON) {
        this.addGeoJSON(existingGeoJSON);
      }
    }

    createMapContainer() {
      const mapContainer = document.createElement("div");
      mapContainer.id = this.mapContainerId;
      mapContainer.style.height = "400px";
      this.geojsonField.parentNode.insertBefore(mapContainer, this.geojsonField);
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
