async function fetchMoviesByTitle(title) {
    const response = await fetch(`https://www.omdbapi.com/?apikey=c1aecf62&s=${title}`);
    const data = await response.json();
    return data.Search || [];
}

function createMovieCard(movie) {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');

    const poster = document.createElement('img');
    poster.src = movie.Poster;
    poster.alt = movie.Title;
    poster.classList.add('movie-card-poster');
    movieCard.appendChild(poster);

    const title = document.createElement('h2');
    title.textContent = movie.Title;
    title.classList.add('movie-card-title');
    movieCard.appendChild(title);

    const details = document.createElement('div');
    details.classList.add('movie-card-details');
    if (movie) {
        details.innerHTML = `<p><strong>Year:</strong> <span class="movie-card-year">${movie.Year}</span></p>`;
    }
    movieCard.appendChild(details);

    const detailsButton = document.createElement('button');
    detailsButton.textContent = 'More Details';
    detailsButton.classList.add('movie-card-button');
    detailsButton.addEventListener('click', () => {
        showMovieDetails(movie.imdbID);
    });
    movieCard.appendChild(detailsButton);

    const addToWatchlistButton = document.createElement('button');
    addToWatchlistButton.textContent = 'Add to Watchlist';
    addToWatchlistButton.classList.add('add-to-watchlist-button');
    addToWatchlistButton.addEventListener('click', () => {
        addToWatchlistToLocalStorage(movie); // Pass the movie object to the function
    });
    movieCard.appendChild(addToWatchlistButton);

    return movieCard;
}

async function buttonClicked() {
    const movieContainer = document.querySelector('.movie-container');
    const noMovieFound = document.getElementById('noMovieFound');
    const searchData = document.getElementById('searchData').value.trim();

    if (searchData !== '') {
        try {
            const movies = await fetchMoviesByTitle(searchData);
            if (movies.length > 0) {
                movieContainer.innerHTML = ''; // Clear previous search results
                noMovieFound.style.display = 'none'; // Hide "No movie found" message
                // Show movie container when there are search results
                movieContainer.classList.remove('hide');
                movies.forEach(movie => {
                    const movieCard = createMovieCard(movie);
                    movieContainer.appendChild(movieCard);
                });
            } else {
                // Hide movie container when there are no search results
                movieContainer.classList.add('hide');
                noMovieFound.style.display = 'block'; // Show "No movie found" message
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            displayPopup('Error fetching data. Please try again later.');
        }
    } else {
        // Hide movie container when there are no search results
        movieContainer.classList.add('hide');
        noMovieFound.style.display = 'none'; // Hide "No movie found" message
    }
    // Ensure search value remains in the input field
    document.getElementById('searchData').value = searchData;
}

const searchButton = document.getElementById('searchButton');
if (searchButton) {
    searchButton.addEventListener('click', buttonClicked);
} else {
    console.error('Search button not found.');
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
    console.log('Adding to local storage:', movieData);
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

    // Check if the movie already exists in the watchlist
    const isMovieAlreadyAdded = watchlist.some(movie => movie.imdbID === movieData.imdbID);

    if (isMovieAlreadyAdded) {
        displayPopup('Movie already exists in watchlist');
    } else {
        // Add the movie to the watchlist
        watchlist.push(movieData);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        displayPopup('Added to watchlist!');
    }
}

window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');
    if (query) {
        fetchMoviesByTitle(query)
            .then(movies => {
                const movieContainer = document.querySelector('.movie-container');
                const noMovieFound = document.getElementById('noMovieFound');

                if (movies.length > 0) {
                    movieContainer.innerHTML = ''; // Clear previous search results
                    noMovieFound.style.display = 'none'; // Hide "No movie found" message

                    // Show movie container when there are search results
                    movieContainer.classList.remove('hide');

                    movies.forEach(movie => {
                        const movieCard = createMovieCard(movie);
                        movieContainer.appendChild(movieCard);
                    });
                } else {
                    // Hide movie container when there are no search results
                    movieContainer.classList.add('hide');
                    noMovieFound.style.display = 'block'; // Show "No movie found" message
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    } else {
        console.error('Search query not found.');
    }
    buttonClicked();
};

function showMovieDetails(imdbID) {
    sessionStorage.setItem('selectedMovieID', imdbID);
    window.location.href = 'moviedetails.html';
}
