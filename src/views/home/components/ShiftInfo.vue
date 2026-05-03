<script setup lang="ts">
import type { Seat, Shift } from '@/types/train.d'
import { ArrowRight, ChevronLeft, ShoppingCart, Ticket, Trash2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'

interface Props {
  shifts: Shift[]
  selectedShifts: Shift[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'changeSearch'): void
  (e: 'toggleShift', shift: Shift): void
  (e: 'removeShift', shift: Shift): void
  (e: 'checkout'): void
}>()

const currentFilter = ref('all')
const cartOpen = ref(false)

const getShiftKey = (shift: Shift) =>
  `${shift.trainNo}-${shift.trainDate}-${shift.fromStationCode}-${shift.toStationCode}`

const filterOptions = computed(() => {
  const options = [{ label: '全部班次', value: 'all' }]

  if (props.shifts.some((shift) => shift.seat.secondClass && shift.seat.secondClass !== '--')) {
    options.push({ label: '二等座', value: 'secondClass' })
  }

  if (props.shifts.some((shift) => shift.seat.firstClass && shift.seat.firstClass !== '--')) {
    options.push({ label: '一等座', value: 'firstClass' })
  }

  if (props.shifts.some((shift) => shift.seat.topGrade && shift.seat.topGrade !== '--')) {
    options.push({ label: '商务座', value: 'topGrade' })
  }

  if (props.shifts.some((shift) => shift.seat.hardSeat && shift.seat.hardSeat !== '--')) {
    options.push({ label: '硬座', value: 'hardSeat' })
  }

  return options
})

const seatFields: Array<{ key: keyof Seat; label: string }> = [
  { key: 'topGrade', label: '商务/特等' },
  { key: 'firstClass', label: '一等座' },
  { key: 'secondClass', label: '二等座' },
  { key: 'hardSeat', label: '硬座' },
  { key: 'hardSleeper', label: '硬卧' },
  { key: 'softSleeper', label: '软卧' },
  { key: 'noSeat', label: '无座' },
]

const selectedShiftKeys = computed(() => new Set(props.selectedShifts.map(getShiftKey)))

const hasSeatValue = (value: string) => Boolean(value && value !== '--' && value !== '无')

const filteredShifts = computed(() => {
  if (currentFilter.value === 'all') {
    return props.shifts
  }

  return props.shifts.filter((shift) => hasSeatValue(shift.seat[currentFilter.value as keyof Seat]))
})

const isSelected = (shift: Shift) => selectedShiftKeys.value.has(getShiftKey(shift))

const handleCheckout = () => {
  cartOpen.value = false
  emit('checkout')
}
</script>

<template>
  <div class="relative flex h-full flex-col rounded-[24px] border border-slate-200 bg-slate-50 p-4">
    <div class="mb-4 flex items-center justify-between gap-4">
      <h2 class="text-xl font-semibold text-slate-900">选择班次</h2>

      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-slate-600 transition hover:bg-white"
        @click="emit('changeSearch')"
      >
        <ChevronLeft class="h-4 w-4" />
        修改搜索
      </button>
    </div>

    <div class="mb-4 flex flex-wrap gap-2">
      <button
        v-for="filter in filterOptions"
        :key="filter.value"
        type="button"
        class="rounded-full border px-3 py-1.5 text-sm transition"
        :class="
          currentFilter === filter.value
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
        "
        @click="currentFilter = filter.value"
      >
        {{ filter.label }}
      </button>
    </div>

    <div v-if="filteredShifts.length" class="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
      <article
        v-for="shift in filteredShifts"
        :key="getShiftKey(shift)"
        class="rounded-2xl border p-4 transition"
        :class="
          isSelected(shift)
            ? 'border-blue-200 bg-blue-50'
            : 'border-slate-200 bg-white hover:border-slate-300'
        "
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex-1 flex flex-col">
            <div class="flex items-center justify-between gap-2">
              <span class="text-lg font-semibold text-slate-900">{{ shift.stationTrainCode }}</span>
              <span
                v-if="!shift.canBook"
                class="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700"
              >
                {{ shift.tip }}
              </span>
              <button
                type="button"
                class="inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition"
                :class="
                  isSelected(shift)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                "
                @click="emit('toggleShift', shift)"
              >
                <Ticket class="h-4 w-4" />
                {{ isSelected(shift) ? '已加入' : '加入购物车' }}
              </button>
            </div>

            <div class="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div>
                <p class="text-2xl font-semibold text-slate-900">{{ shift.startTime }}</p>
                <p class="mt-1 text-sm text-slate-500">
                  <span>{{ shift.fromStation }}</span>
                  <span class="ml-1 text-xs">{{ shift.fromPass ? '过' : '始' }}</span>
                </p>
              </div>

              <div class="text-center text-xs text-slate-400">
                <p>{{ shift.useTime }}</p>
                <ArrowRight class="mx-auto my-1 h-4 w-4" />
                <p>直达</p>
              </div>

              <div class="text-right">
                <p class="text-2xl font-semibold text-slate-900">{{ shift.endTime }}</p>
                <p class="mt-1 text-sm text-slate-500">
                  <span class="mr-1 text-xs">{{ shift.toPass ? '过' : '终' }}</span>
                  <span>{{ shift.toStation }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-3 gap-2 md:grid-cols-4">
          <template v-for="field in seatFields" :key="field.key">
            <div
              v-if="shift.seat[field.key]"
              class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <p class="text-xs text-slate-400">{{ field.label }}</p>
              <p class="mt-1 text-sm font-semibold text-slate-800">
                {{ shift.seat[field.key] }}
              </p>
            </div>
          </template>
        </div>
      </article>
    </div>

    <div
      v-else
      class="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400"
    >
      暂无班次
    </div>

    <button
      type="button"
      class="absolute bottom-5 right-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-lg transition hover:bg-slate-800"
      @click="cartOpen = true"
    >
      <ShoppingCart class="h-6 w-6" />
      <span
        v-if="selectedShifts.length"
        class="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-500 px-1 text-xs font-semibold"
      >
        {{ selectedShifts.length }}
      </span>
    </button>

    <div
      v-if="cartOpen"
      class="absolute inset-0 z-20 flex items-end justify-end rounded-[24px] bg-slate-900/20 p-4"
      @click.self="cartOpen = false"
    >
      <div
        class="flex max-h-full w-full max-w-md flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-xl"
      >
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900">已选班次</h3>
          <button
            type="button"
            class="rounded-full px-3 py-1.5 text-sm text-slate-500 transition hover:bg-slate-100"
            @click="cartOpen = false"
          >
            关闭
          </button>
        </div>

        <div v-if="selectedShifts.length" class="min-h-0 flex-1 space-y-2 overflow-y-auto">
          <div
            v-for="shift in selectedShifts"
            :key="getShiftKey(shift)"
            class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
          >
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ shift.stationTrainCode }}</p>
              <p class="mt-1 text-xs text-slate-500">
                {{ shift.startTime }} {{ shift.fromStation }} -> {{ shift.endTime }}
                {{ shift.toStation }}
              </p>
            </div>
            <button
              type="button"
              class="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-red-500"
              @click="emit('removeShift', shift)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          v-else
          class="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400"
        >
          暂未选择班次
        </div>

        <button
          type="button"
          class="mt-4 h-11 rounded-2xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          :disabled="!selectedShifts.length"
          @click="handleCheckout"
        >
          去预定
        </button>
      </div>
    </div>
  </div>
</template>
