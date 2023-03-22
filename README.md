# Cowriter

Cowriter is inspired by [Copilot](https://copilot.github.com/) and utilizes [OpenAI's Completions API](https://platform.openai.com/docs/api-reference/completions) to provide intelligent suggestions, improving productivity and creativity. It is built with [Next.js](https://nextjs.org/) and [Nhost](https://nhost.io/).

## Prerequisites

- [An Nhost project](https://docs.nhost.io/)
- [An OpenAI API key](https://platform.openai.com/docs/introduction/key-concepts)
- [Docker](https://docs.docker.com/get-docker/)
- [Nhost CLI](https://docs.nhost.io/cli)

## Setup

First, set up the environment variables in the `.env.development` file for the Nhost backend.

```bash
MOCK_ENABLED=true
OPENAI_API_ORG=<your-openai-org-id>
OPENAI_API_KEY=<your-openai-api-key>
ALLOWED_ORIGIN=*
NEXT_PUBLIC_NHOST_SUBDOMAIN=<your-nhost-subdomain>
NEXT_PUBLIC_NHOST_REGION=<your-nhost-region>
```

- `MOCK_ENABLED` is used to enable/disable the mock API. If set to `true`, the mock API will be used instead of the real OpenAI API, so you don't have to pay for the API calls.
- `OPENAI_API_ORG` is the OpenAI organization ID.
- `OPENAI_API_KEY` is the OpenAI API key.
- `ALLOWED_ORIGIN` is the origin of the frontend application. This is used to enable CORS. You can set it to `*` to allow all origins.
- `NEXT_PUBLIC_NHOST_SUBDOMAIN` is the subdomain of your Nhost project.
- `NEXT_PUBLIC_NHOST_REGION` is the region of your Nhost project.

If you want to connect to your local Nhost backend, you can set the `NEXT_PUBLIC_NHOST_SUBDOMAIN` to `local` and leave the `NEXT_PUBLIC_NHOST_REGION` empty.

## Getting started

First, run the Nhost backend:

```bash
nhost dev
```

You should see the following output:

```bash
URLs:
- Postgres:             postgres://postgres:postgres@local.db.nhost.run:5432/postgres
- Hasura:               https://local.hasura.nhost.run
- GraphQL:              https://local.graphql.nhost.run/v1
- Auth:                 https://local.auth.nhost.run/v1
- Storage:              https://local.storage.nhost.run/v1
- Functions:            https://local.functions.nhost.run/v1

- Dashboard:            http://localhost:3030
- Mailhog:              http://localhost:8025

- subdomain:            local
- region:               (empty)
```

Then, run the frontend:

```bash
yarn dev
```

You can open the frontend at http://localhost:3000 by default.
