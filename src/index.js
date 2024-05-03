import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '43634541-955b403d737b03dd59b369ca9';
const BASE_URL = 'https://pixabay.com/api/';

const fetchImages = (query, page = 1, perPage = 40) => {
  const params = {
    key: API_KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page,
    per_page: perPage,
  };

  return axios
    .get(BASE_URL, { params })
    .then(response => {
      if (response.data.totalHits === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      return response.data.hits; // Zwraca listę obrazków
    })
    .catch(error => {
      Notify.failure('Failed to fetch images: ' + error.message);
    });
};

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

let currentPage = 1;
let currentQuery = '';

// Obsługa formularza wyszukiwania
form.addEventListener('submit', event => {
  event.preventDefault();

  const searchQuery = event.target.searchQuery.value.trim();
  if (searchQuery === '') return; // Jeśli puste, nic nie rób

  currentQuery = searchQuery;
  currentPage = 1; // Reset paginacji

  fetchImages(searchQuery, currentPage).then(images => {
    if (images && images.length > 0) {
      gallery.innerHTML = ''; // Czysci galerię
      images.forEach(image => {
        gallery.innerHTML += createImageCard(image); // Dodaj nowe obrazy
      });
      loadMoreButton.style.display = 'block'; // Pokaż przycisk "Load more"
    } else {
      console.warn('No images found.');
    }
  });
});

// Funkcja tworząca szablon karty zdjęcia
const createImageCard = image => {
  return `
    <div class="photo-card">
    <a href="${image.largeImageURL}"> 
      <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item"><b>Likes</b></br> ${image.likes}</p>
        <p class="info-item"><b>Views</b></br> ${image.views}</p>
        <p class="info-item"><b>Comments</b></br> ${image.comments}</p>
        <p class="info-item"><b>Downloads</b></br> ${image.downloads}</p>
      </div>
    </div>
  `;
};

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

// Odświeżenie SimpleLightbox po dodaniu nowej grupy kart obrazów
lightbox.refresh();

// Obsługa przycisku "Load more"
loadMoreButton.addEventListener('click', () => {
  currentPage += 1; // Zwiększ paginację

  fetchImages(currentQuery, currentPage).then(images => {
    images.forEach(image => {
      gallery.innerHTML += createImageCard(image); // Dodaj kolejne obrazy
    });

    if (images.length < 40) {
      // Jeśli mniej niż 40 obrazów, ukryj przycisk
      loadMoreButton.style.display = 'none';
      Notify.info("We're sorry, but you've reached the end of search results.");
    }
  });
});

const firstElement = document.querySelector('.gallery').firstElementChild;

if (firstElement) {
  const { height: cardHeight } = firstElement.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
} else {
  console.warn('Element nie został znaleziony');
}
