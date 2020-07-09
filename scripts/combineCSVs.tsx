import {readdir, readFileSync, writeFile} from 'fs'
import path from 'path'

// eslint-disable-next-line import/no-extraneous-dependencies
import {csvParseRows} from 'd3-dsv'

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

// TODO: "2/", etc represents superscript for footnotes
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
      // Ignore empty data rows
      if (row[2] === '') return
      table.rows.push(row.slice(2))
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

interface MergedTable {
  columns: string[]
  rows: (string | null)[][]
}

async function generateMergedTableJSON(dir: string): Promise<MergedTable> {
  const tables = await parseCSVs(dir)
  // TODO: merge units
  const cleanedColumns = tables.map((table) =>
    table.columns.map((column) =>
      column.value.endsWith('/') ? column.value.slice(0, column.value.length - 3) : column.value
    )
  )
  const yearAnnotatedRows = tables.map((table) =>
    table.rows.map((row) => [...row, table.metadata.year])
  )

  const mergedTable: MergedTable = {
    columns: [...cleanedColumns[0], 'Year'],
    rows: yearAnnotatedRows.flat(),
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
    JSON.stringify(stressors),
    {flag: 'w'},
    noop
  )
  writeFile(
    path.resolve(__dirname, '../merged-data/numbers.json'),
    JSON.stringify(numbers),
    {flag: 'w'},
    noop
  )
  writeFile(
    path.resolve(__dirname, '../merged-data/honey.json'),
    JSON.stringify(honey),
    {flag: 'w'},
    noop
  )
}

runner()
