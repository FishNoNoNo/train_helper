<script setup lang="ts">
import stations from '@/data/station'
import appService, { getSearchForm } from '@/service/app.service'
import { ArrowUpDown, CalendarDays, MapPin, Search } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

const emit = defineEmits<{
  (e: 'searchSuccess', result: any[]): void
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

const searchForm = reactive({
  departure: '',
  destination: '',
  date: '',
})

const departureOpen = ref(false)
const destinationOpen = ref(false)
const departureSearchText = ref('')
const destinationSearchText = ref('')
const isSearching = ref(false)

const departureDropdownRef = ref<HTMLElement | null>(null)
const destinationDropdownRef = ref<HTMLElement | null>(null)

const stationArray = computed<Station[]>(() => Object.values(stations))

const filterStations = (keyword: string) => {
  const value = keyword.trim().toLowerCase()

  if (!value) {
    return stationArray.value.slice(0, 30)
  }

  return stationArray.value
    .filter(
      (station) =>
        station.name.includes(keyword) ||
        station.city.includes(keyword) ||
        station.pinyin.includes(value) ||
        station.shortPinyin.includes(value) ||
        station.code.includes(value),
    )
    .slice(0, 30)
}

const filteredDepartureStations = computed(() => filterStations(departureSearchText.value))
const filteredDestinationStations = computed(() => filterStations(destinationSearchText.value))

const selectDeparture = (station: Station) => {
  searchForm.departure = station.name
  departureSearchText.value = station.name
  departureOpen.value = false
}

const selectDestination = (station: Station) => {
  searchForm.destination = station.name
  destinationSearchText.value = station.name
  destinationOpen.value = false
}

const swapStations = () => {
  const departure = searchForm.departure
  const destination = searchForm.destination

  searchForm.departure = destination
  searchForm.destination = departure
  departureSearchText.value = searchForm.departure
  destinationSearchText.value = searchForm.destination
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node

  if (departureDropdownRef.value && !departureDropdownRef.value.contains(target)) {
    departureOpen.value = false
  }

  if (destinationDropdownRef.value && !destinationDropdownRef.value.contains(target)) {
    destinationOpen.value = false
  }
}

const handleSearch = async () => {
  if (!searchForm.departure || !searchForm.destination || !searchForm.date) {
    return
  }

  isSearching.value = true

  try {
    const res = await appService.queryTickets({
      to: searchForm.destination,
      from: searchForm.departure,
      toDate: searchForm.date,
    })
    emit('searchSuccess', res)
  } finally {
    isSearching.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)

  const cache = getSearchForm()
  if (cache) {
    searchForm.departure = cache.departure
    searchForm.destination = cache.destination
    searchForm.date = cache.date
    departureSearchText.value = cache.departure
    destinationSearchText.value = cache.destination
  }

  if (!searchForm.date) {
    searchForm.date = new Date().toISOString().slice(0, 10)
  }
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="flex h-full flex-col rounded-[24px] border border-slate-200 bg-slate-50 p-4">
    <div class="mb-4 flex items-center justify-between gap-4">
      <h2 class="text-xl font-semibold text-slate-900">搜索车票</h2>
    </div>

    <form class="flex flex-1 flex-col" @submit.prevent="handleSearch">
      <div class="grid gap-3 md:grid-cols-[1fr_56px_1fr]">
        <div ref="departureDropdownRef" class="relative">
          <label class="mb-2 block text-sm font-medium text-slate-700">出发地</label>
          <div class="relative">
            <MapPin
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              v-model="departureSearchText"
              type="text"
              placeholder="输入站点或拼音"
              class="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              @focus="departureOpen = true"
              @input="
                () => {
                  departureOpen = true
                  searchForm.departure = departureSearchText
                }
              "
            />
          </div>

          <div
            v-if="departureOpen"
            class="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-10 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg"
          >
            <div v-if="filteredDepartureStations.length" class="max-h-56 overflow-y-auto">
              <button
                v-for="station in filteredDepartureStations"
                :key="station.threeCode"
                type="button"
                class="flex w-full items-start justify-between rounded-xl px-3 py-2 text-left transition hover:bg-slate-50"
                @click="selectDeparture(station)"
              >
                <span class="text-sm font-medium text-slate-900">{{ station.name }}</span>
                <span class="text-xs text-slate-400">{{ station.pinyin }}</span>
              </button>
            </div>
            <p v-else class="px-3 py-6 text-center text-sm text-slate-400">没有匹配站点</p>
          </div>
        </div>

        <div class="flex items-end justify-center">
          <button
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
            @click="swapStations"
          >
            <ArrowUpDown class="h-4 w-4" />
          </button>
        </div>

        <div ref="destinationDropdownRef" class="relative">
          <label class="mb-2 block text-sm font-medium text-slate-700">目的地</label>
          <div class="relative">
            <MapPin
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              v-model="destinationSearchText"
              type="text"
              placeholder="输入站点或拼音"
              class="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              @focus="destinationOpen = true"
              @input="
                () => {
                  destinationOpen = true
                  searchForm.destination = destinationSearchText
                }
              "
            />
          </div>

          <div
            v-if="destinationOpen"
            class="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-10 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg"
          >
            <div v-if="filteredDestinationStations.length" class="max-h-56 overflow-y-auto">
              <button
                v-for="station in filteredDestinationStations"
                :key="station.threeCode"
                type="button"
                class="flex w-full items-start justify-between rounded-xl px-3 py-2 text-left transition hover:bg-slate-50"
                @click="selectDestination(station)"
              >
                <span class="text-sm font-medium text-slate-900">{{ station.name }}</span>
                <span class="text-xs text-slate-400">{{ station.pinyin }}</span>
              </button>
            </div>
            <p v-else class="px-3 py-6 text-center text-sm text-slate-400">没有匹配站点</p>
          </div>
        </div>
      </div>

      <div class="mt-3 max-w-xs">
        <label class="mb-2 block text-sm font-medium text-slate-700">出发日期</label>
        <div class="relative">
          <CalendarDays
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            v-model="searchForm.date"
            type="date"
            class="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>

      <div class="mt-auto flex justify-end pt-5">
        <button
          type="submit"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          :disabled="
            isSearching || !searchForm.departure || !searchForm.destination || !searchForm.date
          "
        >
          <Search class="h-4 w-4" />
          <span>{{ isSearching ? '搜索中...' : '搜索车票' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
