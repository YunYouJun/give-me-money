# Element Plus Decoupling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gradually remove Element Plus from the runtime bundle while preserving the prank-site flow, YunLeFun login behavior, SSR/SSG output, i18n, accessibility, and test coverage.

**Architecture:** Replace Element Plus in dependency order: first introduce a small local UI layer and toast service, then migrate form controls, navigation, table, and pagination, then remove Element Plus config and package entries. Route pages stay composition surfaces; feature state and side effects live in composables or services; presentational controls use explicit props and emits.

**Tech Stack:** Vue 3.5, Vite 8, vite-ssg, TypeScript, Pinia, vue-i18n, UnoCSS/SCSS, Vitest, @vue/test-utils.

---

## Scope

This plan covers only Element Plus decoupling plus the UI/performance work required to keep the app polished after decoupling.

Out of scope:
- Replacing CloudBase or YunLeFun SSO.
- Redesigning copy or product behavior.
- Changing persistence schema for `pay_records` or `counters`.
- Removing `vue-about-me`, PWA, markdown, or icon plugins.

## Component Map

- `src/components/ui/BaseButton.vue`: local button primitive with variant, size, loading, disabled, icon slot, and accessible native button behavior.
- `src/components/ui/BaseInput.vue`: local text/password input with `defineModel`, label association delegated to parent, disabled, maxlength, inputmode, and error state.
- `src/components/ui/BaseCheckbox.vue`: local checkbox with `defineModel<boolean>`, disabled, and wrapping label support.
- `src/components/ui/BaseTooltip.vue`: light CSS tooltip used for short button hints on hover/focus.
- `src/components/ui/BaseToastHost.vue`: singleton toast renderer installed once in `App.vue`.
- `src/composables/useToast.ts`: typed toast state/actions replacing `ElMessage`.
- `src/composables/usePayFormValidation.ts`: native validation rules for pay form.
- `src/components/pay/PayMethodSwitch.vue`: small presentational switch for Alipay/WeChat.
- `src/components/pay/PayActionBar.vue`: submit/reject/switch buttons and counter tooltips.
- `src/components/brothers/BrotherList.vue`: native responsive table with method filter.
- `src/components/brothers/BrotherPagination.vue`: native pagination buttons.
- Route pages: `src/pages/index.vue` and `src/pages/brothers.vue` remain thin composition surfaces.

## Success Metrics

- `pnpm test:run`, `pnpm typecheck`, `pnpm lint`, and `pnpm build` pass.
- `rg -n "element-plus|El[A-Z]|el-" src vite.config.ts package.json` returns no runtime source usage after removal.
- Production build has no `element-*.js` or `element-*.css` output chunks.
- Homepage loads without CloudBase SDK until login/session/API work is triggered.
- Mobile viewport `390x844` has no horizontal overflow on `/` and `/brothers`.
- Keyboard users can tab through nav, language switch, form fields, checkbox, action buttons, filters, and pagination.

---

### Task 1: Baseline And Element Plus Inventory

**Files:**
- Modify: none
- Read: `package.json`
- Read: `vite.config.ts`
- Read: `src/main.ts`
- Read: `src/App.vue`
- Read: `src/components/InfoInput.vue`
- Read: `src/components/brothers/BrotherList.vue`
- Read: `src/pages/brothers.vue`
- Read: `src/components/common/Navbar.vue`

- [ ] **Step 1: Run baseline verification**

Run:

```bash
pnpm test:run
pnpm typecheck
pnpm lint
pnpm build
```

Expected: all commands exit `0`. If `pnpm build` reports existing dependency warnings, record them but do not fix unrelated warnings in this task.

- [ ] **Step 2: Capture current Element Plus usage**

Run:

```bash
rg -n "element-plus|El[A-Z]|el-" src vite.config.ts package.json
```

Expected: matches in app shell, form, table, pagination, message usage, resolver config, and dependency metadata.

