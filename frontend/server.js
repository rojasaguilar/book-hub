const http = require("http");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/users");

const {
  getUser,
  getUsers,
  insertBook,
  insertUser,
  getLibros,
} = require("./controllers/crud.js");
const connectDB = require("./database");

connectDB();
const port = 3000;
let index = fs.readFileSync(`index.html`, "utf-8");
const cat = fs.readFileSync(`${__dirname}/assets/cat.jpg`);
const icon = fs.readFileSync(`${__dirname}/assets/book-hub.png`);
// const style = fs.readFileSync("style.css", "utf-8");

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    const landing = fs.readFileSync(`${__dirname}/pages/landingPage.html`, "utf-8");
    res.end(landing);
    return;
  }

  if (req.url.includes("/portadas")) {
    res.writeHead(200, { "Content-Type": "image/webp" });
    const portada = fs.readFileSync(`${__dirname}${req.url}`);
    res.end(portada);
    return;
  }

  if (req.url === "/home") {
    getLibros().then((libros) => {
      let page = fs.readFileSync(`index.html`, "utf-8");
      const tarjetas = libros
        .map(
          (libro) =>
            `
  <div class="libro">
    <div><img src="/public/portadas/${libro.portada}.webp" alt="" /></div>
    <strong>${libro.titulo}</strong>
    <p style="margin: 0; padding: 0">${libro.categoria}</p>
</div>
            `
        )
        .join("");
      res.writeHead(200, { "Content-Type": "text/html" });
      page = page.replace("%libros%", tarjetas);

      res.end(page);
    });
    return;
  }

  // if (req.url === "/style.css") res.end(style);

  if (req.url.includes("/styles")) {
    let estilo = fs.readFileSync(`${__dirname}${req.url}`, "utf-8");
    res.writeHead(200, { "Content-Type": "text/css" });
    res.end(estilo);
    return;
  }

  if (req.url === "/login" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        let data = JSON.parse(body);
        console.log("data", data);
        getUser(data.nombreUsuario).then((user) => {
          if (user.password === data.password) {
            res.writeHead(200, {
              "Content-Type": "application/json",
            });
            res.end(JSON.stringify(user));
            return;
          }
          res.writeHead(401, {
            "Content-Type": "application/json",
          });
          res.end("not validated");
          return;
        });
      } catch (error) {}
    });
  }

  if (req.url === "/signup" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        let data = JSON.parse(body);
        console.log(data);
        insertUser(data)
          .then(() => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ mensaje: "Successfull" }));
            return;
          })
          .catch((e) => {
            console.error(e);
          });
      } catch (error) {}
    });
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

  if (req.url.includes("/public")) {
    let img = fs.readFileSync(`${__dirname}${req.url}`);
    res.writeHead(200, { "Content-Type": "image/webp" });
    res.end(img);
  }

  if (req.url === "/find") {
    getUsers()
      .then((usuarios) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(usuarios));
      })
      .catch((err) => res.end(`${err}`));
  }

  if (req.url === "/libros") {
    getLibros()
      .then((libros) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(libros));
      })
      .catch((err) => console.error(err));
  }

  if (req.url === "/perfil") {
    const perfil = fs.readFileSync(`${__dirname}/pages/template-profile.html`, "utf-8");
    res.writeHead(200, { "content-type": "text/html" });
    res.end(index.replace('<div id="main-page"></div>', perfil));
  }

  if (req.url === "/profile") {
    // const perfil = fs.readFileSync(`${__dirname}/pages/template-profile.html`, "utf-8");
    // getUser("RamsesRO").then((usuario) => {
    //   let perfil2 = perfil;
    //   perfil2 = perfil2.replace("%nombre%", usuario.nombreUsuario);
    //   res.writeHead(200, { "Content-Type": "text/html" });
    //   const reemplazar = `<div id="main-page">
    //       <div class="parent">%libros%</div>
    //     </div>`;
    //   res.end(perfil);
    // });
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      console.log(req.body);
    });
  }

  if (req.url === "/agregar" && req.method === "GET") {
    const agregar = fs.readFileSync(`${__dirname}/pages/template-subir.html`);
    res.writeHead(200, { "content-type": "text/html" });
    res.end(agregar);
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

        insertBook(data)
          .then(() => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ mensaje: "Datos recibidos correctamente" }));
          })
          .catch((error) => console.error(error));
      } catch (error) {}
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
