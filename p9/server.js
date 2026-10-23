const http = require("http");
const fs = require("fs");
const path = require("path");

// Users (temporary database)
const users = [
  { username: "admin", password: "1234", role: "admin" },
  { username: "student", password: "1234", role: "user" }
];

function send(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  // Allow the page to call this server even if opened from another port (Live Server)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "username, password, Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // Serve the web page
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    return res.end(fs.readFileSync(path.join(__dirname, "index.html")));
  }

  //Authentication
  const username = req.headers.username;
  const password = req.headers.password;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return send(res, 401, { message: "Authentication failed" });
  }

  //Authorization
  if (req.url === "/admin") {
    if (user.role !== "admin") {
      return send(res, 403, { message: "Access denied. Admin only." });
    }
    return send(res, 200, { message: "Welcome Admin!", user: user.username });
  }

  // Normal user route (any authenticated user)
  send(res, 200, {
    message: "Login successful",
    user: user.username,
    role: user.role
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});