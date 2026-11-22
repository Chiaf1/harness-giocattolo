# harness-giocattolo

Terreno di prova per confrontare diversi harness per agenti di coding (Claude Code, goose, OpenCode, Hermes) sullo stesso compito.
Contiene una piccola CLI in TypeScript che legge un CSV e stampa statistiche.

- Il compito comune è in [COMPITO.md](COMPITO.md): su `main` resta da risolvere, ogni harness lo risolve su un suo branch.
- In [note/](note/) vanno la scheda di ogni harness (partendo da `note/_modello.md`) e gli appunti delle prove.

## Requisiti

Node 22.18 o più recente (testato con Node 24). Nessuna dipendenza: Node esegue direttamente i file `.ts` e ha già un test runner incluso.

## Test

```sh
npm test
```

## CLI

```sh
node src/cli.ts rows data/esempio.csv          # numero di righe di dati
node src/cli.ts mean data/esempio.csv prezzo   # media di una colonna numerica
```

Il CSV deve essere semplice: separatore virgola, prima riga di intestazione, niente virgolette.
