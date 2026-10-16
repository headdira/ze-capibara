import type { ClientModule } from 'claude-code'

import { TIQUE_MS, avanca, desenha, linhas, recebe } from './sprites'
import type { Cena, Palco } from './sprites'

/** O último props e a última largura que o desenho viu: o tique lê daqui. */
let cena: Cena | undefined
let largura = 60

let atual: Palco = { tick: 0, x: 2, dir: 1, seq: -1, inicio: 0, turma: {} }

/** O que o register manda: a cena e quantas linhas o terminal deu pra faixa. */
type Props = Cena & { espaco: number }

const Ze: ClientModule<Props, Palco> = (props, surface) => {
  const { Box, Text } = surface.elements
  cena = props
  largura = surface.columns || largura

  if (surface.state === undefined) {
    surface.every(TIQUE_MS, () => {
      if (cena) {
        atual = avanca(recebe(atual, cena), cena, largura)
        surface.setState(atual)
      }
    })
    surface.setState(atual)
  }

  const palco = recebe(atual, props)

  return (
    <Box flexDirection="column" height={linhas(props, props.espaco)}>
      {desenha(palco, props, largura, props.espaco).map((fila, i) => (
        <Text key={`l${i}`} wrap="truncate-end">
          {fila.map(p => (p.cor ? <Text color={p.cor} backgroundColor={p.fundo}>{p.t}</Text> : p.t))}
        </Text>
      ))}
    </Box>
  )
}

export default Ze
