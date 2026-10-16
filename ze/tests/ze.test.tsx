import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

const BANDA = {
  hasSurvey: false,
  isWorking: true,
  maxRows: 12,
  bodyColumns: 80,
  scroll: { offset: 0, bodyRows: 11 },
  view: {},
}

const fundo = (on: On) => {
  mock.clock(on, { now: 1_000_000 })
  on('tool.call', ($, e) =>
    e.tool === 'Read' ? ({ isError: true, result: 'x' } as never) : ({ result: 'ok' } as never),
  )
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)

    return <Text>prompt</Text>
  })
  on('turn.start', ($, e) => ({ turnId: e.turnId }))
  on('turn.complete', () => ({ text: '' }))
  on('agent.spawn', () => ({ model: 'm', agentId: 'ag-1' }))
}

test('não muda o resultado das ferramentas', async ($, on) => {
  fundo(on)

  expect(await $.tool.call({ tool: 'Bash', tool_use_id: 't1', command: 'ls' } as never)).toEqual({ result: 'ok' })
  expect(await $.tool.call({ tool: 'Read', tool_use_id: 't2', file_path: '/x' } as never)).toEqual({ isError: true, result: 'x' })
})

for (const surface of ['terminal', 'desktop'] as const) {
  test(`o Zé aparece na faixa e reage (${surface})`, async ($, on) => {
    fundo(on)
    await $.turn.start({ text: 'oi', turnId: 'T1' })
    await $.agent.spawn({ tool_use_id: 'a1', prompt: 'p', description: 'd', subagentType: 'Explore', background: false } as never)
    await $.tool.call({ tool: 'mcp__github__search_code', tool_use_id: 'm1' } as never)
    const faixa = await $.ui.mount({ plugin: 'ze', surface, component: 'AbovePrompt', props: BANDA })

    expect(await faixa.find({ type: 'Text', text: /[▀▄█]/, in: 'ze' })).toBeDefined()
    expect(await faixa.find({ type: 'Text', text: /alô, github\?|·/, in: 'ze' })).toBeDefined()
  })
}

test('erro derruba o Zé', async ($, on) => {
  fundo(on)
  await $.tool.call({ tool: 'Read', tool_use_id: 't2', file_path: '/x' } as never)
  const faixa = await $.ui.mount({ plugin: 'ze', surface: 'terminal', component: 'AbovePrompt', props: BANDA })

  expect(await faixa.find({ type: 'Text', text: /ai, deu erro/, in: 'ze' })).toBeDefined()
})

test('esconde com /ze esconder', async ($, on) => {
  fundo(on)
  await $.command.run({ command: 'ze', args: 'esconder' } as never)
  const faixa = await $.ui.mount({ plugin: 'ze', surface: 'terminal', component: 'AbovePrompt', props: BANDA })

  expect(await faixa.find({ type: 'Text', text: /[▀▄█]/, in: 'ze' }).catch(() => undefined)).toBeUndefined()
})

/** O texto que o Client do Zé desenhou, linha a linha. */
const quadro = async (faixa: { findAll: (q: { type: string; in: string }) => Promise<{ text: string }[]> }) =>
  (await faixa.findAll({ type: 'Text', in: 'ze' })).map(t => t.text).join('\n')

test('o Zé anda sozinho e pula quando chega prompt', async ($, on) => {
  fundo(on)
  const faixa = await $.ui.mount({ plugin: 'ze', surface: 'terminal', component: 'AbovePrompt', props: BANDA })
  const quadros = new Set<string>()

  for (let i = 0; i < 15; i++) {
    await faixa.advance(120)
    quadros.add(await quadro(faixa))
  }

  expect(quadros.size).toBeGreaterThan(3)

  const antes = await quadro(faixa)
  await $.turn.start({ text: 'oi', turnId: 'T9' })
  await faixa.advance(360)

  expect(await faixa.find({ type: 'Text', text: /bora!/, in: 'ze' })).toBeDefined()
  expect(await quadro(faixa)).not.toBe(antes)
})

test('duas ferramentas em paralelo voltam o Zé a pensar', async ($, on) => {
  const relogio = mock.clock(on, { now: 1_000_000 })
  const soltas: Array<() => void> = []
  on('tool.call', () => new Promise(ok => soltas.push(() => ok({ result: 'ok' } as never))))
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)

    return <Text>prompt</Text>
  })
  const a = $.tool.call({ tool: 'Bash', tool_use_id: 'p1', command: 'ls' } as never)
  const b = $.tool.call({ tool: 'mcp__linear__list_issues', tool_use_id: 'p2' } as never)
  await relogio.settle()
  expect(soltas.length).toBe(2)
  soltas.forEach(s => s())
  await Promise.all([a, b])
  await $.command.run({ command: 'ze', args: '' } as never).then(r => expect((r as { text: string }).text).toMatch(/^Zé: pensando/))
})

test('subagente vira capivarinha, trabalha e vai pro ofurô', async ($, on) => {
  fundo(on)
  await $.turn.start({ text: 'oi', turnId: 'T1' })
  await $.agent.spawn({ tool_use_id: 'a1', prompt: 'p', description: 'acha o bug', subagentType: 'Explore', background: false } as never)

  const texto = async () => ((await $.command.run({ command: 'ze', args: '' } as never)) as { text: string }).text

  expect(await texto()).toMatch(/turma: explore \(acha o bug\)/)

  await $.tool.call({ tool: 'Grep', tool_use_id: 'g1', pattern: 'capivara', agentId: 'ag-1' } as never)
  const faixa = await $.ui.mount({ plugin: 'ze', surface: 'terminal', component: 'AbovePrompt', props: BANDA })

  expect(await faixa.find({ type: 'Text', text: /explore/, in: 'ze' })).toBeDefined()

  await $.turn.complete({ agentId: 'ag-1', reason: 'answer', isAborted: false, durationMs: 10, answer: 'ok', turnId: 'S1' } as never)

  expect(await texto()).toMatch(/explore \(no ofurô\)/)
  expect(await texto()).toMatch(/valeu, explore!/)

  await $.turn.start({ text: 'de novo', turnId: 'T2' })

  expect(await texto()).toMatch(/turma: ninguém/)
})

test('subagente que falha fica caído até o próximo prompt', async ($, on) => {
  fundo(on)
  await $.agent.spawn({ tool_use_id: 'a1', prompt: 'p', description: 'd', subagentType: 'devops', background: false } as never)
  await $.turn.complete({ agentId: 'ag-1', reason: 'error', isAborted: false, durationMs: 10, answer: '', turnId: 'S1' } as never)
  const r = (await $.command.run({ command: 'ze', args: '' } as never)) as { text: string }

  expect(r.text).toMatch(/devops \(caiu\)/)
})

test('outro subagente começando não esvazia o ofurô nem faz o Zé pular', async ($, on) => {
  fundo(on)
  await $.turn.start({ text: 'oi', turnId: 'T1' })
  await $.agent.spawn({ tool_use_id: 'a1', prompt: 'p', description: 'd', subagentType: 'Explore', background: false } as never)
  await $.turn.complete({ agentId: 'ag-1', reason: 'answer', isAborted: false, durationMs: 10, answer: 'ok', turnId: 'S1' } as never)
  await $.turn.start({ text: 'x', turnId: 'S2', agentId: 'ag-2' })
  const r = (await $.command.run({ command: 'ze', args: '' } as never)) as { text: string }

  expect(r.text).toMatch(/explore \(no ofurô\)/)
  expect(r.text).not.toMatch(/bora!/)
})
