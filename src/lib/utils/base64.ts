/**
 * Base64 图片转换工具类
 * 支持浏览器和 Node.js 环境
 */

// 类型定义
interface ParseResult {
  pureBase64: string
  mimeType: string
  extension: string
}

interface ConvertOptions {
  quality?: number // 图片质量 0-1，仅对 JPEG 有效
  maxWidth?: number // 最大宽度
  maxHeight?: number // 最大高度
}

class Base64ImageConverter {
  /**
   * 解析 base64 字符串，提取纯数据和 mime 类型
   * @param base64Str - Base64 字符串（可包含 data:image/xxx;base64, 前缀）
   * @returns 解析结果对象
   */
  static parseBase64(base64Str: string): ParseResult {
    let pureBase64: string = base64Str
    let mimeType: string = 'image/png'
    let extension: string = 'png'

    if (base64Str.includes('base64,')) {
      const matches = base64Str.match(/^data:image\/(\w+);base64,(.+)$/)
      if (matches) {
        extension = matches[1]
        mimeType = `image/${extension}`
        pureBase64 = matches[2]
      } else {
        pureBase64 = base64Str.split('base64,')[1]
      }
    }

    return { pureBase64, mimeType, extension }
  }

  /**
   * 验证 base64 字符串是否有效
   * @param base64Str - Base64 字符串
   * @returns 是否有效
   */
  static isValidBase64(base64Str: string): boolean {
    try {
      const { pureBase64 } = this.parseBase64(base64Str)
      return /^[A-Za-z0-9+/]*={0,2}$/.test(pureBase64)
    } catch {
      return false
    }
  }

  static toBlob(base64Str: string): Blob {
    const { pureBase64, mimeType } = this.parseBase64(base64Str)

    const byteCharacters: string = atob(pureBase64)
    const byteArrays: Uint8Array[] = []

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice: string = byteCharacters.slice(offset, offset + 512)
      const byteNumbers: number[] = new Array(slice.length)

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }

      byteArrays.push(new Uint8Array(byteNumbers))
    }

    // 使用类型断言解决类型冲突
    return new Blob(byteArrays as BlobPart[], { type: mimeType })
  }

  /**
   * 转换为 File 对象（浏览器环境，用于上传）
   * @param base64Str - Base64 字符串
   * @param filename - 文件名
   * @returns File 对象
   */
  static toFile(base64Str: string, filename: string = 'image.png'): File {
    const blob: Blob = this.toBlob(base64Str)
    const { mimeType } = this.parseBase64(base64Str)
    return new File([blob], filename, { type: mimeType })
  }

  /**
   * 转换为 Image 对象（浏览器环境）
   * @param base64Str - Base64 字符串
   * @returns Promise<HTMLImageElement>
   */
  static toImage(base64Str: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img: HTMLImageElement = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Base64 转换失败：无效的图片数据'))
      img.src = base64Str.includes('base64,') ? base64Str : `data:image/png;base64,${base64Str}`
    })
  }

  /**
   * 转换并可选调整大小（浏览器环境）
   * @param base64Str - Base64 字符串
   * @param options - 转换选项
   * @returns Promise<string> 新的 Base64 字符串
   */
  static async convertWithOptions(
    base64Str: string,
    options: ConvertOptions = {},
  ): Promise<string> {
    const img = await this.toImage(base64Str)
    const canvas: HTMLCanvasElement = document.createElement('canvas')
    let { width, height } = img

    // 调整尺寸
    if (options.maxWidth && width > options.maxWidth) {
      height = (height * options.maxWidth) / width
      width = options.maxWidth
    }
    if (options.maxHeight && height > options.maxHeight) {
      width = (width * options.maxHeight) / height
      height = options.maxHeight
    }

    canvas.width = width
    canvas.height = height

    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('无法获取 Canvas 上下文')
    }

    ctx.drawImage(img, 0, 0, width, height)

    const { extension } = this.parseBase64(base64Str)
    const format: string = extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : 'image/png'
    const quality: number = options.quality ?? 0.92

    return canvas.toDataURL(format, quality)
  }

  /**
   * 下载 Base64 图片（浏览器环境）
   * @param base64Str - Base64 字符串
   * @param filename - 下载的文件名
   */
  static download(base64Str: string, filename: string = 'image.png'): void {
    const link: HTMLAnchorElement = document.createElement('a')
    link.download = filename
    link.href = base64Str.includes('base64,') ? base64Str : `data:image/png;base64,${base64Str}`
    link.click()
  }

  /**
   * 复制图片到剪贴板（浏览器环境）
   * @param base64Str - Base64 字符串
   * @returns Promise<void>
   */
  static async copyToClipboard(base64Str: string): Promise<void> {
    try {
      const blob: Blob = this.toBlob(base64Str)
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])
    } catch (error) {
      throw new Error(`复制失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 显示图片到指定容器（浏览器环境）
   * @param base64Str - Base64 字符串
   * @param containerId - 容器元素 ID
   */
  static async displayToContainer(base64Str: string, containerId: string): Promise<void> {
    const container: HTMLElement | null = document.getElementById(containerId)
    if (!container) {
      throw new Error(`容器 ${containerId} 不存在`)
    }

    try {
      const img: HTMLImageElement = await this.toImage(base64Str)
      container.innerHTML = ''
      container.appendChild(img)
    } catch (error) {
      throw new Error(`显示图片失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

// 导出便捷函数
export const base64ToBlob = Base64ImageConverter.toBlob.bind(Base64ImageConverter)
export const base64ToFile = Base64ImageConverter.toFile.bind(Base64ImageConverter)
export const base64ToImage = Base64ImageConverter.toImage.bind(Base64ImageConverter)
export const downloadBase64Image = Base64ImageConverter.download.bind(Base64ImageConverter)
export const isValidBase64 = Base64ImageConverter.isValidBase64.bind(Base64ImageConverter)

export default Base64ImageConverter
