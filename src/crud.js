async function addToWatchlist(movieData) {
    try {
        if (!movieData.hasOwnProperty('status')) {
            movieData.status = '-pick status-';
        }
        const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
        watchlist.push(movieData);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        console.log('Movie added to watchlist:', movieData);
    } catch (error) {
        console.error('Error adding movie to watchlist:', error);
    }
}

async function fetchMovieDetails(imdbID) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=c1aecf62&i=${imdbID}`);
        if (!response.ok) throw new Error('Error fetching movie details');
        const data = await response.json();
        console.log('Movie details:', data);
        return data;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        throw error;
    }
}

function removeFromWatchlist(imdbID) {
    try {
        let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
        watchlist = watchlist.filter(movieData => movieData.imdbID !== imdbID);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        console.log('Movie removed from watchlist with IMDb ID:', imdbID);
        
        const popupMessage = document.getElementById('popup-message');
        popupMessage.style.display = 'block'; // Show the popup message
        
        setTimeout(() => {
            popupMessage.style.display = 'none'; // Hide the popup after 2 seconds
        }, 1000);
    } catch (error) {
        console.error('Error removing movie from watchlist:', error);
    }
}


async function displayWatchlist() {
    const watchlistContainer = document.getElementById('watchlist');
    if (!watchlistContainer) {
        console.error('Watchlist container not found');
        return;
    }

    try {
        const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
        watchlistContainer.innerHTML = ''; // Clear previous watchlist items

        for (const movieData of watchlist) {
            try {
                const detailedMovie = await fetchMovieDetails(movieData.imdbID);

                const li = document.createElement('li');
                li.className = 'movie-item';
                li.innerHTML = `
                    <img src="${detailedMovie.Poster}" alt="${detailedMovie.Title}" class="movie-poster">
                    <div class="title-status-container">
                        <h2 class="movie-title">${detailedMovie.Title}</h2>
                        <p><strong>Year:</strong> ${detailedMovie.Year}</p>
                        <p><strong>Rating:</strong> ${displayRatingEmojis(detailedMovie.imdbRating)}</p>
                        <select class="status-input">
                            <option value="-pick status-">-pick status-</option>
                            <option value="to watch">to watch</option>
                            <option value="watched">watched</option>
                            <option value="dropped">dropped</option>
                        </select>
                        <button class="delete-button">Delete</button>
                    </div>
                `;
                const statusInput = li.querySelector('.status-input');
                statusInput.value = movieData.status || '-pick status-';
                statusInput.addEventListener('change', (event) => {
                    movieData.status = event.target.value;
                    localStorage.setItem('watchlist', JSON.stringify(watchlist));
                });
                li.querySelector('.delete-button').addEventListener('click', () => {
                    li.remove();
                    removeFromWatchlist(movieData.imdbID);
                });
                watchlistContainer.appendChild(li);
                addNotesContainer(li, movieData);
            } catch (error) {
                console.error('Error fetching movie details:', error);
            }
        }
    } catch (error) {
        console.error('Error displaying watchlist:', error);
    }
}

function readMoviesByStatus(status) {
    try {
        const watchlistString = localStorage.getItem('watchlist');
        const watchlist = watchlistString ? JSON.parse(watchlistString) : [];
        if (status.toLowerCase() === 'all') {
            return watchlist.filter(item => typeof item === 'object');
        }
        return watchlist.filter(movieData => movieData.status === status);
    } catch (error) {
        console.error('Error reading movies by status:', error);
        return [];
    }
}

function saveNotesToLocalStorage(imdbID, notes) {
    try {
        let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
        const index = watchlist.findIndex(movieData => movieData.imdbID === imdbID);
        if (index !== -1) {
            watchlist[index].notes = notes;
            localStorage.setItem('watchlist', JSON.stringify(watchlist));
            console.log('Notes saved for IMDb ID:', imdbID);
            const saveNotesPopup = document.getElementById('saveNotesPopup');
            saveNotesPopup.style.display = 'block'; 
            setTimeout(() => {
                saveNotesPopup.style.display = 'none'; // Hide the delete notes popup after 2 seconds
            }, 1000);
        }
    } catch (error) {
        console.error('Error saving notes to local storage:', error);
        displayPopup('Error saving notes!');
    }
}

function removeNotesFromLocalStorage(imdbID) {
    try {
        let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
        const index = watchlist.findIndex(movieData => movieData.imdbID === imdbID);
        if (index !== -1) {
            watchlist[index].notes = ''; // Clear notes
            localStorage.setItem('watchlist', JSON.stringify(watchlist));
            console.log('Notes deleted for IMDb ID:', imdbID);
            
            const deleteNotesPopup = document.getElementById('delete-notes-popup');
            deleteNotesPopup.style.display = 'block'; // Show the delete notes popup
            
            setTimeout(() => {
                deleteNotesPopup.style.display = 'none'; // Hide the delete notes popup after 2 seconds
            }, 1000);
        }
    } catch (error) {
        console.error('Error deleting notes from local storage:', error);
    }
}

async function displayFilteredWatchlist(filteredMovies) {
    try {
        const watchlistContainer = document.getElementById('watchlist');
        if (!watchlistContainer) {
            console.error('Watchlist container not found');
            return;
        }
        watchlistContainer.innerHTML = '';

        for (const movieData of filteredMovies) {
            try {
                const detailedMovie = await fetchMovieDetails(movieData.imdbID);
                if (detailedMovie && detailedMovie.Response === "True") {
                    const li = document.createElement('li');
                    li.className = 'movie-item';
                    li.innerHTML = `
                        <img src="${detailedMovie.Poster}" alt="${detailedMovie.Title}" class="movie-poster">
                        <div class="title-status-container">
                            <h2 class="movie-title">${detailedMovie.Title}</h2>
                            <p><strong>Year:</strong> ${detailedMovie.Year}</p>
                            <p><strong>Rating:</strong> ${displayRatingEmojis(detailedMovie.imdbRating)}</p>
                            <select class="status-input">
                                <option value="-pick status-">-pick status-</option>
                                <option value="to watch">to watch</option>
                                <option value="watched">watched</option>
                                <option value="dropped">dropped</option>
                            </select>
                            <button class="delete-button">Delete</button>
                        </div>
                    `;
                    const statusInput = li.querySelector('.status-input');
                    statusInput.value = movieData.status || '-pick status-'; // Set status input value
                    statusInput.addEventListener('change', (event) => {
                        movieData.status = event.target.value;
                        localStorage.setItem('watchlist', JSON.stringify(filteredMovies));
                    });
                    li.querySelector('.delete-button').addEventListener('click', () => {
                        li.remove();
                        removeFromWatchlist(movieData.imdbID);
                    });
                    watchlistContainer.appendChild(li);
                    addNotesContainer(li, movieData);
                } else {
                    console.error('Error fetching movie details:', detailedMovie.Error);
                }
            } catch (error) {
                console.error('Error fetching movie details:', error);
            }
        }
    } catch (error) {
        console.error('Error displaying filtered watchlist:', error);
    }
}

// Function to display rating using emojis
function displayRatingEmojis(rating) {
    const numberOfEmojis = Math.round(parseFloat(rating) / 2); // Assuming the rating is out of 10
    const fullEmoji = '🎞️'; // Emoji for full rating
    const emptyEmoji = '⚪'; // Emoji for empty rating
    return fullEmoji.repeat(numberOfEmojis) + emptyEmoji.repeat(5 - numberOfEmojis);
}

function addNotesContainer(li, movieData) {
    const createElem = (type, className, textContent, eventListener, placeholder) => {
        const elem = document.createElement(type);
        elem.className = className;
        elem.textContent = textContent;
        if (placeholder) {
            elem.placeholder = placeholder;
        }
        if (eventListener) {
            elem.addEventListener('click', eventListener);
        }
        return elem;
    };
    const notesContainer = document.createElement('div');
    notesContainer.className = 'notes-container';
    const statusContainer = li.querySelector('.status-input').parentNode;
    statusContainer.parentNode.insertBefore(notesContainer, statusContainer.nextSibling);
    const notesInput = createElem('textarea', 'notes-input', '', null, 'Add your notes...');
    notesInput.value = movieData.notes || '';
    notesInput.disabled = notesInput.value !== '';
    notesContainer.appendChild(notesInput);
    const buttonsContainer = createElem('div', 'buttons-container', null, null);
    const saveButton = createElem('button', 'save-button', 'Save', () => {
        notesInput.disabled = true;
        saveNotesToLocalStorage(movieData.imdbID, notesInput.value);
    });
    buttonsContainer.appendChild(saveButton);
    const updateNotesButton = createElem('button', 'update-button', 'Update', () => {
        notesInput.disabled = false;
        notesInput.focus();
        updateButton(movieData); // Call the updateButton function
    });
    buttonsContainer.appendChild(updateNotesButton);

    const deleteNotesButton = createElem('button', 'delete-notes-button', 'Delete Notes', () => {
        notesInput.value = '';
        notesInput.disabled = false;
        removeNotesFromLocalStorage(movieData.imdbID);
        displayPopup('Notes deleted successfully!');
    });
    buttonsContainer.appendChild(deleteNotesButton);    

    notesContainer.appendChild(buttonsContainer);
}

function updateButton(movieData) {
    try {
        const notesInput = document.querySelector('.notes-input');
        notesInput.disabled = false;
        notesInput.focus();
        const popupMessage = document.getElementById('updateNotesButton');
        popupMessage.textContent = 'Update your notes!';
        popupMessage.style.display = 'block';
        setTimeout(() => {
            popupMessage.style.display = 'none';
        }, 1000);
    } catch (error) {
        console.error('Error updating notes:', error);
        const updatePopupMessage = document.getElementById('updateNotesButton');
        updatePopupMessage.textContent = 'Error updating notes!';
        updatePopupMessage.style.display = 'block';
        setTimeout(() => {
            updatePopupMessage.style.display = 'none';
        }, 1000);
    }
}

window.onload = async function () {
    await displayWatchlist();
    const statusSelect = document.getElementById('status-select');
    if (statusSelect) {
        statusSelect.addEventListener('change', async () => {
            const selectedStatus = statusSelect.value;
            console.log('Selected status:', selectedStatus);
            const filteredMovies = readMoviesByStatus(selectedStatus);
            console.log('Filtered movies:', filteredMovies);
            await displayFilteredWatchlist(filteredMovies);
        });
    }
};
