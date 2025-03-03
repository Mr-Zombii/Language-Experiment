import {Expr} from "./ast_expr";
import {Type} from "./ast_types";
import {Pair} from "../../util";

type StmtKind = "exprstmt" | "package" | "import" | "native_function" | "function" | "block" | "varlist" | "varstmt" | "struct" | "enum" | "return" | "program"

export class Stmt {

    public kind: StmtKind

    constructor(kind: StmtKind) {
        this.kind = kind;
    }

}

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
    public params: Pair<Type, String>[];
    public block: BlockStmt;

    constructor(name: string, params: Pair<Type, String>[], type: Type, block: BlockStmt) {
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
    public values: Pair<Type, String>[];

    constructor(name: string, values: Pair<Type, String>[]) {
        super("struct")
        this.name = name;
        this.values = values;
    }

}