/// <reference types="vite/client" />

declare module '*.css' {
  const content: Record<string, unknown>
  export default content
}

declare module '*.svg' {
  import { type SVGProps } from 'react'
  const content: SVGProps<SVGSVGElement>
  export default content
}
