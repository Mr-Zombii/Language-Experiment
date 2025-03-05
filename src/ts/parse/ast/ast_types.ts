import { TokenType } from "../../lex/token_type";

const castTable: Map<TokenType, TokenType[]> = new Map<TokenType, TokenType[]>([
    [TokenType.T_INT_64, [TokenType.T_INT_64]],
    [TokenType.T_INT_32, [TokenType.T_INT_32, TokenType.T_INT_64]],
    [TokenType.T_INT_16, [TokenType.T_INT_16, TokenType.T_INT_32, TokenType.T_INT_64]],
    [TokenType.T_INT_8, [TokenType.T_INT_8, TokenType.T_INT_16, TokenType.T_INT_32, TokenType.T_INT_64]],
]);

export class Type {
    public token: TokenType;
    public signature: string;

    constructor(token: TokenType, signature: string) {
        this.token = token;
        this.signature = signature;
    }

    public static VOID = new Type(TokenType.VOID, "V")

    public is(type: Type): boolean {
        return this.signature === type.signature;
    }

    public canCast(type: Type): boolean {
        if (this.is(type)) return true;

        if (castTable.get(type.token) == null || castTable.get(type.token) == undefined) return false;

        return ((castTable.get(type.token) as unknown as TokenType[]).indexOf(this.token) != -1)
    }

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

    constructor(token: TokenType, signature: string, generics: Type[] = []) {
        super(token, formSig(signature, generics));
        this.generics = generics;
    }

}

export class GenericType extends Type {

    constructor(token: TokenType, signature: string) {
        super(token, signature);
    }

}

export class PairType extends Type {
    public innerTypeA: Type;
    public innerTypeB: Type;

    constructor(token: TokenType, innerTypeA: Type, innerTypeB: Type) {
        super(token, "p{" + innerTypeA.signature + "," + innerTypeB.signature + "}");
        this.innerTypeA = innerTypeA;
        this.innerTypeB = innerTypeB;
    }

}


export class ArrayType extends Type {
    public innerType: Type;

    constructor(token: TokenType, innerType: Type) {
        super(token, innerType.signature + "[]");
        this.innerType = innerType;
    }

}

export class NativeArrayType extends Type {
    public innerType: Type;

    constructor(token: TokenType, innerType: Type) {
        super(token, innerType.signature + "[]");

        this.innerType = innerType;
    }

}