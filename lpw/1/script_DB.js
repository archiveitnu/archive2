let currentUser = null;

// Send request to Node.js server
async function request(route, method = "GET", data = null) {

const options = {
    method: method,
    headers: {
        username: currentUser.username,
        password: currentUser.password,
        "Content-Type": "application/json"
    }
};
if (data !== null) {
    options.body = JSON.stringify(data);
}
const response = await fetch(route, options);
const result = await response.json();
document.getElementById("message").textContent =
    JSON.stringify(result, null, 2);
return { response, result };

}

// Login
async function login() {

const username = document.getElementById("username").value.trim();
const password = document.getElementById("password").value.trim();
currentUser = { username, password };
try {
    const { response, result } = await request("/user");
    if (!response.ok) {
        currentUser = null;
        return;
    }
    document.getElementById("login").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    document.getElementById("welcome").textContent =
        "Welcome, " + result.user;
    document.getElementById("role").textContent =
        "Role: " + result.role;
    if (result.role === "admin") {
        document.getElementById("adminPanel").classList.remove("hidden");
        document.getElementById("userPanel").classList.add("hidden");
        loadUsers();
    } else {
        document.getElementById("userPanel").classList.remove("hidden");
        document.getElementById("adminPanel").classList.add("hidden");
    }
} catch (error) {
    currentUser = null;
    document.getElementById("message").textContent =
        "Cannot connect to server. Make sure Node.js is running.";
}

}

// Admin: View users
async function loadUsers() {

try {
    const { response, result } = await request("/users");
    if (!response.ok) return;
    const table = document.getElementById("usersTable");
    table.replaceChildren();
    result.forEach(user => {
        const row = document.createElement("tr");
        [user.id, user.username, user.role].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });
        const actionCell = document.createElement("td");
        const button = document.createElement("button");
        button.textContent = "Delete";
        button.onclick = () => deleteUser(user.id);
        actionCell.appendChild(button);
        row.appendChild(actionCell);
        table.appendChild(row);
    });
} catch (error) {
    document.getElementById("message").textContent = error.message;
}

}

// Admin: Create user
async function createUser() {

const username = document.getElementById("newUsername").value.trim();
const password = document.getElementById("newPassword").value;
const role = document.getElementById("newRole").value;
if (!username || !password) {
    document.getElementById("message").textContent =
        "Enter username and password.";
    return;
}
try {
    const { response } = await request("/users", "POST", {
        username,
        password,
        role
    });
    if (response.ok) {
        document.getElementById("newUsername").value = "";
        document.getElementById("newPassword").value = "";
        await loadUsers();
    }
} catch (error) {
    document.getElementById("message").textContent = error.message;
}

}

// Admin: Delete user
async function deleteUser(id) {

if (!confirm("Are you sure you want to delete this user?")) {
    return;
}
try {
    const { response } = await request("/users/" + id, "DELETE");
    if (response.ok) {
        await loadUsers();
    }
} catch (error) {
    document.getElementById("message").textContent = error.message;
}

}

// Regular user route
async function accessUser() {
await request("/user");
}

// Logout
function logout() {

currentUser = null;
document.getElementById("dashboard").classList.add("hidden");
document.getElementById("login").classList.remove("hidden");
document.getElementById("adminPanel").classList.add("hidden");
document.getElementById("userPanel").classList.add("hidden");
document.getElementById("message").textContent = "Logged out.";

}