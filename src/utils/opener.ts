import { openPath, openUrl } from '@tauri-apps/plugin-opener'

export const open = async (url: string) => {
  if (url.startsWith('http')) {
    await openUrl(url)
  } else {
    await openPath(url)
  }
}
