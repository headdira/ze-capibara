import { describe, expect, test } from 'claude-code/testing'

import { papel, zonaVermelha } from '../hooks/fala'
import { avanca, desenha, pista, pixels, recebe, vigente } from '../hooks/sprites'
import type { Cena, Palco } from '../hooks/sprites'
import type { Ajudante } from '../types'

const CENA: Cena = { acao: 'ocioso', depois: 'ocioso', balao: '', seq: 1, ajudantes: [] }

const aj = (id: string, tipo: string, extra: Partial<Ajudante> = {}): Ajudante => ({
  id,
  tipo,
  nome: '',
  acao: 'pensando',
  balao: '',
  estado: 'trabalhando',
  fundo: false,
  seq: 1,
  ...extra,
})
const PALCO: Palco = { tick: 0, x: 2, dir: 1, seq: 1, inicio: 0 }

const colunas = (fila: { t: string }[]) => fila.reduce((n, p) => n + Array.from(p.t).length, 0)

/** Linha de pixel mais alta que o Zé ocupa (o chão não conta). */
const topoDoZe = (t: (string | null)[][]) => t.slice(0, -1).findIndex(fila => fila.some(Boolean))

describe('física', () => {
  test('anda e quica na borda', () => {
    let p: Palco = { ...PALCO, x: 0, dir: 1 }

    for (let i = 0; i < 200; i++) {
      p = avanca(p, CENA, 30)
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.x).toBeLessThanOrEqual(pista(30, CENA))
    }

    const xs = new Set<number>()
    p = { ...PALCO, x: 5 }

    for (let i = 0; i < 60; i++) {
      p = avanca(p, CENA, 60)
      xs.add(p.x)
    }

    expect(xs.size).toBeGreaterThan(5)
  })

  test('trabalhando fica parado', () => {
    const c: Cena = { ...CENA, acao: 'digitando', depois: 'digitando' }
    let p: Palco = { ...PALCO, x: 10 }

    for (let i = 0; i < 30; i++) {
      p = avanca(p, c, 60)
    }

    expect(p.x).toBe(10)
  })

  test('ação passageira vence e vira a de depois', () => {
    const c: Cena = { ...CENA, acao: 'pula', depois: 'pensando', seq: 2 }
    let p = recebe(PALCO, c)
    expect(vigente(c, p)).toBe('pula')

    for (let i = 0; i < 9; i++) {
      p = avanca(p, c, 60)
    }

    expect(vigente(c, p)).toBe('pensando')
  })
})

describe('desenho', () => {
  test('toda linha tem exatamente a largura do palco, com balão e filhotes', () => {
    const acoes = ['ocioso', 'pula', 'pensando', 'digitando', 'procurando', 'construindo', 'telefone', 'chamando', 'caido', 'comemora', 'panico'] as const

    for (const acao of acoes) {
      for (let tick = 0; tick < 12; tick++) {
        const c: Cena = { ...CENA, acao, depois: acao, balao: 'lendo register.tsx', ajudantes: [aj('a', 'Explore'), aj('b', 'fork')] }
        const linhas = desenha({ ...PALCO, tick, x: 40 }, c, 50)

        expect(linhas.length).toBe(6)
        linhas.forEach(fila => expect(colunas(fila)).toBe(50))
      }
    }
  })

  test('balão, celular e capivarinha aparecem', () => {
    const c: Cena = { ...CENA, acao: 'telefone', depois: 'telefone', balao: 'alô, github?', ajudantes: [aj('a', 'Explore')] }
    const texto = desenha({ ...PALCO, x: 3 }, c, 90).map(f => f.map(p => p.t).join(''))
    const mapa = pixels({ ...PALCO, x: 3 }, c, 90, 12)

    expect(texto[0]).toContain('‹ alô, github? ›')
    expect(texto[0]).toContain('explore')
    expect(mapa.flat().includes('P')).toBe(true)
    /** O focinho da capivarinha, do lado direito da faixa. */
    expect(mapa.slice(0, -1).some(fila => fila.slice(60).includes('#3b2a20'))).toBe(true)
  })

  test('pula de verdade: sobe e volta pro chão', () => {
    const c: Cena = { ...CENA, acao: 'pula', depois: 'ocioso', seq: 2 }
    const parada = topoDoZe(pixels(PALCO, { ...CENA }, 60))
    const noAr = topoDoZe(pixels({ ...PALCO, tick: 3, inicio: 0 }, c, 60))
    const pousou = topoDoZe(pixels({ ...PALCO, tick: 7, inicio: 0 }, c, 60))

    expect(noAr).toBeLessThan(parada)
    expect(pousou).toBe(parada)
  })

  test('caída vira de barriga pra cima e a laranja rola', () => {
    const mapa = pixels(PALCO, { ...CENA, acao: 'caido', depois: 'caido' }, 60)

    expect(mapa[8]?.slice(2, 6).includes('O')).toBe(true)
  })
})

describe('falas', () => {
  test('cada ferramenta vira uma ação', () => {
    expect(papel('Bash', { command: 'git status' })).toEqual({ acao: 'digitando', balao: '$ git status' })
    expect(papel('Read', { file_path: '/a/b/register.tsx' })).toEqual({ acao: 'procurando', balao: 'lendo register.tsx' })
    expect(papel('Edit', { file_path: '/a/proxy.ts' }).acao).toBe('construindo')
    expect(papel('mcp__github__search_code', {})).toEqual({ acao: 'telefone', balao: 'alô, github?' })
    expect(papel('Agent', { subagent_type: 'Explore' }).balao).toBe('ô Explore, ajuda aqui!')
    expect(papel('Bash', { command: 'argocd app sync ops-dev' })).toEqual({ acao: 'panico', balao: 'argocd sync!' })
  })

  test('nunca mostra credencial', () => {
    expect(papel('Bash', { command: 'curl -H "Authorization: Bearer abc123xyz"' }).balao).not.toContain('abc123')
    expect(papel('Bash', { command: 'export TOKEN=segredo' }).balao).toBe('$ export TOKEN=•••')
    expect(zonaVermelha('kubectl get pods')).toBeNull()
  })
})
