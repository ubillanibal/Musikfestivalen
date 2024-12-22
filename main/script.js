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

    const artists = festivalData.items
      .filter((item) => item.sys.contentType.sys.id === "artist")
      .map((item) => {
        const genreID = item.fields.genre.sys.id;
        const dayID = item.fields.day.sys.id;
        const stageID = item.fields.stage.sys.id;

        const name = item.fields.name;
        const desc = item.fields.description;

        const genre = festivalData.items.find((item) => item.sys.id === genreID)
          .fields.name;
        const day = festivalData.items.find((item) => item.sys.id === dayID)
          .fields.description;
        const date = festivalData.items.find((item) => item.sys.id === dayID)
          .fields.date;
        const stage = festivalData.items.find((item) => item.sys.id === stageID)
          .fields.name;
        return {
          name,
          genre,
          day,
          stage,
          desc,
          date,
        };
      });

    console.log("Artists: ", artists);

    /*     const artistsContainer = document.getElementById("artists-container");
    const postHTML = festivalData.items.map((artist) => {
      return `<div class="post">
                <h2>${artist.fields.name}</h2>
                <p>${artist.fields.genre}</p>
                <h2>${artist.fields.stage}</h2>
                <p>${artist.fields.description}</p>
              </div>`;
    });
    artistsContainer.innerHTML = postHTML; */
  } else {
    console.error("Failed to fetch festival data");
  }
}

main();
