let watchlist = JSON.parse(localStorage.getItem("streamSquadWatchlist")) || [
  "Breaking Bad",
  "Dark",
  "Stranger Things",
  "The Boys"
];

function saveWatchlist() {
  localStorage.setItem("streamSquadWatchlist", JSON.stringify(watchlist));
}

function displayWatchlist() {
  const list = document.getElementById("watchlist");
  list.innerHTML = "";

  watchlist.forEach((show, index) => {
    const item = document.createElement("li");
    item.className = "show-item";
    item.draggable = true;
    item.dataset.index = index;

    item.innerHTML = `
      <span class="show-number">#${index + 1}</span>
      <span class="show-name">${show}</span>
    `;

    item.addEventListener("dragstart", dragStart);
    item.addEventListener("dragover", dragOver);
    item.addEventListener("drop", drop);
    item.addEventListener("dragend", dragEnd);

    list.appendChild(item);
  });
}

function addShow() {
  const input = document.getElementById("showInput");
  const showName = input.value.trim();

  if (showName === "") {
    return;
  }

  watchlist.push(showName);
  saveWatchlist();
  displayWatchlist();
  input.value = "";
}

function clearWatchlist() {
  watchlist = [];
  localStorage.removeItem("streamSquadWatchlist");
  displayWatchlist();
}

let draggedIndex = null;

function dragStart(event) {
  draggedIndex = Number(event.currentTarget.dataset.index);
  event.currentTarget.classList.add("dragging");
}

function dragOver(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  const targetIndex = Number(event.currentTarget.dataset.index);

  if (draggedIndex === targetIndex) {
    return;
  }

  const draggedShow = watchlist[draggedIndex];
  watchlist.splice(draggedIndex, 1);
  watchlist.splice(targetIndex, 0, draggedShow);

  saveWatchlist();
  displayWatchlist();
}

function dragEnd(event) {
  event.currentTarget.classList.remove("dragging");
}

function getLocation() {
  const status = document.getElementById("locationStatus");
  const details = document.getElementById("locationDetails");

  if (!navigator.geolocation) {
    status.textContent = "Geolocation is not supported by this browser.";
    return;
  }

  status.textContent = "Getting your location...";

  navigator.geolocation.getCurrentPosition(showPosition, showLocationError);

  function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    status.textContent = "Your current location has been found.";
    details.style.display = "block";
    details.innerHTML = `
      <p><strong>Latitude:</strong> ${latitude}</p>
      <p><strong>Longitude:</strong> ${longitude}</p>
      <p><strong>Accuracy:</strong> ${position.coords.accuracy} meters</p>
    `;
  }

  function showLocationError(error) {
    if (error.code === error.PERMISSION_DENIED) {
      status.textContent = "Location permission was denied.";
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      status.textContent = "Location information is unavailable.";
    } else if (error.code === error.TIMEOUT) {
      status.textContent = "The request for location timed out.";
    } else {
      status.textContent = "An unknown error occurred.";
    }
  }
}

displayWatchlist();