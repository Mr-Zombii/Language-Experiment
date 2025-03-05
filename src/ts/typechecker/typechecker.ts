import {BlockStmt, ProgramStmt, VarDeclarationStmt, VarListStmt, IfStmt, IfElseStmt} from "../parse/ast/ast_stmt";
import {ASTNode} from "../parse/ast/ast_node_types";
import {Expr, CastExpr, IntegerExpr, IdentifierExpr, FloatExpr, EqualityExpr, RelationalExpr} from "../parse/ast/ast_expr";
import {Stmt} from "../parse/ast/ast_stmt";
import {Type} from "../parse/ast/ast_types";
import {TokenType} from "../lex/token_type";

class Enviornment {

    public types: Map<String, Type> = new Map();

    public parent: Enviornment;

    constructor(parent: Enviornment = null as unknown as Enviornment) {
        this.parent = parent;

        this.types.set("true", new Type(TokenType.T_INT_8, "i8"))
        this.types.set("false", new Type(TokenType.T_INT_8, "i8"))
    }

    public addType(name: string, type: Type) {
        if (this.hasType(name))
            throw Error(`variable/type ${name} is already assigned`);

        this.types.set(name, type);
    }

    public hasType(name: string): boolean {
        if (this.parent != null) {
            return this.parent.hasType(name);
        }
        return this.types.has(name);
    }

    public getType(name: string): Type {
        if (this.parent != null) {
            return this.parent.getType(name) as unknown as Type;
        }
        return this.types.get(name) as unknown as Type;
    }

}

export default class TypeChecker {

    public ast: ProgramStmt;

    constructor(ast: ProgramStmt) {
        this.ast = ast;
    }

    public process() {
        this.traverse(new Enviornment(), this.ast);
    }

    public traverse(env: Enviornment, thing: Stmt) {
        switch (thing.kind) {
            case "package":
                return;
            case "program":
                for(let i = 0; i < (<ProgramStmt>thing).stmts.length; i++) {
                    this.traverse(env, ((<ProgramStmt>thing).stmts)[i]);
                }
                break;
            case "block":
                for(let i = 0; i < (<BlockStmt>thing).stmts.length; i++) {
                    this.traverse(env, ((<BlockStmt>thing).stmts)[i]);
                }
                break;
            case "varstmt":
                const declaredType: Type = (<VarDeclarationStmt>thing).type;

                const name: string = (<VarDeclarationStmt>thing).name;
                const value: Expr = (<VarDeclarationStmt>thing).value;

                const impliedType: Type = this.traverseExpr(env, value);
                if (!(declaredType.is(impliedType) || declaredType.canCast(impliedType)))
                    throw Error(`type on variable "${name}"-{${declaredType.signature}} does not match type on value-{${impliedType.signature}}.`);

                env.addType(name, declaredType);
                return

            case "if":
                const impliedType2: Type = this.traverseExpr(env, (<IfStmt>thing).condition);

                if (!IntegerExpr.I64_TYPE.canCast(impliedType2))
                    throw Error(`condition on if stmt must return an i64 or i64 castable.`);

                this.traverse(new Enviornment(env), (<IfElseStmt>thing).thenBlock)
                return

            case "if_else":
                const impliedType3: Type = this.traverseExpr(env, (<IfElseStmt>thing).condition);

                if (!IntegerExpr.I64_TYPE.canCast(impliedType3))
                    throw Error(`condition on if stmt must return an i64 or i64 castable.`);

                this.traverse(new Enviornment(env), (<IfElseStmt>thing).thenBlock)
                this.traverse(new Enviornment(env), (<IfElseStmt>thing).elseBlock)
                return

            default:
                throw Error(`i do not reconize stmt_node of kind "${thing.kind}"`);
        }
    }

    public traverseExpr(env: Enviornment, thing: Expr): Type {
        switch (thing.kind) {
            case "int_expr":
                if ((<IntegerExpr>thing).isI8()) return new Type(TokenType.T_INT_8, "i8");
                if ((<IntegerExpr>thing).isI16()) return new Type(TokenType.T_INT_16, "i16");
                if ((<IntegerExpr>thing).isI32()) return new Type(TokenType.T_INT_32, "i32");
                if ((<IntegerExpr>thing).isI64()) return new Type(TokenType.T_INT_64, "i64");

                if ((<IntegerExpr>thing).isU8()) return new Type(TokenType.T_INT_8, "u8");
                if ((<IntegerExpr>thing).isU16()) return new Type(TokenType.T_INT_16, "u16");
                if ((<IntegerExpr>thing).isU32()) return new Type(TokenType.T_INT_32, "u32");
                return new Type(TokenType.T_INT_64, "u64");

            case "relational_expr":
                const impliedTypeR: Type = this.traverseExpr(env, (<RelationalExpr>thing).right);
                const impliedTypeL: Type = this.traverseExpr(env, (<RelationalExpr>thing).left);
                if (!IntegerExpr.I64_TYPE.canCast(impliedTypeR)) throw Error(`right side of relational expr must be a decendent of type i64`)
                if (!IntegerExpr.I64_TYPE.canCast(impliedTypeL)) throw Error(`left side of relational expr must be a decendent of type i64`)

                return new Type(TokenType.T_INT_8, "i8");

            case "equality_expr":
                const impliedTypeR0: Type = this.traverseExpr(env, (<EqualityExpr>thing).right);
                const impliedTypeL0: Type = this.traverseExpr(env, (<EqualityExpr>thing).left);
                if (!IntegerExpr.I64_TYPE.canCast(impliedTypeR0)) throw Error(`right side of equality expr must be a decendent of type i64`)
                if (!IntegerExpr.I64_TYPE.canCast(impliedTypeL0)) throw Error(`left side of equality expr must be a decendent of type i64`)

                return new Type(TokenType.T_INT_8, "i8");

            case "identifier_expr":
                const id_type = env.getType((<IdentifierExpr>thing).name);
                if (id_type == null || id_type == undefined) {
                    throw Error(`variable ${(<IdentifierExpr>thing).name} is unassigned or not declared`);
                }
                return env.getType((<IdentifierExpr>thing).name)

            case "cast_expr":
                const impliedType: Type = this.traverseExpr(env, (<CastExpr>thing).expr);
                if (!(<CastExpr>thing).outType.canCast(impliedType)) throw Error(`Cannot cast ${impliedType.signature} to ${(<CastExpr>thing).outType.signature}`)

                return (<CastExpr>thing).outType;
            default:
                throw Error(`i do not reconize expr_node of kind "${thing.kind}"`);
        }
    }

}