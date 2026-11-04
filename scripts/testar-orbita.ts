// Confere a matemática da Órbita Numérica lendo cada enunciado como um estudante leria:
// os números saem do texto mostrado na tela e a resposta é recalculada aqui, por outro caminho (de preferência na força bruta).
// Rodar: npm run testar:orbita
import { readFileSync } from "node:fs";
import { DIAS_CURTOS, FASES, GERADORES, MAX_OPCAO, chaveOpcao, criarRoteiro, gerarQuestao, geradoresDa, nivelDa, sementeira, type Questao } from "../src/lib/estudo/orbita";
import { temGlifo } from "../src/components/jogos/orbitaArte";
import { JOGOS } from "../src/lib/jogos";

let falhas = 0;
let conferidas = 0;
const erro = (m: string) => {
  if (++falhas <= 25) console.error("✗", m);
};

const mdc = (a: number, b: number): number => (b ? mdc(b, a % b) : a);
const fr = (n: number, d: number) => {
  const m = mdc(n, d);
  return `${n / m}/${d / m}`;
};
const nums = (s: string) => (s.match(/\d+/g) ?? []).map(Number);
const ALTOS = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const lerAlto = (s: string) => Number([...s].map((c) => ALTOS.indexOf(c)).join(""));
/** Base e expoente de cada potência escrita com número pequeno. */
const potencias = (s: string) => [...s.matchAll(/(\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g)].map((m) => [Number(m[1]), lerAlto(m[2])] as const);
const pedir = (s: string, re: RegExp) => {
  const m = re.exec(s);
  if (!m) throw new Error(`enunciado fora do padrão: ${s}`);
  return m;
};

/** Recalcula a resposta de cada tipo a partir do texto. O retorno é comparado com a opção marcada como certa. */
const RESOLVER: Record<string, (e: string, q: Questao) => string> = {
  "fracao-de-quantidade": (e) => {
    const m = pedir(e, /leva (\d+) cápsulas e (\d+)\/(\d+) delas/);
    return String((+m[1] * +m[2]) / +m[3]);
  },
  "fracao-equivalente": (e) => {
    const m = pedir(e, /igual a (\d+)\/(\d+)\?/);
    return fr(+m[1], +m[2]);
  },
  "soma-mesmo-denominador": (e) => {
    const [a, d, b] = nums(e);
    return fr(a + b, d);
  },
  "soma-denominadores-diferentes": (e) => {
    const [a, p, b, q] = nums(e);
    return fr(a * q + b * p, p * q);
  },
  "maior-fracao": (_e, q) => {
    // Vale para qualquer opção: a maior de verdade, comparada em decimais longos.
    const v = q.opcoes.map((o) => {
      const [a, b] = o.split("/").map(Number);
      return { o, v: (a * 1_000_000) / b };
    });
    return v.reduce((m, x) => (x.v > m.v ? x : m)).o;
  },
  "resto-do-resto": (e) => {
    const m = pedir(e, /gasta 1\/(\d+) e depois 1\/(\d+) do que/);
    const a = +m[1];
    const b = +m[2];
    // Tanque de a*b unidades, gastando de verdade.
    let tanque = a * b;
    tanque -= (a * b) / a;
    tanque -= tanque / b;
    return fr(tanque, a * b);
  },
  "todo-a-partir-da-parte": (e) => {
    const m = pedir(e, /^(\d+)\/(\d+) da tripulação são (\d+) pessoas/);
    return String((+m[3] / +m[1]) * +m[2]);
  },
  "porcentagem-de-valor": (e) => {
    const m = pedir(e, /é (\d+)% de (\d+)\?/);
    return String((+m[1] * +m[2]) / 100);
  },
  desconto: (e) => {
    const m = pedir(e, /custa (\d+) reais e está com (\d+)% de desconto/);
    return String((+m[1] * (100 - +m[2])) / 100);
  },
  "que-porcentagem": (e) => {
    const m = pedir(e, /Das (\d+) cápsulas da nave, (\d+) são azuis/);
    return `${(+m[2] * 100) / +m[1]}%`;
  },
  "dois-aumentos": (e) => {
    const m = pedir(e, /valor de (\d+) sobe (\d+)% e depois sobe mais (\d+)%/);
    return String(Math.round((+m[1] * (100 + +m[2]) * (100 + +m[3])) / 10000));
  },
  "sobe-e-desce": (e) => {
    const p = +pedir(e, /sobe (\d+)% e depois cai/)[1];
    return `${Math.round((100 * (100 + p) * (100 - p)) / 10000)}%`;
  },
  "razao-em-partes": (e) => {
    const m = pedir(e, /é de (\d+) para (\d+)\. São (\d+) naves/);
    return String((+m[3] * +m[1]) / (+m[1] + +m[2]));
  },
  "regra-de-tres": (e) => {
    const m = pedir(e, /Com (\d+) litros, a nave anda (\d+) km\. Com (\d+) litros/);
    return String((+m[2] * +m[3]) / +m[1]);
  },
  "proporcao-inversa": (e) => {
    const m = pedir(e, /^(\d+) robôs consertam uma nave em (\d+) horas.*em quantas horas (\d+) robôs/);
    return String((+m[1] * +m[2]) / +m[3]);
  },
  "valor-da-potencia": (e) => {
    const [[b, x]] = potencias(e);
    let v = 1;
    for (let i = 0; i < x; i++) v *= b;
    return String(v);
  },
  "produto-de-mesma-base": (e) => {
    const [[a, m], [b, n]] = potencias(e);
    return String(Math.round(a ** m * b ** n));
  },
  "divisao-de-mesma-base": (e) => {
    const [[a, m], [b, n]] = potencias(e);
    return String(Math.round(a ** m / b ** n));
  },
  "soma-de-quadrados": (e) => {
    const m = pedir(e, /é (\d+)² \+ (\d+)²\?/);
    return String(+m[1] * +m[1] + +m[2] * +m[2]);
  },
  "expoente-desconhecido": (e) => {
    const m = pedir(e, /Se (\d+) elevado a n é igual a (\d+),/);
    let v = 1;
    let n = 0;
    while (v < +m[2]) {
      v *= +m[1];
      n++;
    }
    if (v !== +m[2]) throw new Error(`não é potência exata: ${e}`);
    return String(n);
  },
  "ultimo-algarismo": (e) => {
    const [[b, x]] = potencias(e);
    return String(BigInt(b) ** BigInt(x) % 10n);
  },
  "raiz-quadrada": (e) => {
    const alvo = nums(e)[0];
    for (let i = 1; i * i <= alvo; i++) if (i * i === alvo) return String(i);
    throw new Error(`sem raiz exata: ${e}`);
  },
  "sequencia-aritmetica": (e) => {
    const t = nums(e);
    const p = t[1] - t[0];
    t.forEach((v, i) => {
      if (i && v - t[i - 1] !== p) throw new Error(`não é aritmética: ${e}`);
    });
    return String(t[t.length - 1] + p);
  },
  "sequencia-geometrica": (e) => {
    const t = nums(e);
    const q = t[1] / t[0];
    t.forEach((v, i) => {
      if (i && v / t[i - 1] !== q) throw new Error(`não é geométrica: ${e}`);
    });
    return String(t[t.length - 1] * q);
  },
  "termo-distante": (e) => {
    const m = pedir(e, /sequência (\d+), (\d+), (\d+), (\d+), \.\.\. qual é o (\d+)º/);
    let v = +m[1];
    for (let i = 1; i < +m[5]; i++) v += +m[2] - +m[1];
    return String(v);
  },
  "diferencas-crescentes": (e) => {
    const t = nums(e);
    const d = t.slice(1).map((v, i) => v - t[i]);
    d.forEach((v, i) => {
      if (i && v - d[i - 1] !== 1) throw new Error(`saltos errados: ${e}`);
    });
    return String(t[t.length - 1] + d[d.length - 1] + 1);
  },
  "soma-dos-dois-anteriores": (e) => {
    const t = nums(e);
    for (let i = 2; i < t.length; i++) if (t[i] !== t[i - 1] + t[i - 2]) throw new Error(`não soma: ${e}`);
    return String(t[t.length - 1] + t[t.length - 2]);
  },
  "sequencia-de-quadrados": (e) => {
    const t = nums(e);
    const d = t.slice(1).map((v, i) => v - t[i]);
    d.forEach((v, i) => {
      if (i && v - d[i - 1] !== 2) throw new Error(`saltos errados: ${e}`);
    });
    return String(t[t.length - 1] + d[d.length - 1] + 2);
  },
  "palavra-repetida": (e) => {
    const m = pedir(e, /A palavra (\S+) se repete.*a (\d+)ª letra/);
    return m[1].repeat(+m[2])[+m[2] - 1];
  },
  "soma-de-gauss": (e) => {
    const n = nums(e).pop()!;
    let s = 0;
    for (let i = 1; i <= n; i++) s += i;
    return String(s);
  },
  "perimetro-do-retangulo": (e) => {
    const [a, b] = nums(e);
    return String(a + b + a + b);
  },
  "area-do-retangulo": (e) => {
    const [a, b] = nums(e);
    return String(a * b);
  },
  "terceiro-angulo": (e) => {
    const [a, b] = nums(e);
    return `${180 - a - b}°`;
  },
  "area-do-triangulo": (e) => {
    const [b, h] = nums(e);
    return String((b * h) / 2);
  },
  "area-pelo-perimetro": (e) => {
    const [p] = nums(e);
    return String((p / 4) ** 2);
  },
  pitagoras: (e) => {
    const [a, b] = nums(e);
    const c = Math.sqrt(a * a + b * b);
    if (!Number.isInteger(c)) throw new Error(`hipotenusa não inteira: ${e}`);
    return String(c);
  },
  "soma-dos-angulos": (e) => {
    const n = { pentágono: 5, hexágono: 6, heptágono: 7, octógono: 8, eneágono: 9, decágono: 10 }[pedir(e, /de um (\S+)\?/)[1]]!;
    return `${(n - 2) * 180}°`;
  },
  "volume-do-cubo": (e) => {
    const [a] = nums(e);
    return String(a * a * a);
  },
  "area-com-recorte": (e) => {
    const m = pedir(e, /de (\d+) cm por (\d+) cm, corta-se um quadrado de (\d+) cm/);
    // Conta os quadradinhos que sobram numa grade de verdade.
    let c = 0;
    for (let x = 0; x < +m[1]; x++) for (let y = 0; y < +m[2]; y++) if (x >= +m[3] || y >= +m[3]) c++;
    return String(c);
  },
  diagonais: (e) => {
    const n = { pentágono: 5, hexágono: 6, heptágono: 7, octógono: 8, eneágono: 9, decágono: 10 }[pedir(e, /tem um (\S+)\?/)[1]]!;
    let c = 0;
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (b - a !== 1 && b - a !== n - 1) c++;
    return String(c);
  },
  "angulo-isosceles": (e) => {
    const [t] = nums(e);
    return `${(180 - t) / 2}°`;
  },
  "apertos-de-mao": (e) => {
    const [n] = nums(e);
    let c = 0;
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) c++;
    return String(c);
  },
  "dia-da-semana": (e) => {
    const nomes = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
    const m = pedir(e, /Hoje é ([^.]+)\. Que dia da semana será daqui a (\d+) dias/);
    let d = nomes.indexOf(m[1]);
    if (d < 0) throw new Error(`dia desconhecido: ${e}`);
    for (let i = 0; i < +m[2]; i++) d = (d + 1) % 7;
    return DIAS_CURTOS[d];
  },
  "multiplos-de-um-ou-outro": (e) => {
    const [N, a, b] = nums(e).slice(1);
    let c = 0;
    for (let i = 1; i <= N; i++) if (i % a === 0 || i % b === 0) c++;
    return String(c);
  },
  "soma-das-idades": (e) => {
    const m = pedir(e, /tem (\d+) vezes a idade de .*idades é (\d+)\./);
    for (let x = 1; x < 200; x++) if (x + +m[1] * x === +m[2]) return String(x);
    throw new Error(`idades sem solução: ${e}`);
  },
  "robos-e-rodas": (e) => {
    const m = pedir(e, /há (\d+) robôs.*São (\d+) rodas/);
    for (let x = 0; x <= +m[1]; x++) if (2 * (+m[1] - x) + 4 * x === +m[2]) return String(x);
    throw new Error(`rodas sem solução: ${e}`);
  },
  "pior-caso": (e) => {
    const m = pedir(e, /cápsulas: (.*)\. Sem olhar.*garantir (\d+) da mesma/);
    const k = +m[2];
    const contas = nums(m[1]);
    // Tira uma de cada vez, sempre da cor que ainda não completa k: a pior ordem possível.
    return String(contas.reduce((s, c) => s + Math.min(c, k - 1), 0) + 1);
  },
  combinacoes: (e) => {
    const [a, b, c] = nums(e);
    let n = 0;
    for (let x = 0; x < a; x++) for (let y = 0; y < b; y++) for (let z = 0; z < c; z++) n++;
    return String(n);
  },
  "soma-dos-algarismos": (e) => {
    const s = nums(e).pop()!;
    let c = 0;
    for (let i = 10; i < 100; i++) if (Math.floor(i / 10) + (i % 10) === s) c++;
    return String(c);
  },
  "farois-juntos": (e) => {
    const [a, b, c] = nums(e);
    for (let i = 1; ; i++) if (i % a === 0 && i % b === 0 && i % c === 0) return String(i);
  },
  pesagens: (e) => {
    const [u, d] = nums(e);
    return String(u - (d - u));
  },
  "maior-numero-de-pacotes": (e) => {
    const [a, b] = nums(e);
    for (let p = Math.min(a, b); p > 0; p--) if (a % p === 0 && b % p === 0) return String(p);
    return "0";
  },
};

