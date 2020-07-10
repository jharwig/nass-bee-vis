import * as React from 'react'
import {
  VictoryChart,
  VictoryVoronoiContainer,
  VictoryLine,
  VictoryLabel,
  VictoryTheme,
  VictoryBrushContainer,
} from 'victory'

const dateForYearField = (d) => {
  const [year, quarter] = d[1].split('-')
  if (quarter) {
    const month = {Q1: 0, Q2: 3, Q3: 6, Q4: 9}
    return new Date(year, month[quarter], 1)
  }
  return new Date(year, 0, 1)
}

function Label(props) {
  return <VictoryLabel {...props} />
}

function LineChart({
  setYear,
  data,
}: {
  setYear: React.SetStateAction<string>
  data: [string, string, number][]
}): JSX.Element {
  const quarter = data && data[0] && data[0][1].replace(/^\d+(-Q)?/, '')
  return (
    <VictoryChart
      key={quarter}
      height={175}
      containerComponent={
        <VictoryBrushContainer
          defaultBrushArea="move"
          brushDimension="x"
          allowResize={false}
          brushDomain={{
            x: quarter
              ? [new Date(2019, 0, 1), new Date(2019, 3, 1)]
              : [new Date(2018, 1, 1), new Date(2019, 0, 1)],
          }}
          onBrushDomainChange={(domain) => {
            if (quarter) {
              setYear(`${domain.x[1].getFullYear()}-Q${Math.trunc(domain.x[1].getMonth() / 4) + 1}`)
            } else {
              setYear(`${domain.x[1].getFullYear()}`)
            }
          }}
        />
      }
    >
      <VictoryLine data={data} x={dateForYearField} y={2} />
    </VictoryChart>
  )
}

export default LineChart
