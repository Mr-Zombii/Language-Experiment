export const enum TokenType {

    // Operators
    EOF =  "EOF",
    STAR =  "*",
    SLASH =  "/",
    MINUS =  "-",
    DECREMENT =  "--",
    PLUS =  "+",
    INCREMENT =  "++",
    CARROT =  "^",

    // Simple Types
    INT =  "INT",
    FLOAT =  "FLOAT",
    STRING =  "STRING",

    // Braces, Brackets, and Parenthesis
    O_PAREN =  "(",
    C_PAREN =  ")",
    O_BRACE =  "{",
    C_BRACE =  "}",
    O_BRACKET =  "[",
    C_BRACKET =  "]",

    // Other
    SEMI_COLON =  ";",
    COLON =  ":",
    COMMA =  ",",
    PERIOD =  ".",

    // Logical & Bitwise Operations
    LOGICAL_NOT =  "!",
    BITSWISE_NOT =  "~",
    LOGICAL_AND =  "&&",
    BITWISE_AND =  "&",
    LOGICAL_OR =  "||",
    BITWISE_OR =  "|",

    // Equality & Relational
    EQUALS =  "=",
    NOT_EQUALS =  "!=",
    GREATER_THAN =  ">",
    LESS_THAN =  "<",
    LESS_THAN_EQUAL_TO =  "<=",
    GREATER_THAN_EQUAL_TO =  ">=",

    // Assigning Operators
    ASSIGN =  "=",
    EPLUS_ASSIGN =  "+=",
    ESUB_ASSIGN =  "-=",
    EDIVIDE_ASSIGN =  "/=",
    EMULTIPLY_ASSIGN =  "*=",

    // Identifiers/Keywords
    IDENTIFIER =  "IDENTIFIER",

    // Keywords
    IF =  "IF",
    ELSE =  "ELSE",
    FUNCTION =  "FUNCTION",
    STATIC =  "STATIC",
    WHILE =  "WHITE",
    FOR =  "FOR",
    CONST =  "CONST",
    VAR =  "VAR",
    SWITCH =  "SWITCH",
    RETURN =  "RETURN",
    STRUCT =  "STRUCT",
    NEW =  "NEW",

    // Types
    VOID =  "VOID",

    T_UINT_64 =  "T_UINT_64",
    T_UINT_32 =  "T_UINT_32",
    T_UINT_16 =  "T_UINT_16",
    T_UINT_8 =  "T_UINT_8",

    T_INT_64 =  "T_INT_64",
    T_INT_32 =  "T_INT_32",
    T_INT_16 =  "T_INT_16",
    T_INT_8 =  "T_INT_8",

    T_FLOAT_64 =  "T_FLOAT_64",
    T_FLOAT_32 =  "T_FLOAT_32",
    T_FLOAT_16 =  "T_FLOAT_16",

    T_STRING =  "T_STRING",

    VEC2F =  "VEC2F",
    VEC3F =  "VEC3F",
    VEC4F =  "VEC4F",
    VEC5F =  "VEC5F",
    VEC6F =  "VEC6F",

    VEC2I =  "VEC2I",
    VEC3I =  "VEC3I",
    VEC4I =  "VEC4I",
    VEC5I =  "VEC5I",
    VEC6I =  "VEC6I",

    MAT2I =  "MAT2I",
    MAT3I =  "MAT3I",
    MAT4I =  "MAT4I",
    MAT5I =  "MAT5I",
    MAT6I =  "MAT6I",

    MAT2F =  "MAT2F",
    MAT3F =  "MAT3F",
    MAT4F =  "MAT4F",
    MAT5F =  "MAT5F",
    MAT6F =  "MAT6F",

    ARRAY = "ARRAY",
    PAIR =  "PAIR",
    CLASS =  "CLASS"
}


const keywordList: Map<string, TokenType> = new Map<string, TokenType>([
    ["if", TokenType.IF],
    ["else", TokenType.ELSE],
    ["fn", TokenType.FUNCTION],
    ["static", TokenType.STATIC],
    ["while", TokenType.WHILE],
    ["for", TokenType.FOR],
    ["const", TokenType.CONST],
    ["var", TokenType.VAR],
    ["switch", TokenType.SWITCH],
    ["return", TokenType.RETURN],
    ["new", TokenType.NEW],

    ["int", TokenType.T_INT_32],
    ["i64", TokenType.T_INT_64],
    ["i32", TokenType.T_INT_32],
    ["i16", TokenType.T_INT_16],
    ["i8", TokenType.T_INT_8],

    ["u64", TokenType.T_UINT_64],
    ["u32", TokenType.T_UINT_32],
    ["u16", TokenType.T_UINT_16],
    ["u8", TokenType.T_UINT_8],

    ["f64", TokenType.T_FLOAT_64],
    ["float", TokenType.T_FLOAT_32],
    ["f32", TokenType.T_FLOAT_32],
    ["f16", TokenType.T_FLOAT_16],

    ["string", TokenType.T_STRING],
    ["class", TokenType.CLASS],
    ["struct", TokenType.STRUCT],

    ["vec2i", TokenType.VEC2I],
    ["vec3i", TokenType.VEC3I],
    ["vec4i", TokenType.VEC4I],
    ["vec5i", TokenType.VEC5I],
    ["vec6i", TokenType.VEC6I],

    ["vec2f", TokenType.VEC2F],
    ["vec3f", TokenType.VEC3F],
    ["vec4f", TokenType.VEC4F],
    ["vec5f", TokenType.VEC5F],
    ["vec6f", TokenType.VEC6F],

    ["mat2i", TokenType.MAT2I],
    ["mat3i", TokenType.MAT3I],
    ["mat4i", TokenType.MAT4I],
    ["mat5i", TokenType.MAT5I],
    ["mat6i", TokenType.MAT6I],

    ["mat2f", TokenType.MAT2F],
    ["mat3f", TokenType.MAT3F],
    ["mat4f", TokenType.MAT4F],
    ["mat5f", TokenType.MAT5F],
    ["mat6f", TokenType.MAT6F],
    ["void", TokenType.VOID],

    ["pair", TokenType.PAIR],
    ["array", TokenType.ARRAY],
]);

export function getKeywordType(type: string): TokenType {
    if (keywordList.get(type) == null || keywordList.get(type) == undefined) {
        return TokenType.IDENTIFIER
    }
    return keywordList.get(type) as TokenType;
}
