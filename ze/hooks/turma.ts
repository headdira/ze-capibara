/**
 * A turma: cada subagente do Claude Code vira uma capivarinha com o traje do
 * tipo dela (Explore de safári, devops de capacete, fork com a laranja do Zé…).
 * Chega andando pela direita, trabalha com o adereço da ferramenta que está
 * usando e, quando termina, comemora e vai pro ofurô. Puro: nada aqui toca o `$`.
 */

import type { Acao, Ajudante, Cena } from '../types'

export type Tela = (string | null)[][]

/** O relógio de cada capivarinha no palco: onde está e desde quando faz o que faz. */
export type Marca = { x: number; seq: number; desde: number; chegou: number }
export type Marcas = Record<string, Marca>

/** Largura de uma capivarinha com o adereço na mão. */
export const SLOT = 18
/** Altura do desenho de uma capivarinha: chapéu, corpo e o pulo. */
const ALTO = 11
/** O corpo começa nesta linha do desenho; acima é chapéu e pulo. */
const CORPO_Y = 4
/** Quanto a comemoração dura antes de ela ir pro ofurô. */
export const COMEMORA_TIQUES = 14
/** Quantas capivarinhas trabalhando cabem lado a lado, no máximo. */
const MAX_VISIVEIS = 5
const CABECA = 8
const MAX_CABECAS = 3

const PAL: Record<string, string> = {
  N: '#3b2a20', // focinho
  E: '#111111', // olho
  Y: '#f2c94c', // amarelo
  y: '#ffd43b', // amarelo python
  R: '#ef4444', // vermelho
  r: '#9f1d1d', // vermelho escuro
  K: '#d8c38f', // cáqui
  k: '#7a6440', // faixa do safári
  P: '#2d2d2d', // preto
  v: '#8b5cf6', // roxo
  n: '#512bd4', // roxo .NET
  h: '#8b5a2b', // madeira
  j: '#5f3b1a', // madeira escura
  M: '#9aa3ad', // metal
  l: '#c9f1ff', // lente
  L: '#3fae4a', // folha
  O: '#ff9500', // laranja
  o: '#d96f00', // laranja escura
  C: '#4fd1ff', // tela acesa
  c: '#2a8fb8', // tela
  S: '#9aa3ad', // notebook
  T: '#e5e7eb', // vapor, pensamento
  W: '#7dd3fc', // água
  w: '#f8fafc', // branco
  b: '#3572a5', // azul python
  u: '#326ce5', // azul k8s
  F: '#f2d14b', // flor
  p: '#f472b6', // rosa
  s: '#e6c86e', // palha
  Q: '#d97757', // laranja Claude
}

/** Pelagens: corpo, brilho do lombo e sombra. */
const PELOS: [string, string, string][] = [
  ['#b5835a', '#d6a274', '#8a5a36'], // caramelo, igual ao Zé
  ['#8f6242', '#b07f58', '#5e3b24'], // chocolate
  ['#c99a5f', '#e6bd86', '#946638'], // dourada
  ['#9c8270', '#bfa695', '#6b5646'], // terra
  ['#b8744f', '#d9976e', '#82492b'], // ruiva
]

type Chapeu = { arte: string[]; x: number; y: number; pisca?: boolean }

export type Traje = {
  /** Como aparece no rótulo quando o subagente não tem nome próprio. */
  rotulo: string
  /** Cor do rótulo. */
  cor: string
  chapeu?: Chapeu
  /** Adereço que ela carrega sempre que não está usando outro. */
  item?: string[]
  oculos?: boolean
  /** Pelagem fixa (o fork é a cara do Zé). */
  pelo?: number
}

