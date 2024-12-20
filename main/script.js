const baseUrl = "https://cdn.contentful.com/spaces/";

const SPACE_ID = localStorage.getItem("space_id");
const ACCES_TOKEN = localStorage.getItem("acces_token");
const API_URL = `${baseUrl}${SPACE_ID}/entries?access_token=${ACCES_TOKEN}`;

/* const API_URL = "https://cdn.contentful.com/spaces/r4n29c9w5edo/entries?access_token=HOUWZG6vybQ5Hwy7bA-YtTeNZ6bK_FoSlS9VG0eUv0w" */

async function fetchData() {
  try {
    const response = await fetch(API_URL); 
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`); 
    }
    const data = await response.json(); 
    console.log('Fetched Data:', data); 
  } catch (error) {
    console.error('Error fetching data:', error); 
  }
}


fetchData();
