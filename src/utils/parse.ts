// @ts-nocheck
class Parser {
  extractAndParseJsObject(text, variableName) {
    // 1. 提取对象字符串
    const start = text.indexOf(variableName)
    if (start === -1) return null

    const braceStart = text.indexOf('{', start)
    if (braceStart === -1) return null

    let depth = 0
    let quote = ''
    let escaped = false
    let endIndex = -1

    for (let i = braceStart; i < text.length; i++) {
      const char = text[i]

      if (quote) {
        if (escaped) {
          escaped = false
        } else if (char === '\\') {
          escaped = true
        } else if (char === quote) {
          quote = ''
        }
        continue
      }

      if (char === "'" || char === '"') {
        quote = char
      } else if (char === '{') {
        depth++
      } else if (char === '}') {
        depth--
        if (depth === 0) {
          endIndex = i
          break
        }
      }
    }

    if (endIndex === -1) return null

    // 2. 使用 Function 构造函数安全解析
    const objStr = text.substring(braceStart, endIndex + 1)
    try {
      return new Function('return ' + objStr)()
    } catch (error) {
      console.error('解析失败:', error.message)
      return null
    }
  }

  parseDateTime(date) {
    if (date instanceof Date) {
      return date
    }
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date: ${date}`)
    }
    return parsedDate
  }
}

export { Parser }
