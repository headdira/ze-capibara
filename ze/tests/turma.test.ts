import { describe, expect, test } from 'claude-code/testing'

import { desenha, pista, recebe, avanca } from '../hooks/sprites'
import type { Cena, Palco } from '../hooks/sprites'
import { SLOT, arranjo, capivarinha, nomeDe, traje } from '../hooks/turma'
import type { Ajudante } from '../types'

const PALCO: Palco = { tick: 0, x: 2, dir: 1, seq: 1, inicio: 0, turma: {} }
const CENA: Cena = { acao: 'pensando', depois: 'pensando', balao: 'ô turma, ajuda aqui!', seq: 1, ajudantes: [] }

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

const TIPOS = ['Explore', 'Plan', 'general-purpose', 'fork', 'devops', 'claude-code-guide', 'code-reviewer', 'statusline-setup', 'sql-tester', 'x:desconhecido']
const colunas = (fila: { t: string }[]) => fila.reduce((n, p) => n + Array.from(p.t).length, 0)

const roda = (cena: Cena, largura: number, tiques: number) => {
  let p = recebe(PALCO, cena)

  for (let i = 0; i < tiques; i++) {
    p = avanca(recebe(p, cena), cena, largura)
  }

  return p
}

describe('a turma', () => {
  test('cada tipo tem traje e nome; tipo desconhecido ganha um do sorteio, sempre o mesmo', () => {
    expect(nomeDe(aj('a', 'Explore'))).toBe('explore')
    expect(nomeDe(aj('a', 'fork'))).toBe('zé 2')
    expect(nomeDe(aj('a', 'Explore', { nome: 'batedor' }))).toBe('batedor')
    expect(traje('meu-plugin:coisa-agent')).toEqual(traje('meu-plugin:coisa-agent'))
    expect(traje('meu-plugin:coisa-agent').chapeu).toBeDefined()
  })

  test('agente de plugin se veste pelo que o nome diz que ele faz', () => {
    expect(traje('pr-review-toolkit:silent-failure-hunter').chapeu).toEqual(traje('feature-dev:code-explorer').chapeu)
    expect(traje('claude-security:scan-verifier').item).toEqual(traje('secret-auditor').item)
    expect(traje('feature-dev:code-architect')).toMatchObject({ rotulo: 'architect', item: traje('Plan').item })
    expect(traje('vercel:performance-optimizer').chapeu).toEqual(traje('cache-optimizer').chapeu)
    expect(traje('code-modernization:uplift-migrator').chapeu).toEqual(traje('devops').chapeu)
    /** Quem já tem traje próprio continua com ele, mesmo vindo de plugin. */
    expect(traje('meu-plugin:explore')).toEqual(traje('Explore'))
  })

  test('toda linha tem a largura exata, com 0 a 9 capivarinhas em qualquer largura', () => {
    for (const largura of [40, 50, 80, 120, 200]) {
      for (let n = 0; n <= 9; n++) {
        const turma = Array.from({ length: n }, (_, i) =>
          aj(`a${i}`, TIPOS[i % TIPOS.length]!, i % 3 === 2 ? { estado: 'pronto', acao: 'comemora' } : i % 4 === 3 ? { estado: 'erro', acao: 'caido' } : {}),
        )
        const cena: Cena = { ...CENA, ajudantes: turma }

        for (const tiques of [0, 5, 40]) {
          const linhas = desenha(roda(cena, largura, tiques), cena, largura, 6)

          expect(linhas.length).toBe(n ? 6 : 5)
          linhas.forEach(fila => expect(colunas(fila)).toBe(Math.max(29, largura)))
        }
      }
    }
  })

  test('quem não cabe vira +N, e o Zé nunca anda por cima da turma', () => {
    const cena: Cena = { ...CENA, ajudantes: Array.from({ length: 9 }, (_, i) => aj(`a${i}`, 'Explore')) }
    const arr = arranjo(cena, 120, 0, {}, 27)

    expect(arr.lugares.length).toBeGreaterThan(0)
    expect(arr.lugares.length + arr.sobra).toBe(9)
    expect(desenha(roda(cena, 120, 3), cena, 120, 6)[0]!.map(p => p.t).join('')).toContain(`+${arr.sobra}`)
    expect(pista(120, cena) + 27).toBeLessThanOrEqual(arr.inicio)
  })

  test('chega andando pela direita e para no lugar dela', () => {
    const cena: Cena = { ...CENA, ajudantes: [aj('a', 'Explore')] }
    const alvo = arranjo(cena, 100, 0, {}, 27).lugares[0]!.alvo
    const logo = roda(cena, 100, 3).turma!.a!.x
    const depois = roda(cena, 100, 60).turma!.a!.x

    expect(logo).toBeGreaterThan(alvo)
    expect(depois).toBe(alvo)
  })

  test('terminou: comemora e depois vai pro ofurô', () => {
    const cena: Cena = { ...CENA, ajudantes: [aj('a', 'Plan', { estado: 'pronto', acao: 'comemora' })] }
    const logo = roda(cena, 100, 2)
    const depois = roda(cena, 100, 40)

    expect(arranjo(cena, 100, logo.tick, logo.turma!, 27).lugares.length).toBe(1)
    expect(arranjo(cena, 100, depois.tick, depois.turma!, 27).ofuro?.total).toBe(1)
    expect(desenha(depois, cena, 100, 6)[0]!.map(p => p.t).join('')).toContain('ofurô')
  })

  test('a capivarinha caída fica de barriga pra cima', () => {
    /** Sem chapéu, pra linha de cima do corpo ser só orelha (em pé) ou pernas (caída). */
    const em_pe = capivarinha(aj('a', 'code-reviewer'), 0, 0, false)
    const caida = capivarinha(aj('a', 'code-reviewer', { estado: 'erro', acao: 'caido' }), 0, 0, false)
    const cheios = (fila: (string | null)[] | undefined) => (fila ?? []).filter(Boolean).length

    expect(caida.length).toBe(em_pe.length)
    expect(caida[0]!.length).toBe(SLOT)
    expect(cheios(em_pe[4])).toBe(2)
    expect(cheios(caida[4])).toBe(8)
  })
})