- [ ] **Step 3: Commit baseline notes if a file was created**

If no file was created, do not commit. If an inventory note was added, run:

```bash
git add docs/superpowers/plans/2026-06-13-element-plus-decoupling.md
git commit -m "docs(refactor): plan element plus decoupling"
```

---

### Task 2: Add Local Toast Service

**Files:**
- Create: `src/composables/useToast.ts`
- Create: `src/components/ui/BaseToastHost.vue`
- Create: `src/components/ui/BaseToastHost.test.ts`
- Modify: `src/App.vue`

- [ ] **Step 1: Write toast host tests**

Create `src/components/ui/BaseToastHost.test.ts`:

```ts
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import BaseToastHost from './BaseToastHost.vue'
import { clearToasts, showToast } from '~/composables/useToast'

describe('BaseToastHost', () => {
  it('renders and dismisses toast messages', async () => {
    vi.useFakeTimers()
    clearToasts()
    const wrapper = mount(BaseToastHost)

    showToast({ message: 'Saved', type: 'success', duration: 1000 })
    await flushPromises()

    expect(wrapper.text()).toContain('Saved')
    expect(wrapper.get('[role="status"]').classes()).toContain('toast--success')

    await vi.advanceTimersByTimeAsync(1000)
    await flushPromises()
    expect(wrapper.text()).not.toContain('Saved')
  })
})
```

- [ ] **Step 2: Run the new test and verify it fails**

Run:

```bash
pnpm vitest run src/components/ui/BaseToastHost.test.ts
```

Expected: FAIL because `BaseToastHost.vue` and `useToast.ts` do not exist.

- [ ] **Step 3: Implement `useToast.ts`**

Create `src/composables/useToast.ts`:

```ts
import { readonly, shallowRef } from 'vue'

export type ToastType = 'success' | 'warning' | 'error' | 'info'

export interface ToastOptions {
  message: string
  type?: ToastType
  duration?: number
}

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

const toasts = shallowRef<ToastItem[]>([])
let nextToastId = 1

export function showToast(options: ToastOptions) {
  const item: ToastItem = {
    id: nextToastId++,
    message: options.message,
    type: options.type || 'info',
  }

  toasts.value = [...toasts.value, item]

  const duration = options.duration ?? 3200
  if (duration > 0) {
    window.setTimeout(() => {
      dismissToast(item.id)
    }, duration)
  }
}

export function dismissToast(id: number) {
  toasts.value = toasts.value.filter(item => item.id !== id)
}

export function clearToasts() {
  toasts.value = []
}

export function useToast() {
  return {
    toasts: readonly(toasts),
    showToast,
    dismissToast,
  }
}
```

- [ ] **Step 4: Implement `BaseToastHost.vue`**

Create `src/components/ui/BaseToastHost.vue`:

```vue
<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { toasts, dismissToast } = useToast()
</script>

<template>
  <div class="toast-host" aria-live="polite" aria-relevant="additions removals">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      role="status"
      class="toast"
      :class="`toast--${toast.type}`"
    >
      <span class="toast-message">{{ toast.message }}</span>
      <button
        class="toast-close"
        type="button"
        aria-label="Close message"
        @click="dismissToast(toast.id)"
      >
        ×
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.toast-host {
  position: fixed;
  z-index: 3000;
  top: 1rem;
  right: 1rem;
  display: grid;
  width: min(24rem, calc(100vw - 2rem));
  gap: 0.75rem;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  text-align: left;
  pointer-events: auto;
  border: 1px solid rgba(31, 41, 51, 0.12);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(31, 41, 51, 0.14);
}

.toast--success { border-color: rgba(31, 146, 91, 0.3); }
.toast--warning { border-color: rgba(196, 137, 36, 0.34); }
.toast--error { border-color: rgba(196, 70, 70, 0.34); }
.toast--info { border-color: rgba(71, 118, 171, 0.3); }

.toast-message {
  line-height: 1.45;
}

.toast-close {
  flex: 0 0 auto;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  color: inherit;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 50%;
}
</style>
```

