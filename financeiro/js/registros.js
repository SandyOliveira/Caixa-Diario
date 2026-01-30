// =====================
// DATA DE HOJE
// =====================
const hoje = new Date().toISOString().split('T')[0];
document.getElementById('data').value = hoje;
let saldoAtualPaciente = null;
let pacienteQuitado = false;

// =====================
// CARREGAMENTO INICIAL
// =====================
function init() {
    carregarMedicos();
    carregarTratamentos();
    carregarPacientes();
    renderizar();
}


init();

// =====================
// SELECTS
// =====================
function carregarMedicos() {
    preencherSelect('medico', getData('medicos'));
}

function carregarTratamentos() {
    preencherSelect('tratamento', getData('tratamentos'));
}


function preencherSelect(id, lista) {
    const select = document.getElementById(id);
    select.innerHTML = '<option value="">Selecione</option>';

    lista.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item;
        opt.textContent = item;
        select.appendChild(opt);
    });
}

// =====================
// PACIENTES (AUTOCOMPLETE)
// =====================
function carregarPacientes() {
    const datalist = document.getElementById('listaPacientes');
    datalist.innerHTML = '';

    const registros = getData('registros');

    const pacientesUnicos = [...new Set(
        registros
            .map(r => r.paciente?.trim())
            .filter(Boolean)
    )];

    pacientesUnicos.forEach(nome => {
        const opt = document.createElement('option');
        opt.value = nome;
        datalist.appendChild(opt);
    });
}

// =====================
// CADASTRO MÉDICO
// =====================
function addMedico() {
    const input = document.getElementById('novoMedico');
    const nome = input.value.trim().toUpperCase();
    if (!nome) return;

    const lista = getData('medicos');
    if (lista.includes(nome)) {
        alert('Esse médico já está cadastrado.');
        return;
    }

    lista.push(nome);
    setData('medicos', lista);

    carregarMedicos();
    medico.value = nome;

    input.value = '';
    bootstrap.Modal.getInstance(
        document.getElementById('modalMedico')
    ).hide();
}

// =====================
// CADASTRO TRATAMENTO
// =====================
function addTratamento() {
    const input = document.getElementById('novoTratamento');
    const nome = input.value.trim().toUpperCase();
    if (!nome) return;

    const lista = getData('tratamentos');
    if (lista.includes(nome)) {
        alert('Esse tratamento já está cadastrado.');
        return;
    }

    lista.push(nome);
    setData('tratamentos', lista);

    carregarTratamentos();
    tratamento.value = nome;

    input.value = '';
    bootstrap.Modal.getInstance(
        document.getElementById('modalTratamento')
    ).hide();
}

// =====================
// SALVAR REGISTRO
// =====================
function salvarRegistro() {

    if (!paciente.value || !tratamento.value || !valorTotal.value) {
        alert('Preencha paciente, tratamento e valor total.');
        return;
    }

    if (!valorPago.value || Number(valorPago.value) <= 0) {
        alert('Informe o valor pago.');
        return;
    }

    if (saldoAtualPaciente !== null && saldoAtualPaciente <= 0) {
        alert('Tratamento já quitado. Registre um novo tratamento.');
        return;
    }

    const registros = getData('registros');

    registros.push({
        data: data.value,
        paciente: paciente.value.trim(),
        medico: medico.value,
        tratamento: tratamento.value,
        total: Number(valorTotal.value),
        pago: Number(valorPago.value),
        pagamento: pagamento.value,
        obs: obs.value
    });

    setData('registros', registros);

    limparFormulario();
    carregarPacientes();
    renderizar();
}


// =====================
// LIMPAR CAMPOS
// =====================
function limparFormulario() {
    paciente.value = '';
    medico.value = '';
    tratamento.value = '';
    valorTotal.value = '';
    valorPago.value = '';
    obs.value = '';
    pagamento.value = 'Dinheiro';
    data.value = hoje;
}

