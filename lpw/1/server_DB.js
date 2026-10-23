const http = require("http");
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

// Connect to MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "rbac_db"
});

db.connect(err => {
    if (err) throw err;
    console.log("Connected to MySQL");
});

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

    // Serve HTML page
    if (req.url === "/" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/html" });
        return res.end(fs.readFileSync(path.join(__dirname, "index.html")));
    }

    // Authentication: Check credentials in MySQL
    const username = req.headers.username;
    const password = req.headers.password;

    db.query(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username, password],
        (err, results) => {

            if (err) {
                return send(res, 500, { message: "Database error" });
            }

            if (results.length === 0) {
                return send(res, 401, {
                    message: "Authentication failed"
                });
            }

            const user = results[0];

            // Authorization: Admin route
            if (req.url === "/admin") {

                if (user.role !== "admin") {
                    return send(res, 403, {
                        message: "Access denied. Admin only."
                    });
                }

                return send(res, 200, {
                    message: "Welcome Admin!",
                    user: user.username
                });
            }

            // View all users: Admin only
            if (req.url === "/users" && req.method === "GET") {

                if (user.role !== "admin") {
                    return send(res, 403, {
                        message: "Access denied. Admin only."
                    });
                }

                db.query(
                    "SELECT id, username, role FROM users",
                    (err, users) => {
                        if (err) {
                            return send(res, 500, {
                                message: "Database error"
                            });
                        }

                        send(res, 200, users);
                    }
                );

                return;
            }

            // Create user: Admin only
            if (req.url === "/users" && req.method === "POST") {

                if (user.role !== "admin") {
                    return send(res, 403, {
                        message: "Access denied. Admin only."
                    });
                }

                let body = "";

                req.on("data", chunk => body += chunk);

                req.on("end", () => {
                    let data;

                    try {
                        data = JSON.parse(body);
                    } catch {
                        return send(res, 400, {
                            message: "Invalid JSON"
                        });
                    }

                    const { username, password, role } = data;

                    if (!username || !password ||
                        !["admin", "user"].includes(role)) {
                        return send(res, 400, {
                            message: "Username, password, and valid role required"
                        });
                    }

                    db.query(
                        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
                        [username, password, role],
                        (err, result) => {
                            if (err) {
                                if (err.code === "ER_DUP_ENTRY") {
                                    return send(res, 409, {
                                        message: "Username already exists"
                                    });
                                }

                                return send(res, 500, {
                                    message: "Database error"
                                });
                            }

                            send(res, 201, {
                                message: "User created successfully",
                                id: result.insertId
                            });
                        }
                    );
                });

                return;
            }

            // Delete user: Admin only
            if (req.url.startsWith("/users/") && req.method === "DELETE") {

                if (user.role !== "admin") {
                    return send(res, 403, {
                        message: "Access denied. Admin only."
                    });
                }

                const id = Number(req.url.split("/")[2]);

                if (!Number.isInteger(id) || id <= 0) {
                    return send(res, 400, {
                        message: "Invalid user ID"
                    });
                }

                // Prevent admin from deleting their own account
                if (id === user.id) {
                    return send(res, 400, {
                        message: "Cannot delete your own account"
                    });
                }

                db.query(
                    "DELETE FROM users WHERE id = ?",
                    [id],
                    (err, result) => {
                        if (err) {
                            return send(res, 500, {
                                message: "Database error"
                            });
                        }

                        if (result.affectedRows === 0) {
                            return send(res, 404, {
                                message: "User not found"
                            });
                        }

                        send(res, 200, {
                            message: "User deleted successfully"
                        });
                    }
                );

                return;
            }

            // Normal user route
            if (req.url === "/user" && req.method === "GET") {
                return send(res, 200, {
                    message: "Login successful",
                    user: user.username,
                    role: user.role
                });
            }

            send(res, 404, { message: "Route not found" });
        }
    );
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});