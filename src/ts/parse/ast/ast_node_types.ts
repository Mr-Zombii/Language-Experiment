type NodeKind =
    | "exprstmt"
    | "package"
    | "import"
    | "native_function"
    | "function"
    | "block"
    | "varlist"
    | "varstmt"
    | "struct"
    | "enum"
    | "return"
    | "program"
    | "if"
    | "if_else"

    | "new_instance_expr"
    | "assignment_expr"
    | "equality_expr"
    | "relational_expr"
    | "additive_expr"
    | "multiplicative_expr"
    | "exponential_expr"
    | "member_expr"
    | "call_expr"
    | "identifier_expr"
    | "string_expr"
    | "int_expr"
    | "float_expr"
    | "cast_expr"
    | "for"
    | "while"

export class ASTNode {

    public kind: NodeKind;

    constructor(kind: NodeKind) {
        this.kind = kind;
    }

}
