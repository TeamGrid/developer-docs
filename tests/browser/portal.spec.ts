import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('**/api/status', async (route) => {
    await route.fulfill({
      body: JSON.stringify({ overallStatus: 'operational' }),
      contentType: 'application/json',
      status: 200,
    })
  })
})

test('homepage remains structurally stable', async ({ page }, testInfo) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Welcome to TeamGrid Developer',
  )
  await expect(page.locator('.docs-sidebar')).toBeVisible()
  await expect(page.locator('.docs-sidebar a.is-current')).toHaveText('Developer home')
  await expect(page.getByText('206 operations')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Choose an interface' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Make the first request' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Prepare for production' })).toBeVisible()
  await expect(page.locator('html')).toHaveJSProperty('scrollWidth', testInfo.project.name === 'mobile' ? 390 : 1440)
  await expect(page).toHaveScreenshot(`homepage-${testInfo.project.name}.png`, { fullPage: true })
})

test('homepage routes developers into every supported interface', async ({ page }) => {
  await page.goto('/')

  const interfaces = page.locator('.welcome-interface-grid')
  await expect(interfaces.getByRole('link', { name: /API v1/ })).toHaveAttribute('href', '/api/v1/')
  await expect(interfaces.getByRole('link', { name: /TypeScript SDK/ })).toHaveAttribute(
    'href',
    '/sdk/',
  )
  await expect(interfaces.getByRole('link', { name: /CLI/ })).toHaveAttribute('href', '/cli/')
  await expect(interfaces.getByRole('link', { name: /MCP server/ })).toHaveAttribute(
    'href',
    '/mcp/',
  )
  await expect(page.locator('.page-toc')).toContainText('Prepare for production')
})

test('search filters every documented surface', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Search documentation' }).click()
  const search = page.getByRole('searchbox', { name: 'Search guides, endpoints, SDK, CLI' })
  const cases = [
    ['API v1', 'task'],
    ['API v0', 'task'],
    ['SDK', 'pagination'],
    ['CLI', 'authenticate'],
    ['MCP', 'tools'],
    ['Guides', 'integration'],
  ] as const

  for (const [filter, query] of cases) {
    await search.fill(query)
    await page.getByRole('button', { name: filter, exact: true }).click()
    await expect(page.locator('[data-search-result]').first()).toBeVisible()
  }
})

test('onboarding progress is local and persistent', async ({ page }) => {
  await page.goto('/guides/get-started/')
  await page.getByLabel('Workspace slug').fill('acme-inc')
  await expect(page.getByRole('link', { name: 'Open Developer settings' }))
    .toHaveAttribute('href', 'https://web.teamgrid.app/acme-inc/settings/team/developer')
  await page.getByText('Credential created and stored safely', { exact: true }).click()
  await expect(page.locator('[data-onboarding-progress]')).toHaveText('1 of 4')
  await page.reload()
  await expect(page.getByLabel('Credential created and stored safely')).toBeChecked()
  await expect(page.locator('[data-onboarding-progress]')).toHaveText('1 of 4')
})

test('page feedback is anonymous and acknowledged locally', async ({ page }) => {
  await page.goto('/resources/troubleshooting/')
  await page.getByRole('button', { name: 'Yes', exact: true }).click()
  await expect(page.getByText('Thank you. Your answer contains no account or customer data.')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Yes', exact: true })).toBeHidden()
  await expect(page.getByText('Thank you. Your answer contains no account or customer data.')).toBeVisible()
})

test('request builder generates a regional request without sending it', async ({ page }) => {
  await page.goto('/api/v1/reference/operations/gettask/')
  const builder = page.locator('[data-request-builder]')
  await expect(builder.getByText('Build locally · nothing is sent')).toBeVisible()
  await builder.getByRole('button', { name: 'United States' }).click()
  await builder.locator('[data-request-parameter][data-location="path"]').fill('task_123')
  await expect(builder.locator('[data-request-output]')).toContainText('https://api.us.teamgrid.app/v1/tasks/task_123')
  await expect(builder.locator('[data-request-output]')).toContainText('$TEAMGRID_API_TOKEN')
})

test('API reference preserves content order and schema disclosure', async ({ page }, testInfo) => {
  await page.goto('/api/v1/reference/operations/listappointments/')
  const title = page.getByRole('heading', { level: 1 })
  const codePanel = page.locator('.code-panel')
  if (testInfo.project.name === 'mobile') {
    expect((await title.boundingBox())!.y).toBeLessThan((await codePanel.boundingBox())!.y)
  } else {
    const titleBeforePanel = await page.evaluate(() => {
      const title = document.querySelector('h1')
      const panel = document.querySelector('.code-panel')
      return Boolean(title && panel && (title.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING))
    })
    expect(titleBeforePanel).toBe(true)
    const introBox = (await page.locator('.operation-intro').boundingBox())!
    const panelBox = (await codePanel.boundingBox())!
    expect(Math.abs(introBox.x - panelBox.x)).toBeLessThanOrEqual(1)
    expect(Math.abs(introBox.width - panelBox.width)).toBeLessThanOrEqual(1)
  }

  const data = page.locator("[data-schema-toggle='data']")
  await expect(data).toHaveAttribute('aria-expanded', 'false')
  await data.click()
  await expect(data).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator("[data-schema-parent='data']").first()).toBeVisible()

  await expect(page).toHaveScreenshot(`api-reference-${testInfo.project.name}.png`, { fullPage: true })
})

test('parameter-heavy request builders do not overlap the request example', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Desktop two-column regression')
  await page.goto('/api/v1/reference/operations/listproducts/')
  await page.getByRole('textbox', { name: 'productGroupId query' }).click()

  const panel = (await page.locator('.code-panel').boundingBox())!
  const builder = (await page.locator('.request-builder').boundingBox())!
  const controls = (await page.locator('.request-builder__controls').boundingBox())!
  const output = (await page.locator('.request-builder__output').boundingBox())!

  const verticallySeparated = panel.y + panel.height <= builder.y || builder.y + builder.height <= panel.y
  expect(verticallySeparated).toBe(true)
  expect(output.height).toBeLessThan(controls.height)
})