- [ ] **Step 5: Mount toast host in `App.vue`**

Modify `src/App.vue` template:

```vue
<template>
  <ElConfigProvider :locale="app.locale">
    <router-view />
    <BaseToastHost />
  </ElConfigProvider>
</template>
```

This task still allows `ElConfigProvider`; it will be removed in Task 7.

- [ ] **Step 6: Verify and commit**

Run:

```bash
pnpm vitest run src/components/ui/BaseToastHost.test.ts
pnpm typecheck
pnpm lint
```

Expected: all pass.

Commit:

```bash
git add src/composables/useToast.ts src/components/ui/BaseToastHost.vue src/components/ui/BaseToastHost.test.ts src/App.vue
git commit -m "feat(ui): add local toast host"
```

---

### Task 3: Add Local Form Controls

**Files:**
- Create: `src/components/ui/BaseButton.vue`
- Create: `src/components/ui/BaseInput.vue`
- Create: `src/components/ui/BaseCheckbox.vue`
- Create: `src/components/ui/BaseTooltip.vue`
- Create: `src/components/ui/BaseButton.test.ts`
- Create: `src/components/ui/BaseInput.test.ts`

- [ ] **Step 1: Write button and input tests**

Create `src/components/ui/BaseButton.test.ts`:

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BaseButton from './BaseButton.vue'

