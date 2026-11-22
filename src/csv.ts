// Parser CSV minimale: separatore virgola, prima riga di intestazione, niente virgolette.

export type Csv = {
  header: string[];
  rows: string[][];
};

export function parseCsv(text: string): Csv {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "");
  if (lines.length === 0) {
    throw new Error("CSV vuoto: manca l'intestazione");
  }
  const [headerLine, ...dataLines] = lines;
  return {
    header: headerLine.split(","),
    rows: dataLines.map((line) => line.split(",")),
  };
}

export function countRows(text: string): number {
  return parseCsv(text).rows.length;
}

export function columnValues(text: string, column: string): number[] {
  const { header, rows } = parseCsv(text);
  const index = header.indexOf(column);
  if (index === -1) {
    throw new Error(`Colonna inesistente: ${column}`);
  }
  return rows.map((row, i) => {
    const value = Number(row[index]);
    if (row[index] === undefined || row[index] === "" || Number.isNaN(value)) {
      throw new Error(`Valore non numerico nella colonna ${column}, riga ${i + 1}: "${row[index] ?? ""}"`);
    }
    return value;
  });
}

export function mean(text: string, column: string): number {
  const values = columnValues(text, column);
  if (values.length === 0) {
    throw new Error("Nessuna riga di dati");
  }
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
