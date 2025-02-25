import {Token} from "../lex/token";
import {BlockStmt, ExprStmt, FunctionDeclarationStmt, Stmt, VarDeclarationStmt, VarListStmt} from "./ast/ast_stmt";
import {TokenType} from "../lex/token_type";
import {ArrayType, PairType, Type} from "./ast/ast_types";
import {
    AdditiveExpr,
    AssignmentExpr,
    CallExpr,
    EqualityExpr,
    ExponentialExpr,
    Expr,
    IdentifierExpr,
    MemberExpr,
    MultiplicativeExpr,
    NewInstanceExpr,
    RelationalExpr
} from "./ast/ast_expr";
import {Pair} from "../util";

export default class Parser {

    private tokens: Token[];
    private ptr: number;
    private validTypes: string[];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.ptr = 0;
        this.validTypes = [];
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

    public parse(): BlockStmt {
        const stmts: Stmt[] = [];

        while(!this.isEOF()) {
            stmts.push(this.parseStmt());
        }

        return new BlockStmt(stmts);
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

    private parseParams(): Pair<String, Type>[] {
        this.expect(TokenType.O_PAREN);
        if (this.token().type == TokenType.C_PAREN) {
            this.expect(TokenType.C_PAREN);
            return [];
        }

        const params: Pair<String, Type>[] = [];

        let type = this.parseType();
        let name = this.expect(TokenType.IDENTIFIER).value;

        params.push(new Pair<String, Type>(name, type));


        while(this.token().type == TokenType.COMMA) {
            type = this.parseType();
            name = this.expect(TokenType.IDENTIFIER).value;

            params.push(new Pair<String, Type>(name, type));
        }

        this.expect(TokenType.C_PAREN);
        return params;
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

            // Identifier - Potential Type
            case TokenType.IDENTIFIER:
                return this.parseTypeVar();

            case TokenType.CONST:
                this.expect(TokenType.CONST);
                return this.parseTypeVar(true)

            case TokenType.FUNCTION:
                return this.parseFunction();

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

            // String
            case TokenType.T_STRING:

            // Void
            case TokenType.VOID:
                type = new Type(tok.type);
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
                    type = new Type(tok.type)
                    break
                }
                throw new Error(`Invalid Identifier Type \"${tok.value}\"!`)

            default:
                throw new Error(`Invalid Data-Type: "${this.token().value}" type: #${this.token().type}!`);
        }

        return type;
    }

    private parseTypeVar(isConst: boolean = false): Stmt {
        const type: Type = this.parseType();
        const name: string = this.expect(TokenType.IDENTIFIER).value;

        if (this.token().type == TokenType.COMMA) {
            const names: string[] = [name];

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

    private parseFunction(): Stmt {
        this.expect(TokenType.FUNCTION);
        const name: string = this.expect(TokenType.IDENTIFIER).value;

        const params = this.parseParams();

        let type: Type = new Type(TokenType.VOID);
        if (this.token().type == TokenType.MINUS && this.peek().type == TokenType.GREATER_THAN) {
            this.expect(TokenType.MINUS);
            this.expect(TokenType.GREATER_THAN);
            type = this.parseType();
        }

        const block: BlockStmt = this.parseBlock();
        return new FunctionDeclarationStmt(name, params, type, block);
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
                throw new Error("Cannot parse member expression since right side is not identifier!!")

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


        while(this.token().type == TokenType.COMMA)
            params.push(this.parseExpression());

        this.expect(TokenType.C_PAREN);
        return params;
    }

    private parsePrimary() {
        switch (this.token().type) {
            case TokenType.O_PAREN:
                this.expect(TokenType.O_PAREN);
                const parenExpr = this.parseExpression();
                this.expect(TokenType.C_PAREN);
                return parenExpr;
            case TokenType.NEW:
                this.expect(TokenType.NEW);
                const type: Type = this.parseType();
                const args: Expr[] = this.parseArgs();
                return new NewInstanceExpr(type, args);
            default:
                throw new Error(`Unknown Token: "${this.token().value}" type: "${this.token().type}"`);
        }
    }

}