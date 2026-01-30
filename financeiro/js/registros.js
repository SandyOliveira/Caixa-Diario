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
    carregarSelects();
    carregarPacientes();
    renderizar();
}

init();

// =====================
// SELECTS
// =====================
function carregarSelects() {
    preencherSelect('medico', getData('medicos'));
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
    carregarSelects();

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
    carregarSelects();

    input.value = '';
    bootstrap.Modal.getInstance(
        document.getElementById('modalTratamento')
    ).hide();
}

// =====================
// SALVAR REGISTRO
// =====================
function salvarRegistro() {
   

    // paciente já quitou tudo
    if (saldoAtualPaciente !== null && saldoAtualPaciente <= 0) {
        alert('Este paciente já quitou o tratamento. Para novo atendimento, registre um novo tratamento.');
        return;
    }

    if (!paciente.value || !tratamento.value || !valorTotal.value) {
        alert('Preencha paciente, tratamento e valor total.');
        return;
    }

    if (!valorPago.value || Number(valorPago.value) <= 0) {
        alert('Informe o valor pago neste atendimento.');
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

    saldoAtualPaciente = null;
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

    if (!nome) {
        infoBox.classList.add('d-none');
        return;
    }

    const registros = getData('registros')
        .filter(r => r.paciente === nome);

    if (registros.length === 0) {
        infoBox.classList.add('d-none');
        return;
    }

    // soma total pago
    const totalPago = registros.reduce((s, r) => s + r.pago, 0);

    // assume mesmo tratamento/valor (último registro)
    const ultimo = registros[registros.length - 1];
    const totalTratamento = ultimo.total;
    const falta = totalTratamento - totalPago;

    // autopreenche formulário
    medico.value = ultimo.medico;
    tratamento.value = ultimo.tratamento;
    valorTotal.value = totalTratamento;
    valorPago.value = '';

    // infos visuais
    document.getElementById('infoPago').innerText =
        totalPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    document.getElementById('infoFalta').innerText =
        falta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    document.getElementById('infoData').innerText =
        ultimo.data.split('-').reverse().join('/');

    infoBox.classList.remove('d-none');

    saldoAtualPaciente = totalTratamento - totalPago;

    document.getElementById('infoFalta').innerText =
        saldoAtualPaciente.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

    obs.value = saldoAtualPaciente > 0
        ? 'Pagamento complementar'
        : 'Tratamento quitado';
    pacienteQuitado = saldoAtualPaciente <= 0;

    const btnNovo = document.getElementById('btnNovoTratamento');

    if (pacienteQuitado) {
        btnNovo.classList.remove('d-none');
    } else {
        btnNovo.classList.add('d-none');
    }


}
function novoTratamento() {
    // limpa vínculo com tratamento anterior
    tratamento.value = '';
    valorTotal.value = '';
    valorPago.value = '';
    obs.value = '';

    saldoAtualPaciente = null;
    pacienteQuitado = false;

    // esconde infos antigas
    document.getElementById('infoPaciente').classList.add('d-none');
    document.getElementById('btnNovoTratamento').classList.add('d-none');

    // foco no campo tratamento
    tratamento.focus();
}


