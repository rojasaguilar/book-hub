const http = require("http");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/users");
const formidable = require("formidable");

const {
  getUser,
  getUsers,
  insertBook,
  insertUser,
  getLibros,
  getLibro
} = require("./controllers/crud.js");
const connectDB = require("./database");

connectDB();
const port = 3000;
let index = fs.readFileSync(`index.html`, "utf-8");
const cat = fs.readFileSync(`${__dirname}/assets/cat.jpg`);
const icon = fs.readFileSync(`${__dirname}/assets/book-hub.png`);
let sesion = "";

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
    if (!sesion) {
      res.writeHead(200, {
        "Content-Type": "text/html",
      });
      let perfilLanding = fs.readFileSync(`${__dirname}/pages/landingPage.html`, "utf-8");
      res.end(perfilLanding);
      return;
    }
    getLibros().then((libros) => {
      let page = fs.readFileSync(`index.html`, "utf-8");
      const tarjetas = libros
        .map(
          (libro) =>
            `
  <div class="libro">
    <div><img src="/public/portadas/${libro.portada}" alt="" /></div>
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
            sesion = data;
            return;
          }
          res.writeHead(401, {
            "Content-Type": "application/json",
          });
          res.end("not validated");
          return;
        });
      } catch (error) {
        return;
      }
    });
  }

  if (req.url.includes("/scripts")) {
    res.writeHead(200, {
      "Content-Type": "text/javascript",
    });
    const script = fs.readFileSync(`${__dirname}${req.url}`, "utf-8");
    res.end(script);
    return;
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
            return;
          });
      } catch (error) {
        return;
      }
    });
  }

  if (req.url === "/assets/cat.jpg") {
    res.writeHead(200, { "content-type": "image/jpeg" });
    res.end(cat);
    return;
  }

  if (req.url === "/assets/book-hub.png") {
    res.writeHead(200, { "content-type": "image/png" });
    res.end(icon);
    return;
  }

  if (req.url.includes("/assets/icons")) {
    let icon = fs.readFileSync(`${__dirname}${req.url}`);
    res.writeHead(200, { "content-type": "image/svg+xml" });
    res.end(icon);
    return;
  }

  if (req.url.includes("/public")) {
    let img = fs.readFileSync(`${__dirname}${req.url}`);
    res.writeHead(200, { "Content-Type": "image/webp" });
    res.end(img);
    return;
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
    if (!sesion) {
      res.writeHead(200, {
        "Content-Type": "text/html",
      });
      let perfilLanding = fs.readFileSync(`${__dirname}/pages/landingPage.html`, "utf-8");
      res.end(perfilLanding);
      return;
    }
    let perfilPage = fs.readFileSync(`${__dirname}/pages/template-profile.html`, "utf-8");

    getUser(sesion.nombreUsuario).then((usuario) => {
      perfilPage = perfilPage.replace("%correo%", usuario.email);
      perfilPage = perfilPage.replace("%nombreUsuario%", usuario.nombreUsuario);
      perfilPage = perfilPage.replace("%sobreMi%", usuario.sobreMi);
      res.writeHead(200, {
        "Content-Type": "text/html",
      });
      res.end(perfilPage);
      return;
    });
  }

  if (req.url === "/agregar" && req.method === "GET") {
    const agregar = fs.readFileSync(`${__dirname}/pages/template-subir.html`);
    res.writeHead(200, { "content-type": "text/html" });
    res.end(agregar);
    return;
  }

  if (req.url === "/agregar" && req.method === "POST") {
    const formulario = new formidable.IncomingForm();

    formulario.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(500, {
          "Content-Type": "application/json",
        });
        res.end("error");
        return;
      }
      const portada = files.portada[0];
      const libro = files.libro[0];
      const tituloField = fields.titulo[0];
      const sinopsisField = fields.sinopsis[0];
      const autorField = fields.autor[0];
      const categoriaField = fields.categoria[0];
      const noPaginasField = fields.noPaginas[0];
      const fechaPublicacionField = fields.fechaPublicacion[0];
      const etiquetasField = fields.etiquetas[0];
      console.log(etiquetasField);

      const data = {
        titulo: tituloField.trim().toLowerCase(),
        sinopsis: sinopsisField.trim(),
        autor: autorField.trim(),
        categoria: categoriaField.trim(),
        noPaginas: parseInt(noPaginasField),
        fechaPublicacion: new Date(fechaPublicacionField),
        etiquetas: etiquetasField.split(" ").map((e) => e.trim()),
        portada: portada.originalFilename,
        libro: libro.originalFilename,
      };
      const oldPathPortada = portada.filepath;
      const newPathPortada = `${__dirname}/public/portadas/${portada.originalFilename}`;

      const oldPathLibro = libro.filepath;
      const newPathLibro = `${__dirname}/public/libros/${libro.originalFilename}`;

      fs.rename(oldPathPortada, newPathPortada, (fsErr) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end("error");
        }
      });
      fs.rename(oldPathLibro, newPathLibro, (fsErr) => {
        if (fsErr) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end("error");
        }
      });

      insertBook(data)
        .then(() => {
          res.writeHead(200), { "Content-Type": "application/json" };
          res.end("book inserted successfully");
          return;
        })
        .catch((err) => {
          console.log(err);
          res.writeHead(500), { "Content-Type": "application/json" };
          res.end("book not inserted not inserted");
          return;
        });
    });
  
  }

  if (req.url.includes("/libro") && req.method === 'GET') {
    const titulo = (req.url.slice(req.url.indexOf('=')+1)).replaceAll("%20", " ").toLowerCase();
    // titulo = titulo
    console.log(titulo)
    getLibro(titulo)
    .then((libro) =>
    {
      let pagina = fs.readFileSync(`${__dirname}/pages/libro-info.html`,'utf-8');
      const etiquetaTemplate = 
      `<div class="etiqueta">
        <p>%tag%</p>
       </div>`;
       const etiquetas = 
       libro.etiquetas.map(tag => (
        etiquetaTemplate.replace('%tag%',tag)
       )).join("");
       console.log(libro)
      pagina = pagina.replace('%etiquetas%',etiquetas);
      pagina = pagina.replace('%titulo%',libro.titulo.replace(libro.titulo[0],libro.titulo[0].toUpperCase()));
      pagina = pagina.replace('%noPaginas%',libro.noPaginas);
      pagina = pagina.replace('%autor%',libro.autor);
      pagina = pagina.replace('%capitulos%',libro.capitulos); 
      pagina = pagina.replace('%sinopsis%',libro.sinopsis); 
      pagina = pagina.replace('%portada%',libro.portada); 
      res.writeHead(200,{
        "Content-Type":'text/html'
      })
      res.end(pagina);
      return;
    })
  }
});

mongoose.connection.once("open", () => {
  console.log("connected to mongodb");
  server.listen(port, "127.0.0.1", () => {
    console.log(`listening in ${port}`);
  });
});
