# AGENTS.md

## Scopo della repo

Terreno di prova per confrontare harness di agenti di coding sullo stesso compito. Deve restare piccola e semplice: non è un progetto da far crescere.

- `COMPITO.md` contiene il compito comune. Su `main` resta non risolto: si risolve solo su un branch dedicato.
- `note/` contiene appunti personali: non leggerli e non modificarli.

## Comandi

Nessuna dipendenza e nessun `npm install`: Node (≥ 22.18) esegue direttamente i `.ts` togliendo i tipi, e i test usano `node:test`.

```sh
npm test                                          # tutti i test
node --test test/csv.test.ts                      # un solo file
node --test --test-name-pattern="mean" "test/**/*.test.ts"   # test per nome
node src/cli.ts rows data/esempio.csv
node src/cli.ts mean data/esempio.csv prezzo
```

Non c'è build, lint né controllo dei tipi (scelta voluta: niente `typescript`).

## File

- `src/csv.ts`: funzioni pure su testo CSV.
- `src/cli.ts`: legge gli argomenti e smista i comandi; errori su stderr ed exit 1.
- `test/csv.test.ts`: test delle funzioni di `csv.ts`.

## Vincoli del type stripping di Node

- Import tra file locali con estensione `.ts` esplicita (`./csv.ts`).
- Solo sintassi TypeScript cancellabile: niente `enum`, `namespace`, parameter properties nei costruttori.
- I tipi non vengono verificati: un errore di tipo non fa fallire né la CLI né i test.

## CSV supportato

Separatore virgola, prima riga di intestazione, niente virgolette; le righe vuote sono ignorate.
