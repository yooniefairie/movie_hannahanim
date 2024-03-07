document.addEventListener('DOMContentLoaded', () => {
    const comingSoonMovies = [
        'Ghostbusters: Frozen Empire',
        'A Quiet Place: Day One',
        'The Garfield Movie',
        'Despicable Me 4',
        'Deadpool & Wolverine',
        'Inside Out 2',
        'Kingdom of the Planet of the Apes',
        'Mufasa: The Lion King',
        'Furiosa: A Mad Max Saga',
        'The Bikeriders',
        'Kraven the Hunter',
        'KKN di Desa Penari 2: Badarawuhi',
    ];
    const comingSoonContainer = document.getElementById('comingSoonContainer');
    comingSoonMovies.forEach(movieTitle => {
        const card = document.createElement('div');
        card.classList.add('coming-soon-card');
        // Fetch movie details from OMDB API
        fetch(`https://www.omdbapi.com/?apikey=c1aecf62&t=${encodeURIComponent(movieTitle)}`)
            .then(response => response.json())
            .then(movieDetails => {
                if (movieDetails.Response === 'True') {
                    // Display movie details
                    card.innerHTML = `
                        <img src="${movieDetails.Poster}" alt="${movieDetails.Title}" class="movie-poster">
                        <div class="movie-details">
                            <h2><strong></strong> ${movieDetails.Title}</h2>
                            <p><strong>Rated:</strong> ${movieDetails.Rated}</p>
                            <p><strong>Release:</strong> ${movieDetails.Released}</p>
                            <p><strong>Genre:</strong> ${movieDetails.Genre}</p>
                            <p><strong>Director:</strong> ${movieDetails.Director}</p>
                            <p><strong>Actors:</strong> ${movieDetails.Actors}</p>
                            <p><strong>Plot:</strong> ${movieDetails.Plot}</p>
                            <p><strong>Language:</strong> ${movieDetails.Language}</p>
                            <p><strong>Writer:</strong> ${movieDetails.Writer}</p>
                            <button class="teaser-button" onclick="fetchAndDisplayTeaser('${movieTitle}')">Teaser</button>
                        </div>
                    `;
                } else {
                    card.innerHTML = `<p>Error: Movie not found</p>`;
                }
                comingSoonContainer.appendChild(card);
            })
            .catch(error => {
                console.error('Error fetching movie details:', error);
            });
    });
    window.addEventListener('scroll', handleScroll);
});

document.addEventListener('DOMContentLoaded', () => {
    const comingSoonContainer = document.getElementById('comingSoonContainer');
    if (comingSoonContainer) {
        comingSoonContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('teaser-button')) {
                const movieTitle = event.target.closest('.coming-soon-card').querySelector('h2').textContent.trim();
                fetchAndDisplayTeaser(movieTitle);
            }
        });
    } else {
        console.error('Watchlist container not found');
    }
});

const apiKey = 'af1b76109560756a2450b61eff16e738';
function fetchAndDisplayTeaser(movieTitle) {
    fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(movieTitle)}`)
        .then(response => response.json())
        .then(data => {
            if (data.results.length > 0) {
                const movieID = data.results[0].id;
                return fetch(`https://api.themoviedb.org/3/movie/${movieID}/videos?api_key=${apiKey}`);
            } else {
                throw new Error('No trailer available');
            }
        })
        .then(response => response.json())
        .then(videoData => {
            if (videoData.results.length > 0) {
                const trailerKey = videoData.results[0].key;
                const trailerURL = `https://www.youtube.com/embed/${trailerKey}`;
                displayTrailer(trailerURL);
            } else {
                displayTrailerUnavailable();
            }
        })
        .catch(error => {
            console.error('Error fetching teaser trailers:', error);
            displayTrailerUnavailable();
        });
}

// Function to display the trailer in an iframe
function displayTrailer(trailerURL) {
    const trailerContainer = document.getElementById('trailerContainer');
    trailerContainer.innerHTML = `
        <iframe src="${trailerURL}" width="100%" height="300" frameborder="0" allowfullscreen></iframe>
        <button class="exit-button" onclick="exitTrailer()">Exit</button>
    `;
}

// Function to display "Trailer Unavailable" message
function displayTrailerUnavailable() {
    const trailerContainer = document.getElementById('trailerContainer');
    trailerContainer.innerHTML = `<p>Movie Trailer Unavailable</p>`;
}

// Function to close the trailer
function exitTrailer() {
    const trailerContainer = document.getElementById('trailerContainer');
    trailerContainer.innerHTML = '';
}

// Function to handle scroll and display the "back to top" button
function handleScroll() {
    const backToTopButton = document.getElementById('backToTopBtn');
    if (window.scrollY > 20) {
        backToTopButton.style.display = 'block';
    } else {
        backToTopButton.style.display = 'none';
    }
}

// Function to scroll to the top of the page
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}