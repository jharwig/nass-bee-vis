import * as React from 'react'
import {css} from '@emotion/core'

import data from '../clean-data/honey2019.csv'

import LineChart from './LineChart'
import MapChart from './MapChart'
import MapChart2 from './MapChart2'
import Filters from './Filters'

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
  return (
    <main css={container}>
      <header css={header}>
        <span aria-label="bee" role="img">
          🐝 Vis
        </span>
      </header>
      <article css={charts}>
        <figure>
          <LineChart />
          <figcaption>Bee Data by Year</figcaption>
        </figure>
        <figure>
          <MapChart />
          <figcaption>Bee Data by State</figcaption>
        </figure>
        <figure>
          <MapChart2 data={data} />
        </figure>
      </article>
      <aside css={filters}>
        <Filters />
      </aside>
    </main>
  )
}