const CHAPEUS = {
  safari: { arte: ['..KKK..', '.kkkkk.', 'KKKKKKK'], x: 6, y: -2 },
  capacete: { arte: ['..YYY..', '.YYYYY.', 'YYYYYYY'], x: 6, y: -2 },
  bone: { arte: ['.QQQQ...', 'QQQQQQQQ'], x: 6, y: -1 },
  bonéAzul: { arte: ['.uuuu...', 'uuuuuuuu'], x: 6, y: -1 },
  capelo: { arte: ['PPPPPPPP', '..PPPP.Y', '.......Y'], x: 5, y: -2 },
  coroa: { arte: ['Y.Y.Y', 'YRYRY', 'YYYYY'], x: 7, y: -2 },
  boina: { arte: ['..vvv.', '.vvvvv', 'vvvvvvv'], x: 6, y: -2 },
  boinaRosa: { arte: ['..ppp.', '.ppppp', 'ppppppp'], x: 6, y: -2 },
  gorro: { arte: ['...w...', '..nnn..', '.nnnnn.', 'nnnnnnn'], x: 6, y: -3 },
  detetive: { arte: ['..jjj..', '.jrrrj.', 'jjjjjjj'], x: 6, y: -2 },
  faixa: { arte: ['RR.....', '.RRRRRR'], x: 4, y: 0 },
  cobra: { arte: ['.....yyR', 'bbbbbyE.', '.b......'], x: 1, y: -1 },
  laranja: { arte: ['...LOO', '..OOOOo'], x: 5, y: -2 },
  giroflex: { arte: ['.RC.', '.MM.', 'OOOOOO'], x: 6, y: -2, pisca: true },
  palha: { arte: ['..sss..', 'sssssss'], x: 6, y: -1 },
  flor: { arte: ['F.F', '.Y.', 'F.F'], x: 9, y: -3 },
  folha: { arte: ['.LL', 'LL.', 'L..'], x: 9, y: -3 },
} satisfies Record<string, Chapeu>

const ITENS = {
  prancheta: ['.M.', 'www', 'wPw', 'www'],
  chave: ['M.M', 'MMM', '.M.', '.M.'],
  timao: ['u.u.u', '.uuu.', 'uuMuu', '.uuu.', 'u.u.u'],
  pincel: ['..p', '.h.', 'h..'],
  caneta: ['..R', '.R.', 'w..'],
  cadeado: ['.MM.', 'M..M', 'YYYY', 'YYYY'],
  livro: ['uuu', 'uwu', 'uwu', 'uuu'],
  lapis: ['..Y', '.Y.', 'h..'],
  raio: ['.Y', 'Y.', 'YY', '.Y', 'Y.'],
  tesoura: ['M.M', '.M.', 'R.R'],
}

/** O traje de cada tipo de subagente. Quem não está aqui ganha um chapéu do sorteio. */
const TRAJES: Record<string, Traje> = {
  explore: { rotulo: 'explore', cor: PAL.K!, chapeu: CHAPEUS.safari },
  plan: { rotulo: 'plan', cor: PAL.v!, chapeu: CHAPEUS.boina, item: ITENS.prancheta },
  'general-purpose': { rotulo: 'geral', cor: PAL.Q!, chapeu: CHAPEUS.bone },
  claude: { rotulo: 'claude', cor: PAL.Q!, chapeu: CHAPEUS.bone },
  fork: { rotulo: 'zé 2', cor: PAL.O!, chapeu: CHAPEUS.laranja, pelo: 0 },
  devops: { rotulo: 'devops', cor: PAL.Y!, chapeu: CHAPEUS.capacete, item: ITENS.chave },
  'claude-code-guide': { rotulo: 'guia', cor: PAL.u!, item: ITENS.livro, oculos: true },
  'statusline-setup': { rotulo: 'status', cor: PAL.C!, chapeu: CHAPEUS.bonéAzul },
}

/**
 * Agentes de plugin (`plugin:nome`) que não têm traje próprio: o traje sai do
 * que o nome diz que ele faz. A primeira regra que casa vence.
 */
const PALAVRAS: [RegExp, Omit<Traje, 'rotulo'>][] = [
  [/review|critic/, { cor: PAL.R!, item: ITENS.caneta, oculos: true }],
  [/secur|secret|audit|redact|scan|vuln/, { cor: PAL.Y!, chapeu: CHAPEUS.detetive, item: ITENS.cadeado }],
  [/test/, { cor: PAL.C!, item: ITENS.prancheta, oculos: true }],
  [/analy|extract|comment|insight/, { cor: PAL.u!, item: ITENS.livro, oculos: true }],
  [/verif|valid|judge|grader|check/, { cor: PAL.T!, chapeu: CHAPEUS.capelo, item: ITENS.prancheta }],
  [/generat|scaffold|creat|migrat|patch|build/, { cor: PAL.Y!, chapeu: CHAPEUS.capacete, item: ITENS.chave }],
  [/simplif|refactor|modern|clean/, { cor: PAL.Q!, chapeu: CHAPEUS.bone, item: ITENS.tesoura }],
  [/perf|optim|speed|fast/, { cor: PAL.R!, chapeu: CHAPEUS.faixa, item: ITENS.raio }],
  [/deploy|devops|infra|k8s|cloud|ops/, { cor: PAL.Y!, chapeu: CHAPEUS.capacete }],
  [/explor|research|hunt|scout|search|inventory|load/, { cor: PAL.K!, chapeu: CHAPEUS.safari }],
  [/architect|design|plan/, { cor: PAL.v!, chapeu: CHAPEUS.boina, item: ITENS.prancheta }],
  [/math|proof|theor/, { cor: PAL.T!, chapeu: CHAPEUS.capelo }],
  [/doc|writ|copy|market|content/, { cor: PAL.p!, chapeu: CHAPEUS.boinaRosa, item: ITENS.lapis }],
]

