import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/users.js";

export const createUser = async (req, res) => {
  const { name, email, date, password } = req.body;
  bcrypt.hash(password, 10, function (err, hash) {
    console.log(hash);
    const newUser = new User({ name, email, date, password: hash });
    newUser.save();
  });
};

export const findUser = async (req, res) => {
  const { email, password } = req.body;
  const authenticate = { authenticate: false, name: "" };
  const user = User.find({ email }, function (err, foundUser) {
    if (err) {
      console.log(err);
    }
    if (foundUser) {
      bcrypt.compare(password, foundUser[0].password).then(function (result) {
        authenticate.authenticate = result;
        authenticate.name = foundUser[0].name;
        res.send(authenticate);
      });
    }
  });
};
