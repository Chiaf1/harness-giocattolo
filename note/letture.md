# Letture

## Building effective agents (Anthropic)

Letto il 22 novembre 2026. In apertura l'articolo avvisa che è vecchio (dicembre 2024) e che alcune cose non valgono più del tutto.

### Workflow e agente

- **Workflow**: il percorso lo decido io nel codice. L'LLM e i tool vengono chiamati in passi già stabiliti, sempre nello stesso ordine.
- **Agente**: l'LLM decide da solo i passi e quali tool usare. Gira in un loop: agisce, guarda il risultato, decide cosa fare dopo. Si può fermare per chiedere qualcosa all'utente o quando ha finito.

In una riga: nel workflow il controllo ce l'ha il codice, nell'agente ce l'ha il modello.

### I pattern che userei per il mio harness (Fase A)

- **Prompt chaining**: il compito spezzato in passi in fila, l'uscita di uno è l'ingresso del successivo.
- **Orchestrator-workers**: un LLM divide il lavoro e lo smista ad altri LLM, poi mette insieme i risultati.
- **Evaluator-optimizer**: un LLM produce, un altro valuta e dà un riscontro, e si gira finché il risultato va bene.

### Rischi dei loop degli agenti

- Gli errori si sommano: uno sbaglio all'inizio si porta dietro tutto il resto.
- Costano di più (tempo e token).
- Vanno provati in sandbox, con paletti seri su cosa possono fare.

### Le idee chiave

- Si misura e si itera. Si aggiunge complessità solo quando i numeri dimostrano che migliora il risultato.
- Non vince il sistema più sofisticato, vince quello giusto per il problema. Si parte da prompt semplici, si migliorano con le eval, e si passa a sistemi agentici a più passi solo se le soluzioni semplici non bastano.
- I tre principi per costruire un agente:
  1. Tenere il design semplice.
  2. Rendere visibile il piano dell'agente, passo per passo.
  3. Curare l'interfaccia tra agente e computer (ACI): tool ben documentati e provati.
- I framework aiutano a partire in fretta, ma andando in produzione conviene togliere strati di astrazione e costruire con componenti di base.

### Appendice 1: agenti in pratica

- **Customer support**: un buon esempio di loop agentico, perché mescola conversazione con l'utente e chiamate ai tool. Potrebbe servire sia per la Collana CMMS sia per gli allarmi in ami.

### Appendice 2: scrivere bene i tool

- Mettersi nei panni del modello: se per capire come usare un tool devo pensarci su, ci deve pensare anche lui. Una buona definizione ha esempi d'uso, casi limite, formato degli input e confini chiari rispetto agli altri tool.
- Nomi e descrizioni dei parametri vanno scritti come una buona docstring per un collega junior. Conta ancora di più quando ci sono tanti tool simili.
- Provare come il modello usa i tool: tanti input di esempio, guardare gli errori, correggere.
- Poka-yoke: cambiare gli argomenti in modo che sia difficile sbagliare.
