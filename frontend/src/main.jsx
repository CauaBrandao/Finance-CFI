import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { LandingPage } from './components/landing/LandingPage';
import './index.css';

// Roteamento simples: "/app" abre a aplicação; qualquer outra rota exibe a landing page.
// O vercel.json reescreve todas as rotas para index.html, então ambas funcionam em produção.
const isAppRoute = /^\/app(\/|$)/.test(window.location.pathname);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAppRoute ? <App /> : <LandingPage />}
  </React.StrictMode>
);
