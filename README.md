## 建立領域模型

物流系統

## 建立初始專案

### 安裝 Next.js

安裝 node 20.13.1

執行以下指令

```
npx create-next-app@latest
```

```
√ What is your project named? ... my-app
√ Would you like to use TypeScript? ... No / Yes
√ Would you like to use ESLint? ... No / Yes
√ Would you like to use Tailwind CSS? ... No / Yes
√ Would you like to use `src/` directory? ... No / Yes
√ Would you like to use App Router? (recommended) ... No / Yes
√ Would you like to customize the default import alias (@/*)? ... No / Yes
√ What import alias would you like configured? ... @/*
```

### 新增 vscode 的 typescript 版本設定

在 frontend/.vscode/settings.json 加入以下內容

```json
{
  "typescript.tsdk": "node_modules\\typescript\\lib"
}
```

### 新增 prettier 支援

安裝 eslint 以及 prettier eslint 擴充功能

設定 > format on save

設定 > default formatter > prettier eslint

執行以下指令安裝 package

```
npm i -D prettier eslint-config-prettier eslint-plugin-prettier prettier-eslint
```

.prettierrc.json

```json
{
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 120,
  "semi": false,
  "endOfLine": "auto"
}
```

.eslintrc.json

```json
{
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true
  },

  "extends": ["eslint:recommended", "next/core-web-vitals", "plugin:prettier/recommended", "prettier"]
}
```

### 新增 import 錯誤檢查、自動排序

安裝 plugin

```
npm i -D eslint-plugin-import eslint-plugin-simple-import-sort @typescript-eslint/parser eslint-import-resolver-typescript
```

修改 .eslintrc.json

```json
  "extends": [
    ...
    "plugin:import/recommended",
    "plugin:import/typescript"
  ],
  "plugins": ["simple-import-sort", "import"],
  "rules": {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
    "import/no-unresolved": "error"
  },
  "settings": {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "import/resolver": {
      "typescript": {}
    }
  }
```

## 建立身份驗證機制

### 設定 keycloak

- 藉由 docker 在 local 安裝 keycloak

```bash
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:24.0.4
```

- 前往 localhost:8080，帳號密碼都是 admin，進入後左上角會看到下拉選單，選擇 "Create realm"，打完 realm name 按下 "Create" 即可

- 建立完成後下拉選單選到新建的 realm，然後選擇 Clients 裡面的 Create client

- 輸入 Client ID

- 預設關閉 Client authentication，如果打開的話，會多一個 secret，之後用到要去 credential 頁面拿
-
- 填入
  - Root Url: http://localhost:3000
  - valid redirect URIs: http://localhost:3000/\*
  - Web origins: http://localhost:3000

### 設定 next-auth

首先用以下指令建立一個 secret

```
npx auth secret
```

然後填寫 .env.local

```
NEXTAUTH_SECRET=gmXLIdOkCLBwa5EFf/8XDGGrYIaCIVJOVnoPqGitKag=
KEYCLOAK_ID=nextjs-ddd-lab-client<keycloak client id>
KEYCLOAK_SECRET=<keycloak client authentication 有開再填，否則留空即可>
KEYCLOAK_ISSUER="http://localhost:8080/realms/<keycloak realm>"
```

新增以下內容到 `src/app/api/auth/[...nextauth]/route.ts`

```ts
import NextAuth, { AuthOptions } from 'next-auth'
import keycloakProvider from 'next-auth/providers/keycloak'

export const authOptions: AuthOptions = {
  providers: [
    keycloakProvider({
      clientId: process.env.KEYCLOAK_ID ?? '',
      clientSecret: process.env.KEYCLOAK_SECRET ?? '',
      issuer: process.env.KEYCLOAK_ISSUER
    })
  ],
  callbacks: {
    session: async ({ session, token }) => {
      ;(session as any).accessToken = token.accessToken
      return session
    },
    jwt: async ({ token, account }) => {
      if (account) {
        token = { ...token, accessToken: account.access_token }
      }
      return token
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

### 取得 access token

#### route handler

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  const token = await getToken({ req })
  return NextResponse.json({ token: token?.accessToken })
}
```

#### server component

```ts
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import SessionProvider from '../context/SessionProvider'
import { LoginOrLogoutButton } from './LoginOrLogoutButton'
export default async function Protected(): Promise<any> {
  const session = await getServerSession(authOptions)
  return (
    <SessionProvider session={session}>
      <LoginOrLogoutButton />
    </SessionProvider>
  )
}
```

#### client component

```tsx
'use client'

import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

export default function Provider({ children, session }: { children?: ReactNode; session?: Session | null }): ReactNode {
  return <SessionProvider session={session}>{children}</SessionProvider>
}
```

```tsx
'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
export function LoginOrLogoutButton() {
  const { data: session } = useSession()
  if (session) {
    return (
      <>
        Signed in as {session.user?.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn('keycloak')}>Sign in</button>
    </>
  )
}
```

## 資料夾架構規劃

```js
src/
├── app/ // app route，負責畫面
│   ├── component/ // 資料夾範圍通用的 components
│   │   ├── xxxForm.tsx
│   │   ├── xxxTable/
│   │   │   ├── index.tsx // 有 index 表示如果行數不多可以合成一個 tsx
│   │   │   └── xxx01Table.tsx
│   │   │   └── xxx02Table.tsx
│   │   └── shared/
│   │       ├── xxxButton.tsx
│   │       └── xxxInput.tsx
│   ├── context/ // server coponent 透過 useCase 載入資料
│   │   └── xxx/
│   │       ├── index.ts
│   │       ├── xxxProvider.ts
│   │       └── xxxHook.ts
│   ├── page.tsx
│   ├── layout.tsx
│   └── error.tsx
├── repository/ // entity <-> entity，負責發請求、資料驗證
│	└── xxx/
│	    ├── index.ts
│	    ├── create.ts
│	    ├── update.ts
│	    └── remove.ts
├── service/ // action entity -> result entity
│   ├── common/
│   └── xxx/
│       └── load/
│           ├── index.ts
│           ├── action.ts
│           └── result.ts
├── domain/
│   ├── shared/
│   │       ├── serviceError.ts
│   │       └── validateError.ts
│   └── xxx/ // 特定 sub domain
│       ├── entity/ // 全域通用、vo 組成、包含型別之間的轉換
│       │   └── user.ts
│       └── vo/ // 全域通用 primitive type
│           ├── userName.ts
│           ├── account.ts
│           └── age.ts
└── plugins/
```

## 安裝 Ant Design

```ts
npm i antd @ant-design/nextjs-registry
```

layout.tsx

```tsx
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  )
}
```
