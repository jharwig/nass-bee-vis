import * as React from 'react'
import {css, Global} from '@emotion/core'
import ReactTooltip from 'react-tooltip'

import honey from '../merged-data/honey.json'
import numbers from '../merged-data/numbers.json'
import stressors from '../merged-data/stressors.json'

import LineChart, {Table, Row, lineStyleForIndex} from './LineChart'
import MapChart from './MapChart'
import Filters, {Filter, FilterDefs, Legend} from './Filters'

const YELLOW = '#F9C846'
const BLACK = '#545863'
const WHITE = '#F7F5FB'

const DATA_COLOR = '#7A86A2'
const ALT_COLOR = '#E29E00'

const files: {[key: string]: {rows: Row[]; columns: string[]}} = {
  honey,
  numbers,
  stressors,
}
const states = Object.keys(
  [honey, numbers, stressors].reduce((stateMap, data) => {
    data.rows.forEach((row) => {
      stateMap[row[0]] = true
    })
    return stateMap
  }, {})
).sort()

const container = css`
  width: 100vw;
  min-height: 100vh;
  font-family: sans-serif;
  display: grid;
  grid-template-columns: minmax(200px, 0.33fr) 2fr;
  grid-template-rows: auto 1fr;
  gap: 0 20px;
  grid-template-areas:
    'header header'
    'filters charts'
    'footer footer';
`

const globalCss = css`
  html {
    body {
      margin: 0;
    }
  }
  figure {
    margin-block-start: 0;
    margin-block-end: 0;
    margin-inline-start: 0;
    margin-inline-end: 0;
  }
  a {
    color: ${YELLOW};
  }
`

const header = css`
  grid-area: header;
  font-weight: bold;
  background: ${BLACK};
  color: ${WHITE};
  padding: 1em;
`
const needsFilter = css`
  position: relative;
  width: 100%;
  height: 100%;

  h2 {
    color: ${BLACK};
    opacity: 0.4;
    font-style: italic;
    text-align: center;
    transform: translate(0, -50%);
    top: 50%;
    margin: 0;
    position: relative;
  }
`

const charts = css`
  grid-area: charts;
  display: grid;
  width: 100%;
  gap: 0 20px;
  grid-template-rows: minmax(150px, 30vh) minmax(200px, 55vh);
  grid-template-areas:
    'lineCharts'
    'mapChart';
`
const filters = css`
  grid-area: filters;
  padding: 1em 0 1em 1em;
  background: #f2f5fa;
`
const footer = css`
  grid-area: footer;
  font-size: 80%;
  padding: 1em;
  text-align: center;
  background: ${BLACK};
  color: ${WHITE};
`

const lineCharts = css`
  grid-area: lineCharts;
  margin-block-start: 0;
  margin: 1em 0;
  .VictoryContainer > svg {
    max-height: 100%;
  }
`
const mapChart = css`
  grid-area: mapChart;
  margin: 1em 0;
  svg {
    width: 100%;
    height: auto;
    max-height: 100%;
  }
`

const defaultYear = '2019'

