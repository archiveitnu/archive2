const WATCHLIST_STORAGE_KEY = "streamSquadWatchlist";
const SQUAD_STORAGE_KEY = "streamSquadActiveSquad";

const defaultWatchlist = [
    { id: 1, title: "Breaking Bad", watched: true },
    { id: 2, title: "Dark", watched: false },
    { id: 3, title: "Stranger Things", watched: false },
    { id: 4, title: "The Boys", watched: false }
];

const defaultSquad = {
    name: "Netflix Nerds",
    code: "NETFLIX24",
    memberName: "",
    memberEmail: ""
};

let watchlist = loadWatchlist();
let activeSquad = loadSquad();
let draggedIndex = null;
let draggedElement = null;
let dragPlaceholder = null;

function loadWatchlist() {
    const savedData = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!savedData) return [...defaultWatchlist];

    try {
        const parsedData = JSON.parse(savedData);
        return Array.isArray(parsedData) ? parsedData : [...defaultWatchlist];
    } catch (error) {
        console.error("Could not read saved watchlist:", error);
        return [...defaultWatchlist];
    }
}

function saveWatchlist() {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
}

function loadSquad() {
    const savedSquad = localStorage.getItem(SQUAD_STORAGE_KEY);
    if (!savedSquad) return { ...defaultSquad };

    try {
        const parsedSquad = JSON.parse(savedSquad);
        return { ...defaultSquad, ...parsedSquad };
    } catch (error) {
        console.error("Could not read saved Squad:", error);
        return { ...defaultSquad };
    }
}

function saveSquad() {
    localStorage.setItem(SQUAD_STORAGE_KEY, JSON.stringify(activeSquad));
}

function updateDashboard() {
    const squadName = document.getElementById("dashboardSquadName");
    if (squadName) squadName.textContent = activeSquad.name;

    const watchlistCount = document.getElementById("watchlistCount");
    if (watchlistCount) {
        const count = watchlist.length;
        watchlistCount.textContent = `${count} ${count === 1 ? "show" : "shows"}`;
    }

    const watchedCount = document.getElementById("watchedCount");
    if (watchedCount) {
        watchedCount.textContent = watchlist.filter(show => show.watched).length;
    }

    const currentlyWatching = document.getElementById("currentlyWatching");
    if (currentlyWatching) {
        const nextShow = watchlist.find(show => !show.watched);
        currentlyWatching.textContent = nextShow ? nextShow.title : "Nothing queued";
    }

    const activeSquadCode = document.getElementById("activeSquadCode");
    if (activeSquadCode) activeSquadCode.textContent = activeSquad.code;

    const activeSquadMember = document.getElementById("activeSquadMember");
    if (activeSquadMember) {
        activeSquadMember.textContent = activeSquad.memberName
            ? `Created by ${activeSquad.memberName}`
            : "Ready to invite members";
    }
}

function renderWatchlist() {
    const list = document.getElementById("watchlistItems");
    if (!list) return;

    list.innerHTML = "";

    if (watchlist.length === 0) {
        list.innerHTML = `
            <li class="watchlist-empty">
                Your shared watchlist is empty.<br>
                Add a movie or show above to get started.
            </li>
        `;
        updateDashboard();
        return;
    }

    watchlist.forEach((show, index) => {
        const item = document.createElement("li");

        item.className = "watchlist-item";
        item.draggable = true;
        item.dataset.index = index;

        const statusText = show.watched
            ? "Watched"
            : index === 0
                ? "Up next"
                : "Queued";

        item.innerHTML = `
            <span class="priority-number">#${index + 1}</span>
            <span class="show-name ${show.watched ? "watched-show" : ""}">
                ${show.watched ? "✓ " : ""}
                ${escapeHTML(show.title)}
            </span>
            <span class="watchlist-status">${statusText}</span>
            <div class="watchlist-actions">
                <button type="button" class="btn btn-sm btn-outline-success watch-button" data-id="${show.id}">
                    ${show.watched ? "Undo" : "Watched"}
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger delete-button" data-id="${show.id}">
                    Delete
                </button>
            </div>
        `;

        item.addEventListener("dragstart", dragStart);
        item.addEventListener("dragover", dragOver);
        item.addEventListener("drop", drop);
        item.addEventListener("dragend", dragEnd);

        list.appendChild(item);
    });

    document.querySelectorAll(".watch-button").forEach(button => {
        button.addEventListener("click", () => {
            toggleWatched(Number(button.dataset.id));
        });
    });

    document.querySelectorAll(".delete-button").forEach(button => {
        button.addEventListener("click", () => {
            removeShow(Number(button.dataset.id));
        });
    });

    updateDashboard();
}

function addShow() {
    const input = document.getElementById("showInput");
    if (!input) return;

    const showName = input.value.trim();

    if (showName === "") {
        input.focus();
        return;
    }

    watchlist.push({
        id: Date.now(),
        title: showName,
        watched: false
    });

    saveWatchlist();
    renderWatchlist();

    input.value = "";
    input.focus();
}

function toggleWatched(id) {
    watchlist.forEach(show => {
        if (show.id === id) {
            show.watched = !show.watched;
        }
    });

    saveWatchlist();
    renderWatchlist();
}

function removeShow(id) {
    watchlist = watchlist.filter(show => show.id !== id);
    saveWatchlist();
    renderWatchlist();
}

