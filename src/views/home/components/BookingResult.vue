<script setup lang="ts">
import type { Shift } from '@/types/train'
import { CheckCircle2, Clock3, RotateCcw, X, XCircle } from 'lucide-vue-next'

interface Props {
  status: 'waiting' | 'success' | 'failed'
  shift: Shift | null
  waitedSeconds: number
  orderId: string
  errorMessage: string
  retryAttempt: number
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'continue'): void
  (e: 'retry'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <div class="flex h-full flex-col rounded-[24px] border border-slate-200 bg-slate-50 p-5">
    <div
      class="relative flex flex-1 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 text-center"
    >
      <div
        class="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl"
        :class="
          status === 'success'
            ? 'bg-emerald-50 text-emerald-600'
            : status === 'failed'
              ? 'bg-red-50 text-red-600'
              : 'bg-blue-50 text-blue-600'
        "
      >
        <CheckCircle2 v-if="status === 'success'" class="h-9 w-9" />
        <XCircle v-else-if="status === 'failed'" class="h-9 w-9" />
        <Clock3 v-else class="h-9 w-9" />
      </div>

      <template v-if="status === 'success'">
        <h2 class="text-2xl font-semibold text-slate-900">抢票成功</h2>
        <p class="mt-3 text-sm text-slate-500">请打开 12306 手机客户端完成付款。</p>
        <p v-if="orderId" class="mt-2 text-sm text-slate-400">订单号 {{ orderId }}</p>
      </template>

      <template v-else-if="status === 'failed'">
        <h2 class="text-2xl font-semibold text-slate-900">预定失败</h2>
        <p class="mt-3 max-w-md text-sm leading-6 text-slate-500">
          {{ errorMessage || '当前预定未成功，可以稍后重试。' }}
        </p>
      </template>

      <template v-else>
        <h2 class="text-2xl font-semibold text-slate-900">正在预定</h2>
        <div class="mt-3 text-sm text-slate-500">
          <p>已等待 {{ waitedSeconds }} 秒</p>
          <p v-if="retryAttempt > 0 && errorMessage">{{ errorMessage }}</p>
          <p v-if="retryAttempt > 0">自动重试 {{ retryAttempt }} 次</p>
        </div>
      </template>

      <div
        v-if="shift"
        class="mt-6 w-full max-w-lg rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left"
      >
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-lg font-semibold text-slate-900">{{ shift.stationTrainCode }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ shift.trainDate }}</p>
          </div>
          <p class="text-sm text-slate-400">{{ shift.useTime }}</p>
        </div>

        <div class="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div>
            <p class="text-2xl font-semibold text-slate-900">{{ shift.startTime }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ shift.fromStation }}</p>
          </div>
          <div class="text-sm text-slate-300">-></div>
          <div class="text-right">
            <p class="text-2xl font-semibold text-slate-900">{{ shift.endTime }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ shift.toStation }}</p>
          </div>
        </div>
      </div>

      <div class="mt-8 flex items-center gap-3">
        <button
          v-if="status === 'success'"
          type="button"
          class="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
          @click="emit('continue')"
        >
          继续预定
        </button>

        <button
          v-if="status === 'failed'"
          type="button"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
          @click="emit('retry')"
        >
          <RotateCcw class="h-4 w-4" />
          重试
        </button>

        <button
          v-if="status === 'failed' || retryAttempt > 0"
          type="button"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          @click="emit('cancel')"
        >
          <X class="h-4 w-4" />
          取消预定
        </button>
      </div>
    </div>
  </div>
</template>
