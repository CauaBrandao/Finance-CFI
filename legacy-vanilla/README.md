# CFI Finance - Controle Inteligente

![CFI Finance Logo](https://img.shields.io/badge/Status-Concluído-success)
![Linguagens](https://img.shields.io/badge/HTML5-CSS3-orange)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## 📌 Sobre o Projeto
O **CFI Finance** é uma aplicação web moderna e responsiva para controle de gastos pessoais. Desenvolvida integralmente com **HTML, CSS e JavaScript puro (Vanilla JS)**, a aplicação atende a todos os requisitos do projeto da disciplina, implementando técnicas de programação funcional e garantindo uma interface rica com **Glassmorphism**, suporte a **Dark/Light mode**, e exportação de dados.

## 🛠️ Tecnologias Utilizadas
- **HTML5:** Estruturação semântica, validação de formulários e acessibilidade.
- **CSS3:** Flexbox, CSS Grid, Custom Properties (Variáveis), animações e transições, Media Queries.
- **JavaScript (ES6+):** Lógica da aplicação utilizando os principais conceitos e métodos avançados.
- **Canvas API (JS Puro):** Utilizado para criação de gráficos personalizados sem a necessidade de bibliotecas de terceiros.

## 💡 Técnicas JavaScript Implementadas

De acordo com as exigências do projeto, foram utilizadas as seguintes técnicas e funcionalidades do Javascript:

### 1. `map()`
Usado em várias partes do código para transformar arrays sem alterar a estrutura original:
- **Renderização da Lista:** No `renderTransactions`, transforma os dados do estado em *Template Literals* (HTML puro) para desenhar a lista.
- **Atualização:** Na função `updateTransaction`, usamos para retornar uma versão alterada apenas do item correspondente ao ID modificado.
- **Exportação CSV:** Converte o array de objetos para um array de *Strings* organizadas no padrão CSV.

### 2. `filter()`
Responsável por remover ou filtrar dados da lista original gerando um novo array:
- **Remoção de Itens:** Ao deletar uma transação, removemos a que tem o ID correspondente criando um novo array de *transactions*.
- **Filtros e Busca:** Permite retornar itens de acordo com a categoria, tipo de entrada, e termo de busca (no header da lista).

### 3. `reduce()`
A ferramenta perfeita para cálculos consolidados sobre a massa de transações:
- **Totais Financeiros:** Em `calculateTotals`, utilizamos para percorrer todos os valores e gerar um objeto acumulado com os `Entradas`, `Saídas`, e o quantitativo.
- **Agrupamento para Gráficos:** Para criar as categorias dos gráficos de Canvas, o método agrupa e soma o total de despesas por cada tipo de categoria existente.

### 4. Spread Operator (`...`)
Garante o conceito de imutabilidade. 
- Quando inserimos um novo item na função `addTransaction`, não damos `.push()`, mas geramos um `novo = [...antigos, item]`.
- Ao mesclar os objetos gerados pelos totais, fazemos `return { ...totals, balance }` injetando novos valores no objeto principal.

### 5. Arrow Functions (`() => {}`)
Empregada em todo o código (`script.js`) de ponta a ponta, tornando a sintaxe e escopo do `this` consistentes. Usada especialmente como *callbacks* de todos os `map`, `filter`, `reduce` e `addEventListener`.

### 6. Destructuring
Usado para extrair dados direto dos retornos das funções (Ex: `const { income, expense, balance } = calculateTotals()`).

### 7. Local Storage
Todos os dados adicionados pelo usuário, bem como preferências (metas, temas) são armazenadas de forma persistente através das funções `loadFromLocalStorage` e `saveToLocalStorage` e a serialização com `JSON.stringify() / JSON.parse()`.

## 🚀 Como Executar

1. Clone o repositório ou baixe os arquivos.
2. Não há dependências, basta abrir o arquivo `index.html` em qualquer navegador moderno.
3. Comece adicionando novas entradas e saídas no formulário.

## ✨ Diferenciais Adicionados
- **Design de Alto Padrão:** UI focada em *Glassmorphism*, responsividade total e animações fluidas de feedback visual (Toasts).
- **Temas Dinâmicos:** Modo Noturno, Modo Claro e diferentes paletas de Cores.
- **Gráficos em Canvas Nativo:** O uso da API nativa para desenhar um Donut Chart e Bar Chart sem usar Chart.js (comprovando domínio em JS puro).
- **Animações (Confetti):** Ao alcançar as metas o projeto exibe Confettis com física própria processada no canvas.
- **Exportação:** Exporta o balanço facilmente para CSV.

---
**Desenvolvido por:** Cauã & Fernando & Igor (Projeto Avaliativo)
