import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
// import onLoadMore from './loadmore.js';

const axios = require('axios').default;

const searchForm = document.querySelector('.search-form');
const btnLoadMore = document.querySelector('.load-more');
const galleryRef = document.querySelector('.gallery');

const apiKey = '36857280-3c2e802b96ad5f58d22cd9be6';

export let currentPage = 1;
export let currentQuery = '';
let lightbox = '';

btnLoadMore.addEventListener('click', () => {
    currentPage += 1;
    onLoadMore();
});

searchForm.addEventListener('submit', onSearch);

// const refs = {
//     fetchImages,
//     renderImages,
//     lightbox,
//     initializeLightbox,
//     hideLoadMoreButton,
//     showEndOfResultsMessage,
// };

// export default refs;

async function onLoadMore() {
    try {
        const { images } = await fetchImages(currentQuery, currentPage);
        if (images.length === 0) {
            hideLoadMoreButton();
            showEndOfResultsMessage();
            lightbox.refs.refresh();
            return;
        }

        renderImages(images);
        initializeLightbox();
    } catch (error) {
        console.error('error');
    }
}

async function onSearch(e) {
    e.preventDefault();
    clearGallery();
    hideLoadMoreButton();

    const searchQuery = e.currentTarget.elements.searchQuery.value
        .toLowerCase()
        .trim()
        .replace(/ /g, '+');
    currentQuery = searchQuery;

    if (searchQuery === '') {
        return;
    }

    try {
        const { images, totalHits } = await fetchImages(searchQuery, currentPage);

        if (images.length === 0) {
            showNoResultsMessage();
            return;
        }

        renderImages(images);
        showSearchResults(totalHits);
        initializeLightbox();

        if (totalHits > images.length) {
            showLoadMoreButton();
        }} 
    catch (error) {
        console.error(error);
        // showEndOfResultsMessage();
        hideLoadMoreButton();
    }
}

async function fetchImages(query, page) {
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`;

    return axios
        .get(url)
        .then(response => {
            const { hits, totalHits } = response.data;
            return { images: hits, totalHits };
        })
        .catch(error => {
            showEndOfResultsMessage();
            // throw new Error(`Failed to fetch images: ${error.message}`);
            hideLoadMoreButton();
        });
}

function renderImages(images) {
    const cardsMarkup = images
        .map(image => createImageCardMarkup(image))
        .join('');
    galleryRef.insertAdjacentHTML('beforeend', cardsMarkup);
}

function createImageCardMarkup(image) {
    return `
        <li class="photo-card">
        <a class="photo-card-link" href="${image.largeImageURL}">
            <img class="galery-card-img" src="${image.webformatURL}" alt="${image.tags}" loading="lazy" /> 
            <div class="info">
            <p class="info-item">
                <b>Likes:</b> ${image.likes}
            </p>
            <p class="info-item">
                <b>Views:</b> ${image.views}
            </p>
            <p class="info-item">
                <b>Comments:</b> ${image.comments}
            </p>
            <p class="info-item">
                <b>Downloads:</b> ${image.downloads}
            </p>
            </div>
        </a>
        </li>
    `;
}

function clearGallery() {
    galleryRef.innerHTML = '';
}

function showLoadMoreButton() {
    btnLoadMore.classList.remove('is-hidden');
}

function hideLoadMoreButton() {
    btnLoadMore.classList.add('is-hidden');
}

function showNoResultsMessage() {
    Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
    );
}

function showEndOfResultsMessage() {
    Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
    );
}

function showSearchResults(totalHits) {
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
}

function initializeLightbox() {
    lightbox = new SimpleLightbox('.photo-card .photo-card-link', {
        captions: true,
        captionsData: 'alt',
        captionPosition: 'bottom',
        captionDelay: 250,
    });
}

// export { initializeLightbox };