# DuoCode 🎮💻

## 💡 Ideia Geral do Projeto
O DuoCode é uma plataforma interativa, em formato de "joguinho", criada para ensinar programação de forma intuitiva e divertida para iniciantes. A ideia principal é diminuir a barreira de entrada no mundo da tecnologia, utilizando a gamificação (como progressão de níveis, desafios rápidos e recompensas) para engajar os usuários a aprenderem lógica de programação e escreverem suas primeiras linhas de código brincando.

## ⚙️ Descrição Geral do Sistema
O sistema funciona como um ambiente de aprendizado prático e contínuo. Ele possui uma interface amigável onde o usuário interage com desafios de programação de dificuldade progressiva. As principais características do sistema incluem:
* **Trilhas de Aprendizado:** Fases e módulos que guiam o usuário desde os conceitos mais básicos (variáveis e laços de repetição) até lógicas mais complexas.
* **Feedback em Tempo Real:** Validação imediata do código ou da resposta fornecida pelo jogador a cada desafio.
* **Sistema de Gamificação:** Pontuações, desbloqueio de novas fases e acompanhamento do progresso (níveis/experiência) para manter a motivação do aluno.
* **Perfil de Usuário:** Uma área dedicada para que o jogador acompanhe seu histórico, conquistas e estatísticas de aprendizado.

## 👥 Integrantes da Equipe
* Bernardo Fernandes Costa
* Fernanda Alves Andrade
* Maria Paula Miranda de Souza Montovani Gasparini
* Vitor de Sousa Costa Lopes

## 📋 Organização e Acompanhamento
O gerenciamento das tarefas, sprints e do fluxo de desenvolvimento do DuoCode está sendo feito através da metodologia ágil.
🔗 **Acessar o Quadro Kanban do Projeto:** [GitHub Projects - DuoCode](https://github.com/users/BernardoFernandesCosta/projects/2)

---

## 🚀 Como Executar o Projeto

O projeto está dividido em Frontend (React/Vite) e Backend (Python/FastAPI). Você pode executá-lo de forma simplificada via Docker ou iniciar cada serviço localmente.

### Opção 1: Executando com Docker (Recomendado)
Certifique-se de ter o Docker e o docker-compose instalados. Na raiz do projeto, execute:
`docker-compose up --build`

* **Frontend:** Acesse `http://localhost:5173`
* **Backend (Healthcheck):** Acesse `http://localhost:8000/healthcheck`

### Opção 2: Executando Localmente

**Frontend (Requer Node.js e Yarn):**
`cd frontend`
`yarn install`
`yarn dev`

**Backend (Requer Python 3.11+):**
`cd backend`
`python3 -m venv venv`
`source venv/bin/activate`
`pip install -r requirements.txt`
`uvicorn main:app --reload`

---

## 🛠️ Comandos de Qualidade de Código (Linters e Formatadores)

Para garantir a padronização do código entre os membros da equipe, utilizamos ferramentas de análise estática e formatação.

**Frontend (React/Javascript):**
* Formatar código (Prettier): `yarn prettier --write src/`
* Analisar código (ESLint): `yarn lint`

**Backend (Python):**
* Formatar código (Black): `black .`
* Analisar código (Ruff): `ruff check .`
