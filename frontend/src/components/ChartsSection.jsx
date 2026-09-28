import React, { useEffect, useRef, useState } from 'react';
import { drawCategoryChart, drawDonutChart } from '../utils/canvasCharts';
import { formatCurrency } from '../utils/formatters';

export const ChartsSection = ({ transactions, theme, palette }) => {
  const categoryCanvasRef = useRef(null);
  const donutCanvasRef = useRef(null);
  const [donutLegendData, setDonutLegendData] = useState([]);

  useEffect(() => {
    // Redesenha os gráficos sempre que as transações, tema ou paleta mudarem
    const timer = setTimeout(() => {
      if (categoryCanvasRef.current) {
        drawCategoryChart(categoryCanvasRef.current, transactions);
      }
      if (donutCanvasRef.current) {
        const legendItems = drawDonutChart(donutCanvasRef.current, transactions);
        setDonutLegendData(legendItems || []);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [transactions, theme, palette]);

  useEffect(() => {
    const handleResize = () => {
      if (categoryCanvasRef.current) {
        drawCategoryChart(categoryCanvasRef.current, transactions);
      }
      if (donutCanvasRef.current) {
        const legendItems = drawDonutChart(donutCanvasRef.current, transactions);
        setDonutLegendData(legendItems || []);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [transactions]);

  return (
    <section className="charts-row glass" aria-label="Visualização Gráfica de Gastos">
      {/* Gráfico 1: Barras horizontais por categoria com gradientes */}
      <div className="chart-col">
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Gastos por Categoria
        </h2>
        <canvas ref={categoryCanvasRef} id="categoryChart" height="200" style={{ width: '100%' }}></canvas>
      </div>

      {/* Gráfico 2: Rosca (Donut Chart) com legenda dinâmica */}
      <div className="chart-col">
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
            <path d="M22 12A10 10 0 0 0 12 2v10z" />
          </svg>
          Distribuição de Gastos
        </h2>
        <div className="donut-wrapper">
          <canvas ref={donutCanvasRef} id="donutChart" width="220" height="220"></canvas>
          <div className="donut-legend" id="donutLegend">
            {donutLegendData.map((item) => (
              <div className="legend-item" key={item.categoryKey}>
                <span className="legend-dot" style={{ background: item.color }}></span>
                <span className="legend-label">{item.emoji} {item.label}</span>
                <span className="legend-value">{formatCurrency(item.amount)}</span>
                <span className="legend-percent">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
