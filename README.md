Trabalho M1 – Programação Web (Node.js + Express)

Backend simples com autenticação via cookies assinados para atender os requisitos do trabalho:

(a) Tela de login (arquivo HTML).

(b) Tela de acesso restrito (HTML gerado pelo backend).

(c) Ponto de acesso inicial “/”.

(d) Logout limpando o cookie.

“Manter conectado”: se marcado, o cookie dura 3 dias e o usuário pula o login ao reabrir a app.

Requisitos

Node.js ≥ 18 (testado também com 20+).

npm (vem com o Node).

Não é necessário .env. O segredo do cookie está fixo no código:
COOKIE_SECRET = "trabalhoGaby&JuliaM1".

Estrutura de pastas (recomendada)
TrabalhoM1web/
├─ package.json
├─ package-lock.json
├─ src/
│  └─ server.js
└─ public/
   └─ login.html


O servidor lê public/login.html para a tela de login e gera via backend a página de acesso restrito.

Instalar e rodar

Na raiz do projeto (onde está o package.json):

# 1) Instalar dependências
npm install

# 2) Rodar em modo desenvolvimento (com auto-reload)
npm run dev

# 3) Rodar em modo normal
npm start


Abra: http://localhost:3000

Scripts do npm

npm run dev → nodemon src/server.js

npm start → node src/server.js

Execute sempre os scripts na raiz do projeto (mesma pasta do package.json).
Rodar scripts dentro de subpastas pode causar erros.

Como funciona

GET / → Renderiza a tela de login (public/login.html).
Se já houver cookie válido, redireciona para /restrito.

POST /login → Valida login e senha.
Se marcar “Manter conectado”, cria cookie com Max-Age = 3 dias.
Em caso de falha, redireciona para /?erro=1.

GET /restrito → Requer autenticação. Exibe:
“Bem vindo, <nome> … Aqui estão suas informações restritas […]” + link de logout.

GET /logout → Limpa o cookie e volta para /.

Usuários de exemplo (mock):

admin1 / 1234 → “Julia ballmann”

admin2 / 5678 → “Gabrielly Nascimento”

Teste rápido (manual)

Acesse http://localhost:3000/ → deve ver a tela de login.

Tente credenciais erradas → volta ao login.

Faça login certo → vai para /restrito.

Marque “Manter conectado” e faça login → feche/reabra o navegador, volte a / → deve cair direto em /restrito.

Clique em Logout → volta ao login e remove o cookie.

Solução de problemas

“Missing script: dev”
Você está na pasta errada. Rode npm run dev na raiz, onde está o package.json com os scripts.
Cheque com:

npm pkg get scripts


Deve retornar {"start":"node src/server.js","dev":"nodemon src/server.js"}.

“nodemon: not found”
Rode npm install na raiz. Alternativa: npx nodemon src/server.js ou apenas npm start.

“MODULE_NOT_FOUND: …/src/server.js”
O caminho do script não bate com sua estrutura.
Garanta que existe src/server.js e que os scripts no package.json apontam para ele.

Login não abre / 404 no login
Verifique se public/login.html existe e se o caminho no server.js para a pasta public está correto.

Observações

O projeto é didático (sem banco de dados, sem hash de senha).

Cookies usam httpOnly, sameSite=lax e assinatura com cookie-parser.

Se tiver dúvidas de execução, verifique primeiro se está rodando na raiz do projeto e se a estrutura de pastas corresponde ao que está acima.