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
      const artistsContainer = document.getElementById("artists-container");
      const artistCards = artistsContainer.querySelectorAll(".artist-card");

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

    document.getElementById("friday-button").addEventListener("click", () => {
      if (currentFilters.days != "Friday") {
        currentFilters.days = "Friday";
      } else {
        currentFilters.days = null;
      }
      applyFilters();
    });

    document.getElementById("reset-filters").addEventListener("click", () => {
      currentFilters = { days: [], stages: [], genres: [] };
      applyFilters();
    });
  } else {
    console.error("Failed to fetch festival data");
  }
}

main();
