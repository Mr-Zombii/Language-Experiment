import util from "util";

import Lexer from "./lex/lexer";
import Parser from "./parse/parser";

const lex: Lexer = new Lexer(`
const i32 a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, q, t, u, v, w, x, y, z = 1;

fn main(array<string> args) -> string {
    const i8 a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, q, t, u, v, w, x, y, z = 1;
    print(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, q, t, u, v, w, x, y, z, 1, 2 ^ 2, 3 + 2, 4 * 2, 5 / 2, 6.1, 7, 8.1, 9, 10.1);
}
`);
lex.tokenize();
const parser: Parser = new Parser(lex.tokens);

console.log(util.inspect(parser.parse(), {showHidden: false, depth: null, colors: true}))