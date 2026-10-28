import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import ts from "typescript"
import { describe, expect, it } from "vitest"

describe("server-rendered actor reads", () => {
  it("shares the request-scoped actor resolver instead of creating page-specific providers", () => {
    const appDirectory = resolve(process.cwd(), "app")
    const pageFiles = readdirSync(appDirectory, { recursive: true, encoding: "utf8" })
      .filter((file) => /(?:page|layout)\.tsx$/.test(file))
    expect(pageFiles.length).toBeGreaterThan(0)

    const separateProviderConsumers = pageFiles.filter((file) => {
      const source = ts.createSourceFile(
        file,
        readFileSync(resolve(appDirectory, file), "utf8"),
        ts.ScriptTarget.Latest,
        true,
      )
      return source.statements.some((statement) =>
        ts.isImportDeclaration(statement) &&
        ts.isStringLiteral(statement.moduleSpecifier) &&
        statement.moduleSpecifier.text.endsWith("/next-cookie-current-actor-provider") &&
        statement.importClause?.namedBindings &&
        ts.isNamedImports(statement.importClause.namedBindings) &&
        statement.importClause.namedBindings.elements.some((element) =>
          (element.propertyName ?? element.name).text === "createNextCookieCurrentActorProvider",
        ),
      )
    })

    // API routes ไม่อยู่ในรายการนี้ จึงไม่เปลี่ยนขอบเขตตรวจ session ของ mutations
    expect(separateProviderConsumers).toEqual([])
  })
})
