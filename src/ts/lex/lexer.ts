import {Token} from "./token";
import {getKeywordType, TokenType} from "./token_type";

export default class Lexer {

    private ptr: number;
    private readonly chrs: string[];
    private line: number;
    private column: number = 0;
    public tokens: Token[];

    constructor(text: string) {
        this.ptr = 0;
        this.chrs = text.split("");
        this.line = 1;
        this.column = 1;
        this.tokens = [];
    }

    private char(): string {
        return this.chrs[this.ptr];
    }

    private consume(): string {
        this.column++;
        return this.chrs[this.ptr++];
    }

    private peek(peekIndex: number = 1): string {
        return this.chrs[this.ptr + peekIndex]
    }

    public tokenize() {
        this.tokens = [];

        while (this.ptr < this.chrs.length) {
            const resStep1 = this.skipWhitespace();
            const resStep2 = this.processSmallTokens();
            const resStep3 = this.processIdentifiers();
            const resStep4 = this.processStrings();
            const resStep5 = this.processNumbers();

            if (!(resStep1 || resStep2 || resStep3 || resStep4 || resStep5)) {
                throw new Error("Invalid character \"" + this.char() + "\"");
            }
        }
        this.tokens.push(new Token(TokenType.EOF, "End Of File", this.ptr, this.line, this.column))
    }

    private skipWhitespace() {
        switch (this.char()) {
            case "\n":
                this.line++;
                this.ptr++;
                this.column = 1;
                return true;

            case "\r":
            case "\t":
            case " ":
                this.ptr++;
                this.column++;
                return true;
        }
        return false;
    }

    private tmpString: string = "";
    private tmpType: TokenType = (null as unknown) as TokenType;

    private processSmallTokens() {
        this.tmpType = (null as unknown) as TokenType;
        this.tmpString = this.peek();

        switch (this.char()) {
            case "+":
                this.tmpType =
                    this.tmpString == "+" ? TokenType.INCREMENT :
                    this.tmpString == "=" ? TokenType.EPLUS_ASSIGN :
                    TokenType.PLUS;
                break
            case "-":
                this.tmpType =
                    this.tmpString == "-" ? TokenType.DECREMENT :
                    this.tmpString == "=" ? TokenType.ESUB_ASSIGN :
                    TokenType.MINUS;
                break
            case "*":
                this.tmpType =
                    this.tmpString == "=" ? TokenType.EMULTIPLY_ASSIGN :
                    TokenType.MINUS;
                break
            case "/":
                this.tmpType =
                    this.tmpString == "=" ? TokenType.EDIVIDE_ASSIGN :
                    TokenType.SLASH;
                break
            case ";":
                this.tmpType = TokenType.SEMI_COLON;
                break
            case ":":
                this.tmpType = TokenType.COLON;
                break
            case "(":
                this.tmpType = TokenType.O_PAREN;
                break
            case ")":
                this.tmpType = TokenType.C_PAREN;
                break
            case "{":
                this.tmpType = TokenType.O_BRACE;
                break
            case "}":
                this.tmpType = TokenType.C_BRACE;
                break
            case "[":
                this.tmpType = TokenType.O_BRACKET;
                break
            case "]":
                this.tmpType = TokenType.C_BRACKET;
                break
            case "<":
                this.tmpType =
                    this.tmpString == "=" ? TokenType.LESS_THAN_EQUAL_TO :
                    TokenType.LESS_THAN;
                break
            case ">":
                this.tmpType =
                    this.tmpString == "=" ? TokenType.GREATER_THAN_EQUAL_TO :
                    TokenType.GREATER_THAN;
                break
            case "~":
                this.tmpType = TokenType.BITSWISE_NOT;
                break
            case "!":
                this.tmpType =
                    this.tmpString == "=" ? TokenType.NOT_EQUALS :
                    TokenType.LOGICAL_NOT;
                break
            case "=":
                this.tmpType =
                    this.tmpString == "=" ? TokenType.EQUALS :
                    TokenType.ASSIGN;
                break
            case "|":
                this.tmpType =
                    this.tmpString == "|" ? TokenType.LOGICAL_OR :
                    TokenType.BITWISE_OR;
                break
            case "&":
                this.tmpType =
                    this.tmpString == "|" ? TokenType.LOGICAL_AND :
                    TokenType.BITWISE_AND;
                break
            case ".":
                this.tmpType = TokenType.PERIOD;
                break
            case ",":
                this.tmpType = TokenType.COMMA;
                break
            case "^":
                this.tmpType = TokenType.CARROT;
                break
        }

        if (this.tmpType != null) {
            this.tokens.push(new Token(this.tmpType, this.tmpType.toString(), this.ptr, this.line, this.column));
            this.ptr += this.tmpType.toString().length;
            this.column += this.tmpType.toString().length;
            return true;
        }
        return false;
    }

    private processIdentifiers(): boolean {
        if (this.isAlpha()) {
            this.tmpString = "";

            const startCol = this.column;
            const startLine = this.line;
            const startPtr = this.ptr;

            while (this.ptr <= this.chrs.length - 1 && this.isAlphaNum()) {
                this.tmpString += this.consume();
            }
            this.tokens.push(new Token(getKeywordType(this.tmpString), this.tmpString, startPtr, startLine, startCol));
            return true;
        }
        return false;
    }

    private processStrings(): boolean {
        if (this.char() == '"') {
            this.tmpString = "";
            this.consume();

            const startCol = this.column;
            const startLine = this.line;
            const startPtr = this.ptr;

            while (this.ptr <= this.chrs.length - 1 && this.char() != '"') {
                this.tmpString += this.consume();
            }
            this.tokens.push(new Token(TokenType.STRING, this.tmpString, startPtr, startLine, startCol));

            this.consume();
            return true;
        }
        return false;
    }

    private processNumbers() {
        if (this.isDigit()) {
            this.tmpType = TokenType.INT;
            this.tmpString = "";

            const startCol = this.column;
            const startLine = this.line;
            const startPtr = this.ptr;

            while (this.ptr <= this.chrs.length - 1 && this.isDigit()) {
                this.tmpString += this.consume();
                if (this.char() == ".") {
                    this.tmpType = TokenType.FLOAT;
                    this.tmpString += this.consume();
                    while (this.ptr <= this.chrs.length - 1 && this.isDigit()) {
                        this.tmpString += this.consume();
                    }
                }
            }
            this.tokens.push(new Token(this.tmpType, this.tmpString, startPtr, startLine, startCol));
            return true;
        }
        return false;
    }

    private isAlpha(): boolean {
        const char: string = this.char();
        if (char == null) return false;
        const cp: number = char.codePointAt(0) as number;
        return (cp >= 65 && cp <= 90) || (cp >= 97 && cp <= 122) || char.charAt(0) == "_"
    }

    private isDigit(): boolean {
        const char: string = this.char();
        if (char == null) return false;
        const cp: number = char.codePointAt(0) as number;
        return (cp >= 48 && cp <= 57)
    }

    private isAlphaNum() {
        return this.isAlpha() || this.isDigit();
    }

}