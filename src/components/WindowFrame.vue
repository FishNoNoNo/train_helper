<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core'
import { Minus, Square, X } from 'lucide-vue-next'

const runWindowCommand = async (command: string) => {
  try {
    await invoke(command)
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-slate-100 text-slate-900">
    <div class="flex min-h-0 flex-1 flex-col">
      <header
        data-tauri-drag-region="true"
        class="flex h-11 shrink-0 select-none items-center justify-between border-b border-slate-200 bg-white/90 pl-4"
      >
        <div data-tauri-drag-region="true" class="flex items-center gap-2">
          <div
            data-tauri-drag-region="true"
            class="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-white"
          >
            <img src="/app-icon.png" alt="train helper" class="h-4 w-4" />
          </div>
          <span data-tauri-drag-region="true" class="text-sm font-semibold text-slate-900"
            >Train Helper</span
          >
        </div>

        <div class="flex h-full items-center">
          <button
            type="button"
            data-window-control
            class="flex h-full w-12 items-center justify-center text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            @click="runWindowCommand('window_minimize')"
          >
            <Minus class="h-4 w-4" />
          </button>
          <button
            type="button"
            data-window-control
            class="flex h-full w-12 items-center justify-center text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            @click="runWindowCommand('window_toggle_maximize')"
          >
            <Square class="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            data-window-control
            class="flex h-full w-12 items-center justify-center text-slate-500 transition hover:bg-red-500 hover:text-white"
            @click="runWindowCommand('window_close')"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </header>

      <main class="min-h-0 flex-1 overflow-hidden">
        <slot />
      </main>
    </div>
  </div>
</template>
