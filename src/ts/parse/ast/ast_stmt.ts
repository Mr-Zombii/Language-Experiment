import {Expr} from "./ast_expr";
import {Type} from "./ast_types";
import {Pair} from "../../util";

export interface Stmt {}

export class ExprStmt implements Stmt {
    public expr: Expr;

    constructor(expr: Expr) {
        this.expr = expr;
    }

}

export class BlockStmt implements Stmt {
    public stmts: Stmt[];

    constructor(stmts: Stmt[]) {
        this.stmts = stmts;
    }

}

export class VarDeclarationStmt implements Stmt {
    public type: Type;
    public name: string;
    public isConstant: boolean;
    public value: Expr;

    constructor(type: Type, name: string, isConstant: boolean, value: Expr) {
        this.type = type;
        this.name = name;
        this.isConstant = isConstant;
        this.value = value;
    }

}

export class VarListStmt implements Stmt {
    public type: Type;
    public names: string[];
    public isConstant: boolean;
    public value: Expr;

    constructor(type: Type, names: string[], isConstant: boolean, value: Expr) {
        this.type = type;
        this.names = names;
        this.isConstant = isConstant;
        this.value = value;
    }

}

export class FunctionDeclarationStmt implements Stmt {
    public type: Type;
    public name: string;
    public params: Pair<String, Type>[];
    public block: BlockStmt;

    constructor(name: string, params: Pair<String, Type>[], type: Type, block: BlockStmt) {
        this.name = name;
        this.params = params;
        this.type = type;
        this.block = block;
    }

}

export class ReturnStmt implements Stmt {

    public value: Expr;

    constructor(value: Expr) {
        this.value = value;
    }

}