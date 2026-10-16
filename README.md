<p align="center">
  <img src="docs/turma.gif" alt="Zé and his crew of little capybaras working above the Claude Code prompt" width="100%">
</p>

<h1 align="center">Zé, the Claude Code capybara</h1>

<p align="center">
  <strong>Your subagents become a crew of pixel art capybaras working right above your prompt.</strong>
</p>

<p align="center">
  <a href="LICENSE"><img alt="License Apache 2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue"></a>
  <img alt="Claude Code mod" src="https://img.shields.io/badge/Claude%20Code-mod-d97757">
  <img alt="100% local" src="https://img.shields.io/badge/100%25-local-3fae4a">
  <a href="https://github.com/headdira/ze-capibara/actions/workflows/test.yml"><img alt="tests" src="https://github.com/headdira/ze-capibara/actions/workflows/test.yml/badge.svg"></a>
  <a href="https://github.com/headdira/ze-capibara/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/headdira/ze-capibara?style=social"></a>
</p>

<p align="center">
  <strong>English</strong> · <a href="README.pt-BR.md">Português</a>
</p>

Zé is a Claude Code mod. He lives in the band above your prompt and shows, in pixel art, what Claude is doing right now. Every subagent Claude spawns becomes a little capybara wearing the outfit of its type. It works with a prop that matches the tool it is using and, when it finishes, it goes to relax in the hot tub.

Everything runs on your machine. Zé makes no network calls.

If Zé made you smile, a ⭐ helps other people find it.

## Paste this into Claude

You don't need to read the rest of this README to get started. Open a terminal:

```bash
git clone https://github.com/headdira/ze-capibara ~/ze-capibara
cd ~/ze-capibara
claude
```

With Claude open in that folder, paste this prompt:

```text
Install Zé from this repository into my Claude Code following CLAUDE.md.
```

Claude reads the repository's `CLAUDE.md`, installs the plugin from your clone and checks that it worked. Then open a new session and Zé shows up above the prompt.

## Why

Claude Code does a lot at once. It reads files, runs commands, calls MCP servers and hands work to subagents that run in parallel. Most of that scrolls by as text.

Zé turns it into something you read at a glance. You see when Claude is reading, typing or building, how many subagents are working, which ones finished and which one fell over. You see when a risky command is about to run. And it makes long sessions a bit more fun.

## Manual install

If you'd rather run the commands yourself:

```bash
git clone https://github.com/headdira/ze-capibara ~/ze-capibara
claude plugin marketplace add ~/ze-capibara
claude plugin install ze@ze-capibara
claude plugin list
```

In the `claude plugin list` output, look for Zé's entry:

```text
  ❯ ze@ze-capibara
    Read from: /Users/you/ze-capibara/ze
    Status: ✔ enabled
```

`Read from` must point to the `ze` folder inside your clone. Open a new Claude Code session and you're done.

**Why clone?** Claude reads the mod straight from your clone. The outfits you create work in the next session and don't vanish when the plugin updates.

### Quick option, no customizing

If you only want to see Zé in action and don't plan to create outfits:

```bash
claude plugin marketplace add headdira/ze-capibara
claude plugin install ze@ze-capibara
```

In this mode Claude keeps the plugin in an internal cache, and `claude plugin list` shows no `Read from` line. Any edit you make there is lost on the next update. To customize, use the clone.

## What Zé does

- Reads files with a magnifying glass, types on a laptop when running commands and hammers away when editing code.
- Answers the phone when Claude calls an MCP server.
- Panics when he sees a risky command, like `rm -rf` or `git push --force`.
- Calls the crew: each subagent walks in with its own outfit and name.
- Celebrates when the turn ends and shows how long it took.
- Falls over when a tool errors or when you interrupt the turn.
- Masks passwords and tokens before writing anything in his speech bubble.

<p align="center">
  <img src="docs/momentos.png" alt="Seven moments of a turn with Zé and the crew" width="100%">
</p>

## Commands

| Command | What it does |
| --- | --- |
| `/ze` | Shows what Zé is doing and who is in the crew |
| `/ze pula` | Makes Zé jump |
| `/ze esconder` | Hides Zé from above the prompt |
| `/ze mostrar` | Brings Zé back |

Zé grew up in Brazil, so his commands are in Portuguese: `pula` is "jump", `esconder` is "hide" and `mostrar` is "show".

## Ready-made prompts

The plugin ships with three skills. With Zé installed, paste one of these into any Claude session and tweak it to your taste:

| Paste into Claude | Skill that handles it |
| --- | --- |
| `Create a Zé outfit for my api-tester agent with a cowboy hat and a magnifying glass` | `ze:criar-boneco` |
| `Create a sql-reviewer subagent that runs on sonnet and give it an outfit` | `ze:criar-agente` and `ze:criar-boneco` |
| `Create a skill that generates a changelog from git log` | `ze:criar-skill` |

The outfit skill draws the hat and the prop in pixel art, registers the outfit, writes a test and runs the tests until they pass. The skills are written in Portuguese, and Claude answers you in your own language.

