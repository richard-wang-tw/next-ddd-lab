# Initiate Next.js project

## Install

```bash
npx create-next-app next-sample-project
```

```text
√ Would you like to use TypeScript? ... Yes
√ Would you like to use ESLint? ... Yes
√ Would you like to use Tailwind CSS? ... Yes
√ Would you like your code inside a `src/` directory? ... Yes
√ Would you like to use App Router? (recommended) ... Yes
√ Would you like to use Turbopack for next dev? ... Yes
√ Would you like to customize the import alias (@/* by default)? ... Yes
```

## Code Style

```bash
npm i -D prettier # check / format
npm i -D eslint-config-google # google code style
npm i -D eslint-plugin-react # react rules
npm i -D eslint-config-prettier # fix eslint prettier conflict
npm i -D twMerge # fix class name to long
```

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript",
    "google",
    "plugin:react/jsx-runtime",
    "prettier"
  ],
  "rules": {
    "require-jsdoc": "off",
    "max-len": ["error", { "code": 100, "tabWidth": 2, "ignoreUrls": true }]
  },
  "overrides": [
    {
      "files": ["*.d.ts"],
      "rules": {
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "no-unused-vars": "off"
      }
    }
  ]
}
```

```json
// package.json
"scripts": {
    "format": "prettier --write ."
}
```

```json
// vscode settings.json
"[typescript]": {
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.rulers": [120],
  "editor.formatOnSave": true
},
"[typescriptreact]": {
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.rulers": [120],
  "editor.formatOnSave": true
}
```

```json
// .prettierc
{
  "printWidth": 100,
  "singleQuote": true,
  "semi": false
}
```

---

## Authentication

```.env.local
AUTH_SECRET=xxx # Added by `npx auth`. Read more: https://cli.authjs.dev
AUTH_KEYCLOAK_ID=my-app
AUTH_KEYCLOAK_SECRET=QIqQfVD1TPvSdB5nNVQ7lQqTyiS4k0Q3
AUTH_KEYCLOAK_ISSUER=http://localhost:8080/realms/my-realm
```

```bash
npm i next-auth@beta
```

| route           | flow                                                                              |
| --------------- | --------------------------------------------------------------------------------- |
| /other-service/ | reqeust > middleware:auth > middleware:setTokenHeader > rewrite to other services |
| /api/v1/        | reqeust > middleware:auth > middleware:setTokenHeader > route handlers            |
| /...            | reqeust > middleware:auth > pages                                                 |

```ts
// src/middleware.ts
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { auth } from './plugins/auth'

export const setTokenHeader = async (request: NextRequest) => {
  if (!request.url.includes('/api/v1/')) return NextResponse.next()
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET })
  const headers = new Headers(request.headers)
  if (typeof token?.id_token === 'string') headers.set('Token', token?.id_token)
  return NextResponse.next({ request: { headers } })
}

export const middleware = auth(setTokenHeader)
```

```tsx
// src/app/page.tsx
import { auth, signIn, signOut } from '@/plugins/auth'
import { FC } from 'react'

const serverSignIn = async () => {
  'use server'
  await signIn('keycloak')
}
const serverSignOut = async () => {
  'use server'
  await signOut()
}

const SignIn = () => <button onClick={serverSignIn}>Sign in</button>
const Content: FC<{ account: string }> = ({ account }) => (
  <>
    <div className="text-2xl">{`Hi ${account}`}</div>
    <button onClick={serverSignOut}>Sign out</button>
  </>
)

export default async function Home() {
  const session = await auth()
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      {session?.account == null ? <SignIn /> : <Content account={session.account} />}
    </div>
  )
}
```

```ts
// src/plugins/auth.ts
import nextAuth from 'next-auth'
import keycloak from 'next-auth/providers/keycloak'

export const { handlers, signIn, signOut, auth } = nextAuth({
  providers: [keycloak],
  callbacks: {
    jwt: ({ profile, token, account: _account }) => {
      const account = profile?.account
      const idToken = _account?.id_token
      if (typeof account == 'string') Object.assign(token, { account })
      if (typeof idToken == 'string') Object.assign(token, { idToken })
      return token
    },
    session: ({ session, token }) => {
      const account = token.account
      if (typeof account == 'string') return { ...session, account }
      return session
    },
  },
})
```

```ts
// src/plugins/auth.ts
import nextAuth from 'next-auth'
import keycloak from 'next-auth/providers/keycloak'

export const { handlers, signIn, signOut, auth } = nextAuth({
  providers: [keycloak],
  callbacks: {
    jwt: ({ profile, token, account: _account }) => {
      const account = profile?.account
      const idToken = _account?.id_token
      if (typeof account == 'string') Object.assign(token, { account })
      if (typeof idToken == 'string') Object.assign(token, { idToken })
      return token
    },
    session: ({ session, token }) => {
      const account = token.account
      if (typeof account == 'string') return { ...session, account }
      return session
    },
  },
})
```

```ts
// src/types/auth.d.ts
import { Session } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    account: string | undefined
  }
}
```
