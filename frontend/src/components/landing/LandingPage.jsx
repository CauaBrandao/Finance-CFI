import React, { useEffect, useState } from 'react';
import './landing.css';

const APP_PATH = '/app';
const GITHUB_URL = 'https://github.com/CauaBrandao/Finance-CFI';
const SWAGGER_URL = 'https://cfi-finance-backend.onrender.com/api/swagger-ui.html';

const Icon = ({ d, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);

const ICONS = {
  logo: (<><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>),
  dashboard: (<><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>),
  list: (<><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1" /><circle cx="3.5" cy="12" r="1" /><circle cx="3.5" cy="18" r="1" /></>),
  pie: (<><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></>),
  target: (<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>),
  wallet: (<><path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" /><path d="M4 6v12a2 2 0 0 0 2 2h14v-4" /><path d="M18 12a2 2 0 0 0 0 4h4v-4z" /></>),
  trend: (<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>),
  sparkle: (<><path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z" /><path d="M19 3v4M17 5h4" /></>),
  shield: (<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></>),
  download: (<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>),
  palette: (<><circle cx="13.5" cy="6.5" r="1" /><circle cx="17.5" cy="10.5" r="1" /><circle cx="8.5" cy="7.5" r="1" /><circle cx="6.5" cy="12.5" r="1" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.7 1.7-1.7h2c3 0 5.5-2.5 5.5-5.5C22 6.6 17.5 2 12 2z" /></>),
  arrow: (<><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>),
  github: (<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3.1-.3 6.4-1.5 6.4-7A5.4 5.4 0 0 0 20 4.8 5 5 0 0 0 19.9 1S18.7.7 16 2.5a13.4 13.4 0 0 0-7 0C6.3.7 5.1 1 5.1 1A5 5 0 0 0 5 4.8a5.4 5.4 0 0 0-1.5 3.7c0 5.5 3.3 6.7 6.4 7a3.4 3.4 0 0 0-.9 2.6V22" />),
  calc: (<><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01M8 10h.01M12 10h.01M16 10h.01" /></>),
  code: (<><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>),
  check: (<polyline points="20 6 9 17 4 12" />),
};

const FEATURES = [
  { icon: 'dashboard', title: 'Dashboard financeiro', text: 'Entradas, saídas, saldo, taxa de poupança, gasto médio diário e maior despesa em um só lugar.' },
  { icon: 'list', title: 'Gestão de transações', text: 'Cadastre, edite e exclua receitas e despesas com busca, filtros por tipo e categoria e ordenação.' },
  { icon: 'wallet', title: 'Orçamento por categoria', text: 'Defina limites por categoria e mês, com barras de progresso e alertas ao atingir 70% e 100%.' },
  { icon: 'target', title: 'Metas de gastos e investimento', text: 'Acompanhe o limite mensal e o progresso dos aportes até a sua meta de investimento.' },
  { icon: 'pie', title: 'Gráficos por categoria', text: 'Visualize para onde vai o seu dinheiro com gráficos desenhados em HTML5 Canvas.' },
  { icon: 'sparkle', title: 'Inteligência Financeira', text: 'Diagnóstico, problemas priorizados, plano de ação e preparação para investir, gerados pelo Google Gemini.' },
  { icon: 'download', title: 'Exportação CSV', text: 'Exporte seu histórico em UTF-8 pronto para abrir no Excel ou no Google Planilhas.' },
  { icon: 'palette', title: 'Temas e paletas', text: 'Modo claro ou escuro e paletas de cores personalizáveis, salvas no seu navegador.' },
];

const PIPELINE = [
  { n: '01', title: 'Você registra', text: 'Receitas e despesas são cadastradas por categoria no dashboard.' },
  { n: '02', title: 'O motor calcula', text: 'Saldo, poupança, comprometimento da renda e distribuição são calculados de forma determinística.' },
  { n: '03', title: 'A IA interpreta', text: 'O Gemini recebe o contexto já calculado e identifica problemas com evidências.' },
  { n: '04', title: 'Você age', text: 'Um plano de ação priorizado e uma avaliação educacional para investir são exibidos.' },
];

const SAFEGUARDS = [
  'Os cálculos nunca são delegados à IA',
  'Toda conclusão precisa de evidência nos dados',
  'Proteção contra prompt injection nas descrições',
  'Sem recomendação de ativos específicos',
  'Resposta em JSON validada pelo backend',
  'Fallback determinístico se a IA falhar',
];

const SHOTS = [
  { src: '/screenshots/01-dashboard.png', label: 'Dashboard' },
  { src: '/screenshots/02-graficos-transacoes.png', label: 'Gráficos e transações' },
  { src: '/screenshots/03-ia-diagnostico-problemas.png', label: 'Diagnóstico com IA' },
  { src: '/screenshots/04-ia-plano-acao-investimento.png', label: 'Plano de ação' },
  { src: '/screenshots/05-tema-claro.png', label: 'Tema claro' },
];

const STACK = [
  { name: 'React 18', role: 'Interface' },
  { name: 'Vite 5', role: 'Build' },
  { name: 'Java 21', role: 'Linguagem' },
  { name: 'Spring Boot 3', role: 'API REST' },
  { name: 'Google Gemini', role: 'IA generativa' },
  { name: 'Swagger / OpenAPI', role: 'Documentação' },
  { name: 'Vercel', role: 'Frontend' },
  { name: 'Render + Docker', role: 'Backend' },
];

const TEAM = ['Cauã Brandão', 'Fernando', 'Igor Aldivan'];

const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.lp-reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
};

export const LandingPage = () => {
  const [activeShot, setActiveShot] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useReveal();

  useEffect(() => {
    document.title = 'CFI Finance — Inteligência Financeira Pessoal';
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="lp">
      <div className="lp-bg" aria-hidden="true">
        <span className="lp-orb lp-orb-1" />
        <span className="lp-orb lp-orb-2" />
        <span className="lp-orb lp-orb-3" />
        <span className="lp-grid" />
      </div>

      {/* NAV */}
      <nav className={`lp-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="lp-container lp-nav-inner">
          <a href="/" className="lp-logo" aria-label="CFI Finance — início">
            <span className="lp-logo-icon"><Icon d={ICONS.logo} size={20} /></span>
            CFI <span>Finance</span>
          </a>
          <div className="lp-nav-links">
            <a href="#recursos">Recursos</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#telas">Telas</a>
            <a href="#tecnologia">Tecnologia</a>
          </div>
          <a href={APP_PATH} className="lp-btn lp-btn-primary lp-btn-sm">Abrir app</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-container lp-hero-inner">
          <div className="lp-hero-copy">
            <span className="lp-pill"><Icon d={ICONS.sparkle} size={14} /> Análise com Google Gemini</span>
            <h1>
              Suas finanças, <span className="lp-gradient-text">explicadas</span> por inteligência artificial.
            </h1>
            <p className="lp-lead">
              O CFI Finance organiza receitas e despesas, calcula seus indicadores com precisão e usa IA
              generativa para transformar números em diagnóstico, prioridades e um plano de ação claro.
            </p>
            <div className="lp-cta-row">
              <a href={APP_PATH} className="lp-btn lp-btn-primary">
                Começar agora <Icon d={ICONS.arrow} size={18} />
              </a>
              <a href="#como-funciona" className="lp-btn lp-btn-ghost">Ver como funciona</a>
            </div>
            <p className="lp-note">
              Gratuito, sem cadastro. O primeiro acesso pode levar cerca de 50 s enquanto o servidor acorda.
            </p>
          </div>

          <div className="lp-hero-visual">
            <div className="lp-browser">
              <div className="lp-browser-bar">
                <span /><span /><span />
                <div className="lp-browser-url">finance-cfi.vercel.app/app</div>
              </div>
              <img src="/screenshots/01-dashboard.png" alt="Dashboard do CFI Finance com entradas, saídas, saldo e metas" />
            </div>
            <div className="lp-float lp-float-1">
              <span className="lp-float-icon is-green"><Icon d={ICONS.trend} size={18} /></span>
              <div><small>Taxa de poupança</small><strong>Calculada em tempo real</strong></div>
            </div>
            <div className="lp-float lp-float-2">
              <span className="lp-float-icon is-violet"><Icon d={ICONS.sparkle} size={18} /></span>
              <div><small>Diagnóstico da IA</small><strong>3 ações priorizadas</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="lp-stats">
        <div className="lp-container lp-stats-grid lp-reveal">
          <div><strong>2 camadas</strong><span>cálculo determinístico + IA</span></div>
          <div><strong>10</strong><span>categorias de transação</span></div>
          <div><strong>4 análises</strong><span>diagnóstico, problemas, ações e investimento</span></div>
          <div><strong>46</strong><span>testes automatizados</span></div>
        </div>
      </section>

      {/* PROBLEMA / SOLUÇÃO */}
      <section className="lp-section">
        <div className="lp-container lp-split">
          <div className="lp-reveal">
            <span className="lp-eyebrow">O problema</span>
            <h2>Planilhas mostram números. Não dizem o que fazer.</h2>
            <p className="lp-muted">
              Apps tradicionais exibem gráficos e históricos, mas deixam para você descobrir se está gastando
              demais, quais categorias pesam no orçamento, se existe margem no fim do mês e se já é hora de
              investir mais.
            </p>
          </div>
          <div className="lp-layers lp-reveal">
            <div className="lp-layer">
              <span className="lp-layer-icon"><Icon d={ICONS.calc} /></span>
              <div>
                <h3>Motor determinístico</h3>
                <p>Calcula receitas, despesas, saldo, poupança, comprometimento da renda, gasto médio diário e
                  progresso das metas, sempre com exatidão.</p>
              </div>
            </div>
            <div className="lp-layer-link" aria-hidden="true" />
            <div className="lp-layer is-ai">
              <span className="lp-layer-icon"><Icon d={ICONS.sparkle} /></span>
              <div>
                <h3>Motor analítico com IA</h3>
                <p>Recebe o contexto já calculado, classifica sua situação, aponta problemas com evidências e
                  sugere ações, respondendo em JSON estruturado.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section className="lp-section" id="recursos">
        <div className="lp-container">
          <div className="lp-section-head lp-reveal">
            <span className="lp-eyebrow">Recursos</span>
            <h2>Tudo o que você precisa para entender seu dinheiro</h2>
            <p className="lp-muted">Do registro diário até a análise inteligente, em uma interface única.</p>
          </div>
          <div className="lp-features">
            {FEATURES.map((f, i) => (
              <article key={f.title} className="lp-card lp-reveal" style={{ transitionDelay: `${(i % 4) * 70}ms` }}>
                <span className="lp-card-icon"><Icon d={ICONS[f.icon]} /></span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="lp-section" id="como-funciona">
        <div className="lp-container">
          <div className="lp-section-head lp-reveal">
            <span className="lp-eyebrow">Como funciona</span>
            <h2>Dos dados ao plano de ação em quatro passos</h2>
          </div>
          <ol className="lp-steps">
            {PIPELINE.map((s, i) => (
              <li key={s.n} className="lp-step lp-reveal" style={{ transitionDelay: `${i * 90}ms` }}>
                <span className="lp-step-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>

          <div className="lp-ai-box lp-reveal">
            <div className="lp-ai-copy">
              <span className="lp-pill"><Icon d={ICONS.shield} size={14} /> IA responsável</span>
              <h3>Uma IA presa aos seus dados</h3>
              <p className="lp-muted">
                A IA não é um chatbot genérico. Regras explícitas de engenharia de prompt garantem que ela
                use somente as informações calculadas, sem inventar valores nem indicar produtos financeiros.
              </p>
              <div className="lp-badges">
                <span className="lp-badge is-green">EXCELENTE</span>
                <span className="lp-badge is-teal">BOM</span>
                <span className="lp-badge is-blue">ESTÁVEL</span>
                <span className="lp-badge is-amber">ATENÇÃO</span>
                <span className="lp-badge is-red">CRÍTICO</span>
              </div>
            </div>
            <ul className="lp-checks">
              {SAFEGUARDS.map((s) => (
                <li key={s}><span><Icon d={ICONS.check} size={14} /></span>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* TELAS */}
      <section className="lp-section" id="telas">
        <div className="lp-container">
          <div className="lp-section-head lp-reveal">
            <span className="lp-eyebrow">Telas</span>
            <h2>Veja o CFI Finance em ação</h2>
          </div>
          <div className="lp-gallery lp-reveal">
            <div className="lp-tabs" role="tablist">
              {SHOTS.map((s, i) => (
                <button
                  key={s.src}
                  role="tab"
                  aria-selected={activeShot === i}
                  className={activeShot === i ? 'is-active' : ''}
                  onClick={() => setActiveShot(i)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="lp-browser lp-browser-lg">
              <div className="lp-browser-bar">
                <span /><span /><span />
                <div className="lp-browser-url">finance-cfi.vercel.app/app</div>
              </div>
              <img key={SHOTS[activeShot].src} src={SHOTS[activeShot].src} alt={SHOTS[activeShot].label} className="lp-shot-fade" />
            </div>
          </div>
        </div>
      </section>

      {/* TECNOLOGIA */}
      <section className="lp-section" id="tecnologia">
        <div className="lp-container">
          <div className="lp-section-head lp-reveal">
            <span className="lp-eyebrow">Tecnologia</span>
            <h2>Fullstack, em produção, com API documentada</h2>
            <p className="lp-muted">Frontend React na Vercel, API Spring Boot em container Docker no Render.</p>
          </div>
          <div className="lp-stack lp-reveal">
            {STACK.map((t) => (
              <div key={t.name} className="lp-stack-item">
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </div>
            ))}
          </div>
          <div className="lp-arch lp-reveal">
            <div className="lp-arch-node"><small>Frontend</small><strong>React + Vite</strong><span>Vercel</span></div>
            <div className="lp-arch-line"><span>HTTPS / JSON</span></div>
            <div className="lp-arch-node"><small>Backend</small><strong>Spring Boot</strong><span>Render</span></div>
            <div className="lp-arch-line"><span>Prompt + contexto</span></div>
            <div className="lp-arch-node is-ai"><small>IA</small><strong>Google Gemini</strong><span>JSON estruturado</span></div>
          </div>
        </div>
      </section>

      {/* EQUIPE + CTA */}
      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-cta-box lp-reveal">
            <h2>Pronto para entender suas finanças?</h2>
            <p>Carregue o cenário de demonstração e gere sua primeira análise em segundos.</p>
            <div className="lp-cta-row lp-cta-center">
              <a href={APP_PATH} className="lp-btn lp-btn-light">
                Abrir o CFI Finance <Icon d={ICONS.arrow} size={18} />
              </a>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="lp-btn lp-btn-outline-light">
                <Icon d={ICONS.github} size={18} /> Código no GitHub
              </a>
            </div>
          </div>

          <div className="lp-team lp-reveal">
            <span className="lp-eyebrow">Equipe</span>
            <div className="lp-team-list">
              {TEAM.map((name) => (
                <div key={name} className="lp-member">
                  <span className="lp-avatar">{name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</span>
                  {name}
                </div>
              ))}
            </div>
            <p className="lp-muted lp-small">
              Projeto acadêmico da disciplina Inteligência Artificial na Web (IAW), categoria Análise e Insights.
            </p>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <a href="/" className="lp-logo">
            <span className="lp-logo-icon"><Icon d={ICONS.logo} size={18} /></span>
            CFI <span>Finance</span>
          </a>
          <div className="lp-footer-links">
            <a href={APP_PATH}>Aplicação</a>
            <a href={SWAGGER_URL} target="_blank" rel="noopener noreferrer">API (Swagger)</a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
          <small>Análise de caráter educacional. Não constitui recomendação de investimento.</small>
        </div>
      </footer>
    </div>
  );
};
