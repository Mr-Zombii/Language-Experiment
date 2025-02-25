import {TokenType} from "../../lex/token_type";

export class Type {
    public token: TokenType;

    constructor(token: TokenType) {
        this.token = token;
    }

}

export class GenericType extends Type {

    constructor(token: TokenType) {
        super(token);
    }

}

export class PairType extends Type {
    public innerTypeA: Type;
    public innerTypeB: Type;

    constructor(token: TokenType, innerTypeA: Type, innerTypeB: Type) {
        super(token);
        this.innerTypeA = innerTypeA;
        this.innerTypeB = innerTypeB;
    }

}


export class ArrayType extends Type {
    public innerType: Type;

    constructor(token: TokenType, innerType: Type) {
        super(token);
        this.innerType = innerType;
    }

}

export class NativeArrayType extends Type {
    public innerType: Type;

    constructor(token: TokenType, innerType: Type) {
        super(token);

        this.innerType = innerType;
    }

}