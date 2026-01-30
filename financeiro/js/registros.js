const hoje = new Date().toISOString().split('T')[0];
document.getElementById('data').value = hoje;

function carregarSelects() {
  preencher('medico', getData('medicos'));
  preencher('tratamento', getData('tratamentos'));
}

function preencher(id, lista) {
  const el = document.getElementById(id);
  el.innerHTML = '<option value="">Selecione</option>';
  lista.forEach(i => el.innerHTML += `<option>${i}</option>`);
}

function addMedico() {
  const nome = novoMedico.value.trim().toUpperCase();
  if (!nome) return;

  const lista = getData('medicos');

  // 🔒 evita duplicados
  if (lista.includes(nome)) {
    alert('Esse médico já está cadastrado.');
    return;
  }

  lista.push(nome);
  setData('medicos', lista);

  carregarSelects();

  // 🧼 limpa campo
  novoMedico.value = '';

  // ❌ fecha o modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById('modalMedico')
  );
  modal.hide();
}


function addTratamento() {
  const input = document.getElementById("novoTratamento");
  const nome = input.value.trim().toUpperCase();

  if (!nome) return;

  const lista = getData("tratamentos");

  // 🔒 evita duplicados
  if (lista.includes(nome)) {
    alert("Esse tratamento já está cadastrado.");
    return;
  }

  lista.push(nome);
  setData("tratamentos", lista);

  carregarSelects();

  // 🧼 limpa campo
  input.value = "";

  // ❌ fecha modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("modalTratamento")
  );
  modal.hide();
}


function salvarRegistro() {
  const registros = getData('registros');

  registros.push({
    data: data.value,
    paciente: paciente.value,
    medico: medico.value,
    tratamento: tratamento.value,
    total: Number(valorTotal.value),
    pago: Number(valorPago.value),
    pagamento: pagamento.value,
    obs: obs.value
  });

  setData('registros', registros);
  renderizar();
}

function renderizar() {
  const lista = document.getElementById('listaRegistros');
  lista.innerHTML = '';

  let recebido = 0, receber = 0;

  getData('registros')
    .filter(r => r.data === hoje)
    .forEach(r => {
      recebido += r.pago;
      receber += (r.total - r.pago);

      const status =
        r.pago === r.total ? 'success' :
        r.pago > 0 ? 'warning' : 'danger';

      lista.innerHTML += `
        <div class="border p-3 mb-2 border-${status}">
          <strong>Paciente: ${r.paciente}</strong> — Médico: ${r.medico}<br>
          Tratamento: ${r.tratamento} <br>
          Total: R$ ${r.total} | Pago: R$ ${r.pago} | Falta: R$ ${r.total - r.pago}
        </div>
      `;
    });

  totalRecebido.innerText = recebido.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  totalReceber.innerText = receber.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}

carregarSelects();
renderizar();
