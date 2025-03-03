import {BlockStmt, ProgramStmt, Stmt} from "../parse/ast/ast_stmt";

export default class TypeChecker {

    public ast: ProgramStmt;

    constructor(ast: ProgramStmt) {
        this.ast = ast;
    }

    public process() {
        this.traverse(this.ast);
    }

    public traverse(ast: Stmt) {
        // @ts-ignore
        switch (ast.kind) {
            case "program":
                for(let i = 0; i < (<ProgramStmt>ast).stmts.length; i++) {
                    this.traverse(((<ProgramStmt>ast).stmts)[i])
                }
                break
            case "block":
                for(let i = 0; i < (<BlockStmt>ast).stmts.length; i++) {
                    this.traverse(((<BlockStmt>ast).stmts)[i])
                }
                break
            default:
                console.log(ast)
        }
    }

}