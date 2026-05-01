<!-- src/views/Login.vue -->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CircleCheck, ScanLine, RefreshCcw } from 'lucide-vue-next'
import appService from '@/service/app.service'
import Base64ImageConverter from '@/lib/utils/base64'
const router = useRouter()
const status = ref<'pending' | 'scaned' | 'logined' | 'expired'>('pending')
let timer: number | null = null

const clearTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const login = async () => {
  await appService.userLogin(1)
  await appService.authUamtk()
  await appService.uamauthclient()
  await appService.userLogin(2)
}

const checkStatus = (uuid: string) => {
  clearTimer()

  timer = window.setInterval(() => {
    appService.checkQr(uuid).then((res) => {
      console.log(res)
      const code = Number(res.result_code)
      console.log(code)
      if (code === 1) {
        status.value = 'scaned'
      } else if (code === 2) {
        status.value = 'logined'
        clearTimer()
        login().then(() => {
          router.replace('/home')
        })
      } else if (code === 3) {
        status.value = 'expired'
        // 过期
        clearTimer()
      }
    })
  }, 1000)
}

const createQrcode = () => {
  appService.createQrcode().then((res) => {
    console.log(res)
    const base64Data = res.image
    Base64ImageConverter.displayToContainer(base64Data, 'qr-code')
    checkStatus(res.uuid)
  })
}

const refreshQrcode = () => {
  status.value = 'pending'
  createQrcode()
}

onMounted(() => {
  createQrcode()
})

onUnmounted(() => {
  clearTimer()
})
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
  >
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-96 transform transition-all duration-500">
      <!-- 头部 -->
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">扫码登录</h2>
        <p class="text-sm text-gray-500">请使用12306扫码登录</p>
      </div>

      <!-- 二维码区域 -->
      <div class="flex flex-col items-center">
        <div class="bg-white p-4 rounded-xl shadow-md mb-6">
          <div class="w-48 h-48 bg-gray-200 flex items-center justify-center rounded-lg">
            <!-- 二维码占位 -->
            <div v-if="status === 'pending'" class="text-center" id="qr-code"></div>
            <div
              v-else-if="status === 'scaned'"
              class="flex flex-col items-center justify-center gap-2"
            >
              <CircleCheck class="text-emerald-500" />
              <p class="text-xs text-gray-400 mt-2">扫描成功,请在手机上确认</p>
            </div>
            <div
              v-else-if="status === 'logined'"
              class="flex flex-col items-center justify-center gap-2"
            >
              <CircleCheck class="text-emerald-500" />
              <p class="text-xs text-gray-400 mt-2">登录成功</p>
            </div>
            <div v-else class="flex flex-col items-center justify-center gap-2">
              <p class="text-xs text-gray-400">二维码已过期</p>
              <button
                @click="refreshQrcode"
                class="text-sm text-gray-500 hover:text-gray-600 transition-colors duration-300"
              >
                <RefreshCcw />
                刷新
              </button>
            </div>
          </div>
        </div>

        <div class="text-center flex justify-center gap-2">
          <ScanLine />
          <span class="text-gray-700 font-medium mb-1">打开12306扫一扫</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 如果需要额外的 SCSS 样式可以在这里添加
// Tailwind 已经处理了大部分样式
</style>
