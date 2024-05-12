'use client'

import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

export default function Provider({ children, session }: { children?: ReactNode; session?: Session | null }): ReactNode {
  return <SessionProvider session={session}>{children}</SessionProvider>
}
