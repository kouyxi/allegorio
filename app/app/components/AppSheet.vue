<script setup lang="ts">
const open = defineModel<boolean>({ required: true })

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  /** rótulo do botão de fechar, para leitores de tela */
  closeLabel?: string
}>(), { closeLabel: 'Fechar' })

const panel = ref<HTMLElement | null>(null)
const drag = ref(0)
const dragging = ref(false)

let startY = 0
let startTime = 0
let pointerId: number | null = null

function close() {
  open.value = false
}

function onGrab(event: PointerEvent) {
  if (event.button !== 0 && event.pointerType === 'mouse') return
  pointerId = event.pointerId
  startY = event.clientY
  startTime = event.timeStamp
  dragging.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onMove(event: PointerEvent) {
  if (!dragging.value || event.pointerId !== pointerId) return
  const delta = event.clientY - startY
  // resistência ao arrastar para cima: a folha não sobe além do topo
  drag.value = delta > 0 ? delta : delta / 6
}

function onRelease(event: PointerEvent) {
  if (!dragging.value || event.pointerId !== pointerId) return
  const distance = drag.value
  const velocity = distance / Math.max(1, event.timeStamp - startTime)

  dragging.value = false
  pointerId = null

  if (distance > 96 || velocity > 0.55) close()
  else drag.value = 0
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

watch(open, isOpen => {
  if (isOpen) {
    drag.value = 0
    document.body.style.overflow = 'hidden'
    nextTick(() => panel.value?.focus())
  } else {
    document.body.style.overflow = ''
  }
})

onBeforeUnmount(() => { document.body.style.overflow = '' })
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="sheet-root" @keydown="onKeydown">
        <div class="sheet-scrim" @click="close" />

        <section
          ref="panel"
          class="sheet"
          role="dialog"
          aria-modal="true"
          :aria-label="props.title"
          tabindex="-1"
          :style="{
            transform: `translate3d(0, ${Math.max(0, drag)}px, 0)`,
            transition: dragging ? 'none' : undefined
          }"
        >
          <header
            class="sheet__grab"
            @pointerdown="onGrab"
            @pointermove="onMove"
            @pointerup="onRelease"
            @pointercancel="onRelease"
          >
            <span class="sheet__handle" aria-hidden="true" />
            <div class="sheet__head">
              <div class="sheet__titles">
                <h2 class="sheet__title">{{ props.title }}</h2>
                <p v-if="props.subtitle" class="sheet__subtitle">{{ props.subtitle }}</p>
              </div>
              <button type="button" class="icon-btn" :aria-label="props.closeLabel" @click="close">
                <AppIcon name="close" />
              </button>
            </div>
          </header>

          <div class="sheet__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="sheet__footer">
            <slot name="footer" />
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-root { position: fixed; z-index: 100; inset: 0; }

.sheet-scrim {
  position: absolute;
  inset: 0;
  background: rgb(20 18 15 / 32%);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

.sheet {
  position: absolute;
  inset: auto 0 0;
  display: flex;
  flex-direction: column;
  width: min(100%, var(--shell));
  max-height: min(86dvh, 46rem);
  margin-inline: auto;
  border-radius: var(--r-xl) var(--r-xl) 0 0;
  outline: 0;
  background: var(--paper);
  box-shadow: 0 -1px 0 var(--line), 0 -24px 64px -12px rgb(41 34 22 / 30%);
  transition: transform var(--t-slow) var(--ease-soft);
  will-change: transform;
}

.sheet__grab {
  flex: 0 0 auto;
  padding: var(--s2) var(--gutter) var(--s3);
  cursor: grab;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}
.sheet__grab:active { cursor: grabbing; }

.sheet__handle {
  display: block;
  width: 2.25rem;
  height: 0.25rem;
  margin: 0 auto var(--s3);
  border-radius: var(--r-full);
  background: var(--line-3);
}

.sheet__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; }
.sheet__titles { min-width: 0; }
.sheet__title {
  font-size: var(--fs-lg);
  font-variation-settings: "wght" 700;
  letter-spacing: -0.028em;
  line-height: 1.2;
}
.sheet__subtitle { margin-top: var(--s1); color: var(--ink-3); font-size: var(--fs-sm); }

.sheet__body {
  flex: 1 1 auto;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--s1) var(--gutter) var(--s4);
  -webkit-overflow-scrolling: touch;
}

.sheet__footer {
  flex: 0 0 auto;
  padding: var(--s3) var(--gutter) calc(env(safe-area-inset-bottom) + var(--s3));
  border-top: 1px solid var(--line);
  background: color-mix(in srgb, var(--paper) 92%, transparent);
  backdrop-filter: blur(12px);
}

/* entrada e saída */
.sheet-enter-active .sheet-scrim,
.sheet-leave-active .sheet-scrim { transition: opacity var(--t) var(--ease); }
.sheet-enter-from .sheet-scrim,
.sheet-leave-to .sheet-scrim { opacity: 0; }

.sheet-enter-active .sheet { transition: transform 460ms var(--ease-soft); }
.sheet-leave-active .sheet { transition: transform 260ms cubic-bezier(0.4, 0, 1, 1); }
.sheet-enter-from .sheet,
.sheet-leave-to .sheet { transform: translate3d(0, 100%, 0) !important; }
</style>
