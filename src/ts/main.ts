import util from "util";

import Lexer from "./lex/lexer";
import Parser from "./parse/parser";

const lex: Lexer = new Lexer(`
package me.zombii.test;

int x = 15;

struct E {
    int age;
    string hello;
}

E<E<E, E>> e = new E<E<E, E>>(10, "tits");

enum test {
    a,
    b,
    c,
}

test e = test.a;

native fn sin(i32 a) -> f32;
`);
lex.tokenize();
const parser: Parser = new Parser(lex.tokens);

console.log(util.inspect(parser.parse(), {showHidden: false, depth: null, colors: true}))