<!-- src/views/components/SearchPage.vue -->
<script setup lang="ts">
import stations from '@/data/station'
import { debounce } from '@/lib/utils/lodash'
import appService from '@/service/app.service'
import cookieJar from '@/utils/cookieJar'
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  (e: 'searchSuccess', result: any): void
}>()

interface Station {
  code: string
  name: string
  threeCode: string
  pinyin: string
  shortPinyin: string
  id: string
  cityCode: string
  city: string
}

// 搜索表单数据
const searchForm = reactive({
  departure: '',
  destination: '',
  date: '',
})

// 下拉框状态
const departureDropdownOpen = ref(false)
const destinationDropdownOpen = ref(false)
const departureSearchText = ref('')
const destinationSearchText = ref('')

// 将车站对象转换为数组，方便过滤
const stationArray = computed(() => {
  return Object.values(stations)
})
const filteredDepartureStations = ref()
const departureDropdownRef = ref<HTMLElement | null>(null)
const handleDepartureInput = debounce(() => {
  if (!departureSearchText.value) {
    filteredDepartureStations.value = stationArray.value
    console.log(filteredDepartureStations.value, 'null')
  } else {
    const searchLower = departureSearchText.value.toLowerCase()
    searchForm.departure = departureSearchText.value
    filteredDepartureStations.value = stationArray.value.filter(
      (station) =>
        station.name.includes(departureSearchText.value) ||
        station.pinyin.includes(searchLower) ||
        station.shortPinyin.includes(searchLower) ||
        station.code.includes(searchLower) ||
        station.city.includes(departureSearchText.value),
    )
    console.log(filteredDepartureStations.value)
  }

  departureDropdownOpen.value = true
}, 500)
const filteredDestinationStations = ref()
const destinationDropdownRef = ref<HTMLElement | null>(null)
const handleDestinationInput = debounce(() => {
  if (!destinationSearchText.value) {
    filteredDestinationStations.value = stationArray.value
  } else {
    const searchLower = destinationSearchText.value.toLowerCase()
    searchForm.destination = destinationSearchText.value
    filteredDestinationStations.value = stationArray.value.filter(
      (station) =>
        station.name.includes(destinationSearchText.value) ||
        station.pinyin.includes(searchLower) ||
        station.shortPinyin.includes(searchLower) ||
        station.code.includes(searchLower) ||
        station.city.includes(destinationSearchText.value),
    )
  }
  destinationDropdownOpen.value = true
}, 500)

// 选择出发地
const selectDeparture = (station: Station) => {
  searchForm.departure = station.name
  departureSearchText.value = station.name
  departureDropdownOpen.value = false
}

// 选择目的地
const selectDestination = (station: Station) => {
  searchForm.destination = station.name
  destinationSearchText.value = station.name
  destinationDropdownOpen.value = false
}

// 清空出发地
const clearDeparture = () => {
  searchForm.departure = ''
  departureSearchText.value = ''
  departureDropdownOpen.value = false
}

// 清空目的地
const clearDestination = () => {
  searchForm.destination = ''
  destinationSearchText.value = ''
  destinationDropdownOpen.value = false
}

// 点击外部关闭下拉框
const handleClickOutside = (event: MouseEvent) => {
  if (departureDropdownRef.value && !departureDropdownRef.value.contains(event.target as Node)) {
    departureDropdownOpen.value = false
  } else if (
    destinationDropdownRef.value &&
    !destinationDropdownRef.value.contains(event.target as Node)
  ) {
    destinationDropdownOpen.value = false
  }
}

