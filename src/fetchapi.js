// Function to fetch movies by title from OMDB API
async function fetchMoviesByTitle(title) {
    const response = await fetch(`https://www.omdbapi.com/?apikey=c1aecf62&s=${title}`);
    const data = await response.json();
    return data.Search || [];
}

async function fetchTopPicks() {
    const topPicks = [
        { imdbID: 'tt22505214', Title: 'Brave Citizen' },
        { imdbID: 'tt7405458', Title: 'A Man Called Otto' },
        { imdbID: 'tt25872924', Title: 'Waktu Maghrib' },
        { imdbID: 'tt21027780', Title: 'Fallen Leaves' },
        { imdbID: 'tt6587046', Title: 'The Boy and the Heron' }
    ];

    const topPickDetails = await Promise.all(topPicks.map(movie => fetchMovieDetails(movie.imdbID)));

    return topPickDetails;
}

// Function to fetch details of the Awards Gala winning movies
async function fetchAwardsGalaWinners() {
    const awardWinners = [
        { imdbID: 'tt15398776', Title: 'Oppenheimer'},
        { imdbID: 'tt14849194', Title: 'The Holdovers'},
        { imdbID: 'tt1517268', Title: 'Barbie'},
        { imdbID: 'tt14230458', Title: 'Poor Things'},
        { imdbID: 'tt5537002', Title: 'Killers of the Flower Moon'},
        { imdbID: 'tt9362722', Title: 'Spider-Man: Across the Spider-Verse'},
        { imdbID: 'tt13238346', Title: 'Past Lives'},
        { imdbID: 'tt17009710', Title: 'Anatomy of a Fall'},
        { imdbID: 'tt7160372', Title: 'The Zone of Interest'},
        { imdbID: 'tt19853258', Title: 'Still: A Michael J. Fox Movie'},
        { imdbID: 'tt23561236', Title: 'American Fiction'},
        { imdbID: 'tt13651794', Title: 'May December'},
        { imdbID: 'tt23289160', Title: 'Godzilla Minus One'},
        { imdbID: 'tt10366206', Title: 'John Wick: Chapter 4'},
        { imdbID: 'tt6587046', Title: 'The Boy and the Heron'}
    ];

    const awardWinnersDetails = await Promise.all(awardWinners.map(movie => fetchMovieDetails(movie.imdbID)));

    return awardWinnersDetails;
}

function displayRatingEmojis(rating) {
    const numberOfEmojis = Math.round(parseFloat(rating) / 2); // Assuming the rating is out of 10
    const fullEmoji = '🎞️'; // You can use any other emoji here
    const emptyEmoji = '⚪'; // You can use any other emoji here
    return fullEmoji.repeat(numberOfEmojis) + emptyEmoji.repeat(5 - numberOfEmojis);
}

// Function to create a movie card with details, including awards and rating
function createMovieCard(movie, isTopPick) {
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
    if (isTopPick) {
        details.innerHTML = `<p><strong>Year:</strong> <span class="movie-card-year">${movie.Year}</span></p>
                             <p><strong>Rated:</strong> ${movie.Rated}</p>
                             <p><strong>Genre:</strong> ${movie.Genre}</p>
                             <p><strong>Language:</strong> ${movie.Language}</p>
                             <p><strong>Rating:</strong> ${displayRatingEmojis(movie.imdbRating)}</p> 
                             `;
    } else {
        // Add awards and rating for Awards Gala winning movies
        details.innerHTML = `<p><strong>Awards:</strong> ${movie.Awards}</p>
                             <p><strong>Rating:</strong> ${displayRatingEmojis(movie.imdbRating)}</p>`;
    }
    movieCard.appendChild(details);

    // More Details button
    const moreDetailsButton = document.createElement('button');
    moreDetailsButton.textContent = 'More Details';
    moreDetailsButton.classList.add('more-details-button');
    moreDetailsButton.addEventListener('click', () => {
        redirectToMovieDetails(movie.imdbID);
    });
    movieCard.appendChild(moreDetailsButton);

    // Add to Watchlist button
    const addToWatchlistButton = document.createElement('button');
    addToWatchlistButton.textContent = 'Add to Watchlist';
    addToWatchlistButton.classList.add('add-to-watchlist-button');
    addToWatchlistButton.addEventListener('click', () => {
        addToWatchlistToLocalStorage(movie);
    });
    movieCard.appendChild(addToWatchlistButton);

    return movieCard;
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
    watchlist.push(movieData);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    displayPopup('Added to watchlist!');
}

// Function to populate top picks container with movie cards
async function populateTopPicks() {
    const topPicksContainer = document.querySelector('.top-picks-container');

    try {
        const topPicks = await fetchTopPicks();

        topPicks.forEach(movie => {
            const movieCard = createMovieCard(movie, true); // Pass true for isTopPick
            topPicksContainer.appendChild(movieCard);
        });
    } catch (error) {
        console.error('Error fetching top picks:', error);
    }
}

// Function to populate the Awards Gala section with movie cards
async function populateAwardsGala() {
    const awardsContainer = document.getElementById('awards-container');

    try {
        const awardWinners = await fetchAwardsGalaWinners();

        // Organize the movies by rows with five movies in each row
        for (let i = 0; i < awardWinners.length; i += 5) {
            const row = document.createElement('div');
            row.classList.add('movie-row');

            // Create movie cards for each row
            for (let j = i; j < i + 5 && j < awardWinners.length; j++) {
                const movieCard = createMovieCard(awardWinners[j], false); // Pass false for isTopPick
                row.appendChild(movieCard);
            }

            awardsContainer.appendChild(row);
        }
    } catch (error) {
        console.error('Error fetching Awards Gala winners:', error);
    }
}

const searchButton = document.getElementById('searchButton');

if (searchButton) {
    searchButton.addEventListener('click', buttonClicked);
} else {
    console.error('Search button not found.');
}

// Function to handle search button click
function buttonClicked() {
    var searchData = document.getElementById('searchData').value.trim();

    if (searchData !== '') {
        // Redirect to searchpage.html with the search query as a parameter
        window.location.href = `searchpage.html?query=${searchData}`;
    } else {
        console.error('Search data is empty.');
    }
}

function redirectToMovieDetails(imdbID) {
    sessionStorage.setItem('selectedMovieID', imdbID);
    window.location.href = 'moviedetails.html';
}

// Call the populateTopPicks function to populate the top picks section when the page loads
window.onload = function () {
    populateTopPicks();
    populateAwardsGala(); // Add this line to populate the Awards Gala section
};
