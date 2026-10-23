let currentUser = null;

// Send requests to the server
async function request(route, method = "GET", data = null) {
    const options = {
        method: method,
        headers: {
            username: currentUser.username,
            password: currentUser.password,
            "Content-Type": "application/json"
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch("http://localhost:3000" + route, options);
    const result = await response.json();

    document.getElementById("message").textContent =
        JSON.stringify(result, null, 2);

    return { response, result };
}

// Login
async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const output = document.getElementById("message");

    output.textContent = "Logging in...";

    currentUser = { username, password };

    try {
        const { response, result } = await request("/students");

        if (response.ok) {
            document.getElementById("login").classList.add("hidden");
            document.getElementById("dashboard").classList.remove("hidden");

            document.getElementById("welcome").textContent =
                "Welcome, " + username;

            if (username === "admin") {
                document.getElementById("adminPanel").classList.remove("hidden");
            } else {
                document.getElementById("studentPanel").classList.remove("hidden");
            }

            loadStudents();
        } else {
            currentUser = null;
            output.textContent = JSON.stringify(result, null, 2);
        }
    } catch (error) {
        currentUser = null;
        output.textContent = "Error: " + error.message;
        console.error(error);
    }
}

// Admin: View users
async function loadUsers() {
    const { response, result } = await request("/users");

    if (response.ok) {
        document.getElementById("message").textContent =
            JSON.stringify(result, null, 2);
    }
}

// Admin: Delete user
async function deleteUser() {
    const id = document.getElementById("deleteId").value;

    const { response } = await request("/users/" + id, "DELETE");

    if (response.ok) {
        loadUsers();
    }
}

// View student records
async function loadStudents() {
    const { response, result } = await request("/students");

    if (response.ok) {
        const records = document.getElementById("records");

        records.replaceChildren();

        result.forEach(student => {
            const li = document.createElement("li");

            li.textContent =
                `${student.name} | ${student.course} | Marks: ${student.marks}`;

            records.appendChild(li);
        });
    }
}

// Admin: Add student
async function addStudent() {
    const data = {
        name: document.getElementById("studentName").value,
        course: document.getElementById("course").value,
        marks: Number(document.getElementById("marks").value)
    };

    const { response } = await request("/students", "POST", data);

    if (response.ok) {
        loadStudents();
    }
}

// Logout
function logout() {
    currentUser = null;

    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("login").classList.remove("hidden");
    document.getElementById("adminPanel").classList.add("hidden");
    document.getElementById("studentPanel").classList.add("hidden");

    document.getElementById("message").textContent = "Logged out.";
}