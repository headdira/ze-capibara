# CLAUDE.md

Instruções para o Claude Code rodando dentro deste clone.

## O que é este repositório

O Zé é um mod do Claude Code: uma capivara em pixel art que trabalha na faixa acima do prompt. Cada subagente vira uma capivarinha com o traje do tipo dela, trabalha com o adereço da ferramenta e, quando termina, vai pro ofurô. Roda 100% local, sem rede.

- `.claude-plugin/marketplace.json`: o marketplace `ze-capibara`, com o plugin `ze` em `./ze`.
- `ze/`: o plugin.
- `docs/`: imagens do README.

O usuário clonou o repositório para (1) instalar o Zé, (2) criar bonecos para os agentes dele, (3) criar subagentes e skills do Claude Code.

## Instalar o Zé para o usuário

Quando o usuário pedir para instalar o Zé:

1. Descubra o caminho absoluto deste clone (`pwd` na raiz do repositório).
2. Veja o que já existe:
   ```bash
   claude plugin marketplace list
   claude plugin list
   ```
3. Se o marketplace `ze-capibara` ainda não existe, instale a partir do clone:
   ```bash
   claude plugin marketplace add <caminho absoluto do clone>
   claude plugin install ze@ze-capibara
   ```
4. Confira com `claude plugin list`. A entrada `ze@ze-capibara` precisa mostrar `Status: ✔ enabled` e `Read from: <caminho do clone>/ze`.
5. Avise o usuário: o Zé só aparece numa sessão nova do Claude Code. Peça para ele fechar esta sessão e abrir outra.

### Se o marketplace já veio do GitHub

Se `claude plugin marketplace list` mostra `ze-capibara` com `Source: GitHub`, ou se `ze@ze-capibara` não tem linha `Read from` ou ela aponta para dentro de `~/.claude/plugins/cache`, o plugin está no cache. Edições ali se perdem no próximo update. Ofereça trocar para o clone e só troque se o usuário aceitar:

```bash
claude plugin marketplace remove ze-capibara
claude plugin marketplace add <caminho absoluto do clone>
claude plugin install ze@ze-capibara
```

Depois confira o `Read from` de novo.

Se `claude plugin list` mostra outro plugin chamado `ze` vindo de outro marketplace, avise o usuário: dois Zés ao mesmo tempo desenham duas faixas. Pergunte qual ele quer manter antes de desativar qualquer um.

## Mapa dos arquivos

| Arquivo | O que tem |
| --- | --- |
| `ze/hooks/register.tsx` | Os eventos do Claude Code (início de turno, ferramenta, subagente, fim de turno), o comando `/ze` e a faixa `AbovePrompt` |
| `ze/hooks/palco.tsx` | O componente que desenha a faixa e faz o relógio andar |
| `ze/hooks/sprites.ts` | O desenho do Zé e do cenário |
| `ze/hooks/turma.ts` | As capivarinhas: paleta `PAL`, `CHAPEUS`, `ITENS`, `TRAJES`, `PALAVRAS` e o sorteio |
| `ze/hooks/fala.ts` | A pose e o balão de cada ferramenta, a máscara de segredos e os comandos perigosos |
| `ze/hooks/hooks.json` | Aponta o módulo `register.tsx` |
| `ze/tests/` | Os testes do mod |
| `ze/skills/` | As skills que vêm com o plugin |

## Regras para mexer no código

- Depois de mudar qualquer coisa em `ze/`, rode `claude plugin test ze` na raiz do clone e só termine com tudo verde.
- Teste importa o kit de `'claude-code/testing'`.
- O mod só importa arquivos relativos (`./`, `../`) e `'claude-code'`. Nada de pacote npm, nada de rede.
- Quem desenha na faixa `AbovePrompt` chama `await next(e)` e devolve o que veio junto com o próprio desenho. Assim outros mods continuam aparecendo.
- Mudanças no mod valem na próxima sessão do Claude Code.

## Bonecos, agentes e skills

Para esses pedidos, use as skills do plugin em vez de improvisar:

- Boneco, skin, traje ou fantasia de capivarinha: `ze:criar-boneco`.
- Subagente novo do Claude Code: `ze:criar-agente`.
- Skill nova do Claude Code: `ze:criar-skill`.

Se o Zé ainda não está instalado, as skills não aparecem. Nesse caso, leia direto o arquivo `ze/skills/<nome>/SKILL.md` e siga os passos dele.
