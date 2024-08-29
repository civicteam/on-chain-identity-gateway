const decimal = BigInt(process.argv[2]);
const hex = decimal.toString(16).padStart(64, '0');
console.log(hex);
