    const PolygonAPI = {
        savePolygon(polygonGeoJSON) {
        return axios.post('/mysite/api/polygons/', { geojson: JSON.stringify(polygonGeoJSON) })
        .then(response => Promise.resolve(response.data))
        .catch(error => {
            console.error('Error saving polygon:', error);
            return Promise.reject(error);
        });
    },

    updatePolygon(polygonGeoJSON) {
      return axios.put(`/api/polygons/${polygonGeoJSON.id}/`, polygonGeoJSON)

    },

    fetchPolygons() {
      return axios.get('/mysite/api/polygons/')
        .then(response => response.data)
        .catch(error => {
          console.error('Error fetching polygons:', error);
          return { type: 'FeatureCollection', features: [] };
        });
    }
  }