## Outfits

Zé picks each little capybara's outfit from the subagent type, in this order:

1. **Fixed table (`TRAJES`).** Types with their own outfit, like `explore` (safari hat), `plan` (beret and clipboard), `general-purpose` (cap) and `fork` (Zé's orange).
2. **Word in the name (`PALAVRAS`).** If the type isn't in the table, Zé looks for a known word in its name. The first rule that matches wins.
3. **Draw.** With no table entry and no word, it gets a hat picked from its name. The same name always gets the same hat.

| If the name has | Outfit |
| --- | --- |
| `review` | pen and glasses |
| `secur`, `secret`, `audit`, `scan` | detective hat and padlock |
| `test` | clipboard and glasses |
| `analy`, `extract` | book and glasses |
| `verif`, `valid`, `judge`, `check` | graduation cap and clipboard |
| `generat`, `scaffold`, `creat`, `migrat`, `build` | hard hat and wrench |
| `simplif`, `refactor`, `clean` | cap and scissors |
| `perf`, `optim` | headband and lightning bolt |
| `deploy`, `devops`, `infra`, `k8s`, `cloud`, `ops` | hard hat |
| `explor`, `research`, `search` | safari hat |
| `architect`, `design`, `plan` | beret and clipboard |
| `math`, `proof` | graduation cap |
| `doc`, `writ`, `copy`, `market` | pink beret and pencil |

So an agent named `sql-reviewer` already shows up with a pen and glasses, and you don't touch a thing.

<p align="center">
  <img src="docs/trajes-plugins.png" alt="Little capybaras dressed by the word in the agent's name" width="80%">
</p>

<details>
<summary><strong>Do it by hand</strong></summary>

Outfits live in `ze/hooks/turma.ts`. Each drawing is a list of strings. Each letter is a color from the `PAL` palette and `.` is transparent.

This example creates a top hat and a magnifying glass, gives both to the `meu-agente` agent and dresses any agent with `sql`, `banco` or `dados` in its name.

In `CHAPEUS` (hats):

```ts
cartola: { arte: ['.PPPP.', '.PPPP.', '.RRRR.', 'PPPPPP'], x: 6, y: -3 },
```

In `ITENS` (props):

```ts
lupa: ['.MM', 'MlM', 'MM.', 'h..'],
```

In `TRAJES` (fixed table):

```ts
'meu-agente': { rotulo: 'meu', cor: PAL.R!, chapeu: CHAPEUS.cartola, item: ITENS.lupa, oculos: true },
```

At the top of `PALAVRAS` (word rules):

```ts
[/sql|banco|dados/, { cor: PAL.u!, chapeu: CHAPEUS.cartola, item: ITENS.lupa }],
```

And a test in `ze/tests/meu-agente.test.ts`:

```ts
import { expect, test } from 'claude-code/testing'

import { traje } from '../hooks/turma'

test('boneco do meu-agente', () => {
  expect(traje('meu-agente').rotulo).toBe('meu')
  expect(traje('plugin:banco-agent').chapeu?.arte[0]).toBe('.PPPP.')
})
```

Run `claude plugin test ze` from the root of your clone and open a new session to see it.

</details>

## Repository layout

```text
ze-capibara/
├── .claude-plugin/
│   └── marketplace.json      the "ze-capibara" marketplace
├── .github/                  test CI, issue and PR templates
├── CLAUDE.md                 instructions for the Claude running in the clone
├── CONTRIBUTING.md           how to contribute
├── README.md                 this README
├── README.pt-BR.md           README in Portuguese
├── docs/                     README images
└── ze/                       the plugin
    ├── .claude-plugin/
    │   └── plugin.json
    ├── hooks/
    │   ├── hooks.json
    │   ├── register.tsx      Claude Code events and the /ze command
    │   ├── palco.tsx         the band above the prompt
    │   ├── sprites.ts        Zé's drawing
    │   ├── turma.ts          the little capybaras and their outfits
    │   └── fala.ts           pose and speech bubble for each tool
    ├── skills/
    │   ├── criar-boneco/     create an outfit
    │   ├── criar-agente/     create a subagent
    │   └── criar-skill/      create a skill
    ├── tests/
    └── types/
```

## Running the tests

From the root of your clone:

```bash
claude plugin test ze
```

The command runs every `*.test.ts` and `*.test.tsx` in `ze/tests` in the same environment the hooks run in. CI runs the same command on every push and pull request.

## Contributing

1. Fork the repository.
2. Create your outfit in `ze/hooks/turma.ts` and a test in `ze/tests/`.
3. Run `claude plugin test ze` until it's green.
4. Open a pull request with a screenshot of your little capybara.

New outfits, more word rules and poses for more tools are all welcome. The step by step is in [CONTRIBUTING.md](CONTRIBUTING.md). Want an outfit but don't feel like drawing? Open an issue with the "New outfit / Novo boneco" template.

## License

[Apache-2.0](LICENSE). Created by Gerson Moreira.
