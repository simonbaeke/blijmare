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

        // Scroll-animaties
        document.addEventListener('DOMContentLoaded', function() {
            const elements = document.querySelectorAll('.scroll-animation');
            const onScroll = () => {
                elements.forEach(element => {
                    if (element.getBoundingClientRect().top < window.innerHeight) {
                        element.classList.add('visible');
                    }
                });
            };
            window.addEventListener('scroll', onScroll);
            onScroll(); // Trigger animatie bij laden
        });

<!--&lt;!&ndash;        // Cookiebanner-->
<!--        const cookieBanner = document.getElementById('cookie-banner');-->
<!--        const acceptCookiesButton = document.getElementById('accept-cookies');-->
<!--        const declineCookiesButton = document.getElementById('decline-cookies');-->

<!--        if (localStorage.getItem('cookiesAccepted') === 'true') {-->
<!--            cookieBanner.style.display = 'none';-->
<!--        }-->

<!--        acceptCookiesButton.addEventListener('click', () => {-->
<!--            localStorage.setItem('cookiesAccepted', 'true');-->
<!--            cookieBanner?.style.display = 'none';-->
<!--        });-->

<!--        declineCookiesButton.addEventListener('click', () => {-->
<!--            localStorage.setItem('cookiesAccepted', 'false');-->
<!--            cookieBanner.style.display = 'none';-->
<!--        });&ndash;&gt;-->