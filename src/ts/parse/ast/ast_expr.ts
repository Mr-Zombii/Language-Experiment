import {Type} from "./ast_types";
import {TokenType} from "../../lex/token_type";
import {ExprStmt} from "./ast_stmt";

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

export class Integer8Expr implements Expr {

    public value: number;

    constructor(value: number) {
        if (!(value <= 127 && value >= -128)) throw new Error("Integer 8 is out of range");
        this.value = value;
    }

}

export class Integer16Expr implements Expr {

    public value: number;

    constructor(value: number) {
        if (!(value <= 32767 && value >= -32768)) throw new Error("Integer 16 is out of range");
        this.value = value;
    }

}

export class Integer32Expr implements Expr {

    public value: number;

    constructor(value: number) {
        if (!(value <= 2_147_483_647 && value >= -2_147_483_648)) throw new Error("Integer 32 is out of range");
        this.value = value;
    }

}

export class Integer64Expr implements Expr {

    public value: BigInt;

    static max: BigInt = 9_223_372_036_854_775_807n;
    static min: BigInt = -9_223_372_036_854_775_808n;

    constructor(value: BigInt) {
        if (!(value <= Integer64Expr.max && value >= Integer64Expr.min)) throw new Error("Integer 64 is out of range");
        this.value = value;
    }

}

export class UnsignedInteger8Expr implements Expr {

    public value: number;

    constructor(value: number) {
        if (!(value <= 255 && value >= 0)) throw new Error("Unsigned Integer 8 is out of range");
        this.value = value;
    }

}

export class UnsignedInteger16Expr implements Expr {

    public value: number;

    constructor(value: number) {
        if (!(value <= 65_535 && value >= 0)) throw new Error("Unsigned Integer 16 is out of range");
        this.value = value;
    }

}

export class UnsignedInteger32Expr implements Expr {

    public value: BigInt;

    constructor(value: BigInt) {
        if (!(value <= 4_294_967_295n && value >= 0)) throw new Error("Unsigned Integer 32 is out of range");
        this.value = value;
    }

}

export class UnsignedInteger64Expr implements Expr {

    public value: BigInt;

    static max: BigInt = 18_446_744_073_709_551_615;

    constructor(value: BigInt) {
        if (!(value <= UnsignedInteger64Expr.max && value >= 0)) throw new Error("Unsigned Integer 64 is out of range");
        this.value = value;
    }

}

export class Float32Expr implements Expr {

    public value: number;

    constructor(value: number) {
        this.value = value;
    }

}
