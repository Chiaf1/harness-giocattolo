import { test } from "node:test";
import assert from "node:assert/strict";
import { countRows, mean } from "../src/csv.ts";

const CSV = `nome,valore
a,2
b,4
c,9
`;

test("rows conta le righe di dati, senza l'intestazione", () => {
  assert.equal(countRows(CSV), 3);
});

test("mean calcola la media di una colonna numerica", () => {
  assert.equal(mean(CSV, "valore"), 5);
});

test("mean dà errore se la colonna non esiste", () => {
  assert.throws(() => mean(CSV, "assente"), /Colonna inesistente/);
});
