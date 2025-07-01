const http = require("http");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/users");

const connectDB = require("./database");

connectDB();
const port = 3000;
let index = fs.readFileSync(`index.html`, "utf-8");
const cat = fs.readFileSync(`${__dirname}/assets/cat.jpg`);
const icon = fs.readFileSync(`${__dirname}/assets/book-hub.png`);
const style = fs.readFileSync("style.css", "utf-8");

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/home") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(index);
  }

  if (req.url === "/style.css") res.end(style);

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
    const perfil = fs.readFileSync(`${__dirname}/pages/template-profile.html`);
    res.writeHead(200, { "content-type": "text/html" });
    res.end(index.replace('<div id="main-page"></div>', perfil));
  }

  if (req.url === "/agregar") {
    const perfil = fs.readFileSync(`${__dirname}/pages/template-subir.html`);
    res.writeHead(200, { "content-type": "text/html" });
    res.end(index.replace('<div id="main-page"></div>', perfil));
  }
});

mongoose.connection.once("open", () => {
  console.log("connected to mongodb");
  server.listen(port, "127.0.0.1", () => {
    console.log(`listening in ${port}`);
  });
});

const getUsers = async () => {
  const usuarios = await User.find();
  return usuarios;
};
