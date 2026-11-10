# ⛪ Portal Oficial — Igreja Bíblica Herdeiros de Deus

Site institucional, Feed de Publicações/Eventos e Plataforma de Cursos de Música (estilo Kiwify) da **Igreja Bíblica Herdeiros de Deus**, com design inspirado na estrutura editorial de `https://www.vitoriaemcristo.org/` e arquitetura **100% gratuita** para hospedagem e banco de dados.

## 🚀 Execução Rápida Local

```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente (caso ainda não exista .env)
cp .env.example .env

# 3. Criar as tabelas no banco local (SQLite via LibSQL em ./data/herdeiros.db)
npx drizzle-kit push

# 4. Popular dados iniciais (Admin, Professores, Aluno, Cultos, Feed e Cursos)
npm run db:seed

# 5. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`.

## 📚 Documentação Completa

Toda a documentação técnica, diagramas Mermaid, banco de dados, backend, frontend, credenciais e guia de hospedagem gratuita encontra-se na pasta [`docs/`](./docs/README.md):

- [Índice Geral da Documentação](./docs/README.md)
- [Tecnologias e Hospedagem 100% Gratuita](./docs/tecnologias-e-hospedagem-gratuita.md)
- [Diagramas de Arquitetura, ER e Fluxos](./docs/diagramas.md)
- [Estrutura do Banco de Dados](./docs/banco-de-dados.md)
- [Documentação do Backend e APIs](./docs/backend.md)
- [Documentação do Frontend e Design System](./docs/frontend.md)
- [Credenciais e Variáveis de Ambiente](./docs/credenciais.md)
- [Guia de Deploy 100% Gratuito](./docs/deploy-gratuito.md)
