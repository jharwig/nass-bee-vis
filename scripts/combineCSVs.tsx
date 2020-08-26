import {readdir, readFileSync, writeFile} from 'fs'
import path from 'path'

import stringify from 'csv-stringify/lib/sync'

// eslint-disable-next-line import/no-extraneous-dependencies
import {csvParseRows} from 'd3-dsv'

// Map from state name => abbreviation
const STATE_NAME_MAP: Record<string, string> = {
  Alabama: 'AL',
  Alaska: 'AK',
  'American Samoa': 'AS',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  'District Of Columbia': 'DC',
  'Federated States Of Micronesia': 'FM',
  Florida: 'FL',
  Georgia: 'GA',
  Guam: 'GU',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  'Marshall Islands': 'MH',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  'Northern Mariana Islands': 'MP',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Palau: 'PW',
  Pennsylvania: 'PA',
  'Puerto Rico': 'PR',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  'Virgin Islands': 'VI',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',
  // Special cases
  'Other States': 'Other',
  Oth: 'Other',
  Sts: 'Other',
  'United States': 'US',
}

async function getCSVFiles(dir: string): Promise<{name: string; data: Buffer}[]> {
  const basePath = path.resolve(__dirname, dir)
  const files = await new Promise<{name: string; data: Buffer}[]>((resolve, reject) => {
    readdir(basePath, (error, filenames) => {
      if (error) reject(error)
      const createdFiles = filenames.map((name) => ({
        name,
        data: readFileSync(path.resolve(basePath, name)),
      }))
      resolve(createdFiles)
    })
  })
  return files
}

interface Column {
  value: string
  unit?: string
}

interface Table {
  metadata: {
    title: string[]
    footnotes: string[]
    year: string | null
  }
  columns: Column[]
  rows: string[][]
}

interface MergedTable {
  columns: string[]
  rows: (string | null)[][]
}

function getEmptyTable(): Table {
  return {
    metadata: {
      title: [],
      footnotes: [],
      year: null,
    },
    columns: [],
    rows: [],
  }
}

/* eslint-disable no-param-reassign */
function parseRow(table: Table, row: string[]): undefined {
  // how to infer the type of data by the column key?
  const type = row[1]
  switch (type) {
    case 't':
      table.metadata.title.push(row.slice(2).join('\n'))
      return
    case 'f':
      table.metadata.footnotes.push(row.slice(2).join('\n'))
      return
    case 'h': {
      // Handles merging header strings across rows
      const headerData = row.slice(2)
      if (table.columns.length === 0) {
        table.columns = headerData.map((value) => ({value}))
      } else {
        headerData.forEach((piece, idx) => {
          if (piece !== '') table.columns[idx].value = `${table.columns[idx].value} ${piece}`.trim()
        })
      }
      return
    }
    case 'd': {
      // Ignore empty data rows and a hack for 'Other' empty rows
      if (row[2] === '' || row.slice(3).join('').length === 0) return
      // Ignore the first two rows that contain meta info
      const [state, ...rest] = row.slice(2)
      // Attempt to create 'cleaner' numbers that have commas removed
      table.rows.push([state, ...rest.map((datum) => datum.replace(',', ''))])
      return
    }
    case 'u': {
      const unitData = row.slice(2)
      unitData.forEach((unit, idx) => {
        if (unit !== '') table.columns[idx].unit = unit
      })
      break
    }
    case 'c':
    default:
  }
}
/* eslint-enable no-param-reassign */

function getYearFromFilename(filename: string): string {
  return filename.split('_')[0]
}

function stripFootnoteMarker(value: string): string {
  return value.replace(/(\d\/)/g, '').trim()
}

function normalizeState(state: string): string {
  const stripped = stripFootnoteMarker(state)
  return STATE_NAME_MAP[stripped] ?? stripped
}

// Normalize for comparision
function normalizeUnit(unit: string | undefined): string | null {
  return unit ? unit.replace(/[()]/g, '').trim().toLowerCase() : null
}

function normalizeUnits(
  tableUnits: (string | undefined)[],
  standardUnits: (string | undefined)[],
  row: string[]
): string[] {
  const normalizedStandardUnits = standardUnits.map(normalizeUnit)
  const normalizedTableUnits = tableUnits.map(normalizeUnit)

  return row.map((value, idx) => {
    if (normalizedTableUnits[idx] !== normalizedStandardUnits[idx]) {
      // Try to convert
      const from = normalizedTableUnits[idx]
      const to = normalizedStandardUnits[idx]

      console.warn(`Table column unit (${from}) differ from standard (${to})`)
      if (from === 'dollars' && to === 'cents') return (Number(value) * 100).toString()
      if (from === 'cents' && to === 'dollars') return (Number(value) / 100).toString()

      return value
    }
    return value
  })
}

async function parseCSVs(dir: string): Promise<Table[]> {
  const tables: Table[] = []
  const files = await getCSVFiles(dir)
  files.forEach((file) => {
    const table = getEmptyTable()
    table.metadata.year = getYearFromFilename(file.name)
    csvParseRows(file.data.toString(), (raw) => parseRow(table, raw))
    tables.push(table)
  })
  return tables
}

async function generateMergedTableJSON(dir: string): Promise<MergedTable> {
  const tables = await parseCSVs(dir)

  // Use the units of the most recent table as the standard.
  const tableUnits = tables[tables.length - 1].columns.map((col) => col.unit)
  const tableColumnNames = tables[tables.length - 1].columns.map((col) =>
    stripFootnoteMarker(col.value)
  )

  const normalizedTableRows = tables.map((table) =>
    table.rows.map((row) => {
      const normalizedState = normalizeState(row[0])
      const normalizedUnitValues = normalizeUnits(
        table.columns.map((col) => col.unit),
        tableUnits,
        row
      )
      return [normalizedState, ...normalizedUnitValues.slice(1), table.metadata.year]
    })
  )

  const mergedTable: MergedTable = {
    columns: [...tableColumnNames, 'Year'],
    rows: normalizedTableRows.flat(),
  }

  return mergedTable
}

const noop = (): void => {}

async function runner(): Promise<void> {
  const stressors = await generateMergedTableJSON('../raw-data/colonies/stressors')
  const numbers = await generateMergedTableJSON('../raw-data/colonies/numbers')
  const honey = await generateMergedTableJSON('../raw-data/honey')

  writeFile(
    path.resolve(__dirname, '../merged-data/stressors.json'),
    JSON.stringify(stressors, null, 2),
    {flag: 'w'},
    noop
  )
  writeFile(
    path.resolve(__dirname, '../merged-data/numbers.json'),
    JSON.stringify(numbers, null, 2),
    {flag: 'w'},
    noop
  )
  writeFile(
    path.resolve(__dirname, '../merged-data/honey.json'),
    JSON.stringify(honey, null, 2),
    {flag: 'w'},
    noop
  )

  writeFile(
    path.resolve(__dirname, '../merged-data/stressors.csv'),
    stringify([stressors.columns, ...stressors.rows]),
    {flag: 'w'},
    noop
  )
  writeFile(
    path.resolve(__dirname, '../merged-data/numbers.csv'),
    stringify([numbers.columns, ...numbers.rows]),
    {flag: 'w'},
    noop
  )
  writeFile(
    path.resolve(__dirname, '../merged-data/honey.csv'),
    stringify([honey.columns, ...honey.rows]),
    {flag: 'w'},
    noop
  )
}

runner()
