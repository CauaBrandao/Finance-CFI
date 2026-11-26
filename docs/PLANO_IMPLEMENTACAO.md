# Plano de Implementação — CFI Finance

## Visão Geral
Este plano prioriza as correções e integrações identificadas na auditoria real do repositório (`docs/MATRIZ_REQUISITOS.md`), preservando integralmente a identidade visual e as funcionalidades existentes do **CFI Finance**.

---

## Etapas Priorizadas

### Etapa 1 — Segurança, Ambiente e Comunicação (Frontend/Backend)
- **Prioridade:** Crítica (bloqueador para produção)
- **Dependências:** Nenhuma
- **Escopo:**
  - `frontend/src/services/api.js`: remover fallback para `http://localhost:8080/api`; exigir `VITE_API_URL` em produção (`import.meta.env.PROD`) e manter `/api` via proxy Vite em desenvolvimento (`import.meta.env.DEV`); aumentar timeout padrão (`40000ms`) para respeitar os `35s` do Gemini no backend; melhorar classificação de erros de rede/HTTP.
  - `frontend/src/components/intelligence/FinancialIntelligence.jsx`: remover referências hardcoded a `localhost:8080` e `mvn spring-boot:run` na UI de erro; evitar exposição de detalhes técnicos internos.
  - `backend/src/main/java/com/cfi/finance/config/CorsConfig.java`: adicionar flag `cors.allow-local-dev` (default `true` em dev, `false` no perfil `prod`) para não liberar `localhost`/`127.0.0.1` em produção.
  - `backend/src/main/java/com/cfi/finance/client/GeminiClient.java`: enviar `GEMINI_API_KEY` via header `x-goog-api-key` em vez de query string `?key=`.
- **Riscos:** Quebra de comunicação local caso `.env` ou proxy não estejam alinhados; mitigado mantendo proxy `/api` no Vite em `DEV`.
- **Critérios de aceite:** Build de produção (`frontend/dist`) sem nenhuma ocorrência de `localhost`; teste de CORS validando bloqueio de `localhost` quando `cors.allow-local-dev=false`.

### Etapa 2 — Integração Full Stack do CRUD de Transações
- **Prioridade:** Crítica
- **Dependências:** Etapa 1
- **Escopo:**
  - **Decisão arquitetural sobre persistência:** Avaliadas 3 opções: (1) manter `ConcurrentHashMap` em memória no backend como fonte única para transações; (2) persistência em arquivo/H2 local; (3) banco externo (PostgreSQL). Por restrição de escopo mínimo e ausência de autorização para introduzir banco/serviço externo, mantém-se `ConcurrentHashMap` no backend como fonte única de verdade para transações, eliminando a duplicidade com `localStorage` para transações (preservando `localStorage` apenas para metas, tema, paleta e cache visual de última análise) e documentando explicitamente a volatilidade em reinicializações.
  - `backend/src/main/java/com/cfi/finance/service/TransactionService.java`: preservar ordem determinística (ex.: `ConcurrentHashMap` + ordenação por data/criação ou `Collections.synchronizedMap(new LinkedHashMap<>())`) e garantir data padrão em criação/atualização quando aplicável.
  - `frontend/src/services/transactionService.js`: implementar `fetchTransactions()`, `createTransaction(data)`, `updateTransaction(id, data)`, `deleteTransaction(id)` chamando `/transactions` na API REST; remover persistência duplicada de transações em `localStorage`.
  - `frontend/src/App.jsx`: carregar transações da API na inicialização com estado de `loading`, `error` e ação de reconexão/tentar novamente; conectar criação, edição, exclusão e carregamento do cenário de demonstração à API REST, mantendo atualização imediata de dashboard, metas, gráficos e CSV.
- **Riscos:** Backend offline impedir uso inicial do dashboard; mitigado com banner claro de indisponibilidade e botão "Tentar Novamente", além de não apagar dados por falha silenciosa.
- **Critérios de aceite:** Todas as operações CRUD refletem na API REST (`GET`, `POST`, `PUT`, `DELETE`); recarregar a página mantém os dados vindos do backend; falha na API exibe erro amigável sem corromper estado local.

### Etapa 3 — Alinhamento de Validações e UX
- **Prioridade:** Alta
- **Dependências:** Etapa 2
- **Escopo:**
  - Backend: reforçar `TransactionDTO` (limite máximo de valor, validação de formato de data ISO `YYYY-MM-DD` quando informada, trim/sanitização) e `FinancialContextDTO` (`@DecimalMin("0.00")` em receita/despesa, limites de tamanho em `periodo` e `ultimasTransacoes`).
  - Frontend: adicionar validação explícita com mensagens inline em `TransactionForm.jsx`, `GoalsSection.jsx` e `InvestmentGoalSection.jsx`; impedir envio duplicado (`isSubmitting`, `isDeleting`) durante chamadas assíncronas; preservar dados do formulário quando houver erro da API; corrigir formatação de data ISO (`YYYY-MM-DD`) em `formatters.js` para evitar deslocamento de fuso horário; proteger UI contra campos inválidos.
