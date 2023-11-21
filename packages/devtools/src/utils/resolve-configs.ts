import type { Nuxt } from '@nuxt/schema'
import { parse, relative } from 'pathe'

function sortObject<T>(unordered: T | T[], sortArrays = false, match: T | T[] = {}): T | T[] {
  if (!unordered || typeof unordered !== 'object')
    return unordered

  if (Array.isArray(unordered)) {
    const newArr = unordered.map(item => sortObject(item, sortArrays, match))
    if (sortArrays)
      newArr.sort()

    return newArr as T[]
  }

  const ordered: Record<any, any> = {}
  //   return sortObjectKeys(unordered, Object.keys(match))
  Object.keys(unordered)
    .sort()
    .forEach((key) => {
      // @ts-expect-error should be the safe? but not sure how to fix the type
      ordered[key] = sortObject(unordered[key], sortArrays, match)
    })

  return ordered
}

function sortObjectKeys(obj: any, match: any) {
  if (typeof obj !== 'object' || obj == null) {
    // console.log(typeof obj, obj)
    // throw new Error('Input must be a non-null object')
    return obj
  }

  if (Array.isArray(obj))
    return obj.map(item => sortObjectKeys(item))

  //   if (!Array.isArray(order))
  //     throw new Error('Order must be an array of strings')

  const order = match != null ? Object.keys(match) : []
  const sortedKeys = [...new Set([...order, ...Object.keys(obj)])]

  const sortedObject = {}

  sortedKeys.forEach((key) => {
    if (key in obj)
      sortedObject[key] = sortObjectKeys(obj[key], match != null && key in match && !Array.isArray(match[key]) ? match[key] : null)
  })

  return sortedObject
}

function getStack() {
  const origPrepareStackTrace = Error.prepareStackTrace

  Error.prepareStackTrace = function (_, stack) {
    return stack
  }

  const err = new Error('Retrieving file location!')
  const stack = err.stack as unknown as NodeJS.CallSite[]

  Error.prepareStackTrace = origPrepareStackTrace

  stack.shift() // getStack --> Error
  stack.shift() // getStack

  return stack[0]
}

function createNuxtConfigInterceptor(nuxt: Nuxt, collectedConfigs: any[]) {
  return function (c: any) {
    const configFile = getStack().getFileName() ?? ''
    const parsed = parse(configFile)
    // console.log({ configFile, parsed, c })
    collectedConfigs.push({
      config: { ...c },
      definedConfig: { ...c },
      relative: relative(nuxt.options._layers[0].cwd, configFile),
      cwd: parsed.dir,
      configFile: parsed.name,
      folder: parsed.dir,
    })

    return { ...c, preserved: { ...c } }
  }
}

export { sortObject, createNuxtConfigInterceptor, sortObjectKeys }
