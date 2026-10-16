/**
 * O Zé: capivara em pixel art, com laranja na cabeça. Puro: nada aqui toca
 * o `$` nem o surface. Cada caractere do terminal são 2 pixels (▀ com cor de
 * frente em cima e cor de fundo embaixo), então a faixa de 5 linhas tem 10px.
 */

import type { Acao, Cena } from '../types'

import { arranjo, avancaTurma, pintaTurma, recebeTurma, rotulos } from './turma'
import type { Marcas } from './turma'

export type { Acao, Cena }

export type Palco = {
  tick: number
  x: number
  dir: 1 | -1
  seq: number
  inicio: number
  /** Relógio de cada capivarinha da turma, por agentId. */
  turma?: Marcas
}

export type Pedaco = { t: string; cor?: string; fundo?: string }

export const LINHAS = 5
/** Com a turma a faixa ganha uma linha: os nomes ficam em cima delas. */
export const LINHAS_TURMA = 6
export const ALTURA = LINHAS * 2
export const TIQUE_MS = 120

/** Quantos tiques dura cada ação passageira antes de virar `cena.depois`. */
export const DURACAO: Partial<Record<Acao, number>> = { pula: 9, comemora: 18, caido: 20, panico: 24, chamando: 14 }

const COR: Record<string, string> = {
  B: '#b5835a', // corpo
  D: '#8a5a36', // sombra, orelha, pés
  H: '#d6a274', // brilho do lombo
  N: '#3b2a20', // focinho
  E: '#111111', // olho
  O: '#ff9500', // laranja
  o: '#d96f00', // laranja escura
  L: '#3fae4a', // folhinha
  G: '#3f8f3f', // grama
  g: '#2f6f2f', // grama escura
  F: '#f2d14b', // flor
  S: '#9aa3ad', // notebook
  C: '#4fd1ff', // tela acesa
  c: '#2a8fb8', // tela
  Y: '#f2c94c', // amarelo: lupa, faísca, estrela
  l: '#c9f1ff', // lente
  h: '#8b5a2b', // cabo
  M: '#6b7280', // metal
  P: '#2d2d2d', // celular
  R: '#ef4444', // vermelho
  W: '#7dd3fc', // suor
  T: '#e5e7eb', // pensamento
  p: '#f472b6', // confete rosa
  v: '#a78bfa', // confete roxo
}

const CONFETE = ['R', 'Y', 'C', 'p', 'v', 'L', 'O']

/** Pixel art: '.' é transparente, as letras saem de COR. 17x8, olhando pra direita. */
const ZE = (olho: string, pernas: string) => [
  '...........LOO...',
  '..........OOOOo..',
  '....HHHHHHHD.D...',
  '..HBBBBBBBBBBBB..',
  `.BBBBBBBBBBBB${olho}BB.`,
  '.BBBBBBBBBBBBBBBN',
  '..BBBBBBBBBBDBBN.',
  pernas,
]

const PERNAS_A = '..DB.DB...DB.DB..'
const PERNAS_B = '...DBDB....DBDB..'
const SENTADA = '..DDDD....DDDD...'

const CAIDA = [
  '.................',
  '.................',
  '...DB.DB..DB.DB..',
  '..BBBBBBBBBBBB...',
  '.BBBBBBBBBBBBBBN.',
  '.BBBBBBBBBBBBEBB.',
  '..HHHHHHHHHHB....',
  'OO...............',
]

type Tela = (string | null)[][]

const tela = (largura: number, altura: number): Tela =>
  Array.from({ length: altura }, () => Array.from({ length: largura }, () => null))

const pinta = (t: Tela, arte: string[], x: number, y: number) =>
  arte.forEach((linha, i) =>
    Array.from(linha).forEach((ch, j) => {
      const fila = t[y + i]

      if (ch !== '.' && fila && x + j >= 0 && x + j < fila.length) {
        fila[x + j] = ch
      }
    }),
  )

