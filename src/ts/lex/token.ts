import {TokenType} from "./token_type";

export class Token {

    public readonly index: number;
    public readonly type: TokenType;
    public readonly value: string;
    public readonly line: number;
    public readonly column: number;

    constructor(type: TokenType, value: string, index: number, line: number, column: number) {
        this.type = type;
        this.value = value;
        this.index = index;
        this.line = line;
        this.column = column;
    }

}