- **Riscos:** Divergência de formato de data (`YYYY-MM-DD` vs ISO completo); mitigado normalizando para `YYYY-MM-DD` e aceitando ambos no parsing visual.
- **Critérios de aceite:** Nenhuma validação falha silenciosamente; botões ficam desabilitados durante requisições em voo; testes validam HTTP `400` no backend e feedback inline no frontend.

### Etapa 4 — Resiliência, Validação de Saída e Segurança na IA
- **Prioridade:** Alta
- **Dependências:** Etapa 1
- **Escopo:**
  - `GeminiClient.java`: diferenciar `ResourceAccessException` causado por timeout (`SocketTimeoutException` / `HttpTimeoutException` → `504`) de erro de conexão (`503`).
  - `GeminiService.java`: validar rigorosamente enums (`situacao`, `prioridade`, `preparacaoInvestimento.status`), rejeitar resposta JSON vazia (`{}`) ou sem campos mínimos obrigatórios acionando fallback determinístico seguro, impor limites de tamanho e garantir presença do `avisoEducacional`.
  - `GlobalExceptionHandler.java`: sanitizar mensagens de erro para nunca expor detalhes internos ou stack traces; cobrir `MethodArgumentTypeMismatchException` e `HttpRequestMethodNotSupportedException`.
- **Riscos:** Resposta parcial da IA cair em fallback se validação for rígida demais; mitigado normalizando caixa/acentos básicos de enums antes de validar e mantendo fallback estruturado coerente.
- **Critérios de aceite:** Testes unitários cobrindo chave ausente, `429`, `503`, `504`, JSON malformado, `{}` vazio, enum inválido e tentativa de prompt injection.

### Etapa 5 — Preparação para Produção e Health Check
- **Prioridade:** Alta
- **Dependências:** Etapas 1–4
- **Escopo:**
  - Criar `HealthController.java` (`GET /api/health`) documentado no Swagger.
  - Criar `backend/src/main/resources/application-prod.properties` com `cors.allow-local-dev=false`, política configurável de Swagger (`SPRINGDOC_SWAGGER_ENABLED`) e logs seguros.
  - Criar `backend/Dockerfile`, `frontend/vercel.json` e `render.yaml` (templates prontos para deploy sem criar contas ou publicar sem consentimento).
- **Riscos:** Diferenças entre plataformas (Render, Railway, Vercel); mitigado usando variáveis padrão (`PORT`, `VITE_API_URL`, `CORS_ALLOWED_ORIGINS`, `GEMINI_API_KEY`).
- **Critérios de aceite:** `mvn package` e `npm run build` concluem com sucesso; artefatos de deploy revisados e documentados sem URLs inventadas.

### Etapa 6 — Suíte de Testes (Backend + Frontend)
- **Prioridade:** Alta
- **Dependências:** Etapas 1–5
- **Escopo:**
  - Backend: expandir `FinancialCalculationServiceTest`, `TransactionControllerTest`, `FinancialAnalysisControllerTest` e criar `GeminiServiceTest`, `GeminiClientTest`, `CorsConfigProdTest` e `HealthControllerTest`.
  - Frontend: adicionar testes automatizados (usando `node --test` nativo do Node 24 para serviços/cálculos/API e verificação de build) cobrindo `api.js`, `transactionService.js`, `calculations.js` e validações.
- **Critérios de aceite:** 100% dos testes backend e frontend executados e aprovados após a última edição, com comandos e saídas reais registradas.

### Etapa 7 — Documentação, Relatório Final, Roteiro e Entrega Git
- **Prioridade:** Alta
- **Dependências:** Etapa 6
- **Escopo:**
  - Atualizar `README.md` removendo badge falso de "Concluído" e documentando arquitetura integrada, env vars, Swagger, deploy, limitações e testes reais.
  - Atualizar `docs/MATRIZ_REQUISITOS.md` com o status final comprovado por evidências.
  - Criar `docs/RELATORIO_FINAL.md` e `docs/ROTEIRO_APRESENTACAO.md` (10–15 minutos).
  - Revisar `git diff`, confirmar ausência de segredos e `localhost` no build prod, organizar commits semânticos e fazer `git push` para o GitHub.