function conferir(q: Questao, onde: string) {
  conferidas++;
  const quem = `${onde} [${q.tipo}] "${q.enunciado}"`;
  if (q.certa < 0 || q.certa >= q.opcoes.length) return erro(`${quem}: a resposta certa não está entre as opções`);
  const chaves = q.opcoes.map(chaveOpcao);
  if (new Set(q.opcoes).size !== q.opcoes.length) erro(`${quem}: opções repetidas ${q.opcoes}`);
  if (new Set(chaves).size !== chaves.length) erro(`${quem}: opções de mesmo valor ${q.opcoes}`);

  const r = RESOLVER[q.tipo];
  if (!r) return erro(`${q.tipo}: sem conferência independente`);
  try {
    const esperada = r(q.enunciado, q);
    if (chaveOpcao(esperada) !== chaveOpcao(q.opcoes[q.certa])) erro(`${quem}: marcada ${q.opcoes[q.certa]}, recalculada ${esperada}`);
  } catch (e) {
    erro(`${quem}: ${(e as Error).message}`);
  }

  for (const o of q.opcoes) {
    if (!o || o.length > MAX_OPCAO) erro(`${quem}: opção não cabe na cápsula: "${o}"`);
    if (/NaN|Infinity|undefined|null|-|\.|^0$/.test(o)) erro(`${quem}: opção inválida: "${o}"`);
    if (/^\d+\/0$/.test(o)) erro(`${quem}: divisão por zero: "${o}"`);
    for (const c of o) if (!temGlifo(c)) erro(`${quem}: a fonte em pixels não tem "${c}"`);
  }
  // Todas as opções no mesmo formato: nenhuma se entrega pelo jeito de escrever.
  const formato = (o: string) => (o.includes("/") ? "f" : o.endsWith("%") ? "%" : o.endsWith("°") ? "°" : /^\d+$/.test(o) ? "n" : "t");
  if (new Set(q.opcoes.map(formato)).size !== 1) erro(`${quem}: formatos misturados ${q.opcoes}`);

  for (const texto of [q.enunciado, q.explicacao]) {
    if (/[—–]/.test(texto)) erro(`${quem}: travessão no texto`);
    if (/NaN|Infinity|undefined|null|\[object/.test(texto)) erro(`${quem}: valor quebrado: ${texto}`);
    if (/\d\.\d/.test(texto)) erro(`${quem}: decimal com ponto: ${texto}`);
    if (/\+ -|× -|\b1 (partes|horas|dias|fatores|letras)\b/.test(texto)) erro(`${quem}: plural ou sinal errado: ${texto}`);
  }
  if (q.enunciado.length > 150) erro(`${quem}: enunciado longo demais (${q.enunciado.length})`);
  if (q.explicacao.length > 290) erro(`${quem}: explicação longa demais (${q.explicacao.length})`);

  // A explicação precisa chegar à resposta mostrada.
  const certa = q.opcoes[q.certa];
  const nomes: Record<string, string> = { Dom: "domingo", Seg: "segunda-feira", Ter: "terça-feira", Qua: "quarta-feira", Qui: "quinta-feira", Sex: "sexta-feira", Sáb: "sábado" };
  if (!q.explicacao.includes(nomes[certa] ?? certa)) erro(`${quem}: a explicação não chega em ${certa}: ${q.explicacao}`);
}

// Casos feitos à mão: se o resolvedor do teste errasse junto com o gerador, estes pegam.
const AMAO: [string, string, string][] = [
  ["fracao-de-quantidade", "A nave leva 24 cápsulas e 3/4 delas são de água. Quantas são de água?", "18"],
  ["soma-denominadores-diferentes", "Quanto é 1/2 + 1/3?", "5/6"],
  ["resto-do-resto", "Do tanque cheio, a nave gasta 1/3 e depois 1/4 do que sobrou. Que fração do tanque ainda resta?", "1/2"],
  ["dois-aumentos", "Um valor de 200 sobe 10% e depois sobe mais 10%. Qual é o valor final?", "242"],
  ["sobe-e-desce", "Um preço sobe 20% e depois cai 20%. O preço final é que porcentagem do preço inicial?", "96%"],
  ["proporcao-inversa", "6 robôs consertam uma nave em 8 horas. No mesmo ritmo, em quantas horas 4 robôs consertam a nave?", "12"],
  ["ultimo-algarismo", "Qual é o último algarismo de 3²⁰²⁶?", "9"],
  ["termo-distante", "Na sequência 5, 8, 11, 14, ... qual é o 20º termo?", "62"],
  ["palavra-repetida", "A palavra NAVE se repete sem parar: NAVENAVE... Qual é a 50ª letra?", "A"],
  ["soma-dos-angulos", "Qual é a soma dos ângulos internos de um hexágono?", "720°"],
  ["diagonais", "Quantas diagonais tem um hexágono?", "9"],
  ["dia-da-semana", "Hoje é terça-feira. Que dia da semana será daqui a 100 dias?", "Qui"],
  ["multiplos-de-um-ou-outro", "Quantos números de 1 a 60 são múltiplos de 3 ou de 4?", "30"],
  ["pior-caso", "Uma caixa tem cápsulas: 5 azuis, 4 verdes e 3 pretas. Sem olhar, quantas é preciso tirar para garantir 2 da mesma cor?", "4"],
  ["soma-dos-algarismos", "Quantos números de dois algarismos têm algarismos que somam 9?", "9"],
  ["farois-juntos", "Três faróis piscam a cada 4, 6 e 10 segundos. Agora piscaram juntos. Em quantos segundos piscam juntos de novo?", "60"],
];
for (const [tipo, e, certa] of AMAO) {
  const v = RESOLVER[tipo](e, { opcoes: [] } as unknown as Questao);
  if (v !== certa) erro(`Caso à mão ${tipo}: esperado ${certa}, resolvedor deu ${v}`);
}

// Todo gerador, em todo nível que ele aceita, com 3 e 4 opções.
for (const g of GERADORES) {
  if (g.de > g.ate) erro(`${g.tipo}: faixa de nível vazia`);
  for (let nv = g.de; nv <= g.ate; nv++) {
    for (const n of [3, 4]) {
      const r = sementeira(1000 + nv * 7 + n);
      for (let i = 0; i < 1500; i++) {
        const q = gerarQuestao(g, nv, n, r);
        if (q.opcoes.length !== n) erro(`${g.tipo} (nível ${nv}): ${q.opcoes.length} opções em vez de ${n}`);
        conferir(q, `Nível ${nv}`);
      }
    }
  }
}

// Variedade: cada gerador precisa sortear enunciados diferentes de verdade, salvo os de resposta fixa.
for (const g of GERADORES) {
  if (g.tipo === "maior-fracao") continue;
  const r = sementeira(7);
  const vistos = new Set<string>();
  for (let i = 0; i < 200; i++) vistos.add(gerarQuestao(g, g.ate, 4, r).enunciado);
  if (vistos.size < 4) erro(`${g.tipo}: só ${vistos.size} enunciados diferentes`);
}

// Partidas inteiras, na ordem em que o jogo pede.
const posicoes = [0, 0, 0, 0];
const contagemTemas = new Set<string>();
for (let s = 1; s <= 400; s++) {
  const roteiro = criarRoteiro(sementeira(s * 31));
  const vistos = new Set<string>();
  FASES.forEach((f, i) => {
    const seq = [...Array(f.ondas).fill(false), ...Array(f.vidaChefe + 3).fill(true)] as boolean[];
    seq.forEach((chefe) => {
      const q = roteiro(i, chefe);
      conferir(q, `Partida ${s}, fase ${i + 1}`);
      contagemTemas.add(q.tema);
      if (q.opcoes.length !== f.opcoes) erro(`Fase ${i + 1}: ${q.opcoes.length} opções`);
      if (q.nivel !== nivelDa(i, chefe)) erro(`Fase ${i + 1}: nível ${q.nivel}`);
      if (vistos.has(q.enunciado)) erro(`Partida ${s}: enunciado repetido: ${q.enunciado}`);
      vistos.add(q.enunciado);
      if (f.opcoes === 4) posicoes[q.certa]++;
    });
  });
}
for (const tema of ["fracoes", "porcentagem", "razao", "potencias", "sequencias", "geometria", "logica"]) if (!contagemTemas.has(tema)) erro(`Tema ausente das partidas: ${tema}`);

// A resposta certa não pode ter posição preferida.
const total = posicoes.reduce((a, b) => a + b, 0);
posicoes.forEach((p, i) => {
  const parte = p / total;
  if (parte < 0.2 || parte > 0.3) erro(`Resposta certa na posição ${i + 1} em ${(parte * 100).toFixed(1)}% das vezes`);
});

// A mesma semente dá a mesma partida.
const a = criarRoteiro(sementeira(99));
const b = criarRoteiro(sementeira(99));
for (let i = 0; i < 20; i++) if (a(0, false).enunciado !== b(0, false).enunciado) erro("Mesma semente, partidas diferentes");

// Fases: pelo menos 5 e dificuldade que só cresce.
if (FASES.length < 5) erro(`Só ${FASES.length} fases`);
FASES.forEach((f, i) => {
  if (!f.chefe) erro(`Fase ${i + 1} sem chefe`);
  const tipos = new Set(geradoresDa(i, false).map((g) => g.tipo));
  if (tipos.size < 3) erro(`Fase ${i + 1}: só ${tipos.size} tipos de conta`);
  if (new Set(geradoresDa(i, true).map((g) => g.tipo)).size < 3) erro(`Chefe da fase ${i + 1}: poucos tipos de conta`);
  if (i === 0) return;
  const p = FASES[i - 1];
  if (f.nivel <= p.nivel) erro(`Fase ${i + 1}: nível não cresce`);
  if (f.opcoes < p.opcoes) erro(`Fase ${i + 1}: menos opções que a anterior`);
  if (f.asteroidesPorSegundo <= p.asteroidesPorSegundo) erro(`Fase ${i + 1}: asteroides não aumentam`);
  if (f.velocidadeAsteroide <= p.velocidadeAsteroide) erro(`Fase ${i + 1}: asteroides não aceleram`);
  if (f.ondulacao <= p.ondulacao) erro(`Fase ${i + 1}: cápsulas não balançam mais`);
  if (f.vidaChefe < p.vidaChefe || f.disparosChefe < p.disparosChefe) erro(`Fase ${i + 1}: chefe mais fraco que o anterior`);
});

// Ligações no site: fichas que existem e carimbo com o mesmo id que o Molde dá.
const jogo = JOGOS.find((j) => j.slug === "orbita-numerica");
if (!jogo) erro("Jogo não registrado em src/lib/jogos.ts");
else {
  const dados = JSON.parse(readFileSync("data/oportunidades.json", "utf8")) as { id: string; areas: string[] }[];
  const lista = Array.isArray(dados) ? dados : (dados as unknown as { oportunidades: { id: string; areas: string[] }[] }).oportunidades;
  for (const id of [...jogo.oportunidades, jogo.principal]) {
    const o = lista.find((x) => x.id === id);
    if (!o) erro(`Ficha inexistente: ${id}`);
    else if (!o.areas.includes("Matemática")) erro(`Ficha fora de Matemática: ${id}`);
  }
  for (const texto of [jogo.titulo, jogo.olimpiada, jogo.resumo, jogo.como]) if (/[—–]/.test(texto)) erro(`Travessão em jogos.ts: ${texto}`);
  const guia = readFileSync("src/lib/guia.ts", "utf8");
  if (!guia.includes(`id: "${jogo.slug}"`)) erro("Sem carimbo em src/lib/guia.ts");
  if (!readFileSync("src/app/jogos/[slug]/JogoCliente.tsx", "utf8").includes(`"${jogo.slug}"`)) erro("Sem carregamento em JogoCliente.tsx");
}

console.log(`${conferidas.toLocaleString("pt-BR")} questões conferidas.`);
console.log(falhas ? `\n${falhas} problema(s).` : "Órbita Numérica conferida: nenhum problema.");
process.exit(falhas ? 1 : 0);