const ponto = (t: Tela, x: number, y: number, ch: string) => pinta(t, [ch], x, y)

/** Pseudoaleatório estável por tique: o confete não pisca igual sempre. */
const sorte = (n: number) => {
  const s = Math.sin(n * 12.9898) * 43758.5453

  return s - Math.floor(s)
}

const pisca = (tick: number) => tick % 37 === 0 || tick % 37 === 1

/** A ação que vale agora: a passageira até vencer, depois `cena.depois`. */
export const vigente = (cena: Cena, palco: Palco): Acao => {
  const dura = DURACAO[cena.acao]

  return dura !== undefined && palco.tick - palco.inicio >= dura ? cena.depois : cena.acao
}

const ATOR = 27

/** Quantas colunas o Zé pode andar sem pisar na turma. */
export const pista = (largura: number, cena: Cena, palco?: Palco) =>
  Math.max(4, arranjo(cena, largura, palco?.tick ?? 0, palco?.turma ?? {}, ATOR).inicio - ATOR)

/** Um tique de física: anda, quica nas bordas, para de vez em quando. */
export const avanca = (palco: Palco, cena: Cena, largura: number): Palco => {
  const tick = palco.tick + 1
  const acao = vigente(cena, { ...palco, tick })
  const fim = pista(largura, cena, palco)
  const pausa = acao === 'ocioso' && Math.floor(tick / 40) % 3 === 2
  const ritmo = acao === 'panico' ? 1 : acao === 'ocioso' ? 2 : acao === 'procurando' ? 3 : 0
  let { x, dir } = palco

  if (ritmo && !pausa && tick % ritmo === 0) {
    x += dir

    if (x <= 0 || x >= fim) {
      dir = dir === 1 ? -1 : 1
      x = Math.max(0, Math.min(fim, x))
    }
  }

  const turma = avancaTurma(palco.turma ?? {}, cena, largura, tick, ATOR)

  return { ...palco, tick, x: Math.min(x, fim), dir, turma }
}

/** Nova cena chegou: reinicia o relógio da ação. */
export const recebe = (palco: Palco, cena: Cena): Palco => {
  const p = cena.seq === palco.seq ? palco : { ...palco, seq: cena.seq, inicio: palco.tick }

  const turma = recebeTurma(p.turma ?? {}, cena, p.tick)

  return turma === p.turma ? p : { ...p, turma }
}

/**
 * Quantas linhas a faixa usa: com a turma cresce até LINHAS_TURMA, mas nunca
 * passa do espaço que o terminal deu (`espaco`), nem fica menor que LINHAS.
 */
export const linhas = (cena: Cena, espaco = LINHAS_TURMA) =>
  Math.max(LINHAS, Math.min(cena.ajudantes.length ? LINHAS_TURMA : LINHAS, espaco))

