import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// 兼容 __dirname（ESM 没有这个）
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONTENT_DIR = path.join(__dirname, "content")
const OUTPUT = path.join(CONTENT_DIR, "index.md")

function walk(dir) {
  let results = []
  const list = fs.readdirSync(dir)

  list.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    // ❌ 跳过 index.md
    if (file === "index.md") return

    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath))
    } else if (file.endsWith(".md")) {
      const relative = filePath
        .replace(CONTENT_DIR + path.sep, "")
        .replace(/\.md$/, "")
        .replace(/\\/g, "/")

      results.push(relative)
    }
  })

  return results
}

function generate() {
  const files = walk(CONTENT_DIR)

  let content = "# 📚 博客目录\n\n"

  files.sort()

  files.forEach(f => {
    content += `- [[${f}]]\n`
  })

  fs.writeFileSync(OUTPUT, content, "utf-8")

  console.log(`✅ index.md 已生成，共 ${files.length} 篇文章`)
}

generate()