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
| 24 | 8192 | no | 3750 MiB (2920 MiB) | 18,1 | 39,4 | prompt di soli 32 token, il token/s del prompt non è affidabile; risposta tagliata a 800 token |

Durante la generazione: GPU al 37%, 73 W. RAM: `used` 9,2 GiB, `buff/cache` 20 GiB (il modello è caricato con mmap, quindi lo vedi come cache), `available` 21 GiB, swap 3 MiB.

## Problema aperto: output senza senso

Con il comando che funziona, la risposta al prompt della mediana è solo una ripetizione di "legislação", "gros", "chy" fino agli 800 token. `reasoning_content` vuoto. Quindi i 18,1 token/s della misura sopra sono provvisori: sono la velocità di un calcolo che non dà risultati corretti.

Test per isolare la causa (una modifica alla volta, prompt corto, `temperature` 0):

| # | Cosa | Se è a posto vuol dire | Esito |
|---|---|---|---|
| T0 | `sha256sum` del file contro lo SHA256 su Hugging Face | il file non è corrotto | **diverso**: locale `6c82633e…`, Hugging Face `cbdf3fa9…`. File da riscaricare da zero (senza `-c`) |
| T1 | comando che funziona con `-fa off` | il problema era flash attention su GPU | |
| T2 | solo CPU: `-ngl 0` | il problema è nel percorso GPU (CUDA) | |

## Prossime prove (dopo aver risolto l'output)

1. `-c 16384`: annota quanto sale la VRAM.
2. `--n-cpu-moe 20`, poi 18, poi 16, finché la VRAM resta sotto 7,3 GB circa. Stima (non misurata): 0,6-0,7 GB per layer di esperti.
3. Ripetere la misura con un prompt lungo (qualche migliaio di token) per avere un token/s del prompt sensato.
4. Provare `reasoning_effort` low per vedere se la risposta sta dentro gli 800 token.
