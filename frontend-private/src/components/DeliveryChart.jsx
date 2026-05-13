import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function DeliveryChart() {
  const data = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Rutas completadas',
        data: [42, 55, 68, 76, 84, 97],
        borderColor: '#facf5a',
        backgroundColor: 'rgba(250, 207, 90, 0.18)',
        tension: 0.35,
        fill: true,
        pointRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f1a2e',
        titleColor: '#ffffff',
        bodyColor: '#d8dbeb'
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.08)' },
        ticks: { color: '#cbd5e1' }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.08)' },
        ticks: { color: '#cbd5e1' }
      }
    }
  };

  return (
    <div className="chart-card">
      <div className="panel-header">
        <div>
          <p className="panel-label">Tendencia de entregas</p>
          <h3>Rutas efectivas</h3>
        </div>
      </div>
      <div className="chart-wrapper">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