function clearWatchlist() {
    if (watchlist.length === 0) return;

    const confirmed = confirm("Are you sure you want to clear the entire watchlist?");
    if (!confirmed) return;

    watchlist = [];
    localStorage.removeItem(WATCHLIST_STORAGE_KEY);
    renderWatchlist();
}

function dragStart(event) {
    draggedElement = event.currentTarget;
    draggedIndex = Number(draggedElement.dataset.index);

    dragPlaceholder = document.createElement("li");
    dragPlaceholder.className = "watchlist-placeholder";
    dragPlaceholder.setAttribute("aria-hidden", "true");
    dragPlaceholder.style.height = `${draggedElement.offsetHeight}px`;

    draggedElement.classList.add("dragging");

    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(draggedIndex));
    }

    requestAnimationFrame(() => {
        if (draggedElement && dragPlaceholder) {
            draggedElement.parentNode.insertBefore(
                dragPlaceholder,
                draggedElement.nextSibling
            );
        }
    });
}

function dragOver(event) {
    event.preventDefault();

    const target = event.currentTarget;

    if (!draggedElement || target === draggedElement || !dragPlaceholder) {
        return;
    }

    const rect = target.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;

    if (event.clientY < midpoint) {
        target.parentNode.insertBefore(dragPlaceholder, target);
    } else {
        target.parentNode.insertBefore(dragPlaceholder, target.nextSibling);
    }
}

function drop(event) {
    event.preventDefault();

    if (!draggedElement || !dragPlaceholder || draggedIndex === null) {
        return;
    }

    const children = Array.from(dragPlaceholder.parentNode.children);
    const placeholderIndex = children.indexOf(dragPlaceholder);
    const originalIndex = draggedIndex;

    const movedShow = watchlist.splice(originalIndex, 1)[0];

    let newIndex = placeholderIndex;

    if (originalIndex < placeholderIndex) {
        newIndex--;
    }

    newIndex = Math.max(0, Math.min(newIndex, watchlist.length));

    watchlist.splice(newIndex, 0, movedShow);

    saveWatchlist();
    renderWatchlist();
    resetDragState();
}

function dragEnd(event) {
    event.currentTarget.classList.remove("dragging");
    resetDragState();
}

function resetDragState() {
    if (dragPlaceholder && dragPlaceholder.parentNode) {
        dragPlaceholder.parentNode.removeChild(dragPlaceholder);
    }

    if (draggedElement) {
        draggedElement.classList.remove("dragging");
    }

    draggedIndex = null;
    draggedElement = null;
    dragPlaceholder = null;
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
        const { latitude, longitude, accuracy } = position.coords;

        status.textContent = "Your current location has been found.";

        const latitudeElement = document.getElementById("latitude");
        const longitudeElement = document.getElementById("longitude");
        const accuracyElement = document.getElementById("accuracy");

        if (latitudeElement) latitudeElement.textContent = latitude;
        if (longitudeElement) longitudeElement.textContent = longitude;
        if (accuracyElement) accuracyElement.textContent = `${accuracy} meters`;

        if (details) details.style.display = "block";

        const locationCard = document.querySelector(".location-card");

        if (locationCard) {
            locationCard.classList.add("location-found");
        }
    }

    function showLocationError(error) {
        if (!status) return;

        if (error.code === error.PERMISSION_DENIED) {
            status.textContent = "Location permission was denied.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
            status.textContent = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
            status.textContent = "The request for location timed out.";
        } else {
            status.textContent = "An unknown location error occurred.";
        }
    }
}

function handleSquadCreation(event) {
    event.preventDefault();

    const squadName = document.getElementById("squadName")?.value.trim();
    const squadCode = document.getElementById("squadCode")?.value.trim();
    const memberName = document.getElementById("memberName")?.value.trim();
    const memberEmail = document.getElementById("memberEmail")?.value.trim();

    if (!squadName || !squadCode || !memberName || !memberEmail) {
        return;
    }

    activeSquad = {
        name: squadName,
        code: squadCode.toUpperCase(),
        memberName,
        memberEmail
    };

    saveSquad();
    updateDashboard();

    const message = document.getElementById("squadCreatedMessage");

    if (message) {
        message.textContent =
            `Squad "${activeSquad.name}" was created successfully. Share code ${activeSquad.code} with your friends.`;
    }

    const modalElement = document.getElementById("squadCreatedModal");

    if (modalElement && window.bootstrap) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
        modal.show();
    }

    const memberNameInput = document.getElementById("memberName");
    const memberEmailInput = document.getElementById("memberEmail");

    if (memberNameInput) memberNameInput.value = "";
    if (memberEmailInput) memberEmailInput.value = "";
}

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
    renderWatchlist();

    const squadNameInput = document.getElementById("squadName");
    const squadCodeInput = document.getElementById("squadCode");

    if (squadNameInput) squadNameInput.value = activeSquad.name;
    if (squadCodeInput) squadCodeInput.value = activeSquad.code;

    updateDashboard();

    const addButton = document.getElementById("addShowButton");

    if (addButton) {
        addButton.addEventListener("click", addShow);
    }

    const showInput = document.getElementById("showInput");

    if (showInput) {
        showInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                addShow();
            }
        });
    }

    const clearButton = document.getElementById("clearWatchlistButton");

    if (clearButton) {
        clearButton.addEventListener("click", clearWatchlist);
    }

    const locationButton = document.getElementById("locationButton");

    if (locationButton) {
        locationButton.addEventListener("click", getLocation);
    }

    const squadForm = document.getElementById("squadForm");

    if (squadForm) {
        squadForm.addEventListener("submit", handleSquadCreation);
    }
});