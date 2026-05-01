import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup
const vueRecommended = pluginVue.configs['flat/recommended']

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  vueRecommended,
  vueTsConfigs.recommended,
  {
    name: 'app/custom-rules',
    rules: {
      // 关闭基础 no-unused-vars（由 TS 插件接管）
      'no-unused-vars': 'off',
      // 启用 TS 版本的未使用变量检查，忽略以下划线开头的参数
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_', // 可选：也忽略下划线变量
          caughtErrorsIgnorePattern: '^_', // 可选：忽略 catch 中的 _
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      'vue/require-default-prop': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  skipFormatting,
)
