import {Token} from "../lex/token";
import {
    BlockStmt,
    EnumStmt,
    ExprStmt,
    ForStmt,
    FunctionDeclarationStmt,
    IfElseStmt,
    IfStmt,
    ImportStmt,
    NativeFunctionStmt,
    PackageStmt,
    ProgramStmt,
    ReturnStmt,
    Stmt,
    StructStmt,
    VarDeclarationStmt,
    VarListStmt,
    WhileStmt
} from "./ast/ast_stmt";
import {TokenType} from "../lex/token_type";
import {ArrayType, ClassLikeType, PairType, Type} from "./ast/ast_types";
import {
    AdditiveExpr,
    AssignmentExpr,
    CallExpr,
    CastExpr,
    EqualityExpr,
    ExponentialExpr,
    Expr,
    FloatExpr,
    IdentifierExpr,
    IntegerExpr,
    MemberExpr,
    MultiplicativeExpr,
    NewInstanceExpr,
    RelationalExpr,
    StringExpr,
} from "./ast/ast_expr";
import {Pair} from "../util";

export default class Parser {

    private tokens: Token[];
    private ptr: number;
    private validTypes: string[];
    private validTypeSignature: string[];
    private pkg: PackageStmt;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.ptr = 0;
        this.validTypes = [];
        this.validTypeSignature = [];
        this.pkg = null as unknown as PackageStmt;
    }

    private isEOF(): boolean {
        return this.ptr >= this.tokens.length || this.tokens[this.ptr].type == TokenType.EOF;
    }

    private token(): Token {
        return this.tokens[this.ptr];
    }

    private consume(): Token {
        return this.tokens[this.ptr++];
    }

    private expect(type: TokenType, msg: string = ""): Token {
        const tok: Token = this.consume();
        if (tok.type !== type) {
            if (msg != "")
                throw new Error(`Experienced an exception on line: #${tok.line} column: #${tok.column}, ` + msg);
            else
                throw new Error(`Expected token type \"${type}\" not token "${tok.value}" type: "${tok.type}" line: #${tok.line} column: #${tok.column}`);
        }
        return tok
    }

    private peek(peekIndex: number = 1): Token {
        return this.tokens[this.ptr + peekIndex]
    }

    private past(pastIndex: number = 1): Token {
        return this.tokens[this.ptr - pastIndex]
    }

    public parse(): ProgramStmt {
        const stmts: Stmt[] = [];

        stmts.push(this.pkg = this.parsePackage())

        while(!this.isEOF()) {
            stmts.push(this.parseTopLevelStmt());
        }

        return new ProgramStmt(this.pkg, stmts);
    }

    private parseBlock() {
        const stmts: Stmt[] = [];

        this.expect(TokenType.O_BRACE);
        while(!this.isEOF() && this.token().type != TokenType.C_BRACE) {
            stmts.push(this.parseStmt())
        }

        this.expect(TokenType.C_BRACE);
        return new BlockStmt(stmts);
    }

    private parseParams(): Pair<Type, string>[] {
        this.expect(TokenType.O_PAREN);
        if (this.token().type == TokenType.C_PAREN) {
            this.expect(TokenType.C_PAREN);
            return [];
        }

        const params: Pair<Type, string>[] = [];

        let type = this.parseType();
        let name = this.expect(TokenType.IDENTIFIER).value;

        params.push(new Pair<Type, string>(type, name));


        while(this.token().type == TokenType.COMMA) {
            this.expect(TokenType.COMMA);
            type = this.parseType();
            name = this.expect(TokenType.IDENTIFIER).value;

            params.push(new Pair<Type, string>(type, name));
        }

        this.expect(TokenType.C_PAREN);
        return params;
    }

    private parseTopLevelStmt(): Stmt {
        switch (this.token().type) {

            case TokenType.NATIVE:
                return this.parseNativeFunction();

            case TokenType.FUNCTION:
                return this.parseFunction();

            case TokenType.IMPORT:
                return this.parseImport();

            case TokenType.RETURN:
                throw new Error(`Return cannot be on top-level | line: #${this.token().line}, column: #${this.token().column}`);

            case TokenType.STRUCT:
                return this.parseStruct();

            case TokenType.ENUM:
                return this.parseEnum();

            default:
                return this.parseStmt();
        }
    }

    private parsePackage(): PackageStmt {
        this.expect(TokenType.PACKAGE);
        let pkg: string = "";
        while(!this.isEOF() && this.token().type != TokenType.SEMI_COLON) {
            pkg += this.expect(TokenType.IDENTIFIER).value;
            if (this.token().type == TokenType.PERIOD) {
                this.expect(TokenType.PERIOD);
                pkg += ".";
            }
        }
        this.expect(TokenType.SEMI_COLON);
        return new PackageStmt(pkg);
    }

    private parseImport(): Stmt {
        this.expect(TokenType.IMPORT);

        let pkg: string = "";
        while(!this.isEOF() && this.token().type != TokenType.COLON && this.token().type != TokenType.HASH) {
            pkg += this.expect(TokenType.IDENTIFIER).value;
            if (this.token().type == TokenType.PERIOD) {
                this.expect(TokenType.PERIOD);
                pkg += ".";
            }
        }
        let isType: boolean;
        if (this.token().type == TokenType.HASH) {
            this.expect(TokenType.HASH);
            isType = true;
        } else {
            this.expect(TokenType.COLON);
            isType = false;
        }
        const thing: string = this.expect(TokenType.IDENTIFIER).value;
        if (isType) {
            this.validTypes.push(thing);
            this.validTypeSignature.push(pkg + "#" + thing)
        }
        this.expect(TokenType.SEMI_COLON);

        return new ImportStmt(pkg, thing, isType);
    }

    private parseStmt(): Stmt {
        switch (this.token().type) {

            // Signed integer types
            case TokenType.T_INT_8:
            case TokenType.T_INT_16:
            case TokenType.T_INT_32:
            case TokenType.T_INT_64:

            // Unsigned integer types
            case TokenType.T_UINT_8:
            case TokenType.T_UINT_16:
            case TokenType.T_UINT_32:
            case TokenType.T_UINT_64:

            // Floating point types
            case TokenType.T_FLOAT_16:
            case TokenType.T_FLOAT_32:
            case TokenType.T_FLOAT_64:

            // Float vector types
            case TokenType.VEC2F:
            case TokenType.VEC3F:
            case TokenType.VEC4F:
            case TokenType.VEC5F:
            case TokenType.VEC6F:

            // Integer vector types
            case TokenType.VEC2I:
            case TokenType.VEC3I:
            case TokenType.VEC4I:
            case TokenType.VEC5I:
            case TokenType.VEC6I:

            // Float matrix types
            case TokenType.MAT2F:
            case TokenType.MAT3F:
            case TokenType.MAT4F:
            case TokenType.MAT5F:
            case TokenType.MAT6F:

            // Integer matrix types
            case TokenType.MAT2I:
            case TokenType.MAT3I:
            case TokenType.MAT4I:
            case TokenType.MAT5I:
            case TokenType.MAT6I:

            // Void, Array, Pair, String
            case TokenType.VOID:
            case TokenType.PAIR:
            case TokenType.ARRAY:
            case TokenType.T_STRING:
                return this.parseTypeVar();

            case TokenType.IF:
                return this.parseIfElse();

            // Identifier - Potential Type
            case TokenType.IDENTIFIER:
                let i = this.ptr;
                try {
                    return this.parseTypeVar()
                } catch (e) {
                    this.ptr = i;
                    const expr = new ExprStmt(this.parseExpression());
                    this.expect(TokenType.SEMI_COLON);
                    return expr;
                }

            case TokenType.CONST:
                this.expect(TokenType.CONST);
                return this.parseTypeVar(true)

            case TokenType.RETURN:
                this.expect(TokenType.RETURN);
                const retExpr: Expr = this.parseExpression();
                this.expect(TokenType.SEMI_COLON);
                return new ReturnStmt(retExpr);

            case TokenType.IMPORT:
                throw new Error(`Imports can only be made on the top-level of a program | line: #${this.token().line}, column: #${this.token().column}`);

            case TokenType.NATIVE:
                throw new Error(`Native-Functions can only be made on the top-level of a program | line: #${this.token().line}, column: #${this.token().column}`);

            case TokenType.FUNCTION:
                throw new Error(`Functions can only be made on the top-level of a program | line: #${this.token().line}, column: #${this.token().column}`);

            case TokenType.STRUCT:
                throw new Error(`Structs can only be made on the top-level of a program | line: #${this.token().line}, column: #${this.token().column}`);

            case TokenType.ENUM:
                throw new Error(`Enums can only be made on the top-level of a program | line: #${this.token().line}, column: #${this.token().column}`);

            case TokenType.WHILE:
                return this.parseWhile();

            case TokenType.FOR:
                return this.parseFor();

            default:
                const expr = new ExprStmt(this.parseExpression());
                this.expect(TokenType.SEMI_COLON);
                return expr;
        }
    }

    private parseType(): Type {
        const tok: Token = this.consume();
        let type: Type = null as unknown as Type;

        switch (tok.type) {

            // Signed integer types
            case TokenType.T_INT_8:
                type = new Type(tok.type, "i8");
                break;
            case TokenType.T_INT_16:
                type = new Type(tok.type, "i16");
                break;
            case TokenType.T_INT_32:
                type = new Type(tok.type, "i32");
                break;
            case TokenType.T_INT_64:
                type = new Type(tok.type, "i64");
                break;

            // Unsigned integer types
            case TokenType.T_UINT_8:
                type = new Type(tok.type, "u8");
                break;
            case TokenType.T_UINT_16:
                type = new Type(tok.type, "u16");
                break;
            case TokenType.T_UINT_32:
                type = new Type(tok.type, "u32");
                break;
            case TokenType.T_UINT_64:
                type = new Type(tok.type, "u64");
                break;

            // Floating point types
            case TokenType.T_FLOAT_16:
                type = new Type(tok.type, "f16");
                break;
            case TokenType.T_FLOAT_32:
                type = new Type(tok.type, "f32");
                break;
            case TokenType.T_FLOAT_64:
                type = new Type(tok.type, "f64");
                break;

            // Float vector types
            case TokenType.VEC2F:
                type = new Type(tok.type, "v2i");
                break;
            case TokenType.VEC3F:
                type = new Type(tok.type, "v3i");
                break;
            case TokenType.VEC4F:
                type = new Type(tok.type, "v4i");
                break;
            case TokenType.VEC5F:
                type = new Type(tok.type, "v5i");
                break;
            case TokenType.VEC6F:
                type = new Type(tok.type, "v6f");
                break;

            // Integer vector types
            case TokenType.VEC2I:
                type = new Type(tok.type, "v2i");
                break;
            case TokenType.VEC3I:
                type = new Type(tok.type, "v3i");
                break;
            case TokenType.VEC4I:
                type = new Type(tok.type, "v4i");
                break;
            case TokenType.VEC5I:
                type = new Type(tok.type, "v5i");
                break;
            case TokenType.VEC6I:
                type = new Type(tok.type, "v6i");
                break;

            // Float matrix types
            case TokenType.MAT2F:
                type = new Type(tok.type, "m6f");
                break;
            case TokenType.MAT3F:
                type = new Type(tok.type, "m6f");
                break;
            case TokenType.MAT4F:
                type = new Type(tok.type, "m6f");
                break;
            case TokenType.MAT5F:
                type = new Type(tok.type, "m6f");
                break;
            case TokenType.MAT6F:
                type = new Type(tok.type, "m6f");
                break;

            // Integer matrix types
            case TokenType.MAT2I:
                type = new Type(tok.type, "m2i");
                break;
            case TokenType.MAT3I:
                type = new Type(tok.type, "m3i");
                break;
            case TokenType.MAT4I:
                type = new Type(tok.type, "m4i");
                break;
            case TokenType.MAT5I:
                type = new Type(tok.type, "m5i");
                break;
            case TokenType.MAT6I:
                type = new Type(tok.type, "m6i");
                break;

            // String
            case TokenType.T_STRING:
                type = new Type(tok.type, "str");
                break;

            // Void
            case TokenType.VOID:
                type = new Type(tok.type, "V");
                break

            // Array
            case TokenType.ARRAY:
                this.expect(TokenType.LESS_THAN);
                type = this.parseType();
                this.expect(TokenType.GREATER_THAN);
                type = new ArrayType(tok.type, type);
                break

            // Pair
            case TokenType.PAIR:
                this.expect(TokenType.LESS_THAN);
                const typeA: Type = this.parseType();
                this.expect(TokenType.COMMA);
                const typeB: Type = this.parseType();
                this.expect(TokenType.GREATER_THAN);
                type = new PairType(tok.type, typeA, typeB);
                break

            // Identifier - Potential Type
            case TokenType.IDENTIFIER:
                if (this.validTypes.includes(tok.value)) {
                    if (this.token().type == TokenType.LESS_THAN) {
                        this.expect(TokenType.LESS_THAN);
                        const genericsTypes: Type[] = [];
                        if (this.token().type != TokenType.GREATER_THAN) {
                            genericsTypes.push(this.parseType());
                        }
                        while (this.token().type == TokenType.COMMA) {
                            this.expect(TokenType.COMMA);
                            genericsTypes.push(this.parseType());
                        }
                        this.expect(TokenType.GREATER_THAN);
                        type = new ClassLikeType(tok.type, "L" + this.validTypeSignature[this.validTypes.indexOf(tok.value)], genericsTypes);
                    } else {
                        type = new Type(tok.type, "L" + this.validTypeSignature[this.validTypes.indexOf(tok.value)])
                    }
                    break
                }
                throw new Error(`Invalid Identifier Type \"${tok.value}\"! | line: #${this.token().line}, column: #${this.token().column}`)

            default:
                throw new Error(`Invalid Data-Type: "${this.token().value}" type: #${this.token().type}! | line: #${this.token().line}, column: #${this.token().column}`);
        }

        return type;
    }

    private parseTypeVar(isConst: boolean = false, allowList: boolean = true): Stmt {
        const type: Type = this.parseType();
        const name: string = this.expect(TokenType.IDENTIFIER).value;

        if (this.token().type == TokenType.COMMA) {
            const names: string[] = [name];

            if (!allowList)
                throw new Error(`Cannot chain variable declarations here.`)

            while(this.token().type == TokenType.COMMA) {
                this.expect(TokenType.COMMA);

                names.push(this.expect(TokenType.IDENTIFIER).value);
            }

            if (this.token().type == TokenType.SEMI_COLON) {
                if (isConst) this.expect(TokenType.EOF, "Must have value assigned to constant variables!")
                this.expect(TokenType.SEMI_COLON);

                return new VarListStmt(type, names, isConst, null as unknown as Expr);
            }

            this.expect(TokenType.ASSIGN);
            const expr = this.parseExpression();
            this.expect(TokenType.SEMI_COLON);
            return new VarListStmt(type, names, isConst, expr);
        }

        if (this.token().type == TokenType.SEMI_COLON) {
            if (isConst) this.expect(TokenType.EOF, "Must have value assigned to constant variables")
            this.expect(TokenType.SEMI_COLON);

            return new VarDeclarationStmt(type, name, isConst, null as unknown as Expr);
        }

        this.expect(TokenType.ASSIGN);
        const expr = this.parseExpression();
        this.expect(TokenType.SEMI_COLON);
        return new VarDeclarationStmt(type, name, isConst, expr);
    }

    private parseIfElse(): Stmt {
        this.expect(TokenType.IF);
        this.expect(TokenType.O_PAREN);
        const condition: Expr = this.parseExpression();
        this.expect(TokenType.C_PAREN);

        const thenBlock = this.token().type == TokenType.O_BRACE ? this.parseBlock() : this.parseStmt();

        if (this.token().type != TokenType.ELSE)
            return new IfStmt(condition, thenBlock);

        this.expect(TokenType.ELSE)
        const elseBlock = this.token().type == TokenType.O_BRACE ? this.parseBlock() : this.parseStmt();

        return new IfElseStmt(condition, thenBlock, elseBlock);
    }

    private parseNativeFunction(): Stmt {
        this.expect(TokenType.NATIVE);
        this.expect(TokenType.FUNCTION);
        const name: string = this.expect(TokenType.IDENTIFIER).value;

        const params = this.parseParams();

        let type: Type = Type.VOID;
        if (this.token().type == TokenType.MINUS && this.peek().type == TokenType.GREATER_THAN) {
            this.expect(TokenType.MINUS);
            this.expect(TokenType.GREATER_THAN);
            type = this.parseType();
        }

        this.expect(TokenType.SEMI_COLON);
        return new NativeFunctionStmt(name, params, type);
    }

    private parseFunction(): Stmt {
        this.expect(TokenType.FUNCTION);
        const name: string = this.expect(TokenType.IDENTIFIER).value;

        const params = this.parseParams();

        let type: Type = Type.VOID;
        if (this.token().type == TokenType.MINUS && this.peek().type == TokenType.GREATER_THAN) {
            this.expect(TokenType.MINUS);
            this.expect(TokenType.GREATER_THAN);
            type = this.parseType();
        }

        const block: BlockStmt = this.parseBlock();
        return new FunctionDeclarationStmt(name, params, type, block);
    }

    private parseEnum(): Stmt {
        this.expect(TokenType.ENUM);
        const enumName: string = this.expect(TokenType.IDENTIFIER).value;

        this.validTypes.push(enumName);
        this.validTypeSignature.push(this.pkg.pkg + "#" + enumName)

        this.expect(TokenType.O_BRACE);
        if (this.token().type == TokenType.C_PAREN) {
            this.expect(TokenType.C_PAREN);
            return new EnumStmt(enumName, []);
        }

        const params: string[] = [];

        while (!this.isEOF() && this.token().type != TokenType.C_BRACE) {
            const name = this.expect(TokenType.IDENTIFIER).value;
            params.push(name);

            this.expect(TokenType.COMMA);
        }

        this.expect(TokenType.C_BRACE);
        return new EnumStmt(enumName, params);
    }

    private parseStruct(): Stmt {
        this.expect(TokenType.STRUCT);
        const structName: string = this.expect(TokenType.IDENTIFIER).value;

        this.validTypes.push(structName);
        this.validTypeSignature.push(this.pkg.pkg + "#" + structName)

        this.expect(TokenType.O_BRACE);
        if (this.token().type == TokenType.C_PAREN) {
            this.expect(TokenType.C_PAREN);
            return new StructStmt(structName, "L" + this.pkg.pkg + "#" + structName, []);
        }

        const params: Pair<Type, String>[] = [];

        while (!this.isEOF() && this.token().type != TokenType.C_BRACE) {
            const type = this.parseType();
            const name = this.expect(TokenType.IDENTIFIER).value;
            params.push(new Pair<Type, String>(type, name));

            this.expect(TokenType.SEMI_COLON);
        }

        this.expect(TokenType.C_BRACE);
        return new StructStmt(structName, "L" + this.pkg.pkg + "#" + structName, params);
    }

    private parseFor() {
        this.expect(TokenType.FOR);
        this.expect(TokenType.O_PAREN);

        const varDec: VarDeclarationStmt = this.parseTypeVar(false, false) as unknown as VarDeclarationStmt;
        const cond: Expr = this.parseExpression();
        this.expect(TokenType.SEMI_COLON);
        const after: Expr = this.parseExpression();

        this.expect(TokenType.C_PAREN);

        const body: BlockStmt = this.parseBlock();

        return new ForStmt(varDec, cond, after, body);
    }

    private parseWhile() {
        this.expect(TokenType.WHILE);

        this.expect(TokenType.O_PAREN);
        const cond: Expr = this.parseExpression();
        this.expect(TokenType.C_PAREN);

        const body: BlockStmt = this.parseBlock();

        return new WhileStmt(cond, body);
    }

    // Expression Section
    private parseExpression(): Expr {
        const left = this.parseEquality();

        switch (this.token().type) {
            case TokenType.ASSIGN:
            case TokenType.EDIVIDE_ASSIGN:
            case TokenType.EMULTIPLY_ASSIGN:
            case TokenType.EPLUS_ASSIGN:
            case TokenType.ESUB_ASSIGN:
                const op: TokenType = this.consume().type;
                const right = this.parseExpression();
                return new AssignmentExpr(op, left, right);
        }

        return left;
    }

    private parseEquality(): Expr {
        const left = this.parseRelational();

        switch (this.token().type) {
            case TokenType.EQUALS:
            case TokenType.NOT_EQUALS:
                const op: TokenType = this.consume().type;
                const right = this.parseExpression();
                return new EqualityExpr(op, left, right);
        }

        return left;
    }

    private parseRelational(): Expr {
        const left = this.parseAdditive();

        switch (this.token().type) {
            case TokenType.GREATER_THAN:
            case TokenType.GREATER_THAN_EQUAL_TO:
            case TokenType.LESS_THAN:
            case TokenType.LESS_THAN_EQUAL_TO:
                const op: TokenType = this.consume().type;
                const right = this.parseExpression();
                return new RelationalExpr(op, left, right);
        }

        return left;
    }

    private parseAdditive(): Expr {
        const left = this.parseMultiplicative();

        switch (this.token().type) {
            case TokenType.PLUS:
            case TokenType.MINUS:
                const op: TokenType = this.consume().type;
                const right = this.parseExpression();
                return new AdditiveExpr(op, left, right);
        }

        return left;
    }

    private parseMultiplicative(): Expr {
        const left = this.parseExponential();

        switch (this.token().type) {
            case TokenType.STAR:
            case TokenType.SLASH:
                const op: TokenType = this.consume().type;
                const right = this.parseExpression();
                return new MultiplicativeExpr(op, left, right);
        }

        return left;
    }

    private parseExponential(): Expr {
        const left = this.parseCallMember();

        switch (this.token().type) {
            case TokenType.CARROT:
                const op: TokenType = this.consume().type;
                const right = this.parseExpression();
                return new ExponentialExpr(op, left, right);
        }

        return left;
    }

    private parseCallMember(): Expr {
        const member = this.parseMember();

        if (this.token().type == TokenType.O_PAREN)
            return this.parseCall(member);

        return member;
    }

    private parseMember(): Expr {
        let obj: Expr = this.parsePrimary();
        let property: Expr = null as unknown as Expr;

        while (this.token().type == TokenType.PERIOD) {
            this.expect(TokenType.PERIOD);
            property = this.parsePrimary();

            if (!(property instanceof IdentifierExpr))
                throw new Error(`Cannot parse member expression since right side is not identifier!! | line: #${this.token().line}, column: #${this.token().column}`)

            obj = new MemberExpr(obj, property);
        }

        return obj;
    }

    private parseCall(caller: Expr): Expr {
        const callExpr = new CallExpr(caller, this.parseArgs());

        if (this.token().type == TokenType.O_PAREN)
            return this.parseCall(callExpr);

        return callExpr;
    }

    private parseArgs(): Expr[] {
        this.expect(TokenType.O_PAREN);
        if (this.token().type == TokenType.C_PAREN) {
            this.expect(TokenType.C_PAREN);
            return [];
        }

        const params: Expr[] = [];

        params.push(this.parseExpression());


        while(this.token().type == TokenType.COMMA){
            this.expect(TokenType.COMMA);
            params.push(this.parseExpression());
        }

        this.expect(TokenType.C_PAREN);
        return params;
    }

    private parsePrimary(): Expr {
        switch (this.token().type) {
            case TokenType.CAST:
                this.expect(TokenType.CAST);
                this.expect(TokenType.O_PAREN);
                const eExpr: Expr = this.parseExpression();
                this.expect(TokenType.COMMA);
                const tType: Type = this.parseType();
                this.expect(TokenType.C_PAREN);
                return new CastExpr(eExpr, tType);
            case TokenType.O_PAREN:
                const oldPtr = this.ptr;

                this.expect(TokenType.O_PAREN);
                try {
                    const t: Type = this.parseType();
                    this.expect(TokenType.C_PAREN);
                    const parenExpr = this.parseExpression();
                    return new CastExpr(parenExpr, t);
                } catch (e) {
                    this.ptr = oldPtr;
                }
                const parenExpr = this.parseExpression();
                this.expect(TokenType.C_PAREN);
                return parenExpr;
            case TokenType.NEW:
                this.expect(TokenType.NEW);
                const type: Type = this.parseType();
                const args: Expr[] = this.parseArgs();
                return new NewInstanceExpr(type, args);
            case TokenType.IDENTIFIER:
                const idTok: Token = this.expect(TokenType.IDENTIFIER);
                return new IdentifierExpr(idTok.value);
            case TokenType.INT:
                const intTok: Token = this.expect(TokenType.INT);
                return new IntegerExpr(BigInt(intTok.value));
            case TokenType.FLOAT:
                const floatTok: Token = this.expect(TokenType.FLOAT);
                return new FloatExpr(parseFloat(floatTok.value));
            case TokenType.STRING:
                const stringTok: Token = this.expect(TokenType.STRING);
                return new StringExpr(stringTok.value);
            default:
                throw new Error(`Unknown Token: "${this.token().value}" type: "${this.token().type}" | line: #${this.token().line}, column: #${this.token().column}`);
        }
    }

}