/** Desenha o Zé e o adereço da ação numa tela própria de ATOR x ALTURA. */
const ator = (acao: Acao, palco: Palco): Tela => {
  const t = tela(ATOR, ALTURA)
  const k = palco.tick - palco.inicio
  const olho = pisca(palco.tick) ? 'B' : 'E'
  const passo = Math.floor(palco.tick / 2) % 2 === 0
  const topo = 1

  switch (acao) {
    case 'pula':
    case 'comemora': {
      const ciclo = acao === 'comemora' ? k % 9 : k
      const dy = [0, 1, 2, 2, 2, 1, 0, 0, 0][ciclo] ?? 0
      pinta(t, ZE(olho, dy ? PERNAS_B : SENTADA), 0, topo - dy)

      if (acao === 'comemora') {
        for (let i = 0; i < 9; i++) {
          const r = sorte(palco.tick * 13 + i)
          ponto(t, Math.floor(r * ATOR), Math.floor(sorte(r * 7 + i) * 5), CONFETE[i % CONFETE.length] ?? 'Y')
        }
      }

      return t
    }
    case 'digitando':
      pinta(t, ZE(olho, k % 2 ? '..DDDD....DD.D...' : '..DDDD....D.DD...'), 0, topo)
      pinta(t, ['.....S', '.....S', '.....S', 'SSSSSS'], 17, 5)
      pinta(t, [k % 4 < 2 ? 'C' : 'c', 'C', k % 3 ? 'c' : 'C'], 21, 5)

      return t
    case 'procurando': {
      const sobe = Math.floor(k / 3) % 2
      pinta(t, ZE(olho, passo ? PERNAS_A : PERNAS_B), 0, topo)
      pinta(t, ['.Y.', 'YlY', '.Y.', 'h..'], 17, 3 - sobe)

      return t
    }
    case 'construindo':
      pinta(t, ZE(olho, SENTADA), 0, topo)

      if (Math.floor(k / 2) % 2) {
        pinta(t, ['MMM', '.h.', '.h.', '.h.'], 17, 1)
      } else {
        pinta(t, ['....MM', 'hhhhMM.Y', '......Y.'], 17, 6)
      }

      pinta(t, ['DD', 'DDD'].slice(0, 1 + (Math.floor(palco.tick / 30) % 2)), 24, 7)

      return t
    case 'telefone':
      pinta(t, ZE(olho, SENTADA), 0, topo)
      pinta(t, ['P', 'P'], 17, 3)
      ;[19, 21, 23].forEach((x, i) => {
        if (k % 6 >= i * 2) {
          pinta(t, ['C', '.', 'C'], x, 2)
        }
      })

      return t
    case 'chamando':
      pinta(t, ZE(olho, SENTADA), 0, topo)
      pinta(t, ['..oo', 'oOOO', '..oo'], 17, 3)
      ;[22, 24].forEach((x, i) => {
        if (k % 4 >= i * 2) {
          pinta(t, ['T', '.', 'T'], x, 3)
        }
      })

      return t
    case 'pensando': {
      pinta(t, ZE(olho, SENTADA), 0, topo)
      const bolinhas = 1 + (Math.floor(palco.tick / 4) % 3)
      ;[18, 20, 22].slice(0, bolinhas).forEach((x, i) => ponto(t, x, 2 - i, 'T'))

      return t
    }
    case 'caido':
      pinta(t, CAIDA, 0, topo)
      ;[3, 8, 13].forEach((x, i) => {
        if ((palco.tick + i) % 4 < 2) {
          ponto(t, x, (palco.tick + i) % 2, 'Y')
        }
      })

      return t
    case 'panico':
      pinta(t, ZE('E', passo ? PERNAS_A : PERNAS_B), 0, topo)
      pinta(t, ['R', 'R', 'R', '.', 'R'], 18, 0)
      ponto(t, 5, 2 + (k % 3), 'W')

      return t
    case 'ocioso':
      pinta(t, ZE(olho, passo ? PERNAS_A : PERNAS_B), 0, topo)

      return t
  }
}

const espelha = (t: Tela): Tela => t.map(fila => [...fila].reverse())

/** O chão: grama com tufos e flores, sempre igual pra largura. */
const chao = (t: Tela) => {
  const fila = t[t.length - 1]

  if (fila) {
    fila.forEach((_, c) => {
      fila[c] = c % 17 === 3 ? 'F' : (c * 7) % 5 === 0 ? 'g' : 'G'
    })
  }
}

const BALAO_MAX = 34

/** Mapa de pixels da faixa inteira: útil pro desenho e pros testes. */
export const pixels = (palco: Palco, cena: Cena, largura: number, alto = ALTURA): Tela => {
  const w = Math.max(ATOR + 2, largura)
  const t = tela(w, Math.max(ALTURA, alto))
  const ceu = t.length - ALTURA
  const acao = vigente(cena, palco)
  const andando = acao === 'ocioso' || acao === 'panico' || acao === 'procurando'
  const a = ator(acao, palco)
  const virado = andando && palco.dir === -1 ? espelha(a) : a

  chao(t)
  pintaTurma(t, cena, palco.turma ?? {}, palco.tick, ATOR)

  virado.forEach((fila, y) =>
    fila.forEach((px, x) => {
      const destino = t[ceu + y]

      if (px && destino && palco.x + x < w) {
        destino[palco.x + x] = px
      }
    }),
  )

  return t
}