describe('BaseButton', () => {
  it('emits click only when enabled', async () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Save' } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)

    await wrapper.setProps({ disabled: true })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('announces loading state', () => {
    const wrapper = mount(BaseButton, { props: { loading: true }, slots: { default: 'Save' } })
    expect(wrapper.get('button').attributes('aria-busy')).toBe('true')
    expect(wrapper.text()).toContain('Save')
  })
})
```

Create `src/components/ui/BaseInput.test.ts`:

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BaseInput from './BaseInput.vue'

describe('BaseInput', () => {
  it('updates model value on input', async () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }),
      },
    })

    await wrapper.get('input').setValue('alice')
    expect(wrapper.props('modelValue')).toBe('alice')
  })
})
```

- [ ] **Step 2: Implement controls**

Create `src/components/ui/BaseButton.vue`:

```vue
<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: 'button' | 'submit'
  variant?: 'primary' | 'danger' | 'success' | 'neutral'
  size?: 'default' | 'small'
  disabled?: boolean
  loading?: boolean
}>(), {
  type: 'button',
  variant: 'neutral',
  size: 'default',
})

const emit = defineEmits<{
  click: [MouseEvent]
}>()

function onClick(event: MouseEvent) {
  if (props.disabled || props.loading)
    return
  emit('click', event)
}
</script>

<template>
  <button
    class="base-button"
    :class="[`base-button--${variant}`, `base-button--${size}`]"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : undefined"
    @click="onClick"
  >
    <span v-if="loading" class="base-button-spinner" aria-hidden="true" />
    <slot name="icon" />
    <span class="base-button-label"><slot /></span>
  </button>
</template>

<style scoped lang="scss">
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 2.25rem;
  padding: 0.45rem 0.875rem;
  color: #2c3e50;
  cursor: pointer;
  border: 1px solid rgba(44, 62, 80, 0.16);
  border-radius: 8px;
  background: #fff;
}

.base-button--small {
  min-height: 2rem;
  padding: 0.35rem 0.7rem;
  font-size: 0.875rem;
}

.base-button--primary { color: #0f6f78; border-color: rgba(15, 111, 120, 0.35); }
.base-button--danger { color: #b23a48; border-color: rgba(178, 58, 72, 0.35); }
.base-button--success { color: #1f7a4d; border-color: rgba(31, 122, 77, 0.35); }

.base-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}
</style>
```

Create `src/components/ui/BaseInput.vue`:

```vue
<script setup lang="ts">
const model = defineModel<string>({ required: true })

withDefaults(defineProps<{
  id?: string
  type?: 'text' | 'password'
  placeholder?: string
  disabled?: boolean
  maxlength?: number
  inputmode?: 'text' | 'numeric'
  invalid?: boolean
}>(), {
  type: 'text',
  inputmode: 'text',
})
</script>

<template>
  <input
    :id="id"
    v-model="model"
    class="base-input"
    :class="{ 'is-invalid': invalid }"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :maxlength="maxlength"
    :inputmode="inputmode"
    :aria-invalid="invalid ? 'true' : undefined"
  >
</template>

<style scoped lang="scss">
.base-input {
  width: 100%;
  min-height: 2.35rem;
  padding: 0.45rem 0.65rem;
  color: #2c3e50;
  border: 1px solid rgba(44, 62, 80, 0.18);
  border-radius: 8px;
  background: #fff;
}

.base-input:focus {
  border-color: #0f6f78;
  outline: 2px solid rgba(15, 111, 120, 0.14);
}

.base-input.is-invalid {
  border-color: #b23a48;
}
</style>
```

Create `src/components/ui/BaseCheckbox.vue`:

```vue
<script setup lang="ts">
const model = defineModel<boolean>({ required: true })

defineProps<{
  disabled?: boolean
}>()
</script>

<template>
  <label class="base-checkbox">
    <input
      v-model="model"
      class="base-checkbox-input"
      type="checkbox"
      :disabled="disabled"
    >
    <span class="base-checkbox-box" aria-hidden="true" />
    <span class="base-checkbox-label"><slot /></span>
  </label>
</template>

<style scoped lang="scss">
.base-checkbox {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.55rem;
  text-align: left;
  cursor: pointer;
}

.base-checkbox-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.base-checkbox-box {
  display: inline-flex;
  flex: 0 0 auto;
  width: 1rem;
  height: 1rem;
  margin-top: 0.18rem;
  border: 1px solid rgba(44, 62, 80, 0.3);
  border-radius: 4px;
  background: #fff;
}

.base-checkbox-input:checked + .base-checkbox-box {
  border-color: #0f6f78;
  background: #0f6f78;
  box-shadow: inset 0 0 0 3px #fff;
}

.base-checkbox-input:focus-visible + .base-checkbox-box {
  outline: 2px solid rgba(15, 111, 120, 0.24);
  outline-offset: 2px;
}

.base-checkbox-input:disabled ~ .base-checkbox-label {
  cursor: not-allowed;
  opacity: 0.62;
}
</style>
```

Create `src/components/ui/BaseTooltip.vue`:

```vue
<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>

<template>
  <span class="base-tooltip">
    <slot />
    <span class="base-tooltip-content" role="tooltip">{{ content }}</span>
  </span>
</template>

<style scoped lang="scss">
.base-tooltip {
  position: relative;
  display: inline-flex;
}

.base-tooltip-content {
  position: absolute;
  z-index: 20;
  bottom: calc(100% + 0.45rem);
  left: 50%;
  width: max-content;
  max-width: min(16rem, 80vw);
  padding: 0.4rem 0.55rem;
  color: #2c3e50;
  font-size: 0.8125rem;
  line-height: 1.35;
  pointer-events: none;
  opacity: 0;
  border: 1px solid rgba(44, 62, 80, 0.12);
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(31, 41, 51, 0.14);
  transform: translate(-50%, 0.25rem);
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.base-tooltip:hover .base-tooltip-content,
.base-tooltip:focus-within .base-tooltip-content {
  opacity: 1;
  transform: translate(-50%, 0);
}
</style>
```

- [ ] **Step 3: Verify and commit**

Run:

```bash
pnpm vitest run src/components/ui/BaseButton.test.ts src/components/ui/BaseInput.test.ts
pnpm typecheck
pnpm lint
```

Expected: all pass.

Commit:

```bash
git add src/components/ui
git commit -m "feat(ui): add local form controls"
```

---

### Task 4: Migrate Pay Form Off Element Plus

**Files:**
- Create: `src/composables/usePayFormValidation.ts`
- Create: `src/composables/usePayFormValidation.test.ts`
- Create: `src/components/pay/PayActionBar.vue`
- Create: `src/components/pay/PayMethodSwitch.vue`
- Modify: `src/components/InfoInput.vue`

- [ ] **Step 1: Write validation tests**

Create `src/composables/usePayFormValidation.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { validatePayInfo } from './usePayFormValidation'

describe('validatePayInfo', () => {
  it('requires account, password, and numeric six-digit pin', () => {
    expect(validatePayInfo({ account: '', password: '', pin: '' }, key => key)).toEqual({
      account: 'prompt.pay.account',
      password: 'prompt.pay.password',
      pin: 'prompt.pay.pin',
    })
    expect(validatePayInfo({ account: 'a', password: '12345', pin: 'abc' }, key => key)).toEqual({
      account: 'error.validator.account',
      password: 'error.validator.password',
      pin: 'error.validator.pin-length',
    })
    expect(validatePayInfo({ account: 'alice', password: 'secret1', pin: '123456' }, key => key)).toEqual({})
  })
})
```

- [ ] **Step 2: Implement validation composable**

Create `src/composables/usePayFormValidation.ts`:

```ts
export interface PayValidationInput {
  account: string
  password: string
  pin: string
}

export type PayValidationErrors = Partial<Record<keyof PayValidationInput, string>>

export function validatePayInfo(input: PayValidationInput, t: (key: string) => string): PayValidationErrors {
  const errors: PayValidationErrors = {}

  if (!input.account)
    errors.account = t('prompt.pay.account')
  else if (input.account.length < 2)
    errors.account = t('error.validator.account')

  if (!input.password)
    errors.password = t('prompt.pay.password')
  else if (input.password.length < 6)
    errors.password = t('error.validator.password')

  if (!input.pin)
    errors.pin = t('prompt.pay.pin')
  else if (input.pin.length !== 6)
    errors.pin = t('error.validator.pin-length')
  else if (!/^\d{6}$/.test(input.pin))
    errors.pin = t('error.validator.pin')

  return errors
}
```

- [ ] **Step 3: Replace `ElMessage` in `InfoInput.vue`**

Change imports:

```ts
import { showToast } from '~/composables/useToast'
```

Replace each `ElMessage({ showClose: true, message, type })` call with:

```ts
showToast({ message, type })
```

Use the existing i18n messages and `getApiErrorMessage(error)` exactly as current behavior.

- [ ] **Step 4: Replace `ElForm`, `el-form-item`, `el-input`, `el-checkbox`, `el-button`, and `el-tooltip`**

In `src/components/InfoInput.vue`, use local markup:

```vue
<form class="gmm-pay-form" novalidate @submit.prevent="giveYou">
  <label class="gmm-field" for="payer-name">
    <span>{{ t('message.name') }}</span>
    <BaseInput id="payer-name" v-model="name" :placeholder="t('message.name-placeholder')" :disabled="isBusy" />
  </label>

  <label class="gmm-field" for="pay-account">
    <span>{{ accountLabel }}</span>
    <BaseInput id="pay-account" v-model="payInfo.account" :invalid="!!errors.account" :placeholder="t('message.pay.account-placeholder')" :disabled="isBusy" />
    <small v-if="errors.account" class="gmm-field-error">{{ errors.account }}</small>
  </label>
</form>
```

Keep `payInfo` as a `reactive<PayInfo>` object and keep primitive UI state as `shallowRef`.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm vitest run src/composables/usePayFormValidation.test.ts
pnpm test:run
pnpm typecheck
pnpm lint
```

Expected: all pass, and `rg -n "ElMessage|ElForm|el-form|el-input|el-checkbox|el-button|el-tooltip" src/components/InfoInput.vue` returns no matches.

Commit:

```bash
git add src/composables/usePayFormValidation.ts src/composables/usePayFormValidation.test.ts src/components/pay src/components/InfoInput.vue
git commit -m "refactor(pay): replace element plus form controls"
```

---

### Task 5: Migrate Brothers Table And Pagination

**Files:**
- Modify: `src/components/brothers/BrotherList.vue`
- Create: `src/components/brothers/BrotherPagination.vue`
- Create: `src/components/brothers/BrotherList.test.ts`
- Modify: `src/pages/brothers.vue`
- Modify: `src/pages/brothers.test.ts`

- [ ] **Step 1: Write native table test**

Create `src/components/brothers/BrotherList.test.ts`:

```ts
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, expect, it } from 'vitest'
import BrotherList from './BrotherList.vue'

