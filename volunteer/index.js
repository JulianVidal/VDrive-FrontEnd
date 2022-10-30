const errorElement = document.getElementById("msg-error");
const interval = setInterval(getLocation, 1000);
const searchButton = document.getElementById("button-search");
const searchBar = document.getElementById("text-search")
const currentButton = document.getElementById("button-current")

let waypoints = [];
const map = L.map('map').setView([0, 0], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let currentMarker = L.marker([0, 0]).addTo(map);

searchButton.addEventListener("click", getCoordsFromPostcode);
currentButton.addEventListener("click", () => {
  localStorage.removeItem("gps");
  getLocation()
})

getLocation()

function getCoordsFromPostcode() {
  const postcode = searchBar.value.replace(" ", "%20");
  fetch("https://api.promaptools.com/service/uk/postcode-lat-lng/get/?postcode=" + postcode + "&key=17o8dysaCDrgv1c", {
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "omit"
  })
  .then(data => data.json())
  .then(data => {
    const {longitude, latitude} = data.output[0];
    localStorage.setItem("gps", JSON.stringify({coords:{latitude, longitude}}) );
    displayMap(latitude, longitude)
  })
}

function getLocation() {
  const options = {
    enableHighAccuracy: false,
    maximumAge: Infinity
  };

  if (localStorage.getItem("gps") !== undefined) {
    try {
      const {coords} = JSON.parse(localStorage.getItem("gps"));
      const {latitude, longitude} = coords;
      displayMap(latitude, longitude);
      clearInterval(interval)
      errorElement.style.display = "none";
      return;
    } catch (err) {}   
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(handleLocation, handleError, options);
    clearInterval(interval);
  } else {
    handleError({message: "Geolocation is not supported by this browser."});
  }
}

function handleError(err) {
  errorElement.innerHTML = "Couldn't take location: " + err.message;
}

function handleLocation (gps) {
  console.log("Got collection")
  localStorage.setItem('gps', JSON.stringify({coords: {
    latitude: gps.coords.latitude,
    longitude: gps.coords.longitude
  }}));
  errorElement.style.display = "none";

  displayMap(gps.coords.latitude, gps.coords.longitude)
}

function displayMap(lat, lng) {
  waypoints = [];
  currentMarker.setLatLng([lat, lng])
  map.setView([lat, lng])

  let route = L.Routing.control({waypoints:waypoints}).addTo(map);
  waypoints.push(L.latLng(lat, lng));
  waypoints.push(L.latLng(57.6792, 11.949))
  route.setWaypoints(waypoints)

  cordToPost(lat, lng, getFoodBanks)
}

function cordToPost(lat, lng, callback) {
  fetch("https://nominatim.openstreetmap.org/reverse?lat=" + lat + "&lon=" + lng + "&format=jsonv2", {
  "method": "GET",
  "mode": "cors",
  "credentials": "omit"
  })
  .then(data => data.json())
  .then(data => {
    const {address} = data;
    const {postcode} = address;
    callback(postcode)
  });
}

function getFoodBanks(postcode) {
  // const url = "http://localhost:7027/foodbank/GetNearestFoodBankLocation?location=" + postcode.replace(" ", "%20");
  // console.log("got postcode")
  // fetch(url,{
  //   "method": "GET",
  // })
  // .then(data => console.log(data))
  // .then(data => console.log(data))
  // .catch(err => console.log(err))

  var requestOptions = {
    method: 'GET',
    redirect: 'follow',
    headhers: {
      'Accept': 'application/json',
      'Content-type': 'application/json'
    },
    "Access-Control-Allow-Origin": "*"
  };
  
  fetch("http://localhost:7027/FoodBank/GetNearestFoodBankLocation?location=B15 2GR", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}