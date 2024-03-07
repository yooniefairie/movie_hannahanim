// Set to store movie titles that have already been displayed
const displayedMovieTitles = new Set();

async function fetchAllTopMoviesOfTheYear() {
    try {
        const apiKey = 'af1b76109560756a2450b61eff16e738';
        const totalPages = 2; 
        let allMovies = [];
        for (let page = 1; page <= totalPages; page++) {
            const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&primary_release_year=2024&sort_by=popularity.desc&page=${page}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            allMovies = allMovies.concat(data.results);
        }
        return allMovies;
    } catch (error) {
        console.error('Error fetching top movies of the year:', error);
        return null;
    }
}

async function fetchMovieTrailerUrl(movieId) {
    try {
        const apiKey = 'af1b76109560756a2450b61eff16e738';
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`);
        const data = await response.json();
        const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        if (trailer) {
            return `https://www.youtube.com/watch?v=${trailer.key}`;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching movie trailer:', error);
        return null;
    }
}

function displayRatingEmojis(rating) {
    const numberOfEmojis = Math.round(parseFloat(rating) / 2); // Assuming the rating is out of 10
    const fullEmoji = '🎞️'; // Emoji for full rating
    const emptyEmoji = '⚪'; // Emoji for empty rating
    return fullEmoji.repeat(numberOfEmojis) + emptyEmoji.repeat(5 - numberOfEmojis);
}

async function createMovieCard(movie) {
    if (displayedMovieTitles.has(movie.title)) {
        return ''; // Skip creating HTML for already displayed movie
    }
    const genreMap = {
        28: 'Action',
        12: 'Adventure',
        16: 'Animation',
        35: 'Comedy',
        80: 'Crime',
        99: 'Documentary',
        18: 'Drama',
        10751: 'Family',
        14: 'Fantasy',
        36: 'History',
        27: 'Horror',
        10402: 'Music',
        9648: 'Mystery',
        10749: 'Romance',
        878: 'Science Fiction',
        10770: 'TV Movie',
        53: 'Thriller',
        10752: 'War',
        37: 'Western'
    };
    const genres = movie.genre_ids.map(genreId => genreMap[genreId]).join(', ');
    const ratingEmojis = displayRatingEmojis(movie.vote_average);
    // Fetch trailer URL
    const trailerUrl = await fetchMovieTrailerUrl(movie.id);
    const trailerHtml = trailerUrl ? `<a href="${trailerUrl}" target="_blank">Watch Trailer</a>` : '';
    displayedMovieTitles.add(movie.title);
    // Create HTML content for the movie card
    const movieCardHtml = `
<div class="movie-card">
<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
<div class="movie-card-content">
    <h2>${movie.title}</h2>
    <p><strong>Release:</strong> ${movie.release_date}</p>
    <p><strong>Genre:</strong> ${genres}</p>
    <p><strong>Language:</strong> ${movie.original_language}</p>
    <p>${ratingEmojis}</p>
    <p>${trailerHtml}</p>
    <button class="add-to-watchlist-button" data-movie-title="${movie.title}">Add to Watchlist</button>
</div>
</div>
`;
    return movieCardHtml;
}

// Function to display top movies of the year on the page
async function displayTopMoviesOfTheYear() {
    const yearMoviesContainer = document.getElementById('yearMoviesContainer');
    const movies = await fetchAllTopMoviesOfTheYear();
    if (movies) {
        yearMoviesContainer.innerHTML = '';
        for (const movie of movies) {
            const movieCardHtml = await createMovieCard(movie);
            if (movieCardHtml) {
                yearMoviesContainer.insertAdjacentHTML('beforeend', movieCardHtml);
            }
        }
    } else {
        yearMoviesContainer.innerHTML = '<p>No movies found</p>';
    }
}

window.onload = function () {
    displayTopMoviesOfTheYear(); 
};

function addToWatchlist(movieTitle) {
    try {
        fetch(`https://www.omdbapi.com/?apikey=c1aecf62&t=${encodeURIComponent(movieTitle)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(movieDetails => {
                console.log('Response from OMDB API:', movieDetails); // Log the response
                if (movieDetails.Response === 'True') {
                    const movieData = {
                        title: movieDetails.Title,
                        poster: movieDetails.Poster,
                        year: movieDetails.Year,
                        imdbID: movieDetails.imdbID
                    };
                    // Check if the movie already exists in the watchlist
                    if (!isMovieInWatchlist(movieData.imdbID)) {
                        addToWatchlistToLocalStorage(movieData);
                        displayPopup('Added to watchlist!');
                    } else {
                        displayPopup('Movie already exists in watchlist');
                    }
                } else {
                    console.error('Error fetching movie details:', movieDetails.Error);
                    displayPopup('Movie Unavailable');
                }
            })
            .catch(error => {
                console.error('Error fetching movie details:', error);
                displayPopup('An error occurred. Please try again later.');
            });
    } catch (error) {
        console.error('Error adding movie to watchlist:', error);
        displayPopup('An error occurred. Please try again later.');
    }
}

function isMovieInWatchlist(imdbID) {
    let watchlist = localStorage.getItem('watchlist');
    if (!watchlist) {
        return false; // Return false if watchlist is empty
    }
    try {
        watchlist = JSON.parse(watchlist);
        return watchlist.some(movie => movie.imdbID === imdbID);
    } catch (error) {
        console.error('Error parsing watchlist data:', error);
        return false;
    }
}

function displayPopup(message) {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.textContent = message;
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.remove();
    }, 1000);
}

function addToWatchlistToLocalStorage(movieData) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    watchlist.push(movieData);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    displayPopup('Added to watchlist!');
}

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('add-to-watchlist-button')) {
        const movieTitle = event.target.dataset.movieTitle;
        addToWatchlist(movieTitle);
    }
});