// 搜索函数
const handleSearch = async () => {
  // TODO: 实现搜索逻辑
  console.log('搜索参数：', searchForm)

  // 这里将来会调用API进行搜索
  // 搜索函数暂时为空，等待后续实现
  const res = await appService.queryTickets({
    to: searchForm.destination,
    from: searchForm.departure,
    toDate: searchForm.date,
  })

  console.log(res)
  emit('searchSuccess', res)
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)

  const cookies = cookieJar.getAllCookies()
  cookies.forEach((cookie) => {
    if (cookie.name === '_jc_save_fromStation') {
      const formStattion = decodeURIComponent(cookie.value).split(',')[0]
      departureSearchText.value = formStattion
      searchForm.departure = formStattion
    } else if (cookie.name === '_jc_save_toStation') {
      // url解码
      const toStattion = decodeURIComponent(cookie.value).split(',')[0]
      destinationSearchText.value = toStattion
      searchForm.destination = toStattion
    } else if (cookie.name === '_jc_save_fromDate') {
      searchForm.date = cookie.value
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="search-page">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">车票搜索</h2>
      <form @submit.prevent="handleSearch" class="space-y-6">
        <!-- 出发地 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">出发地</label>
          <div ref="departureDropdownRef" class="relative departure-input">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">🚌</span>
            <input
              v-model="departureSearchText"
              type="text"
              placeholder="请输入或选择出发城市"
              class="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @focus="handleDepartureInput"
              @input="handleDepartureInput"
            />
            <button
              v-if="departureSearchText"
              type="button"
              @click="clearDeparture"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <!-- 下拉列表 -->
            <div
              v-if="departureDropdownOpen && filteredDepartureStations.length > 0"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              <div
                v-for="station in filteredDepartureStations"
                :key="station.threeCode"
                @click="selectDeparture(station)"
                class="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                :class="{ 'border-b border-gray-100': true }"
              >
                <div class="font-medium text-gray-800">{{ station.name }}</div>
                <div class="text-xs text-gray-500">{{ station.city }} · {{ station.pinyin }}</div>
              </div>
            </div>

            <!-- 无结果提示 -->
            <div
              v-if="
                departureDropdownOpen &&
                filteredDepartureStations.length === 0 &&
                departureSearchText
              "
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500"
            >
              未找到匹配的车站
            </div>
          </div>
        </div>

        <!-- 目的地 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">目的地</label>
          <div ref="destinationDropdownRef" class="relative destination-input">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">🎯</span>
            <input
              v-model="destinationSearchText"
              type="text"
              placeholder="请输入或选择到达城市"
              class="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @focus="handleDestinationInput"
              @input="handleDestinationInput"
            />
            <button
              v-if="destinationSearchText"
              type="button"
              @click="clearDestination"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <!-- 下拉列表 -->
            <div
              v-if="destinationDropdownOpen && filteredDestinationStations.length > 0"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              <div
                v-for="station in filteredDestinationStations"
                :key="station.threeCode"
                @click="selectDestination(station)"
                class="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                :class="{ 'border-b border-gray-100': true }"
              >
                <div class="font-medium text-gray-800">{{ station.name }}</div>
                <div class="text-xs text-gray-500">{{ station.city }} · {{ station.pinyin }}</div>
              </div>
            </div>

            <!-- 无结果提示 -->
            <div
              v-if="
                destinationDropdownOpen &&
                filteredDestinationStations.length === 0 &&
                destinationSearchText
              "
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500"
            >
              未找到匹配的车站
            </div>
          </div>
        </div>

        <!-- 出行日期 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">出行日期</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">📅</span>
            <input
              v-model="searchForm.date"
              type="date"
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- 交换出发地和目的地按钮 -->
        <button
          type="button"
          @click="
            () => {
              const temp = searchForm.departure
              searchForm.departure = searchForm.destination
              searchForm.destination = temp
              const tempText = departureSearchText
              departureSearchText = destinationSearchText
              destinationSearchText = tempText
            }
          "
          class="text-blue-600 hover:text-blue-700 text-sm flex items-center justify-center gap-1"
        >
          🔄 交换出发地和目的地
        </button>

        <!-- 搜索按钮 -->
        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span>🔍</span>
          <span>搜索车票</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-page {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

input[type='date'] {
  color-scheme: light;
}

/* 自定义输入框焦点效果 */
input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 滚动条样式 */
.max-h-60::-webkit-scrollbar {
  width: 6px;
}

.max-h-60::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.max-h-60::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.max-h-60::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
