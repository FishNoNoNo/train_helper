<script setup lang="ts">
import SearchPage from './components/SearchPage.vue'
import ShiftInfo from './components/ShiftInfo.vue'
import PassengerInfo from './components/PassengerInfo.vue'
import BookingResult from './components/BookingResult.vue'
import appService, {
  bookTicketBatch,
  getSearchForm,
  isLogin,
  logout,
  passengerManager,
} from '@/service/app.service'
import type { Passenger, PassengerData } from '@/service/passenger.service'
import type { Shift } from '@/types/train'
import { invoke } from '@tauri-apps/api/core'
import { LogIn, LogOut } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { useDataStore } from '@/store/dataStore'

type FlowStep = 'search' | 'results' | 'passengers' | 'bookingResult'
type BookingStatus = 'waiting' | 'success' | 'failed'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const dataStore = useDataStore()

const shifts = ref<Shift[]>([])
const selectedShifts = ref<Shift[]>([])
const passengers = ref<Passenger[]>([])
const activeStep = ref<FlowStep>('search')
const passengerLoading = ref(false)
const bookingLoading = ref(false)
const pageMessage = ref('')

const bookingStatus = ref<BookingStatus>('waiting')
const bookingWaitedSeconds = ref(0)
const bookingOrderId = ref('')
const bookingErrorMessage = ref('')
const bookingRetryAttempt = ref(0)
// const bookingShift = computed(() => dataStore.bookingShift)

const pendingBookingKey = 'pending-booking'

const primarySelectedShift = computed(() => selectedShifts.value[0] ?? null)

const getShiftKey = (shift: Shift) =>
  `${shift.trainNo}-${shift.trainDate}-${shift.fromStationCode}-${shift.toStationCode}`

const searchSummary = computed(() => {
  const form = getSearchForm()
  if (!form.departure || !form.destination || !form.date) {
    return ''
  }

  return `${form.departure} -> ${form.destination} · ${form.date}`
})

const isLoggedIn = computed(() => Boolean(userStore.userName || localStorage.getItem('apptk')))

const updateTrayStatus = async (status: string) => {
  try {
    await invoke('update_tray_status', { status })
  } catch (error) {
    console.error(error)
  }
}

const handleSearchSuccess = (result: Shift[]) => {
  shifts.value = result
  selectedShifts.value = []
  activeStep.value = 'results'
  pageMessage.value = result.length ? '' : '暂无班次'
  sessionStorage.removeItem(pendingBookingKey)
}

const goSearch = () => {
  activeStep.value = 'search'
  selectedShifts.value = []
  pageMessage.value = ''
}

const goResults = () => {
  activeStep.value = 'results'
  pageMessage.value = ''
}

const loadPassengers = async () => {
  passengerLoading.value = true
  pageMessage.value = ''

  try {
    const res = await appService.getPassengers(1, 10)
    passengers.value = res?.data?.datas ?? []
  } catch (error) {
    console.error(error)
    passengers.value = []
    pageMessage.value = '乘车人加载失败'
  } finally {
    passengerLoading.value = false
  }
}

const savePendingBooking = (selected: Shift[]) => {
  sessionStorage.setItem(pendingBookingKey, JSON.stringify(selected.map(getShiftKey)))
}

const ensureLoginBeforeBooking = async () => {
  const ok = await isLogin()

  if (ok) {
    return true
  }

  savePendingBooking(selectedShifts.value)
  logout()
  return false
}

const toggleShiftInCart = (shift: Shift) => {
  const key = getShiftKey(shift)
  const exists = selectedShifts.value.some((item) => getShiftKey(item) === key)

  selectedShifts.value = exists
    ? selectedShifts.value.filter((item) => getShiftKey(item) !== key)
    : [...selectedShifts.value, shift]
  pageMessage.value = ''
}

const removeShiftFromCart = (shift: Shift) => {
  const key = getShiftKey(shift)
  selectedShifts.value = selectedShifts.value.filter((item) => getShiftKey(item) !== key)
}

const checkoutCart = async () => {
  if (!selectedShifts.value.length) {
    pageMessage.value = '请先选择班次'
    return
  }

  pageMessage.value = ''
  const canContinue = await ensureLoginBeforeBooking()
  if (!canContinue) {
    router.push({ name: 'login', query: { redirect: '/home', step: 'passengers' } })
    return
  }
  await loadPassengers()
  activeStep.value = 'passengers'
}

const startBooking = async () => {
  if (!selectedShifts.value.length) {
    return
  }

  bookingLoading.value = true
  bookingStatus.value = 'waiting'
  bookingWaitedSeconds.value = 0
  bookingOrderId.value = ''
  bookingErrorMessage.value = ''
  bookingRetryAttempt.value = 0
  // bookingShift.value = null
  dataStore.bookingShift = null
  pageMessage.value = ''
  await updateTrayStatus('抢票中')

  try {
    const result = await bookTicketBatch(selectedShifts.value, {
      maxWaitTime: 60,
      retryTimes: 3,
      onWait: (waitedSeconds) => {
        bookingWaitedSeconds.value = waitedSeconds
        updateTrayStatus(`抢票中，已等待 ${waitedSeconds} 秒`)
      },
      onRetry: (attempt, error) => {
        bookingRetryAttempt.value = attempt
        bookingErrorMessage.value = error.message
        updateTrayStatus(`自动重试第 ${attempt} 次`)
      },
    })

    bookingOrderId.value = result.orderId
    bookingWaitedSeconds.value = result.waitedSeconds
    // bookingShift.value = result.shift ?? null
    bookingStatus.value = 'success'
    await updateTrayStatus('抢票成功，请付款')
  } catch (error) {
    console.error(error)
    bookingErrorMessage.value = error instanceof Error ? error.message : String(error)
    bookingStatus.value = 'failed'
    await updateTrayStatus('抢票失败')
  } finally {
    bookingLoading.value = false
  }
}

