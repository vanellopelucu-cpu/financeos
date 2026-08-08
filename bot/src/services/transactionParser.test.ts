import { parseTransaction } from './transactionParser'

function assertEqual<T>(actual: T, expected: T, label: string): void {
  const actualStr = JSON.stringify(actual)
  const expectedStr = JSON.stringify(expected)
  if (actualStr !== expectedStr) {
    console.error(`FAIL: ${label}`)
    console.error(`  Expected: ${expectedStr}`)
    console.error(`  Actual:   ${actualStr}`)
    process.exitCode = 1
  } else {
    console.log(`PASS: ${label}`)
  }
}

function assertNull(actual: unknown, label: string): void {
  if (actual !== null) {
    console.error(`FAIL: ${label}`)
    console.error(`  Expected: null`)
    console.error(`  Actual:   ${JSON.stringify(actual)}`)
    process.exitCode = 1
  } else {
    console.log(`PASS: ${label}`)
  }
}

function runTests(): void {
  console.log('=== Transaction Parser Tests ===\n')

  // Indonesia - income
  assertEqual(
    parseTransaction('gaji +idr5000000'),
    { workspace: 'indonesia', currency: 'IDR', type: 'income', amount: 5000000, description: 'gaji' },
    'Indonesia income: gaji +idr5000000'
  )

  // Indonesia - expense
  assertEqual(
    parseTransaction('makan -idr15000 bakso'),
    { workspace: 'indonesia', currency: 'IDR', type: 'expense', amount: -15000, description: 'makan bakso' },
    'Indonesia expense: makan -idr15000 bakso'
  )

  // Sri Lanka - income
  assertEqual(
    parseTransaction('salary +lkr80000'),
    { workspace: 'srilanka', currency: 'LKR', type: 'income', amount: 80000, description: 'salary' },
    'Sri Lanka income: salary +lkr80000'
  )

  // Sri Lanka - expense
  assertEqual(
    parseTransaction('minum -lkr400'),
    { workspace: 'srilanka', currency: 'LKR', type: 'expense', amount: -400, description: 'minum' },
    'Sri Lanka expense: minum -lkr400'
  )

  // Indonesia - expense (no description)
  assertEqual(
    parseTransaction('kopi -idr18000'),
    { workspace: 'indonesia', currency: 'IDR', type: 'expense', amount: -18000, description: 'kopi' },
    'Indonesia expense: kopi -idr18000'
  )

  // No currency token - should return null
  assertNull(
    parseTransaction('makan bakso'),
    'No currency token returns null'
  )

  // Uppercase currency token
  assertEqual(
    parseTransaction('gaji +IDR5000000'),
    { workspace: 'indonesia', currency: 'IDR', type: 'income', amount: 5000000, description: 'gaji' },
    'Uppercase +IDR token: gaji +IDR5000000'
  )

  // Mixed case
  assertEqual(
    parseTransaction('Makan -IDR15000 Bakso'),
    { workspace: 'indonesia', currency: 'IDR', type: 'expense', amount: -15000, description: 'Makan Bakso' },
    'Mixed case: Makan -IDR15000 Bakso'
  )

  // Extra whitespace
  assertEqual(
    parseTransaction('  makan  -idr15000  bakso  '),
    { workspace: 'indonesia', currency: 'IDR', type: 'expense', amount: -15000, description: 'makan bakso' },
    'Extra whitespace: makan -idr15000 bakso'
  )

  // Old format should not match (no +/- sign)
  assertNull(
    parseTransaction('makan idr25000 bakso'),
    'Old format without +/- returns null'
  )

  console.log('\n=== Tests Complete ===')
}

runTests()