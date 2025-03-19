import {
    BlockStmt, ExprStmt, ForStmt,
    FunctionDeclarationStmt,
    IfElseStmt,
    IfStmt,
    ProgramStmt,
    Stmt,
    StructStmt,
    VarDeclarationStmt
} from "../parse/ast/ast_stmt";
import {
    AssignmentExpr,
    CastExpr,
    EqualityExpr,
    Expr,
    IdentifierExpr,
    IntegerExpr,
    NewInstanceExpr,
    RelationalExpr
} from "../parse/ast/ast_expr";
import {Type} from "../parse/ast/ast_types";
import {TokenType} from "../lex/token_type";
import {Pair} from "../util";

class Enviornment {

    public variable_types: Map<String, Pair<Type, boolean>> = new Map();
    public classlike_types: Map<String, Type[][]> = new Map();

    public parent: Enviornment;

    constructor(parent: Enviornment = null as unknown as Enviornment) {
        this.parent = parent;

        this.variable_types.set("true", new Pair(new Type(TokenType.T_INT_8, "i8"), true));
        this.variable_types.set("false", new Pair(new Type(TokenType.T_INT_8, "i8"), true));
    }

    public addClasslikeType(name: string, types: Type[][]) {
        if (this.hasType(name))
            throw Error(`type ${name} was declared 2+ times.`);

        this.classlike_types.set(name, types);
    }

    public hasClasslikeType(name: string): boolean {
        if (this.parent != null && !this.classlike_types.has(name)) {
            return this.parent.hasClasslikeType(name);
        }
        return this.classlike_types.has(name);
    }

    public getClasslikeType(name: string): Type[][] {
        if (this.parent != null && !this.classlike_types.has(name)) {
            return this.parent.getClasslikeType(name) as unknown as Type[][];
        }
        return this.classlike_types.get(name) as unknown as Type[][];
    }

    public addType(name: string, type: Type, isConst: boolean) {
        if (this.hasType(name))
            throw Error(`variable/type ${name} is already assigned`);

        this.variable_types.set(name, new Pair(type, isConst));
    }

    public hasType(name: string): boolean {
        if (this.parent != null && !this.variable_types.has(name)) {
            return this.parent.hasType(name);
        }
        return this.variable_types.has(name);
    }

    public isConstType(name: string): boolean {
        if (this.parent != null && !this.variable_types.has(name)) {
            return this.parent.isConstType(name);
        }
        return <boolean>this.variable_types.get(name)?.b;
    }

    public getType(name: string): Type {
        if (this.parent != null && !this.variable_types.has(name)) {
            return this.parent.getType(name) as unknown as Type;
        }
        return this.variable_types.get(name)?.a as unknown as Type;
    }

    public checkConstructor(cons: string, args: Type[]): boolean {
        const constructors: Type[][] = this.getClasslikeType(cons);
        for (const constructor of constructors) {
            if (this.checkConstruct(constructor, args)) return true;
        }

        return false;
    }

