/** O que o Zé diz no balão: curto, sem conteúdo, credencial mascarada. */

import type { Acao } from '../types'

const SEGREDOS: [RegExp, string][] = [
  [/(bearer\s+)\S+/gi, '$1•••'],
  [/((?:password|passwd|senha|secret|token|api[_-]?key|access[_-]?key)\s*[=:]\s*)[^\s'"&]+/gi, '$1•••'],
  [/(--(?:password|token|secret|api-key|auth-token)[= ])\S+/gi, '$1•••'],
  [/\b(sk-(?:[a-z]+-)?)[A-Za-z0-9_-]{6,}/g, '$1•••'],
  [/\b(gh[pousr]_)[A-Za-z0-9]{10,}/g, '$1•••'],
  [/(:\/\/[^:/\s]+:)[^@\s]+@/g, '$1•••@'],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g, 'jwt•••'],
]

export const mascara = (texto: string) => SEGREDOS.reduce((acc, [re, troca]) => acc.replace(re, troca), texto)

export const curto = (texto: string, max = 26) => {
  const linha = mascara(texto).replace(/\s+/g, ' ').trim()

  return linha.length > max ? `${linha.slice(0, max - 1)}…` : linha
}

const ZONA_VERMELHA: [RegExp, string][] = [
  [/\bkubectl\b[^|;&]*\b(apply|delete|edit|patch|replace|scale|drain)\b/, 'kubectl no cluster!'],
  [/\bargocd\b[^|;&]*\bapp\s+(sync|delete|set|rollback)\b/, 'argocd sync!'],
  [/\bgit\s+push\b[^|;&]*(\s--force\b|\s-f\b)/, 'push --force!'],
  [/\bgit\s+push\b[^|;&]*\s(origin\s+)?(main|master)\b/, 'push na main!'],
  [/\bgit\s+reset\s+--hard\b/, 'reset --hard!'],
  [/\brm\s+-[a-z]*r[a-z]*f|\brm\s+-[a-z]*f[a-z]*r/, 'rm -rf!'],
  [/\b(helm\s+(upgrade|uninstall)|terraform\s+(apply|destroy))\b/, 'mexendo na infra!'],
  [/\b(drop\s+(table|database)|truncate\s+table)\b/i, 'SQL destrutivo!'],
]

export const zonaVermelha = (comando: string) => ZONA_VERMELHA.find(([re]) => re.test(comando))?.[1] ?? null

const base = (caminho: string) => caminho.split('/').filter(Boolean).pop() ?? caminho

const campo = (obj: unknown, chave: string) => {
  const valor = obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[chave] : undefined

  return typeof valor === 'string' ? valor : null
}

/** A ação e a fala para uma ferramenta que começou. */
export const papel = (tool: string, input: unknown): { acao: Acao; balao: string } => {
  if (tool.startsWith('mcp__')) {
    const servidor = (tool.split('__')[1] ?? 'mcp').replace(/^plugin_[^_]+(?:-[^_]+)*_/, '').replace(/^claude_ai_/, '')

    return { acao: 'telefone', balao: `alô, ${servidor}?` }
  }

  switch (tool) {
    case 'Bash': {
      const cmd = campo(input, 'command') ?? ''
      const perigo = zonaVermelha(cmd)

      return perigo ? { acao: 'panico', balao: perigo } : { acao: 'digitando', balao: `$ ${curto(cmd, 24)}` }
    }
    case 'Read':
      return { acao: 'procurando', balao: `lendo ${curto(base(campo(input, 'file_path') ?? ''), 22)}` }
    case 'Grep':
      return { acao: 'procurando', balao: `caçando ${curto(campo(input, 'pattern') ?? '', 20)}` }
    case 'Glob':
      return { acao: 'procurando', balao: `achando ${curto(campo(input, 'pattern') ?? '', 20)}` }
    case 'Edit':
    case 'MultiEdit':
    case 'Write':
    case 'NotebookEdit':
      return {
        acao: 'construindo',
        balao: `${tool === 'Write' ? 'criando' : 'mexendo em'} ${curto(base(campo(input, 'file_path') ?? campo(input, 'notebook_path') ?? ''), 20)}`,
      }
    case 'Agent':
    case 'Task':
      return { acao: 'chamando', balao: `ô ${curto(campo(input, 'subagent_type') ?? 'parceiro', 18)}, ajuda aqui!` }
    case 'WebFetch': {
      const url = campo(input, 'url') ?? ''
      const host = /^https?:\/\/([^/]+)/.exec(url)?.[1] ?? 'web'

      return { acao: 'procurando', balao: `na web: ${curto(host, 22)}` }
    }
    case 'WebSearch':
      return { acao: 'procurando', balao: 'pesquisando na web' }
    default:
      return { acao: 'pensando', balao: curto(tool, 22) }
  }
}
