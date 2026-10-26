# Requisitos — DuoCode

## 1. Visão do Produto
O DuoCode é uma plataforma interativa, em formato de jogo, criada para ensinar programação de forma intuitiva e divertida para iniciantes[cite: 1]. O sistema diminui a barreira de entrada no mundo da tecnologia, utilizando a gamificação (progressão de níveis, desafios e recompensas) para engajar os usuários a aprenderem lógica de programação e escreverem suas primeiras linhas de código brincando[cite: 1].

## 2. Papéis de Usuário
| Papel | Descrição |
|-------|-----------|
| Estudante | Usuário iniciante que deseja aprender lógica de programação interagindo com trilhas gamificadas[cite: 1]. |
| Administrador | Responsável por adicionar, editar e monitorar os módulos, lições e exercícios do sistema[cite: 1]. |

## 3. Histórias de Usuário

### H01 — Visualização da Trilha (Essencial)
**Como** estudante, **eu quero** visualizar uma trilha sequencial de módulos **para** saber o caminho exato do meu aprendizado[cite: 1].
**Critérios de aceitação:**
- [ ] A tela inicial deve exibir os módulos em um formato de mapa ou caminho vertical[cite: 1].
- [ ] Módulos avançados devem aparecer com um ícone de cadeado (bloqueados) até que o módulo anterior seja 100% concluído[cite: 1].

### H02 — Estrutura da Lição (Essencial)
**Como** estudante, **eu quero** que cada módulo seja dividido em lições curtas **para** que eu possa aprender em pequenas etapas sem me sentir sobrecarregado[cite: 1].
**Critérios de aceitação:**
- [ ] Ao clicar em um módulo desbloqueado, o sistema deve listar de 3 a 5 lições[cite: 1].
- [ ] Uma barra de progresso deve indicar quantas lições do módulo já foram finalizadas[cite: 1].

### H03 — Exercícios de Preenchimento (Essencial)
**Como** estudante, **eu quero** resolver exercícios de múltipla escolha ou completar lacunas **para** fixar conceitos teóricos básicos[cite: 1].
**Critérios de aceitação:**
- [ ] O sistema deve validar a resposta instantaneamente ao clicar em "Verificar"[cite: 1].
- [ ] Deve exibir um feedback visual verde para acertos e vermelho para erros, mostrando a resposta correta[cite: 1].

### H04 — Execução de Código em Tempo Real (Essencial)
**Como** estudante, **eu quero** escrever e executar blocos simples de código Python no próprio aplicativo **para** testar a lógica do algoritmo na prática[cite: 1].
**Critérios de aceitação:**
- [ ] O usuário deve ter um campo de texto com syntax highlighting básico[cite: 1].
- [ ] O código enviado deve ser avaliado com base em casos de teste invisíveis, e capturar erros de sintaxe exibindo-os de forma amigável[cite: 1].

### H05 — Sistema de Ofensiva / Streak (Importante)
**Como** estudante, **eu quero** visualizar um contador de "ofensiva diária" **para** me manter motivado a programar todos os dias[cite: 1].
**Critérios de aceitação:**
- [ ] Completar pelo menos uma lição no dia incrementa a ofensiva em +1[cite: 1].
- [ ] Ficar 24 horas sem completar lições zera o contador[cite: 1].

### H06 — Sistema de Vidas (Importante)
**Como** estudante, **eu quero** ter um limite de "vidas" ao errar exercícios **para** que eu seja encorajado a prestar mais atenção na sintaxe[cite: 1].
**Critérios de aceitação:**
- [ ] O usuário inicia com 5 vidas, e cada erro subtrai 1 vida[cite: 1].
- [ ] Vidas zeradas bloqueiam novas lições até a regeneração pelo tempo ou conclusão de "lição de revisão"[cite: 1].

### H07 — Cadastro e Login (Essencial)
**Como** estudante, **eu quero** criar uma conta com e-mail e senha **para** que meu progresso fique salvo na nuvem[cite: 1].
**Critérios de aceitação:**
- [ ] Acesso restrito à trilha apenas para usuários logados[cite: 1].
- [ ] Opção de recuperação de senha[cite: 1].

### H08 — Configuração de Perfil (Desejável)
**Como** estudante, **eu quero** poder alterar meu avatar e nome de exibição **para** personalizar minha experiência na plataforma[cite: 1].
**Critérios de aceitação:**
- [ ] O usuário pode enviar uma imagem ou escolher um avatar pré-definido[cite: 1].
- [ ] O usuário pode alterar o nome exibido nas configurações[cite: 1].

## 4. Priorização de Requisitos
| Prioridade | Histórias |
|------------|-----------|
| Essencial | H01, H02, H03, H04, H07[cite: 1] |
| Importante | H05, H06[cite: 1] |
| Desejável | H08[cite: 1] |
| Fora do escopo | Ranking Global/Ligas competitivas entre amigos (Não será feito neste semestre)[cite: 1] |

## 5. Requisitos Não Funcionais
| ID | Requisito |
|----|-----------|
| RNF01 | O sistema deve validar a submissão de código (H04) em menos de 2 segundos[cite: 1]. |
| RNF02 | A interface deve ser responsiva e adaptar-se corretamente a telas de dispositivos móveis e desktops[cite: 1]. |
| RNF03 | As senhas dos usuários devem ser armazenadas no banco de dados utilizando hash com salt para garantir segurança[cite: 1]. |
