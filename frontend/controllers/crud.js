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
  const book = new Book (data);
  return await book.save();
};

const insertUser = async (data) => {
  const user = new User (data);
  return await user.save();
}

const getLibros = async () => {
  const books = await Book.find();
  return books;
}

module.exports = { getUser, getUsers, insertBook, insertUser, getLibros};
