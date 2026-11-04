// Questões da Órbita Numérica. Cada uma nasce de uma função: os números são sorteados e a resposta é calculada,
// nunca escrita à mão. Sem React e sem navegador, para o teste (scripts/testar-orbita.ts) rodar direto no Node.

export type Tema = "fracoes" | "porcentagem" | "razao" | "potencias" | "sequencias" | "geometria" | "logica";

export const NOME_TEMA: Record<Tema, string> = {
  fracoes: "frações",
  porcentagem: "porcentagem",
  razao: "razão e proporção",
  potencias: "potências",
  sequencias: "sequências",
  geometria: "geometria",
  logica: "raciocínio lógico",
};

export type Questao = {
  tipo: string;
  tema: Tema;
  nivel: number;
  enunciado: string;
  opcoes: string[];
  certa: number; // índice em opcoes
  explicacao: string;
};

export type Sorteio = () => number;

/** Gerador pequeno e repetível: a mesma semente dá a mesma partida. */
export function sementeira(semente: number): Sorteio {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const int = (r: Sorteio, de: number, ate: number) => de + Math.floor(r() * (ate - de + 1));
const um = <T,>(r: Sorteio, l: readonly T[]) => l[Math.floor(r() * l.length)];
function embaralhar<T>(r: Sorteio, l: readonly T[]) {
  const c = [...l];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}
const mdc = (a: number, b: number): number => (b ? mdc(b, a % b) : Math.abs(a));
const mmc = (a: number, b: number) => (a * b) / mdc(a, b);

const ALTOS = "⁰¹²³⁴⁵⁶⁷⁸⁹";
export const expoente = (n: number) => String(n).replace(/\d/g, (d) => ALTOS[+d]);
const fr = (n: number, d: number) => `${n}/${d}`;
function simples(n: number, d: number) {
  const m = mdc(n, d);
  return fr(n / m, d / m);
}
/** Número com vírgula, sem zeros sobrando: 1,1 e 0,25. */
const dec = (v: number) => String(Math.round(v * 10000) / 10000).replace(".", ",");
const pct = (v: number) => `${v}%`;
const grau = (v: number) => `${v}°`;
const txt = (v: number) => String(v);

/** Como o valor é comparado: 2/4 e 1/2 contam como a mesma opção. */
export function chaveOpcao(o: string) {
  const f = /^(\d+)\/(\d+)$/.exec(o);
  if (f) return simples(+f[1], +f[2]);
  return o.toLowerCase();
}

type Bruto = { enunciado: string; certa: string; erradas: string[]; explicacao: string };
type Gerador = { tipo: string; tema: Tema; de: number; ate: number; gerar: (nv: number, r: Sorteio, n: number) => Bruto };

export const MAX_OPCAO = 6;

function opcaoValida(o: string) {
  if (!o || o.length > MAX_OPCAO || /NaN|Infinity|undefined|-|\.|e\+/.test(o)) return false;
  const f = /^(\d+)\/(\d+)$/.exec(o);
  if (f) return +f[1] > 0 && +f[2] > 1;
  const v = /^(\d+)(%|°)?$/.exec(o);
  if (v) return +v[1] > 0;
  return true;
}

/** Vizinhos da resposta, só para quando as erradas planejadas coincidem ou não servem. */
function* reservas(certa: string): Generator<string> {
  const f = /^(\d+)\/(\d+)$/.exec(certa);
  if (f) {
    const n = +f[1];
    const d = +f[2];
    for (let i = 1; i < 12; i++) {
      yield simples(n + i, d);
      yield simples(n, d + i);
      if (n > i) yield simples(n - i, d);
    }
    return;
  }
  const v = /^(\d+)(%|°)?$/.exec(certa);
  if (!v) return;
  const base = +v[1];
  const fim = v[2] ?? "";
  const salto = Math.max(1, Math.round(base * 0.1));
  for (let i = 1; i < 30; i++) {
    yield `${base + salto * i}${fim}`;
    if (base - salto * i > 0) yield `${base - salto * i}${fim}`;
  }
}

function montar(g: Gerador, nv: number, n: number, r: Sorteio): Questao {
  const b = g.gerar(nv, r, n);
  const usadas = new Set([chaveOpcao(b.certa)]);
  const opcoes = [b.certa];
  const tentar = (o: string) => {
    if (opcoes.length >= n || !opcaoValida(o) || usadas.has(chaveOpcao(o))) return;
    usadas.add(chaveOpcao(o));
    opcoes.push(o);
  };
  embaralhar(r, b.erradas).forEach(tentar);
  for (const o of reservas(b.certa)) tentar(o);
  const finais = embaralhar(r, opcoes);
  return { tipo: g.tipo, tema: g.tema, nivel: nv, enunciado: b.enunciado, opcoes: finais, certa: finais.indexOf(b.certa), explicacao: b.explicacao };
}

const DENOMINADORES = [2, 3, 4, 5, 6, 8, 10];
const NOME_POLIGONO: Record<number, string> = { 5: "pentágono", 6: "hexágono", 7: "heptágono", 8: "octógono", 9: "eneágono", 10: "decágono" };
const DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
export const DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const NOMES = ["Ana", "Bia", "Caio", "Davi", "Iara", "Raul", "Lia", "Tiago"];
const CORES = ["azuis", "verdes", "pretas", "roxas"];

export const GERADORES: Gerador[] = [
  // Frações
  {
    tipo: "fracao-de-quantidade", tema: "fracoes", de: 1, ate: 3,
    gerar: (nv, r) => {
      const d = um(r, DENOMINADORES);
      let n = int(r, 1, d - 1);
      while (mdc(n, d) !== 1) n = int(r, 1, d - 1);
      const k = int(r, 2, 4 + nv * 3);
      const total = d * k;
      const a = n * k;
      return {
        enunciado: `A nave leva ${total} cápsulas e ${fr(n, d)} delas são de água. Quantas são de água?`,
        certa: txt(a),
        erradas: [k, total - a, a + k, total + n, a + d].map(txt),
        explicacao: `Divida ${total} em ${d} partes: ${total} ÷ ${d} = ${k}. Pegue ${n === 1 ? "1 parte" : `${n} partes`}: ${k} × ${n} = ${a}. São ${a} cápsulas.`,
      };
    },
  },
  {
    tipo: "fracao-equivalente", tema: "fracoes", de: 1, ate: 2,
    gerar: (_nv, r) => {
      const b = int(r, 2, 9);
      let a = int(r, 1, b - 1);
      while (mdc(a, b) !== 1) a = int(r, 1, b - 1);
      const m = int(r, 2, 6);
      return {
        enunciado: `Qual destas frações é igual a ${fr(a, b)}?`,
        certa: fr(a * m, b * m),
        erradas: [fr(a * m, b), fr(a + m, b + m), fr(a * m + 1, b * m), fr(a * m, b * m + 1), fr(a, b * m)],
        explicacao: `Multiplique em cima e embaixo pelo mesmo número, ${m}: ${a} × ${m} = ${a * m} e ${b} × ${m} = ${b * m}. Logo, ${fr(a, b)} = ${fr(a * m, b * m)}.`,
      };
    },
  },
  {
    tipo: "soma-mesmo-denominador", tema: "fracoes", de: 1, ate: 2,
    gerar: (_nv, r) => {
      const d = um(r, [5, 7, 8, 9, 10, 11, 12]);
      const a = int(r, 1, d - 2);
      const b = int(r, 1, d - 1 - a);
      const s = a + b;
      const certa = simples(s, d);
      return {
        enunciado: `Quanto é ${fr(a, d)} + ${fr(b, d)}?`,
        certa,
        erradas: [fr(s, 2 * d), simples(s + 1, d), fr(a * b, d), simples(Math.max(1, s - 1), d)],
        explicacao: `Com denominadores iguais, somamos só os numeradores: ${a} + ${b} = ${s}. Fica ${fr(s, d)}${certa !== fr(s, d) ? `, que simplificada dá ${certa}` : ""}.`,
      };
    },
  },
  {
    tipo: "soma-denominadores-diferentes", tema: "fracoes", de: 2, ate: 4,
    gerar: (_nv, r) => {
      for (;;) {
        const p = um(r, DENOMINADORES);
        const q = um(r, DENOMINADORES);
        if (p === q) continue;
        const a = int(r, 1, p - 1);
        const b = int(r, 1, q - 1);
        const L = mmc(p, q);
        const x = (a * L) / p;
        const y = (b * L) / q;
        const s = x + y;
        if (s % L === 0) continue;
        const certa = simples(s, L);
        return {
          enunciado: `Quanto é ${fr(a, p)} + ${fr(b, q)}?`,
          certa,
          erradas: [fr(a + b, p + q), simples(a + b, L), simples(s + 1, L), simples(a * b, p * q)],
          explicacao: `Use denominador comum, o MMC de ${p} e ${q}, que é ${L}: ${fr(a, p)} = ${fr(x, L)} e ${fr(b, q)} = ${fr(y, L)}. Somando: ${fr(s, L)}${certa !== fr(s, L) ? `, ou seja, ${certa}` : ""}.`,
        };
      }
    },
  },
  {
    tipo: "maior-fracao", tema: "fracoes", de: 2, ate: 4,
    gerar: (nv, r, n) => {
      const den = nv >= 3 ? [3, 4, 5, 6, 8, 10, 12] : [3, 4, 6, 8, 12];
      const l: [number, number][] = [];
      const vistos = new Set<string>();
      while (l.length < n) {
        const d = um(r, den);
        const a = int(r, 1, d - 1);
        const k = simples(a, d);
        if (vistos.has(k)) continue;
        vistos.add(k);
        const [x, y] = k.split("/").map(Number);
        l.push([x, y]);
      }
      const L = l.reduce((m, [, d]) => mmc(m, d), 1);
      const ordem = [...l].sort((u, v) => v[0] * u[1] - u[0] * v[1]);
      const [ta, tb] = ordem[0];
      return {
        enunciado: "Qual destas frações é a maior?",
        certa: fr(ta, tb),
        erradas: ordem.slice(1).map(([a, d]) => fr(a, d)),
        explicacao: `Com denominador comum ${L}: ${l.map(([a, d]) => `${fr(a, d)} = ${fr((a * L) / d, L)}`).join(", ")}. O maior numerador é ${(ta * L) / tb}, de ${fr(ta, tb)}.`,
      };
    },
  },
  {
    tipo: "resto-do-resto", tema: "fracoes", de: 3, ate: 5,
    gerar: (_nv, r) => {
      const a = int(r, 2, 6);
      const b = int(r, 2, 6);
      const certa = simples((a - 1) * (b - 1), a * b);
      return {
        enunciado: `Do tanque cheio, a nave gasta ${fr(1, a)} e depois ${fr(1, b)} do que sobrou. Que fração do tanque ainda resta?`,
        certa,
        erradas: [simples(a * b - a - b > 0 ? a * b - a - b : 1, a * b), fr(1, a * b), simples(b - 1, b), simples(a - 1, a), simples(a + b, a * b)],
        explicacao: `Depois do primeiro gasto, sobra ${fr(a - 1, a)} do tanque. Depois do segundo, fica ${fr(b - 1, b)} disso: ${fr(a - 1, a)} × ${fr(b - 1, b)} = ${fr((a - 1) * (b - 1), a * b)}${certa !== fr((a - 1) * (b - 1), a * b) ? `, ou seja, ${certa}` : ""}.`,
      };
    },
  },
  {
    tipo: "todo-a-partir-da-parte", tema: "fracoes", de: 3, ate: 5,
    gerar: (_nv, r) => {
      const d = int(r, 3, 9);
      let n = int(r, 2, d - 1);
      while (mdc(n, d) !== 1) n = int(r, 2, d - 1);
      const k = int(r, 2, 12);
      const p = n * k;
      return {
        enunciado: `${fr(n, d)} da tripulação são ${p} pessoas. Quantas pessoas há na tripulação?`,
        certa: txt(d * k),
        erradas: [p * d, p + d, d * k + k, k, p * n].map(txt),
        explicacao: `Se ${n} partes são ${p} pessoas, cada parte tem ${p} ÷ ${n} = ${k}. A tripulação inteira tem ${d} partes: ${k} × ${d} = ${d * k} pessoas.`,
      };
    },
  },

  // Porcentagem
  {
    tipo: "porcentagem-de-valor", tema: "porcentagem", de: 1, ate: 3,
    gerar: (nv, r) => {
      const p = um(r, nv === 1 ? [10, 20, 25, 50] : [5, 10, 15, 20, 25, 30, 40, 50, 75]);
      const passo = 100 / mdc(p, 100);
      const v = passo * int(r, 1, Math.max(2, Math.floor((nv * 200) / passo)));
      const a = (v * p) / 100;
      return {
        enunciado: `Quanto é ${p}% de ${v}?`,
        certa: txt(a),
        erradas: [v - a, a + Math.ceil(v / 10), a * 2, p, Math.ceil(v / p)].map(txt),
        explicacao: `${p}% quer dizer ${p} em cada 100. Então: ${v} × ${p} ÷ 100 = ${a}.`,
      };
    },
  },
  {
    tipo: "desconto", tema: "porcentagem", de: 1, ate: 3,
    gerar: (nv, r) => {
      const p = um(r, [5, 10, 20, 25, 50]);
      const preco = 20 * int(r, 2, 4 + nv * 4);
      const d = (preco * p) / 100;
      return {
        enunciado: `Um traje custa ${preco} reais e está com ${p}% de desconto. Quanto custa agora, em reais?`,
        certa: txt(preco - d),
        erradas: [d, preco - p, preco + d, preco - 2 * d].map(txt),
        explicacao: `O desconto é ${p}% de ${preco}: ${preco} × ${p} ÷ 100 = ${d} reais. O preço novo é ${preco} − ${d} = ${preco - d} reais.`,
      };
    },
  },
  {
    tipo: "que-porcentagem", tema: "porcentagem", de: 2, ate: 4,
    gerar: (_nv, r) => {
      const p = um(r, [10, 20, 25, 40, 50, 60, 75, 80]);
      const passo = 100 / mdc(p, 100);
      const total = passo * int(r, Math.ceil(20 / passo), Math.floor(200 / passo));
      const parte = (total * p) / 100;
      return {
        enunciado: `Das ${total} cápsulas da nave, ${parte} são azuis. Que porcentagem das cápsulas é azul?`,
        certa: pct(p),
        erradas: [100 - p, parte, p + 10, p - 5, p + 25].map(pct),
        explicacao: `Divida a parte pelo total: ${parte} ÷ ${total} = ${dec(p / 100)}. Multiplicando por 100, dá ${p}%.`,
      };
    },
  },
  {
    tipo: "dois-aumentos", tema: "porcentagem", de: 3, ate: 5,
    gerar: (_nv, r) => {
      const k = int(r, 1, 5);
      const v = 100 * k;
      const p = um(r, [10, 20, 50]);
      const q = um(r, [10, 20, 50]);
      const m = (v * (100 + p)) / 100;
      const f = (m * (100 + q)) / 100;
      return {
        enunciado: `Um valor de ${v} sobe ${p}% e depois sobe mais ${q}%. Qual é o valor final?`,
        certa: txt(f),
        erradas: [(v * (100 + p + q)) / 100, m, f + 10, (v * (100 + q)) / 100].map(txt),
        explicacao: `Cada aumento vale sobre o valor atual, sem somar as porcentagens. ${v} × ${dec((100 + p) / 100)} = ${m}. Depois, ${m} × ${dec((100 + q) / 100)} = ${f}.`,
      };
    },
  },
  {
    tipo: "sobe-e-desce", tema: "porcentagem", de: 4, ate: 5,
    gerar: (_nv, r) => {
      const p = um(r, [10, 20, 30, 40, 50]);
      const sobe = 100 + p;
      const tira = (sobe * p) / 100;
      const f = sobe - tira;
      return {
        enunciado: `Um preço sobe ${p}% e depois cai ${p}%. O preço final é que porcentagem do preço inicial?`,
        certa: pct(f),
        erradas: [100, 100 - p, 100 + p, f + p].map(pct),
        explicacao: `Comece com 100. Subindo ${p}%, vira ${sobe}. Cair ${p}% agora tira ${p}% de ${sobe}, que é ${tira}. Fica ${sobe} − ${tira} = ${f}, ou seja, ${f}%.`,
      };
    },
  },

  // Razão e proporção
  {
    tipo: "razao-em-partes", tema: "razao", de: 1, ate: 4,
    gerar: (nv, r) => {
      const a = int(r, 1, 7);
      let b = int(r, 1, 7);
      while (b === a || mdc(a, b) !== 1) b = int(r, 1, 7);
      const k = int(r, 2, 4 + nv * 2);
      const t = (a + b) * k;
      return {
        enunciado: `Em uma frota, a razão entre naves azuis e vermelhas é de ${a} para ${b}. São ${t} naves. Quantas são azuis?`,
        certa: txt(a * k),
        erradas: [b * k, k, a * k + k, t - k, a + k].map(txt),
        explicacao: `São ${a} + ${b} = ${a + b} partes. Cada parte tem ${t} ÷ ${a + b} = ${k} naves. As azuis são ${a} ${a === 1 ? "parte" : "partes"}: ${a} × ${k} = ${a * k}.`,
      };
    },
  },
  {
    tipo: "regra-de-tres", tema: "razao", de: 1, ate: 3,
    gerar: (nv, r) => {
      const l = int(r, 2, 6);
      const c = 5 * int(r, 1, 2 + nv * 2);
      let m = int(r, 2, 12);
      while (m === l) m = int(r, 2, 12);
      return {
        enunciado: `Com ${l} litros, a nave anda ${l * c} km. Com ${m} litros, quantos km ela anda?`,
        certa: txt(m * c),
        erradas: [l * c + m, m * l, m * c + c, Math.abs(m - l) * c, m * c + 10].map(txt),
        explicacao: `Cada litro rende ${l * c} ÷ ${l} = ${c} km. Com ${m} litros: ${m} × ${c} = ${m * c} km.`,
      };
    },
  },
  {
    tipo: "proporcao-inversa", tema: "razao", de: 3, ate: 5,
    gerar: (_nv, r) => {
      for (;;) {
        const a = int(r, 2, 8);
        const h = int(r, 2, 12);
        const b = int(r, 2, 12);
        const P = a * h;
        if (b === a || P % b !== 0 || P / b < 2) continue;
        return {
          enunciado: `${a} robôs consertam uma nave em ${h} horas. No mesmo ritmo, em quantas horas ${b} robôs consertam a nave?`,
          certa: txt(P / b),
          erradas: [P, (h * b) / a, h + 1, Math.abs(h - b) + 1, P / b + 2].filter(Number.isInteger).map(txt),
          explicacao: `Mais robôs, menos tempo. O conserto todo vale ${a} × ${h} = ${P} horas de um robô. Com ${b} robôs: ${P} ÷ ${b} = ${P / b} horas.`,
        };
      }
    },
  },

  // Potências
  {
    tipo: "valor-da-potencia", tema: "potencias", de: 1, ate: 3,
    gerar: (nv, r) => {
      const b = int(r, 2, 3 + nv);
      const e = int(r, 2, b === 2 ? 8 : b === 3 ? 5 : 3 + (nv > 2 ? 1 : 0));
      const v = b ** e;
      return {
        enunciado: `Quanto é ${b}${expoente(e)}?`,
        certa: txt(v),
        erradas: [b * e, b + e, b ** (e - 1), e ** b, v + b].map(txt),
        explicacao: `${b}${expoente(e)} é o produto de ${e} fatores iguais a ${b}: ${Array(e).fill(b).join(" × ")} = ${v}.`,
      };
    },
  },
  {
    tipo: "produto-de-mesma-base", tema: "potencias", de: 2, ate: 4,
    gerar: (_nv, r) => {
      const a = um(r, [2, 2, 3, 10]);
      const max = a === 2 ? 10 : a === 3 ? 6 : 5;
      const m = int(r, 2, max - 2);
      const n = int(r, 2, max - m);
      return {
        enunciado: `Quanto é ${a}${expoente(m)} × ${a}${expoente(n)}?`,
        certa: txt(a ** (m + n)),
        erradas: [a ** (m * n), a ** (m + n - 1), a * (m + n), a ** m + a ** n].map(txt),
        explicacao: `Na multiplicação de mesma base, somamos os expoentes: ${m} + ${n} = ${m + n}. Então dá ${a}${expoente(m + n)} = ${a ** (m + n)}.`,
      };
    },
  },
  {
    tipo: "divisao-de-mesma-base", tema: "potencias", de: 3, ate: 5,
    gerar: (_nv, r) => {
      const a = um(r, [2, 3, 5, 10]);
      const dif = int(r, 1, a === 2 ? 6 : 3);
      const n = int(r, 2, 6);
      const m = n + dif;
      return {
        enunciado: `Quanto é ${a}${expoente(m)} ÷ ${a}${expoente(n)}?`,
        certa: txt(a ** dif),
        erradas: [a * dif, a ** (dif + 1), m - n, a ** (dif - 1) + a, a ** dif + a].map(txt),
        explicacao: `Na divisão de mesma base, subtraímos os expoentes: ${m} − ${n} = ${dif}. Então dá ${a}${expoente(dif)} = ${a ** dif}.`,
      };
    },
  },
  {
    tipo: "soma-de-quadrados", tema: "potencias", de: 1, ate: 3,
    gerar: (nv, r) => {
      const a = int(r, 2, 4 + nv * 2);
      let b = int(r, 2, 4 + nv * 2);
      while (b === a) b = int(r, 2, 4 + nv * 2);
      const v = a * a + b * b;
      return {
        enunciado: `Quanto é ${a}² + ${b}²?`,
        certa: txt(v),
        erradas: [(a + b) ** 2, 2 * a + 2 * b, a * a + b, v + 2].map(txt),
        explicacao: `Primeiro as potências: ${a}² = ${a * a} e ${b}² = ${b * b}. Depois a soma: ${a * a} + ${b * b} = ${v}.`,
      };
    },
  },
  {
    tipo: "expoente-desconhecido", tema: "potencias", de: 2, ate: 4,
    gerar: (_nv, r) => {
      const a = um(r, [2, 2, 3, 4, 5, 10]);
      const e = int(r, 2, a === 2 ? 9 : a === 3 ? 5 : 4);
      const v = a ** e;
      return {
        enunciado: `Se ${a} elevado a n é igual a ${v}, quanto vale n?`,
        certa: txt(e),
        erradas: [e + 1, e - 1, a, e + 2, e * 2].map(txt),
        explicacao: `Multiplique o ${a} até chegar em ${v}: ${Array(e).fill(a).join(" × ")} = ${v}. São ${e} fatores, então n = ${e}.`,
      };
    },
  },
  {
    tipo: "ultimo-algarismo", tema: "potencias", de: 4, ate: 5,
    gerar: (_nv, r) => {
      const b = um(r, [2, 3, 7, 8]);
      const e = int(r, 20, 400);
      const ciclo: number[] = [];
      for (let i = 1, u = b % 10; i <= 4; i++, u = (u * b) % 10) ciclo.push(u);
      const resto = e % 4;
      const d = ciclo[(resto + 3) % 4];
      return {
        enunciado: `Qual é o último algarismo de ${b}${expoente(e)}?`,
        certa: txt(d),
        erradas: [1, 3, 7, 9, 2, 4, 6, 8].filter((x) => x !== d).map(txt),
        explicacao: `Os últimos algarismos de ${b}¹, ${b}², ${b}³ e ${b}⁴ são ${ciclo.join(", ")}, e depois tudo se repete de 4 em 4. ${e} ÷ 4 deixa resto ${resto}, então o último algarismo é o de ${b}${expoente(resto || 4)}: ${d}.`,
      };
    },
  },
  {
    tipo: "raiz-quadrada", tema: "potencias", de: 1, ate: 2,
    gerar: (_nv, r) => {
      const n = int(r, 3, 15);
      return {
        enunciado: `Qual número positivo, multiplicado por ele mesmo, dá ${n * n}?`,
        certa: txt(n),
        erradas: [n + 1, n - 1, Math.floor((n * n) / 2), n + 2].map(txt),
        explicacao: `Basta testar: ${n} × ${n} = ${n * n}. O número é ${n}.`,
      };
    },
  },

  // Sequências
  {
    tipo: "sequencia-aritmetica", tema: "sequencias", de: 1, ate: 3,
    gerar: (nv, r) => {
      const a = int(r, 1, 20);
      const p = int(r, 2, 5 + nv * 2);
      const t = [a, a + p, a + 2 * p, a + 3 * p];
      const f = a + 4 * p;
      return {
        enunciado: `Sequência: ${t.join(", ")}, ... Qual é o próximo termo?`,
        certa: txt(f),
        erradas: [f + 1, f - 1, f + p, t[3] * 2, f - 2].map(txt),
        explicacao: `Cada termo soma ${p} ao anterior. O próximo é ${t[3]} + ${p} = ${f}.`,
      };
    },
  },
  {
    tipo: "sequencia-geometrica", tema: "sequencias", de: 2, ate: 4,
    gerar: (_nv, r) => {
      const a = int(r, 1, 5);
      const q = int(r, 2, 4);
      const t = [a, a * q, a * q ** 2, a * q ** 3];
      const f = a * q ** 4;
      return {
        enunciado: `Sequência: ${t.join(", ")}, ... Qual é o próximo termo?`,
        certa: txt(f),
        erradas: [t[3] + (t[3] - t[2]), t[3] * (q + 1), f + a, t[3] + q].map(txt),
        explicacao: `Cada termo é o anterior vezes ${q}. O próximo é ${t[3]} × ${q} = ${f}.`,
      };
    },
  },
  {
    tipo: "termo-distante", tema: "sequencias", de: 3, ate: 5,
    gerar: (_nv, r) => {
      const a = int(r, 1, 12);
      const p = int(r, 2, 9);
      const n = um(r, [10, 15, 20, 25, 30, 50, 100]);
      const f = a + (n - 1) * p;
      return {
        enunciado: `Na sequência ${a}, ${a + p}, ${a + 2 * p}, ${a + 3 * p}, ... qual é o ${n}º termo?`,
        certa: txt(f),
        erradas: [a + n * p, n * p, f - p - 1, a + (n - 2) * p].map(txt),
        explicacao: `Do 1º ao ${n}º termo há ${n - 1} saltos de ${p}: ${a} + ${n - 1} × ${p} = ${a} + ${(n - 1) * p} = ${f}.`,
      };
    },
  },
  {
    tipo: "diferencas-crescentes", tema: "sequencias", de: 3, ate: 4,
    gerar: (_nv, r) => {
      const a = int(r, 1, 10);
      const d = int(r, 1, 4);
      const t = [a];
      for (let i = 0; i < 4; i++) t.push(t[i] + d + i);
      const prox = d + 4;
      const f = t[4] + prox;
      return {
        enunciado: `Sequência: ${t.join(", ")}, ... Qual é o próximo termo?`,
        certa: txt(f),
        erradas: [f + 1, f - 1, t[4] + d + 3, f + 2].map(txt),
        explicacao: `Os saltos crescem de 1 em 1: ${[0, 1, 2, 3].map((i) => d + i).join(", ")}. O próximo salto é ${prox}: ${t[4]} + ${prox} = ${f}.`,
      };
    },
  },
  {
    tipo: "soma-dos-dois-anteriores", tema: "sequencias", de: 3, ate: 5,
    gerar: (_nv, r) => {
      const t = [int(r, 1, 5), int(r, 2, 7)];
      for (let i = 2; i < 6; i++) t.push(t[i - 1] + t[i - 2]);
      const f = t[4] + t[5];
      return {
        enunciado: `Sequência: ${t.join(", ")}, ... Qual é o próximo termo?`,
        certa: txt(f),
        erradas: [t[5] + (t[5] - t[4]), f + 1, f - 1, t[5] * 2].map(txt),
        explicacao: `A partir do terceiro, cada termo é a soma dos dois anteriores: ${t[4]} + ${t[5]} = ${f}.`,
      };
    },
  },
  {
    tipo: "sequencia-de-quadrados", tema: "sequencias", de: 3, ate: 5,
    gerar: (_nv, r) => {
      const k = int(r, 1, 6);
      const c = um(r, [0, 0, 1, 2, 3]);
      const t = [0, 1, 2, 3].map((i) => (k + i) ** 2 + c);
      const prox = k + 4;
      const f = prox ** 2 + c;
      return {
        enunciado: `Sequência: ${t.join(", ")}, ... Qual é o próximo termo?`,
        certa: txt(f),
        erradas: [t[3] + (t[3] - t[2]), f + 1, f - 1, t[3] * 2].map(txt),
        explicacao: `Os saltos crescem de 2 em 2. O último foi ${t[3] - t[2]}, o próximo é ${t[3] - t[2] + 2}: ${t[3]} + ${t[3] - t[2] + 2} = ${f}, que é ${prox}²${c ? ` + ${c}` : ""}.`,
      };
    },
  },
  {
    tipo: "palavra-repetida", tema: "sequencias", de: 3, ate: 5,
    gerar: (_nv, r) => {
      const p = um(r, ["ÓRBITA", "NAVE", "COMETA", "SATURNO"]);
      const n = int(r, 20, 500);
      const resto = n % p.length;
      const letra = p[(n - 1) % p.length];
      const pos = resto || p.length;
      return {
        enunciado: `A palavra ${p} se repete sem parar: ${p}${p}... Qual é a ${n}ª letra?`,
        certa: letra,
        erradas: [...p].filter((x) => x !== letra),
        explicacao: `A palavra tem ${p.length} letras. ${n} ÷ ${p.length} deixa resto ${resto}, então ${resto ? `a letra é a ${pos}ª de ${p}` : `a contagem para na última letra de ${p}`}: ${letra}.`,
      };
    },
  },
  {
    tipo: "soma-de-gauss", tema: "sequencias", de: 4, ate: 5,
    gerar: (_nv, r) => {
      const n = um(r, [10, 20, 30, 40, 50, 60, 100]);
      const f = (n * (n + 1)) / 2;
      return {
        enunciado: `Quanto é 1 + 2 + 3 + ... + ${n}?`,
        certa: txt(f),
        erradas: [n * (n + 1), (n * n) / 2, f + n, f - n].map(txt),
        explicacao: `Junte em pares: 1 + ${n}, 2 + ${n - 1}, e assim por diante. Cada par dá ${n + 1} e são ${n / 2} pares: ${n / 2} × ${n + 1} = ${f}.`,
      };
    },
  },

  // Geometria
  {
    tipo: "perimetro-do-retangulo", tema: "geometria", de: 1, ate: 4,
    gerar: (nv, r) => {
      const a = int(r, 2, 6 + nv * 4);
      let b = int(r, 2, 6 + nv * 4);
      while (b === a) b = int(r, 2, 6 + nv * 4);
      return {
        enunciado: `Um retângulo tem lados de ${a} cm e ${b} cm. Qual é o perímetro, em cm?`,
        certa: txt(2 * (a + b)),
        erradas: [a * b, a + b, 2 * a + b, 4 * a].map(txt),
        explicacao: `O perímetro é a volta inteira: ${a} + ${b} + ${a} + ${b} = ${2 * (a + b)} cm.`,
      };
    },
  },
  {
    tipo: "area-do-retangulo", tema: "geometria", de: 1, ate: 4,
    gerar: (nv, r) => {
      const a = int(r, 2, 6 + nv * 4);
      let b = int(r, 2, 6 + nv * 4);
      while (b === a) b = int(r, 2, 6 + nv * 4);
      return {
        enunciado: `Um retângulo tem lados de ${a} cm e ${b} cm. Qual é a área, em cm²?`,
        certa: txt(a * b),
        erradas: [2 * (a + b), a + b, a * b + a, a * a].map(txt),
        explicacao: `A área do retângulo é um lado vezes o outro: ${a} × ${b} = ${a * b} cm².`,
      };
    },
  },
  {
    tipo: "terceiro-angulo", tema: "geometria", de: 1, ate: 4,
    gerar: (_nv, r) => {
      const a = 5 * int(r, 4, 16);
      const b = 5 * int(r, 4, Math.min(16, Math.floor((175 - a) / 5)));
      const c = 180 - a - b;
      return {
        enunciado: `Dois ângulos de um triângulo medem ${a}° e ${b}°. Quanto mede o terceiro?`,
        certa: grau(c),
        erradas: [360 - a - b, 180 - a, 180 - b, c + 10, c + 5].map(grau),
        explicacao: `Os três ângulos de um triângulo somam 180°. Então: 180° − ${a}° − ${b}° = ${c}°.`,
      };
    },
  },
  {
    tipo: "area-do-triangulo", tema: "geometria", de: 2, ate: 5,
    gerar: (nv, r) => {
      const b = 2 * int(r, 2, 4 + nv * 2);
      const h = int(r, 3, 6 + nv * 3);
      return {
        enunciado: `Um triângulo tem base de ${b} cm e altura de ${h} cm. Qual é a área, em cm²?`,
        certa: txt((b * h) / 2),
        erradas: [b * h, b + h, 2 * (b + h), (b * h) / 2 + h].map(txt),
        explicacao: `A área do triângulo é base vezes altura, dividido por 2: ${b} × ${h} ÷ 2 = ${(b * h) / 2} cm².`,
      };
    },
  },
  {
    tipo: "area-pelo-perimetro", tema: "geometria", de: 3, ate: 5,
    gerar: (_nv, r) => {
      const L = int(r, 3, 15);
      return {
        enunciado: `Um quadrado tem perímetro de ${4 * L} cm. Qual é a área, em cm²?`,
        certa: txt(L * L),
        erradas: [4 * L, 2 * L, (4 * L) ** 2, L * L + L].map(txt),
        explicacao: `Os 4 lados são iguais: ${4 * L} ÷ 4 = ${L} cm. A área é ${L} × ${L} = ${L * L} cm².`,
      };
    },
  },
  {
    tipo: "pitagoras", tema: "geometria", de: 3, ate: 5,
    gerar: (_nv, r) => {
      const [x, y, z] = um(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]] as const);
      const k = x === 3 ? int(r, 1, 4) : 1;
      const a = x * k;
      const b = y * k;
      const c = z * k;
      return {
        enunciado: `Um triângulo retângulo tem catetos de ${a} cm e ${b} cm. Quanto mede a hipotenusa, em cm?`,
        certa: txt(c),
        erradas: [a + b, c + 1, c - 1, c + 2, b + 1].map(txt),
        explicacao: `Pelo teorema de Pitágoras: ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}. O número que ao quadrado dá ${c * c} é ${c}, então a hipotenusa mede ${c} cm.`,
      };
    },
  },
  {
    tipo: "soma-dos-angulos", tema: "geometria", de: 4, ate: 5,
    gerar: (_nv, r) => {
      const n = int(r, 5, 10);
      const s = (n - 2) * 180;
      return {
        enunciado: `Qual é a soma dos ângulos internos de um ${NOME_POLIGONO[n]}?`,
        certa: grau(s),
        erradas: [n * 180, (n - 1) * 180, 360, (n - 3) * 180].map(grau),
        explicacao: `Um polígono de ${n} lados se divide em ${n} − 2 = ${n - 2} triângulos, cada um com 180°: ${n - 2} × 180° = ${s}°.`,
      };
    },
  },
  {
    tipo: "volume-do-cubo", tema: "geometria", de: 3, ate: 5,
    gerar: (_nv, r) => {
      const a = int(r, 2, 10);
      return {
        enunciado: `Um cubo tem aresta de ${a} cm. Qual é o volume, em cm³?`,
        certa: txt(a ** 3),
        erradas: [6 * a * a, 3 * a, a * a, 12 * a].map(txt),
        explicacao: `O volume do cubo é aresta vezes aresta vezes aresta: ${a} × ${a} × ${a} = ${a ** 3} cm³.`,
      };
    },
  },
  {
    tipo: "area-com-recorte", tema: "geometria", de: 4, ate: 5,
    gerar: (_nv, r) => {
      const a = int(r, 6, 16);
      let b = int(r, 5, 12);
      while (b === a) b = int(r, 5, 12);
      const c = int(r, 2, Math.min(a, b) - 1);
      return {
        enunciado: `De um retângulo de ${a} cm por ${b} cm, corta-se um quadrado de ${c} cm de lado em um canto. Qual é a área que resta, em cm²?`,
        certa: txt(a * b - c * c),
        erradas: [a * b, a * b - 4 * c, (a - c) * (b - c), a * b - c].map(txt),
        explicacao: `Área do retângulo: ${a} × ${b} = ${a * b} cm². Área do recorte: ${c} × ${c} = ${c * c} cm². Resta ${a * b} − ${c * c} = ${a * b - c * c} cm².`,
      };
    },
  },
  {
    tipo: "diagonais", tema: "geometria", de: 5, ate: 5,
    gerar: (_nv, r) => {
      const n = int(r, 5, 10);
      const t = n * (n - 3);
      return {
        enunciado: `Quantas diagonais tem um ${NOME_POLIGONO[n]}?`,
        certa: txt(t / 2),
        erradas: [t, n, n - 3, t / 2 + n].map(txt),
        explicacao: `De cada um dos ${n} vértices saem ${n - 3} diagonais: ${n} × ${n - 3} = ${t}. Assim cada diagonal foi contada duas vezes: ${t} ÷ 2 = ${t / 2}.`,
      };
    },
  },
  {
    tipo: "angulo-isosceles", tema: "geometria", de: 3, ate: 5,
    gerar: (_nv, r) => {
      let t = 10 * int(r, 2, 14);
      while (t === 60) t = 10 * int(r, 2, 14);
      const f = (180 - t) / 2;
      return {
        enunciado: `Em um triângulo isósceles, o ângulo diferente mede ${t}°. Quanto mede cada um dos outros dois?`,
        certa: grau(f),
        erradas: [180 - t, t, f + 10, f + 5].map(grau),
        explicacao: `Os três somam 180° e os outros dois são iguais: 180° − ${t}° = ${180 - t}°. Dividindo por 2, cada um mede ${f}°.`,
      };
    },
  },

  // Raciocínio lógico
  {
    tipo: "apertos-de-mao", tema: "logica", de: 3, ate: 5,
    gerar: (_nv, r) => {
      const n = int(r, 5, 20);
      const t = n * (n - 1);
      return {
        enunciado: `Em uma reunião de ${n} astronautas, cada um cumprimenta todos os outros uma vez. Quantos apertos de mão acontecem?`,
        certa: txt(t / 2),
        erradas: [t, n * n, n, t / 2 + n].map(txt),
        explicacao: `Cada um dos ${n} aperta ${n - 1} mãos: ${n} × ${n - 1} = ${t}. Assim cada aperto foi contado duas vezes: ${t} ÷ 2 = ${t / 2}.`,
      };
    },
  },
  {
    tipo: "dia-da-semana", tema: "logica", de: 2, ate: 5,
    gerar: (nv, r) => {
      const hoje = int(r, 0, 6);
      const k = int(r, 10, 40 * nv);
      const resto = k % 7;
      const fim = (hoje + k) % 7;
      return {
        enunciado: `Hoje é ${DIAS[hoje]}. Que dia da semana será daqui a ${k} dias?`,
        certa: DIAS_CURTOS[fim],
        erradas: DIAS_CURTOS.filter((_, i) => i !== fim),
        explicacao: `A semana se repete a cada 7 dias. ${k} ÷ 7 deixa resto ${resto}. ${resto === 0 ? `Resto zero: cai no mesmo dia, ${DIAS[fim]}.` : `Contando ${resto} ${resto === 1 ? "dia" : "dias"} a partir de ${DIAS[hoje]}, chegamos a ${DIAS[fim]}.`}`,
      };
    },
  },
  {
    tipo: "multiplos-de-um-ou-outro", tema: "logica", de: 4, ate: 5,
    gerar: (_nv, r) => {
      const [a, b] = um(r, [[2, 3], [3, 4], [3, 5], [4, 6], [2, 5], [4, 5], [6, 8], [6, 9]] as const);
      const N = 10 * int(r, 3, 12);
      const x = Math.floor(N / a);
      const y = Math.floor(N / b);
      const L = mmc(a, b);
      const z = Math.floor(N / L);
      return {
        enunciado: `Quantos números de 1 a ${N} são múltiplos de ${a} ou de ${b}?`,
        certa: txt(x + y - z),
        erradas: [x + y, x, y, z, x + y - 2 * z].map(txt),
        explicacao: `Múltiplos de ${a}: ${x}. Múltiplos de ${b}: ${y}. Os ${z} múltiplos de ${L} foram contados duas vezes. Total: ${x} + ${y} − ${z} = ${x + y - z}.`,
      };
    },
  },
  {
    tipo: "soma-das-idades", tema: "logica", de: 2, ate: 5,
    gerar: (_nv, r) => {
      const A = um(r, NOMES);
      let B = um(r, NOMES);
      while (B === A) B = um(r, NOMES);
      const m = int(r, 2, 6);
      const x = int(r, 3, 12);
      const s = (m + 1) * x;
      return {
        enunciado: `${A} tem ${m} vezes a idade de ${B}. A soma das duas idades é ${s}. Quantos anos tem ${B}?`,
        certa: txt(x),
        erradas: [m * x, Math.floor(s / m), x + m, x + 1].map(txt),
        explicacao: `A idade de ${B} vale 1 parte e a de ${A} vale ${m}. São ${m + 1} partes: ${s} ÷ ${m + 1} = ${x}. ${B} tem ${x} anos.`,
      };
    },
  },
  {
    tipo: "robos-e-rodas", tema: "logica", de: 3, ate: 5,
    gerar: (_nv, r) => {
      const n = int(r, 6, 24);
      const x = int(r, 1, n - 1);
      const R = 2 * (n - x) + 4 * x;
      return {
        enunciado: `Em um hangar há ${n} robôs, uns com 2 rodas e outros com 4. São ${R} rodas ao todo. Quantos robôs têm 4 rodas?`,
        certa: txt(x),
        erradas: [n - x, x + 1, x + 2, Math.floor(R / 4)].map(txt),
        explicacao: `Se todos tivessem 2 rodas, seriam ${n} × 2 = ${2 * n}. Sobram ${R} − ${2 * n} = ${R - 2 * n} rodas, e cada robô de 4 rodas tem 2 a mais: ${R - 2 * n} ÷ 2 = ${x}.`,
      };
    },
  },
  {
    tipo: "pior-caso", tema: "logica", de: 3, ate: 5,
    gerar: (_nv, r) => {
      const c = int(r, 3, 4);
      const k = int(r, 2, 4);
      const contas = Array.from({ length: c }, () => int(r, k, k + 5));
      const lista = contas.map((q, i) => `${q} ${CORES[i]}`);
      const texto = `${lista.slice(0, -1).join(", ")} e ${lista[lista.length - 1]}`;
      const pior = c * (k - 1);
      return {
        enunciado: `Uma caixa tem cápsulas: ${texto}. Sem olhar, quantas é preciso tirar para garantir ${k} da mesma cor?`,
        certa: txt(pior + 1),
        erradas: [k, pior, c + k, contas.reduce((a, b) => a + b, 0), c].map(txt),
        explicacao: `No pior caso, ${k === 2 ? "vem 1" : `vêm ${k - 1}`} de cada uma das ${c} cores: ${c} × ${k - 1} = ${pior} cápsulas, sem ${k} iguais. A próxima garante: ${pior} + 1 = ${pior + 1}.`,
      };
    },
  },
  {
    tipo: "combinacoes", tema: "logica", de: 2, ate: 5,
    gerar: (_nv, r) => {
      const a = int(r, 2, 5);
      const b = int(r, 2, 6);
      const c = int(r, 2, 4);
      return {
        enunciado: `Para a missão há ${a} capacetes, ${b} trajes e ${c} pares de botas. De quantos modos diferentes dá para se vestir?`,
        certa: txt(a * b * c),
        erradas: [a + b + c, a * b, a * b + c, a * c + b].map(txt),
        explicacao: `Cada escolha se combina com todas as outras, então multiplicamos: ${a} × ${b} × ${c} = ${a * b * c} modos.`,
      };
    },
  },
  {
    tipo: "soma-dos-algarismos", tema: "logica", de: 4, ate: 5,
    gerar: (_nv, r) => {
      const s = int(r, 3, 15);
      const l: number[] = [];
      for (let a = 1; a <= 9; a++) if (s - a >= 0 && s - a <= 9) l.push(10 * a + (s - a));
      return {
        enunciado: `Quantos números de dois algarismos têm algarismos que somam ${s}?`,
        certa: txt(l.length),
        erradas: [l.length + 1, l.length - 1, l.length + 2, s].map(txt),
        explicacao: `Basta listar: ${l.join(", ")}. São ${l.length} números.`,
      };
    },
  },
  {
    tipo: "farois-juntos", tema: "logica", de: 3, ate: 5,
    gerar: (_nv, r) => {
      const [a, b, c] = um(r, [[2, 3, 4], [4, 6, 10], [3, 4, 6], [2, 5, 6], [6, 8, 12], [3, 5, 10], [4, 5, 10], [6, 9, 12]] as const);
      const L = mmc(mmc(a, b), c);
      return {
        enunciado: `Três faróis piscam a cada ${a}, ${b} e ${c} segundos. Agora piscaram juntos. Em quantos segundos piscam juntos de novo?`,
        certa: txt(L),
        erradas: [a * b * c, a + b + c, L * 2, c, L + a].map(txt),
        explicacao: `O tempo precisa ser múltiplo de ${a}, de ${b} e de ${c} ao mesmo tempo. O menor deles é o MMC: ${L} segundos.`,
      };
    },
  },
  {
    tipo: "pesagens", tema: "logica", de: 3, ate: 5,
    gerar: (_nv, r) => {
      const c = int(r, 3, 30);
      let p = int(r, 2, 30);
      while (p === c) p = int(r, 2, 30);
      const u = c + p;
      const d = 2 * c + p;
      return {
        enunciado: `Um cristal e uma pedra pesam ${u} g. Dois cristais e uma pedra pesam ${d} g. Quanto pesa a pedra, em gramas?`,
        certa: txt(p),
        erradas: [c, d - u + 1, u - 1, p + 2].map(txt),
        explicacao: `A diferença entre as pesagens é um cristal: ${d} − ${u} = ${c} g. Então a pedra pesa ${u} − ${c} = ${p} g.`,
      };
    },
  },
  {
    tipo: "maior-numero-de-pacotes", tema: "logica", de: 3, ate: 5,
    gerar: (_nv, r) => {
      const g = int(r, 3, 12);
      const x = int(r, 2, 6);
      let y = int(r, 2, 7);
      while (mdc(x, y) !== 1) y = int(r, 2, 7);
      const a = g * x;
      const b = g * y;
      return {
        enunciado: `${a} cápsulas azuis e ${b} vermelhas vão em pacotes iguais, sem sobrar nenhuma. Qual é o maior número de pacotes possível?`,
        certa: txt(g),
        erradas: [x + y, g + 1, Math.abs(a - b) + 1, g * 2].map(txt),
        explicacao: `O número de pacotes precisa dividir ${a} e ${b}. O maior deles é o MDC: ${g}. Cada pacote fica com ${x} azuis e ${y} vermelhas.`,
      };
    },
  },
];

