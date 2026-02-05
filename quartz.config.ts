import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration - Academic Minimalism
 *
 * 风格特点：
 * - 冷静留白
 * - 学术配色
 * - 强调可读性
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "我的数字花园",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "zh-CN",
    baseUrl: "bigdogaaa.github.io",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      // 省略字体、颜色等
      mode: "auto",  // 自动跟随操作系统或浏览器偏好
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Inter",           // 学术感无衬线标题
        body: "Source Serif 4",    // 阅读舒适的衬线正文
        code: "IBM Plex Mono",     // 保留原来的代码字体
      },
      colors: {
        lightMode: {
          light: "#fafafa",           // 主背景色，明亮留白
          lightgray: "#e5e7eb",       // 细分隔线 / 二级背景
          gray: "#6b7280",            // 次文字
          darkgray: "#374151",        // 正文主文字
          dark: "#111827",            // 标题 / 强调文字
          secondary: "#2e75b5",       // 主色 - 保留你原来的蓝色
          tertiary: "#84a59d",        // 辅助色，可用于卡片或标签
          highlight: "rgba(46, 117, 181, 0.1)", // 内容高亮背景
          textHighlight: "rgba(255, 242, 54, 0.3)", // 文字高亮
        },
        darkMode: {
          light: "#1f1f1f",           // 主背景
          lightgray: "#2c2c2c",
          gray: "#9ca3af",
          darkgray: "#d1d5db",
          dark: "#f9fafb",
          secondary: "#2e75b5",       // 保留蓝色
          tertiary: "#84a59d",
          highlight: "rgba(46, 117, 181, 0.1)",
          textHighlight: "rgba(255, 242, 54, 0.3)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
