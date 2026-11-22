# Hardware e software del PC di prova

Rilevato il 22 novembre 2026. Ogni misura del banco va letta insieme a questa scheda: se cambia qualcosa qui, le misure vecchie e nuove non sono più confrontabili alla pari.

## Hardware

| Parte | Valore | Comando |
|---|---|---|
| CPU | AMD Ryzen 7 7800X3D, 8 core / 16 thread, max 5053 MHz | `lscpu` |
| RAM | 32 GB DDR5 (2 × 16 GiB, 2 slot liberi), 4800 MT/s | `sudo dmidecode -t memory` |
| GPU | NVIDIA GeForce RTX 2080, 8192 MiB | `nvidia-smi` |

Banda teorica della RAM in dual channel: 4800 MT/s × 8 byte × 2 canali = 76,8 GB/s (calcolato con Python). Per Inkling è il limite che conta, perché gli esperti stanno in RAM e la CPU li rilegge a ogni token.

## Software

| Programma | Versione |
|---|---|
| Sistema | Fedora 45, kernel 7.3.4-300.fc45.x86_64 |
| Driver NVIDIA | 620.70.06 (CUDA 13.5) |
| llama.cpp | 1.0.0-dev, build 12607, commit 1fdda89a4 (Clang 19.1.7) |
| Ollama | 0.40.16 |

## Modelli

| Modello | Dove gira | Dimensione | GPU/CPU | Note |
|---|---|---|---|---|
| qwen3.5:4b | Ollama | 3,3 GB | non misurato | |
| gemma4:e4b | Ollama | 6,6 GB | non misurato | |
| qwen3:8b | Ollama | 5,2 GB (5,3 GB caricato) | 100% GPU | contesto 4096 |
| qwen3.5:9b | Ollama | 6,6 GB (6,2 GB caricato) | 17% CPU / 83% GPU | contesto 4096 |
| Inkling 2 Mini IQ4_NL | llama.cpp | 17,6 GB | esperti di 22 layer su 24 in RAM | comando in [inkling-llamacpp.md](inkling-llamacpp.md), circa 19 token/s |

La colonna GPU/CPU per Ollama viene da `ollama ps`, con il contesto predefinito di Ollama (4096). Con un contesto più grande la parte in CPU cresce: nel banco il contesto va fissato e scritto nei risultati.
