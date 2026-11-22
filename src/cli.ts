import { readFileSync } from "node:fs";
import { countRows, mean } from "./csv.ts";

const USAGE = `Uso:
  node src/cli.ts rows <file>
  node src/cli.ts mean <file> <colonna>`;

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const [command, file, column] = process.argv.slice(2);

try {
  if (command === "rows" && file) {
    console.log(countRows(readFileSync(file, "utf8")));
  } else if (command === "mean" && file && column) {
    console.log(mean(readFileSync(file, "utf8"), column));
  } else {
    fail(USAGE);
  }
} catch (err) {
  fail(`Errore: ${err instanceof Error ? err.message : String(err)}`);
}
