import bus from '@/lib/utils/eventBus'
import { useUserStore } from '@/store/userStore'
import { useDataStore } from '@/store/dataStore'
import { useRouter } from 'vue-router'
interface EventPayload<T = any> {
  type: string
  data: T
}

let userStore: ReturnType<typeof useUserStore> | null = null
let dataStore: ReturnType<typeof useDataStore> | null = null
let router: ReturnType<typeof useRouter> | null = null

class EventHandler {
  private eventHandlerMap: Record<string, (payload: EventPayload) => void> = {}

  handleSetUser(payload: EventPayload) {
    const user = payload.data
    userStore?.setUser(user)
  }

  handleLogout() {
    userStore?.removeUser()
    localStorage.removeItem('apptk')
    router?.replace('/login')
    console.log('logout')
  }

  handleStartBookShift(payload: EventPayload) {
    const shift = payload.data
    dataStore &&
      dataStore.$patch({
        bookingShift: shift,
      })
  }

  init() {
    this.eventHandlerMap = {
      'user:set': this.handleSetUser,
      'user:logout': this.handleLogout,
      'shift:start:book': this.handleStartBookShift,
    }
    for (const key in this.eventHandlerMap) {
      if (!this.eventHandlerMap[key]) continue
      bus.on(key, this.eventHandlerMap[key])
    }
    userStore = useUserStore()
    dataStore = useDataStore()
    router = useRouter()
  }

  destroy() {
    for (const key in this.eventHandlerMap) {
      if (!this.eventHandlerMap[key]) continue
      bus.off(key, this.eventHandlerMap[key])
    }
  }
}

const eventHandler = new EventHandler()
export default eventHandler