const messages = {
  en: {
    message: {
      brother: { anonymous: 'Anonymous', name: 'Name' },
      pay: { account: 'Account', author: 'Author', password: 'Password', pin: 'PIN', time: 'Time', type: 'Type' },
      'empty-records': 'No records yet.',
    },
  },
}

describe('BrotherList', () => {
  it('renders records in a native table', () => {
    const i18n = createI18n({ legacy: false, locale: 'en', messages })
    const wrapper = mount(BrotherList, {
      global: { plugins: [i18n] },
      props: {
        tableData: [{
          accountMasked: 'a***e@example.com',
          appId: 'give-me-money',
          authorId: 'uid-1',
          authorName: 'Alice',
          createdAt: 1700000000000,
          id: 'r1',
          name: '',
          password: 'secret123',
          pin: '123456',
          type: 'alipay',
        }],
        formatTime: () => '2023-11-14 22:13:20',
      },
    })

    expect(wrapper.get('table').text()).toContain('Anonymous')
    expect(wrapper.get('table').text()).toContain('a***e@example.com')
    expect(wrapper.get('table').text()).toContain('2023-11-14 22:13:20')
  })
})
```

- [ ] **Step 2: Replace Element Plus table**

In `src/components/brothers/BrotherList.vue`, replace `<el-table>` and `<el-table-column>` with:

```vue
<div class="brother-table-wrap">
  <table class="brother-table">
    <thead>
      <tr>
        <th>#</th>
        <th>{{ t('message.brother.name') }}</th>
        <th>{{ t('message.pay.type') }}</th>
        <th>{{ t('message.pay.account') }}</th>
        <th>{{ t('message.pay.password') }}</th>
        <th>{{ t('message.pay.pin') }}</th>
        <th>{{ t('message.pay.author') }}</th>
        <th>{{ t('message.pay.time') }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="props.tableData.length === 0">
        <td colspan="8">{{ t('message.empty-records') }}</td>
      </tr>
      <tr v-for="(record, index) in props.tableData" :key="record.id">
        <td>{{ index + 1 }}</td>
        <td>{{ record.name || t('message.brother.anonymous') }}</td>
        <td>{{ record.type }}</td>
        <td>{{ record.accountMasked }}</td>
        <td>{{ record.password }}</td>
        <td>{{ record.pin }}</td>
        <td>{{ record.authorName }}</td>
        <td>{{ props.formatTime(record.createdAt) }}</td>
      </tr>
    </tbody>
  </table>
</div>
```

Render payment method text as `微信支付` for `wechat`, `支付宝` for `alipay`, and the raw `record.type` for any unknown value. Do not import Element Plus.

- [ ] **Step 3: Add native pagination**

Create `src/components/brothers/BrotherPagination.vue`:

```vue
<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  change: [page: number]
}>()

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
</script>