export type Fase = {
  nome: string;
  chefe: string;
  temas: Tema[];
  nivel: number; // nível das contas comuns; o chefe usa um acima
  opcoes: number;
  ondas: number; // contas antes do chefe
  vidaChefe: number;
  segundos: number; // tempo até as cápsulas passarem
  asteroidesPorSegundo: number;
  velocidadeAsteroide: number; // telas por segundo
  ondulacao: number; // pixels que as cápsulas balançam
  disparosChefe: number;
};

// A dificuldade cresce em tudo ao mesmo tempo: contas, opções, asteroides e chefe.
export const FASES: Fase[] = [
  { nome: "Cinturão das Frações", chefe: "Fracionador", temas: ["fracoes"], nivel: 1, opcoes: 3, ondas: 4, vidaChefe: 2, segundos: 20, asteroidesPorSegundo: 0.2, velocidadeAsteroide: 0.16, ondulacao: 0, disparosChefe: 1 },
  { nome: "Nebulosa da Proporção", chefe: "Porcentauro", temas: ["porcentagem", "razao"], nivel: 2, opcoes: 3, ondas: 4, vidaChefe: 3, segundos: 22, asteroidesPorSegundo: 0.32, velocidadeAsteroide: 0.19, ondulacao: 2, disparosChefe: 2 },
  { nome: "Anéis das Potências", chefe: "Expoente", temas: ["potencias", "sequencias"], nivel: 3, opcoes: 4, ondas: 4, vidaChefe: 3, segundos: 24, asteroidesPorSegundo: 0.45, velocidadeAsteroide: 0.22, ondulacao: 4, disparosChefe: 3 },
  { nome: "Setor Geométrico", chefe: "Poliedro", temas: ["geometria"], nivel: 4, opcoes: 4, ondas: 5, vidaChefe: 3, segundos: 24, asteroidesPorSegundo: 0.6, velocidadeAsteroide: 0.25, ondulacao: 6, disparosChefe: 3 },
  { nome: "Núcleo Lógico", chefe: "Paradoxo", temas: ["logica", "fracoes", "porcentagem", "potencias", "sequencias", "geometria"], nivel: 5, opcoes: 4, ondas: 5, vidaChefe: 4, segundos: 26, asteroidesPorSegundo: 0.75, velocidadeAsteroide: 0.28, ondulacao: 8, disparosChefe: 5 },
];

