import React from 'react';

export const Header = ({ onTogglePalette, onToggleTheme, onExportCsv, currentTheme }) => {
  const isLight = currentTheme === 'light';

  return (
    <header>
      <div className="logo">
        <div className="logo-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1>CFI <span>Finance</span></h1>
      </div>

      <div className="header-actions">
        {/* Painel de paletas de cores */}
        <button
          className="icon-btn"
          id="paletteToggle"
          onClick={onTogglePalette}
          title="Escolher paleta de cores"
          aria-label="Escolher paleta de cores"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="13.5" cy="6.5" r=".5" />
            <circle cx="17.5" cy="10.5" r=".5" />
            <circle cx="8.5" cy="7.5" r=".5" />
            <circle cx="6.5" cy="12.5" r=".5" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C21.998 6.648 17.508 2 12 2z" />
          </svg>
        </button>

        {/* Alternador de tema claro/escuro */}
        <button
          className="icon-btn"
          id="themeToggle"
          onClick={onToggleTheme}
          title="Alternar tema claro/escuro"
          aria-label="Alternar tema claro e escuro"
        >
          {isLight ? (
            <svg className="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg className="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          )}
        </button>

        {/* Exportar CSV */}
        <button
          className="icon-btn"
          id="exportBtn"
          onClick={onExportCsv}
          title="Exportar dados para CSV"
          aria-label="Exportar relatório CSV"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>
    </header>
  );
};
