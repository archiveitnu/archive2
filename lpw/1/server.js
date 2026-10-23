const http = require("http");
const fs = require("fs");
const path = require("path");
const { dirname } = require("path");

// Temporary database
const users = [
    { id: 1, username: "admin", password: "1234", role: "admin" },
    { id: 2, username: "student", password: "1234", role: "student" }
];

let students = [
    { id: 101, name: "Rahul", course: "CSE", marks: 85 },
    { id: 102, name: "Priya", course: "IT", marks: 92 }
];

function send(res, status, data) {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "username, password, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    // Serve the website
    if (req.url === "/" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/html" });
        return res.end(fs.readFileSync(path.join(__dirname, "index.html")));
    }

    // Authentication
    const username = req.headers.username;
    const password = req.headers.password;

    const user = users.find(
        u => u.username === username && u.password === password
    );

    if (!user) {
        return send(res, 401, { message: "Invalid username or password" });
    }

    // Admin: View all users
    if (req.url === "/users" && req.method === "GET") {
        if (user.role !== "admin") {
            return send(res, 403, { message: "Admin access required" });
        }

        return send(res, 200, users.map(u => ({
            id: u.id,
            username: u.username,
            role: u.role
        })));
    }

    // Admin: Delete a user
    if (req.url.startsWith("/users/") && req.method === "DELETE") {
        if (user.role !== "admin") {
            return send(res, 403, { message: "Admin access required" });
        }

        const id = Number(req.url.split("/")[2]);
        const index = users.findIndex(u => u.id === id);

        if (index === -1) {
            return send(res, 404, { message: "User not found" });
        }

        if (users[index].username === "admin") {
            return send(res, 400, { message: "Cannot delete admin" });
        }

        users.splice(index, 1);

        return send(res, 200, { message: "User deleted successfully" });
    }

    // Admin and Student: View student records
    if (req.url === "/students" && req.method === "GET") {
        return send(res, 200, students);
    }

    // Admin only: Add a student record
    if (req.url === "/students" && req.method === "POST") {
        if (user.role !== "admin") {
            return send(res, 403, { message: "Only admin can add students" });
        }

        let body = "";

        req.on("data", chunk => body += chunk);

        req.on("end", () => {
            try {
                const data = JSON.parse(body);

                if (!data.name || !data.course) {
                    return send(res, 400, { message: "Name and course required" });
                }

                const student = {
                    id: Math.max(100, ...students.map(s => s.id)) + 1,
                    name: data.name,
                    course: data.course,
                    marks: Number(data.marks) || 0
                };

                students.push(student);

                send(res, 201, {
                    message: "Student added successfully",
                    student: student
                });
            } catch {
                send(res, 400, { message: "Invalid JSON" });
            }
        });

        return;
    }

    send(res, 404, { message: "Route not found" });

});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});