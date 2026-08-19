import type { SupabaseClient } from '@supabase/supabase-js'

declare global {
  interface DetectedBarcode {
    rawValue: string
    format: string
  }

  class BarcodeDetector {
    constructor(options?: { formats?: string[] })
    static getSupportedFormats(): Promise<string[]>
    detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>
  }
}

declare module '#app' {
  interface NuxtApp {
    $supabase: SupabaseClient | null
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $supabase: SupabaseClient | null
  }
}

export {}
