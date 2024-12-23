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
  const festivalData = await fetchData(); // Wait for the data to load
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

    /* console.log("Artist: ", artists); */

    const artistsContainer = document.getElementById("artists-container");
    const artistHTML = artists
      .map(
        (artist) => `
      <div class="artist-card">
        <h2>${artist.name}</h2>
        <p>${artist.desc}</p>
        <p>${artist.genre}</p>
        <p>${artist.day}</p>
        <p>${artist.date}</p>
        <p>${artist.stage}</p>
      </div>`
      )
      .join(""); //Removes a pesky ",";

    artistsContainer.innerHTML = artistHTML;
    console.log("Artists Container", artistsContainer);

    let currentFilters = {
      day: null,
      stage: null,
      genre: null,
    };
  } else {
    console.error("Failed to fetch festival data");
  }
}

main();