const SORTEIO: [Chapeu, string][] = [
  [CHAPEUS.palha, PAL.s!],
  [CHAPEUS.flor, PAL.F!],
  [CHAPEUS.folha, PAL.L!],
  [CHAPEUS.bonéAzul, PAL.u!],
  [CHAPEUS.boina, PAL.v!],
]

const hash = (s: string) => {
  let h = 7

  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }

  return Math.abs(h)
}

const chave = (tipo: string) => tipo.trim().toLowerCase().replace(/^[^:]+:/, '')

export const traje = (tipo: string): Traje => {
  const k = chave(tipo)
  const fixo = TRAJES[k]

  if (fixo) {
    return fixo
  }

  const rotulo = k.replace(/^(code|claude|agent)-/, '').replace(/-(agent|dev|expert|worker)$/, '').slice(0, 14) || 'ajudante'
  const porNome = PALAVRAS.find(([re]) => re.test(k))

  if (porNome) {
    return { rotulo, ...porNome[1] }
  }

  const [chapeu, cor] = SORTEIO[hash(k) % SORTEIO.length]!

  return { rotulo, cor, chapeu }
}

/** O nome que aparece em cima dela. */
export const nomeDe = (a: Pick<Ajudante, 'tipo' | 'nome'>) => a.nome || traje(a.tipo).rotulo

const pelagem = (a: Ajudante, t: Traje): [string, string, string] =>
  PELOS[t.pelo ?? hash(a.id) % PELOS.length] ?? PELOS[0]!

const sorte = (n: number) => {
  const s = Math.sin(n * 12.9898) * 43758.5453

  return s - Math.floor(s)
}

const tela = (largura: number, altura: number): Tela =>
  Array.from({ length: altura }, () => Array.from({ length: largura }, () => null))

/** Pinta arte de letras com uma paleta: '.' é transparente. */
const pinta = (t: Tela, arte: string[], x: number, y: number, pal: Record<string, string>) =>
  arte.forEach((linha, i) =>
    Array.from(linha).forEach((ch, j) => {
      const fila = t[y + i]
      const cor = pal[ch]

      if (ch !== '.' && cor && fila && x + j >= 0 && x + j < fila.length) {
        fila[x + j] = cor
      }
    }),
  )

/** A capivarinha, olhando pra direita: cabeça quadrada, focinho rombudo, orelhinhas, corpo de barril. */
const CORPO = (olho: string, pernas: string) => [
  '........D.D..',
  '..HHHHHHBBBB.',
  `.BBBBBBBBB${olho}BB`,
  'BBBBBBBBBBBBN',
  'BBBBBBBBDBBBN',
  '.BBBBBBBBBBB.',
  pernas,
]

const PERNAS_A = '.DB.DB..DB.DB'
const PERNAS_B = '..DBDB...DBDB'
const SENTADA = '.DDDD...DDDD.'

const espelha = (t: Tela): Tela => t.map(fila => [...fila].reverse())

/** O adereço da ação, na frente do focinho (coluna 13 em diante). */
const adereco = (acao: Acao, k: number, tick: number, item: string[] | undefined): [string[], number, number] | null => {
  switch (acao) {
    case 'procurando':
      return [['.Y.', 'YlY', '.Y.', 'h..'], 13, CORPO_Y - 1 + (Math.floor(k / 3) % 2)]
    case 'digitando':
      return [[k % 4 < 2 ? '.CC' : '.cC', k % 3 ? '.Cc' : '.cc', 'SSSS'], 13, CORPO_Y + 3]
    case 'construindo':
      return Math.floor(k / 2) % 2 ? [['MMM', '.h.', '.h.'], 13, CORPO_Y] : [['...MM', 'hhhMM', '....Y'], 13, CORPO_Y + 3]
    case 'chamando':
      return [['..oo', 'oOOO', '..oo'], 13, CORPO_Y + 2]
    case 'pensando': {
      const n = 1 + (Math.floor(tick / 4) % 3)

      return [['....T', '..T..', 'T....'].slice(3 - n), 13, CORPO_Y - 1 - (n - 1)]
    }
    default:
      return item ? [item, 13, CORPO_Y + 6 - item.length] : null
  }
}

