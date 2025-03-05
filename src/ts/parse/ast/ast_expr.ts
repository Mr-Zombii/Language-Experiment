import {Type} from "./ast_types";
import {TokenType} from "../../lex/token_type";
import {ASTNode} from "./ast_node_types";

export class Expr extends ASTNode {}

export class NewInstanceExpr extends Expr {

    public type: Type;
    public args: Expr[];

    constructor(type: Type, args: Expr[]) {
        super("new_instance_expr");
        this.type = type;
        this.args = args;
    }

}

export class AssignmentExpr extends Expr {

    public op: TokenType;
    public left: Expr;
    public right: Expr;

    constructor(op: TokenType, left: Expr, right: Expr) {
        super("assignment_expr");
        this.op = op;
        this.left = left;
        this.right = right;
    }

}

export class EqualityExpr extends Expr {

    public op: TokenType;
    public left: Expr;
    public right: Expr;

    constructor(op: TokenType, left: Expr, right: Expr) {
        super("equality_expr");
        this.op = op;
        this.left = left;
        this.right = right;
    }

}

export class RelationalExpr extends Expr {

    public op: TokenType;
    public left: Expr;
    public right: Expr;

    constructor(op: TokenType, left: Expr, right: Expr) {
        super("relational_expr");
        this.op = op;
        this.left = left;
        this.right = right;
    }

}

export class AdditiveExpr extends Expr {

    public op: TokenType;
    public left: Expr;
    public right: Expr;

    constructor(op: TokenType, left: Expr, right: Expr) {
        super("additive_expr");
        this.op = op;
        this.left = left;
        this.right = right;
    }

}

export class MultiplicativeExpr extends Expr {

    public op: TokenType;
    public left: Expr;
    public right: Expr;

    constructor(op: TokenType, left: Expr, right: Expr) {
        super("multiplicative_expr");
        this.op = op;
        this.left = left;
        this.right = right;
    }

}

export class ExponentialExpr extends Expr {

    public op: TokenType;
    public left: Expr;
    public right: Expr;

    constructor(op: TokenType, left: Expr, right: Expr) {
        super("exponential_expr");
        this.op = op;
        this.left = left;
        this.right = right;
    }

}

export class MemberExpr extends Expr {

    public obj: Expr;
    public property: Expr;

    constructor(obj: Expr, property: Expr) {
        super("member_expr");
        this.obj = obj;
        this.property = property;
    }

}

export class CallExpr extends Expr {

    public caller: Expr;
    public args: Expr[];

    constructor(caller: Expr, args: Expr[]) {
        super("call_expr");
        this.caller = caller;
        this.args = args;
    }

}

export class IdentifierExpr extends Expr {
    public name: string;

    constructor(name: string) {
        super("identifier_expr");
        this.name = name;
    }

}

export class StringExpr extends Expr {

    public value: string;

    constructor(value: string) {
        super("string_expr");
        this.value = value;
    }

}

export class IntegerExpr extends Expr {

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
        super("int_expr");
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

    public static I8_TYPE = new Type(TokenType.T_INT_8, "i8")
    public static I16_TYPE = new Type(TokenType.T_INT_16, "i16")
    public static I32_TYPE = new Type(TokenType.T_INT_32, "i32")
    public static I64_TYPE = new Type(TokenType.T_INT_64, "i64")

}

export class FloatExpr extends Expr {

    public value: number;

    constructor(value: number) {
        super("float_expr");
        this.value = value;
    }

}

export class CastExpr extends Expr {

    public expr: Expr;
    public outType: Type;

    constructor(expr: Expr, outType: Type) {
        super("cast_expr");
        this.expr = expr;
        this.outType = outType;
    }
}