export default function App(): JSX.Element {
  const [filter, setFilter] = React.useState<Filter>({
    state: 'US',
    tables: [FilterDefs[0].items[3], FilterDefs[1].items[0]],
  })

  const [year, setYear] = React.useState(defaultYear)
  const yearRef = React.useRef(year)
  React.useEffect(() => {
    yearRef.current = year
  }, [year])

  const onChangeState = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilter((prevFilter) => ({...prevFilter, state: event.target.value}))
  }

  const data: Table[] = React.useMemo(
    () =>
      filter.tables.map((table) => {
        const file = files[table.file]
        const transform = (value: number): number => {
          const {index, units} = table
          if (units === '%') return value / 100
          // Some honey columns are in 1000 lbs
          if (
            table.file === 'honey' &&
            (index === 1 || index === 3 || index === 4 || index === 6)
          ) {
            return value * 1000
          }

          return value
        }
        return file.rows.map((row) => {
          const rowYear = row[file.columns.indexOf('Year')]
          const value = transform(+row[table.index])

          return [
            `${row[file.columns.indexOf('State')]}`,
            `${rowYear}`,
            value,
            table.units as Row['3'],
          ]
        })
      }),
    [filter.tables]
  )

  React.useEffect(() => {
    if (!data) return
    let found = false
    const years = []
    for (let t = 0; t < data.length; t += 1) {
      for (let r = 0; r < data[t].length; r += 1) {
        const yearInRow = data[t][r][1]
        if (yearInRow === yearRef.current) {
          found = true
          break
        }
        years.push(yearInRow)
      }
    }
    if (!found) {
      setYear(years.sort()[years.length - 1])
    }
  }, [data])

  const dataForState = React.useMemo(() => {
    if (!data?.length) return undefined
    const leftAxis: Row[][] = []
    const rightAxis: Row[][] = []
    const legend: Legend = {}
    let leftUnits: string
    filter.tables.forEach((filterTable, i) => {
      const tableRows: Row[] = data[i].filter((row) => row[0] === filter.state)
      if (!leftAxis.length || leftUnits === filterTable.units) {
        legend[filterTable.file + filterTable.index] = lineStyleForIndex(
          leftAxis.length,
          DATA_COLOR
        ).data
        leftAxis.push(tableRows)
        leftUnits = filterTable.units
      } else {
        legend[filterTable.file + filterTable.index] = lineStyleForIndex(
          rightAxis.length,
          ALT_COLOR
        ).data
        rightAxis.push(tableRows)
      }
    })
    return {leftAxis, rightAxis, legend}
  }, [filter, data])

  const [tableForMap, setTableForMap] = React.useState(0)
  if (tableForMap && tableForMap >= filter.tables.length) {
    setTableForMap(0)
  }

  const dataForYear = React.useMemo(
    () =>
      year &&
      data?.[tableForMap]?.filter((row) => {
        if (row[1].includes('-') && year.includes('-')) {
          return row[1] === year
        }
        return row[1].replace(/-.*$/, '') === year.replace(/-.*$/, '')
      }),
    [data, year, tableForMap]
  )

  const [tooltipContent, setTooltipContent] = React.useState('')

  return (
    <>
      <Global styles={globalCss} />
      <main css={container}>
        <header css={header}>
          <span aria-label="bee" role="img">
            🐝 Vis
          </span>
        </header>
        <aside css={filters}>
          <Filters filter={filter} setFilter={setFilter} legend={dataForState?.legend} />
        </aside>
        {filter.tables.length === 0 ? (
          <article css={needsFilter}>
            <h2>Select a Filter…</h2>
          </article>
        ) : (
          <article css={charts}>
            <figure css={lineCharts}>
              <figcaption>
                {filter && (
                  <>
                    {filter.tables.map((t) => t.desc).join(',')} by Year for{' '}
                    <select value={filter.state} onChange={onChangeState}>
                      <option value="US">US</option>
                      {states.map(
                        (state) =>
                          state !== 'US' && (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          )
                      )}
                    </select>
                  </>
                )}
              </figcaption>
              {dataForState && (
                <LineChart
                  setYear={setYear}
                  data={dataForState.leftAxis}
                  altData={dataForState.rightAxis}
                  altColors="#E29E00"
                  dataColors="#7A86A2"
                />
              )}
            </figure>
            <figure css={mapChart}>
              <figcaption>
                {filter && (
                  <>
                    <select
                      value={tableForMap}
                      onChange={(event) => setTableForMap(+event.target.value)}
                    >
                      {filter.tables.map(({desc}, i) => (
                        <option key={desc} value={`${i}`}>
                          {desc}
                        </option>
                      ))}
                    </select>{' '}
                    by State for {year}
                  </>
                )}
              </figcaption>
              {dataForYear && (
                <>
                  <MapChart
                    setTooltipContent={setTooltipContent}
                    filter={filter.tables[tableForMap]}
                    data={dataForYear}
                  />
                  <ReactTooltip>{tooltipContent}</ReactTooltip>
                </>
              )}
            </figure>
          </article>
        )}
        <footer css={footer}>
          Data provided by{' '}
          <a href="https://usda.library.cornell.edu/concern/publications/rn301137d?locale=en">
            NASS Honey Bee Colonies
          </a>{' '}
          and{' '}
          <a href="https://usda.library.cornell.edu/concern/publications/hd76s004z?locale=en">
            NASS Honey
          </a>{' '}
          | <a href="https://github.com/jharwig/nass-bee-vis">Github</a> |{' '}
          <a href="https://www.kaggle.com/jasonharwig/nass-bee-colony-and-honey">Kaggle Dataset</a>
          <p>
            A <a href="https://www.kensho.com">Kensho</a> Impactathon Summer 2020 project.
          </p>
        </footer>
      </main>
    </>
  )
}
