import React from 'react'

export const IconStats: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <rect x="3" y="11" width="3" height="10" rx="0.5" fill="currentColor" />
    <rect x="10.5" y="6" width="3" height="15" rx="0.5" fill="currentColor" />
    <rect x="18" y="2" width="3" height="19" rx="0.5" fill="currentColor" />
  </svg>
)

export const IconSettings: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" fill="currentColor" />
    <path d="M19.4 13a7.03 7.03 0 0 0 .06-2l2.1-1.65a.5.5 0 0 0 .12-.66l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.07 7.07 0 0 0-1.73-1l-.38-2.65A.5.5 0 0 0 13.7 1h-3.4a.5.5 0 0 0-.5.43L9.43 4.1a7.07 7.07 0 0 0-1.73 1l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.66L4.54 11a7.03 7.03 0 0 0 .06 2l-2.1 1.65a.5.5 0 0 0-.12.66l2 3.46c.14.24.43.35.68.26l2.49-1c.5.33 1.04.6 1.6.83l.38 2.65c.07.34.37.58.71.58h3.4c.34 0 .64-.24.71-.58l.38-2.65c.56-.23 1.1-.5 1.6-.83l2.49 1c.25.1.54-.02.68-.26l2-3.46a.5.5 0 0 0-.12-.66L19.4 13z" fill="currentColor" />
  </svg>
)

export const IconSun: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zM1 13h3v-2H1v2zm10-9h2V1h-2v3zm7.03 1.05l1.79-1.79-1.79-1.79-1.79 1.79 1.79 1.79zM17.24 19.16l1.79 1.79 1.79-1.79-1.79-1.79-1.79 1.79zM21 11v2h3v-2h-3zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM6.76 19.16l-1.79 1.79 1.79 1.79 1.79-1.79-1.79-1.79zM4.24 6.76l-1.79 1.79L4.24 10.34l1.79-1.79L4.24 6.76z" fill="currentColor" />
  </svg>
)

export const IconMoon: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
  </svg>
)

export const IconHamburger: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" fill="currentColor" />
  </svg>
)

export const IconDevices: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" fill="none" />
    <rect x="6" y="7" width="6" height="6" rx="1" fill="currentColor" />
    <circle cx="18" cy="17" r="2" fill="currentColor" />
    <rect x="3" y="18" width="12" height="2" rx="1" fill="currentColor" />
  </svg>
)

export default {} as any
