<script setup lang="ts">
import type { NuxtConfigLayer } from '@nuxt/schema'
import { relative } from 'pathe'
import { sortObjectKeys } from '../../../src/utils/resolve-configs'
import CodeDiff from '~/components/CodeDiff.vue'
import LayerListItem from '~/components/LayerListItem.vue'

definePageMeta({
  icon: 'i-carbon-assembly-cluster',
  title: 'Layers',
  order: 2,
})

const showPreviousLayer = ref(false)
const codeSection = ref<HTMLElement>()
const selected = ref(0)
const selectedFile = ref('')
const displayMode = ref('code')

const nuxtLayers = useNuxtLayers()
// const collectedConfigs = useCollectedConfigs()
const defaultConfig = useDefaultConfig()
const intermediateLayers = useIntermediates()

type ConfigType = 'project' | 'layer' | 'merged' | undefined
const filteredConfigs = computed<(NuxtConfigLayer & { configString: string; type: ConfigType })[]>(() => {
  // return [
  //   ...(nuxtLayers.value != null ? [{ ...nuxtLayers.value }] : []),
  //   ...(collectedConfigs.value ?? []),
  // ]
  return [
    ...(intermediateLayers.value ?? []),
  ]
    .map((x, i) => {
      const copy: NuxtConfigLayer & { configString: string; definedConfigString: ''; type: ConfigType } = { ...x, configString: '', definedConfigString: '', type: 'layer' }

      // const sortedConfig = sortObjectKeys(copy.config, { ...nuxtLayers.value?.config })
      const sortedConfig = sortObjectKeys(copy.config, { ...defaultConfig.value?.default, ...nuxtLayers.value?.config })
      const sortedDefinedConfig = sortObjectKeys(copy.definedConfig, { ...defaultConfig.value?.default, ...nuxtLayers.value?.config })

      copy.layers = copy.layers.filter((c, i2) => Object.keys(c.config).length !== 0 && i2 > 0)
      copy.preserved = { ...sortedConfig.preserved }
      delete sortedConfig.preserved
      copy.configString = JSON.stringify(sortedConfig, null, 2)
      copy.definedConfigString = JSON.stringify(sortedDefinedConfig, null, 2)
      copy.relative = relative(intermediateLayers.value?.at(0)?.cwd, copy.configFile)
      copy.type = (i === 0 ? 'merged' : i === 1 ? 'project' : 'layer')
      return copy
    })
})

const codeVisible = computed(() => {
  if (!['code', 'both'].includes(displayMode.value))
    return false
  return filteredConfigs.value.at(selected.value) != null
})

const diffVisible = computed(() => {
  if (!['diff', 'both'].includes(displayMode.value))
    return false
  return selected.value >= 0 && selected.value < filteredConfigs.value.length - 1
})

watch(selected, async () => {
  await nextTick()
  codeSection.value?.scrollTo({ top: 0, behavior: 'smooth' })
})

// watch(defaultConfig, val => console.log(val))
// watch(intermediateLayers, (val) => {
//   if (val == null)
//     return
//   // console.log(val.map(x => x.config.i18n?.locales))
// })

provide('layer-selection', selectedFile)

watch(selectedFile, (val) => {
  const newIndex = filteredConfigs.value.findIndex(x => x.configFile === val)
  if (newIndex >= 0 && newIndex !== selected.value)
    selected.value = newIndex
})
// onMounted(async () => {
//   // globalThis.process ??= {}
//   // globalThis.process.cwd ??= () => ''
//   // console.log(process, await resolveSchema(NuxtConfigSchema, {}))
// })
</script>

<template>
  <NSplitPane storage-key="tab-layers">
    <template #left>
      <div flex="~ col" class="h-12/12">
        <NNavbar flex="~ grow-0">
          <NSwitch
            v-model="showPreviousLayer"
            :disabled="!codeVisible"
            flex="~ row-reverse gap-4"
            n="primary sm"
            py2 pl2 pr1
          >
            Show previous layer
          </NSwitch>
          <div flex="~ items-center gap-4">
            <NSelectTabs
              v-model="displayMode"
              n="primary sm"
              :options="[
                { label: 'Code', value: 'code' },
                { label: 'Both', value: 'both' },
                { label: 'Diff', value: 'diff' },
              ]"
            />
          </div>
        </NNavbar>
        <div flex="~ col grow-1 of-y-auto">
          <LayerListItem
            v-for="(cfg, index) in filteredConfigs"
            :key="cfg.cwd + cfg.configFile"
            :item="{ ...cfg, filepath: `${cfg.configFile}` }"
            :type="cfg.type"
            :priority="index - 1"
          />
        </div>
        <div x-divider />
        <NNavbar flex="~ grow-0">
          <NSwitch
            v-model="showPreviousLayer"
            :disabled="!codeVisible"
            flex="~ row-reverse gap-4"
            n="primary sm"
            py2 pl2 pr1
          >
            Show previous layer
          </NSwitch>
          <div flex="~ items-center gap-4">
            <NSelectTabs
              v-model="displayMode"
              n="primary sm"
              :options="[
                { label: 'Code', value: 'code' },
                { label: 'Both', value: 'both' },
                { label: 'Diff', value: 'diff' },
              ]"
            />
          </div>
        </NNavbar>
      </div>
    </template>
    <template #right>
      <div ref="codeSection" w-full>
        <div class="p3 py2 text-sm" flex="~ gap2" sticky top-0 z-1000 w-full px4 py2 bg-base>
          <div v-if="codeVisible && showPreviousLayer && filteredConfigs.at(selected + 1) != null" flex-1 overflow-auto px2>
            {{ filteredConfigs[selected + 1].cwd }}
          </div>
          <div v-if="diffVisible" flex-1 overflow-auto px2>
            {{ filteredConfigs[selected + 1].cwd }} -> {{ filteredConfigs[selected].cwd }}
          </div>
          <div v-if="codeVisible" flex-1 overflow-auto px2>
            {{ filteredConfigs[selected].cwd }}
          </div>
        </div>
        <div flex="~ " w-full>
          <NCodeBlock
            v-if="codeVisible && showPreviousLayer && filteredConfigs.at(selected + 1) != null"
            :code="filteredConfigs[selected + 1].configString"
            lang="json"
            :lines="true"
            flex-1 overflow-auto
          />
          <CodeDiff
            v-if="diffVisible"
            :from="filteredConfigs[selected + 1].configString"
            :to="filteredConfigs[selected].configString"
            lang="json"
            flex-1 overflow-auto
          />
          <NCodeBlock
            v-if="codeVisible"
            :code="filteredConfigs[selected].configString"
            lang="json"
            :lines="true"
            flex-1 overflow-auto
          />
        </div>
      </div>
    </template>
  </NSplitPane>
</template>
