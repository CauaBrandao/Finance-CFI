import React from 'react';
import { PALETTES } from '../utils/constants';

export const PalettePanel = ({ isOpen, activePalette, onSelectPalette }) => {
  if (!isOpen) return null;

  const warmPalettes = PALETTES.filter((p) => p.group === 'Tons Quentes');
  const coolPalettes = PALETTES.filter((p) => p.group === 'Tons Frios');

  return (
    <div className="palette-panel" id="palettePanel">
      <div className="palette-group">
        <h4>Tons Quentes</h4>
        <div className="palette-grid">
          {warmPalettes.map((p) => (
            <button
              key={p.id}
              className={`palette-option ${p.className} ${activePalette === p.id ? 'active' : ''}`}
              onClick={() => onSelectPalette(p.id)}
              title={p.name}
            >
              <span className="palette-swatch">
                <i></i><i></i><i></i>
              </span>
              <span className="palette-name">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="palette-group">
        <h4>Tons Frios</h4>
        <div className="palette-grid">
          {coolPalettes.map((p) => (
            <button
              key={p.id}
              className={`palette-option ${p.className} ${activePalette === p.id ? 'active' : ''}`}
              onClick={() => onSelectPalette(p.id)}
              title={p.name}
            >
              <span className="palette-swatch">
                <i></i><i></i><i></i>
              </span>
              <span className="palette-name">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
