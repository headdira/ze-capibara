---
name: criar-boneco
description: Cria ou muda o boneco de uma capivarinha do Zé. Use quando o usuário pedir um boneco, skin, traje ou fantasia do Zé para um agente ou subagente, ou quiser mudar o visual de uma capivarinha (chapéu, adereço, óculos, cor, pelagem).
---

# Criar um boneco do Zé

Cada subagente vira uma capivarinha. O traje dela sai de `hooks/turma.ts`, dentro da pasta do plugin do Zé. Siga os passos na ordem.

## 1. Achar a pasta do Zé

Rode:

```bash
claude plugin list
```

Procure a entrada `ze@...` e leia a linha `Read from`. Essa é a `<pasta>` do plugin.

- Se `Read from` aponta para um clone (por exemplo `~/ze-capibara/ze`), siga em frente.
- Se não existe linha `Read from`, ou ela aponta para dentro de `~/.claude/plugins/cache`, o plugin veio do GitHub e está no cache. Avise o usuário: a edição funciona, mas some no próximo update. Ofereça instalar a partir de um clone:
  ```bash
  git clone https://github.com/headdira/ze-capibara ~/ze-capibara
  claude plugin marketplace remove ze-capibara
  claude plugin marketplace add ~/ze-capibara
  claude plugin install ze@ze-capibara
  ```
  Só faça a troca se o usuário aceitar. Depois confira o `Read from` de novo.
- Se não existe nenhuma entrada `ze@...`, o Zé não está instalado. Ofereça instalar com os mesmos comandos acima, sem o `remove`.

## 2. Ler antes de mexer

Abra `<pasta>/hooks/turma.ts` e leia estes blocos inteiros antes de mudar qualquer coisa:

- `PAL`: a paleta, uma letra por cor.
- `CHAPEUS`: os chapéus.
- `ITENS`: os adereços que a capivarinha carrega.
- `TRAJES`: a tabela fixa, tipo do subagente para traje.
- `PALAVRAS`: as regras por palavra no nome.

Reaproveite o que já existe. Se o usuário pediu "capacete e chave", isso já está pronto.

## 3. O formato

Um traje tem este formato:

```ts
{ rotulo, cor, chapeu?, item?, oculos?, pelo? }
```

- `rotulo`: o texto que aparece em cima da capivarinha quando o subagente não tem nome próprio.
- `cor`: a cor do rótulo, sempre uma cor de `PAL` (por exemplo `PAL.R!`).
- `chapeu`: um chapéu de `CHAPEUS`.
- `item`: um adereço de `ITENS`. Ela segura o item quando não está usando o adereço da ferramenta.
- `oculos`: `true` desenha óculos.
- `pelo`: pelagem fixa de 0 a 4 (0 caramelo, 1 chocolate, 2 dourada, 3 terra, 4 ruiva). Sem ele, a pelagem é sorteada.

### Pixel art

Um desenho é uma lista de strings, uma por linha. Cada letra é uma cor de `PAL` e `.` é transparente.

| Letra | Cor | Letra | Cor |
| --- | --- | --- | --- |
| `P` | preto | `v` | roxo |
| `R` | vermelho | `p` | rosa |
| `r` | vermelho escuro | `L` | folha |
| `Y` | amarelo | `O` | laranja |
| `M` | metal | `o` | laranja escura |
| `w` | branco | `K` | cáqui |
| `l` | lente | `k` | cáqui escuro |
| `h` | madeira | `s` | palha |
| `j` | madeira escura | `F` | flor |
| `u` | azul | `C` | tela acesa |
|  |  | `T` | vapor |

Cuidados com as letras:

- `B`, `H` e `D` são a pelagem da capivarinha. Elas trocam de cor em cada uma. Não use para chapéu nem item.
- Letra que não existe em `PAL` sai transparente, sem aviso. Confira cada letra.
- Precisa de uma cor nova? Acrescente em `PAL` uma letra que ainda não existe ali e que não seja `B`, `H` ou `D`, com um comentário dizendo a cor.

### Chapéu

Um chapéu é `{ arte: string[], x, y, pisca? }` e fica em `CHAPEUS`.

- `x` e `y` posicionam o chapéu em relação à cabeça. `y` negativo sobe.
- Os chapéus existentes têm de 2 a 4 linhas e até 8 colunas, com `x` entre 1 e 9 (a maioria em 6) e `y` entre -3 e 0. Fique nessa faixa.
- Com `y` igual a -3 a linha de cima some no alto do pulo, como no gorro. Com `y` menor que -4 o topo some até com a capivarinha parada.
- `pisca: true` alterna `RC` com `CR` na arte a cada poucos quadros. Serve para sirene.

### Item

Um item é um `string[]` em `ITENS`, com até 5 linhas e de 3 a 5 colunas. Ele aparece na frente do focinho.

## 4. Onde registrar

Escolha uma das duas formas.

**Tabela fixa, para um agente específico.** Acrescente em `TRAJES`. A chave é o tipo exato do subagente em minúsculas. Para um agente de plugin, que aparece como `plugin:nome`, use só `nome`. A tabela fixa vence qualquer regra de palavra.

**Regra por palavra, para uma família de agentes.** Acrescente em `PALAVRAS` um par `[RegExp, traje sem rotulo]`. Ela vale para qualquer tipo que não está em `TRAJES`. A primeira regra que casa vence, então a regra nova vai no topo da lista. O rótulo sai do próprio nome do agente.

Antes de criar uma regra, confira se o nome do agente já casa com alguma regra existente. `api-tester`, por exemplo, já cai em `/test/` e ganha prancheta e óculos. Se o usuário quer outro visual para ele, use `TRAJES`.

## 5. Exemplo testado

Este exemplo cria uma cartola e uma lupa, dá as duas para `meu-agente` e veste qualquer agente com `sql`, `banco` ou `dados` no nome.

Em `CHAPEUS`:

```ts
cartola: { arte: ['.PPPP.', '.PPPP.', '.RRRR.', 'PPPPPP'], x: 6, y: -3 },
```

Em `ITENS`:

```ts
lupa: ['.MM', 'MlM', 'MM.', 'h..'],
```

Em `TRAJES`:

```ts
'meu-agente': { rotulo: 'meu', cor: PAL.R!, chapeu: CHAPEUS.cartola, item: ITENS.lupa, oculos: true },
```

No topo de `PALAVRAS`:

```ts
[/sql|banco|dados/, { cor: PAL.u!, chapeu: CHAPEUS.cartola, item: ITENS.lupa }],
```

Teste em `<pasta>/tests/<nome>.test.ts`:

```ts
import { expect, test } from 'claude-code/testing'

import { traje } from '../hooks/turma'

test('boneco do meu-agente', () => {
  expect(traje('meu-agente').rotulo).toBe('meu')
  expect(traje('plugin:banco-agent').chapeu?.arte[0]).toBe('.PPPP.')
})
```

Escreva sempre um teste para o boneco novo, no mesmo estilo: o rótulo e a primeira linha do chapéu ou do item.

## 6. Testar e mostrar

1. Rode `claude plugin test <pasta>` e corrija até ficar verde.
2. Mostre ao usuário um preview do chapéu e do item, com as strings uma embaixo da outra:
   ```text
   .PPPP.      .MM
   .PPPP.      MlM
   .RRRR.      MM.
   PPPPPP      h..
   ```
3. Avise: o boneco aparece numa sessão nova do Claude Code, quando o subagente for chamado.
