"use strict";

/* =====================================================================
   Plano Alimentar Para Lactantes, Quiz de Vendas
   Lógica do quiz: navegação entre etapas, estado das respostas,
   cálculos (IMC, meta de peso, projeção com ritmo seguro),
   personalização e notificações de compra fake.
   ===================================================================== */

/* ---------------------------------------------------------------------
   LINKS DE CHECKOUT
   Um link por oferta (preços diferentes = produtos diferentes no
   checkout). Troque aqui se algum dia o link mudar, é o único lugar
   do projeto que precisa ser editado.
   --------------------------------------------------------------------- */
const CHECKOUT_URL_SUPER = "https://plano.akilasamara.com.br/?preco=1990";
const CHECKOUT_URL_BASICO = "https://plano.akilasamara.com.br/?preco=1090";

/* ---------------------------------------------------------------------
   Rastreamento de funil (painel interno da Ákila, projeto separado
   "painel-akila"). Manda um evento "etapa vista" sempre que a pessoa
   entra numa etapa, e um "opção selecionada" sempre que ela marca uma
   resposta — só isso, pra enxergar em que etapa os leads desistem e
   quais respostas escolhem. Nunca compete com o carregamento inicial:
   os eventos ficam numa fila até a página terminar de carregar (mesmo
   atraso de 1200ms já usado para o Pixel/Clarity logo abaixo no HTML),
   e depois disso cada envio usa navigator.sendBeacon, feito
   especificamente pelo navegador para despachar em segundo plano sem
   travar nada e sem esperar resposta. Se essa URL não for trocada pela
   do painel publicado, os eventos simplesmente falham em silêncio (o
   catch abaixo garante isso) e o quiz continua funcionando normal.
   --------------------------------------------------------------------- */
const PAINEL_EVENTOS_URL = "https://painel-akila.gabrielcavalcantepro89.workers.dev/api/eventos";
const sessaoIdPainel = (window.crypto && crypto.randomUUID)
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

let painelEventosProntos = false;
let filaEventosPainel = [];

