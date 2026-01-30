const registros = getData('registros');
const medicos = getData('medicos');

const medicoSelect = document.getElementById('filtroMedico');
medicoSelect.innerHTML = '<option value="">Todos</option>';
medicos.forEach(m => medicoSelect.innerHTML += `<option>${m}</option>`);

let graficoValores;
let graficoStatus;

function filtrar() {
  const inicio = dataInicio.value;
  const fim = dataFim.value;
  const medico = filtroMedico.value;
  const status = document.getElementById('status').value;

  let filtrados = registros.filter(r => {
    if (inicio && r.data < inicio) return false;
    if (fim && r.data > fim) return false;
    if (medico && r.medico !== medico) return false;

    const resto = r.total - r.pago;

    if (status === 'pago' && resto !== 0) return false;
    if (status === 'pendente' && r.pago !== 0) return false;
    if (status === 'parcial' && (r.pago === 0 || resto === 0)) return false;

    return true;
  });

  renderLista(filtrados);
  renderGraficos(filtrados);
}

function renderLista(lista) {
  const div = document.getElementById('resultado');
  div.innerHTML = '';

  lista.forEach(r => {
    const resto = r.total - r.pago;

    let cor = 'success';
    if (resto > 0 && r.pago > 0) cor = 'warning';
    if (r.pago === 0) cor = 'danger';

    div.innerHTML += `
      <div class="border border-${cor} p-3 mb-2">
        <strong>Paciente:</strong> ${r.paciente}<br>
        <strong>Médico:</strong> ${r.medico}<br>
        <strong>Tratamento:</strong> ${r.tratamento}<br>
        <strong>Pagamento:</strong> ${r.pagamento}<br>
        <strong>Total:</strong> R$ ${r.total}<br>
        <strong>Pago:</strong> R$ ${r.pago}<br>
        <strong>A receber:</strong> R$ ${resto}
      </div>
    `;
  });
}

function renderGraficos(lista) {
  let recebido = 0;
  let receber = 0;
  let pago = 0;
  let parcial = 0;
  let pendente = 0;

  lista.forEach(r => {
    recebido += r.pago;
    receber += (r.total - r.pago);

    if (r.total === r.pago) pago++;
    else if (r.pago === 0) pendente++;
    else parcial++;
  });

  if (graficoValores) graficoValores.destroy();
  if (graficoStatus) graficoStatus.destroy();

  graficoValores = new Chart(document.getElementById('graficoValores'), {
    type: 'bar',
    data: {
      labels: ['Recebido', 'A receber'],
      datasets: [{
        data: [recebido, receber],
        backgroundColor: ['#198754', '#dc3545']
      }]
    }
  });

  graficoStatus = new Chart(document.getElementById('graficoStatus'), {
    type: 'pie',
    data: {
      labels: ['Pago', 'Parcial', 'Pendente'],
      datasets: [{
        data: [pago, parcial, pendente],
        backgroundColor: ['#198754', '#ffc107', '#dc3545']
      }]
    }
  });
}

filtrar();
