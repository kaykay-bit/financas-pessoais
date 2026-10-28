"use strict";

const CHAVE_STORAGE = "transacoesFinanceiras";

const form = document.querySelector("#form-transacao");
const campoNome = document.querySelector("#nome");
const campoValor = document.querySelector("#valor");
const campoTipo = document.querySelector("#tipo");

const listaTransacoes = document.querySelector("#lista-transacoes");
const mensagemVazia = document.querySelector("#mensagem-vazia");

const totalEntradas = document.querySelector("#total-entradas");
const totalSaidas = document.querySelector("#total-saidas");
const saldoTotal = document.querySelector("#saldo-total");

let transacoes = carregarTransacoes();

function carregarTransacoes() {
  const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

  try {
    return dadosSalvos ? JSON.parse(dadosSalvos) : [];
  } catch (erro) {
    console.error("Erro ao ler os dados salvos:", erro);
    return [];
  }
}

function salvarTransacoes() {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(transacoes));
}

function formatarValor(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function calcularResumo() {
  const entradas = transacoes
    .filter(transacao => transacao.tipo === "entrada")
    .reduce((soma, transacao) => soma + transacao.valor, 0);

  const saidas = transacoes
    .filter(transacao => transacao.tipo === "saida")
    .reduce((soma, transacao) => soma + transacao.valor, 0);

  return {
    entradas,
    saidas,
    saldo: entradas - saidas
  };
}

function atualizarResumo() {
  const resumo = calcularResumo();

  totalEntradas.textContent = formatarValor(resumo.entradas);
  totalSaidas.textContent = formatarValor(resumo.saidas);
  saldoTotal.textContent = formatarValor(resumo.saldo);

  saldoTotal.style.color =
    resumo.saldo < 0 ? "var(--vermelho)" : "var(--azul)";
}

function criarLinha(transacao) {
  const linha = document.createElement("tr");

  const celulaNome = document.createElement("td");
  celulaNome.textContent = transacao.nome;

  const celulaValor = document.createElement("td");
  celulaValor.textContent = formatarValor(transacao.valor);

  const celulaTipo = document.createElement("td");
  celulaTipo.textContent =
    transacao.tipo === "entrada" ? "Entrada" : "Saída";
  celulaTipo.classList.add(
    transacao.tipo === "entrada" ? "tipo-entrada" : "tipo-saida"
  );

  const celulaAcao = document.createElement("td");
  const botaoExcluir = document.createElement("button");
  botaoExcluir.textContent = "Excluir";
  botaoExcluir.classList.add("botao-excluir");
  botaoExcluir.setAttribute("aria-label", `Excluir ${transacao.nome}`);

  botaoExcluir.addEventListener("click", () => {
    removerTransacao(transacao.id);
  });

  celulaAcao.appendChild(botaoExcluir);

  linha.append(celulaNome, celulaValor, celulaTipo, celulaAcao);
  return linha;
}

function renderizarTransacoes() {
  listaTransacoes.innerHTML = "";

  if (transacoes.length === 0) {
    mensagemVazia.style.display = "block";
    return;
  }

  mensagemVazia.style.display = "none";

  transacoes.forEach(transacao => {
    listaTransacoes.appendChild(criarLinha(transacao));
  });
}

function adicionarTransacao(evento) {
  evento.preventDefault();

  const nome = campoNome.value.trim();
  const valor = Number(campoValor.value);
  const tipo = campoTipo.value;

  if (!nome || !valor || valor <= 0 || !tipo) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  const novaTransacao = {
    id: Date.now(),
    nome,
    valor,
    tipo
  };

  transacoes.push(novaTransacao);

  salvarTransacoes();
  renderizarTransacoes();
  atualizarResumo();

  form.reset();
  campoNome.focus();
}

function removerTransacao(id) {
  transacoes = transacoes.filter(transacao => transacao.id !== id);

  salvarTransacoes();
  renderizarTransacoes();
  atualizarResumo();
}

form.addEventListener("submit", adicionarTransacao);

renderizarTransacoes();
atualizarResumo();