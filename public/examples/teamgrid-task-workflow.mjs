import { TeamGridApiError, TeamGridClient } from '@teamgrid/api-client'

const required = ['TEAMGRID_API_TOKEN', 'TEAMGRID_TASK_ID', 'TEAMGRID_TASK_NAME']
for (const name of required) {
  if (!process.env[name]) throw new Error(`${name} is required.`)
}

const client = new TeamGridClient({
  token: process.env.TEAMGRID_API_TOKEN,
  timeoutMs: 30_000,
})

const task = await client.tasks.get(process.env.TEAMGRID_TASK_ID)
console.log('Current task:', task.data.id, task.data.attributes.name)

try {
  const updated = await client.tasks.update(
    task.data.id,
    { name: process.env.TEAMGRID_TASK_NAME },
    { ifMatch: task.transport.headers.etag },
  )
  console.log('Updated task:', updated.data.id, updated.data.attributes.name)
  console.log('TeamGrid request:', updated.transport.requestId)
} catch (error) {
  if (error instanceof TeamGridApiError && error.status === 412) {
    throw new Error('The task changed after it was read. Re-read and reconcile before retrying.')
  }
  throw error
}