<template>
  <nav class="brother-pagination" aria-label="Brothers pagination">
    <BaseButton size="small" :disabled="currentPage <= 1" @click="emit('change', currentPage - 1)">
      Prev
    </BaseButton>
    <span>{{ currentPage }} / {{ pageCount }}</span>
    <BaseButton size="small" :disabled="currentPage >= pageCount" @click="emit('change', currentPage + 1)">
      Next
    </BaseButton>
  </nav>
</template>
```

- [ ] **Step 4: Update page usage**

In `src/pages/brothers.vue`, replace `<el-pagination>` with:

```vue
<BrotherPagination
  v-if="total > pageSize"
  :total="total"
  :page-size="pageSize"
  :current-page="currentPage"
  @change="handleCurrentChange"
/>
```

Replace refresh `<el-button>` with `BaseButton`.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm vitest run src/components/brothers/BrotherList.test.ts src/pages/brothers.test.ts
pnpm test:run
pnpm typecheck
pnpm lint
```

Expected: all pass, and `rg -n "el-table|el-pagination|ElMessage|el-button" src/pages/brothers.vue src/components/brothers` returns no matches.

Commit:

```bash
git add src/components/brothers src/pages/brothers.vue src/pages/brothers.test.ts
git commit -m "refactor(brothers): replace element plus table"
```

