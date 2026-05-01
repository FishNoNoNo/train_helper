import bus from '@/lib/utils/eventBus'
import { ClientOptions, fetch as tauriFetch } from '@tauri-apps/plugin-http'
import cookieJar from './cookieJar'

interface Option {
  body?: Record<string, any> | string
  params?: Record<string, any>
  form?: FormData
  headers?: Record<string, string>
  authRequired?: boolean
  returnType?: 'json' | 'text'
  redirect?: 'follow' | 'error' | 'manual'
}

class HttpClient {
  static async handlerResponse(res: Response) {
    const text = await res.text()
    if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
      return JSON.parse(text)
    } else {
      return text
    }
  }

  static insertParams(url: string, params?: Record<string, any>) {
    if (!params) return url

    const urlObj = new URL(url)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObj.searchParams.append(key, String(value))
      }
    })
    return urlObj.toString()
  }

  static async call(
    input: URL | Request | string,
    init?: RequestInit & ClientOptions,
    authRequired = false,
    returnType = 'json',
  ) {
    console.log(JSON.stringify(init))

    // 获取请求 URL（用于 cookie 匹配）
    const urlString =
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

    // 自动添加 Cookie 头
    const cookieHeader = urlString ? cookieJar.buildCookieHeader(urlString) : ''
    const mergedHeaders = {
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...init?.headers,
    }

    const res = await tauriFetch(input, {
      ...init,
      headers: mergedHeaders,
    })

    // 从响应中提取并存储 cookies
    // if (urlString) {
    //   cookieJar.setCookiesFromResponse(urlString, res)
    // }

    const resData = await this.handlerResponse(res)
    if (authRequired) {
      if (returnType === 'json' && !(resData instanceof Object)) {
        bus.emit('user:logout')
      }
    }
    return {
      status: res.status,
      data: resData,
      headers: res.headers,
    }
  }

  static async postX(url: string, option?: Option) {
    let body: string | null = null
    if (option?.body) {
      if (typeof option.body === 'string') {
        body = option.body
      } else {
        body = new URLSearchParams(option.body).toString()
      }
    }

    return await this.call(
      this.insertParams(url, option?.params),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...option?.headers,
        },
        body: body,
      },
      option?.authRequired,
      option?.returnType,
    )
  }

  static async postJ(url: string, option?: Option) {
    return await this.call(
      this.insertParams(url, option?.params),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...option?.headers,
        },
        body: option?.body ? JSON.stringify(option?.body) : null,
      },
      option?.authRequired,
      option?.returnType,
    )
  }

  static async postF(url: string, option?: Option) {
    return await this.call(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          ...option?.headers,
        },
        body: option?.form,
      },
      option?.authRequired,
      option?.returnType,
    )
  }

  static async get(url: string, option?: Option) {
    return await this.call(
      this.insertParams(url, option?.params),
      {
        method: 'GET',
        headers: {
          ...option?.headers,
        },
        redirect: option?.redirect ? option.redirect : 'manual',
      },
      option?.authRequired,
      option?.returnType,
    )
  }

  static async put(url: string, option?: Option) {
    return await this.call(
      url,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...option?.headers,
        },
        body: option?.body ? JSON.stringify(option?.body) : null,
      },
      option?.authRequired,
      option?.returnType,
    )
  }

  static async del(url: string, option?: Option) {
    return await this.call(
      url,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...option?.headers,
        },
      },
      option?.authRequired,
      option?.returnType,
    )
  }
  static buildCookies(cookies: Record<string, string>) {
    return Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')
  }
}

export default HttpClient
