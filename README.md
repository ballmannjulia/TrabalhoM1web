# Trabalho M1 – Programação Web (Node.js + Express)

Backend simples com autenticação via cookies assinados desenvolvido para atender aos requisitos do trabalho:

- **(a)** Tela de login (arquivo HTML)
- **(b)** Tela de acesso restrito (HTML gerado pelo backend)  
- **(c)** Ponto de acesso inicial "/"
- **(d)** Logout limpando o cookie

**Funcionalidade "Manter conectado":** Se marcado, o cookie dura 3 dias e o usuário pula o login ao reabrir a aplicação.

## 📋 Requisitos

- **Node.js** ≥ 18 (testado também com 20+)
- **npm** (vem com o Node.js)
- Não é necessário arquivo `.env`
- O segredo do cookie está fixo no código: `COOKIE_SECRET = "trabalhoGaby&JuliaM1"`

## 📁 Estrutura de Pastas (Recomendada)

```
TrabalhoM1web/
├── package.json
├── package-lock.json
├── src/
│   └── server.js
└── public/
    └── login.html
```

> O servidor lê `public/login.html` para a tela de login e gera via backend a página de acesso restrito.

## 🚀 Instalar e Rodar

Na raiz do projeto (onde está o `package.json`):

```bash
# 1) Instalar dependências
npm install

# 2) Rodar em modo desenvolvimento (com auto-reload)
npm run dev

# 3) Rodar em modo normal
npm start
```

**Abra:** `http://localhost:3000`

### Scripts do npm
- `npm run dev` → `nodemon src/server.js`
- `npm start` → `node src/server.js`

⚠️ **Execute sempre os scripts na raiz do projeto** (mesma pasta do `package.json`). Rodar scripts dentro de subpastas pode causar erros.

## 🔧 Como Funciona

| Rota | Método | Descrição |
|------|--------|-----------|
| `/` | GET | Renderiza a tela de login (`public/login.html`). Se já houver cookie válido, redireciona para `/restrito` |
| `/login` | POST | Valida login e senha. Se marcar "Manter conectado", cria cookie com Max-Age = 3 dias. Em caso de falha, redireciona para `/?erro=1` |
| `/restrito` | GET | Requer autenticação. Exibe: *"Bem vindo, \<nome\> … Aqui estão suas informações restritas […]"* + link de logout |
| `/logout` | GET | Limpa o cookie e volta para `/` |

## 👥 Usuários de Exemplo (Mock)

| Login | Senha | Nome |
|-------|-------|------|
| admin1 | 1234 | Julia Ballmann |
| admin2 | 5678 | Gabrielly Nascimento |

## 🧪 Teste Rápido (Manual)

1. Acesse `http://localhost:3000/` → deve ver a tela de login
2. Tente credenciais erradas → volta ao login  
3. Faça login correto → vai para `/restrito`
4. Marque "Manter conectado" e faça login → feche/reabra o navegador, volte a `/` → deve cair direto em `/restrito`
5. Clique em **Logout** → volta ao login e remove o cookie

## 🔐 Detalhes Técnicos

### Tipos de Cookie
- **Cookie de Sessão** (sem "manter conectado"): Expira ao fechar o navegador
- **Cookie Persistente** (com "manter conectado"): Dura 3 dias, persiste mesmo fechando o navegador

### Segurança Implementada
- Cookies `httpOnly` (não acessível via JavaScript)
- Cookies `sameSite=lax` (proteção CSRF)
- Cookies assinados com `cookie-parser`
- Validação de expiração automática

### Estrutura do Cookie
```javascript
{
  login: "admin1",
  nome: "Julia Ballmann",
  email: "julia@email.com", 
  firstAccess: "2024-01-15T10:30:00.000Z",
  lastAccess: "2024-01-15T14:25:00.000Z",
  remember: true,
  expiryDate: "2024-01-18T10:30:00.000Z"
}
```

## Solução de Problemas

### `"Missing script: dev"`
- **Causa:** Você está na pasta errada
- **Solução:** Rode `npm run dev` na raiz, onde está o `package.json` com os scripts
- **Verificar:** `npm pkg get scripts` deve retornar:
  ```json
  {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
  ```

### `"nodemon: not found"`
- **Solução:** Rode `npm install` na raiz
- **Alternativa:** `npx nodemon src/server.js` ou apenas `npm start`

### `"MODULE_NOT_FOUND: …/src/server.js"`
- **Causa:** O caminho do script não bate com sua estrutura
- **Solução:** Garanta que existe `src/server.js` e que os scripts no `package.json` apontam para ele

### Login não abre / 404 no login
- **Verificar:** Se `public/login.html` existe
- **Verificar:** Se o caminho no `server.js` para a pasta public está correto

##  Observações

- O projeto é **didático** (sem banco de dados, sem hash de senha)
- Cookies usam `httpOnly`, `sameSite=lax` e assinatura com `cookie-parser`
- **Sistema educacional** - NÃO usar em produção
- Senhas em texto plano apenas para fins didáticos

Se tiver dúvidas de execução, verifique primeiro se está rodando na **raiz do projeto** e se a estrutura de pastas corresponde ao especificado acima.

---

## 📝 Autores
- **Gabrielly Oliveira Nascimento**
- **Julia Ballmann**

**Trabalho M1 - Programação Web*