<script setup lang="ts">
interface LayerListItemInfo {
  filepath: string
}

withDefaults(defineProps<{
  item: LayerListItemInfo
  type?: 'project' | 'layer' | 'merged'
  index?: number
}>(), {
  index: 0,
})

const open = ref(true)
// const currentServerRoute = useCurrentServeRoute()
// const badgeText = computed(() => {
//   if (props.type === 'merged')
//     return props.type?.toUpperCase()
//   return `${props.type?.toUpperCase()} - ${props.priority}`
// })
const selected = inject<string>('layer-selection')
</script>

<template>
  <div>
    <button
      flex="~ gap-2" class="text-sm" w-full flex-col items-start hover-bg-active px2 py2 text-left
      :class="[{ 'bg-active': selected === item.configFile }]"
      @click="open = !open;selected = item.configFile"
    >
      <!-- <div :class="{ 'w-12': false }" flex-none text-left> -->
      <!-- v-else -->
      <span px2 text-sm font-mono>
        <!-- <NIcon v-if="item?.layers?.length > 0" icon="carbon:chevron-right" mb0.5 :transform-rotate="open ? 90 : 0" transition /> -->
        <!-- <NIcon v-if="item.type === 'collection'" :title="`${item.routes?.length} routes`" icon="carbon:folder" mr1 /> -->
        {{ item.relative ?? item.configFile }}

        <!-- <NBadge v-if="item?.layers?.length > 0" class="w-auto text-justify" v-text="item?.definedConfig?.extends?.length" /> -->
      </span>
      <slot />
      <!-- </div> -->
      <!-- TODO: maybe add options to create/delete/copy ... -->
      <!-- <NDropdown v-model="dropdown" position="right" n="sm">
        <template #trigger="{ click }">
          <NButton icon="carbon-overflow-menu-vertical" :border="false" @click.stop.prevent="click()" />
        </template>
      </NDropdown> -->
    </button>
    <div x-divider />
    <!-- <slot v-if="open">
      <LayerListItem
        v-for="subItem in item.layers"
        :key="subItem.configFile"
        :item="subItem"
        :index="index + 1"
        class="pl4"
      />
    </slot> -->
  </div>
</template>
