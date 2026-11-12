import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);

// dist/money.js
var MCR_PER_DOLLAR = 10000000n;
function formatMcrAsDollars(value) {
  const text = typeof value === "number" && Number.isSafeInteger(value) ? String(value) : value;
  if (typeof text !== "string" || !/^-?[0-9]+$/.test(text))
    return void 0;
  const mcr = BigInt(text);
  const negative = mcr < 0n;
  const abs = negative ? -mcr : mcr;
  const whole = (abs / MCR_PER_DOLLAR).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  let fraction = (abs % MCR_PER_DOLLAR).toString().padStart(7, "0");
  while (fraction.length > 2 && fraction.endsWith("0"))
    fraction = fraction.slice(0, -1);
  return "".concat(negative ? "-" : "", "$").concat(whole, ".").concat(fraction);
}
function moneyLabel(field) {
  return field.endsWith("_mcr") ? field.slice(0, -"_mcr".length) : field;
}

export {
  formatMcrAsDollars,
  moneyLabel
};
