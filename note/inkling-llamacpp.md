# Inkling 2 Mini su llama.cpp (RTX 2080 8 GB, 32 GB RAM)

Domenica 22 novembre 2026. File: `Inkling-2-Mini-IQ4_NL.gguf` (17,6 GB; 26B totali, 3B attivi, 128 esperti, 24 layer).
llama.cpp build `b12607-1fdda89a4`, avviato con `llama serve`.

## Comando che funziona

```bash
llama serve -m ~/models/inkling2mini/Inkling-2-Mini-IQ4_NL.gguf \
  -ngl 99 --n-cpu-moe 24 -c 8192 -fa on -ub 256 --no-op-offload \
  --jinja --port 8080
```

## Cosa riempie la VRAM

- **Pesi** messi in GPU: si controllano con `-ngl` e `--n-cpu-moe`.
- **KV cache** (il contesto): cresce con `-c`.
- **Compute buffer** (lo spazio di lavoro): cresce con `-ub` e con `-fa` spento. Con gli esperti in RAM cresce soprattutto per l'**op offload**: durante la lettura del prompt llama.cpp copia in GPU i pesi degli esperti che stanno in RAM, e quella copia finisce nel compute buffer.

Regola: leggi nel log quale delle tre voci non entra e tocca solo il parametro che la controlla.

## Tentativi

| # | Parametri | Esito | Buffer richiesto |
|---|---|---|---|
| 1 | `-ngl 99 --n-cpu-moe 24 -c 16384` | OOM compute pp buffer | 8374 MiB |
| 2 | auto-fit (senza `-ngl` e `--n-cpu-moe`), `-c 16384` | OOM compute pp buffer | 8869 MiB |
| 3 | `-ngl 99 --n-cpu-moe 24 -c 8192 -fa on -ub 256` | OOM compute pp buffer | 7162 MiB |
| 4 | come il 3 + `--no-op-offload` | parte | llama occupa 2854 MiB |

Lezioni:
- `--n-cpu-moe 24` mette già in RAM gli esperti di tutti i 24 layer: alzarlo ancora non serve.
- Dimezzare `-c` e `-ub` e accendere `-fa` ha tolto solo il 15% circa del buffer: il grosso non era l'attenzione.
- L'auto-fit non tiene conto del buffer dell'op offload: per le prove a mano conviene passare `-ngl` e `--n-cpu-moe`.

## Misure

Prompt: "Scrivi una funzione TypeScript che restituisce la mediana di un array di numeri.", `max_tokens` 800.

| --n-cpu-moe | -c | op offload | VRAM totale (llama) | token/s gen | token/s prompt | note |
|---|---|---|---|---|---|---|
| 24 | 8192 | no | 3750 MiB (2920 MiB) | 18,1 | 39,4 | **file corrotto**, misura provvisoria; prompt di soli 32 token; risposta tagliata a 800 token |
| 24 | 8192 | no | | 17,7 | 36,7 | file giusto; prompt di `prova.sh` (29 token), 60 token generati |
| 24 | 8192 | no | 4062 MiB (2920 MiB) | 18,1 | 39,8 | file giusto; prompt mediana (20 token), 579 token generati, finito da solo (`stop`); GPU 38-39%, 53-71 W |

| 24 | 16384 | no | 4686 MiB | 17,9 | 40,4 | prova A; mediana tagliata a 800 token (`length`): il ragionamento ha riscritto il codice due volte, con lunghe file di spazi in mezzo |

Prova A: raddoppiare il contesto (8192 → 16384) costa circa 620 MiB di VRAM e non cambia la velocità. La risposta tagliata non dipende da `-c`: la curl non fissa `temperature`, quindi ogni risposta è diversa, e questa volta il ragionamento è stato più lungo. Dalla prova B in poi la curl della mediana usa `temperature` 0 e `max_tokens` 1500, così le risposte sono confrontabili e il modello ha spazio per finire.

Qualità della risposta sulla mediana: codice corretto (copia l'array, ordina numerico, gestisce pari/dispari, errore su array vuoto), ragionamento in inglese e risposta in italiano. Però uno dei tre esempi nei commenti è sbagliato: scrive `median([4, 1, 7, 2]); // 2.5`, ma la sua stessa funzione dà 3 (ordinato 1, 2, 4, 7 → (2+4)/2). Verificato eseguendo il codice con Node. È proprio il tipo di errore che il banco del passo 6 deve trovare: gli esempi si controllano con i test, non leggendoli.

Durante la generazione: GPU al 37%, 73 W. RAM: `used` 9,2 GiB, `buff/cache` 20 GiB (il modello è caricato con mmap, quindi lo vedi come cache), `available` 21 GiB, swap 3 MiB.

## Problema risolto: output senza senso (file corrotto)

Con il primo download la risposta al prompt della mediana era solo una ripetizione di "legislação", "gros", "chy" fino agli 800 token, con `reasoning_content` vuoto. Per questo la misura sopra (18,1 token/s) va considerata provvisoria: è stata fatta sul file rotto.

| # | Cosa | Esito |
|---|---|---|
| T0 | `sha256sum` del file contro lo SHA256 su Hugging Face | primo download **diverso** (locale `6c82633e…`, Hugging Face `cbdf3fa9…`). Riscaricato da zero senza `-c`: ora **coincide** (`cbdf3fa9…`) |
| T1 | `-fa off` | non servito |
| T2 | solo CPU, `-ngl 0` | non servito |

Con il file giusto e lo stesso comando, `scripts/prova.sh` dà un ragionamento sensato (capisce la domanda in italiano, sa che la risposta è Parigi). Velocità: 17,7 token/s in generazione, 36,7 token/s sul prompt (29 token). La risposta era vuota perché i 60 token di `max_tokens` sono finiti tutti nel ragionamento: portato `max_tokens` a 400 nello script.

Regola: dopo ogni download, `sha256sum` prima di lanciare qualunque cosa. llama.cpp carica anche un file corrotto senza dire niente.

Il log di `wget` restava vuoto (solo "nohup: input ignorato"): probabilmente è wget2, che non scrive l'avanzamento senza terminale. L'avanzamento si ricava dalla dimensione del file.

## Prossime prove

1. `-c 16384`: annota quanto sale la VRAM.
2. `--n-cpu-moe 20`, poi 18, poi 16, finché la VRAM resta sotto 7,3 GB circa. Stima (non misurata): 0,6-0,7 GB per layer di esperti.
3. Ripetere la misura con un prompt lungo (qualche migliaio di token) per avere un token/s del prompt sensato.
4. Provare `reasoning_effort` low per vedere se la risposta sta dentro gli 800 token.
