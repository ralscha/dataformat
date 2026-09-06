import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
import {FORMATS} from '../src/app/models/format.ts';

const browser = await chromium.launch({headless: true});
try {
  const context = await browser.newContext({timezoneId: 'America/Los_Angeles'});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(process.env['CLIENT_URL'] ?? 'http://localhost:4200');
  let panel;
  for (const format of FORMATS) {
    console.log('Checking ' + format.label);
    await page.getByRole('tab', {name: format.label, exact: true}).click();
    panel = page.getByRole('tabpanel', {name: format.label, exact: true});
    await panel.getByRole('button', {name: 'Load', exact: true}).click();
    await panel.locator('tbody tr').first().waitFor();
    assert.equal(await panel.locator('tbody tr').count(), 100, format.label);
    assert.equal(
      (await panel.locator('tbody tr').first().locator('td').last().textContent()).trim(),
      '1936-02-18',
      format.label + ' date must not shift with timezone'
    );
  }
  await panel.getByRole('button', {name: 'Next', exact: true}).click();
  await panel.locator('tbody tr').first().getByRole('cell', {name: '101', exact: true}).waitFor();
  assert.equal(
    (await panel.locator('tbody tr').first().locator('td').first().textContent()).trim(),
    '101'
  );
  await panel.getByRole('searchbox', {name: 'Search'}).fill('no-such-address-xyz');
  await panel.getByText('No matching addresses.').waitFor();
  await panel.getByRole('searchbox', {name: 'Search'}).fill('Norman');
  await panel.locator('tbody tr').first().waitFor();
  assert.ok((await panel.locator('tbody').textContent()).includes('Norman'));

  const resultTab = page.getByRole('tab', {name: 'Result', exact: true});
  await resultTab.click();
  panel = page.getByRole('tabpanel', {name: 'Result', exact: true});
  await panel.getByRole('button', {name: 'Measure all formats'}).click();
  await panel.getByText('12 / 12 formats measured').waitFor();
  assert.equal(await panel.locator('td.error').count(), 0);
  assert.equal(await panel.locator('tbody tr').count(), 12);
  const json = panel
    .locator('tbody tr')
    .filter({has: page.getByRole('cell', {name: 'JSON', exact: true})});
  assert.equal(await json.getByText('100.00%', {exact: true}).count(), 2);
  assert.ok(await panel.locator('canvas').count());
  await page.getByRole('tab', {name: 'JSON', exact: true}).click();
  panel = page.getByRole('tabpanel', {name: 'JSON', exact: true});
  await resultTab.click();
  panel = page.getByRole('tabpanel', {name: 'Result', exact: true});
  await panel.waitFor();
  assert.equal(await panel.locator('tbody tr').count(), 12, 'measurements survive tab changes');
  await resultTab.press('Home');
  await page.getByRole('tab', {name: 'XML', exact: true, selected: true}).waitFor();
  assert.equal(
    await page.getByRole('tab', {name: 'XML', exact: true}).getAttribute('aria-selected'),
    'true'
  );

  // A failed request must show an error and allow a retry.
  await page.route('**/addresses?format=json', (route) =>
    route.fulfill({status: 500, body: 'Failed'})
  );
  await page.getByRole('tab', {name: 'JSON', exact: true}).click();
  panel = page.getByRole('tabpanel', {name: 'JSON', exact: true});
  await panel.getByRole('button', {name: 'Load', exact: true}).click();
  await panel.locator('.status.error').waitFor();
  assert.equal(await panel.getByRole('button', {name: 'Load', exact: true}).isEnabled(), true);
  await page.unroute('**/addresses?format=json');
  await panel.getByRole('button', {name: 'Load', exact: true}).click();
  await panel.locator('.status.error').waitFor({state: 'hidden'});
  await panel.getByRole('button', {name: 'Load', exact: true}).waitFor();

  await page.setViewportSize({width: 390, height: 844});
  await resultTab.click();
  panel = page.getByRole('tabpanel', {name: 'Result', exact: true});
  await panel.waitFor();
  assert.ok((await panel.locator('canvas').first().boundingBox()).width > 0);
  assert.deepEqual(errors, []);
  console.log(
    'Browser checks passed: 12 formats, dates, pagination, search, measurements, tabs, retry and mobile layout.'
  );
} finally {
  await browser.close();
}
