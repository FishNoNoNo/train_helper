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

  parseCnToTime(time) {
    if (time instanceof Date) {
      return time
    }
    // 5月？10日？10点30分？（?表示可能有）
    const match = time.match(/(\d+)月(\d+)日(\d+)点(\d+)分/)
    if (!match) {
      throw new Error(`Invalid time: ${time}`)
    }
    const [, month, day, hour, minute] = match
    const parsedDate = new Date()
    parsedDate.setMonth(parseInt(month) - 1)
    parsedDate.setDate(parseInt(day))
    parsedDate.setHours(parseInt(hour))
    parsedDate.setMinutes(parseInt(minute))
    parsedDate.setSeconds(0)
    return parsedDate
  }

  getDateFromCn(cnDate) {
    const match = cnDate.match(/(?:(\d+)月)?(?:(\d+)日)?/)
    if (!match) {
      throw new Error(`Invalid date: ${cnDate}`)
    }
    const month = match[1] || ''
    const day = match[2] || ''
    const parsedDate = new Date()
    month && parsedDate.setMonth(parseInt(month) - 1)
    day && parsedDate.setDate(parseInt(day))
    parsedDate.setHours(0)
    parsedDate.setMinutes(0)
    parsedDate.setSeconds(0)
    return parsedDate
  }

  getTimeFromCn(cnTime) {
    // 可能没有分钟
    const match = cnTime.match(/(\d+)点(?:(\d+)分)?/)
    if (!match) {
      throw new Error(`Invalid time: ${cnTime}`)
    }
    const hour = match[1]
    const minute = match[2] || ''
    const parsedDate = new Date()
    parsedDate.setHours(parseInt(hour))
    minute ? parsedDate.setMinutes(parseInt(minute)) : parsedDate.setMinutes(0)
    parsedDate.setSeconds(0)
    return parsedDate
  }

  mergeTime(date: Date, time: Date) {
    date.setHours(time.getHours())
    date.setMinutes(time.getMinutes())
    date.setSeconds(time.getSeconds())
    return date
  }
}

const parser = new Parser()
export default parser
