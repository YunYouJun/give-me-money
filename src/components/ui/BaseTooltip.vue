<script setup lang="ts">
import type { TooltipContentProps } from 'reka-ui'
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipRoot,
  TooltipTrigger,
} from 'reka-ui'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  content: string
  side?: TooltipContentProps['side']
}>(), {
  side: 'top',
})
</script>

<template>
  <TooltipRoot>
    <TooltipTrigger
      v-bind="$attrs"
      as-child
      class="base-tooltip"
    >
      <slot />
    </TooltipTrigger>
    <TooltipPortal>
      <TooltipContent
        class="base-tooltip-content"
        :side="side"
        :side-offset="8"
        align="center"
        :avoid-collisions="true"
        :collision-padding="8"
        position-strategy="fixed"
        :hide-when-detached="true"
      >
        {{ content }}
        <TooltipArrow class="base-tooltip-arrow" :width="10" :height="5" />
      </TooltipContent>
    </TooltipPortal>
  </TooltipRoot>
</template>
