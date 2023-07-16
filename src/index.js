import Notiflix from 'notiflix';
import axios from 'axios';
import debounce from 'lodash.debounce';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';


const form = document.querySelector('.search-form');
const input = document.querySelector('.search-input');
const inputButton = document.querySelector('.search-button');

const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more-button');


// Właściwości zdjęć i galerii
const API = '29707791-ff65a0300987a99cb660f7261';
const imageType = 'photo';
const orientation = 'horizontal';
const safeSearch = true;

const perPage = 40;
let page = 1;

const lightbox = new simpleLightbox('.gallery a');


loadMoreButton.setAttribute('hidden', 'hidden');


const fetchImages = async (input, pageNumber) => {
  const URL = `https://pixabay.com/api/?key=${API}&q=${input}&image_type=${imageType}&orientation=${orientation}&safesearch=${safeSearch}&page=${pageNumber}&per_page=${perPage}`;

  const response = await fetch(`${URL}`);
  const responseObject = await response.json();

  loadMoreButton.removeAttribute('hidden');
  return responseObject;
};


const renderImages = images => {
  const markup = images
    .map(image => `
      <div class="photo-card">
        <a href='${image.largeImageURL}'>
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item">
            <b>Likes</b> ${image.likes}
          </p>
          <p class="info-item">
            <b>Views</b> ${image.views}
          </p>
          <p class="info-item">
            <b>Comments</b> ${image.comments}
          </p>
          <p class="info-item">
            <b>Downloads</b> ${image.downloads}
          </p>
        </div>
      </div>`
    )
    .join('');

  if (page === 1) {
    gallery.innerHTML = markup;
  } else {
    gallery.insertAdjacentHTML('beforeend', markup);
  }
  return page++;
};


inputButton.addEventListener('click', async event => {
  event.preventDefault();

  page = 1;
  const inputValue = input.value.trim();

  localStorage.setItem('inputValue', `${inputValue}`); //Przechowanie w pamięci wartości inputValue

  try {
    const array = await fetchImages(inputValue, page);
    const arrayImages = [];

    array.hits.forEach(async image => {
      arrayImages.push(image);
    });

    const total = await array.totalHits;

    if (total > 0) {
      Notiflix.Notify.success(`Hooray! We found ${total} images.`);
    }

    if (total === 0) {
      throw new Error();
    }
    renderImages(arrayImages);
    lightbox.refresh();
  } catch (error) {
    gallery.innerHTML = '';
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
});

// Przycisk ładowania większej liczby obrazów - WYŁĄCZONY

loadMoreButton.addEventListener('click', async () => {
  const inputValue = input.value.trim();
  try {
    const array = await fetchImages(inputValue, page);
    const arrayImages = [];

    array.hits.forEach(async image => {
      arrayImages.push(image);
    });
    renderImages(arrayImages);
    lightbox.refresh();
  } catch (error) {
    console.log(error.message);
  }
});


// Dodatkowa funkcja na płynne przewijanie 

window.addEventListener('scroll',
  debounce (async () => {
    try {
      if (window.innerHeight === document.documentElement.scrollHeight) {
        return;
      }
      if (window.scrollY + 0.5 + window.innerHeight >= document.documentElement.scrollHeight) {

        page += 1;
        let trimInput = localStorage.getItem('inputValue');
        const varPhotos = await fetchImages(trimInput, page);
        const photosArr = varPhotos.hits;

        renderImages(photosArr);
        lightbox.refresh();

        const { height: cardHeight } = document
          .querySelector('.gallery')
          .firstElementChild.getBoundingClientRect();
        
        window.scrollBy({
          top: cardHeight * 2,
          behavior: 'smooth',
        });

      }
    } catch (error) {}
  }, 2000)
);