export const nivelDa = (fase: number, chefe: boolean) => Math.min(5, FASES[fase].nivel + (chefe ? 1 : 0));

export function geradoresDa(fase: number, chefe: boolean) {
  const f = FASES[fase];
  const nv = nivelDa(fase, chefe);
  const base = GERADORES.filter((g) => f.temas.includes(g.tema) && g.de <= nv && nv <= g.ate);
  // Na última fase, a lógica é o prato principal e as demais áreas entram como revisão difícil.
  return fase === FASES.length - 1 ? [...base.filter((g) => g.tema === "logica"), ...base] : base;
}

export function gerarQuestao(g: Gerador, nivel: number, opcoes: number, r: Sorteio) {
  return montar(g, nivel, opcoes, r);
}

/** Sorteia as contas de uma partida: passa por todo o baralho antes de repetir um tipo e nunca repete um enunciado. */
export function criarRoteiro(r: Sorteio) {
  const baralhos = new Map<string, Gerador[]>();
  const vistos = new Set<string>();
  let ultimo = "";
  return (fase: number, chefe: boolean): Questao => {
    const chave = `${fase}-${chefe}`;
    const nv = nivelDa(fase, chefe);
    for (let t = 0; ; t++) {
      let b = baralhos.get(chave);
      if (!b || !b.length) {
        b = embaralhar(r, geradoresDa(fase, chefe));
        baralhos.set(chave, b);
      }
      const g = b.pop()!;
      if (g.tipo === ultimo && t < 8) continue;
      const q = montar(g, nv, FASES[fase].opcoes, r);
      if (vistos.has(q.enunciado) && t < 40) continue;
      vistos.add(q.enunciado);
      ultimo = g.tipo;
      return q;
    }
  };
}
