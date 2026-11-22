#!/usr/bin/env bash
# Prova veloce: il modello sul server llama.cpp risponde in modo sensato?
# Uso: ./scripts/prova.sh [porta]   (predefinita 8080)
PORTA="${1:-8080}"
curl -s "localhost:${PORTA}/v1/chat/completions" -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Qual è la capitale della Francia? Rispondi in una frase."}],"max_tokens":60,"temperature":0}' \
  | python3 -c '
import sys, json
r = json.load(sys.stdin)
m = r["choices"][0]["message"]
print("RAGIONAMENTO:", (m.get("reasoning_content") or "")[:300])
print("RISPOSTA:", m.get("content") or "")
t = r.get("timings", {}).get("predicted_per_second")
print("tok/s:", round(t, 1) if t else "n/d")
'
