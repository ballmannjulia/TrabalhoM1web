import express from "express";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
// import dotenv from "dotenv"; // não usado

const app = express();

const PORT = 3000;
const COOKIE_SECRET = "trabalhoGaby&JuliaM1";

// --- paths para servir o login.html ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ajuste o caminho conforme sua pasta real do login.html
const publicDir = path.join(__dirname, "..", "public");

// dados mocados usuarios
const users = [
  { login: "admin1", senha: "1234", nome: "Julia ballmann" },
  { login: "admin2", senha: "5678", nome: "Gabrielly Nascimento" }
];

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(COOKIE_SECRET));
app.use(express.static(publicDir));

// função get para usar o usuario cookies
function getUserCookies(req) {
  const auth = req.signedCookies?.auth;
  if (!auth) return null;
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

// Rotas
app.get("/", (req, res) => {
  const user = getUserCookies(req);
  if (user) return res.redirect("/restrito");
  // garanta que "login.html" exista em /public
  res.sendFile(path.join(publicDir, "login.html"));
});

// POST - login -> valida credenciais e redireciona
app.post("/login", (req, res) => {
  const { login, senha, remember } = req.body; // <-- nome igual ao do form

  const found = users.find((u) => u.login === login && u.senha === senha);
  if (!found) {
    // credenciais inválidas => volta ao login com ?erro=1 (opcional)
    return res.redirect("/?erro=1");
  }

  const cookiesOptions = {
    httpOnly: true,
    signed: true,
    sameSite: "lax"
  };

  if (remember) {
    cookiesOptions.maxAge = 3 * 24 * 60 * 60 * 1000; // 3 dias
  }

  res.cookie(
    "auth",
    JSON.stringify({ login: found.login, nome: found.nome }),
    cookiesOptions
  );

  res.redirect("/restrito");
});

// tela de acesso restrito
app.get("/restrito", requireAuth, (req, res) => {
  const { nome, login } = req.user;

  res.send(`<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Área restrita</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 40px auto; }
    a.button { display:inline-block; padding:10px 14px; border:1px solid #ccc; text-decoration:none; }
  </style>
</head>
<body>
  <h1>Área restrita</h1>
  <p><strong>Bem vindo, ${nome}</strong> (login: ${login}). Aqui estão suas informações restritas [...]</p>
  <p><a class="button" href="/logout">Sair (logout)</a></p>
</body>
</html>`);
});

app.get("/logout", (req, res) => {
  res.clearCookie("auth");
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`servidor rodando em http://localhost:${PORT}`);
});