"use strict";

/* =====================================================================
   Plano Alimentar Para Lactantes, Quiz de Vendas
   Lógica do quiz: navegação entre etapas, estado das respostas,
   cálculos (IMC, meta de peso, projeção com ritmo seguro),
   personalização e notificações de compra fake.
   ===================================================================== */

/* ---------------------------------------------------------------------
   LINK DE CHECKOUT
   Ainda não temos o link definitivo. Troque o valor abaixo quando a
   cliente enviar o link real do checkout. É o único lugar do projeto
   que precisa ser editado.
   --------------------------------------------------------------------- */
const CHECKOUT_URL = "PLACEHOLDER";

/* ---------------------------------------------------------------------
   Lista de notificações de compra fake (Etapa 21 em diante).
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
  pesoAcima: null,
  nome: "",
  posParto: null,
  travouResultados: null,
  tempoPreparo: null,
  aplv: null,
  pesoAtual: 70,
  altura: 165,
  pesoDesejado: 60,
  ocasiaoEspecial: null,
  ocasiaoEspecialLabel: null,
  prazoObjetivo: null,
  projecao: null,
};

const ULTIMA_ETAPA = 25;
const ETAPAS_SEM_BOTAO_VOLTAR = new Set([0, 21, 22, 23, 24, 25]);
let etapaAtual = 0;

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
  const atualEl = document.querySelector(`.etapa[data-etapa="${etapaAtual}"]`);
  const novaEl = document.querySelector(`.etapa[data-etapa="${indice}"]`);
  if (!novaEl) return;

  if (atualEl) atualEl.classList.remove("etapa-ativa");
  novaEl.classList.add("etapa-ativa");
  etapaAtual = indice;

  atualizarProgresso(indice);
  atualizarBotaoVoltar(indice);
  window.scrollTo(0, 0);
  aoEntrarEtapa(indice);
}

function atualizarProgresso(indice) {
  const wrap = document.getElementById("barra-progresso-wrap");
  if (indice === 0) {
    wrap.classList.add("oculto");
    return;
  }
  wrap.classList.remove("oculto");
  const pct = Math.round((indice / ULTIMA_ETAPA) * 100);
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
function configurarOpcoes() {
  document.querySelectorAll(".lista-opcoes[data-tipo], .grade-opcoes[data-tipo]").forEach((container) => {
    container.addEventListener("click", (evento) => {
      const opcao = evento.target.closest("[data-valor]");
      if (!opcao || !container.contains(opcao)) return;

      const tipo = container.dataset.tipo;
      const campo = container.dataset.campo;
      const labelEl = opcao.querySelector(".opcao-label, .opcao-cartao-label");
      const label = labelEl ? labelEl.textContent.trim() : opcao.textContent.trim();

      if (tipo === "single") {
        container.querySelectorAll("[data-valor]").forEach((o) => o.classList.remove("selecionada"));
        opcao.classList.add("selecionada");
        state[campo] = opcao.dataset.valor;
        state[campo + "Label"] = label;

        if (campo === "prazoObjetivo") {
          document.getElementById("box-etapa-20").classList.remove("oculto");
          document.getElementById("btn-continuar-20").classList.remove("oculto");
        }

        if (container.dataset.manual !== "true") {
          const proxima = parseInt(container.dataset.proxima, 10);
          setTimeout(() => irPara(proxima), 320);
        }
      } else if (tipo === "multi") {
        opcao.classList.toggle("selecionada");
        const selecionados = Array.from(container.querySelectorAll(".selecionada")).map((o) => o.dataset.valor);
        state[campo] = selecionados;
        const btnContinuar = document.getElementById("btn-continuar-5");
        if (btnContinuar) btnContinuar.disabled = selecionados.length === 0;
      }
    });
  });
}

/* ---------------------------------------------------------------------
   Botões simples de avançar (sem lógica extra)
   --------------------------------------------------------------------- */
const BOTOES_AVANCAR = {
  "btn-iniciar-quiz": 1,
  "btn-continuar-5": 6,
  "btn-continuar-8": 9,
  "btn-continuar-12": 13,
  "btn-continuar-13": 14,
  "btn-continuar-16": 17,
  "btn-continuar-17": 18,
  "btn-continuar-18": 19,
  "btn-continuar-20": 21,
  "btn-continuar-21": 22,
  "btn-continuar-22": 23,
  "btn-continuar-24": 25,
};

