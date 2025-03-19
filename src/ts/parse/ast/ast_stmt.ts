import {Expr} from "./ast_expr";
import {Type} from "./ast_types";
import {Pair} from "../../util";
import {ASTNode} from "./ast_node_types";

export class Stmt extends ASTNode {}

export class ExprStmt extends Stmt {
    public expr: Expr;

    constructor(expr: Expr) {
        super("exprstmt")
        this.expr = expr;
    }

}

export class PackageStmt extends Stmt {
    public pkg: string;

    constructor(pkg: string) {
        super("package")
        this.pkg = pkg;
    }

}

export class ImportStmt extends Stmt {

    public pkg: string;
    public obj: string;
    public isType: boolean;

    constructor(pkg: string, obj: string, isType: boolean) {
        super("import")
        this.pkg = pkg;
        this.obj = obj;
        this.isType = isType;
    }

}

export class IfStmt extends Stmt {

    public condition: Expr
    public thenBlock: Stmt;

    constructor(condition: Expr, thenBlock: Stmt) {
        super("if")
        this.condition = condition;
        this.thenBlock = thenBlock;
    }

}

export class IfElseStmt extends Stmt {

    public condition: Expr
    public thenBlock: Stmt;
    public elseBlock: Stmt;

    constructor(condition: Expr, thenBlock: Stmt, elseBlock: Stmt) {
        super("if_else")
        this.condition = condition;
        this.thenBlock = thenBlock;
        this.elseBlock = elseBlock;
    }

}


export class NativeFunctionStmt extends Stmt {

    public type: Type;
    public name: string;
    public params: Pair<Type, String>[];

    constructor(name: string, params: Pair<Type, String>[], type: Type) {
        super("native_function")
        this.name = name;
        this.params = params;
        this.type = type;
    }

}

export class ProgramStmt extends Stmt {
    public stmts: Stmt[];
    public pkg: PackageStmt;

    constructor(pkg: PackageStmt, stmts: Stmt[]) {
        super("program")
        this.stmts = stmts;
        this.pkg = pkg;
    }

}

export class BlockStmt extends Stmt {
    public stmts: Stmt[];

    constructor(stmts: Stmt[]) {
        super("block")
        this.stmts = stmts;
    }

}

export class WhileStmt extends Stmt {
    public block: BlockStmt;
    public condition: Expr;

    constructor(condition: Expr, block: BlockStmt) {
        super("while")
        this.block = block;
        this.condition = condition;
    }

}

export class ForStmt extends Stmt {
    public block: BlockStmt;
    public init: VarDeclarationStmt;
    public condition: Expr;
    public after: Expr;

    constructor(init: VarDeclarationStmt, condition: Expr, after: Expr, block: BlockStmt) {
        super("for")
        this.init = init;
        this.block = block;
        this.after = after;
        this.condition = condition;
    }

}

export class VarDeclarationStmt extends Stmt {
    public type: Type;
    public name: string;
    public isConstant: boolean;
    public value: Expr;

    constructor(type: Type, name: string, isConstant: boolean, value: Expr) {
        super("varstmt")
        this.type = type;
        this.name = name;
        this.isConstant = isConstant;
        this.value = value;
    }

}

export class VarListStmt extends Stmt {
    public type: Type;
    public names: string[];
    public isConstant: boolean;
    public value: Expr;

    constructor(type: Type, names: string[], isConstant: boolean, value: Expr) {
        super("varlist")
        this.type = type;
        this.names = names;
        this.isConstant = isConstant;
        this.value = value;
    }

}

export class FunctionDeclarationStmt extends Stmt {
    public type: Type;
    public name: string;
    public params: Pair<Type, string>[];
    public block: BlockStmt;

    constructor(name: string, params: Pair<Type, string>[], type: Type, block: BlockStmt) {
        super("function")
        this.name = name;
        this.params = params;
        this.type = type;
        this.block = block;
    }

}

export class ReturnStmt extends Stmt {

    public value: Expr;

    constructor(value: Expr) {
        super("return")
        this.value = value;
    }

}

export class EnumStmt extends Stmt {

    public name: string;
    public values: string[];

    constructor(name: string, values: string[]) {
        super("enum")
        this.name = name;
        this.values = values;
    }

}

export class StructStmt extends Stmt {

    public name: string;
    public signature: string;
    public values: Pair<Type, String>[];

    constructor(name: string, signature: string, values: Pair<Type, String>[]) {
        super("struct")
        this.name = name;
        this.values = values;
        this.signature = signature;
    }

}