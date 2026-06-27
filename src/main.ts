import { tryRunCli } from './cli/runner'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import './assets/index.css'

async function main() {
  // 先检查是否为 CLI 模式；CLI 模式会在命令执行完毕后退出进程，不会走到下面
  const isCli = await tryRunCli()
  if (isCli) {
    // 理论上不会执行到这里（CLI 模式会调用 exit），
    // 但以防万一，阻止后续 GUI 初始化
    throw new Error('Unexpected: CLI runner returned without exiting')
  }

  // ---- GUI 模式 ----
  const app = createApp(App)
  app.use(router)
  app.use(pinia)
  app.mount('#app')
}

main()
