const http = require("http");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/users");

const { getUser, getUsers, insertBook } = require("./controllers/crud.js");
const connectDB = require("./database");

connectDB();
const port = 3000;
let index = fs.readFileSync(`index.html`, "utf-8");
const cat = fs.readFileSync(`${__dirname}/assets/cat.jpg`);
const icon = fs.readFileSync(`${__dirname}/assets/book-hub.png`);
const style = fs.readFileSync("style.css", "utf-8");

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    const landing = fs.readFileSync(`${__dirname}/pages/landingPage.html`, "utf-8");
    res.end(landing);
    return;
  }

  if (req.url === "/home") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(index);
    return;
  }

  if (req.url === "/style.css") res.end(style);

  if (req.url === "/login") {
    let loginPage = fs.readFileSync(`${__dirname}/pages/login.html`, "utf-8");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(loginPage);
    return;
  }

  if (req.url === "/signup" && req.method === 'GET') {
    const signupPage = fs.readFileSync(`${__dirname}/pages/signup.html`);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(signupPage);
    return;
  }
  if (req.url === "/signup" && req.method === 'POST') {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        let data = JSON.parse(body);
        console.log(data)
        res.writeHead(200,{"Content-Type":"application/json"})
        res.end(JSON.stringify({mensaje: "Successfull"}))
        return
      } catch (error) {
        
      }
    })
  }

  if (req.url === "/assets/cat.jpg") {
    res.writeHead(200, { "content-type": "image/jpeg" });
    res.end(cat);
  }

  if (req.url === "/assets/book-hub.png") {
    res.writeHead(200, { "content-type": "image/png" });
    res.end(icon);
  }

  if (req.url.includes("/assets/icons")) {
    let icon = fs.readFileSync(`${__dirname}${req.url}`);
    res.writeHead(200, { "content-type": "image/svg+xml" });
    res.end(icon);
  }

  if (req.url === "/find") {
    getUsers()
      .then((usuarios) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(usuarios));
      })
      .catch((err) => res.end(`${err}`));
  }

  if (req.url === "/perfil") {
    const perfil = fs.readFileSync(`${__dirname}/pages/template-profile.html`, "utf-8");
    res.writeHead(200, { "content-type": "text/html" });
    res.end(index.replace('<div id="main-page"></div>', perfil));
  }

  if (req.url === "/profile") {
    const perfil = fs.readFileSync(`${__dirname}/pages/template-profile.html`, "utf-8");
    getUser("Ramses").then((usuario) => {
      let perfil2 = perfil;
      perfil2 = perfil2.replace("%nombre%", usuario.name);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(index.replace('<div id="main-page"></div>', perfil2));
    });
  }

  if (req.url === "/agregar" && req.method === "GET") {
    const agregar = fs.readFileSync(`${__dirname}/pages/template-subir.html`);
    res.writeHead(200, { "content-type": "text/html" });
    res.end(index.replace('<div id="main-page"></div>', agregar));
    return;
  }

  if (req.url === "/agregar" && req.method === "POST") {
    console.log("peticions");
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        console.log("Datos recibidos: ", data);

        insertBook(data).then(() => {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ mensaje: "Datos recibidos correctamente" }));
        })
        .catch(error => console.error(error))
      } catch (error) {}
    });
  }

  if (req.url === "/login") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const data = JSON.parse(body); // Suponiendo que recibes JSON
        console.log("Datos recibidos:", data);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ mensaje: "Datos recibidos correctamente" }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "JSON inválido" }));
      }
    });
  }

  if (req.url === "/add" && req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        console.log("Datos recibidos:", data);

        insertBook(data)
          .then(() => {
            console.log("Insertado");
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ mensaje: "Agregado correctamente" }));
          })
          .catch((err) => {
            console.error("Error al insertar:", err.message);
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message }));
          });
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "JSON inválido" }));
      }
    });
  }
});

mongoose.connection.once("open", () => {
  console.log("connected to mongodb");
  server.listen(port, "127.0.0.1", () => {
    console.log(`listening in ${port}`);
  });
});