function despacharEventoPainel(corpo) {
  try {
    const json = JSON.stringify(corpo);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(PAINEL_EVENTOS_URL, new Blob([json], { type: "text/plain" }));
    } else {
      fetch(PAINEL_EVENTOS_URL, { method: "POST", body: json, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
    }
  } catch (e) {
    /* rastreamento nunca pode quebrar o quiz */
  }
}

function enviarEventoPainel(payload) {
  const corpo = { sessaoId: sessaoIdPainel, nome: state.nome || null, ts: Date.now(), ...payload };
  if (!painelEventosProntos) {
    filaEventosPainel.push(corpo);
    return;
  }
  despacharEventoPainel(corpo);
}

function ativarEventosPainel() {
  painelEventosProntos = true;
  filaEventosPainel.forEach(despacharEventoPainel);
  filaEventosPainel = [];
}

if (document.readyState === "complete") {
  setTimeout(ativarEventosPainel, 1200);
} else {
  window.addEventListener("load", () => setTimeout(ativarEventosPainel, 1200));
}

/* ---------------------------------------------------------------------
   Ritmo máximo de emagrecimento (kg/semana) usado para colocar um teto
   realista na projeção (Etapa 20 em diante). Valor sugerido pela
   nutricionista (4 kg/mês); pendente de confirmação final dela, ver
   copy-alterações.md seção 11. Fácil de ajustar, é só mudar aqui.
   --------------------------------------------------------------------- */
const RITMO_MAX_KG_SEMANA = 1;

/* ---------------------------------------------------------------------
   Lista de notificações de compra fake (Etapa 24 em diante).
   Decisão de negócio já confirmada com a cliente: nomes e cidades
   fictícios, não reaproveitados de nenhum quiz de referência.
   55 combinações de nome + cidade + estado para dar variedade real
   antes de qualquer repetição (a fila embaralha e percorre a lista
   inteira antes de reiniciar, ver iniciarNotificacoesFake).
   --------------------------------------------------------------------- */
const NOMES_COMPRAS_FAKE = [
  { nome: "Ana Beatriz", cidade: "Recife", estado: "PE" },
  { nome: "Camila", cidade: "Curitiba", estado: "PR" },
  { nome: "Fernanda", cidade: "Belo Horizonte", estado: "MG" },
  { nome: "Juliana", cidade: "Porto Alegre", estado: "RS" },
  { nome: "Larissa", cidade: "Fortaleza", estado: "CE" },
  { nome: "Mariana", cidade: "Salvador", estado: "BA" },
  { nome: "Patrícia", cidade: "Campinas", estado: "SP" },
  { nome: "Rafaela", cidade: "Goiânia", estado: "GO" },
  { nome: "Tatiane", cidade: "Florianópolis", estado: "SC" },
  { nome: "Vanessa", cidade: "Natal", estado: "RN" },
  { nome: "Beatriz", cidade: "São Paulo", estado: "SP" },
  { nome: "Carla", cidade: "Rio de Janeiro", estado: "RJ" },
  { nome: "Débora", cidade: "Brasília", estado: "DF" },
  { nome: "Elaine", cidade: "Manaus", estado: "AM" },
  { nome: "Franciele", cidade: "Belém", estado: "PA" },
  { nome: "Gabriela", cidade: "Vitória", estado: "ES" },
  { nome: "Helena", cidade: "Joinville", estado: "SC" },
  { nome: "Isabela", cidade: "Londrina", estado: "PR" },
  { nome: "Jaqueline", cidade: "Uberlândia", estado: "MG" },
  { nome: "Karina", cidade: "Campo Grande", estado: "MS" },
  { nome: "Letícia", cidade: "Cuiabá", estado: "MT" },
  { nome: "Marcela", cidade: "João Pessoa", estado: "PB" },
  { nome: "Nathalia", cidade: "Maceió", estado: "AL" },
  { nome: "Priscila", cidade: "Aracaju", estado: "SE" },
  { nome: "Renata", cidade: "Teresina", estado: "PI" },
  { nome: "Simone", cidade: "São Luís", estado: "MA" },
  { nome: "Talita", cidade: "Palmas", estado: "TO" },
  { nome: "Uiara", cidade: "Porto Velho", estado: "RO" },
  { nome: "Valentina", cidade: "Rio Branco", estado: "AC" },
  { nome: "Wanessa", cidade: "Boa Vista", estado: "RR" },
  { nome: "Amanda", cidade: "Macapá", estado: "AP" },
  { nome: "Bruna", cidade: "Sorocaba", estado: "SP" },
  { nome: "Daniela", cidade: "Niterói", estado: "RJ" },
  { nome: "Eduarda", cidade: "Contagem", estado: "MG" },
  { nome: "Flávia", cidade: "Caxias do Sul", estado: "RS" },
  { nome: "Giovana", cidade: "Uberaba", estado: "MG" },
  { nome: "Ingrid", cidade: "Feira de Santana", estado: "BA" },
  { nome: "Jéssica", cidade: "Juazeiro do Norte", estado: "CE" },
  { nome: "Kelly", cidade: "Juiz de Fora", estado: "MG" },
  { nome: "Luana", cidade: "Aparecida de Goiânia", estado: "GO" },
  { nome: "Mayara", cidade: "Anápolis", estado: "GO" },
  { nome: "Natália", cidade: "Blumenau", estado: "SC" },
  { nome: "Olívia", cidade: "Caruaru", estado: "PE" },
  { nome: "Paula", cidade: "Petrolina", estado: "PE" },
  { nome: "Queila", cidade: "Montes Claros", estado: "MG" },
  { nome: "Roberta", cidade: "Vila Velha", estado: "ES" },
  { nome: "Sabrina", cidade: "Diadema", estado: "SP" },
  { nome: "Thais", cidade: "Canoas", estado: "RS" },
  { nome: "Vitória", cidade: "Pelotas", estado: "RS" },
  { nome: "Yasmin", cidade: "Bauru", estado: "SP" },
  { nome: "Zuleide", cidade: "Franca", estado: "SP" },
  { nome: "Alessandra", cidade: "Piracicaba", estado: "SP" },
  { nome: "Bianca", cidade: "Jundiaí", estado: "SP" },
  { nome: "Cristiane", cidade: "São José dos Campos", estado: "SP" },
  { nome: "Denise", cidade: "Chapecó", estado: "SC" },
];

/* ---------------------------------------------------------------------
   Estado do quiz
   --------------------------------------------------------------------- */
const state = {
  idade: null,
  corpoImagem: null,
  objetivo: null,
  objetivoLabel: null,
  corpoTexto: null,
  partesCorpo: [],
  tempoAmamentando: null,
  tempoAmamentandoLabel: null,
  jaTentou: [],
  nome: "",
  posParto: null,
  espelho: null,
  espelhoLabel: null,
  alimentacaoPosBebe: [],
  travouResultados: null,
  travouResultadosLabel: null,
  momentoComida: null,
  momentoComidaLabel: null,
  sono: null,
  sonoLabel: null,
  tempoPreparo: null,
  tempoPreparoLabel: null,
  aplv: null,
  pesoAtual: 70,
  altura: 165,
  pesoDesejado: 60,
  ocasiaoEspecial: null,
  ocasiaoEspecialLabel: null,
  prazoObjetivo: null,
  projecao: null,
};

/* ---------------------------------------------------------------------
   Ordem lógica das 29 telas do quiz (fonte única de verdade pra barra
   de progresso e pro botão Voltar). As etapas 7 e 21 da versão antiga
   foram removidas; N1-N5 são as novas. Os números das etapas mantidas
   não mudaram, só a sequência entre elas.
   --------------------------------------------------------------------- */
const ETAPAS_ORDEM = [
  "0", "1", "2", "3", "4", "5", "6",
  "n1", "8", "9", "10",
  "n2", "n3", "11",
  "n4", "n5", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "22", "bio", "23", "24", "25",
];
const ETAPAS_SEM_BOTAO_VOLTAR = new Set(["0", "22", "bio", "23", "24", "25"]);
let etapaAtual = "0";

/* ---------------------------------------------------------------------
   Utilidades
   --------------------------------------------------------------------- */
function aleatorioEntre(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const MESES_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function formatarData(data) {
  const hoje = new Date();
  const sufixoAno = data.getFullYear() !== hoje.getFullYear() ? ` de ${data.getFullYear()}` : "";
  return `${data.getDate()} de ${MESES_PT[data.getMonth()]}${sufixoAno}`;
}

function formatarDataCurta(data) {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}`;
}

/* ---------------------------------------------------------------------
   Navegação entre etapas
   --------------------------------------------------------------------- */
function irPara(indice) {
  indice = String(indice);
  const atualEl = document.querySelector(`.etapa[data-etapa="${etapaAtual}"]`);
  const novaEl = document.querySelector(`.etapa[data-etapa="${indice}"]`);
  if (!novaEl) return;

  if (etapaAtual === "0" && indice !== "0") pararContadorSocial();

  if (atualEl) atualEl.classList.remove("etapa-ativa");
  novaEl.classList.add("etapa-ativa");
  etapaAtual = indice;
  enviarEventoPainel({ tipo: "etapa_vista", etapa: indice });

  atualizarProgresso(indice);
  atualizarBotaoVoltar(indice);
  window.scrollTo(0, 0);
  aoEntrarEtapa(indice);
}

function atualizarProgresso(indice) {
  const wrap = document.getElementById("barra-progresso-wrap");
  if (indice === "0") {
    wrap.classList.add("oculto");
    return;
  }
  wrap.classList.remove("oculto");
  const posicao = ETAPAS_ORDEM.indexOf(indice);
  const pct = Math.round((posicao / (ETAPAS_ORDEM.length - 1)) * 100);
  document.getElementById("barra-progresso-fill").style.width = pct + "%";
}

function atualizarBotaoVoltar(indice) {
  const btn = document.getElementById("btn-voltar");
  if (ETAPAS_SEM_BOTAO_VOLTAR.has(indice)) {
    btn.classList.add("oculto");
  } else {
    btn.classList.remove("oculto");
  }
}

/* ---------------------------------------------------------------------
   Opções (single-select e multi-select), genérico para todas as etapas
   ---------------------------------------------------------------------
   Cada container `.lista-opcoes` / `.grade-opcoes` carrega:
   - data-tipo="single" | "multi"
   - data-campo="<chave no state>"
   - data-proxima="<índice da próxima etapa>" (single, avanço automático)
   - data-manual="true" (single, não avança sozinho; um botão externo avança)
   --------------------------------------------------------------------- */
/* Campos de seleção que, igual à Etapa 20, revelam um bloco de destaque
   com uma "reação" + botão Continuar em vez de avançar sozinhos. */
const CAMPOS_COM_REACAO = {
  prazoObjetivo: { boxId: "box-etapa-20", btnId: "btn-continuar-20" },
  jaTentou: { boxId: "box-etapa-n1", btnId: "btn-continuar-n1" },
  espelho: { boxId: "box-etapa-n2", btnId: "btn-continuar-n2" },
  alimentacaoPosBebe: { boxId: "box-etapa-n3", btnId: "btn-continuar-n3" },
  momentoComida: { boxId: "box-etapa-n4", btnId: "btn-continuar-n4" },
  sono: { boxId: "box-etapa-n5", btnId: "btn-continuar-n5" },
};

function configurarOpcoes() {
  document.querySelectorAll(".lista-opcoes[data-tipo], .grade-opcoes[data-tipo]").forEach((container) => {
    container.addEventListener("click", (evento) => {
      const opcao = evento.target.closest("[data-valor]");
      if (!opcao || !container.contains(opcao)) return;

      const tipo = container.dataset.tipo;
      const campo = container.dataset.campo;
      const labelEl = opcao.querySelector(".opcao-label, .opcao-cartao-label");
      const label = labelEl ? labelEl.textContent.trim() : opcao.textContent.trim();
      const config = CAMPOS_COM_REACAO[campo];

      if (tipo === "single") {
        container.querySelectorAll("[data-valor]").forEach((o) => o.classList.remove("selecionada"));
        opcao.classList.add("selecionada");
        state[campo] = opcao.dataset.valor;
        state[campo + "Label"] = label;
        enviarEventoPainel({ tipo: "opcao_selecionada", etapa: container.closest(".etapa").dataset.etapa, campo, valor: opcao.dataset.valor, label });

        if (config) {
          document.getElementById(config.boxId).classList.remove("oculto");
          document.getElementById(config.btnId).classList.remove("oculto");
          atualizarReacaoCampo(campo);
        }

        if (container.dataset.manual !== "true") {
          const proxima = container.dataset.proxima;
          setTimeout(() => irPara(proxima), 320);
        }
      } else if (tipo === "multi") {
        if (opcao.dataset.exclusiva === "true") {
          const vaiSelecionar = !opcao.classList.contains("selecionada");
          container.querySelectorAll("[data-valor]").forEach((o) => o.classList.remove("selecionada"));
          if (vaiSelecionar) opcao.classList.add("selecionada");
        } else {
          opcao.classList.toggle("selecionada");
          const exclusiva = container.querySelector('[data-exclusiva="true"]');
          if (exclusiva) exclusiva.classList.remove("selecionada");
        }

        const selecionados = Array.from(container.querySelectorAll(".selecionada")).map((o) => o.dataset.valor);
        state[campo] = selecionados;
        if (opcao.classList.contains("selecionada")) {
          enviarEventoPainel({ tipo: "opcao_selecionada", etapa: container.closest(".etapa").dataset.etapa, campo, valor: opcao.dataset.valor, label });
        }

        if (config) {
          const temSelecao = selecionados.length > 0;
          document.getElementById(config.boxId).classList.toggle("oculto", !temSelecao);
          document.getElementById(config.btnId).classList.toggle("oculto", !temSelecao);
          if (temSelecao) atualizarReacaoCampo(campo);
        } else {
          const etapaEl = container.closest(".etapa");
          const btnContinuar = document.getElementById("btn-continuar-" + etapaEl.dataset.etapa);
          if (btnContinuar) btnContinuar.disabled = selecionados.length === 0;
        }
      }
    });
  });
}

/* ---------------------------------------------------------------------
   Textos de "reação" das etapas com o padrão da Etapa 20 (seleciona →
   aparece bloco de destaque → aparece botão Continuar).
   --------------------------------------------------------------------- */
const PRAZO_EM_SEMANAS = {
  "4-semanas": 4,
  "2-meses": 8,
  "3-meses": 12,
  "4-meses": 16,
};

function semanasMinimasSeguras(diffKg) {
  return Math.ceil(diffKg / RITMO_MAX_KG_SEMANA);
}

function atualizarReacaoPrazo() {
  const box = document.getElementById("box-etapa-20");
  const diffKg = Math.max(0, state.pesoAtual - state.pesoDesejado);
  const semanasEscolhidas = PRAZO_EM_SEMANAS[state.prazoObjetivo] || 8;
  const semanasMinimas = semanasMinimasSeguras(diffKg);

  if (diffKg > 0 && semanasEscolhidas < semanasMinimas) {
    box.innerHTML = `💡 Para perder <strong>${diffKg} kg</strong> com segurança enquanto você amamenta, o prazo realista é de cerca de <strong>${semanasMinimas} semanas</strong>. Ajustamos a sua projeção para você chegar lá com saúde.`;
  } else {
    box.textContent = "💡 Com o Plano Alimentar Para Lactantes, mães lactantes emagrecem no ritmo seguro, de forma saudável e mantendo o leite.";
  }
}

function atualizarReacaoJaTentou() {
  document.getElementById("box-etapa-n1").textContent = state.jaTentou.includes("nenhuma")
    ? "💡 Então você está no lugar certo para começar do jeito certo, sem passar pelo que cansa tantas mães."
    : "💡 Planos feitos para quem não amamenta cobram energia e leite. Vamos entender por quê.";
}

function atualizarReacaoEspelho() {
  document.getElementById("box-etapa-n2").textContent =
    "💡 Isso é mais comum do que parece, e dá para mudar sem punir seu corpo.";
}

function atualizarReacaoAlimentacao() {
  document.getElementById("box-etapa-n3").textContent =
    "💡 A rotina de quem cuida de um bebê quase não deixa espaço para comer direito. É aí que o peso trava.";
}

function atualizarReacaoMomento() {
  document.getElementById("box-etapa-n4").textContent =
    "💡 Anotado. Seu plano vai ter uma estratégia para esse momento.";
}

function atualizarReacaoSono() {
  document.getElementById("box-etapa-n5").textContent = state.sono === "6h-mais"
    ? "💡 Ótimo, o sono é um grande aliado. Vamos aproveitar isso no seu plano."
    : "💡 Dormir pouco aumenta a fome e a vontade de doce. Não é falta de força de vontade.";
}

function atualizarReacaoCampo(campo) {
  if (campo === "prazoObjetivo") atualizarReacaoPrazo();
  else if (campo === "jaTentou") atualizarReacaoJaTentou();
  else if (campo === "espelho") atualizarReacaoEspelho();
  else if (campo === "alimentacaoPosBebe") atualizarReacaoAlimentacao();
  else if (campo === "momentoComida") atualizarReacaoMomento();
  else if (campo === "sono") atualizarReacaoSono();
}

/* ---------------------------------------------------------------------
   Botões simples de avançar (sem lógica extra)
   --------------------------------------------------------------------- */
const BOTOES_AVANCAR = {
  "btn-iniciar-quiz": "1",
  "btn-continuar-5": "6",
  "btn-continuar-n1": "8",
  "btn-continuar-8": "9",
  "btn-continuar-n2": "n3",
  "btn-continuar-n3": "11",
  "btn-continuar-n4": "n5",
  "btn-continuar-n5": "12",
  "btn-continuar-12": "13",
  "btn-continuar-13": "14",
  "btn-continuar-16": "17",
  "btn-continuar-17": "18",
  "btn-continuar-18": "19",
  "btn-continuar-20": "22",
  "btn-continuar-22": "bio",
  "btn-continuar-bio": "23",
  "btn-continuar-24": "25",
};

function configurarBotoesAvancar() {
  Object.entries(BOTOES_AVANCAR).forEach(([id, proxima]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", () => irPara(proxima));
  });

  document.getElementById("btn-voltar").addEventListener("click", () => {
    if (ETAPAS_SEM_BOTAO_VOLTAR.has(etapaAtual)) return;
    const posicaoAtual = ETAPAS_ORDEM.indexOf(etapaAtual);
    if (posicaoAtual > 0) irPara(ETAPAS_ORDEM[posicaoAtual - 1]);
  });
}

/* ---------------------------------------------------------------------
   Etapa 9: captura de nome
   --------------------------------------------------------------------- */
function configurarCapturaNome() {
  const input = document.getElementById("input-nome");
  const btn = document.getElementById("btn-nome-continuar");

  input.addEventListener("input", () => {
    input.style.borderColor = "";
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btn.click();
  });

  btn.addEventListener("click", () => {
    const valor = input.value.trim();
    if (!valor) {
      input.style.borderColor = "var(--cor-alerta)";
      input.focus();
      return;
    }
    state.nome = valor.charAt(0).toUpperCase() + valor.slice(1);
    document.querySelectorAll('[data-bind^="nome-etapa"]').forEach((el) => {
      el.textContent = state.nome;
    });
    irPara(10);
  });
}

/* ---------------------------------------------------------------------
   Sliders numéricos (Etapas 16, 17, 18)
   --------------------------------------------------------------------- */
function configurarSlider({ chave, inputId, valorId, min, max, onChange }) {
  const input = document.getElementById(inputId);
  const valorEl = document.getElementById(valorId);

  function definir(v) {
    const limite = parseInt(input.max, 10);
    const piso = parseInt(input.min, 10);
    v = Math.max(piso, Math.min(limite, v));
    input.value = v;
    valorEl.textContent = v;
    if (onChange) onChange(v);
  }

  input.min = min;
  input.max = max;

  input.addEventListener("input", () => definir(parseInt(input.value, 10)));

  document.querySelectorAll(`[data-slider="${chave}"]`).forEach((btn) => {
    btn.addEventListener("click", () => {
      const delta = parseInt(btn.dataset.delta, 10);
      definir(parseInt(input.value, 10) + delta);
    });
  });

  return definir;
}

let definirPesoDesejado;

function configurarSliders() {
  configurarSlider({
    chave: "peso-atual",
    inputId: "slider-peso-atual",
    valorId: "valor-peso-atual",
    min: 40,
    max: 150,
    onChange: (v) => { state.pesoAtual = v; },
  });

  configurarSlider({
    chave: "altura",
    inputId: "slider-altura",
    valorId: "valor-altura",
    min: 140,
    max: 200,
    onChange: (v) => { state.altura = v; },
  });

  definirPesoDesejado = configurarSlider({
    chave: "peso-desejado",
    inputId: "slider-peso-desejado",
    valorId: "valor-peso-desejado",
    min: 40,
    max: 149,
    onChange: (v) => { state.pesoDesejado = v; atualizarTextoMeta(); },
  });
}

function atualizarTextoMeta() {
  const diff = state.pesoAtual - state.pesoDesejado;
  const el = document.getElementById("texto-meta-peso");
  el.textContent = diff > 0
    ? `🎯 Meta: emagrecer ${diff} kg`
    : "Ajuste o peso desejado para calcular sua meta";
}

/* ---------------------------------------------------------------------
   Cálculos: IMC
   --------------------------------------------------------------------- */
function calcularIMC(pesoKg, alturaCm) {
  const alturaM = alturaCm / 100;
  return pesoKg / (alturaM * alturaM);
}

function categoriaIMC(imc) {
  if (imc < 18.5) return "Abaixo do peso";
  if (imc < 25) return "Saudável";
  if (imc < 30) return "Sobrepeso";
  return "Obesidade";
}

function posicaoMarcadorIMC(imc) {
  const min = 15, max = 40;
  const limitado = Math.max(min, Math.min(max, imc));
  return ((limitado - min) / (max - min)) * 100;
}

/* ---------------------------------------------------------------------
   Cálculos: projeção de peso

   Respeita o prazo escolhido pela usuária na Etapa 20 (4 semanas / 2
   meses / 3 meses / 4 meses), exceto quando esse prazo implicaria um
   ritmo acima de RITMO_MAX_KG_SEMANA: nesse caso o prazo é esticado até
   o mínimo seguro (semanasMinimasSeguras), e a Etapa 20 avisa a usuária
   disso antes de continuar (ver atualizarReacaoPrazo).
   --------------------------------------------------------------------- */
function calcularProjecao(pesoAtual, pesoDesejado, prazoKey) {
  const diffKg = Math.max(0, pesoAtual - pesoDesejado);
  const semanasEscolhidas = PRAZO_EM_SEMANAS[prazoKey] || 8;
  const semanasMinimas = diffKg > 0 ? semanasMinimasSeguras(diffKg) : 0;
  const semanasFinal = Math.max(semanasEscolhidas, semanasMinimas);

  const hoje = new Date();
  const dataFinal = new Date(hoje.getTime() + semanasFinal * 7 * 24 * 60 * 60 * 1000);

  const numPontos = diffKg > 0 ? 4 : 2;
  const pontos = [];
  for (let i = 0; i < numPontos; i++) {
    const fracao = i / (numPontos - 1);
    const pesoPonto = pesoAtual - diffKg * fracao;
    const diasNoPonto = fracao * semanasFinal * 7;
    const dataPonto = new Date(hoje.getTime() + diasNoPonto * 24 * 60 * 60 * 1000);
    pontos.push({ peso: Math.round(pesoPonto * 10) / 10, data: dataPonto });
  }

  return { diffKg, semanasFinal, dataFinal, pontos };
}

/* ---------------------------------------------------------------------
   Faixa "você pode secar entre -Xkg a -Ykg nas próximas semanas"
   (Etapa 24). Multiplicadores 0.7x / 1.1x sobre a meta de emagrecimento
   (diffKg), deduzidos batendo o exemplo de referência: meta de 10kg
   resultava em "-7 a -11 kg", ou seja 10*0.7=7 e 10*1.1=11.
   --------------------------------------------------------------------- */
function calcularFaixaSecar(diffKg) {
  const MULTIPLICADOR_MIN = 0.7;
  const MULTIPLICADOR_MAX = 1.1;

  if (diffKg <= 0) return "progresso constante";

  const minKg = Math.max(1, Math.round(diffKg * MULTIPLICADOR_MIN));
  let maxKg = Math.round(diffKg * MULTIPLICADOR_MAX);
  if (maxKg <= minKg) maxKg = minKg + 1;

  return `-${minKg}kg a -${maxKg}kg`;
}

/* ---------------------------------------------------------------------
   Gráfico de projeção (canvas, sem bibliotecas externas)
   --------------------------------------------------------------------- */
function prepararCanvasResponsivo(canvas, alturaCss) {
  const dpr = window.devicePixelRatio || 1;
  const larguraCss = canvas.parentElement.clientWidth;
  canvas.style.width = larguraCss + "px";
  canvas.style.height = alturaCss + "px";
  canvas.width = Math.round(larguraCss * dpr);
  canvas.height = Math.round(alturaCss * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, largura: larguraCss, altura: alturaCss };
}

function desenharCaixaArredondada(ctx, x, y, largura, altura, raio) {
  ctx.beginPath();
  ctx.moveTo(x + raio, y);
  ctx.arcTo(x + largura, y, x + largura, y + altura, raio);
  ctx.arcTo(x + largura, y + altura, x, y + altura, raio);
  ctx.arcTo(x, y + altura, x, y, raio);
  ctx.arcTo(x, y, x + largura, y, raio);
  ctx.closePath();
}

function desenharGraficoPeso(canvas, pontos, alturaCss, comBalaoMeta) {
  const { ctx, largura, altura } = prepararCanvasResponsivo(canvas, alturaCss);
  ctx.clearRect(0, 0, largura, altura);

  const pesos = pontos.map((p) => p.peso);
  const pesoMax = Math.max(...pesos);
  const pesoMin = Math.min(...pesos);
  const folga = Math.max(1, (pesoMax - pesoMin) * 0.35);
  const escalaMax = pesoMax + folga;
  const escalaMin = pesoMin - folga;

  const paddingEsq = 28, paddingDir = 28, paddingTopo = comBalaoMeta ? 46 : 26, paddingBaixo = 28;
  const areaLargura = largura - paddingEsq - paddingDir;
  const areaAltura = altura - paddingTopo - paddingBaixo;

  const x = (i) => paddingEsq + areaLargura * (i / (pontos.length - 1));
  const y = (peso) => paddingTopo + areaAltura * (1 - (peso - escalaMin) / (escalaMax - escalaMin));

  ctx.strokeStyle = "#e8dcc9";
  ctx.lineWidth = 1;
  for (let g = 0; g <= 2; g++) {
    const gy = paddingTopo + (areaAltura * g) / 2;
    ctx.beginPath();
    ctx.moveTo(paddingEsq, gy);
    ctx.lineTo(largura - paddingDir, gy);
    ctx.stroke();
  }

  const gradiente = ctx.createLinearGradient(0, paddingTopo, 0, altura - paddingBaixo);
  gradiente.addColorStop(0, "rgba(200,70,0,0.26)");
  gradiente.addColorStop(1, "rgba(200,70,0,0.02)");
  ctx.beginPath();
  ctx.moveTo(x(0), y(pontos[0].peso));
  pontos.forEach((p, i) => ctx.lineTo(x(i), y(p.peso)));
  ctx.lineTo(x(pontos.length - 1), altura - paddingBaixo);
  ctx.lineTo(x(0), altura - paddingBaixo);
  ctx.closePath();
  ctx.fillStyle = gradiente;
  ctx.fill();

  ctx.beginPath();
  pontos.forEach((p, i) => {
    const px = x(i), py = y(p.peso);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.strokeStyle = "#c84600";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();

  pontos.forEach((p, i) => {
    const px = x(i), py = y(p.peso);

    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#fffaf3";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#c84600";
    ctx.stroke();

    const ultimoPonto = i === pontos.length - 1;
    if (!(ultimoPonto && comBalaoMeta)) {
      ctx.textAlign = "center";
      ctx.fillStyle = "#3a2e28";
      ctx.font = "bold 12px -apple-system, Segoe UI, sans-serif";
      ctx.fillText(`${p.peso}kg`, px, py - 12);
    }

    ctx.fillStyle = "#a89a8d";
    ctx.font = "10px -apple-system, Segoe UI, sans-serif";
    const label = i === 0 ? "Hoje" : formatarDataCurta(p.data);
    ctx.fillText(label, px, altura - 10);
  });

  if (comBalaoMeta) {
    const ultimo = pontos[pontos.length - 1];
    const ux = x(pontos.length - 1);
    const uy = y(ultimo.peso);

    ctx.font = "bold 12px -apple-system, Segoe UI, sans-serif";
    const balaoTexto = `Meta ${ultimo.peso}kg`;
    const balaoLargura = ctx.measureText(balaoTexto).width + 20;
    const balaoAltura = 24;
    let balaoX = ux - balaoLargura / 2;
    balaoX = Math.max(4, Math.min(largura - balaoLargura - 4, balaoX));
    const balaoY = Math.max(2, uy - balaoAltura - 16);

    ctx.fillStyle = "#c84600";
    desenharCaixaArredondada(ctx, balaoX, balaoY, balaoLargura, balaoAltura, 7);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(ux - 6, balaoY + balaoAltura);
    ctx.lineTo(ux + 6, balaoY + balaoAltura);
    ctx.lineTo(ux, balaoY + balaoAltura + 7);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(balaoTexto, balaoX + balaoLargura / 2, balaoY + balaoAltura / 2 + 4);
  }
}

/* ---------------------------------------------------------------------
   Personalização adicional por etapa
   --------------------------------------------------------------------- */
const TEXTO_PERFIL_CORPO = {
  "gordura-acumulada": "tendência a reter gordura localizada",
  "inchaco": "retenção de líquido e inchaço frequente",
  "controlo-mas-nao-cai": "metabolismo lento mesmo com alimentação controlada",
  "metabolismo-travado": "metabolismo travado, precisando de um empurrão inicial",
};

function perfilMetabolicoTexto() {
  const base = TEXTO_PERFIL_CORPO[state.corpoTexto] || "metabolismo em fase de ajuste no pós-parto";
  return `Perfil com ${base}, comum na fase de amamentação`;
}

function versaoCardapioTexto() {
  return state.aplv === "sim" || state.aplv === "suspeita" ? "Cardápio + Versão APLV" : "Cardápio Padrão";
}

/* ---------------------------------------------------------------------
   Taxa de queima de gordura variável (Etapa 24): nível base pela
   resposta da Etapa 4 (corpoTexto), ajustado um nível pra cima ou pra
   baixo conforme o sono (N5).
   --------------------------------------------------------------------- */
const NIVEL_BASE_POR_CORPO = {
  "controlo-mas-nao-cai": "lenta",
  "metabolismo-travado": "lenta",
  "gordura-acumulada": "media",
  "inchaco": "media",
};
const ORDEM_NIVEIS_TAXA = ["lenta", "media", "rapida"];
const TEXTO_TAXA_QUEIMA = {
  lenta: "Lenta, mas o Plano Alimentar vai corrigir isso 🔥",
  media: "Média, e o Plano Alimentar vai acelerar isso 🔥",
  rapida: "Rápida, e o Plano Alimentar vai manter esse ritmo 🔥",
};
const POSICAO_MARCADOR_TAXA = { lenta: 15, media: 50, rapida: 85 };

function calcularNivelTaxaQueima() {
  let indiceNivel = ORDEM_NIVEIS_TAXA.indexOf(NIVEL_BASE_POR_CORPO[state.corpoTexto] || "lenta");
  if (state.sono === "menos-4h") indiceNivel = Math.max(0, indiceNivel - 1);
  else if (state.sono === "6h-mais") indiceNivel = Math.min(ORDEM_NIVEIS_TAXA.length - 1, indiceNivel + 1);
  return ORDEM_NIVEIS_TAXA[indiceNivel];
}

/* ---------------------------------------------------------------------
   Tabela de marcos semanais da projeção (Etapa 21), a partir dos
   mesmos pontos usados no gráfico (já respeitam o ritmo seguro).
   --------------------------------------------------------------------- */
function renderizarTabelaProjecao(containerId, pontos) {
  const container = document.getElementById(containerId);
  const hoje = new Date();
  const iconesIntermediarios = ["🟠", "🟡", "🟢", "🟢"];

  container.innerHTML = pontos.map((p, i) => {
    const ultimo = i === pontos.length - 1;
    const icone = ultimo ? "🏆" : (iconesIntermediarios[i] || "🟢");
    const semanas = Math.max(0, Math.round((p.data - hoje) / (1000 * 60 * 60 * 24 * 7)));

    let rotulo;
    if (i === 0) rotulo = "Início";
    else if (ultimo) rotulo = `Semana ${semanas} · Meta! 🎯`;
    else rotulo = `Semana ${semanas}`;

    return `
      <div class="linha-projecao ${ultimo ? "meta" : ""}">
        <span class="linha-projecao-icone">${icone}</span>
        <span class="linha-projecao-peso">${p.peso} kg</span>
        <span class="linha-projecao-rotulo">${rotulo}</span>
      </div>
    `;
  }).join("");
}

/* ---------------------------------------------------------------------
   Recap das respostas (Etapa 25): mostra só as linhas que têm resposta.
   --------------------------------------------------------------------- */
const TEMPO_AMAMENTANDO_RECAP = {
  "menos-1-mes": "menos de 1 mês",
  "1-3-meses": "1 a 3 meses",
  "3-6-meses": "3 a 6 meses",
  "mais-6-meses": "mais de 6 meses",
};

function renderizarRecap() {
  const linhas = [];

  if (state.tempoAmamentando) {
    linhas.push({ icone: "🤱", valor: `Amamentando há ${TEMPO_AMAMENTANDO_RECAP[state.tempoAmamentando]}` });
  }
  const diffKg = state.projecao ? state.projecao.diffKg : Math.max(0, state.pesoAtual - state.pesoDesejado);
  if (diffKg > 0) {
    linhas.push({ icone: "🎯", valor: `${diffKg.toFixed(0)} kg para chegar aos seus ${state.pesoDesejado} kg` });
  }
  if (state.travouResultadosLabel) {
    linhas.push({ icone: "🚧", valor: `Maior trava: ${state.travouResultadosLabel}` });
  }
  if (state.momentoComidaLabel) {
    linhas.push({ icone: "🕐", valor: `Momento mais difícil: ${state.momentoComidaLabel}` });
  }
  if (state.tempoPreparoLabel) {
    linhas.push({ icone: "⏱️", valor: `Tempo na cozinha: ${state.tempoPreparoLabel}` });
  }
  if (state.aplv === "sim" || state.aplv === "suspeita") {
    linhas.push({ icone: "🍼", valor: "Seu bebê tem APLV: versão adaptada incluída" });
  }

  document.getElementById("recap-linhas").innerHTML = linhas.slice(0, 6).map((l) => `
    <div class="perfil-linha">
      <span class="perfil-icone">${l.icone}</span>
      <span class="perfil-texto"><span class="perfil-valor">${l.valor}</span></span>
    </div>
  `).join("");
}

/* ---------------------------------------------------------------------
   Ordem dinâmica dos bônus (Etapa 25b): o bônus mais relevante pra
   resposta da usuária sobe pro topo da lista (depois do item fixo do
   Plano Alimentar). Regra da Etapa 11 tem prioridade sobre a da 14.
   --------------------------------------------------------------------- */
const BONUS_PADRAO = [
  { chave: "saladas", nome: "Guia de Saladas Saciantes em 10 Minutos", preco: "R$97" },
  { chave: "medidas", nome: "Guia Perdendo Medidas em 20 Passos Sem Dieta Radical", preco: "R$197" },
  { chave: "marmitas", nome: "Lista de Compras + Marmitas de 15 Minutos", preco: "R$97" },
  { chave: "fome-emocional", nome: "Aula Silenciando a Fome Emocional", preco: "R$237" },
  { chave: "autossabotagem", nome: "Aula Quebrando o Ciclo da Autossabotagem", preco: "R$297" },
];

const BONUS_PRIORITARIO_POR_TRAVA = {
  "fome-compulsao-doces": "fome-emocional",
  "sem-tempo-cozinhar": "marmitas",
  "nao-sei-o-que-comer": "marmitas",
  "peso-nao-cai": "medidas",
};
const BONUS_PRIORITARIO_POR_PREPARO = {
  "menos-15min": "marmitas",
};

function calcularOrdemBonus() {
  const chavePrioritaria = BONUS_PRIORITARIO_POR_TRAVA[state.travouResultados]
    || BONUS_PRIORITARIO_POR_PREPARO[state.tempoPreparo]
    || null;
  if (!chavePrioritaria) return BONUS_PADRAO.slice();

  const prioritario = BONUS_PADRAO.find((b) => b.chave === chavePrioritaria);
  const resto = BONUS_PADRAO.filter((b) => b.chave !== chavePrioritaria);
  return [prioritario, ...resto];
}

function renderizarBonusOferta() {
  const ul = document.getElementById("oferta-lista-super");
  ul.querySelectorAll("li:not(#item-cardapio-li)").forEach((li) => li.remove());
  calcularOrdemBonus().forEach((bonus) => {
    ul.insertAdjacentHTML("beforeend",
      `<li><span class="oferta-item-nome">✓ ${bonus.nome}</span><span class="oferta-item-valor">${bonus.preco}</span></li>`);
  });
}

function aoEntrarEtapa(indice) {
  if (indice === "18") {
    const inputPesoDesejado = document.getElementById("slider-peso-desejado");
    const minSlider = 40;
    const maxPermitido = Math.max(minSlider, state.pesoAtual - 1);
    inputPesoDesejado.max = maxPermitido;
    if (state.pesoDesejado > maxPermitido) {
      state.pesoDesejado = maxPermitido;
    }
    definirPesoDesejado(state.pesoDesejado);
    atualizarTextoMeta();
  }

  if (indice === "23") {
    iniciarLoading();
  }

  if (indice === "24") {
    const proj = calcularProjecao(state.pesoAtual, state.pesoDesejado, state.prazoObjetivo);
    state.projecao = proj;

    document.querySelector('[data-bind="peso-desejado-24"]').textContent = state.pesoDesejado;
    document.querySelector('[data-bind="data-final-24"]').textContent = formatarData(proj.dataFinal);

    requestAnimationFrame(() => {
      desenharGraficoPeso(document.getElementById("grafico-24"), proj.pontos, 200, true);
    });
    renderizarTabelaProjecao("tabela-projecao-24", proj.pontos);

    const imc = calcularIMC(state.pesoAtual, state.altura);
    document.getElementById("imc-valor").textContent = imc.toFixed(1);
    document.getElementById("imc-categoria-texto").textContent = categoriaIMC(imc);
    document.getElementById("imc-marcador").style.left = posicaoMarcadorIMC(imc) + "%";

    document.getElementById("secar-faixa-valor").textContent = calcularFaixaSecar(proj.diffKg);

    document.getElementById("perfil-objetivo").textContent = state.objetivoLabel || "--";
    document.getElementById("perfil-meta").textContent = `${proj.diffKg.toFixed(0)} kg`;
    document.getElementById("perfil-metabolico").textContent = perfilMetabolicoTexto();
    document.getElementById("perfil-versao").textContent = versaoCardapioTexto();

    const nivelTaxa = calcularNivelTaxaQueima();
    document.getElementById("taxa-marcador").style.left = POSICAO_MARCADOR_TAXA[nivelTaxa] + "%";
    document.getElementById("taxa-resultado-texto").textContent = TEXTO_TAXA_QUEIMA[nivelTaxa];

    const temOcasiao = state.ocasiaoEspecial && state.ocasiaoEspecial !== "nenhuma";
    const trechoOcasiao = temOcasiao ? ` em ${state.ocasiaoEspecialLabel}` : "";
    document.getElementById("texto-projecao-24").textContent =
      `Seguindo o Plano Alimentar Para Lactantes, ${state.nome || "você"} pode chegar${trechoOcasiao} com o corpo que deseja sem parar de amamentar e sem dietas restritivas!`;

    iniciarNotificacoesFake();
  }

  if (indice === "25") {
    const mostrarAplv = state.aplv === "sim" || state.aplv === "suspeita";
    document.getElementById("aplv-aviso-25").classList.toggle("oculto", !mostrarAplv);
    document.getElementById("item-cardapio-nome").textContent = mostrarAplv
      ? "✓ Plano Alimentar Para Lactantes (+ Versão APLV)"
      : "✓ Plano Alimentar Para Lactantes";

    renderizarRecap();
    renderizarBonusOferta();
  }
}

/* ---------------------------------------------------------------------
   Etapa 23: animação de carregamento
   --------------------------------------------------------------------- */
const LOADING_TEXTO_FALLBACK = "Identificando alimentos ideais para você...";

const LOADING_TEXTO_SONO = {
  "menos-4h": "Ajustando o plano para quem dorme menos de 4h...",
  "4-5h": "Ajustando o plano para quem dorme de 4 a 5h...",
  "6h-mais": "Ajustando o plano para a sua rotina de sono...",
};
const LOADING_TEXTO_MOMENTO = {
  manha: "Incluindo estratégia para a sua manhã...",
  tarde: "Incluindo estratégia para a sua tarde...",
  noite: "Incluindo estratégia para as suas noites...",
  madrugada: "Incluindo estratégia para as madrugadas de mamada...",
  "ansiosa-cansada": "Incluindo estratégia para os momentos de ansiedade e cansaço...",
};
const LOADING_TEXTO_PREPARO = {
  "menos-15min": "Montando refeições de menos de 15 minutos...",
  "15-30min": "Montando refeições de 15 a 30 minutos...",
  "ate-1hora": "Montando refeições práticas para a sua rotina...",
};

function prepararTextosLoading() {
  document.getElementById("loading-texto-sono").textContent = LOADING_TEXTO_SONO[state.sono] || LOADING_TEXTO_FALLBACK;
  document.getElementById("loading-texto-momento").textContent = LOADING_TEXTO_MOMENTO[state.momentoComida] || LOADING_TEXTO_FALLBACK;
  document.getElementById("loading-texto-preparo").textContent = LOADING_TEXTO_PREPARO[state.tempoPreparo] || LOADING_TEXTO_FALLBACK;
}

function iniciarLoading() {
  const fill = document.getElementById("loading-barra-fill");
  const percentualEl = document.getElementById("loading-percentual-valor");
  const itens = document.querySelectorAll("#loading-checklist .loading-item");
  const social = document.getElementById("loading-social");

  prepararTextosLoading();
  itens.forEach((it) => it.classList.remove("ativo"));
  social.classList.remove("visivel");
  fill.style.width = "0%";
  percentualEl.textContent = "0";

  const duracaoMs = 10500;
  const inicio = performance.now();

  function passo(agora) {
    const decorrido = agora - inicio;
    const progresso = Math.min(1, decorrido / duracaoMs);
    const pct = Math.round(progresso * 100);
    fill.style.width = pct + "%";
    percentualEl.textContent = pct;

    if (pct >= 10) itens[0].classList.add("ativo");
    if (pct >= 25) itens[1].classList.add("ativo");
    if (pct >= 40) itens[2].classList.add("ativo");
    if (pct >= 55) itens[3].classList.add("ativo");
    if (pct >= 70) itens[4].classList.add("ativo");
    if (pct >= 85) itens[5].classList.add("ativo");
    if (pct >= 75) social.classList.add("visivel");

    if (progresso < 1) {
      requestAnimationFrame(passo);
    } else {
      setTimeout(() => irPara(24), 500);
    }
  }
  requestAnimationFrame(passo);
}

/* ---------------------------------------------------------------------
   Notificações de compra fake (Etapa 24 até o final do quiz)

   Regras: nunca duas visíveis ao mesmo tempo (fila estritamente
   sequencial via setTimeout encadeado, não setInterval), cada uma
   fica visível por alguns segundos, some, espera 2s e só então a
   próxima aparece. Posição sempre no topo da tela (fixo, logo abaixo
   da barra de progresso): testamos alternar com o meio da tela, mas
   isso sobrepunha conteúdo enquanto a pessoa rolava a página, então
   voltamos a fixar só no topo, que não atrapalha a leitura.
   A lista de pessoas é embaralhada e consumida em ordem; só repete
   alguém depois que a lista inteira (55 combinações) já passou, e
   nesse momento ela é reembaralhada.
   --------------------------------------------------------------------- */
const TOAST_DURACAO_VISIVEL_MS = 3500;
const TOAST_DURACAO_TRANSICAO_MS = 350;
const TOAST_INTERVALO_ENTRE_MS = 2000;

let timeoutToast = null;
let filaNotificacoesFake = [];
let indiceFilaNotificacoesFake = 0;

function embaralhar(lista) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function proximaPessoaFake() {
  if (indiceFilaNotificacoesFake >= filaNotificacoesFake.length) {
    filaNotificacoesFake = embaralhar(NOMES_COMPRAS_FAKE);
    indiceFilaNotificacoesFake = 0;
  }
  const pessoa = filaNotificacoesFake[indiceFilaNotificacoesFake];
  indiceFilaNotificacoesFake++;
  return pessoa;
}

function iniciarNotificacoesFake() {
  if (timeoutToast) return;
  filaNotificacoesFake = embaralhar(NOMES_COMPRAS_FAKE);
  indiceFilaNotificacoesFake = 0;
  timeoutToast = setTimeout(mostrarToast, 800);
}

function mostrarToast() {
  const container = document.getElementById("toast-container");
  const pessoa = proximaPessoaFake();

  const toast = document.createElement("div");
  toast.className = "toast-compra toast-topo";
  toast.innerHTML =
    `<span class="toast-icone">🛒</span>` +
    `<span><strong>${pessoa.nome}</strong>, de ${pessoa.cidade}/${pessoa.estado}, acabou de comprar o Plano Alimentar Para Lactantes! <span class="tag-toast-completo">Plano Completo</span></span>`;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("toast-visivel"));
  });

  timeoutToast = setTimeout(() => {
    toast.classList.remove("toast-visivel");
    setTimeout(() => {
      toast.remove();
      timeoutToast = setTimeout(mostrarToast, TOAST_INTERVALO_ENTRE_MS);
    }, TOAST_DURACAO_TRANSICAO_MS);
  }, TOAST_DURACAO_VISIVEL_MS);
}

/* ---------------------------------------------------------------------
   Contador social (Etapa 0)

   Começa num número aleatório e vai subindo sozinho aos poucos (+1 a
   +4 por vez, tipo 159 -> 163 -> 164 -> 168...), em intervalos curtos
   e também aleatórios, pra parecer atividade ao vivo em vez de um
   número parado ou um crescimento óbvio/constante. Para de crescer
   com um teto de segurança e também para completamente assim que a
   pessoa sai da Etapa 0 (não tem como voltar pra ela depois).
   --------------------------------------------------------------------- */
const CONTADOR_SOCIAL_TETO = 300;
let contadorSocialValor = 0;
let timeoutContadorSocial = null;

function iniciarContadorSocial() {
  contadorSocialValor = aleatorioEntre(140, 160);
  atualizarTextoContadorSocial();
  agendarProximoIncrementoContador();
}

function atualizarTextoContadorSocial() {
  const el = document.getElementById("contador-texto");
  if (el) el.textContent = `${contadorSocialValor} mamães testando o Plano Alimentar Para Lactantes agora`;
}

function agendarProximoIncrementoContador() {
  if (contadorSocialValor >= CONTADOR_SOCIAL_TETO) return;
  timeoutContadorSocial = setTimeout(() => {
    contadorSocialValor = Math.min(CONTADOR_SOCIAL_TETO, contadorSocialValor + aleatorioEntre(1, 4));
    atualizarTextoContadorSocial();
    agendarProximoIncrementoContador();
  }, aleatorioEntre(2500, 6000));
}

function pararContadorSocial() {
  if (timeoutContadorSocial) {
    clearTimeout(timeoutContadorSocial);
    timeoutContadorSocial = null;
  }
}

/* ---------------------------------------------------------------------
   Checkout e modal de retenção (25c / 25h)
   --------------------------------------------------------------------- */
function irParaCheckout(plano) {
  const url = plano === "basico" ? CHECKOUT_URL_BASICO : CHECKOUT_URL_SUPER;
  if (!url) {
    alert("Link de checkout ainda não configurado.");
    return;
  }
  window.location.href = url;
}

/* Botões fora dos cartões de oferta não vão direto pro checkout (temos
   2 preços diferentes); eles são âncora, sempre levando de volta pra
   Super Oferta pra pessoa escolher ali. */
function irParaOfertaSuper() {
  document.getElementById("oferta-super").scrollIntoView({ behavior: "smooth", block: "start" });
}

function configurarOfertaFinal() {
  document.getElementById("btn-checkout-super").addEventListener("click", () => irParaCheckout("super"));
  document.getElementById("btn-checkout-resumo").addEventListener("click", irParaOfertaSuper);

  const modal = document.getElementById("modal-retencao");

  document.getElementById("btn-abrir-basico").addEventListener("click", () => {
    modal.classList.remove("oculto");
  });

  document.getElementById("btn-modal-super").addEventListener("click", () => irParaCheckout("super"));
  document.getElementById("btn-modal-basico").addEventListener("click", () => irParaCheckout("basico"));

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("oculto");
  });
}

/* ---------------------------------------------------------------------
   Inicialização
   --------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  iniciarContadorSocial();
  configurarOpcoes();
  configurarBotoesAvancar();
  configurarCapturaNome();
  configurarSliders();
  configurarOfertaFinal();
  atualizarProgresso(0);
  enviarEventoPainel({ tipo: "etapa_vista", etapa: "0" });
});
