/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** GraphQL endpoint, e.g. http://localhost:5000/graphql. Leave unset to use demo mode. */
  readonly VITE_API_URL?: string;
}
