---
name: criar-agente
description: Cria um subagente do Claude Code. Use quando o usuário pedir para criar um subagente, um agente especialista ou um agente para delegar tarefas, mesmo que ele não use a palavra "subagente".
---

# Criar um subagente do Claude Code

Um subagente é um arquivo Markdown com frontmatter YAML. O Claude lê a `description` dele para decidir quando delegar uma tarefa.

## 1. Onde salvar

Pergunte ao usuário se o agente vale em todo projeto ou só neste repositório, se ele não disse.

- Em todo projeto: `~/.claude/agents/<nome>.md`.
- Só neste repositório: `<repo>/.claude/agents/<nome>.md`.

Antes de criar, confira se já existe um arquivo com o mesmo nome. Se existir, pergunte antes de sobrescrever.

## 2. O frontmatter

| Campo | Obrigatório | O que é |
| --- | --- | --- |
| `name` | sim | Minúsculas com hífen, igual ao nome do arquivo. Ex.: `sql-reviewer` |
| `description` | sim | Quando usar e quando não usar. O Claude lê isso para decidir delegar, então seja concreto |
| `model` | não | `opus`, `sonnet` ou `haiku`. Escolha o menor que resolve a tarefa |
| `effort` | não | `low`, `medium`, `high`, `xhigh` ou `max` |
| `tools` | não | Lista de ferramentas separada por vírgula. Sem ela, o agente herda todas |

Dicas para a `description`:

- Diga o gatilho com as palavras que o usuário usaria ("revisar query", "migração de banco").
- Diga quando não usar, para o Claude não delegar a coisa errada.
- Uma ou duas frases bastam.

Dicas para `tools`:

- Agente que só lê e opina: `Read, Grep, Glob`.
- Agente que edita: acrescente `Edit, Write`.
- Agente que roda comando: acrescente `Bash`.

## 3. O corpo

Depois do frontmatter vem o corpo do arquivo: as instruções e a persona do agente. Escreva em segunda pessoa ("Você revisa..."). Inclua:

- O que o agente faz e o que fica fora do escopo dele.
- Os passos que ele segue.
- O formato da resposta que ele devolve. Lembre que quem lê a resposta é o Claude principal, não o usuário.

## 4. Dica do Zé: o nome já dá traje

O Zé veste cada subagente pelo tipo. Se o nome tem uma palavra conhecida, a capivarinha já chega vestida:

- `review` dá caneta e óculos. `sql-reviewer` casa; `revisor-sql` não casa e cai no sorteio.
- `test` dá prancheta e óculos.
- `secur`, `secret`, `audit` e `scan` dão detetive com cadeado.
- `deploy`, `devops`, `infra`, `k8s`, `cloud` e `ops` dão capacete.
- `doc`, `writ`, `copy` e `market` dão boina rosa e lápis.

A tabela completa está no bloco `PALAVRAS` de `hooks/turma.ts`, na pasta do Zé. Sugira um nome que case, se fizer sentido para o usuário.

## 5. Exemplo completo

`~/.claude/agents/sql-reviewer.md`:

```markdown
---
name: sql-reviewer
description: Revisa SQL e migrações de banco. Use quando o usuário pedir revisão de query, índice, migração ou plano de execução. Não use para escrever código de aplicação nem para rodar comandos no banco.
model: sonnet
effort: medium
tools: Read, Grep, Glob
---

Você revisa SQL. Leia as queries e migrações que o pedido indicar e procure:

1. Queries sem índice que vão varrer tabela grande.
2. Migrações que travam tabela em produção (ALTER sem estratégia, índice sem CONCURRENTLY no Postgres).
3. Junções que multiplicam linhas sem querer.
4. Injeção de SQL por concatenação de string.

Você não edita arquivos e não roda nada no banco.

Responda com uma lista de achados. Para cada um: arquivo e linha, o problema em uma frase e a correção sugerida. Se não achar nada, diga isso em uma linha.
```

## 6. Depois de criar

1. Valide a pasta de agentes:
   ```bash
   claude plugin validate ~/.claude/agents
   ```
   Para um agente de repositório, use `claude plugin validate <repo>/.claude/agents`. Aponte para a pasta `agents`; um arquivo `.md` sozinho não é aceito.
2. Pergunte ao usuário se ele quer um boneco próprio para o agente. Se sim, siga a skill `ze:criar-boneco` com o `name` do agente como chave.
3. Avise: o agente novo aparece numa sessão nova do Claude Code, ou pelo comando `/agents`.