/** Desenha uma capivarinha numa tela própria de SLOT x ALTO, olhando pra direita. */
export const capivarinha = (a: Ajudante, k: number, tick: number, andando: boolean): Tela => {
  const t = tela(SLOT, ALTO)
  const tr = traje(a.tipo)
  const [B, H, D] = pelagem(a, tr)
  const pal: Record<string, string> = { ...PAL, B, H, D }
  const pisca = (tick + hash(a.id)) % 41 < 2
  const passo = Math.floor(tick / 2) % 2 === 0

  if (a.estado === 'erro' || a.acao === 'caido') {
    const deitada = CORPO('E', PERNAS_A).slice().reverse()
    pinta(t, deitada, 0, CORPO_Y, pal)

    if (tr.chapeu) {
      pinta(t, tr.chapeu.arte, 14, ALTO - tr.chapeu.arte.length, pal)
    }

    ;[2, 6, 10].forEach((x, i) => {
      if ((tick + i) % 4 < 2) {
        pinta(t, ['Y'], x, CORPO_Y - 1 - ((tick + i) % 2), pal)
      }
    })

    return t
  }

  const comemorando = a.estado === 'pronto' || a.acao === 'comemora'
  const dy = comemorando ? [0, 1, 2, 2, 1, 0, 0][k % 7] ?? 0 : 0
  const pernas = andando ? (passo ? PERNAS_A : PERNAS_B) : dy ? PERNAS_B : SENTADA
  const y = CORPO_Y - dy

  pinta(t, CORPO(pisca ? 'B' : 'E', pernas), 0, y, pal)

  if (tr.oculos) {
    pinta(t, ['MMMM', 'l.lM'], 8, y + 1, pal)
    pinta(t, [pisca ? 'B' : 'E'], 10, y + 2, pal)
    pinta(t, ['MlM'], 9, y + 2, pal)
  }

  if (tr.chapeu) {
    const arte = tr.chapeu.pisca && Math.floor(tick / 3) % 2 ? tr.chapeu.arte.map(l => l.replace('RC', 'CR')) : tr.chapeu.arte
    pinta(t, arte, tr.chapeu.x, y + tr.chapeu.y, pal)
  }

  if (comemorando) {
    for (let i = 0; i < 4; i++) {
      const r = sorte(tick * 7 + i + hash(a.id))
      pinta(t, [['R', 'Y', 'C', 'p'][i]!], Math.floor(r * SLOT), Math.floor(sorte(r * 3 + i) * 3), pal)
    }

    return t
  }

  if (a.acao === 'panico') {
    pinta(t, ['W'], 4, y + 1 + (k % 3), pal)
  }

  if (a.acao === 'telefone') {
    pinta(t, ['P', 'P'], 12, y + 2, pal)
    ;[14, 16].forEach((x, i) => {
      if (k % 6 >= i * 2) {
        pinta(t, ['C', '.', 'C'], x, y + 1, pal)
      }
    })

    return t
  }

  const ad = adereco(andando ? 'ocioso' : a.acao, k, tick, tr.item)

  if (ad) {
    pinta(t, ad[0], ad[1], ad[2] - dy, pal)
  }

  return t
}

