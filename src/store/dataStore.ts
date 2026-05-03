import { Shift } from '@/types/train'
import { defineStore } from 'pinia'

export interface DataStore {
  bookingShift: Shift | null
}

export const useDataStore = defineStore('data', {
  state: () => ({
    bookingShift: null,
  }),
})
