import * as React from 'react'
import {css} from '@emotion/core'

import honey from '../merged-data/honey.json'
import numbers from '../merged-data/numbers.json'
import stressors from '../merged-data/stressors.json'

import LineChart from './LineChart'
import MapChart from './MapChart'
import MapChart2 from './MapChart2'
import Filters, {Filter} from './Filters'

const files = {
  honey,
  numbers,
  stressors,
}

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

  const [data, setData] = React.useState()
  React.useEffect(() => {
    console.log(filter, files[filter.file].rows)
  }, [filter])

  return (
    <main css={container}>
      <header css={header}>
        <span aria-label="bee" role="img">
          🐝 Vis
        </span>
      </header>
      <article css={charts}>
        <figure>
          <LineChart filter={filter} />
          <figcaption>
            {filter && `${filter.file} ${filter.index} by Year for ${filter.state}`}
          </figcaption>
        </figure>
        <figure>
          <figcaption>Bee Data by State</figcaption>
        </figure>
        <figure />
      </article>
      <aside css={filters}>
        <Filters filter={filter} setFilter={filter} />
      </aside>
    </main>
  )
}
