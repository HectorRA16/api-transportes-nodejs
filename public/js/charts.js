export function drawPieChart(canvasId, labels, values) {
    const canvas = document.getElementById(canvasId);

    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext('2d');
    const total = values.reduce((sum, value) => sum + Number(value || 0), 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (total === 0) {
        ctx.font = '16px Arial';
        ctx.fillText('Sin datos para graficar', 80, 150);
        return;
    }

    const colors = [
        '#2563eb',
        '#16a34a',
        '#f97316',
        '#dc2626',
        '#7c3aed',
        '#0891b2'
    ];

    let startAngle = -Math.PI / 2;
    const centerX = 150;
    const centerY = 150;
    const radius = 110;

    values.forEach((value, index) => {
        const sliceAngle = (Number(value || 0) / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();

        startAngle += sliceAngle;
    });

    const legend = document.getElementById(`${canvasId}Legend`);

    if (legend) {
        legend.innerHTML = labels.map((label, index) => `
            <div class="legend-item">
                <span style="background:${colors[index % colors.length]}"></span>
                <strong>${label}</strong>
                <small>${values[index]}</small>
            </div>
        `).join('');
    }
}