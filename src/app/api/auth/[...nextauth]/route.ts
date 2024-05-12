import NextAuth, { AuthOptions } from 'next-auth'
import keycloakProvider from 'next-auth/providers/keycloak'

export const authOptions: AuthOptions = {
  providers: [
    keycloakProvider({
      clientId: process.env.KEYCLOAK_ID ?? '',
      clientSecret: process.env.KEYCLOAK_SECRET ?? '',
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      session.accessToken = token.accessToken
      return session
    },
    jwt: async ({ token, account }) => {
      token.accessToken = account?.access_token
      return token
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
