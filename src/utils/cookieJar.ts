/**
 * CookieJar - 用于 Tauri HTTP 请求的自动 Cookie 管理
 * 解决 Tauri HTTP 插件不支持自动携带跨域 Cookie 的问题
 */

export interface Cookie {
  name: string
  value: string
  domain: string
  path: string
  expires?: number // 过期时间戳 (毫秒)
  secure?: boolean
  httpOnly?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}

const STORAGE_KEY = 'cookie_jar'

class CookieJar {
  private cookies: Map<string, Cookie> = new Map()

  constructor() {
    this.loadFromStorage()
  }

  /**
   * 从 localStorage 加载 cookies
   */
  private loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        const parsed = JSON.parse(data) as Cookie[]
        const now = Date.now()
        parsed.forEach((cookie) => {
          // 过滤已过期的 cookie
          if (!cookie.expires || cookie.expires > now) {
            const key = this.getCookieKey(cookie.name, cookie.domain, cookie.path)
            this.cookies.set(key, cookie)
          }
        })
      }
    } catch (e) {
      console.error('Failed to load cookies from storage:', e)
    }
  }

  /**
   * 保存 cookies 到 localStorage
   */
  private saveToStorage() {
    try {
      const now = Date.now()
      const validCookies = Array.from(this.cookies.values()).filter(
        (c) => !c.expires || c.expires > now,
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validCookies))
    } catch (e) {
      console.error('Failed to save cookies to storage:', e)
    }
  }

  /**
   * 生成 cookie 存储 key
   */
  private getCookieKey(name: string, domain: string, path: string): string {
    return `${domain}|${path}|${name}`
  }

  /**
   * 从 Set-Cookie 响应头解析 Cookie
   */
  parseSetCookie(header: string, defaultDomain: string): Cookie | null {
    try {
      const parts = header.split(';').map((p) => p.trim())
      const [nameValue, ...attributes] = parts

      const eqIndex = nameValue.indexOf('=')
      if (eqIndex === -1) return null

      const name = nameValue.substring(0, eqIndex).trim()
      const value = nameValue.substring(eqIndex + 1).trim()

      const cookie: Cookie = {
        name,
        value,
        domain: defaultDomain,
        path: '/',
      }

      attributes.forEach((attr) => {
        const colonIndex = attr.indexOf(':')
        const eqIdx = attr.indexOf('=')
        const sepIndex = colonIndex !== -1 ? colonIndex : eqIdx !== -1 ? eqIdx : -1

        if (sepIndex === -1) {
          // 无值的属性，如 Secure, HttpOnly
          const attrName = attr.toLowerCase()
          if (attrName === 'secure') cookie.secure = true
          if (attrName === 'httponly') cookie.httpOnly = true
          return
        }

        const attrName = attr.substring(0, sepIndex).toLowerCase().trim()
        const attrValue = attr.substring(sepIndex + 1).trim()

        switch (attrName) {
          case 'domain':
            // 去掉前导点
            cookie.domain = attrValue.startsWith('.') ? attrValue.slice(1) : attrValue
            break
          case 'path':
            cookie.path = attrValue
            break
          case 'expires':
            const expiresDate = new Date(attrValue)
            if (!isNaN(expiresDate.getTime())) {
              cookie.expires = expiresDate.getTime()
            }
            break
          case 'max-age':
            const maxAge = parseInt(attrValue, 10)
            if (!isNaN(maxAge)) {
              if (maxAge <= 0) {
                cookie.expires = 0 // 立即过期
              } else {
                cookie.expires = Date.now() + maxAge * 1000
              }
            }
            break
          case 'secure':
            cookie.secure = true
            break
          case 'httponly':
            cookie.httpOnly = true
            break
          case 'samesite':
            if (['strict', 'lax', 'none'].includes(attrValue.toLowerCase())) {
              cookie.sameSite = (attrValue.charAt(0).toUpperCase() +
                attrValue.slice(1).toLowerCase()) as Cookie['sameSite']
            }
            break
        }
      })

      return cookie
    } catch (e) {
      console.error('Failed to parse Set-Cookie header:', header, e)
      return null
    }
  }

  /**
   * 从 URL 中提取域名
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname
    } catch {
      return ''
    }
  }

  /**
   * 检查 cookie 是否匹配给定的 URL
   */
  private matchesUrl(cookie: Cookie, url: string): boolean {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname
      const pathname = urlObj.pathname

      // 检查域名匹配（支持子域名）
      let domainMatches = false
      if (cookie.domain.startsWith('.')) {
        domainMatches = hostname.endsWith(cookie.domain) || hostname === cookie.domain.slice(1)
      } else {
        domainMatches = hostname === cookie.domain || hostname.endsWith('.' + cookie.domain)
      }

      // 检查路径匹配
      const pathMatch = pathname === cookie.path || pathname.startsWith(cookie.path + '/')

      // 检查 secure 属性
      const secureMatch = !cookie.secure || urlObj.protocol === 'https:'

      return domainMatches && pathMatch && secureMatch
    } catch {
      return false
    }
  }

  /**
   * 存储响应中的 cookies
   */
  setCookiesFromResponse(url: string, response: Response) {
    const defaultDomain = this.extractDomain(url)

    // 获取所有 Set-Cookie 头
    // 注意：Headers.get() 只返回第一个，需要用 getAll 或遍历
    const setCookieHeaders: string[] = []

    // 尝试获取所有 Set-Cookie 头
    // 某些环境下 headers.getSetCookie() 可用
    if (typeof response.headers.getSetCookie === 'function') {
      setCookieHeaders.push(...response.headers.getSetCookie())
    } else {
      // 回退方案：从 headers 中获取
      const setCookie = response.headers.get('set-cookie')
      if (setCookie) {
        // 简单分割，可能不准确，但大多数情况够用
        setCookieHeaders.push(setCookie)
      }
    }

    setCookieHeaders.forEach((header) => {
      const cookie = this.parseSetCookie(header, defaultDomain)
      if (cookie) {
        this.setCookie(cookie)
      }
    })
  }

  /**
   * 存储 Cookie
   */
  setCookie(cookie: Cookie) {
    // 如果已过期，删除
    if (cookie.expires && cookie.expires <= Date.now()) {
      const key = this.getCookieKey(cookie.name, cookie.domain, cookie.path)
      this.cookies.delete(key)
    } else {
      const key = this.getCookieKey(cookie.name, cookie.domain, cookie.path)
      this.cookies.set(key, cookie)
    }
    this.saveToStorage()
  }

  /**
   * 获取匹配 URL 的所有 cookies
   */
  getCookiesForUrl(url: string): Cookie[] {
    const now = Date.now()
    const matchedCookies: Cookie[] = []

    this.cookies.forEach((cookie) => {
      // 过滤过期
      if (cookie.expires && cookie.expires <= now) {
        this.cookies.delete(this.getCookieKey(cookie.name, cookie.domain, cookie.path))
        return
      }

      if (this.matchesUrl(cookie, url)) {
        matchedCookies.push(cookie)
      }
    })

    // 按路径长度排序，更具体的路径优先
    matchedCookies.sort((a, b) => b.path.length - a.path.length)

    return matchedCookies
  }

  /**
   * 构建 Cookie 请求头
   */
  buildCookieHeader(url: string): string {
    const cookies = this.getCookiesForUrl(url)
    return cookies.map((c) => `${c.name}=${c.value}`).join('; ')
  }

  /**
   * 清除所有 cookies
   */
  clear() {
    this.cookies.clear()
    this.saveToStorage()
  }

  /**
   * 清除指定域名的 cookies
   */
  clearByDomain(domain: string) {
    Array.from(this.cookies.keys())
      .filter((key) => key.startsWith(domain))
      .forEach((key) => this.cookies.delete(key))
    this.saveToStorage()
  }

  /**
   * 获取所有 cookies（调试用）
   */
  getAllCookies(): Cookie[] {
    return Array.from(this.cookies.values())
  }
}

// 导出单例
export const cookieJar = new CookieJar()

export default cookieJar
