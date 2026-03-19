import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONTENT_DIR = path.join(__dirname, "content")
const INDEX_PATH = path.join(CONTENT_DIR, "index.md")

// 遍历目录，返回树状结构
function walkTree(dir, base = "") {
  const list = fs.readdirSync(dir)
  const tree = []

  list.forEach(file => {
    if (file === "index.md") return

    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    const relative = path.join(base, file).replace(/\\/g, "/")

    if (stat.isDirectory()) {
      const children = walkTree(filePath, relative)
      tree.push({
        name: file,
        path: relative,
        children,
        mtime: stat.mtime
      })
    } else if (file.endsWith(".md")) {
      tree.push({
        name: file,
        path: relative.replace(/\.md$/, ""),
        children: [],
        mtime: stat.mtime
      })
    }
  })

  // 按文件夹和文件名排序
  tree.sort((a, b) => a.path.localeCompare(b.path))
  return tree
}

// 根据树生成 TOC 字符串，带缩进
function treeToToc(tree, level = 0) {
  let toc = ""
  const indent = "  ".repeat(level)

  tree.forEach(node => {
    if (node.children.length === 0) {
      toc += `${indent}- [[${node.path}]]\n`
    } else {
      toc += `${indent}- ${node.name}\n`
      toc += treeToToc(node.children, level + 1)
    }
  })

  return toc
}

// 扁平化获取最近更新的文件
function flattenTree(tree) {
  let files = []
  tree.forEach(node => {
    if (node.children.length === 0) {
      files.push({ path: node.path, mtime: node.mtime })
    } else {
      files = files.concat(flattenTree(node.children))
    }
  })
  return files
}

function generate() {
  const tree = walkTree(CONTENT_DIR)
  const files = flattenTree(tree)

  // 最近更新
  const recent = [...files].sort((a,b)=>b.mtime-a.mtime).slice(0,10)
  let recentBlock = ""
  recent.forEach(f => { recentBlock += `- [[${f.path}]]\n` })

  // 生成带层级的 TOC
  const tocBlock = treeToToc(tree)

  // 读取 index.md
  let content = fs.readFileSync(INDEX_PATH, "utf-8")

  // 替换 RECENT
  content = content.replace(
    /<!-- RECENT_START -->[\s\S]*<!-- RECENT_END -->/,
    `<!-- RECENT_START -->\n${recentBlock}<!-- RECENT_END -->`
  )

  // 替换 TOC
  content = content.replace(
    /<!-- TOC_START -->[\s\S]*<!-- TOC_END -->/,
    `<!-- TOC_START -->\n${tocBlock}<!-- TOC_END -->`
  )

  fs.writeFileSync(INDEX_PATH, content, "utf-8")
  console.log(`✅ 首页已更新：${files.length} 篇文章`)
}

generate()