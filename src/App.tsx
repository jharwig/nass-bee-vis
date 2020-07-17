import * as React from 'react'
import {css} from '@emotion/core'
import ReactTooltip from 'react-tooltip'

import honey from '../merged-data/honey.json'
import numbers from '../merged-data/numbers.json'
import stressors from '../merged-data/stressors.json'

import LineChart from './LineChart'
import MapChart from './MapChart'
import Filters, {Filter} from './Filters'

const files = {
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

const container = css(`
  width: 100vw;
  margin: 1em;
  font-family: sans-serif;
  display: grid;
  grid-template-columns: 2fr 0.5fr;
  grid-template-rows: auto 1fr;
  gap: 0 20px;
  grid-template-areas:
    "header header"
    "charts filters"
    "footer footer"
`)

const header = css(`grid-area: header; font-weight: bold;`)
const charts = css(`grid-area: charts`)
const filters = css(`grid-area: filters`)
const footer = css(`grid-area: footer; font-size: 80%; opacity: 0.6;`)

const defaultYear = '2019'

export default function App(): JSX.Element {
  const [filter, setFilter] = React.useState<Filter>({state: 'US', file: 'honey', index: 1, desc: 'Honey Producing'})

  const [year, setYear] = React.useState(defaultYear)
  const yearRef = React.useRef(year)
  React.useEffect(() => {
    yearRef.current = year
  }, [year])

  const onChangeState = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilter((filter) => ({...filter, state: event.target.value}))
  }

  const [data, setData] = React.useState()
  React.useEffect(() => {
    const file = files[filter.file]
    const isPercentage = filter.file === 'stressors'
    setData(
      file.rows.map((row) => {
        const rowYear = row[file.columns.indexOf('Year')]
        const value = +row[filter.index];
        return [row[file.columns.indexOf('State')], rowYear, isPercentage? value / 100: value, isPercentage ? 'percent' : '']
      })
    )
  }, [filter])
  React.useEffect(() => {
    if (!data) return
    let found = false
    const latestYear = 0
    const years = []
    for (const row in data) {
      const year = data[row][1]
      if (year === yearRef.current) {
        found = true
        break
      }
      years.push(year)
    }
    if (!found) {
      setYear(years.sort()[years.length - 1])
    }
  }, [data])
  const dataForState = React.useMemo(() => data && data.filter((row) => row[0] === filter.state), [
    data,
  ])
  const dataForYear = React.useMemo(() => data && data.filter((row) => row[1] === year), [
    data,
    year,
  ])

  const [tooltipContent, setTooltipContent] = React.useState('')

  return (
    <main css={container}>
      <header css={header}>
        <span aria-label="bee" role="img">
          🐝 Vis
        </span>
      </header>
      <article css={charts}>
        <figure>
          <figcaption>
            {filter && (
              <>
                {filter.desc} by Year for{' '}
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
          {data && <LineChart setYear={setYear} filter={filter} data={dataForState} />}
        </figure>
        <figure>
          <figcaption>
            {filter && (
              <>
                {filter.desc} by State for {year}
              </>
            )}
          </figcaption>
          {data && (
            <>
              <MapChart setTooltipContent={setTooltipContent} filter={filter} data={dataForYear} />
              <ReactTooltip>{tooltipContent}</ReactTooltip>
            </>
          )}
        </figure>
      </article>
      <aside css={filters}>
        <Filters filter={filter} setFilter={setFilter} />
      </aside>
      <footer css={footer}>
        Data provided by{' '}
        <a href="https://usda.library.cornell.edu/concern/publications/rn301137d?locale=en">
          NASS Honey Bee Colonies
        </a>{' '}
        and{' '}
        <a href="https://usda.library.cornell.edu/concern/publications/hd76s004z?locale=en">
          NASS Honey
        </a> | <a href="https://github.com/jharwig/nass-bee-vis">Github</a> | <a href="https://www.kaggle.com/jasonharwig/nass-bee-colony-and-honey">Kaggle Dataset</a>
        <p>A <a href="https://www.kensho.com">Kensho</a> Impactathon Summer 2020 project.</p>
      </footer>
    </main>
  )
}
