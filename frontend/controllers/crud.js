const mongoose = require("mongoose");
const User = require("../models/users");
const Book = require("../models/books");

const getUsers = async () => {
  const usuarios = await User.find();
  return usuarios;
};

const getUser = async (name) => {
  const usuarios = await User.findOne({ name: `${name}` });
  return usuarios;
};

const insertBook = async (data) => {
  const book = new Book (data);
  return await book.save();
};

const insertUser = async (data) => {
  const user = new User (data);
  return await user.save();
}

module.exports = { getUser, getUsers, insertBook, insertUser};
