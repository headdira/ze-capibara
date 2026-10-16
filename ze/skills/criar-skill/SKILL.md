---
name: criar-skill
description: Cria uma skill do Claude Code. Use quando o usuário pedir para criar uma skill, um comando com barra (/algo) ou um passo a passo reutilizável que o Claude deve seguir sempre que um tipo de pedido aparecer.
---

# Criar uma skill do Claude Code

Uma skill é uma pasta com um arquivo `SKILL.md`. O Claude carrega a skill quando o pedido do usuário casa com a `description`, ou quando o usuário chama `/<nome>`.

## 1. Onde salvar

Pergunte ao usuário se a skill vale em todo projeto ou só neste repositório, se ele não disse.

- Em todo projeto: `~/.claude/skills/<nome>/SKILL.md`.
- Só neste repositório: `<repo>/.claude/skills/<nome>/SKILL.md`.

O `<nome>` vai em minúsculas com hífen. Antes de criar, confira se a pasta já existe. Se existir, pergunte antes de sobrescrever.

## 2. O frontmatter

```yaml
---
name: <nome>
description: <o que faz e quando usar>
---
```

- `name`: igual ao nome da pasta.
- `description`: decide quando o Claude carrega a skill. Escreva o gatilho com as palavras que o usuário usaria ("gera o changelog", "notas de versão", "o que mudou desde a última tag"). Diga também quando não usar, se houver risco de confusão com outra skill.

## 3. O corpo

Depois do frontmatter vêm as instruções que o Claude segue quando a skill carrega:

- Passos numerados, na ordem em que o Claude deve executar.
- Comandos exatos, prontos para rodar.
- O formato da saída esperada.
- O que fazer quando algo falha (sem repositório git, sem tag, arquivo faltando).

Escreva no imperativo e direto ao ponto. A skill inteira entra no contexto do Claude quando carrega, então corte o que não ajuda.

## 4. Arquivos de apoio

Scripts, modelos e exemplos ficam na mesma pasta da skill. No `SKILL.md`, cite cada um por caminho relativo:

```text
~/.claude/skills/changelog/
├── SKILL.md
└── modelo.md
```

```markdown
Use o formato de `modelo.md`, nesta mesma pasta.
```

## 5. Exemplo completo

`~/.claude/skills/changelog/SKILL.md`:

````markdown
---
name: changelog
description: Gera um changelog a partir do git log. Use quando o usuário pedir changelog, notas de versão, release notes ou "o que mudou desde a última tag".
---

# Changelog a partir do git log

1. Confirme que a pasta atual é um repositório git com `git rev-parse --is-inside-work-tree`. Se não for, avise e pare.
2. Ache a última tag:
   ```bash
   git describe --tags --abbrev=0
   ```
   Se não houver tag, use todo o histórico.
3. Liste os commits desde a tag, sem merges:
   ```bash
   git log <tag>..HEAD --no-merges --pretty=format:'%h %s'
   ```
   Sem tag, rode `git log --no-merges --pretty=format:'%h %s'`.
4. Agrupe os commits pelo prefixo da mensagem:
   - `feat` em **Novidades**
   - `fix` em **Correções**
   - o resto em **Outras mudanças**
5. Escreva cada item em uma linha, em português, com o hash curto no fim. Reescreva mensagens confusas sem mudar o sentido.
6. Mostre o changelog ao usuário. Só grave em `CHANGELOG.md` se ele pedir, acrescentando no topo do arquivo.

Formato:

```markdown
## <próxima versão ou data de hoje>

### Novidades
- Exporta relatório em CSV (a1b2c3d)

### Correções
- Corrige data em fuso horário diferente (d4e5f6a)
```
````

## 6. Verificar

1. Valide a pasta de skills:
   ```bash
   claude plugin validate ~/.claude/skills
   ```
   Para uma skill de repositório, use `claude plugin validate <repo>/.claude/skills`. O mesmo comando valida skills, agentes e comandos de uma pasta. Aponte para a pasta `skills`, não para a pasta da skill sozinha.
2. Avise o usuário: a skill aparece numa sessão nova do Claude Code. Ele pode chamar com `/<nome>` ou só fazer o pedido, e o Claude carrega a skill quando a `description` casa.
