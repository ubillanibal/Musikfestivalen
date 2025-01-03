const BASE_URL = "https://cdn.contentful.com/spaces/";
const SPACE_ID = localStorage.getItem("space_id");
const ACCES_TOKEN = localStorage.getItem("acces_token");
const API_URL = `${BASE_URL}${SPACE_ID}/entries?access_token=${ACCES_TOKEN}`;

//Fetchs all data from API
async function fetchData() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

async function main() {
  const festivalData = await fetchData();
  if (festivalData) {
    console.log("Festival Data:", festivalData); //TODO: Remove when done debugging

    //Helper function to keep the code DRY
    const getFieldById = (id, fieldName) => {
      const item = festivalData.items.find((item) => item.sys.id === id);
      return item?.fields[fieldName];
    };

    const artists = festivalData.items
      .filter((item) => item.sys.contentType.sys.id === "artist")
      .map((item) => {
        const { name, description, genre, day, stage } = item.fields;

        return {
          name,
          desc: description,
          genre: getFieldById(genre.sys.id, "name"),
          day: getFieldById(day.sys.id, "description"),
          date: getFieldById(day.sys.id, "date"),
          stage: getFieldById(stage.sys.id, "name"),
        };
      });

    //Helper function to keep the code DRY
    function extractFields(contentType, fieldName) {
      return festivalData.items
        .filter((item) => item.sys.contentType.sys.id === contentType)
        .map((item) => item.fields[fieldName]);
    }

    const days = extractFields("day", "description");

    const weekOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    days.sort((a, b) => weekOrder.indexOf(a) - weekOrder.indexOf(b));
    const stages = extractFields("stage", "name");
    const genres = extractFields("genre", "name");

    const daysContainer = document.getElementById("days-container");
    const stagesContainer = document.getElementById("stages-container");
    const genresContainer = document.getElementById("genres-container");

    //Helper function to keep the code DRY
    function generateFilterButtons(array, container) {
      array.forEach((item) => {
        const button = document.createElement("button");
        button.id = `${item.toLocaleLowerCase()}-button`;
        button.textContent = item;
        container.appendChild(button);
      });
    }

    generateFilterButtons(days, daysContainer);
    generateFilterButtons(genres, genresContainer);
    generateFilterButtons(stages, stagesContainer);

    const artistsContainer = document.getElementById("artists-container");
    const artistHTML = artists
      .map(
        (artist) => `
      <div class="artist-card">
        <h2>${artist.name}</h2>
        <p>${artist.day}</p>
        <p>${artist.date}</p>
        <p>${artist.stage}</p>
        <p>${artist.desc}</p>
        <p>${artist.genre}</p>
      </div>`
      )
      .join(""); //Removes a pesky "," between artist-cards

    artistsContainer.innerHTML = artistHTML;
    console.log("Artists Container", artistsContainer); //TODO: Remove when done debugging

    //Initiate empty Filter
    let currentFilters = {
      days: [],
      stages: [],
      genres: [],
    };

    const applyFilters = () => {
      const artistCards = document
        .getElementById("artists-container")
        .querySelectorAll(".artist-card");

      artistCards.forEach((card) => {
        const artistDay = card.querySelector("p:nth-of-type(1)").textContent;
        const artistGenre = card.querySelector("p:nth-of-type(5)").textContent;
        const artistStage = card.querySelector("p:nth-of-type(3)").textContent;

        //Helper function to keep the code DRY
        function matchesFilter(filterKey, artistProperty) {
          const filterArray = currentFilters[filterKey];
          return (
            filterArray.length === 0 ||
            filterArray.some(
              (filterItem) =>
                artistProperty.toLocaleLowerCase() ===
                filterItem.toLocaleLowerCase()
            )
          );
        }

        const matchesDay = matchesFilter("days", artistDay);
        const matchesGenre = matchesFilter("genres", artistGenre);
        const matchesStage = matchesFilter("stages", artistStage);

        if (matchesDay && matchesGenre && matchesStage) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    };

    function setupFilter(array, filterKey) {
      array.forEach((item) => {
        const button = document.getElementById(
          `${item.toLocaleLowerCase()}-button`
        );
        button.addEventListener("click", () => {
          if (currentFilters[filterKey].includes(item)) {
            // Remove the item if already selected
            currentFilters[filterKey] = currentFilters[filterKey].filter(
              (i) => i !== item
            );
            button.classList.remove("selected-filter");
          } else {
            // Add the item if not already selected
            currentFilters[filterKey].push(item);
            button.classList.add("selected-filter");
          }
          applyFilters();
          console.log(`${filterKey} Filter`, currentFilters); //TODO: Remove when done debugging
        });
      });
    }

    setupFilter(days, "days");
    setupFilter(genres, "genres");
    setupFilter(stages, "stages");

    document.getElementById("reset-filters").addEventListener("click", () => {
      currentFilters = { days: [], stages: [], genres: [] };

      //Remove the "selected-filter" class from all buttons
      document.querySelectorAll(".selected-filter").forEach((button) => {
        button.classList.remove("selected-filter");
      });

      applyFilters();
      console.log("Reset Filters", currentFilters); //TODO: Remove when done debugging
    });
  } else {
    console.error("Failed to fetch festival data");
  }
}

main();