type Celula = { t: string; cor?: string; fundo?: string }

/** Dois pixels por caractere: ▀ com a cor de cima na frente e a de baixo no fundo. */
const celula = (cima: string | null, baixo: string | null): Celula => {
  const c = cima ? COR[cima] ?? (cima.startsWith('#') ? cima : undefined) : undefined
  const b = baixo ? COR[baixo] ?? (baixo.startsWith('#') ? baixo : undefined) : undefined

  if (!c && !b) {
    return { t: ' ' }
  }

  if (c && !b) {
    return { t: '▀', cor: c }
  }

  if (!c && b) {
    return { t: '▄', cor: b }
  }

  return c === b ? { t: '█', cor: c } : { t: '▀', cor: c, fundo: b }
}

/** Junta células iguais em pedaços: menos nós pro desenho. */
const pedacos = (fila: Celula[]): Pedaco[] =>
  fila.reduce<Pedaco[]>((acc, cel) => {
    const ultimo = acc[acc.length - 1]

    if (ultimo && ultimo.cor === cel.cor && ultimo.fundo === cel.fundo) {
      ultimo.t += cel.t
    } else {
      acc.push({ ...cel })
    }

    return acc
  }, [])

export const desenha = (palco: Palco, cena: Cena, largura: number, espaco = LINHAS_TURMA): Pedaco[][] => {
  const t = pixels(palco, cena, largura, linhas(cena, espaco) * 2)
  const w = t[0]?.length ?? 0
  const celulas: Celula[][] = Array.from({ length: t.length / 2 }, (_, r) =>
    Array.from({ length: w }, (_, c) => celula(t[r * 2]?.[c] ?? null, t[r * 2 + 1]?.[c] ?? null)),
  )
  const acao = vigente(cena, palco)
  const fala = cena.balao || (acao === 'pensando' ? '·'.repeat(1 + (Math.floor(palco.tick / 4) % 3)) : '')

  const arr = arranjo(cena, w, palco.tick, palco.turma ?? {}, ATOR)
  /** Os nomes da turma ficam logo acima delas; com a faixa de 6 linhas, na mesma linha do balão. */
  const linhaNomes = Math.max(0, Math.floor((t.length - 12) / 2))
  const limite = cena.ajudantes.length && linhaNomes === 0 ? arr.inicio - 1 : w

  if (cena.ajudantes.length && t.length >= 12) {
    for (const r of rotulos(arr, palco.turma ?? {}, palco.tick)) {
      const fila = celulas[linhaNomes]

      Array.from(r.texto).forEach((ch, i) => {
        if (fila && r.x + i >= 0 && r.x + i < w) {
          fila[r.x + i] = { t: ch, cor: r.cor }
        }
      })
    }
  }

  if (fala) {
    const depois = palco.x + ATOR
    const cabe = Math.max(limite - depois, palco.x - 1, 6) - 4
    const max = Math.min(BALAO_MAX, cabe)
    const texto = `‹ ${fala.length > max ? `${fala.slice(0, max - 1)}…` : fala} ›`
    const tam = Array.from(texto).length
    const coluna = depois + tam <= limite ? depois : Math.max(0, palco.x - tam - 1)
    const cor = acao === 'panico' || acao === 'caido' ? COR.R : 'subtle'
    const fila = celulas[0]

    Array.from(texto).forEach((ch, i) => {
      if (fila && coluna + i < w) {
        fila[coluna + i] = { t: ch, cor }
      }
    })
  }

  return celulas.map(pedacos)
}
