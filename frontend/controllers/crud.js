const mongoose = require("mongoose");
const User = require("../models/users");
const Book = require("../models/books");

const getUsers = async () => {
  const usuarios = await User.find();
  return usuarios;
};

const getUser = async (user) => {
  const usuario = await User.findOne({ nombreUsuario: `${user}` });
  return usuario;
};

const insertBook = async (data) => {
  const book = new Book(data);
  return await book.save();
};

const insertUser = async (data) => {
  const user = new User(data);
  return await user.save();
};

const getLibros = async () => {
  const books = await Book.find();
  return books;
};

const getLibro = async (titulo) => {
  const book = await Book.findOne({ titulo: `${titulo}` }).populate("subidoPor");
  return book;
};

const addBook = async (idLibro, idUser) => {
  const user = await User.findById(idUser);
  if (!user) {
    throw new Error("Cant insert book");
  }
  user.librosSubidos.push(idLibro);
  return await user.save();
};

const addFav = async (idLibro, idUser) => {
  const user = await User.findById(idUser);
  if (!user) {
    throw new Error("Cant find user");
  }
  user.librosFavoritos.push(idLibro);
  return await user.save();
};

const removeFav = async (idLibro, idUser) => {
  const user = await User.findById(idUser);
  if (!user) {
    throw new Error("cant find user");
  }
  user.librosFavoritos = user.librosFavoritos.filter((libro) => idLibro.toString() !== libro.toString());
  return await user.save();
};

const toggleFav = async (idLibro, idUser) => {
  const user = await User.findById(idUser);
  if (!user) {
    throw new Error("cant find user");
  }
  const libro = user.librosFavoritos.some((libro) => idLibro.toString() === libro.toString());
  if (libro) {
    await removeFav(idLibro, idUser);
    return { favorito: false };
  } else {
    await addFav(idLibro, idUser);
    return { favorito: true };
  }
};

const isFav = async (idLibro, idUser) => {
  const user = await User.findById(idUser);
  if (!user) {
    throw new Error("cant find user");
  }
  return user.librosFavoritos.some((libro) => libro.toString() === idLibro.toString());
};
module.exports = {
  getUser,
  getUsers,
  insertBook,
  insertUser,
  getLibros,
  getLibro,
  addBook,
  addFav,
  removeFav,
  toggleFav,
  isFav,
};
