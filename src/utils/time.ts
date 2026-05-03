// 毫秒级时间戳
function getTimestamp() {
  return new Date().getTime()
}

function waitUntil(condition: () => boolean) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval)
        resolve(null)
      }
    }, 100)
  })
}

function waitUntilWithTimeout(condition: () => boolean, timeout = 60 * 1000) {
  const now = new Date().getTime()
  const end = now + timeout
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval)
        resolve(null)
      }
      if (new Date().getTime() > end) {
        clearInterval(interval)
        resolve(null)
      }
    }, 100)
  })
}

export { getTimestamp, waitUntil, waitUntilWithTimeout }
