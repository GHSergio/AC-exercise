const BASE_URL = `https://webdev.alphacamp.io`;
//顯示所有電影  特定詳細 則+ /id
const INDEX_URL = BASE_URL + `/api/movies/`;
//顯示海報 +image
const POSTER_URL = BASE_URL + `/posters/`;
//每頁顯示movie數
const MOVIES_PER_PAGE = 12;

const movies = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
let cardMode = true;
let filteredMovies = [];
let currentPage;

const dataPanel = document.querySelector("#data-panel");
// const searchForm = document.querySelector("#search-form");
// const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const container = document.querySelector(".container");

//click icon --> change card/list mode
container.addEventListener("click", (e) => {
  //優先currentPage, 沒有就顯示第一頁
  currentPage = currentPage && currentPage ? currentPage : 1;
  if (e.target.matches(".fa-bars")) {
    cardMode = false;
  } //切換card mode
  if (e.target.matches(".fa-th")) {
    cardMode = true;
  }
  renderMovieList(getMoviesByPage(currentPage));
});
//click paginator --> 切換渲染內容
paginator.addEventListener("click", (e) => {
  if (e.target.tagName !== "A") return;
  let activeItem = paginator.querySelector(".active");
  if (activeItem) activeItem.classList.remove("active");
  e.target.parentElement.classList.add("active");
  currentPage = parseInt(e.target.dataset.page);
  renderPaginator(isFilteredMovies());
  // isCardModeTrue();
  renderMovieList(getMoviesByPage(currentPage));
});

//綁定事件到data-panel內的more button上
dataPanel.addEventListener("click", (e) => {
  if (e.target.matches(".btn-show-movie")) {
    //顯示綁定目標上的所有data項目
    //dataset轉出都是String
    showMovieModal(parseInt(e.target.dataset.id));
  } else if (e.target.matches(".btn-remove-favorite")) {
    // isCardModeTrue();
    removeFromFavorite(parseInt(e.target.dataset.id));

    //顯示分頁列
    // renderPaginator(isFilteredMovies());
    //確認mode, 顯示頁面 ,分頁列
    // renderMovieList(getMoviesByPage(currentPage));
  }
});

// //根據keyword 篩選data
// searchForm.addEventListener("submit", (e) => {
//   e.preventDefault();
//   let keyword = searchInput.value.trim().toLowerCase();
//   //查無資料alert
//   if (!filteredMovies.length) {
//     return alert(`Cannot find movies with keyword : "${keyword}"`);
//   }
//   //篩選包含keyword的movies
//   filteredMovies = filterMovies(movies, keyword);
//   searchHandler()
// });

// //根據input value --> 及時update render
// searchInput.addEventListener("keyup", () => {
//   let keyword = searchInput.value.trim().toLowerCase();
//   //篩選包含keyword的movies
//   filteredMovies = filterMovies(movies, keyword);
//   searchHandler();
//   //查無資料
//   if (!filteredMovies.length)
//     return (dataPanel.innerHTML = `找不到關於 "${keyword}" 的結果 `);
// });

//分頁數
renderPaginator(isFilteredMovies());
//初始顯示頁面
renderMovieList(getMoviesByPage(1));

//---------------function----------------
function renderMovieList(data) {
  let rawHTML = "";
  //獲取我的最愛的id
  if (cardMode) {
    data.map((item) => {
      let image = item.image;
      let title = item.title;
      rawHTML += `
  
                  <div class="col-3 mb-2 card">
                    <img
                      src="${POSTER_URL + image}"
                      class="card-img-top"
                      alt="Movie Poster"
                    />
                    <div class="card-body">
                      <h5 class="card-title">${title}</h5>
                    </div>
                    <div class="card-footer text-muted">
                      <!-- btn 的 data-bs-target 需與 modal 的id 一致 -->
                      <button
                        class="btn btn-primary btn-show-movie"
                        data-bs-toggle="modal"
                        data-bs-target="#movie-modal"
                        data-id="${item.id}"
                      >More </button>
                      <button class="btn btn-info btn-remove-favorite fa-solid fa-trash" data-id="${
                        item.id
                      }"></button>
  
                    </div>
                  </div>
               `;
    });
    dataPanel.innerHTML = rawHTML;
  } else {
    //listMode
    let rawHTML = "";
    data.map((item) => {
      let image = item.image;
      let title = item.title;
      rawHTML += ` <div class="add-list .d-flex row-auto">
            <li class="list-group-item col-auto d-flex justify-content-between">
            <img
                      src="${POSTER_URL + image}"
                      class="card-img-top thumbnail"
                      alt="Movie Poster"
                    />
              <h4 class="list-title">${title}</h4>
              <div class="list-button">
                <button
                  class="btn btn-primary btn-show-movie"
                  data-bs-toggle="modal"
                  data-bs-target="#movie-modal"
                  data-id="${item.id}"
                >
                  More
                </button>
                <button
                  class="btn btn-info btn-remove-favorite fa-solid fa-trash"
                  data-id="${item.id}"
                >
                  
                </button>
              </div>
            </li>
          </div>
      `;
    });
    dataPanel.innerHTML = rawHTML;
  }
}

//要更換的movie modal內容 -->title, image, date
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");
  //先清空內容,避免前data殘影
  modalTitle.innerText = "";
  modalImage.innerHTML = "";
  modalDate.innerText = "";
  modalDescription.innerText = "";
  axios.get(INDEX_URL + id).then((response) => {
    //response.data.results
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`;
  });
}

//page 切分 -->先試算 再找規律成公式
function getMoviesByPage(page) {
  let data = filteredMovies && filteredMovies.length ? filteredMovies : movies;
  //用slice 切分 --> 定起點
  let startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, MOVIES_PER_PAGE * page);
}

//render paginator 內容
function renderPaginator(amount) {
  let numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  //最少顯示一頁
  if (numberOfPages < 1) numberOfPages = 1;
  let rawHTML = "";
  //運行page次
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

//movies 內容 已改成 localStorage內的data
function removeFromFavorite(id) {
  //取得movieIndex
  const movieIndex = movies.findIndex((movie) => movie.id === id);
  //從movies刪除掉movieIndex
  movies.splice(movieIndex, 1);
  //刪除後的movies 存進去 localStorage
  localStorage.setItem("favoriteMovies", JSON.stringify(movies));
  //刪除後 及時更新畫面
  // console.log(movies.length);
  renderPaginator(isFilteredMovies());
  renderMovieList(getMoviesByPage(currentPage));
}

//回傳 符合keyword的movies
function filterMovies(movies, keyword) {
  return movies.filter((movie) =>
    movie.title.trim().toLowerCase().includes(keyword)
  );
}

//優先filter.length --> 用於分頁列
function isFilteredMovies() {
  return filteredMovies && filteredMovies.length
    ? filteredMovies.length
    : movies.length;
}
//減少search重複
function searchHandler() {
  //顯示分頁
  renderPaginator(filteredMovies.length);
  //依cardMode顯示
  renderMovieList(getMoviesByPage(1));
}
