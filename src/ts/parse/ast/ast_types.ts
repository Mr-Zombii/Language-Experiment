import { Token } from "../../lex/token";
import { TokenType } from "../../lex/token_type";

export class Type {
    public token: Token;
    public signature: string;

    constructor(token: Token, signature: string) {
        this.token = token;
        this.signature = signature;
    }

    public static VOID = new Type(new Token(TokenType.VOID, "void", -1, -1, -1), "V")

}

function formSig(signature: string, generics: Type[]): string {
    let sig: string = "";
    if (generics.length < 1)
        return signature;

    for(let i = 0; i < generics.length; i++) {
        const arrayElement = generics[i];

        if (arrayElement instanceof ClassLikeType) {
            sig += formSig((arrayElement as ClassLikeType).signature, (arrayElement as ClassLikeType).generics);
        } else {
            sig += arrayElement.signature;
        }

        if (i < generics.length - 1)
            sig += ",";
    }
    return signature + "<" + sig + ">";
}

export class ClassLikeType extends Type {

    public generics: Type[];

    constructor(token: Token, signature: string, generics: Type[] = []) {
        super(token, formSig(signature, generics));
        this.generics = generics;
    }

}

export class GenericType extends Type {

    constructor(token: Token, signature: string) {
        super(token, signature);
    }

}

export class PairType extends Type {
    public innerTypeA: Type;
    public innerTypeB: Type;

    constructor(token: Token, innerTypeA: Type, innerTypeB: Type) {
        super(token, "p{" + innerTypeA.signature + "," + innerTypeB.signature + "}");
        this.innerTypeA = innerTypeA;
        this.innerTypeB = innerTypeB;
    }

}


export class ArrayType extends Type {
    public innerType: Type;

    constructor(token: Token, innerType: Type) {
        super(token, innerType.signature + "[]");
        this.innerType = innerType;
    }

}

export class NativeArrayType extends Type {
    public innerType: Type;

    constructor(token: Token, innerType: Type) {
        super(token, innerType.signature + "[]");

        this.innerType = innerType;
    }

}