<script setup lang="ts">
import { open } from '@/utils/opener'
import { Github as GithubIcon } from 'lucide-vue-next'
</script>
<template>
  <a
    class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:border-slate-300 hover:text-slate-900 cursor-pointer"
    @click.prevent="open('https://github.com/FishNoNoNo/train_helper.git')"
  >
    <GithubIcon class="h-4 w-4" />
    GitHub
  </a>
</template>
