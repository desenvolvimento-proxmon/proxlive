/**
 * Gera o hash bcrypt da senha do admin.
 *
 * A senha nunca e guardada em texto: o .env recebe so o hash, e quem tiver
 * acesso ao arquivo nao consegue reverter para a senha original.
 *
 *   node hash-senha.js "minha senha aqui"
 */

const bcrypt = require("bcryptjs");

const senha = process.argv[2];

if (!senha) {
  console.error('Uso: node hash-senha.js "sua senha"');
  process.exit(1);
}

if (senha.length < 10) {
  console.error("Use pelo menos 10 caracteres.");
  process.exit(1);
}

console.log(bcrypt.hashSync(senha, 12));
