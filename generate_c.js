import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONTENT_DIR = path.join(__dirname, "content")
const INDEX_PATH = path.join(CONTENT_DIR, "index.md")

function walk(dir) {
  let results = []
  const list = fs.readdirSync(dir)

  list.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (file === "index.md") return

    if (stat.isDirectory()) {
      results = results.concat(walk(filePath))
    } else if (file.endsWith(".md")) {
      const relative = filePath
        .replace(CONTENT_DIR + path.sep, "")
        .replace(/\.md$/, "")
        .replace(/\\/g, "/")

      results.push({
        path: relative,
        mtime: stat.mtime
      })
    }
  })

  return results
}

function generate() {
  const files = walk(CONTENT_DIR)

  // ===== 最近更新（按时间排序）=====
  const recent = [...files]
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, 10)

  let recentBlock = ""
  recent.forEach(f => {
    recentBlock += `- [[${f.path}]]\n`
  })

  // ===== 全部文章 =====
  const sorted = [...files].sort((a, b) =>
    a.path.localeCompare(b.path)
  )

  let tocBlock = ""
  sorted.forEach(f => {
    tocBlock += `- [[${f.path}]]\n`
  })

  // ===== 读取 index.md =====
  let content = fs.readFileSync(INDEX_PATH, "utf-8")

  // ===== 替换 RECENT =====
  content = content.replace(
    /<!-- RECENT_START -->[\s\S]*<!-- RECENT_END -->/,
    `<!-- RECENT_START -->\n${recentBlock}<!-- RECENT_END -->`
  )

  // ===== 替换 TOC =====
  content = content.replace(
    /<!-- TOC_START -->[\s\S]*<!-- TOC_END -->/,
    `<!-- TOC_START -->\n${tocBlock}<!-- TOC_END -->`
  )

  fs.writeFileSync(INDEX_PATH, content, "utf-8")

  console.log(`✅ 首页已更新：${files.length} 篇文章`)
}

generate()