/** As cabeças no ofurô: olhos fechados de tão relaxadas, laranja na cabeça e vapor. */
const ofuro = (cabecas: Ajudante[], tick: number): Tela => {
  const largura = 2 + CABECA * cabecas.length
  const t = tela(largura, 11)

  cabecas.forEach((a, i) => {
    const [B, H, D] = pelagem(a, traje(a.tipo))
    const pal: Record<string, string> = { ...PAL, B, H, D }
    const sobe = Math.floor((tick + i * 5) / 9) % 2
    const olho = (tick + i * 13) % 53 < 3 ? 'E' : 'D'
    pinta(t, ['....LO.', '...OOOo', '..D.D..', '.BBBBHH', `NB${olho}BBBB`, 'NBBBBBB', 'BBBBBBB'], 1 + CABECA * i, 1 - sobe, pal)
  })

  const agua = Array.from({ length: largura - 2 }, (_, c) => ((c + Math.floor(tick / 3)) % 7 === 0 ? 'l' : 'W')).join('')
  pinta(t, [`h${agua}h`, `j${'M'.repeat(largura - 2)}j`, `.${'h'.repeat(largura - 2)}.`], 0, 7, PAL)

  for (let i = 0; i < cabecas.length * 2; i++) {
    const r = sorte(Math.floor(tick / 2) * 5 + i)

    if (r < 0.6) {
      pinta(t, ['T'], 1 + Math.floor(sorte(i * 9.1) * (largura - 2)), Math.floor(r * 2) + (tick % 2), PAL)
    }
  }

  return t
}

/** Quem está no ofurô: terminou e já comemorou. */
const noOfuro = (a: Ajudante, marcas: Marcas, tick: number) =>
  a.estado === 'pronto' && tick - (marcas[a.id]?.desde ?? -COMEMORA_TIQUES) >= COMEMORA_TIQUES

export type Lugar = { a: Ajudante; alvo: number }

export type Arranjo = {
  /** Primeira coluna da turma: o Zé não passa daqui. */
  inicio: number
  lugares: Lugar[]
  ofuro: { x: number; cabecas: Ajudante[]; total: number } | null
  /** Capivarinhas que não couberam: viram "+N". */
  sobra: number
  /** Se o "+N" tem coluna própria ou vai colado no nome da primeira. */
  sobraSolta: boolean
}

/** Onde cada uma fica: ofurô no canto direito, quem trabalha do lado, mais nova perto do Zé. */
export const arranjo = (cena: Cena, largura: number, tick: number, marcas: Marcas, ator: number): Arranjo => {
  const turma = cena.ajudantes
  const prontos = turma.filter(a => noOfuro(a, marcas, tick))
  const ativos = turma
    .filter(a => !noOfuro(a, marcas, tick))
    .sort((x, y) => Number(x.estado === 'erro') - Number(y.estado === 'erro'))
  const livre = largura - ator - 4
  const larguraOfuro = (n: number) => (n ? 2 + CABECA * n + 1 : 0)
  let cabecas = Math.min(prontos.length, MAX_CABECAS)

  while (cabecas > 0 && livre - larguraOfuro(cabecas) < (ativos.length ? SLOT : 0)) {
    cabecas--
  }

  const resto = livre - larguraOfuro(cabecas)
  const n = Math.min(ativos.length, MAX_VISIVEIS, Math.max(0, Math.floor(resto / SLOT)))

  const xOfuro = largura - larguraOfuro(cabecas) + (cabecas ? 1 : 0)
  const borda = cabecas ? xOfuro - 1 : largura
  const lugares = ativos.slice(0, n).map((a, i) => ({ a, alvo: borda - SLOT * (i + 1) }))
  const sobra = ativos.length - n
  const sobraSolta = sobra > 0 && (n === 0 || resto - n * SLOT >= 4)
  const inicio = borda - SLOT * n - (sobraSolta ? 4 : 0)

  return {
    inicio: turma.length ? inicio : largura,
    lugares,
    ofuro: cabecas ? { x: xOfuro, cabecas: prontos.slice(-cabecas), total: prontos.length } : null,
    sobra,
    sobraSolta,
  }
}

/** Atualiza o relógio de cada uma quando a cena muda. */
export const recebeTurma = (marcas: Marcas, cena: Cena, tick: number): Marcas => {
  const ids = new Set(cena.ajudantes.map(a => a.id))
  let mudou = Object.keys(marcas).some(id => !ids.has(id))
  const novas: Marcas = {}

  for (const a of cena.ajudantes) {
    const m = marcas[a.id]

    if (!m) {
      novas[a.id] = { x: -1, seq: a.seq, desde: tick, chegou: tick }
      mudou = true
    } else if (m.seq !== a.seq) {
      novas[a.id] = { ...m, seq: a.seq, desde: tick }
      mudou = true
    } else {
      novas[a.id] = m
    }
  }

  return mudou ? novas : marcas
}

