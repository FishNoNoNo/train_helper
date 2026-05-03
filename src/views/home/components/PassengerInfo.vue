<script setup lang="ts">
import { passengerManager } from '@/service/app.service'
import type { Passenger, PassengerData } from '@/service/passenger.service'
import type { Shift } from '@/types/train'
import { Check, RefreshCcw, SquareUserRound, TrainFront } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'

interface Props {
  shift: Shift | null
  passengers: Passenger[]
  loading?: boolean
  submitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  submitting: false,
})

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'refresh'): void
  (e: 'submit', configs: PassengerData[], choiceSeats: string[]): void
}>()

const selectedPassengerIds = ref<string[]>([])
const passengerConfigs = ref<Record<string, PassengerData>>({})
const selectedSeatCodes = ref<string[]>([])

const seatTypeOptions = computed(() => {
  if (!props.shift) {
    return []
  }

  const options = [
    { key: 'secondClass', label: '二等座', code: 'O' },
    { key: 'firstClass', label: '一等座', code: 'M' },
    { key: 'topGrade', label: '商务/特等', code: '9' },
    { key: 'hardSeat', label: '硬座', code: '1' },
    { key: 'hardSleeper', label: '硬卧', code: '3' },
    { key: 'softSleeper', label: '软卧', code: '4' },
    { key: 'noSeat', label: '无座', code: 'W' },
  ] as const

  return options.filter((option) => {
    const value = props.shift?.seat[option.key]
    return Boolean(value && value !== '--' && value !== '无')
  })
})

const ticketTypeOptions = [
  { label: '成人票', value: 1 },
  { label: '儿童票', value: 2 },
  { label: '学生票', value: 3 },
  { label: '残军票', value: 4 },
]

const seatColumns = ['A', 'B', 'C', 'D', 'F']
const selectedPassengerCount = computed(() => selectedPassengerIds.value.length)
const visibleSeatRows = computed(() =>
  Array.from({ length: Math.max(selectedPassengerCount.value, 1) }, (_, index) => index + 1),
)

const sortedChoiceSeats = computed(() =>
  [...selectedSeatCodes.value].sort((left, right) => left.localeCompare(right)),
)

const canSubmit = computed(
  () => selectedPassengerCount.value > 0 && selectedSeatCodes.value.length === selectedPassengerCount.value,
)

const isSeatSelected = (seatCode: string) => selectedSeatCodes.value.includes(seatCode)

const trimSeatSelections = () => {
  if (selectedSeatCodes.value.length <= selectedPassengerCount.value) {
    return
  }

  selectedSeatCodes.value = sortedChoiceSeats.value.slice(0, selectedPassengerCount.value)
}

const toggleSeat = (seatCode: string) => {
  if (!selectedPassengerCount.value) {
    return
  }

  if (isSeatSelected(seatCode)) {
    selectedSeatCodes.value = selectedSeatCodes.value.filter((item) => item !== seatCode)
    return
  }

  if (selectedSeatCodes.value.length >= selectedPassengerCount.value) {
    return
  }

  selectedSeatCodes.value = [...selectedSeatCodes.value, seatCode].sort((left, right) =>
    left.localeCompare(right),
  )
}

const togglePassenger = (passenger: Passenger, index: number) => {
  const id = passenger.passenger_uuid
  const selected = selectedPassengerIds.value.includes(id)

  if (selected) {
    selectedPassengerIds.value = selectedPassengerIds.value.filter((item) => item !== id)
    delete passengerConfigs.value[id]
    trimSeatSelections()
    return
  }

  selectedPassengerIds.value = [...selectedPassengerIds.value, id]
  passengerConfigs.value[id] = {
    index,
    passengerUuid: id,
    seatType: seatTypeOptions.value[0]?.code ?? 'O',
    ticketType: Number(passenger.passenger_type || 1),
    chooseSeat: '',
  }
}

const updateSeatType = (passengerId: string, seatType: string) => {
  if (!passengerConfigs.value[passengerId]) {
    return
  }

  passengerConfigs.value[passengerId].seatType = seatType
}

const updateTicketType = (passengerId: string, ticketType: number) => {
  if (!passengerConfigs.value[passengerId]) {
    return
  }

  passengerConfigs.value[passengerId].ticketType = ticketType
}

const submitPassengerConfig = () => {
  const configs = selectedPassengerIds.value.map((id) => passengerConfigs.value[id]).filter(Boolean)

  emit('submit', configs, sortedChoiceSeats.value)
}

const resetConfig = () => {
  selectedPassengerIds.value = []
  passengerConfigs.value = {}
  selectedSeatCodes.value = []
}

watch(
  () => props.passengers,
  () => {
    resetConfig()
  },
)

watch(selectedPassengerCount, trimSeatSelections)

onMounted(() => {
  const passengerDatas = passengerManager.passengerDatas

  if (passengerDatas.length) {
    passengerDatas.forEach((config) => {
      selectedPassengerIds.value = [...selectedPassengerIds.value, config.passengerUuid]
      passengerConfigs.value[config.passengerUuid] = config
    })
  }

  selectedSeatCodes.value = [...passengerManager.choiceSeats].sort((left, right) =>
    left.localeCompare(right),
  )
  trimSeatSelections()
})
</script>

