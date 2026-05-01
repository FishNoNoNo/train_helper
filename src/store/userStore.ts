import { defineStore } from 'pinia'

export interface UserStore {
  userName: string
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userName: '',
  }),
  actions: {
    setUser(user: UserStore) {
      this.userName = user.userName
    },
    removeUser() {
      this.userName = ''
    },
  },
})
