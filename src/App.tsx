import * as React from 'react'
import {css, Global} from '@emotion/core'
import ReactTooltip from 'react-tooltip'

import honey from '../merged-data/honey.json'
import numbers from '../merged-data/numbers.json'
import stressors from '../merged-data/stressors.json'

import LineChart from './LineChart'
import MapChart from './MapChart'
import Filters, {Filter} from './Filters'

const YELLOW = '#F9C846'
const BLACK = '#545863'
const WHITE = '#F7F5FB'

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
  min-height: 100vh;
  font-family: sans-serif;
  display: grid;
  grid-template-columns: 0.33fr 2fr;
  grid-template-rows: auto 1fr;
  gap: 0 20px;
  grid-template-areas:
    "header header"
    "filters charts"
    "footer footer"
`)

const globalCss = css({
  html: {
    body: {
      margin: 0,
    },
  },
  figure: {
    marginBlockStart: 0,
    marginBlockEnd: 0,
    marginInlineStart: 0,
    marginInlineEnd: 0,
  },
  a: {
    color: YELLOW,
  },
})

const header = css(
  `grid-area: header; font-weight: bold; background: ${BLACK}; color: ${WHITE}; padding: 1em;`
)
const charts = css(`
  grid-area: charts;
  display: grid;
  width: 100%;
  gap: 0 20px;
  grid-template-areas:
    "lineCharts mapChart"
`)
const filters = css(`grid-area: filters; padding: 1em 0 1em 1em; background: #f2f5fa;`)
const footer = css(
  `grid-area: footer; font-size: 80%; padding: 1em; text-align: center; background: ${BLACK}; color: ${WHITE};`
)

const lineCharts = css(`grid-area: lineCharts; margin-block-start: 0; margin: 1em 0;`)
const mapChart = css(`grid-area: mapChart; margin: 1em 0;`)

const defaultYear = '2019'

export default function App(): JSX.Element {
  const [filter, setFilter] = React.useState<Filter>({
    state: 'US',
    file: 'honey',
    index: 1,
    desc: 'Honey Producing',
  })

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
        const value = +row[filter.index]
        return [
          row[file.columns.indexOf('State')],
          rowYear,
          isPercentage ? value / 100 : value,
          isPercentage ? 'percent' : '',
        ]
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
    <>
      <Global styles={globalCss} />
      <main css={container}>
        <header css={header}>
          <span aria-label="bee" role="img">
            🐝 Vis
          </span>
        </header>
        <aside css={filters}>
          <Filters filter={filter} setFilter={setFilter} />
        </aside>
        <article css={charts}>
          <figure css={lineCharts}>
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
            {dataForState && (
              <LineChart
                setYear={setYear}
                data={[dataForState]}
                altData={[]}
                altColors="#E29E00"
                dataColors="#7A86A2"
              />
            )}
          </figure>
          <figure css={mapChart}>
            <figcaption>
              {filter && (
                <>
                  {filter.desc} by State for {year}
                </>
              )}
            </figcaption>
            {data && (
              <>
                <MapChart
                  setTooltipContent={setTooltipContent}
                  filter={filter}
                  data={dataForYear}
                />
                <ReactTooltip>{tooltipContent}</ReactTooltip>
              </>
            )}
          </figure>
        </article>
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
