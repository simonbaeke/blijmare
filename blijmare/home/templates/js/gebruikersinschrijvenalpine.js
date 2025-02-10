function gebruikersInschrijvenAlpine(geojsonFieldId) {
    return {
        setCenterMode: false,
        geselecteerdeStandplaatsen: [],
        api: PolygonAPI,
        standplaatsManager: null,
        mapService: null,


        init() {

            this.mapService = new MapService(geojsonFieldId, this);
            this.mapService.initMap();
            this.standplaatsManager = new StandplaatsManager(this.mapService.getMap(), this)
            this.standplaatsen = this.standplaatsManager.standplaatsen

            this.api.fetchPolygons().then( data => {
                data.forEach( iets => {
                    this.standplaatsManager.createStandplaats(iets)
                })
            })
        },

        standplaatsClicked(standplaats){
            if (standplaats.heeftReservering) return

            const index = this.geselecteerdeStandplaatsen.findIndex( st => st.id === standplaats.id )

            if ( index < 0 ){
                this.geselecteerdeStandplaatsen.push(standplaats)
                standplaats.toggleSelected()
                return
            }

            this.remove(index)
        },

        remove(index){
            const standplaats = this.geselecteerdeStandplaatsen[index]
            standplaats.toggleSelected(false)
            this.geselecteerdeStandplaatsen.splice(index, 1)

        },
        hideDialog(){
            document.getElementById('reservationDialog').classList.add('hidden');
        },

        showDialog(){
            document.getElementById('reservationDialog').classList.remove('hidden');
        },

        submitForm(event){
            const formData = new FormData(event.target)
            formData.append('standplaatsen', this.geselecteerdeStandplaatsen.map( st => st.id ))
            this.hideDialog()
            axios.post('/mysite/api/reserveringen/', formData)
            .then(response => {
          Swal.fire({
                    icon: 'success',
                    title: 'Reservering succesvol!',
                    text: 'Je reservering is aangemaakt.',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            })
            .catch(error => {
             Swal.fire({
                    icon: 'error',
                    title: 'Fout!',
                    text: JSON.stringify(error.response?.data?.message) || 'Er is een fout opgetreden.',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            });
        }


    }
}