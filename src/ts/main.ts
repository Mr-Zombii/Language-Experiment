import util from "util";

import Lexer from "./lex/lexer";
import Parser from "./parse/parser";
import TypeChecker from "./typechecker/typechecker";

const lex: Lexer = new Lexer(`
package me.zombii.test;

//import me.zombii.langexp.io:print;
//import me.zombii.langexp.io:printf;
//import me.zombii.langexp.io:println;

//import me.zombii.langexp.io#System;

//Lme.zombii.test.E<me.zombii.test.E<me.zombii.test.E,me.zombii.test.E>

//System.out.println();

//i8 x = cast(16, i8);
i32 x = cast(127, i8);

if (x == true) {
//    System.out.println("Hello World");
    i32 x = cast(127, i8);
}

//struct E {
//    int age;
//    string hello;
//}

//E<E<E, E>> e = new E<E<E, E>>(10, "tits");
//E e = new E(10, "tits");

//enum Test {
//    a,
//    b,
//    c,
//}

//Test e = Test.a;

//println(e);

//native fn sin(i32 a) -> f32;
`);
lex.tokenize();
const parser: Parser = new Parser(lex.tokens);
const tc: TypeChecker = new TypeChecker(parser.parse())

//console.log(util.inspect(tc.ast, {showHidden: false, depth: null, colors: true}))
tc.process();