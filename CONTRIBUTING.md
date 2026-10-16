# Contributing to Zé

Thanks for helping Zé's crew grow. New outfits, more word rules, poses for more tools and bug fixes are all welcome.

[Português](#em-português) below.

## Setup

1. Fork the repository and clone your fork:
   ```bash
   git clone https://github.com/<you>/ze-capibara ~/ze-capibara
   cd ~/ze-capibara
   ```
2. Install Zé from your clone, so Claude Code runs your local changes:
   ```bash
   claude plugin marketplace add ~/ze-capibara
   claude plugin install ze@ze-capibara
   ```
3. Check that `claude plugin list` shows `Read from: <your clone>/ze` for `ze@ze-capibara`.

Changes to the mod take effect in the next Claude Code session.

## Running the tests

From the root of the clone:

```bash
claude plugin test ze
```

It runs every `*.test.ts` and `*.test.tsx` in `ze/tests`. CI runs the same command, plus `claude plugin validate .` and `claude plugin validate ze`, on every push and pull request. Run all three before opening a PR.

## Creating an outfit

The easiest way: open Claude Code in your clone and ask for it.

```text
Create a Zé outfit for my api-tester agent with a cowboy hat and a magnifying glass
```

The `ze:criar-boneco` skill finds the plugin folder, draws the hat and the prop, registers the outfit, writes a test and runs the tests. Its full guide lives in [ze/skills/criar-boneco/SKILL.md](ze/skills/criar-boneco/SKILL.md).

To do it by hand, edit `ze/hooks/turma.ts`:

- `PAL` is the palette: one letter per color, `.` is transparent. `B`, `H` and `D` are the capybara's fur, so don't use them in hats or props.
- `CHAPEUS` holds hats: `{ arte: string[], x, y }`. Keep them 2 to 4 rows tall and up to 8 columns wide, with `y` between -3 and 0.
- `ITENS` holds props: `string[]`, up to 5 rows and 3 to 5 columns.
- `TRAJES` maps an exact subagent type (lowercase, without the `plugin:` prefix) to an outfit.
- `PALAVRAS` maps a word in the name to an outfit. The first match wins, so new rules go at the top.

The README has a tested example with a top hat (`cartola`) and a magnifying glass (`lupa`), including its test. Open the "Do it by hand" block in [README.md](README.md#outfits).

Every new outfit needs a test in `ze/tests/` that checks at least its label and the first row of its hat or prop.

## Rules

- Tests import their kit from `'claude-code/testing'`.
- The mod imports only relative files (`./`, `../`) and `'claude-code'`. No npm packages.
- Anything that draws in the `AbovePrompt` band calls `await next(e)` and returns that result together with its own drawing, so other mods keep showing up.
- Zé is 100% local. No network calls, no telemetry, no personal data in code, tests or screenshots.
- Keep the style of the code around you: small pure functions in `turma.ts` and `sprites.ts`, events in `register.tsx`.

## Pull requests

1. Create a branch in your fork.
2. Make your change and add or update tests.
3. Run `claude plugin test ze` until it's green.
4. Open a PR and fill in the template. Include a screenshot or GIF of your little capybara in action.

Not sure about something? Open an issue first. Want an outfit and don't feel like drawing? Use the "New outfit / Novo boneco" issue template.

## Em português

Obrigado por ajudar a turma do Zé a crescer.

- **Testes:** na raiz do clone, rode `claude plugin test ze`. O CI também roda `claude plugin validate .` e `claude plugin validate ze`.
- **Boneco novo:** abra o Claude no clone e peça, por exemplo, "Cria um boneco do Zé pro meu agente api-tester com chapéu de cowboy e uma lupa". A skill `ze:criar-boneco` faz o resto. Para fazer na mão, siga o exemplo da cartola e da lupa no bloco "Fazer na mão" do [README.pt-BR.md](README.pt-BR.md#bonecos).
- **Regras:** teste importa de `'claude-code/testing'`; o mod só importa arquivos relativos e `'claude-code'`; quem desenha na faixa `AbovePrompt` chama `await next(e)` e devolve junto; tudo 100% local, sem rede e sem dado pessoal.
- **Pull request:** testes verdes e um print ou GIF da sua capivarinha.
