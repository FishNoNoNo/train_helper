import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification'

async function requestNotificationPermission() {
  let permissionGranted = await isPermissionGranted()
  if (!permissionGranted) {
    const permission = await requestPermission()
    permissionGranted = permission === 'granted'
  }
  return permissionGranted
}

async function notify(title: string, body: string) {
  const permissionGranted = await requestNotificationPermission()
  if (permissionGranted) {
    await sendNotification({ title, body })
  }
}

export { notify }
