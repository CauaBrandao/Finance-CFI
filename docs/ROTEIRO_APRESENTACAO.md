# Roteiro de Apresentação — CFI Finance (10 a 15 minutos)

> **Objetivo da apresentação:** Demonstrar o **CFI Finance — Inteligência Financeira Pessoal** como uma aplicação web Full Stack integrada a uma IA Generativa (**Google Gemini**) na categoria **Classificação / Análise**, com foco em arquitetura, separação determinística, segurança, resiliência e preparação para produção.

---

## Estrutura de Tempo (13–15 minutos)

| Bloco | Duração | Foco |
| --- | --- | --- |
| 1. Problema, Solução e Categoria | 2 min | Contexto, público e por que não é um chatbot |
| 2. Arquitetura, Fluxo e Engenharia de Prompt | 3 min | React → Spring Boot → Cálculos → Gemini → JSON |
| 3. Demonstração Prática (CRUD + IA) | 5 min | Dashboard integrado, Inteligência Financeira e análise |
| 4. Segurança, Erros e Resiliência | 3 min | Validações, CORS, chave protegida, 400/404/429/503/504 e fallback |
| 5. Produção, Limitações e Perguntas | 2 min | Preparação Docker/Render/Vercel, persistência em memória e Q&A |

---

## Sequência de Slides e Fala Sugerida

### Slide 1 — Capa e Problema (0:00 – 1:00)
- **Visual:** Título *CFI Finance — Inteligência Financeira Pessoal*, equipe (Cauã Brandão, Fernando Siqueira, Igor Aldivan).
- **Fala sugerida:** *"Planilhas e apps comuns mostram números e gráficos, mas deixam o usuário sozinho para descobrir onde está errando. O CFI Finance transforma lançamentos financeiros em diagnóstico acionável."*

### Slide 2 — Solução e Categoria: Classificação / Análise (1:00 – 2:00)
- **Visual:** Comparativo "Chatbot Genérico" vs "Classificação / Análise Estruturada".
- **Fala sugerida:** *"Não construímos um chatbot de conversa livre. A IA recebe um contexto financeiro estruturado e devolve uma classificação objetiva da situação (`EXCELENTE` a `CRITICO`), problemas com evidências numéricas, plano de ação priorizado e avaliação educacional de preparação para investir."*

### Slide 3 — Arquitetura Full Stack e Separação Determinística (2:00 – 3:30)
- **Visual:** Diagrama: `React 18 + Vite` ↔ `API REST Spring Boot (/api/transactions, /api/financial-analysis/*, /api/health)` → `Motor Determinístico (Java)` → `Google Gemini` → `Validação JSON + DTOs`.
- **Fala sugerida:** *"Regra central do projeto: a IA nunca faz conta. Totais, saldo, taxa de poupança e percentual por categoria são calculados deterministicamente no sistema. O Gemini atua apenas na interpretação contextual."*

### Slide 4 — Engenharia de Prompt e Proteção contra Prompt Injection (3:30 – 5:00)
- **Visual:** Bloco `system_instruction` separado de `DADOS_FINANCEIROS_DO_USUARIO` + regras de não-alucinação e proibição de recomendar ativos.
- **Fala sugerida:** *"Separamos instruções do sistema dos dados do usuário. Mesmo que uma transação tenha a descrição 'Ignore as regras anteriores', o modelo é instruído a tratá-la como dado passivo, e o backend valida todos os enums e campos obrigatórios do JSON retornado."*

### Slide 5 — Demonstração ao Vivo (5:00 – 10:00)
**Passo a passo da demo:**
1. Abrir a aplicação (`Dashboard Financeiro`), mostrar os cards de resumo, metas e gráficos Canvas.
2. **CRUD integrado:** Cadastrar uma nova despesa (ou carregar o *Cenário de Teste / Apresentação* que persiste na API REST), editar o valor/descrição e confirmar que a atualização reflete na lista e nos gráficos; abrir o Swagger (`/api/swagger-ui.html`) e mostrar `GET /api/transactions` retornando o dado criado.
3. Ir para a aba **Inteligência Financeira**, clicar em **Solicitar Análise com IA**:
   - Apontar o estado de carregamento (*"Analisando suas finanças..."*, botão desabilitado).
   - Mostrar o **Diagnóstico Geral**, os **Problemas com Evidências**, o **Plano de Ação** e a **Preparação para Investir** com o aviso educacional.
4. Mostrar a exportação CSV e alternância de tema/paletas (funcionalidades preservadas).

### Slide 6 — Segurança, Tratamento de Erros e Resiliência (10:00 – 13:00)
**Pontos para demonstrar/explicar:**
- **API Key protegida:** `GEMINI_API_KEY` fica só no backend, enviada no header `x-goog-api-key` (nunca no frontend nem no Git).
- **CORS e Ambiente:** `VITE_API_URL` sem fallback para `localhost` em produção; perfil `prod` bloqueia origens `localhost` no CORS.
- **Demo de erro controlada:**
  - Tentar enviar formulário vazio/inválido no frontend (validação inline) e enviar payload inválido no Swagger (`POST /api/transactions` -> `400 VALIDATION_FAILED` estruturado).
  - Consultar ID inexistente (`GET /api/transactions/id-inexistente` -> `404 RESOURCE_NOT_FOUND`).
  - Explicar o tratamento de `429` (Rate Limit), `503` (IA indisponível), `504` (Timeout 35s) e o **fallback determinístico offline** quando não há chave configurada ou há falha de schema.

### Slide 7 — Testes, Preparação para Produção e Limitações (13:00 – 15:00)
- **Visual:** Resumo real dos testes (`35` testes JUnit/MockMvc no backend + `11` testes `node --test` no frontend), `Dockerfile`, `render.yaml`, `vercel.json`, `/api/health`.
- **Fala sugerida (transparente):** *"O projeto está empacotado com Docker, perfil de produção e health check `/api/health`. Como limitação conhecida e documentada, a persistência de transações no backend é em memória (`LinkedHashMap` sincronizado) por escopo mínimo sem banco externo; metas e preferências ficam no `localStorage`. Obrigado, abrimos para perguntas."*
