// const menuMobile = document.querySelector(".menu-mobile");
// const navContainer = document.querySelector(".nav-container");
// const searchList = document.querySelector("input[type='text']")
const sliders = document.querySelector(".carrosselBox");

let scrollAmount = 0;
let scrollPerClick = 100;
const imagePadding = 20;


function scrollLeft() {
    scrollAmount -= scrollPerClick;
    sliders.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
    });
}
function scrollRight() {
    scrollAmount += scrollPerClick;
    sliders.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
    });
}

async function showMovies(erro) {
   const apiKey = "da052838b7de390562880b8219bc85f4";
 
   try {
     const response = await axios.get(
       `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc`
     );
 
     const movies = response.data.results;
 
     movies.forEach((movie, index) => {
       sliders.insertAdjacentHTML(
         "beforeend",
         `<img class="img-${index} slider-img" src="https://image.tmdb.org/t/p/w300/${movie.poster_path}"/>`
       );
     });
 
     const firstImage = document.querySelector("img-0");
     if (firstImage) {
       scrollPerClick = firstImage + imagePadding;
     }
   } catch (erro) {
     console.error("erro ao buscar filme", erro);
   }
 }
 
 showMovies();
// async function chamadaAPI() {
//    const resposta = await fetch(apiKey);
//    if(resposta.status === 200) {
//         const obj = await resposta.json();
//         console.log(obj);
//    }
// }

// chamadaAPI();

