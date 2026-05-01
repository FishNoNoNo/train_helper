<!-- src/components/ShiftInfo.vue -->

<script setup lang="ts">
import appService from '@/service/app.service'
import type { Seat, Shift } from '@/types/train.d'
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  shifts: Shift[]
}

const props = defineProps<Props>()

const currentFilter = ref('all')

// const filters = [
//   { label: '全部', value: 'all' },
//   { label: '二等座有余票', value: 'hasSecondClass' },
//   { label: '硬座有余票', value: 'hasHardSeat' },
// ]

const filters = computed(() => {
  const res = [
    {
      label: '全部',
      value: 'all',
    },
  ]
  if (props.shifts.some((shift) => shift.seat.secondClass)) {
    res.push({
      label: '二等座有余票',
      value: 'hasSecondClass',
    })
  }
  if (props.shifts.some((shift) => shift.seat.firstClass)) {
    res.push({
      label: '一等座有余票',
      value: 'hasFirstClass',
    })
  }
  if (props.shifts.some((shift) => shift.seat.topGrade)) {
    res.push({
      label: '特等座有余票',
      value: 'hasTopGrade',
    })
  }
  if (props.shifts.some((shift) => shift.seat.hardSeat)) {
    res.push({
      label: '硬座有余票',
      value: 'hasHardSeat',
    })
  }
  return res
})

// 示例数据

const filteredShifts = computed(() => {
  if (currentFilter.value === 'all') return props.shifts
  else if (currentFilter.value === 'hasSecondClass') {
    return props.shifts.filter((shift) => shift.seat.secondClass && shift.seat.secondClass !== '无')
  } else if (currentFilter.value === 'hasFirstClass') {
    return props.shifts.filter((shift) => shift.seat.firstClass && shift.seat.firstClass !== '无')
  } else if (currentFilter.value === 'hasTopGrade') {
    return props.shifts.filter((shift) => shift.seat.topGrade && shift.seat.topGrade !== '无')
  } else if (currentFilter.value === 'hasHardSeat') {
    return props.shifts.filter((shift) => shift.seat.hardSeat && shift.seat.hardSeat !== '无')
  }

  return props.shifts
})

const fields = [
  {
    key: 'topGrade',
    label: '特等座/商务座',
  },
  {
    key: 'firstClass',
    label: '一等座',
  },
  {
    key: 'secondClass',
    label: '二等座',
  },
  {
    key: 'noSeat',
    label: '无座',
  },
  {
    key: 'hardSeat',
    label: '硬座',
  },
  {
    key: 'hardSleeper',
    label: '硬卧',
  },
  {
    key: 'softSleeper',
    label: '软卧',
  },
]
let timer: number | null = null
const selectShift = async (shift: Shift) => {
  console.log('选中班次:', shift)
  await appService.submitOrderRequest(shift)
  await appService.initDc(shift)
  const res = await appService.getPassengers(1, 10)
  const passengers = res.data.datas
  appService.pushPassenger(0, 'O', 1)
  await appService.checkOrderInfo()
  await appService.getQueueCount(shift, 'O')
  await appService.confirmSingleForQueue()
  let i = 0

  let timer = window.setInterval(async () => {
    const res = await appService.queryOrderWaitTime()
    if (res.data.order_id) {
      console.log('抢票成功,订单号:', res.order_id)
      clearInterval(timer)
    }
    i++
    if (i > 10) {
      clearInterval(timer)
    }
  }, 1000)
}

onMounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }

  // appService.getPassengers(1, 10).then((res) => {
  //   const passengers = res.data.datas
  //   appService.pushPassenger(0, 'O', 1)
  // })
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- 标题 -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">班次信息</h2>
      <p class="text-gray-500 text-sm mt-1">以下是今日所有班次</p>
    </div>

    <!-- 筛选栏 -->
    <div class="flex gap-2 mb-6 flex-wrap">
      <button
        v-for="filter in filters"
        :key="filter.value"
        @click="currentFilter = filter.value"
        class="px-4 py-2 rounded-lg transition-all duration-300"
        :class="
          currentFilter === filter.value
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        "
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- 班次列表 -->
    <div class="space-y-4">
      <div
        v-for="(shift, index) in filteredShifts"
        :key="index"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300"
      >
        <!-- 车次和提示信息 -->
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <span class="text-lg font-bold text-gray-800">{{ shift.stationTrainCode }}</span>
              <!-- <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                {{ shift.tip }}
              </span> -->
            </div>

            <!-- 时间信息 -->
            <div class="flex items-center gap-4 mb-4">
              <div class="text-center">
                <p class="text-xl font-bold text-gray-900">{{ shift.startTime }}</p>
                <p class="text-sm text-gray-500">
                  <span
                    class="text-white p-0.5 text-xs mr-1"
                    :class="{ 'bg-orange-400': !shift.fromPass, 'bg-blue-400': shift.fromPass }"
                    >{{ shift.fromPass ? '过' : '始' }}</span
                  >{{ shift.fromStation }}
                </p>
              </div>
              <div class="flex-1 flex flex-col items-center">
                <div class="text-xs text-gray-400">行驶 {{ shift.useTime }}</div>
                <div class="w-32 h-px bg-gray-300 my-2"></div>
                <div class="text-xs text-gray-400">→</div>
              </div>
              <div class="text-center">
                <p class="text-xl font-bold text-gray-900">{{ shift.endTime }}</p>
                <p class="text-sm text-gray-500">
                  <span
                    class="text-white p-0.5 text-xs mr-1"
                    :class="{
                      'bg-emerald-500': !shift.fromPass,
                      'bg-blue-400': shift.fromPass,
                    }"
                  >
                    {{ shift.fromPass ? '过' : '终' }} </span
                  >{{ shift.toStation }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 座位信息表格 -->
        <div class="border-t pt-4 mb-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-2">座位信息</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <template v-for="field in fields" :key="field.key">
              <div
                v-if="shift.seat[field.key as keyof Seat]"
                class="bg-gray-50 rounded-lg p-2 text-center"
              >
                <p class="text-xs text-gray-500">{{ field.label }}</p>
                <p class="text-lg font-bold text-orange-600">
                  {{ shift.seat[field.key as keyof Seat] }}
                </p>
              </div>
            </template>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="border-t pt-4 flex justify-end">
          <button
            @click="selectShift(shift)"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
          >
            预定
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredShifts.length === 0" class="text-center py-12">
      <p class="text-gray-400">暂无班次信息</p>
    </div>
  </div>
</template>