// =====================
// RENDERIZAÇÃO
// =====================
function renderizar() {
    const lista = document.getElementById('listaRegistros');
    lista.innerHTML = '';

    let recebido = 0;
    let receber = 0;

    const registrosHoje = getData('registros')
        .filter(r => r.data === hoje);

    registrosHoje.forEach(r => {
        recebido += r.pago;
        receber += (r.total - r.pago);

        const status =
            r.pago === r.total ? 'success' :
                r.pago > 0 ? 'warning' : 'danger';

        lista.innerHTML += `
      <div class="border p-3 mb-2 border-${status}">
        <strong>Paciente:</strong> ${r.paciente}<br>
        <strong>Médico:</strong> ${r.medico || '-'}<br>
        <strong>Tratamento:</strong> ${r.tratamento}<br>
        <strong>Total:</strong> R$ ${r.total.toFixed(2)} |
        <strong>Pago:</strong> R$ ${r.pago.toFixed(2)} |
        <strong>Falta:</strong> R$ ${(r.total - r.pago).toFixed(2)}
      </div>
    `;
    });

    totalRecebido.innerText = recebido.toLocaleString('pt-BR', {
        style: 'currency', currency: 'BRL'
    });

    totalReceber.innerText = receber.toLocaleString('pt-BR', {
        style: 'currency', currency: 'BRL'
    });
}
document.getElementById('paciente').addEventListener('change', autopreencherPaciente);

function autopreencherPaciente() {
    const nome = paciente.value.trim();
    const infoBox = document.getElementById('infoPaciente');
    if (!nome) return infoBox.classList.add('d-none');

    const registros = getData('registros');

    // pega o ÚLTIMO tratamento desse paciente
    const ultimoRegistro = [...registros]
        .reverse()
        .find(r => r.paciente === nome);

    if (!ultimoRegistro) {
        infoBox.classList.add('d-none');
        return;
    }

    const tratamentoAtual = ultimoRegistro.tratamento;
    const valorTotalTratamento = ultimoRegistro.total;

    // soma pagamentos SOMENTE desse tratamento
    const pagamentosTratamento = registros.filter(r =>
        r.paciente === nome &&
        r.tratamento === tratamentoAtual
    );

    const totalPago = pagamentosTratamento.reduce((s, r) => s + r.pago, 0);
    const falta = valorTotalTratamento - totalPago;

    // autopreenche
    medico.value = ultimoRegistro.medico;
    tratamento.value = tratamentoAtual;
    valorTotal.value = valorTotalTratamento;
    valorPago.value = '';

    // infos visuais
    infoPago.innerText = totalPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    infoFalta.innerText = falta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    infoData.innerText = ultimoRegistro.data.split('-').reverse().join('/');

    infoBox.classList.remove('d-none');

    saldoAtualPaciente = falta;
    pacienteQuitado = falta <= 0;

    obs.value = pacienteQuitado ? 'Tratamento quitado' : 'Pagamento complementar';

    btnNovoTratamento.classList.toggle('d-none', !pacienteQuitado);
}

function novoTratamento() {
    tratamento.value = '';
    valorTotal.value = '';
    valorPago.value = '';
    obs.value = '';

    saldoAtualPaciente = null;
    pacienteQuitado = false;

    infoPaciente.classList.add('d-none');
    btnNovoTratamento.classList.add('d-none');

    tratamento.focus();
}


//Fechamento caixa//
//Botão//
document.addEventListener('DOMContentLoaded', () => {
    const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(el => new bootstrap.Tooltip(el));
});
function controlarBotaoRelatorio() {
    const registrosHoje = getData('registros')
        .filter(r => r.data === hoje);

    const btn = document.getElementById('btnRelatorioFlutuante');

    btn.style.display = registrosHoje.length > 0 ? 'flex' : 'none';
}
controlarBotaoRelatorio();
//relatorio
function abrirRelatorioDiario() {
    gerarRelatorioDiario();

    const modal = new bootstrap.Modal(
        document.getElementById('modalRelatorio')
    );
    modal.show();
}

