# CFI Finance — Inteligência Financeira Pessoal

![Status](https://img.shields.io/badge/Status-Concluído-success)
![Categoria](https://img.shields.io/badge/Categoria-Classificação%20%2F%20Análise-blueviolet)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen)
![Java](https://img.shields.io/badge/Java-21%20%7C%2025-orange)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4)
![OpenAPI](https://img.shields.io/badge/Docs-Swagger%20OpenAPI-green)

---

## 📌 Sobre o Projeto

O **CFI Finance — Inteligência Financeira Pessoal** é a evolução acadêmica do sistema *CFI Finance — Controle Inteligente*. O projeto foi transformado de uma aplicação frontend estática para uma **plataforma completa fullstack** composta por uma interface moderna em **React 18 (Vite)**, uma **API REST robusta em Java / Spring Boot 3** e integração com a Inteligência Artificial Generativa **Google Gemini**.

Diferente de um simples dashboard ou de um chatbot de perguntas e respostas genéricas, o sistema atua na categoria acadêmica de **Classificação / Análise**, agregando valor real ao interpretar dados orçamentários estruturados, identificar desvios com evidências empíricas, traçar planos de ação práticos e avaliar a maturidade do usuário para investimentos.

---

## 🎯 Problema

A grande maioria das aplicações de controle financeiro limita-se a exibir gráficos e números frios (como "Você gastou R$ 920 em alimentação"). O usuário comum muitas vezes não sabe:
* O que esse número significa dentro da sua realidade orçamentária;
* Se seus hábitos de consumo representam risco de inadimplência ou perda de patrimônio;
* Quais ações concretas tomar para equilibrar as contas;
* Se seu momento financeiro permite iniciar ou elevar aplicações em investimentos.

Além disso, delegar cálculos financeiros a LLMs frequentemente resulta em alucinações numéricas, distorcendo balanços e comprometendo a confiabilidade do sistema.

---

## 💡 Solução

O **CFI Finance** resolve esse desafio implementando uma **separação estrita de responsabilidades**:
1. **Motor Determinístico (Backend Spring Boot & Frontend):** Executa com precisão matemática todos os cálculos de saldo, totais, médias diárias, percentuais de comprometimento, progresso de metas e validações de regras de negócio.
2. **Motor Analítico (Google Gemini LLM):** Recebe o contexto financeiro estruturado e atua exclusivamente na **interpretação analítica**, identificando padrões de risco, apontando evidências nos dados, priorizando problemas, recomendando ações práticas e diagnosticando a maturidade para investir.

---

## 🏷️ Categoria da Atividade Acadêmica

### **CLASSIFICAÇÃO / ANÁLISE**

O sistema **NÃO é um chatbot genérico** e não realiza conversas abertas desconexas. Ele recebe dados financeiros, classifica a situação orçamentária do usuário em níveis padronizados (`EXCELENTE`, `ESTAVEL`, `BOM`, `ATENCAO`, `CRITICO`) e avalia a preparação para investir em `PREPARADO`, `PRECISA_DE_AJUSTES` ou `PRIORIDADE_ORGANIZACAO`.

---

## ✨ Funcionalidades

### 1. Gestão Orçamentária Completa (Preservada da versão anterior)
* **Cadastro, Edição e Exclusão:** Gestão de receitas e despesas com validação de dados;
* **Categorização Semântica:** 10 categorias estruturadas com emojis e cores oficiais;
* **Filtros e Busca em Tempo Real:** Pesquisa textual, filtros por tipo/categoria e ordenação flexível;
* **Gráficos em Canvas Nativo (HTML5 2D):** Gráfico Donut de distribuição percentual e Gráfico de barras por categoria com gradientes suaves;
* **Metas Financeiras Gamificadas:** Limite mensal de gastos (budget) e Meta mensal de investimentos com comemoração de confetti animado;
* **Exportação CSV:** Relatório compatível com Excel codificado em UTF-8 com BOM;
* **Personalização Visual:** Suporte a Dark Mode, Light Mode e 5 paletas de cores (*Sunset*, *Amber*, *Ocean*, *Emerald*, *Pacific*).

### 2. Módulo de Inteligência Financeira (Nova Funcionalidade Central)
* **Diagnóstico Financeiro Contextual:** Classificação da situação orçamentária com resumo executivo fundamentado;
* **Detecção de Problemas com Evidências:** Apontamento de desvios reais nos dados (ex: concentração de 26,3% em alimentação) com níveis de prioridade (`ALTA`, `MEDIA`, `BAIXA`);
* **Plano de Ação Personalizado:** Recomendações práticas estruturadas com o motivo da ação e prioridade de execução;
* **Preparação para Investir:** Módulo educativo que avalia se o fluxo de caixa do usuário oferece segurança e previsibilidade para aportes, sem recomendar ativos financeiros específicos;
* **Resiliência e Fallback:** Tratamento para indisponibilidade da IA, timeouts e rate limit com mensagens legíveis e status HTTP apropriados.

---

## 🏛️ Arquitetura do Sistema

```mermaid
flowchart LR
    subgraph Client["Cliente / Navegador"]
        ReactApp["React 18 + Vite (SPA)"]
    end

    subgraph Server["Servidor Spring Boot 3.3.4"]
        direction TB
        Controller["REST Controllers (/api/...)"]
        Validation["Bean Validation"]
        CalcService["FinancialCalculationService (Determinístico)"]
        AnalysisService["FinancialAnalysisService"]
        PromptEngine["Prompt Engineering & Anti-Injection"]
        GeminiClient["GeminiClient (RestClient + Timeout)"]
    end

    subgraph External["Google Cloud AI"]
        GeminiAPI["Google Gemini REST API"]
    end

    ReactApp -->|JSON HTTP Request| Controller
    Controller --> Validation
    Validation --> CalcService
    CalcService --> AnalysisService
    AnalysisService --> PromptEngine
    PromptEngine --> GeminiClient
    GeminiClient -->|POST /generateContent (JSON Schema)| GeminiAPI
    GeminiAPI -->|Structured JSON Response| GeminiClient
    GeminiClient --> AnalysisService
    AnalysisService --> Controller
    Controller -->|DTO Resposta Unificada| ReactApp
```

---

## 🛠️ Tecnologias Utilizadas

### Frontend
* **React 18:** Componentes funcionais reutilizáveis e hooks modernos;
* **Vite 5:** Build tool ultrarrápido para desenvolvimento e empacotamento;
* **CSS3 Moderno:** Design tokens com CSS Custom Properties, Glassmorphism e responsividade total;
* **HTML5 Canvas 2D API:** Renderização de Donut Chart, Bar Chart e animação física de partículas (Confetti).

### Backend
* **Java 21 / 25 (LTS):** Linguagem tipada, performática e moderna com Records;
* **Spring Boot 3.3.4:** Framework corporativo para APIs REST;
* **Spring Web (MVC):** Roteamento e arquitetura de controladores;
* **Spring Validation (Hibernate Validator):** Validação declarativa de entrada via Bean Validation;
* **SpringDoc OpenAPI (Swagger 3):** Documentação interativa e sandbox de testes de endpoints;
* **Jackson Databind:** Serialização, desserialização e validação de schema JSON;
* **Maven 3.8+:** Gerenciamento de dependências e ciclo de vida de build;
* **JUnit 5 & Mockito:** Testes unitários e de integração com Spring MockMvc.

### Inteligência Artificial
* **Google Gemini API (`gemini-2.5-flash` / `gemini-3.8-flash`):** Modelo multimodal de alta velocidade e contexto de 1 milhão de tokens;
* **Modo JSON Estruturado (`responseMimeType: "application/json"`):** Respostas estritas sem blocos de texto desestruturados.

---

## 📋 Pré-requisitos

Para executar o projeto localmente, certifique-se de ter instalado:
* **Node.js** (versão 18 ou superior) e **npm**;
* **Java JDK** (versão 21 ou superior — compatível com Java 25 LTS);
* **Apache Maven** (versão 3.8 ou superior);
* **Chave de API do Google Gemini** (opcional para testes básicos graças ao motor determinístico de contingência).

---

## 🚀 Instalação e Configuração

### 1. Clonar o Repositório
```bash
git clone https://github.com/CauaBrandao/Finance-CFI.git
cd Finance-CFI
```

### 2. Configurar Variáveis de Ambiente do Backend
Navegue até a pasta `backend/` e crie o arquivo `.env` ou configure as variáveis no seu ambiente a partir do `.env.example`:
```bash
cd backend
cp .env.example .env
```

Conteúdo de exemplo do `.env`:
```env
GEMINI_API_KEY=sua_chave_real_aqui
GEMINI_MODEL=gemini-2.5-flash
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

> [!CAUTION]
> **NUNCA** faça commit da sua chave `GEMINI_API_KEY` no Git. Mantenha-a exclusivamente nas variáveis de ambiente do seu sistema.

### 3. Configurar Frontend
```bash
cd ../frontend
cp .env.example .env
npm install
```

---

## 🏃 Como Executar

### Executando o Backend (Spring Boot)
Na pasta `backend/`:
```bash
# Executar via plugin Maven
mvn spring-boot:run

# Ou compilar o JAR executável e rodar diretamente:
mvn clean package
java -jar target/finance-2.0.0.jar
```
* A API estará disponível em: `http://localhost:8080/api`
* Documentação Swagger UI: `http://localhost:8080/api/swagger-ui.html`

### Executando o Frontend (React + Vite)
Na pasta `frontend/`:
```bash
npm run dev
```
* O aplicativo estará disponível em: `http://localhost:5173`

---

## 📡 Endpoints da API REST

Todas as rotas da API estão sob o prefixo `/api`:

| Método | Endpoint | Descrição | Status de Sucesso |
| :--- | :--- | :--- | :--- |
| `POST` | `/financial-analysis/full` | Análise integral (Diagnóstico, Problemas, Ações, Investimento e Métricas) | `200 OK` |
| `POST` | `/financial-analysis/diagnosis` | Diagnóstico geral e problemas detectados | `200 OK` |
| `POST` | `/financial-analysis/action-plan` | Plano de ação prático e priorizado | `200 OK` |
| `POST` | `/investments/readiness` | Avaliação de preparação para investir | `200 OK` |
| `GET` | `/transactions` | Listagem de transações cadastradas no backend | `200 OK` |
| `POST` | `/transactions` | Cadastro de nova transação | `201 Created` |
| `PUT` | `/transactions/{id}` | Atualização de transação existente | `200 OK` |
| `DELETE` | `/transactions/{id}` | Remoção de transação | `204 No Content` |

---

## 📖 Swagger / OpenAPI

A documentação interativa da API foi implementada via SpringDoc OpenAPI. Acesse:

👉 **[http://localhost:8080/api/swagger-ui.html](http://localhost:8080/api/swagger-ui.html)**

No Swagger é possível:
* Visualizar o esquema de todos os DTOs de entrada e saída;
* Testar os endpoints em tempo real com payloads de exemplo;
* Inspecionar respostas de sucesso (200, 201, 204) e de erro controlado (400, 404, 429, 503, 504).

---

## 🧠 Integração com o Google Gemini

### Engenharia de Prompt
O prompt foi desenhado sob rigorosos princípios de segurança e robustez:
1. **Papel da IA:** Analista especialista em organização orçamentária pessoal;
2. **Fonte Única da Verdade:** O modelo é estritamente instruído a utilizar apenas os dados fornecidos no payload JSON;
3. **Não-Alucinação:** Caso falte uma informação (ex: reserva de emergência), o modelo responde obrigatoriamente: *"Não há dados suficientes para avaliar este aspecto"*;
4. **Sem Indicação de Ativos:** É proibido recomendar ações, criptomoedas ou fundos específicos.

### Proteção Contra Prompt Injection
* Instruções do sistema residem no bloco isolado `system_instruction`;
* O payload do usuário é encapsulado no bloco `contents` como dados passivos;
* O sistema instrui a IA a desconsiderar qualquer ordem ou comando que tente burlar regras a partir da descrição de transações (ex: "ignore as instruções anteriores").

---

## 🛡️ Segurança e Resiliência

* **Proteção de Credenciais:** A chave `GEMINI_API_KEY` reside exclusivamente no backend; o frontend não possui e nunca recebe a chave;
* **CORS Seguro:** Configurado via `CorsConfig` restringindo origens para o domínio da aplicação cliente;
* **Sanitização e Validação de Entrada:** Validação de tipos, valores mínimos (`@DecimalMin("0.01")`), tamanho máximo de strings e limite de lotes de transações para prevenir ataques de negação de serviço (DoS);
* **Tratamento Global de Exceções (`GlobalExceptionHandler`):**
  * `400 Bad Request`: Payload malformado ou campos obrigatórios ausentes;
  * `404 Not Found`: Transação ou rota inexistente;
  * `429 Too Many Requests`: Limite de requisições do Gemini atingido;
  * `503 Service Unavailable`: Falha ou indisponibilidade temporária da API da IA;
  * `504 Gateway Timeout`: Timeout de resposta configurado (20 segundos) para que o frontend não fique bloqueado indefinidamente;
  * `500 Internal Server Error`: Erros genéricos tratados de forma segura sem vazar stack traces.

---

## 🧪 Testes Automatizados

Para executar a suíte de testes unitários e de integração no backend:
```bash
cd backend
mvn test
```
Resultados cobertos:
* `FinancialCalculationServiceTest`: Validação de regras financeiras, limites e cálculos determinísticos;
* `FinancialAnalysisServiceTest`: Validação do fluxo de enriquecimento e integração com a IA;
* `FinancialAnalysisControllerTest`: Testes de endpoints REST e validação de schema com MockMvc.

---

## ⏱️ Roteiro para Apresentação Acadêmica (15 Minutos)

Para a demonstração do projeto para a banca avaliadora:

| Tempo | Etapa | Conteúdo a Demonstrar |
| :--- | :--- | :--- |
| **00:00 - 02:00** | **Introdução** | Apresentar o problema (dados sem interpretação nos apps tradicionais), o público-alvo e o enquadramento na categoria **Classificação / Análise**. |
| **02:00 - 05:00** | **Arquitetura & Prompt** | Mostrar a separação entre React, Spring Boot e Gemini. Explicar a barreira anti-prompt-injection, a proteção da API Key e a resposta em JSON estrito. |
| **05:00 - 10:00** | **Demonstração Prática** | 1. Cadastrar receitas e despesas no Dashboard;<br>2. Acessar a aba **Inteligência Financeira** e solicitar análise;<br>3. Exibir o diagnóstico geral, problemas detectados com evidências numéricas, plano de ação e o status de preparação para investir. |
| **10:00 - 13:00** | **Tratamento de Falhas** | Demonstrar a resposta a um input inválido (HTTP 400 no Swagger ou no front) e explicar a resiliência a timeouts (504) e limites de taxa (429). |
| **13:00 - 15:00** | **Conclusão & Perguntas** | Responder às dúvidas da banca com domínio pleno de React, Spring Boot e Google Gemini. |

---

## 👥 Equipe do Projeto

* **Cauã Brandão**
* **Fernando**
* **Igor Aldivan**

*Atividade acadêmica de desenvolvimento e apresentação de API Web integrada a Inteligência Artificial Generativa.*