const submitBooking = async (configs: PassengerData[], choiceSeats: string[]) => {
  if (!selectedShifts.value.length) {
    pageMessage.value = '请先选择班次'
    return
  }

  if (!configs.length) {
    pageMessage.value = '请先设置乘车人'
    return
  }

  if (choiceSeats.length !== configs.length) {
    pageMessage.value = '请先选择座位'
    return
  }

  passengerManager.limitTickets = []
  passengerManager.passengerDatas = [...configs]
  passengerManager.choiceSeats = [...choiceSeats].sort((left, right) => left.localeCompare(right))
  passengerManager.clearCache()

  activeStep.value = 'bookingResult'
  await startBooking()
}

const restorePendingBooking = async () => {
  const cache = sessionStorage.getItem(pendingBookingKey)
  if (!cache || !appService.logined()) {
    return
  }

  try {
    const pendingKeys = JSON.parse(cache) as string[]
    const searchForm = getSearchForm()

    if (!searchForm.departure || !searchForm.destination || !searchForm.date) {
      sessionStorage.removeItem(pendingBookingKey)
      return
    }

    const loggedIn = await isLogin()
    if (!loggedIn) {
      return
    }

    const result = await appService.queryTickets({
      from: searchForm.departure,
      to: searchForm.destination,
      toDate: searchForm.date,
    })

    shifts.value = result
    const matchedShifts = result.filter((item) => pendingKeys.includes(getShiftKey(item)))

    if (!matchedShifts.length) {
      sessionStorage.removeItem(pendingBookingKey)
      return
    }

    selectedShifts.value = matchedShifts
    await loadPassengers()
    activeStep.value = 'passengers'
  } catch (error) {
    console.error(error)
  } finally {
    sessionStorage.removeItem(pendingBookingKey)
  }
}

const handleLoginBtnClick = async () => {
  if (isLoggedIn.value) {
    logout()
    return
  }

  router.push({ name: 'login', query: { redirect: '/home' } })
}

const continueBooking = () => {
  passengerManager.limitTickets = []
  passengerManager.passengerDatas = []
  passengerManager.choiceSeats = []
  passengerManager.clearCache()
  selectedShifts.value = []
  bookingStatus.value = 'waiting'
  bookingWaitedSeconds.value = 0
  bookingOrderId.value = ''
  bookingErrorMessage.value = ''
  bookingRetryAttempt.value = 0
  // bookingShift.value = null
  dataStore.bookingShift = null
  updateTrayStatus('空闲')
  goSearch()
}

const loadQuery = () => {
  const query = route.query
  if (query.step) {
    activeStep.value = query.step as FlowStep
  }
  if (
    !isLoggedIn.value &&
    (activeStep.value === 'bookingResult' || activeStep.value === 'passengers')
  ) {
    activeStep.value = 'search'
  }
}

const initData = async () => {
  if (activeStep.value === 'results' && !shifts.value.length) {
    activeStep.value = 'search'
  } else if (activeStep.value === 'passengers' && !passengers.value.length) {
    await loadPassengers()
  }
}

onMounted(async () => {
  await updateTrayStatus('空闲')
  loadQuery()
  await restorePendingBooking()
  await initData()
})
</script>

<template>
  <div class="h-full px-4 py-4 box-border">
    <div
      class="mx-auto flex h-full max-w-5xl flex-col rounded-[28px] border border-slate-200 bg-white shadow-sm"
    >
      <header class="border-b border-slate-200 px-5 py-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h1 class="text-xl font-semibold text-slate-900">Train Helper</h1>
            <p v-if="activeStep !== 'search' && searchSummary" class="mt-1 text-sm text-slate-500">
              {{ searchSummary }}
            </p>
          </div>

          <button
            type="button"
            class="inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm"
            :class="
              isLoggedIn
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            "
            @click="handleLoginBtnClick"
          >
            <LogIn v-if="isLoggedIn" class="h-4 w-4" />
            <LogOut v-else class="h-4 w-4" />
            <span>{{ isLoggedIn ? userStore.userName || '已登录' : '未登录' }}</span>
          </button>
        </div>
      </header>

      <section class="flex min-h-0 flex-1 flex-col px-5 py-4">
        <div
          v-if="pageMessage"
          class="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
        >
          {{ pageMessage }}
        </div>

        <div class="min-h-0 flex-1 overflow-hidden">
          <SearchPage
            v-if="activeStep === 'search'"
            class="h-full"
            @search-success="handleSearchSuccess"
          />

          <ShiftInfo
            v-else-if="activeStep === 'results'"
            class="h-full"
            :shifts="shifts"
            :selected-shifts="selectedShifts"
            @change-search="goSearch"
            @toggle-shift="toggleShiftInCart"
            @remove-shift="removeShiftFromCart"
            @checkout="checkoutCart"
          />

          <PassengerInfo
            v-else-if="activeStep === 'passengers'"
            class="h-full"
            :shift="primarySelectedShift"
            :passengers="passengers"
            :loading="passengerLoading"
            :submitting="bookingLoading"
            @back="goResults"
            @refresh="loadPassengers"
            @submit="submitBooking"
          />

          <BookingResult
            v-else
            class="h-full"
            :status="bookingStatus"
            :shift="dataStore.bookingShift"
            :waited-seconds="bookingWaitedSeconds"
            :order-id="bookingOrderId"
            :error-message="bookingErrorMessage"
            :retry-attempt="bookingRetryAttempt"
            @continue="continueBooking"
            @cancel="continueBooking"
            @retry="startBooking"
          />
        </div>
      </section>
    </div>
  </div>
</template>
