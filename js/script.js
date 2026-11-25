'use strict';

/* ==========================================================
   CONFIGURAÇÃO: edite aqui
   ========================================================== */

// Primeiro dia da sua sequência atual (formato AAAA-MM-DD).
// Se você faltar a um treino, troque pela data em que recomeçou.
const INICIO_SEQUENCIA = '2026-11-01';

// Dias de descanso (0 = domingo, 1 = segunda ... 6 = sábado).
// Eles não contam como treino e não quebram a sequência.
const DIAS_DESCANSO = [0, 4];

const NOMES_DIAS = [
  'domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'
];

const TREINO_DO_DIA = {
  0: 'Descanso',
  1: 'Push',
  2: 'Pull',
  3: 'Legs',
  4: 'Descanso',
  5: 'Upper',
  6: 'Lower'
};

const FRASES = [
  'A motivação te leva à academia. A disciplina te faz voltar amanhã.',
  'Ninguém vê os dias em que você foi sem vontade. O espelho vê.',
  'Evolução devagar ainda é evolução.',
  'O seu eu do passado não te reconheceria. Continue.',
  'Carga a mais na barra, dúvida a menos na cabeça.',
  'O treino de hoje é o corpo que você vai ter amanhã.',
  'Descanso também é treino. Volte mais forte.',
  'Não compare o seu capítulo 3 com o capítulo 20 de ninguém.',
  'Constância vence a intensidade que dura uma semana.',
  'Cada repetição é uma promessa cumprida.'
];

/* ==========================================================
   Utilidades
   ========================================================== */

const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function lerArmazenado(chave) {
  try {
    return localStorage.getItem(chave);
  } catch (erro) {
    return null;
  }
}

function salvarArmazenado(chave, valor) {
  try {
    localStorage.setItem(chave, valor);
  } catch (erro) {
    /* sem armazenamento disponível: segue sem salvar */
  }
}

function dataLocal(texto) {
  const [ano, mes, dia] = texto.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

/* ==========================================================
   Sequência de treino (o "foguinho")
   ========================================================== */

function calcularSequencia(hoje) {
  const inicio = dataLocal(INICIO_SEQUENCIA);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  let total = 0;

  for (let dia = new Date(inicio); dia <= fim; dia.setDate(dia.getDate() + 1)) {
    if (!DIAS_DESCANSO.includes(dia.getDay())) {
      total += 1;
    }
  }
  return total;
}

function animarNumero(elemento, valorFinal) {
  if (reduzirMovimento || valorFinal === 0) {
    elemento.textContent = valorFinal;
    return;
  }

  const duracao = 900;
  const comeco = performance.now();

  function passo(agora) {
    const progresso = Math.min((agora - comeco) / duracao, 1);
    const suave = 1 - Math.pow(1 - progresso, 3);
    elemento.textContent = Math.round(valorFinal * suave);
    if (progresso < 1) {
      requestAnimationFrame(passo);
    }
  }
  requestAnimationFrame(passo);
}

function iniciarSequencia() {
  const numero = document.getElementById('sequencia-numero');
  const hojeTexto = document.getElementById('sequencia-hoje');
  if (!numero || !hojeTexto) return;

  const hoje = new Date();
  animarNumero(numero, calcularSequencia(hoje));

  const diaSemana = hoje.getDay();
  const treino = TREINO_DO_DIA[diaSemana];

  if (DIAS_DESCANSO.includes(diaSemana)) {
    hojeTexto.textContent = 'Hoje é ' + NOMES_DIAS[diaSemana] + ': dia de descanso. Recuperar também é treinar.';
  } else {
    hojeTexto.textContent = 'Hoje é ' + NOMES_DIAS[diaSemana] + ': treino de ' + treino + '.';
  }
}

/* ==========================================================
   Rotina: destaca o dia de hoje
   ========================================================== */

function destacarHoje() {
  const diaSemana = String(new Date().getDay());
  const linha = document.querySelector('.semana li[data-dia="' + diaSemana + '"]');
  if (linha) {
    linha.classList.add('hoje');
    linha.setAttribute('aria-current', 'date');
  }
}

/* ==========================================================
   Modo claro / escuro
   ========================================================== */

function iniciarTema() {
  const raiz = document.documentElement;
  const botao = document.getElementById('btn-tema');
  if (!botao) return;

  function aplicar(tema) {
    raiz.setAttribute('data-theme', tema);
    botao.textContent = tema === 'dark' ? 'Modo claro' : 'Modo escuro';
  }

  const salvo = lerArmazenado('tema');
  aplicar(salvo === 'light' ? 'light' : 'dark');

  botao.addEventListener('click', function () {
    const novo = raiz.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    aplicar(novo);
    salvarArmazenado('tema', novo);
  });
}

/* ==========================================================
   Frases aleatórias
   ========================================================== */

function iniciarFrases() {
  const texto = document.getElementById('frase');
  const botao = document.getElementById('btn-frase');
  if (!texto || !botao) return;

  let indiceAtual = FRASES.indexOf(texto.textContent.trim());

  botao.addEventListener('click', function () {
    let novo = indiceAtual;
    while (novo === indiceAtual) {
      novo = Math.floor(Math.random() * FRASES.length);
    }
    indiceAtual = novo;
    texto.textContent = FRASES[novo];
  });
}

/* ==========================================================
   Menu no celular
   ========================================================== */

function iniciarMenu() {
  const botao = document.getElementById('btn-menu');
  const menu = document.getElementById('menu');
  if (!botao || !menu) return;

  function fechar() {
    menu.classList.remove('aberto');
    botao.setAttribute('aria-expanded', 'false');
  }

  botao.addEventListener('click', function () {
    const aberto = menu.classList.toggle('aberto');
    botao.setAttribute('aria-expanded', String(aberto));
  });

  menu.addEventListener('click', function (evento) {
    if (evento.target.tagName === 'A') {
      fechar();
    }
  });
}

/* ==========================================================
   Comparador antes e depois
   ========================================================== */

function iniciarComparador() {
  const caixa = document.getElementById('comparador');
  const controle = document.getElementById('comp-range');
  if (!caixa || !controle) return;

  function atualizar() {
    caixa.style.setProperty('--pos', controle.value + '%');
  }

  controle.addEventListener('input', atualizar);
  atualizar();
}

/* ==========================================================
   Início
   ========================================================== */

document.addEventListener('DOMContentLoaded', function () {
  iniciarTema();
  iniciarMenu();
  iniciarSequencia();
  destacarHoje();
  iniciarFrases();
  iniciarComparador();
});
