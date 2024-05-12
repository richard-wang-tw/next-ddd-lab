import { getServerSession } from 'next-auth/next'

import { authOptions } from '@/app/api/auth/[...nextauth]/route'

import SessionProvider from '../context/SessionProvider'
import { Button } from './Button'

export default async function Protected(): Promise<any> {
  const session = await getServerSession(authOptions)
  return (
    <SessionProvider session={session}>
      <Button />
    </SessionProvider>
  )
}
