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
//i8 x = cast(127, i8);
i8 x = (i8) 127;

if (x == true) {
//    System.out.println("Hello World");
    i32 xx = cast(127, i8);
}

struct E {
    i8 age;
    string hello;
}

//E<E<E, E>> e = new E<E<E, E>>(10, "tits");
E e = new E(x = 15, "tits");

//enum Test {
//    a,
//    b,
//    c,
//}

//Test e = Test.a;

//println(e);

//native fn sin(i32 a) -> f32;

fn fib(int n) -> int {
    if (n <= 1)
        return n;
    
    int a = 0;
    int b = 0;
    int temp;
    
    for (int i = 2; i <= n; i += 1) {
        temp = a + b;
        a = b;
        b = temp;
    }
    
    return b;
}
`);
lex.tokenize();
const parser: Parser = new Parser(lex.tokens);
const tc: TypeChecker = new TypeChecker(parser.parse())

//console.log(util.inspect(tc.ast, {showHidden: false, depth: null, colors: true}))
tc.process();