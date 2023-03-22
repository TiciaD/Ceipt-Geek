import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:8000/graphql/",
  ignoreNoDocuments: true,
  documents: 'graphql/**/*.{ts,graphql}',
  generates: {
    './graphql/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
        'typescript-apollo-client-helpers'
      ],
      config: {
        dedupeOperationSuffix: true,
        enumsAsTypes: true,
      },
    },
  },
}

export default config