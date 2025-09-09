import express from "express";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  { login: "admin1", senha: "1234", nome: "Julia ballmann", email: 'juliaBallman@email.com' },
  { login: "admin2", senha: "5678", nome: "Gabrielly Nascimento", email: 'gabrielly@email.com' }
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
    if (data?.login && data?.nome) {
      if (data.expiryDate && new Date() > new Date(data.expiryDate)) {
        return null;
      }

      return {
        ...data,
        lastAccess: new Date().toISOString()
      };;
    }
  } catch (error) {
    console.error('Erro ao parsear cookie:', error);
  }
  return null;
}

// função para requerir a autenticação
function requireAuth(req, res, next) {
  const user = getUserCookies(req);
  if (!user) {
    return res.redirect("/");
  }

  const cookieOptions = {
    httpOnly: true,
    signed: true,
    sameSite: "lax"
  };

  if (user.remember && user.expiryDate) {
    const expiryTime = new Date(user.expiryDate).getTime() - Date.now();
    if (expiryTime > 0) {
      cookieOptions.maxAge = expiryTime;
    }
  }

  res.cookie("auth", JSON.stringify(user), cookieOptions);
  req.user = user;
  next();
}

// Rotas
app.get("/", (req, res) => {
  const user = getUserCookies(req);
  if (user) return res.redirect("/restrito");

  res.sendFile(path.join(publicDir, "login.html"));
});

// POST - login -> valida credenciais e redireciona
app.post("/login", (req, res) => {
  const { login, senha, remember } = req.body; // <-- nome igual ao do form
  if (!login || !senha) {
    return res.status(404)
  }

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

  const now = new Date();
  const userData = {
    login: found.login,
    nome: found.nome,
    firstAccess: now.toISOString(),
    lastAccess: now.toISOString(),
    remember: !!remember
  };

  if (remember) {
    const expiryTime = 3 * 24 * 60 * 60 * 1000; // 3 dias
    cookiesOptions.maxAge = expiryTime;
    userData.expiryDate = new Date(now.getTime() + expiryTime).toISOString();
  }

  res.cookie("auth", JSON.stringify(userData), cookiesOptions);

  res.redirect("/restrito");
});

// tela de acesso restrito
app.get("/restrito", requireAuth, (req, res) => {
  const { nome, login, firstAccess, lastAccess, remember, expiryDate } = req.user;


  const cookieInfo = remember
    ? `Persistente (3 dias) - Expira: ${new Date(expiryDate).toLocaleString('pt-BR')}`
    : 'Sessão (expira ao fechar navegador)';

  res.send(`<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Área restrita</title>
</head>
<body>
  <h1>Área restrita</h1>
  <p><strong>Bem-vindo, ${nome}</strong>.</p>
  <p>Aqui estão suas informações restritas:</p>

  <p><strong>Informações do Usuário:</strong>.</p>
  <table border="1" cellpadding="5" cellspacing="0">
    <tr>
      <th>Campo</th>
      <th>Valor</th>
    </tr>
    <tr>
      <td>Nome</td>
      <td>${nome}</td>
    </tr>
    <tr>
      <td>Login</td>
      <td>${login}</td>
    </tr>
    <tr>
      <td>Primeiro acesso</td>
      <td>${new Date(firstAccess).toLocaleString()}</td>
    </tr>
    <tr>
      <td>Último acesso</td>
      <td>${new Date(lastAccess).toLocaleString()}</td>
    </tr>
  </table>

  <p><strong>Informações do Cookie:</strong></p>
  <table border="1" cellpadding="5" cellspacing="0">
    <tr>
      <th>Campo</th>
      <th>Valor</th>
    </tr>
    <tr>
      <td>Tipo</td>
      <td>${cookieInfo}</td>
    </tr>
    <tr>
      <td>Manter conectado</td>
      <td>${remember ? 'Sim' : 'Não'}</td>
    </tr>
    <tr>
      <td>Status</td>
      <td>Ativo e válido</td>
    </tr>
  </table>

  <p><a href="/logout">Sair (logout)</a></p>
</body>
</html>`);
})

app.get("/logout", (req, res) => {
  res.clearCookie("auth");
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`servidor rodando em http://localhost:${PORT}`);
});