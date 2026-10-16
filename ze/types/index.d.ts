export type Acao =
  | 'ocioso'
  | 'pula'
  | 'pensando'
  | 'digitando'
  | 'procurando'
  | 'construindo'
  | 'telefone'
  | 'chamando'
  | 'caido'
  | 'comemora'
  | 'panico'

/**
 * Um subagente do Claude Code, desenhado como capivarinha: o tipo escolhe o
 * traje, `acao`/`balao` dizem o que ela está fazendo e `seq` muda a cada troca.
 */
export type Ajudante = {
  id: string
  tipo: string
  nome: string
  acao: Acao
  balao: string
  estado: 'trabalhando' | 'pronto' | 'erro'
  fundo: boolean
  seq: number
}

export type Cena = { acao: Acao; depois: Acao; balao: string; seq: number; ajudantes: Ajudante[] }

declare module 'claude-code' {
  interface PluginState {
    ze: { cena: Cena; ativos: number; oculto: boolean }
  }
}
