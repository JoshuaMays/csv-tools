#!/usr/bin/env node

const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, PR_NUMBER } = process.env

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN || !PR_NUMBER) {
  console.error(
    'Error: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, and PR_NUMBER must be set.',
  )
  process.exit(1)
}

const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/workers/scripts/csv-tools/aliases/pr-${PR_NUMBER}`

// Check whether the alias exists before attempting to delete it.
// This can happen if the PR was closed before the preview deploy was approved.
const checkRes = await fetch(url, {
  headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` },
})

if (checkRes.status === 404) {
  console.log(
    `Preview alias pr-${PR_NUMBER} does not exist — nothing to delete.`,
  )
  process.exit(0)
}

if (!checkRes.ok) {
  const checkJson = await checkRes.json()
  console.error(
    `Failed to check preview alias pr-${PR_NUMBER}:`,
    JSON.stringify(checkJson.errors),
  )
  process.exit(1)
}

const res = await fetch(url, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` },
})

const json = await res.json()

if (!res.ok || !json.success) {
  console.error(
    `Failed to delete preview alias pr-${PR_NUMBER}:`,
    JSON.stringify(json.errors),
  )
  process.exit(1)
}

console.log(`Deleted preview alias pr-${PR_NUMBER}.`)
