const BASE_URL = "https://cdn.contentful.com/spaces/";
const SPACE_ID = localStorage.getItem("space_id");
const ACCESS_TOKEN = localStorage.getItem("access_token");
const API_URL = `${BASE_URL}${SPACE_ID}/entries?access_token=${ACCESS_TOKEN}`;

//Fetchs all data from API
const fetchData = async () => {
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
};

const main = async () => {
  const festivalData = await fetchData();
  if (festivalData) {
    //Helper function to keep the code DRY
    const getFieldById = (id, fieldName) => {
      const item = festivalData.items.find((item) => item.sys.id === id);
      return item?.fields[fieldName];
    };

    const artists = festivalData.items
      .filter((item) => item.sys.contentType.sys.id === "artist")
      .map((item) => {
        const { name, description, genre, day, stage } = item.fields;

        const rawDate = getFieldById(day.sys.id, "date");

        // Parse and format the date
        const dateObject = new Date(rawDate);
        const formattedDate = dateObject.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
        }); // e.g., "7 June"
        const formattedTime = dateObject.toLocaleTimeString("en-GB", {
          hour: "numeric",
          hour12: true,
        }); // e.g., "1 AM"

        return {
          name,
          desc: description,
          genre: getFieldById(genre.sys.id, "name"),
          day: getFieldById(day.sys.id, "description"),
          date: formattedDate,
          time: formattedTime,
          stage: getFieldById(stage.sys.id, "name"),
        };
      });

    //Helper function to keep the code DRY
    const extractFields = (contentType, fieldName) => {
      return festivalData.items
        .filter((item) => item.sys.contentType.sys.id === contentType)
        .map((item) => item.fields[fieldName]);
    };

    const weekOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const days = extractFields("day", "description");
    days.sort((a, b) => weekOrder.indexOf(a) - weekOrder.indexOf(b));
    const stages = extractFields("stage", "name");
    const genres = extractFields("genre", "name");

    const daysContainer = document.getElementById("days-container");
    const stagesContainer = document.getElementById("stages-container");
    const genresContainer = document.getElementById("genres-container");

    //Helper function to keep the code DRY
    const generateFilterButtons = (array, container) => {
      array.forEach((item) => {
        const button = document.createElement("button");
        button.id = `${item.toLocaleLowerCase()}-button`;
        button.textContent = item;
        container.appendChild(button);
      });
    };

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
        <p>${artist.date} at ${artist.time}</p>
        <p>${artist.stage}</p>
        <p>${artist.genre}</p>
        <p>${artist.desc}</p>
      </div>`
      )
      .join(""); //Removes a pesky "," between artist-cards

    artistsContainer.innerHTML = artistHTML;

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
        const artistGenre = card.querySelector("p:nth-of-type(4)").textContent;
        const artistStage = card.querySelector("p:nth-of-type(3)").textContent;

        //Helper function to keep the code DRY
        const matchesFilter = (filterKey, artistProperty) => {
          const filterArray = currentFilters[filterKey];
          return (
            filterArray.length === 0 ||
            filterArray.some(
              (filterItem) =>
                artistProperty.toLocaleLowerCase() ===
                filterItem.toLocaleLowerCase()
            )
          );
        };

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

    const setupFilter = (array, filterKey) => {
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
        });
      });
    };

    setupFilter(days, "days");
    setupFilter(genres, "genres");
    setupFilter(stages, "stages");

    document
      .getElementById("button-reset-filters")
      .addEventListener("click", () => {
        currentFilters = { days: [], stages: [], genres: [] };

        //Remove the "selected-filter" class from all buttons
        document.querySelectorAll(".selected-filter").forEach((button) => {
          button.classList.remove("selected-filter");
        });

        applyFilters();
      });
  } else if (
    (SPACE_ID === null || SPACE_ID === "") &&
    (ACCESS_TOKEN === null || ACCESS_TOKEN === "")
  ) {
    console.error("Missing space_id and access_token");
  } else if (SPACE_ID === null || SPACE_ID === "") {
    console.error("Missing space_id");
  } else if (ACCESS_TOKEN === null || ACCESS_TOKEN === "") {
    console.error("Missing access_token");
  } else {
    console.error("Failed to fetch festival data");
  }
};

main();
