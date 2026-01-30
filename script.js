// ===============================
// CHAVES DE STORAGE
// ===============================
const REGISTROS_KEY = "registrosFinanceiros";
const DENTISTAS_KEY = "dentistas";
const TRATAMENTOS_KEY = "tratamentos";
const BACKUP_PREFIX = "backup_";

// ===============================
// UTILITÁRIOS
// ===============================
function hoje() {
  return new Date().toISOString().split("T")[0];
}

function getStorage(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ===============================
// MÉDICOS
// ===============================
function carregarSelectDentistas() {
  const select = document.getElementById("medico");
  select.innerHTML = `<option value="">Selecione</option>`;

  getStorage(DENTISTAS_KEY).forEach(nome => {
    select.innerHTML += `<option value="${nome}">${nome}</option>`;
  });
}

function adicionarDentista() {
  const input = document.getElementById("novoDentista");
  const nome = input.value.trim();
  if (!nome) return;

  const dentistas = getStorage(DENTISTAS_KEY);
  if (!dentistas.includes(nome)) {
    dentistas.push(nome);
    dentistas.sort();
    setStorage(DENTISTAS_KEY, dentistas);
  }

  input.value = "";
  carregarSelectDentistas();
}

function fecharModalMedico() {
  bootstrap.Modal.getInstance(
    document.getElementById("modalMedico")
  ).hide();
}

// ===============================
// TRATAMENTOS
// ===============================
function carregarSelectTratamentos() {
  const select = document.getElementById("tratamento");
  select.innerHTML = `<option value="">Selecione</option>`;

  getStorage(TRATAMENTOS_KEY).forEach(nome => {
    select.innerHTML += `<option value="${nome}">${nome}</option>`;
  });
}

function adicionarTratamento() {
  const input = document.getElementById("novoTratamento");
  const nome = input.value.trim();
  if (!nome) return;

  const tratamentos = getStorage(TRATAMENTOS_KEY);
  if (!tratamentos.includes(nome)) {
    tratamentos.push(nome);
    tratamentos.sort();
    setStorage(TRATAMENTOS_KEY, tratamentos);
  }

  input.value = "";
  carregarSelectTratamentos();
}

function fecharModalTratamento() {
  bootstrap.Modal.getInstance(
    document.getElementById("modalTratamento")
  ).hide();
}

// ===============================
// REGISTROS FINANCEIROS
// ===============================
function salvarRegistro() {
  const registro = {
    id: Date.now(),
    data: document.getElementById("data").value,
    paciente: document.getElementById("paciente").value.trim(),
    medico: document.getElementById("medico").value,
    tratamento: document.getElementById("tratamento").value,
    valorTotal: Number(document.getElementById("valorTotal").value),
    valorPago: Number(document.getElementById("valorPago").value),
    formaPagamento: document.getElementById("formaPagamento").value,
    observacao: document.getElementById("observacao").value || ""
  };

  if (!registro.data || !registro.paciente || !registro.medico || !registro.tratamento) {
    alert("Preencha todos os campos obrigatórios");
    return;
  }

  const registros = getStorage(REGISTROS_KEY);
  registros.push(registro);
  setStorage(REGISTROS_KEY, registros);

  document.querySelector("form").reset();
  document.getElementById("data").value = hoje();

  listarRegistrosDoDia(registro.data);
  atualizarDashboard();
}

// ===============================
// LISTAGEM
// ===============================
function listarRegistrosDoDia(dataSelecionada) {
  const lista = document.getElementById("listaHoje");
  lista.innerHTML = "";

  getStorage(REGISTROS_KEY)
    .filter(r => r.data === dataSelecionada)
    .forEach(r => {
      const restante = r.valorTotal - r.valorPago;

      lista.innerHTML += `
        <div class="card mb-3 shadow-sm">
          <div class="card-body">
            <h6 class="text-primary">Paciente: ${r.paciente}</h6>

            <p><strong>Médico:</strong> ${r.medico}</p>
            <p><strong>Tratamento:</strong> ${r.tratamento}</p>
            <p><strong>Pagamento:</strong> ${r.formaPagamento}</p>

            ${r.observacao ? `<p><strong>Obs:</strong> ${r.observacao}</p>` : ""}

            <hr>

            <p><strong>Total:</strong> R$ ${r.valorTotal.toFixed(2)}</p>
            <p class="text-success"><strong>Pago:</strong> R$ ${r.valorPago.toFixed(2)}</p>

            ${
              restante > 0
                ? `<p class="text-danger"><strong>A receber:</strong> R$ ${restante.toFixed(2)}</p>`
                : `<p class="text-success"><strong>Quitado</strong></p>`
            }
          </div>
        </div>
      `;
    });
}

// ===============================
// DASHBOARD
// ===============================
function atualizarDashboard() {
  const registros = getStorage(REGISTROS_KEY);

  let recebido = 0;
  let aReceber = 0;

  registros.forEach(r => {
    recebido += r.valorPago;
    aReceber += (r.valorTotal - r.valorPago);
  });

  document.getElementById("totalRecebido").innerText =
    "R$ " + recebido.toFixed(2);

  document.getElementById("totalReceber").innerText =
    "R$ " + aReceber.toFixed(2);
}

// ===============================
// EXPORTAR CSV
// ===============================
function exportarCSV() {
  const registros = getStorage(REGISTROS_KEY);
  if (!registros.length) {
    alert("Não há dados para exportar");
    return;
  }

  const cabecalho = Object.keys(registros[0]).join(",");
  const linhas = registros.map(r =>
    Object.values(r).join(",")
  );

  const csv = [cabecalho, ...linhas].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "financeiro_odontologico.csv";
  link.click();
}

// ===============================
// BACKUP AUTOMÁTICO (DIA 20)
// ===============================
function backupAutomatico() {
  const hojeData = new Date();
  const dia = hojeData.getDate();
  const mesAno = hojeData.toISOString().slice(0, 7);

  if (dia === 20) {
    const chave = BACKUP_PREFIX + mesAno;
    if (!localStorage.getItem(chave)) {
      localStorage.setItem(chave, JSON.stringify(getStorage(REGISTROS_KEY)));
      console.log("Backup criado:", chave);
    }
  }
}

// ===============================
// INICIALIZAÇÃO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("data").value = hoje();

  carregarSelectDentistas();
  carregarSelectTratamentos();

  listarRegistrosDoDia(hoje());
  atualizarDashboard();
  backupAutomatico();
});