/** Um tique: cada capivarinha anda até o lugar dela; o fork surge do lado. */
export const avancaTurma = (marcas: Marcas, cena: Cena, largura: number, tick: number, ator: number): Marcas => {
  const { lugares } = arranjo(cena, largura, tick, marcas, ator)
  let mudou = false
  const novas = { ...marcas }

  for (const { a, alvo } of lugares) {
    const m = novas[a.id]

    if (!m) {
      continue
    }

    const x = m.x < 0 ? (a.tipo === 'fork' ? alvo : largura) : m.x
    const proximo = x > alvo ? Math.max(alvo, x - 2) : x < alvo ? Math.min(alvo, x + 1) : x

    if (proximo !== m.x) {
      novas[a.id] = { ...m, x: proximo }
      mudou = true
    }
  }

  return mudou ? novas : marcas
}

/** Pinta a turma na tela da faixa, de pé na grama (a última linha é o chão). */
export const pintaTurma = (t: Tela, cena: Cena, marcas: Marcas, tick: number, ator: number) => {
  const largura = t[0]?.length ?? 0
  const alto = t.length
  const arr = arranjo(cena, largura, tick, marcas, ator)

  const blit = (arte: Tela, x: number, y: number) =>
    arte.forEach((fila, i) =>
      fila.forEach((px, j) => {
        const destino = t[y + i]

        if (px && destino && x + j >= 0 && x + j < largura) {
          destino[x + j] = px
        }
      }),
    )

  for (const { a, alvo } of arr.lugares) {
    const m = marcas[a.id]
    const x = m && m.x >= 0 ? m.x : alvo
    const k = m ? tick - m.desde : 99
    const andando = x !== alvo
    const arte = capivarinha(a, k, tick, andando)
    const virada = andando && x < alvo ? arte : espelha(arte)

    blit(virada, x, alto - 1 - ALTO)

    if (a.tipo === 'fork' && m && tick - m.chegou < 6) {
      const nuvem = tela(SLOT, ALTO)
      for (let i = 0; i < 14; i++) {
        pinta(nuvem, ['T'], Math.floor(sorte(tick * 3 + i) * SLOT), 3 + Math.floor(sorte(i * 7.7) * 7), PAL)
      }
      blit(nuvem, x, alto - 1 - ALTO)
    }
  }

  if (arr.ofuro) {
    blit(ofuro(arr.ofuro.cabecas, tick), arr.ofuro.x, alto - 1 - 10)
  }

  return arr
}

export type Rotulo = { x: number; texto: string; cor: string }

const corta = (texto: string, max: number) => {
  const cs = Array.from(texto)

  return cs.length > max ? `${cs.slice(0, max - 1).join('')}…` : texto
}

/** Os nomes em cima de cada uma: o nome e, de vez em quando, o que está fazendo. */
export const rotulos = (arr: Arranjo, marcas: Marcas, tick: number): Rotulo[] => {
  const fora: Rotulo[] = []

  const ultima = arr.lugares[arr.lugares.length - 1]?.a.id

  for (const { a, alvo } of arr.lugares) {
    const m = marcas[a.id]
    const x = m && m.x >= 0 ? m.x : alvo
    const nome = `${arr.sobra && !arr.sobraSolta && a.id === ultima ? `+${arr.sobra} ` : ''}${nomeDe(a)}`
    const fazendo = a.estado === 'trabalhando' && a.balao && Math.floor(tick / 25) % 2 === 1
    const texto = corta(a.estado === 'erro' ? `✗ ${nome}` : a.estado === 'pronto' ? `✓ ${nome}` : fazendo ? a.balao : nome, SLOT - 2)
    const tam = Array.from(texto).length

    fora.push({
      x: tam <= 13 ? x + SLOT - 13 + Math.floor((13 - tam) / 2) : x + Math.max(0, Math.floor((SLOT - tam) / 2)),
      texto,
      cor: a.estado === 'erro' ? PAL.R! : fazendo ? 'subtle' : traje(a.tipo).cor,
    })
  }

  if (arr.ofuro) {
    const largura = 2 + CABECA * arr.ofuro.cabecas.length
    const texto = corta(arr.ofuro.total > 1 ? `✓ ${arr.ofuro.total} no ofurô` : '✓ ofurô', largura + 1)
    fora.push({ x: arr.ofuro.x + Math.max(0, Math.floor((largura - Array.from(texto).length) / 2)), texto, cor: PAL.W! })
  }

  if (arr.sobraSolta) {
    fora.push({ x: Math.max(0, arr.inicio), texto: `+${arr.sobra}`, cor: 'subtle' })
  }

  return fora
}
