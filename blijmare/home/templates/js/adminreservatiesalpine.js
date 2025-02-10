function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Zoek de cookie met de opgegeven naam
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

window.addEventListener('load', () =>{
    const csrfToken = getCookie('csrftoken');
    axios.defaults.headers.common['X-CSRFToken'] = csrfToken;
    axios.defaults.headers.post['Content-Type'] = 'application/json';
})

function adminReservatieAlpine(){

    return{
        reservaties: JSON.parse(document.getElementById('reservaties').textContent),
        init(){

        },

        deleteStandplaatsFromReservering(reservering, standplaats){
            const index = reservering.standplaatsen.forEach(s => s.id === standplaats.id)

            axios.delete( standplaats.delete_from_reservering_url).then(response => {
                reservering.standplaatsen.splice(index, 1)

                if (reservering.standplaatsen.length === O){
                    const reservatieIndex = this.reservaties.findIndex( r => r.id === reservering.id )
                    this.reservaties.splice(reservatieIndex, 1)

                }
            })
        },

        deleteReservering(reservering){
        const index = this.reservaties.findIndex( r => r.id === reservering.id )

        axios.delete(reservering.delete_url).then( response => {
            this.reservaties.splice(index, 1)
        })
        }
    }

}