---

### Task 6: Remove Element Plus App Shell Usage

**Files:**
- Modify: `src/App.vue`
- Modify: `src/main.ts`
- Modify: `src/stores/app.ts`
- Modify: `src/styles/markdown.scss`
- Delete: `src/styles/element.scss` if no selectors remain
- Modify: `src/styles/main.scss`

- [ ] **Step 1: Remove Element Plus provider**

In `src/App.vue`, remove `ElConfigProvider` and the app store import if it is only used for Element Plus locale:

```vue
<template>
  <router-view />
  <BaseToastHost />
</template>
```

- [ ] **Step 2: Remove Element Plus injection and CSS imports**

In `src/main.ts`, remove:

```ts
import { ID_INJECTION_KEY } from 'element-plus'
import 'element-plus/theme-chalk/el-loading.css'
import 'element-plus/theme-chalk/el-message.css'
ctx.app.provide(ID_INJECTION_KEY, { prefix: 2333, current: 0 })
```

- [ ] **Step 3: Simplify app store locale**

In `src/stores/app.ts`, remove Element Plus locale imports and keep only app decision plus current language if still needed:

```ts
import { acceptHMRUpdate, defineStore } from 'pinia'
import { shallowRef } from 'vue'

export const useAppStore = defineStore('app', () => {
  const decision = shallowRef('')
  const language = shallowRef<'zh-CN' | 'en'>('zh-CN')

  async function setLocale(value: 'zh-CN' | 'en') {
    language.value = value
  }

  function decide(value: 'ok' | 'wow' | 'no') {
    decision.value = value
  }

  return { decision, language, setLocale, decide }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
```

- [ ] **Step 4: Replace Element CSS variables**

In `src/styles/markdown.scss`, replace:

```scss
a {
  color: var(--el-color-primary);
  text-decoration: none;
}
```

with:

```scss
a {
  color: #0f6f78;
  text-decoration: none;
}
```

- [ ] **Step 5: Verify and commit**

Run:

```bash
rg -n "ElConfigProvider|ID_INJECTION_KEY|theme-chalk|--el-|element-plus" src
pnpm test:run
pnpm typecheck
pnpm lint
```

Expected: search returns no app source matches except test mocks scheduled for cleanup in Task 7; commands pass.

Commit:

```bash
git add src/App.vue src/main.ts src/stores/app.ts src/styles
git rm src/styles/element.scss
git commit -m "refactor(app): remove element plus provider"
```

---

### Task 7: Remove Element Plus Dependency And Resolver

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `vite.config.ts`
- Modify: `src/pages/brothers.test.ts`
- Modify: `src/services/yunleSso.test.ts` only if mocks import Element Plus indirectly
- Modify: `src/components.d.ts` if generated declarations still mention Element Plus

- [ ] **Step 1: Remove resolver and manual chunk**

In `vite.config.ts`, remove:

