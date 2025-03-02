import {Type} from "./ast_types";
import {TokenType} from "../../lex/token_type";

export interface Expr {}

export class NewInstanceExpr implements Expr {

    public type: Type;
    public args: Expr[];

    constructor(type: Type, args: Expr[]) {
        this.type = type;
        this.args = args;
    }

}

export class AssignmentExpr implements Expr {

    public op: TokenType;
    public left: Expr;
    public right: Expr;

    constructor(op: TokenType, left: Expr, right: Expr) {
        this.op = op;
        this.left = left;
        this.right = right;
    }

}

export class EqualityExpr implements Expr {

    public op: TokenType;
    public left: Expr;
    public right: Expr;

    constructor(op: TokenType, left: Expr, right: Expr) {
        this.op = op;
        this.left = left;
        this.right = right;
    }

}

export class RelationalExpr implements Expr {

    public op: TokenType;
    public left: Expr;
    public right: Expr;

    constructor(op: TokenType, left: Expr, right: Expr) {
        this.op = op;
        this.left = left;
        this.right = right;
    }

}

export class AdditiveExpr implements Expr {

    public op: TokenType;
    public left: Expr;
    public right: Expr;

    constructor(op: TokenType, left: Expr, right: Expr) {
        this.op = op;
        this.left = left;
        this.right = right;
    }

}

export class MultiplicativeExpr implements Expr {

    public op: TokenType;
    public left: Expr;
    public right: Expr;

    constructor(op: TokenType, left: Expr, right: Expr) {
        this.op = op;
        this.left = left;
        this.right = right;
    }

}

export class ExponentialExpr implements Expr {

    public op: TokenType;
    public left: Expr;
    public right: Expr;

    constructor(op: TokenType, left: Expr, right: Expr) {
        this.op = op;
        this.left = left;
        this.right = right;
    }

}

export class MemberExpr implements Expr {

    public obj: Expr;
    public property: Expr;

    constructor(obj: Expr, property: Expr) {
        this.obj = obj;
        this.property = property;
    }

}

export class CallExpr implements Expr {

    public caller: Expr;
    public args: Expr[];

    constructor(caller: Expr, args: Expr[]) {
        this.caller = caller;
        this.args = args;
    }

}

export class IdentifierExpr implements Expr {
    public name: string;

    constructor(name: string) {
        this.name = name;
    }

}

export class StringExpr implements Expr {

    public value: string;

    constructor(value: string) {
        this.value = value;
    }

}

export class IntegerExpr implements Expr {

    public value: BigInt;

    static max8: BigInt = 127n;
    static min8: BigInt = -128n;

    static max16: BigInt = 32767n;
    static min16: BigInt = -32768n;

    static max32: BigInt = 2_147_483_647n;
    static min32: BigInt = -2_147_483_648n;

    static max64: BigInt = 9_223_372_036_854_775_807n;
    static min64: BigInt = -9_223_372_036_854_775_808n;

    static max8u: BigInt = 255n;
    static max16u: BigInt = 65_535n;
    static max32u: BigInt = 4_294_967_295n;
    static max64u: BigInt = 18_446_744_073_709_551_615n;

    constructor(value: BigInt) {
        this.value = value;
    }

    // Signed Checks

    public isI64(): boolean {
        return this.value <= IntegerExpr.max64 && this.value >= IntegerExpr.min64;
    }

    public isI32(): boolean {
        return this.value <= IntegerExpr.max32 && this.value >= IntegerExpr.min32;
    }

    public isI16(): boolean {
        return this.value <= IntegerExpr.max16 && this.value >= IntegerExpr.min16;
    }

    public isI8(): boolean {
        return this.value <= IntegerExpr.max8 && this.value >= IntegerExpr.min8;
    }

    // Unsigned Checks

    public isU64(): boolean {
        return this.value <= IntegerExpr.max64u && this.value >= (0n as BigInt);
    }

    public isU32(): boolean {
        return this.value <= IntegerExpr.max32u && this.value >= (0n as BigInt);
    }

    public isU16(): boolean {
        return this.value <= IntegerExpr.max16u && this.value >= (0n as BigInt);
    }

    public isU8(): boolean {
        return this.value <= IntegerExpr.max8u && this.value >= (0n as BigInt);
    }

}

export class FloatExpr implements Expr {

    public value: number;

    constructor(value: number) {
        this.value = value;
    }

}
