const sliders = document.querySelector(".carrosselBox");
const mainMediaImg = document.getElementById("main-media-img");
const mediaTitle = document.getElementById("media-title"); 
const mediaType = document.getElementById("media-type");
const mediaYear = document.getElementById("media-year"); 
const mediaLength = document.getElementById("media-length"); 
const mediaGenres = document.getElementById("media-genres");
const switchLeft = document.querySelector(".switchLeft");
const switchRight = document.querySelector(".switchRight");
const apiKey = "da052838b7de390562880b8219bc85f4";
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const navList = document.querySelector('.nav-list');

const mediaModal = document.getElementById("media-modal");
const modalCloseButton = document.querySelector(".modal-close");
const modalPoster = document.getElementById("modal-poster");
const modalTitle = document.getElementById("modal-title");
const modalType = document.getElementById("modal-type");
const modalYear = document.getElementById("modal-year");
const modalLength = document.getElementById("modal-length");
const modalGenres = document.getElementById("modal-genres");

const menuMobile = document.querySelector(".menu-mobile");
const navContainer = document.querySelector(".nav-container");

function animateLinks() {
    navContainer.classList.toggle("active");
}

menuMobile.addEventListener("click", animateLinks);

function scrollLeft() {
  sliders.scrollBy({ left: -200, behavior: 'smooth' });
}
function scrollRight() {
  sliders.scrollBy({ left: 200, behavior: 'smooth' });
}

function showModal(details) {
    modalPoster.src = details.poster_path ? `https://image.tmdb.org/t/p/w200/${details.poster_path}` : 'https://via.placeholder.com/200x300?text=Sem+Imagem';
    modalTitle.textContent = details.title || details.name;
    modalType.textContent = details.media_type === "movie" ? "Filme" : "Série";
    modalYear.textContent = details.release_date ? details.release_date.substring(0, 4) : (details.first_air_date ? details.first_air_date.substring(0, 4) : 'N/A');
    
    if (details.media_type === 'movie') {
        modalLength.textContent = details.runtime ? `${details.runtime} min` : 'N/A';
    } else {
        const episodeLength = details.episode_run_time && details.episode_run_time.length > 0 ? details.episode_run_time[0] : 'N/A';
        modalLength.textContent = episodeLength !== 'N/A' ? `${episodeLength} min` : 'N/A';
    }
    
    const genres = details.genres.map(genre => genre.name).join(", ");
    modalGenres.textContent = genres || 'N/A';
    
    mediaModal.style.display = 'flex';
}

function closeModal() {
    mediaModal.style.display = 'none';
}

modalCloseButton.addEventListener('click', closeModal);
mediaModal.addEventListener('click', (e) => {
    if (e.target === mediaModal) {
        closeModal();
    }
});


async function fetchMediaDetails(mediaId, mediaType) {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${apiKey}`
    );

    return response.data;

  } catch (erro) {
    console.error("erro ao buscar dados do filme/serie", erro);
    return null;
  }
}

async function fetchMedias(mediaType = 'all') { 
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/trending/${mediaType}/week?api_key=${apiKey}`
    );

    return response.data.results;

  } catch (erro) {
    console.error(`erro ao buscar ${mediaType}`, erro);
    return [];
  }
}

async function updateMediaSection(mediaType) {
  const medias = await fetchMedias(mediaType);
  
  if(medias.length === 0) return;
  

  sliders.innerHTML = ''; 

  const mainMedia = medias[0];
  const mediasCarousel = medias.slice(1);
  
  const MainMediaDetails = await fetchMediaDetails(mainMedia.id, mainMedia.media_type);

  try {
      if(MainMediaDetails) {
          mainMediaImg.src = `https://image.tmdb.org/t/p/original/${MainMediaDetails.backdrop_path}`; 
          mediaTitle.textContent = MainMediaDetails.title || MainMediaDetails.name; 
      
          const type = MainMediaDetails.media_type === "movie" ? "Filme" : "Série";
          mediaType.textContent = `Tipo: ${type}`;
          
          if(MainMediaDetails.media_type === "movie"){
              mediaYear.textContent = `Ano de Lançamento: ${MainMediaDetails.release_date.substring(0, 4)}`; 
              mediaLength.textContent = `Duração: ${MainMediaDetails.runtime} min`;
          } else {
              mediaYear.textContent = `Ano de Lançamento: ${MainMediaDetails.first_air_date ? MainMediaDetails.first_air_date.substring(0, 4): "N/A"}`; 
          
              const episodeLength = MainMediaDetails.episode_run_time ? MainMediaDetails.episode_run_time[0] : 'N/A';
              mediaLength.textContent = `Duração do Episódio: ${episodeLength} min`;
          }

          const genres = MainMediaDetails.genres.map(genre => genre.name).join(", ");
          mediaGenres.textContent = `Gêneros: ${genres}`;
      }

      mediasCarousel.forEach((media, index) => {
          sliders.insertAdjacentHTML(
              "beforeend",
              `<img class="img-${index} slider-img" src="https://image.tmdb.org/t/p/w300/${media.poster_path}" data-id="${media.id}" data-media-type="${media.media_type}"/>`
          );
      });
  } catch (erro) {
      console.error("erro ao buscar filme/serie", erro);
  }
}

updateMediaSection('all');


navList.addEventListener('click', (event) => {
  event.preventDefault(); 
  const clickedElement = event.target.closest('a');
  if (clickedElement) {
      const mediaType = clickedElement.dataset.mediaType;
      if (mediaType) {
          updateMediaSection(mediaType);
      }
  }
});

async function fetchMediaSearch() {
    const mediaSearchTerm = searchInput.value.trim();

    if (!mediaSearchTerm) {

        return;
    }

    try {
        const [movieResponse, serieResponse] = await Promise.all([
            axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${mediaSearchTerm}`),
            axios.get(`https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${mediaSearchTerm}`)
        ]);

        const movieResults = movieResponse.data.results.map(item => ({ ...item, media_type: 'movie' }));
        const serieResults = serieResponse.data.results.map(item => ({ ...item, media_type: 'tv' }));
        
        const allResults = [...movieResults, ...serieResults].sort((a, b) => b.popularity - a.popularity);

        if (allResults.length === 0) {
            alert('Nenhum resultado encontrado.');
            return;
        }
        
        const principalResult = allResults[0];
        const principalResultDetails = await fetchMediaDetails(principalResult.id, principalResult.media_type);

        if (principalResultDetails) {
            principalResultDetails.media_type = principalResult.media_type; 
            showModal(principalResultDetails);
        }

    } catch (erro) {
        console.error("Erro na busca:", erro);
        alert('Ocorreu um erro na busca.');
    }
}

searchButton.addEventListener('click', fetchMediaSearch);
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        fetchMediaSearch();
    }
});

sliders.addEventListener('click', async (event) => {
  const clickedElement = event.target;

  
  if (clickedElement.tagName === 'IMG' && clickedElement.classList.contains('slider-img')) {
      const mediaId = clickedElement.dataset.id;
      const mediaType = clickedElement.dataset.mediaType;

      if (mediaId && mediaType) {
          try {
              
              const mediaDetails = await fetchMediaDetails(mediaId, mediaType);
              
              if (mediaDetails) {
                  mediaDetails.media_type = mediaType; 
                  showModal(mediaDetails);
              }
          } catch (error) {
              console.error("Erro ao buscar detalhes do item do carrossel:", error);
          }
      }
  }
});


switchLeft.addEventListener("click", scrollLeft);
switchRight.addEventListener("click", scrollRight);