    private checkConstruct(constructor: Type[], args: Type[]) {
        if (args.length != constructor.length) return false;

        for (let i = 0; i < constructor.length; i++) {
            if (!constructor[i].canCast(args[i])) return false;
        }

        return true;
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
            case "package": return;
            case "struct":
                const strct = <StructStmt>thing;

                env.addClasslikeType(strct.signature, [this.createTypeArrayStrct(strct.values)]);
                break;
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
            case "for":
                const forStmt: ForStmt = <ForStmt>thing;
                const forEnv: Enviornment = new Enviornment(env);

                this.traverse(forEnv, forStmt.init)
                const condT: Type = this.traverseExpr(forEnv, forStmt.condition)
                this.traverseExpr(forEnv, forStmt.after)
                if (!IntegerExpr.I64_TYPE.canCast(condT)) {
                    throw new Error(`for loop condition must output type of i64 or lower, not "${condT.signature}"`);
                }
                this.traverse(forEnv, forStmt.block)
                break
            case "varstmt":
                const declaredType: Type = (<VarDeclarationStmt>thing).type;

                const name: string = (<VarDeclarationStmt>thing).name;
                env.addType(name, declaredType, (<VarDeclarationStmt>thing).isConstant);

                if ((<VarDeclarationStmt>thing).value == null) break;

                const value: Expr = (<VarDeclarationStmt>thing).value;

                const impliedType: Type = this.traverseExpr(env, value);
                if (!(declaredType.is(impliedType) || declaredType.canCast(impliedType)))
                    throw Error(`type on variable "${name}"-{${declaredType.signature}} does not match type on value-{${impliedType.signature}}.`);

                break
            case "exprstmt":
                this.traverseExpr(env, (<ExprStmt>thing).expr);
                break
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
                break

            case "function":
                const funcStmt: FunctionDeclarationStmt = <FunctionDeclarationStmt>thing;
                const fEnv: Enviornment = new Enviornment(env);
                for (const vr of funcStmt.params) {
                    fEnv.addType(vr.b, vr.a, false);
                }
                this.traverse(fEnv, funcStmt.block);
                break

            case "return":
                break

            default:
                throw Error(`i do not reconize stmt_node of kind "${thing.kind}"`);
        }
    }

    private concatTypeArray(types: Type[]) {
        let str = "(";
        for (let i = 0; i < types.length; i++) {
            const arg = types[i];
            str += arg.signature;
            if (i < types.length - 1) str += ", ";
        }
        str += ")";
        return str;
    }

    private createTypeArrayStrct(args: Pair<Type, String>[]): Type[] {
        const types: Type[] = [];
        for (const arg of args) {
            types.push(arg.a);
        }
        return types;
    }

    private createTypeArray(env: Enviornment, args: Expr[]): Type[] {
        const types: Type[] = [];
        for (const arg of args) {
            types.push(this.traverseExpr(env, arg));
        }
        return types;
    }

    public traverseExpr(env: Enviornment, thing: Expr): Type {

        switch (thing.kind) {
            case "string_expr":
                return new Type(TokenType.T_STRING, "str");

            case "int_expr":
                if ((<IntegerExpr>thing).isI8()) return new Type(TokenType.T_INT_8, "i8");
                if ((<IntegerExpr>thing).isI16()) return new Type(TokenType.T_INT_16, "i16");
                if ((<IntegerExpr>thing).isI32()) return new Type(TokenType.T_INT_32, "i32");
                if ((<IntegerExpr>thing).isI64()) return new Type(TokenType.T_INT_64, "i64");

                if ((<IntegerExpr>thing).isU8()) return new Type(TokenType.T_INT_8, "u8");
                if ((<IntegerExpr>thing).isU16()) return new Type(TokenType.T_INT_16, "u16");
                if ((<IntegerExpr>thing).isU32()) return new Type(TokenType.T_INT_32, "u32");
                return new Type(TokenType.T_INT_64, "u64");

            case "additive_expr":
                const impliedTypeR1: Type = this.traverseExpr(env, (<EqualityExpr>thing).right);
                const impliedTypeL1: Type = this.traverseExpr(env, (<EqualityExpr>thing).left);
                if (!IntegerExpr.I64_TYPE.canCast(impliedTypeR1)) throw Error(`The right side of additive expr must be a decendent of type i64`)
                if (!IntegerExpr.I64_TYPE.canCast(impliedTypeL1)) throw Error(`The left side of additive expr must be a decendent of type i64`)

                if (impliedTypeR1.canCast(impliedTypeL1))
                    return impliedTypeR1

                return impliedTypeL1

            case "multiplicative_expr":
                const impliedTypeR2: Type = this.traverseExpr(env, (<EqualityExpr>thing).right);
                const impliedTypeL2: Type = this.traverseExpr(env, (<EqualityExpr>thing).left);
                if (!IntegerExpr.I64_TYPE.canCast(impliedTypeR2)) throw Error(`The right side of multiplicative expr must be a decendent of type i64`)
                if (!IntegerExpr.I64_TYPE.canCast(impliedTypeL2)) throw Error(`The left side of multiplicative expr must be a decendent of type i64`)

                if (impliedTypeR2.canCast(impliedTypeL2))
                    return impliedTypeR2

                return impliedTypeL2

            case "assignment_expr":
                const assignExpr: AssignmentExpr = <AssignmentExpr>thing;
                const leftType: Type = this.traverseExpr(env, assignExpr.left);
                const rightType: Type = this.traverseExpr(env, assignExpr.right);

                if (env.isConstType((<IdentifierExpr>assignExpr.left).name)) {
                    throw Error(`Cannot reassign a variable because the variable "${(<IdentifierExpr>assignExpr.left).name}" is "constant".`);
                }

                if (!leftType.canCast(rightType)) {
                    throw Error(`The right side of variable assignment's type must be the same or related to the left side type.`);
                }

                return leftType;

            case "relational_expr":
                const impliedTypeR: Type = this.traverseExpr(env, (<RelationalExpr>thing).right);
                const impliedTypeL: Type = this.traverseExpr(env, (<RelationalExpr>thing).left);
                if (!IntegerExpr.I64_TYPE.canCast(impliedTypeR)) throw Error(`The right side of relational expr must be a decendent of type i64`)
                if (!IntegerExpr.I64_TYPE.canCast(impliedTypeL)) throw Error(`The left side of relational expr must be a decendent of type i64`)

                return new Type(TokenType.T_INT_8, "i8");

            case "equality_expr":
                const impliedTypeR0: Type = this.traverseExpr(env, (<EqualityExpr>thing).right);
                const impliedTypeL0: Type = this.traverseExpr(env, (<EqualityExpr>thing).left);
                if (!IntegerExpr.I64_TYPE.canCast(impliedTypeR0)) throw Error(`The right side of equality expr must be a decendent of type i64`)
                if (!IntegerExpr.I64_TYPE.canCast(impliedTypeL0)) throw Error(`The left side of equality expr must be a decendent of type i64`)

                return new Type(TokenType.T_INT_8, "i8");

            case "new_instance_expr":
                const newInst: NewInstanceExpr = <NewInstanceExpr>thing;
                const inst_type = (<NewInstanceExpr>thing).type;
                const typeArr: Type[] = this.createTypeArray(env, (<NewInstanceExpr>thing).args);

                const res: boolean = env.checkConstructor(newInst.type.signature, typeArr);
                if (!res) {
                    throw Error(`there are no constructors for type "${newInst.type.signature}" that take types ${this.concatTypeArray(typeArr)}`)
                }
                return inst_type;

            case "identifier_expr":
                if (!env.hasType((<IdentifierExpr>thing).name)) {
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