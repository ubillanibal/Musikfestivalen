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

    const days = festivalData.items
      .filter((item) => item.sys.contentType.sys.id === "day")
      .map((item) => item.fields.description);

    const daysContainer = document.getElementById("days-container");

    days.forEach((item) => {
      const button = document.createElement("button");
      button.id = `${item.toLocaleLowerCase()}-button`;
      button.textContent = item;
      daysContainer.appendChild(button);
    });

    const stages = festivalData.items
      .filter((item) => item.sys.contentType.sys.id === "stage")
      .map((item) => item.fields.name);
    console.log("Stages", stages); //TODO: Remove when done debugging

    const genres = festivalData.items
      .filter((item) => item.sys.contentType.sys.id === "genre")
      .map((item) => item.fields.name);
    console.log("Genres", genres); //TODO: Remove when done debugging

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

    //Filter
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
        const matchesDay =
          currentFilters.days.length === 0 ||
          currentFilters.days.some(
            (day) => artistDay.toLocaleLowerCase() === day.toLocaleLowerCase()
          );

        if (matchesDay) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    };

    days.forEach((day) => {
      document
        .getElementById(`${day.toLocaleLowerCase()}-button`)
        .addEventListener("click", () => {
          if (currentFilters.days.includes(day)) {
            // Remove "Friday" if already selected
            currentFilters.days = currentFilters.days.filter((d) => d !== day);
          } else {
            currentFilters.days.push(day);
          }
          applyFilters();
          console.log("Friday Filter", currentFilters); //TODO: Remove when done debugging
        });
    });

    document.getElementById("reset-filters").addEventListener("click", () => {
      currentFilters = { days: [], stages: [], genres: [] };
      applyFilters();
      console.log("Reset Filters", currentFilters); //TODO: Remove when done debugging
    });
  } else {
    console.error("Failed to fetch festival data");
  }
}

main();
