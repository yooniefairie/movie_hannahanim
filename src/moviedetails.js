// Function to fetch movie details based on IMDb ID from OMDB API
async function fetchMovieDetails(imdbID) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=c1aecf62&i=${imdbID}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
}

function addToWatchlist(movieDetails) {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    // Check if the movie already exists in the watchlist
    const isMovieAlreadyAdded = watchlist.some(movie => movie.imdbID === movieDetails.imdbID);
    if (isMovieAlreadyAdded) {
        displayPopup('Movie already exists in watchlist');
    } else {
        watchlist.push(movieDetails);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        displayPopup('Added to watchlist!');
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

window.onload = async function () {
    const imdbID = sessionStorage.getItem('selectedMovieID');
    if (imdbID) {
        const movieDetails = await fetchMovieDetails(imdbID);
        if (movieDetails && movieDetails.Response === "True") {
            document.getElementById('Title').innerHTML = movieDetails.Title;
            document.getElementById('Year').innerHTML = '<strong>Year:</strong> ' + movieDetails.Year;
            document.getElementById('Genre').innerHTML = '<strong>Genre:</strong> ' + movieDetails.Genre;
            document.getElementById('Director').innerHTML = '<strong>Director:</strong> ' + movieDetails.Director;
            document.getElementById('Actors').innerHTML = '<strong>Actors:</strong> ' + movieDetails.Actors;
            document.getElementById('Plot').innerHTML = '<strong>Plot:</strong> ' + movieDetails.Plot;
            document.getElementById('Language').innerHTML = '<strong>Language:</strong> ' + movieDetails.Language;
            document.getElementById('Poster').src = movieDetails.Poster;
            document.getElementById('Rating').innerHTML = '<strong>IMDB Rating:</strong> ' + movieDetails.imdbRating;
            const ratingEmojis = displayRatingEmojis(movieDetails.imdbRating);
            document.getElementById('emoji').innerHTML = '<strong>Rating:</strong> ' + ratingEmojis;
            document.getElementById('Awards').innerHTML = '<strong>Awards:</strong> ' + movieDetails.Awards;
            document.getElementById('Writer').innerHTML = '<strong>Writer:</strong> ' + movieDetails.Writer;
            document.getElementById('teaserButton').addEventListener('click', async function () {
                if (!movieDetails || !movieDetails.imdbID) {
                    console.error('Movie details or movie ID is missing.');
                    return;
                }
                console.log('Fetching trailer for movie with ID:', movieDetails.imdbID);
                const trailerUrl = await fetchMovieTrailerUrl(movieDetails.imdbID);
                if (trailerUrl) {
                    console.log('Trailer URL:', trailerUrl);
                    window.open(trailerUrl, '_blank');
                } else {
                    console.error('No trailer found for this movie.');
                }
            });
            document.getElementById('addToWatchlistButton').addEventListener('click', function () {
                addToWatchlist(movieDetails);
            });
        } else {
            console.error('Error fetching movie details:', movieDetails.Error);
            displayPopup('Error fetching movie details. Please try again later.');
        }
    } else {
        console.error('No movie ID found in session storage');
        displayPopup('No movie ID found. Please try again.');
    }
};


function displayRatingEmojis(rating) {
    const numberOfEmojis = Math.round(parseFloat(rating) / 2); // Assuming the rating is out of 10
    const fullEmoji = '🎞️'; // Emoji for full rating
    const emptyEmoji = '⚪'; // Emoji for empty rating
    return fullEmoji.repeat(numberOfEmojis) + emptyEmoji.repeat(5 - numberOfEmojis);
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
            displayPopup('Trailer unavailable for this movie');
            return null;
        }
    } catch (error) {
        console.error('Error fetching movie trailer:', error);
        return null;
    }
}