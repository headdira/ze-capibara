import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Acao, Ajudante, Cena } from '../types'
import { curto, papel } from './fala'
import { LINHAS, linhas } from './sprites'
import { nomeDe } from './turma'

const CENA: Cena = { acao: 'ocioso', depois: 'ocioso', balao: '', seq: 0, ajudantes: [] }

/** Quantas capivarinhas a cena guarda: as que já acabaram saem primeiro. */
const MAX_TURMA = 24

const cena = atom({ plugin: 'ze', key: 'cena' } as const, CENA)
const ativos = atom({ plugin: 'ze', key: 'ativos' } as const, 0)
const oculto = atom({ plugin: 'ze', key: 'oculto' } as const, false)

const AJUDA = [
  '/ze            mostra o que o Zé está fazendo',
  '/ze pula       faz o Zé pular',
  '/ze esconder   tira o Zé de cima do prompt',
  '/ze mostrar    traz o Zé de volta',
].join('\n')

const duracao = (ms: number) => {
  const s = Math.round(ms / 1000)

  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m${String(s % 60).padStart(2, '0')}`
}

/** Troca a cena: a ação, o que vem depois dela e a fala. */
const muda = async ($: EngineInterface, acao: Acao, depois: Acao, balao = '') =>
  update($, cena, c => ({ ...c, acao, depois, balao, seq: c.seq + 1 }))

/** Uma capivarinha nova chega (ou volta, num resume) pra turma. */
const entra = async ($: EngineInterface, nova: Ajudante) =>
  update($, cena, (c): Cena => {
    const ja = c.ajudantes.find(a => a.id === nova.id)
    let turma = ja
      ? c.ajudantes.map(a => (a.id === nova.id ? { ...a, estado: 'trabalhando' as const, acao: nova.acao, balao: nova.balao, seq: a.seq + 1 } : a))
      : [...c.ajudantes, nova]

    while (turma.length > MAX_TURMA) {
      const sai = turma.findIndex(a => a.estado !== 'trabalhando')
      turma = turma.filter((_, i) => i !== (sai < 0 ? 0 : sai))
    }

    return { ...c, ajudantes: turma }
  })

/** Muda uma capivarinha da turma; devolve como ela ficou. */
const ajusta = async ($: EngineInterface, id: string, muda: (a: Ajudante) => Ajudante) => {
  let depois: Ajudante | undefined

  await update($, cena, (c): Cena => {
    if (!c.ajudantes.some(a => a.id === id)) {
      return c
    }

    return {
      ...c,
      ajudantes: c.ajudantes.map(a => {
        if (a.id !== id) {
          return a
        }

        const novo = muda(a)
        depois = novo

        return novo === a ? a : { ...novo, seq: a.seq + 1 }
      }),
    }
  })

  return depois
}

const descreveTurma = (turma: Ajudante[]) =>
  turma.length
    ? turma
        .map(a => `${nomeDe(a)} ${a.estado === 'pronto' ? '(no ofurô)' : a.estado === 'erro' ? '(caiu)' : a.balao ? `(${a.balao})` : ''}`.trim())
        .join(', ')
    : 'ninguém'

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'ze', description: 'O Zé, a capivara que trabalha junto acima do prompt' })
    await update($, ativos, () => 0)
    await update($, cena, (c): Cena => ({ ...CENA, seq: c.seq + 1, balao: 'e aí! bora trabalhar?', acao: 'pula', depois: 'ocioso' }))

    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    /** O loop de um subagente também começa turno: esse não é do Zé. */
    if (e.agentId !== undefined) {
      return next(e)
    }

    await update($, ativos, () => 0)
    /** Prompt novo: o ofurô esvazia, quem ainda trabalha (em segundo plano) fica. */
    await update($, cena, (c): Cena => ({ ...c, ajudantes: c.ajudantes.filter(a => a.estado === 'trabalhando') }))
    await muda($, 'pula', 'pensando', 'bora!')

    return next(e)
  }).catch(($, e, next) => next(e))

  on('tool.call', async ($, e, next) => {
    const principal = e.agentId === undefined

    if (e.agentId !== undefined) {
      const { acao, balao } = papel(e.tool, e)
      const id = e.agentId
      const agora = await ajusta($, id, a => ({ ...a, acao, balao: curto(balao, 15), estado: 'trabalhando' }))
      const r = await next(e)

      if (agora) {
        await ajusta($, id, a => (a.seq === agora.seq + 1 && a.estado === 'trabalhando' ? { ...a, acao: 'pensando' } : a))
      }

      return r
    }

    if (principal) {
      await update($, ativos, n => n + 1)
      const { acao, balao } = papel(e.tool, e)
      await muda($, acao, acao === 'panico' || acao === 'chamando' ? 'pensando' : acao, balao)
    }

    const r = await next(e)

    if (principal) {
      await update($, ativos, n => Math.max(0, n - 1))
      const restam = await read($, ativos)

      if (r.deny !== undefined) {
        await muda($, 'caido', 'pensando', 'barrado!')
      } else if (r.isError) {
        await muda($, 'caido', 'pensando', 'ai, deu erro')
      } else if (restam <= 0) {
        await muda($, 'pensando', 'pensando')
      }
    }

    return r
  }).catch(($, e, next) => next(e))

  on('agent.spawn', async ($, e, next) => {
    const r = await next(e)

    if (r.deny === undefined && r.agentId) {
      await entra($, {
        id: r.agentId,
        tipo: e.fork ? 'fork' : e.subagentType,
        nome: e.name ?? '',
        acao: 'pensando',
        balao: curto(e.description, 15),
        estado: 'trabalhando',
        fundo: e.background,
        seq: 0,
      })
    }

    return r
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)

    if (e.agentId) {
      const deuCerto = e.reason === 'answer'
      const quem = await ajusta($, e.agentId, a => ({
        ...a,
        estado: deuCerto ? 'pronto' : 'erro',
        acao: deuCerto ? 'comemora' : 'caido',
        balao: '',
      }))

      if (quem) {
        await update($, cena, (c): Cena => ({ ...c, balao: deuCerto ? `valeu, ${nomeDe(quem)}!` : `${nomeDe(quem)} caiu…` }))
      }

      return r
    }

    await update($, ativos, () => 0)
    /** O turno principal acabou: quem ficou "trabalhando" sem ser de segundo plano foi interrompido. */
    await update($, cena, (c): Cena => ({ ...c, ajudantes: c.ajudantes.filter(a => a.fundo || a.estado !== 'trabalhando') }))

    if (e.isAborted) {
      await muda($, 'caido', 'ocioso', 'parei!')
    } else if (e.reason === 'error') {
      await muda($, 'caido', 'ocioso', 'deu ruim…')
    } else {
      await muda($, 'comemora', 'ocioso', `feito em ${duracao(e.durationMs)}!`)
    }

    return r
  }).catch(($, e, next) => next(e))

  on('command.run', { command: 'ze' }, async ($, e) => {
    const pedido = e.args.trim().toLowerCase()

    if (pedido === 'esconder' || pedido === 'mostrar') {
      await update($, oculto, () => pedido === 'esconder')

      return { text: pedido === 'esconder' ? 'O Zé foi tomar um café. /ze mostrar traz ele de volta.' : 'O Zé voltou!' }
    }

    if (pedido === 'pula') {
      const c = await read($, cena)
      await muda($, 'pula', c.acao === 'pula' ? c.depois : c.acao, 'opa!')

      return { text: 'O Zé pulou.' }
    }

    if (pedido !== '') {
      return { text: AJUDA }
    }

    const c = await read($, cena)

    return { text: `Zé: ${c.acao}${c.balao ? ` (“${c.balao}”)` : ''} · turma: ${descreveTurma(c.ajudantes)}\n${AJUDA}` }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const abaixo = await next(e)

    const c = await read($, cena)
    /** Uma linha fica pro que vem embaixo; com pouco espaço a faixa encolhe em vez de sumir. */
    const espaco = e.props.maxRows - 1

    if (e.props.hasSurvey || (await read($, oculto)) || espaco < LINHAS) {
      return abaixo
    }

    const elementos = $.ui.resolve(e)

    if (!('Client' in elementos)) {
      return abaixo
    }

    const { Box, Client } = elementos

    return (
      <Box flexDirection="column">
        <Client key="ze" module="./palco.tsx" props={{ ...c, espaco }} height={linhas(c, espaco)} />
        {abaixo}
      </Box>
    )
  })
}