<template>
  <div class="flex h-full flex-col rounded-[24px] border border-slate-200 bg-slate-50 p-4">
    <div class="mb-4 flex items-center justify-between gap-4">
      <h2 class="text-xl font-semibold text-slate-900">乘车人配置</h2>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-full px-3 py-1.5 text-sm text-slate-600 transition hover:bg-white"
          @click="emit('back')"
        >
          返回班次
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:border-slate-300"
          @click="emit('refresh')"
        >
          <RefreshCcw class="h-4 w-4" />
          刷新
        </button>
      </div>
    </div>

    <div
      v-if="shift"
      class="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
    >
      <div class="flex items-center gap-3">
        <div class="rounded-2xl bg-slate-100 p-2 text-slate-500">
          <TrainFront class="h-4 w-4" />
        </div>
        <div>
          <p class="text-sm font-medium text-slate-900">{{ shift.stationTrainCode }}</p>
          <p class="text-xs text-slate-500">
            {{ shift.fromStation }} {{ shift.startTime }} -> {{ shift.toStation }} {{ shift.endTime }}
          </p>
        </div>
      </div>

      <span class="text-xs text-slate-400">{{ shift.useTime }}</span>
    </div>

    <div v-if="loading" class="flex flex-1 items-center justify-center text-sm text-slate-400">
      加载中...
    </div>

    <div
      v-else-if="!passengers.length"
      class="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 text-center text-sm text-slate-400"
    >
      暂无乘车人
    </div>

    <div v-else class="grid min-h-0 flex-1 gap-4 md:grid-cols-[1.2fr_0.8fr]">
      <div class="min-h-0 space-y-3 overflow-y-auto pr-1">
        <article
          v-for="(passenger, index) in passengers"
          :key="passenger.passenger_uuid"
          class="rounded-2xl border p-4 transition"
          :class="
            selectedPassengerIds.includes(passenger.passenger_uuid)
              ? 'border-blue-200 bg-blue-50'
              : 'border-slate-200 bg-white'
          "
        >
          <div class="flex items-start justify-between gap-3">
            <button
              type="button"
              class="flex min-w-0 flex-1 items-start gap-3 text-left"
              @click="togglePassenger(passenger, index)"
            >
              <div
                class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border"
                :class="
                  selectedPassengerIds.includes(passenger.passenger_uuid)
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-slate-300 bg-white text-transparent'
                "
              >
                <Check class="h-3.5 w-3.5" />
              </div>

              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <p class="truncate text-sm font-medium text-slate-900">
                    {{ passenger.passenger_name }}
                  </p>
                  <span class="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                    {{ passenger.passenger_type_name }}
                  </span>
                </div>
                <p class="mt-1 text-xs text-slate-500">
                  {{ passenger.passenger_id_type_name }} · {{ passenger.passenger_id_no }}
                </p>
              </div>
            </button>

            <div class="rounded-2xl bg-slate-100 p-2 text-slate-500">
              <SquareUserRound class="h-4 w-4" />
            </div>
          </div>

          <div
            v-if="selectedPassengerIds.includes(passenger.passenger_uuid)"
            class="mt-4 grid gap-3 border-t border-blue-100 pt-4 sm:grid-cols-2"
          >
            <label class="block">
              <span class="mb-1.5 block text-xs font-medium text-slate-500">座位等级</span>
              <select
                class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                :value="passengerConfigs[passenger.passenger_uuid]?.seatType"
                @change="
                  updateSeatType(passenger.passenger_uuid, ($event.target as HTMLSelectElement).value)
                "
              >
                <option v-for="option in seatTypeOptions" :key="option.code" :value="option.code">
                  {{ option.label }}
                </option>
              </select>
            </label>

            <label class="block">
              <span class="mb-1.5 block text-xs font-medium text-slate-500">票种</span>
              <select
                class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                :value="passengerConfigs[passenger.passenger_uuid]?.ticketType"
                @change="
                  updateTicketType(
                    passenger.passenger_uuid,
                    Number(($event.target as HTMLSelectElement).value),
                  )
                "
              >
                <option v-for="option in ticketTypeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>
        </article>
      </div>

      <div class="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-4">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-slate-900">座位</h3>
          <span class="text-xs text-slate-500">
            {{ selectedSeatCodes.length }}/{{ selectedPassengerCount }}
          </span>
        </div>

        <div class="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          <div v-for="row in visibleSeatRows" :key="row" class="grid grid-cols-[28px_1fr] gap-2">
            <div class="flex items-center text-xs font-medium text-slate-400">{{ row }}</div>
            <div class="grid grid-cols-[1fr_1fr_1fr_20px_1fr_1fr] gap-2">
              <button
                v-for="column in seatColumns"
                :key="`${row}${column}`"
                type="button"
                class="h-9 rounded-xl border text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                :class="
                  isSeatSelected(`${row}${column}`)
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-blue-50'
                "
                :style="column === 'D' ? { gridColumn: '5' } : undefined"
                :disabled="
                  !isSeatSelected(`${row}${column}`) &&
                  selectedSeatCodes.length >= selectedPassengerCount
                "
                @click="toggleSeat(`${row}${column}`)"
              >
                {{ column }}
              </button>
              <div class="col-start-4 row-start-1 flex items-center justify-center text-xs text-slate-300">
                过道
              </div>
            </div>
          </div>
        </div>

        <div class="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
          {{ sortedChoiceSeats.length ? sortedChoiceSeats.join(', ') : '请选择座位' }}
        </div>
      </div>
    </div>

    <div class="mt-4 flex items-center justify-between gap-3">
      <span class="text-sm text-slate-500">已选择 {{ selectedPassengerCount }} 位</span>
      <button
        type="button"
        class="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        :disabled="submitting || !canSubmit"
        @click="submitPassengerConfig"
      >
        {{ submitting ? '提交中...' : '确认预定' }}
      </button>
    </div>
  </div>
</template>