function gerarRelatorioDiario() {
    const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    document.getElementById('dataRelatorio').innerText =
        `Data: ${hoje.split('-').reverse().join('/')}`;

    const registros = getData('registros');

    let totalRecebido = 0;
    let totalFaturado = 0;
    let pendencias = 0;

    let novosTratamentos = [];
    let quitadosHoje = [];

    registros.forEach(r => {
        if (r.data === hoje) {
            const total = Number(r.total) || 0;
            const pago = Number(r.pago) || 0;
            const falta = total - pago;

            totalFaturado += total;
            totalRecebido += pago;
            pendencias += falta;

            novosTratamentos.push({ ...r, falta });

            if (falta === 0) {
                quitadosHoje.push(r);
            }
        }
    });

    document.getElementById('conteudoRelatorio').innerHTML = `
    <!-- RESUMO -->
    <div class="row text-center mb-4">
        <div class="col-md-3">
            <div class="border rounded p-2">
                <strong>Total Recebido</strong><br>
                <span class="text-success">
                    R$ ${totalRecebido.toFixed(2)}
                </span>
            </div>
        </div>

        <div class="col-md-3">
            <div class="border rounded p-2">
                <strong>Total Faturado</strong><br>
                R$ ${totalFaturado.toFixed(2)}
            </div>
        </div>

        <div class="col-md-3">
            <div class="border rounded p-2">
                <strong>Pendências</strong><br>
                <span class="text-warning">
                    R$ ${pendencias.toFixed(2)}
                </span>
            </div>
        </div>

        <div class="col-md-3">
            <div class="border rounded p-2">
                <strong>Atendimentos</strong><br>
                ${novosTratamentos.length}
            </div>
        </div>
    </div>

    <!-- NOVOS -->
    <h6>🆕 Tratamentos do Dia</h6>
    ${novosTratamentos.length ? `
        <table class="table table-sm">
            <thead>
                <tr>
                    <th>Paciente</th>
                    <th>Tratamento</th>
                    <th>Médico</th>
                    <th>Total</th>
                    <th>Pago</th>
                    <th>Falta</th>
                </tr>
            </thead>
            <tbody>
                ${novosTratamentos.map(r => `
                    <tr>
                        <td>${r.paciente}</td>
                        <td>${r.tratamento}</td>
                        <td>${r.medico || '-'}</td>
                        <td>R$ ${r.total.toFixed(2)}</td>
                        <td>R$ ${r.pago.toFixed(2)}</td>
                        <td>R$ ${r.falta.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : `<p class="text-muted">Nenhum registro hoje.</p>`}

    <!-- QUITADOS -->
    <h6 class="mt-4">🟢 Tratamentos Quitados Hoje</h6>
    ${quitadosHoje.length
        ? `<ul>${quitadosHoje.map(r =>
            `<li>${r.paciente} — ${r.tratamento}</li>`
        ).join('')}</ul>`
        : `<p class="text-muted">Nenhum quitado hoje.</p>`
    }
    `;
}



// TABELAS//

function tabelaNovosTratamentos(lista) {
    if (lista.length === 0) return `<p class="text-muted">Nenhum registro.</p>`;

    return `
    <table class="table table-sm">
      <thead>
        <tr>
          <th>Paciente</th>
          <th>Tratamento</th>
          <th>Médico</th>
          <th>Total</th>
          <th>Entrada</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map(r => `
          <tr>
            <td>${r.paciente}</td>
            <td>${r.tratamento}</td>
            <td>${r.medico}</td>
            <td>R$ ${r.valorTotal.toFixed(2)}</td>
            <td>R$ ${r.valorPago.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function tabelaPagamentos(lista) {
    if (lista.length === 0) return `<p class="text-muted">Nenhum pagamento.</p>`;

    return `
    <table class="table table-sm">
      <thead>
        <tr>
          <th>Paciente</th>
          <th>Tratamento</th>
          <th>Valor Pago</th>
          <th>Forma</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map(r => `
          <tr>
            <td>${r.paciente}</td>
            <td>${r.tratamento}</td>
            <td>R$ ${r.valorPago.toFixed(2)}</td>
            <td>${r.formaPagamento}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function listaQuitados(lista) {
    if (lista.length === 0) return `<p class="text-muted">Nenhum quitado hoje.</p>`;

    return `
    <ul>
      ${lista.map(r =>
        `<li>✔ ${r.paciente} — ${r.tratamento}</li>`
    ).join('')}
    </ul>
  `;
}

// EXPORTAÇÃO (BASE)//

function exportarCSV() {
    alert('Exportação CSV será implementada aqui');
}

function exportarPDF() {
    alert('Exportação PDF será implementada aqui');
}
