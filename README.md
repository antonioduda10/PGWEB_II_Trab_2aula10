# Daily Diet — Projeto Fullstack (Node.js + React)
# Projeto do Aluno: Antônio Duda Oliveira da Silva - UNITINS - polo - Sítio Novo - TADS III - 4º período

Aplicação para controle de refeições por usuário:

- `server/` — API em Node + Express
- `web/` — Front-end em React (Vite)

## Observação importante sobre ordem de inicialização

Sempre inicie primeiro o backend (API) e depois o frontend (Vite). Motivo:

- O front em desenvolvimento (Vite) usa um proxy para encaminhar chamadas `/api` para o backend em `http://localhost:3333`.
- Se o backend não estiver rodando, as requisições ao `/api` falharão (ex.: erro de proxy ECONNREFUSED).

Ordem recomendada (Windows - cmd.exe):

1) Inicie o backend (API):

```cmd
"Caminho do projeto dentro da pasta, server"
npm install
npm run dev
```

2) Em outro terminal, inicie o frontend (Vite):

```cmd
"Caminho do projeto dentro da pasta, web"
npm install
npm run dev
```

Agora abra a URL do Vite (ex.: `http://localhost:5173`) para acessar a aplicação em modo de desenvolvimento.

## Build e servir a aplicação pelo backend (opcional)

Acessar a UI pelo mesmo host do backend (ex.: `http://localhost:3333`), gere o build do frontend e reinicie o servidor para que ele sirva os arquivos estáticos:

```cmd
"Caminho do projeto dentro da pasta, web"
npm install
npm run build
```

```cmd
"Caminho do projeto dentro da pasta, server"
npm run dev
```

Após isso, abra `http://localhost:3333` — o servidor servirá o `index.html` do build se o diretório `web/dist` estiver presente.

## Estrutura resumida

```
proj2_Aula10/
  server/   # API Express
  web/      # React + Vite
```

## Dica rápida

Base teórica consultada:   

```

## Endpoints administrativos (admin)

Observação: todas as rotas abaixo que começam com `/api/admin` exigem que o request contenha o header `x-user-id` com o id de um usuário que tenha `isAdmin: true` no banco (`server/db.json`). Em modo de desenvolvimento o frontend adiciona esse header a partir de `localStorage.getItem('dd:userId')`.

Principais endpoints:

- GET /api/admin/me
  - Retorna o usuário identificado (útil para saber se o header corresponde a um admin). Ex.: `{ id, name, email, createdAt, isAdmin }`

- GET /api/admin/users
  - Lista todos os usuários. A resposta inclui `mealsCount` (número de refeições por usuário).

- GET /api/admin/users/:id
  - Retorna os dados de um usuário específico.

- POST /api/admin/users
  - Cria um usuário (idempotente por email). Body: `{ name, email, isAdmin }`.

- PUT /api/admin/users/:id
  - Atualiza um usuário. Body pode incluir `{ name, email, isAdmin }`.

- DELETE /api/admin/users/:id
  - Exclui um usuário. Regras importantes:
    - Um administrador NÃO pode apagar outro administrador (retorna 403).
    - Um usuário só pode ser apagado se não tiver refeições; caso existam refeições, a rota retorna 400 com instrução para apagar as refeições primeiro.

- GET /api/admin/users/:id/meals
  - Lista as refeições do usuário (ordenadas por data/hora desc).

- DELETE /api/admin/users/:id/meals
  - Apaga todas as refeições do usuário. Retorna `{ ok: true, removedMeals: N }`.

- POST /api/admin/users/:id/meals
  - Cria uma refeição para um usuário. Body: `{ name, dateTime (ISO), inDiet (boolean), description? }`.

- PUT /api/admin/meals/:id
  - Edita uma refeição por id (admin).

- DELETE /api/admin/meals/:id
  - Apaga uma refeição por id (admin).

Dev helper (apenas em desenvolvimento):
- POST /api/__create-admin
  - Cria ou promove um usuário a administrador. Só funciona quando `NODE_ENV !== 'production'`.
```

Exemplos curl (Windows cmd.exe)

1) Verificar se o header corresponde a um admin:
```cmd
curl -H "x-user-id: O208iyJPsABr" http://127.0.0.1:3333/api/admin/me
```

2) Listar usuários com contagem de refeições:
```cmd
curl -H "x-user-id: O208iyJPsABr" http://127.0.0.1:3333/api/admin/users
```

3) Listar refeições de um usuário:
```cmd
curl -H "x-user-id: O208iyJPsABr" http://127.0.0.1:3333/api/admin/users/fhpldEJRe_9a/meals
```

4) Apagar todas as refeições de um usuário (após confirmar que é o que deseja):
```cmd
curl -X DELETE -H "x-user-id: O208iyJPsABr" http://127.0.0.1:3333/api/admin/users/fhpldEJRe_9a/meals
```

5) Tentar apagar um usuário (falhará com 400 se houver refeições; falhará com 403 se o alvo for admin):
```cmd
curl -X DELETE -H "x-user-id: O208iyJPsABr" http://127.0.0.1:3333/api/admin/users/fhpldEJRe_9a
```

Aplicação completa para controle de refeições por usuário. Código limpo e mínimo, conforme arquivo de solicitação.

## Estrutura
```
daily-diet/
  server/   # API (Express)
  web/      # React + Vite
```
### Rodando
```bash
# API
cd server && npm install && npm run dev
# Web
cd ../web && npm install && npm run dev
```