import express from "express";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const app = express();

const PORT = 3000;
const COOKIE_SECRET =  "trabalhoGaby&JuliaM1";

//dados mocados usuarios
const users = [
    {login:"admin1", senha:"1234",nome:"Julia ballmann"},
    {login:"admin2", senha:"5678", nome:"Gabrielly Nascimento"}
]


// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(COOKIE_SECRET));           
app.use(express.static(publicDir)); 

// função get para usar o usuario cookies
function getUserCookies(req) {
    const auth = req.signedCookies?.auth;
    if(!auth) return null;
    try {
        const data = JSON.parse(auth);
        if (data?.login && data?.nome) return data;
    } catch (_) {}
  return null;
}

// função para requerir a autenticação
function requireAuth(req, res, next) {
  const user = getUserCookies(req);
  if (!user) {
    return res.redirect("/");
  }
  req.user = user;
  next();
}