<script setup lang="ts">
import Base64ImageConverter from '@/lib/utils/base64'
import appService from '@/service/app.service'
import { CircleCheck, QrCode, RefreshCcw, ScanLine } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const status = ref<'pending' | 'scaned' | 'logined' | 'expired'>('pending')
const qrTip = computed(() => {
  if (status.value === 'scaned') return '已扫码，请在手机上确认登录。'
  if (status.value === 'logined') return '登录成功，正在返回。'
  if (status.value === 'expired') return '二维码已过期，请刷新后重新扫码。'
  return '打开 12306 App 扫码登录。'
})

let timer: number | null = null

const clearTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const queryRef = reactive({
  redirect: '',
  step: '',
})

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
      const code = Number(res.result_code)

      if (code === 1) {
        status.value = 'scaned'
      } else if (code === 2) {
        status.value = 'logined'
        clearTimer()
        login().then(() => {
          router.replace({ path: queryRef.redirect, query: { step: queryRef.step } })
        })
      } else if (code === 3) {
        status.value = 'expired'
        clearTimer()
      }
    })
  }, 1000)
}

const createQrcode = () => {
  appService.createQrcode().then((res) => {
    Base64ImageConverter.displayToContainer(res.image, 'qr-code')
    checkStatus(res.uuid)
  })
}

const refreshQrcode = () => {
  status.value = 'pending'
  createQrcode()
}

const loadQuery = () => {
  const query = route.query
  if (query.redirect) {
    queryRef.redirect = query.redirect as string
  }

  if (query.step) {
    queryRef.step = query.step as string
  }
}

onMounted(() => {
  createQrcode()
  loadQuery()
})

onUnmounted(() => {
  clearTimer()
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-6 box-border">
    <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 class="mt-1 text-2xl font-semibold text-slate-900">扫码登录 12306</h1>
        </div>
        <div class="rounded-2xl bg-slate-100 p-3 text-slate-500">
          <QrCode class="h-5 w-5" />
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div class="flex justify-center">
          <div
            class="flex h-52 w-52 items-center justify-center rounded-2xl border border-slate-200 bg-white"
          >
            <div v-if="status === 'pending'" id="qr-code" class="h-44 w-44 overflow-hidden"></div>

            <div v-else-if="status === 'scaned'" class="flex flex-col items-center gap-3">
              <CircleCheck class="h-10 w-10 text-emerald-500" />
              <p class="text-sm text-slate-500">已扫码</p>
            </div>

            <div v-else-if="status === 'logined'" class="flex flex-col items-center gap-3">
              <CircleCheck class="h-10 w-10 text-emerald-500" />
              <p class="text-sm text-slate-500">登录成功</p>
            </div>

            <div v-else class="flex flex-col items-center gap-3 text-center">
              <p class="text-sm text-slate-500">二维码已过期</p>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                @click="refreshQrcode"
              >
                <RefreshCcw class="h-4 w-4" />
                刷新二维码
              </button>
            </div>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600">
          <ScanLine class="h-4 w-4" />
          <span>{{ qrTip }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
