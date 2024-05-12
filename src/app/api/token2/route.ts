import { redirect } from 'next/navigation'

export async function GET() {
  return redirect('http://localhost:3001/token2')
}