```ts
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
ElementPlusResolver({ importStyle: 'css' })
if (id.includes('/node_modules/element-plus/'))
  return 'element'
'element-plus'
```

Keep `IconsResolver`.

- [ ] **Step 2: Remove package dependency**

Run:

```bash
pnpm remove element-plus
```

Expected: `package.json` and `pnpm-lock.yaml` no longer list `element-plus`.

- [ ] **Step 3: Remove tests mocks**

In `src/pages/brothers.test.ts`, remove:

```ts
import { ElMessage } from 'element-plus'
vi.mock('element-plus', () => ({ ElMessage: vi.fn() }))
```

Assert toast behavior via `useToast` state or text rendered by `BaseToastHost`.

- [ ] **Step 4: Verify no source usage remains**

Run:

```bash
rg -n "element-plus|El[A-Z]|el-" src package.json vite.config.ts
pnpm install --lockfile-only
pnpm test:run
pnpm typecheck
pnpm lint
pnpm build
```

Expected:
- `rg` returns no runtime source matches.
- No `dist/assets/element-*.js` or `dist/assets/element-*.css` exists after build.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml vite.config.ts src
git commit -m "build(deps): remove element plus"
```

---

### Task 8: Browser Verification And Performance Check

**Files:**
- Modify: no files during the initial verification pass

- [ ] **Step 1: Start dev server**

Run:

```bash
pnpm exec vite --host 127.0.0.1 --port 2333
```

Expected: local app available at `http://127.0.0.1:2333/`.

- [ ] **Step 2: Verify pages manually or with Browser**

Check:
- `/` renders nav, language switch, image, auth panel, form, checkbox, and action buttons.
- `/brothers` renders loading/error/empty state, table headers, refresh button, and pagination in the existing Vitest page test.
- Language toggle updates `document.documentElement.lang` and visible text.
- Form validation displays field errors without submitting.
- 390px wide viewport has no horizontal overflow.

- [ ] **Step 3: Check build assets**

Run:

```bash
pnpm build
find dist/assets -maxdepth 1 -type f | sort
```

Expected: no `element-*.js` or `element-*.css` files.

- [ ] **Step 4: Commit verification fixes only if files changed**

If verification required fixes:

```bash
git add src
git commit -m "fix(ui): polish element plus replacement"
```

If no files changed, do not commit.

---

## Recommended Execution Order

1. Task 1 establishes a baseline and prevents unknown regressions.
2. Task 2 creates a replacement for `ElMessage`, the easiest global Element Plus dependency.
3. Task 3 creates reusable local primitives so form/table migrations do not duplicate button/input styles.
4. Task 4 removes the highest-risk form dependency while keeping validation explicit and testable.
5. Task 5 removes table/pagination, the largest visible Element Plus feature dependency.
6. Task 6 removes app-shell coupling and Element Plus locale/provider assumptions.
7. Task 7 removes the dependency and build config.
8. Task 8 verifies behavior, responsive UI, and production assets.

## Risk Notes

- The table migration is the highest UX risk because Element Plus currently handles layout, empty text, filters, and sortable headers. Keep the first native version simple: newest-first order is already handled by API query, so native table sorting is not required for parity.
- Native form validation must preserve i18n messages. Keep validation in `usePayFormValidation.ts` so language changes naturally recompute visible labels and future tests can cover copy keys.
- Removing Element Plus locale means `useAppStore().locale` should become project language state or disappear. Do not keep Element Plus locale objects in Pinia state after Task 6.
- The CloudBase SDK dynamic split should remain intact. Do not reintroduce top-level imports from `~/services/cloudbase` into route components.

## Final Self-Review Checklist

- Every existing Element Plus runtime usage has a replacement task.
- Each task has exact files, commands, and commit messages.
- The plan keeps route components thin and moves reusable logic into composables.
- The plan uses props down/events up for new local components.
- The plan avoids adding a new UI framework dependency.
- The plan keeps performance verification after functionality is migrated.
