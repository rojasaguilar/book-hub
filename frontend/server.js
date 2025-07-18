const http = require("http");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/users");
const formidable = require("formidable");
const url = require("url");
const crypto = require("crypto");

const {
  getUser,
  getUsers,
  insertBook,
  insertUser,
  getLibros,
  getLibro,
  addBook,
  addFav,
  toggleFav,
  isFav,
  editProfile,
} = require("./controllers/crud.js");
const connectDB = require("./database");

connectDB();
const port = 3000;
let index = fs.readFileSync(`index.html`, "utf-8");
const cat = fs.readFileSync(`${__dirname}/assets/cat.jpg`);
const icon = fs.readFileSync(`${__dirname}/assets/book-hub.png`);
const sessiones = new Map();

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
    const cookies = getCookies(req);
    const user = sessiones.get(cookies.sessionID);
    if (!user) {
      res.writeHead(401, {
        "Content-Type": "text/html",
      });
      res.end(fs.readFileSync(`${__dirname}/pages/landingPage.html`));
      return;
    }
    getLibros().then((libros) => {
      let page = fs.readFileSync(`index.html`, "utf-8");
      const tarjetas = libros
        .map(
          (libro) =>
            `
  <div class="cont-libro">
      <a class="libro" href="/libro?titulo=${libro.titulo}">
        <div><img src="/public/portadas/${libro.portada}" alt="" /></div>
        <strong>${libro.titulo.replace(libro.titulo[0], libro.titulo[0].toUpperCase())}</strong>
        <p style="margin: 0; padding: 0">${libro.categoria}</p>
      </a>
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
    res.download;
    return;
  }

  if (req.url === "/login" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      let data = JSON.parse(body);
      getUser(data.nombreUsuario)
        .then((user) => {
          if (user.password === data.password) {
            const sessionID = crypto.randomUUID();
            sessiones.set(sessionID, user);
            res.writeHead(200, {
              "Content-Type": "application/json",
              "Set-Cookie": `sessionID=${sessionID}; HTTPOnly; Path=/`,
            });
            res.end(JSON.stringify(user));
            return;
          } else {
            res.writeHead(401, {
              "Content-Type": "application/json",
            });
            res.end(JSON.stringify({ error: "Incorrect Password" }));
            return;
          }
        })
        .catch((err) => {
          res.writeHead(501, {
            "Content-Type": "application/json",
          });
          res.end(
            JSON.stringify({
              error: `Verifica tu nombre de usuario`,
            })
          );
          return;
        });
    });
  }

  if (req.url.includes(`/leer`)) {
    // console.log("entre")
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const titulo = reqUrl.searchParams.get("titulo");
    getLibro(titulo)
      .then((libro) => {
        const stream = fs.createReadStream(`${__dirname}/public/libros/${libro.libro}`);
        res.writeHead(200, {
          "Content-Type": "application/pdf",
        });
        // res.end(fs.readFileSync(`${__dirname}/public/libros/${libro.libro}`));
        stream.pipe(res);
        return;
      })
      .catch((err) => {
        res.writeHead(300, {
          "Content-Type": "application/json",
        });
        res.end(`error`);
        return;
      });
  }

  if (req.url.includes("/descargar")) {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const titulo = reqUrl.searchParams.get("titulo");
    getLibro(titulo)
      .then((libro) => {
        res.writeHead(200, {
          "Content-Type": "application/pdf",
        });
        res.end(fs.readFileSync(`${__dirname}/public/libros/${libro.libro}`));
        return;
      })
      .catch((err) => {
        res.writeHead(300, {
          "Content-Type": "application/json",
        });
        res.end(err);
        return;
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
    addFav("6876b36c1995b8c47120fef9", "6876b9fa82943df813e1f3ec").then(() => console.log("si"));
  }

  if (req.url === "/libros") {
    getLibros()
      .then((libros) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(libros));
      })
      .catch((err) => console.error(err));
  }

  // if (req.url === "/perfil") {
  //   const perfil = fs.readFileSync(`${__dirname}/pages/template-profile.html`, "utf-8");
  //   res.writeHead(200, { "content-type": "text/html" });
  //   res.end(index.replace('<div id="main-page"></div>', perfil));
  // }

  if (req.url === "/profile") {
    const cookie = getCookies(req);
    const user = sessiones.get(cookie.sessionID);
    if (!user) {
      res.writeHead(401, {
        "Content-Type": "text/html",
      });
      res.end(fs.readFileSync(`${__dirname}/pages/landingPage.html`));
      return;
    }
    let perfilPage = fs.readFileSync(`${__dirname}/pages/template-profile.html`, "utf-8");

    getUser(user.nombreUsuario).then((usuario) => {
      perfilPage = perfilPage.replace("%correo%", usuario.email);
      perfilPage = perfilPage.replace("%nombreUsuario%", usuario.nombreUsuario);
      perfilPage = perfilPage.replace("%sobremi%", usuario.sobreMi);
      perfilPage = perfilPage.replace("%librosSubidos%", usuario.librosSubidos.length);
      perfilPage = perfilPage.replace("%favoritos%", usuario.librosFavoritos.length);
      let dia = usuario.fechaRegistro.getDate();
      const mes = months[usuario.fechaRegistro.getMonth()];
      parseInt(dia) < 10 ? `0${dia}` : dia;
      const anio = usuario.fechaRegistro.getFullYear();

      perfilPage = perfilPage.replace("%fecha%", `el ${dia} de ${mes} del ${anio}`);

      res.writeHead(200, {
        "Content-Type": "text/html",
      });
      res.end(perfilPage);
      return;
    });
  }

  if (req.url === "/agregar" && req.method === "GET") {
    const cookie = getCookies(req);
    const user = sessiones.get(cookie.sessionID);
    if (!user) {
      res.writeHead(401, {
        "Content-Type": "text/html",
      });
      res.end(fs.readFileSync(`${__dirname}/pages/landingPage.html`));
      return;
    }

    const agregar = fs.readFileSync(`${__dirname}/pages/template-subir.html`);
    res.writeHead(200, { "content-type": "text/html" });
    res.end(agregar);
    return;
  }

  if (req.url === "/agregar" && req.method === "POST") {
    const cookie = getCookies(req);
    const user = sessiones.get(cookie.sessionID);
    if (!user) {
      res.writeHead(401, {
        "Content-Type": "text/html",
      });
      res.end(fs.readFileSync(`${__dirname}/pages/landingPage.html`));
      return;
    }

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
      const capitulosField = fields.capitulos[0];
      const fechaPublicacionField = fields.fechaPublicacion[0];
      const etiquetasField = fields.etiquetas[0];

      const data = {
        titulo: tituloField.trim().toLowerCase(),
        sinopsis: sinopsisField.trim(),
        autor: autorField.trim(),
        categoria: categoriaField.trim(),
        noPaginas: parseInt(noPaginasField),
        capitulos: parseInt(capitulosField),
        fechaPublicacion: new Date(fechaPublicacionField),
        etiquetas: etiquetasField.split(" ").map((e) => e.trim()),
        portada: portada.originalFilename,
        libro: libro.originalFilename,
        subidoPor: user._id,
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
        .then((libro) => {
          addBook(libro._id, user._id)
            .then(() => console.log("yes"))
            .catch((err) => console.log(err));
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end("book inserted successfully");
          return;
        })
        .catch((err) => {
          console.log(err);
          res.writeHead(500), { "Content-Type": "application/json" };
          res.end(`${err}`);
          return;
        });
    });
  }

  if (req.url.includes("/libro") && req.method === "GET") {
    const cookie = getCookies(req);
    const user = sessiones.get(cookie.sessionID);
    if (!user) {
      res.writeHead(401, {
        "Content-Type": "text/html",
      });
      res.end(fs.readFileSync(`${__dirname}/pages/landingPage.html`));
      return;
    }
    const titulo = req.url
      .slice(req.url.indexOf("=") + 1)
      .replaceAll("%20", " ")
      .toLowerCase();

    getLibro(titulo).then((libro) => {
      let pagina = fs.readFileSync(`${__dirname}/pages/libro-info.html`, "utf-8");
      const etiquetaTemplate = `<div class="etiqueta">
        <p>%tag%</p>
       </div>`;
      const etiquetas = libro.etiquetas.map((tag) => etiquetaTemplate.replace("%tag%", tag)).join("");
      pagina = pagina.replace("%etiquetas%", etiquetas);
      pagina = pagina.replace("%titulo%", libro.titulo.replace(libro.titulo[0], libro.titulo[0].toUpperCase()));
      pagina = pagina.replace("%noPaginas%", libro.noPaginas);
      pagina = pagina.replace("%autor%", libro.autor);
      pagina = pagina.replace("%capitulos%", libro.capitulos);
      pagina = pagina.replace("%sinopsis%", libro.sinopsis);
      pagina = pagina.replace("%portada%", libro.portada);
      pagina = pagina.replace("%nombre%", libro.subidoPor.nombreUsuario);
      res.writeHead(200, {
        "Content-Type": "text/html",
      });
      res.end(pagina);
      return;
    });
  }
  //PARA VERIFICAR SI ESTA EN FAVORITO. PRUEBA
  if (req.url.includes("/isFav")) {
    const cookie = getCookies(req);
    const user = sessiones.get(cookie.sessionID);
    if (!user) {
      res.writeHead(401, {
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify({ error: "Not signed in" }));
      return;
    }

    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const titulo = reqUrl.searchParams.get("titulo");
    getLibro(titulo).then(async (libro) => {
      const response = await isFav(libro._id, user._id);
      if (response) {
        res.writeHead(200, {
          "Content-Type": "application/json",
        });
        res.end(JSON.stringify({ favorito: true }));
        return;
      }
      res.writeHead(200, {
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify({ favorito: false }));
      return;
    });
  }

  if (req.url.includes("/favorito") && req.method === "GET") {
    const cookie = getCookies(req);
    const user = sessiones.get(cookie.sessionID);
    if (!user) {
      res.writeHead(401, {
        "Content-Type": "text/html",
      });
      res.end(fs.readFileSync(`${__dirname}/pages/landingPage.html`));
      return;
    }
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const titulo = reqUrl.searchParams.get("titulo");
    getLibro(titulo).then(async (libro) => {
      toggleFav(libro._id, user._id).then((response) => {
        if (response) {
          res.writeHead(200, {
            "Content-Type": "application/json",
          });
          res.end(JSON.stringify(response));
          return;
        } else {
          res.writeHead(500, {
            "Content-Type": "application/json",
          });
          res.end(JSON.stringify({ error: "No se pudo toggle" }));
          return;
        }
      });
    });
  }

  if (req.url.includes("/editar") && req.method === "POST") {
    const cookie = getCookies(req);
    const user = sessiones.get(cookie.sessionID);

    if (!user) {
      res.writeHead(401, {
        "Content-Type": "text/html",
      });
      res.end(fs.readFileSync(`${$__dirname}/pages/landingPage.html`, "utf-8"));
      return;
    }
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      body = JSON.parse(body);
      editProfile(user._id, body)
        .then(() => {
          res.writeHead(200, {
            "Content-Type": "application/json",
          });
          res.end(JSON.stringify({ updated: true }));
          return;
        })
        .catch((err) => {
          console.log(err)
          res.writeHead(500, {
            "Content-Type": "application/json",
          });
          res.end(JSON.stringify({ updated: false }));
          return;
        });
    });

    //PETICION PARA EDTIAR USUARIO
  }
});

function getCookies(req) {
  const cookies = {};
  const raw = req.headers.cookie;
  if (!raw) return cookies;
  const [key, value] = raw.trim().split("=");
  cookies[key] = value;

  return cookies;
}

// function dateDiffDays(a,b){
//   const ms_per_day = 1000 * 60 * 60 * 24;
//   let dif = Math.floor((a-b)/ms_per_day);
//   return haceCuanto(dif);
// }

// function haceCuanto(dif){
//   const month = new Date().getMonth();
//   let daysOfMonth = months[month];
//   if(dif < daysOfMonth)return `hace ${dif} días`;
//   if(dif === daysOfMonth)return `hace 1 mes`;
//   while(dif<daysOfMonth){
//     dif = daysOfMonth - dif;

//   }

// }

const DayOfMonths = {
  0: 31,
  1: new Date().getFullYear() % 4 ? 29 : 28,
  2: 31,
  3: 30,
  4: 31,
  5: 30,
  6: 31,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 31,
};

const months = {
  0: "enero",
  1: "febrero",
  2: "marzo",
  3: "abril",
  4: "mayo",
  5: "junio",
  6: "julio",
  7: "agosto",
  8: "septiembre",
  9: "octubre",
  10: "noviembre",
  11: "diciembre",
};

mongoose.connection.once("open", () => {
  console.log("connected to mongodb");
  server.listen(port, "127.0.0.1", () => {
    console.log(`listening in ${port}`);
  });
});
