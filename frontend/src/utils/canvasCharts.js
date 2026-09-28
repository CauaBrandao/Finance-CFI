import { CATEGORIES } from './constants';
import { formatCurrency } from './formatters';

export const roundRect = (ctx, x, y, w, h, r) => {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

export const drawCategoryChart = (canvas, transactions = []) => {
  if (!canvas) return;
  const context = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.offsetWidth || 350;
  const expenses = transactions.filter((t) => t.type === 'expense');

  if (expenses.length === 0) {
    const height = 200;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.scale(dpr, dpr);
    context.clearRect(0, 0, width, height);

    context.fillStyle = '#8888aa';
    context.font = '14px Inter, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Adicione gastos para ver o gráfico', width / 2, height / 2);
    return;
  }

  const categoryTotals = expenses.reduce((acc, t) => {
    const cat = t.category || 'other';
    acc[cat] = (acc[cat] || 0) + (Number(t.amount) || 0);
    return acc;
  }, {});

  const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const maxVal = sorted[0]?.[1] || 1;

  const barHeight = 32;
  const gap = 14;
  const leftPad = 130;
  const rightPad = 90;
  const topPad = 20;
  const bottomPad = 20;
  const height = Math.max(sorted.length * (barHeight + gap) - gap + topPad + bottomPad, 200);

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.scale(dpr, dpr);
  context.clearRect(0, 0, width, height);

  const barWidth = Math.max(width - leftPad - rightPad, 20);
  const chartStyles = getComputedStyle(document.documentElement);
  const chartTextSecondary = chartStyles.getPropertyValue('--text-secondary').trim() || '#8888aa';
  const chartTextPrimary = chartStyles.getPropertyValue('--text-primary').trim() || '#f0f0ff';

  sorted.forEach(([cat, val], i) => {
    const y = topPad + i * (barHeight + gap);
    const catInfo = CATEGORIES[cat] || CATEGORIES.other;
    const w = Math.max((val / maxVal) * barWidth, 4);

    context.fillStyle = chartTextSecondary;
    context.font = '13px Inter, sans-serif';
    context.textAlign = 'right';
    context.textBaseline = 'middle';
    context.fillText(`${catInfo.emoji} ${catInfo.label}`, leftPad - 12, y + barHeight / 2);

    const grad = context.createLinearGradient(leftPad, 0, leftPad + w, 0);
    grad.addColorStop(0, catInfo.color);
    grad.addColorStop(1, `${catInfo.color}88`);
    context.fillStyle = grad;
    roundRect(context, leftPad, y, w, barHeight, 8);
    context.fill();

    context.fillStyle = chartTextPrimary;
    context.font = 'bold 12px Inter, sans-serif';
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    context.fillText(formatCurrency(val), leftPad + w + 10, y + barHeight / 2);
  });
};

export const drawDonutChart = (canvas, transactions = []) => {
  if (!canvas) return [];
  const context = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const displaySize = 220;
  canvas.width = displaySize * dpr;
  canvas.height = displaySize * dpr;
  canvas.style.width = `${displaySize}px`;
  canvas.style.height = `${displaySize}px`;
  context.scale(dpr, dpr);

  const centerX = displaySize / 2;
  const centerY = displaySize / 2;
  const radius = 80;
  const lineWidth = 28;

  context.clearRect(0, 0, displaySize, displaySize);

  const expenses = transactions.filter((t) => t.type === 'expense');

  if (expenses.length === 0) {
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.strokeStyle = 'rgba(136, 136, 170, 0.15)';
    context.lineWidth = lineWidth;
    context.stroke();

    context.fillStyle = '#8888aa';
    context.font = '12px Inter, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Sem dados', centerX, centerY - 8);
    context.font = '10px Inter, sans-serif';
    context.fillText('para exibir', centerX, centerY + 8);
    return [];
  }

  const categoryTotals = expenses.reduce((acc, t) => {
    const cat = t.category || 'other';
    acc[cat] = (acc[cat] || 0) + (Number(t.amount) || 0);
    return acc;
  }, {});

  const totalExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  let currentAngle = -Math.PI / 2;

  sorted.forEach(([cat, val]) => {
    const catInfo = CATEGORIES[cat] || CATEGORIES.other;
    const sliceAngle = (val / totalExpenses) * Math.PI * 2;

    context.beginPath();
    context.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    context.strokeStyle = catInfo.color;
    context.lineWidth = lineWidth;
    context.lineCap = 'butt';
    context.stroke();

    currentAngle += sliceAngle;
  });

  const innerRadius = radius - lineWidth / 2 - 2;
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const styles = getComputedStyle(document.documentElement);

  context.beginPath();
  context.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  context.fillStyle = styles.getPropertyValue('--bg-secondary').trim() || (isLight ? '#f0f2ff' : '#12122a');
  context.fill();

  context.fillStyle = styles.getPropertyValue('--text-primary').trim() || (isLight ? '#1a1a3e' : '#f0f0ff');
  context.font = 'bold 18px Inter, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(formatCurrency(totalExpenses), centerX, centerY - 8);

  context.fillStyle = styles.getPropertyValue('--text-secondary').trim() || (isLight ? '#6b6b8d' : '#8888aa');
  context.font = '11px Inter, sans-serif';
  context.fillText('total gasto', centerX, centerY + 12);

  return sorted.map(([cat, val]) => {
    const catInfo = CATEGORIES[cat] || CATEGORIES.other;
    const pct = ((val / totalExpenses) * 100).toFixed(1);
    return {
      categoryKey: cat,
      label: catInfo.label,
      emoji: catInfo.emoji,
      color: catInfo.color,
      amount: val,
      percent: pct
    };
  });
};
