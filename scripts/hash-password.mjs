// Gera o valor de ADMIN_PASSWORD_HASH a partir de uma senha.
// Uso: npm run hash-password   (a senha é pedida no terminal e não fica salva)
import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline";

const SCRYPT = { N: 16384, r: 8, p: 1 };

function hash(password) {
  const salt = randomBytes(16);
  const key = scryptSync(password.normalize("NFC"), salt, 32, SCRYPT);
  // Formato sem "$" (o .env da Next.js interpretaria "$" como variável).
  return `scrypt:${salt.toString("base64url")}:${key.toString("base64url")}`;
}

const fromArg = process.argv[2];
if (fromArg) {
  console.log(hash(fromArg));
} else {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  rl.question("Senha do /admin: ", (answer) => {
    rl.close();
    if (!answer) {
      console.error("Senha vazia.");
      process.exit(1);
    }
    console.log(`\nADMIN_PASSWORD_HASH=${hash(answer)}`);
  });
}
