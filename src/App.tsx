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
`)

const header = css(`grid-area: header; font-weight: bold;`)
const charts = css(`grid-area: charts`)
const filters = css(`grid-area: filters`)

export default function App(): JSX.Element {
  const [filter, setFilter] = React.useState<Filter>({state: 'US', file: 'honey', index: 1})

  const [year, setYear] = React.useState('2015')
  const [data, setData] = React.useState()
  React.useEffect(() => {
    const file = files[filter.file]
    setData(
      file.rows.map((row) => [
        row[file.columns.indexOf('State')],
        row[file.columns.indexOf('Year')],
        +row[filter.index],
      ])
    )
  }, [filter])
  const dataForState = React.useMemo(() => data && data.filter((row) => row[0] === filter.state), [
    data,
  ])
  const dataForYear = React.useMemo(
    () =>
      data &&
      data.filter(
        (row) => row[1] === year || row[1] === `${year}-Q1` // TODO: combine all quarters for the map
      ),
    [data, year]
  )

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
          {data && <LineChart setYear={setYear} filter={filter} data={dataForState} />}
          <figcaption>
            {filter && `${filter.file} ${filter.index} by Year for ${filter.state}`}
          </figcaption>
        </figure>
        <figure>
          {data && (
            <>
              <MapChart setTooltipContent={setTooltipContent} filter={filter} data={dataForYear} />
              <ReactTooltip>{tooltipContent}</ReactTooltip>
            </>
          )}
          <figcaption>{filter && `${filter.file} ${filter.index} by State for ${year}`}</figcaption>
        </figure>
      </article>
      <aside css={filters}>
        <Filters states={states} filter={filter} setFilter={setFilter} />
      </aside>
    </main>
  )
}