function configurarBotoesAvancar() {
  Object.entries(BOTOES_AVANCAR).forEach(([id, proxima]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", () => irPara(proxima));
  });

  document.getElementById("btn-voltar").addEventListener("click", () => {
    if (etapaAtual > 0 && !ETAPAS_SEM_BOTAO_VOLTAR.has(etapaAtual)) {
      irPara(etapaAtual - 1);
    }
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

   O resultado sempre respeita exatamente o prazo escolhido pela usuária
   na Etapa 20 (4 semanas / 2 meses / 3 meses / 4 meses), sem estender a
   data mesmo quando a diferença de peso implica um ritmo mais agressivo.
   --------------------------------------------------------------------- */
const PRAZO_EM_DIAS = {
  "4-semanas": 28,
  "2-meses": 60,
  "3-meses": 90,
  "4-meses": 120,
};

function calcularProjecao(pesoAtual, pesoDesejado, prazoKey) {
  const diffKg = Math.max(0, pesoAtual - pesoDesejado);
  const diasEscolhidos = PRAZO_EM_DIAS[prazoKey] || 60;
  const semanasFinal = Math.round((diasEscolhidos / 7) * 10) / 10;

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

function aoEntrarEtapa(indice) {
  if (indice === 18) {
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

  if (indice === 21) {
    const proj = calcularProjecao(state.pesoAtual, state.pesoDesejado, state.prazoObjetivo);
    state.projecao = proj;

    document.querySelector('[data-bind="peso-desejado-21"]').textContent = state.pesoDesejado;
    document.querySelector('[data-bind="data-final-21"]').textContent = formatarData(proj.dataFinal);

    const temOcasiao = state.ocasiaoEspecial && state.ocasiaoEspecial !== "nenhuma";
    const trechoOcasiao = temOcasiao ? ` em ${state.ocasiaoEspecialLabel}` : "";
    document.getElementById("texto-projecao-21").textContent =
      `Seguindo o Plano Alimentar Para Lactantes, ${state.nome || "você"} pode chegar${trechoOcasiao} com o corpo que deseja sem parar de amamentar e sem dietas restritivas!`;

    requestAnimationFrame(() => {
      desenharGraficoPeso(document.getElementById("grafico-21"), proj.pontos, 200, true);
    });

    renderizarTabelaProjecao("tabela-projecao-21", proj.pontos);

    iniciarNotificacoesFake();
  }

  if (indice === 23) {
    iniciarLoading();
  }

  if (indice === 24) {
    const imc = calcularIMC(state.pesoAtual, state.altura);
    document.getElementById("imc-valor").textContent = imc.toFixed(1);
    document.getElementById("imc-categoria-texto").textContent = categoriaIMC(imc);
    document.getElementById("imc-marcador").style.left = posicaoMarcadorIMC(imc) + "%";

    const proj = state.projecao || calcularProjecao(state.pesoAtual, state.pesoDesejado, state.prazoObjetivo);
    state.projecao = proj;

    document.getElementById("secar-faixa-valor").textContent = calcularFaixaSecar(proj.diffKg);

    document.getElementById("perfil-objetivo").textContent = state.objetivoLabel || "--";
    document.getElementById("perfil-meta").textContent = `${proj.diffKg.toFixed(0)} kg`;
    document.getElementById("perfil-metabolico").textContent = perfilMetabolicoTexto();
    document.getElementById("perfil-versao").textContent = versaoCardapioTexto();

    document.getElementById("texto-previsao-24").textContent =
      `${state.nome || "Você"}, prevemos que você atingirá seu peso ideal de ${state.pesoDesejado} kg até aproximadamente ${formatarData(proj.dataFinal)}!`;

    requestAnimationFrame(() => {
      desenharGraficoPeso(document.getElementById("grafico-24"), proj.pontos, 160);
    });
  }

  if (indice === 25) {
    const mostrarAplv = state.aplv === "sim" || state.aplv === "suspeita";
    document.getElementById("aplv-aviso-25").classList.toggle("oculto", !mostrarAplv);
    document.getElementById("item-cardapio-nome").textContent = mostrarAplv
      ? "✓ Plano Alimentar Para Lactantes (+ Versão APLV)"
      : "✓ Plano Alimentar Para Lactantes";
  }
}

/* ---------------------------------------------------------------------
   Etapa 23: animação de carregamento
   --------------------------------------------------------------------- */
function iniciarLoading() {
  const fill = document.getElementById("loading-barra-fill");
  const percentualEl = document.getElementById("loading-percentual-valor");
  const itens = document.querySelectorAll("#loading-checklist .loading-item");
  const social = document.getElementById("loading-social");

  itens.forEach((it) => it.classList.remove("ativo"));
  social.classList.remove("visivel");
  fill.style.width = "0%";
  percentualEl.textContent = "0";

  const duracaoMs = 10000;
  const inicio = performance.now();

  function passo(agora) {
    const decorrido = agora - inicio;
    const progresso = Math.min(1, decorrido / duracaoMs);
    const pct = Math.round(progresso * 100);
    fill.style.width = pct + "%";
    percentualEl.textContent = pct;

    if (pct >= 10) itens[0].classList.add("ativo");
    if (pct >= 35) itens[1].classList.add("ativo");
    if (pct >= 60) itens[2].classList.add("ativo");
    if (pct >= 85) itens[3].classList.add("ativo");
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
   Notificações de compra fake (Etapa 21 até o final do quiz)

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
   --------------------------------------------------------------------- */
function iniciarContadorSocial() {
  const n = aleatorioEntre(140, 160);
  document.getElementById("contador-texto").textContent = `${n} mamães testando o Plano Alimentar Para Lactantes agora`;
}

/* ---------------------------------------------------------------------
   Checkout e modal de retenção (25c / 25h)
   --------------------------------------------------------------------- */
function irParaCheckout(plano) {
  if (!CHECKOUT_URL || CHECKOUT_URL === "PLACEHOLDER") {
    alert("Link de checkout ainda não configurado. Defina CHECKOUT_URL em js/app.js.");
    return;
  }
  const separador = CHECKOUT_URL.includes("?") ? "&" : "?";
  window.location.href = `${CHECKOUT_URL}${separador}plano=${plano}`;
}

function configurarOfertaFinal() {
  document.getElementById("btn-checkout-super").addEventListener("click", () => irParaCheckout("super"));
  document.getElementById("btn-checkout-resumo").addEventListener("click", () => irParaCheckout("super"));

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
});
