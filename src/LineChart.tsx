import * as React from 'react'
import {
  VictoryChart,
  VictoryVoronoiContainer,
  VictoryAxis,
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
  let usesQuarters = false
  const lastYear = data.reduce((max, value) => {
    const [year, quarter] = value[1].split('-')
    if (quarter) usesQuarters = true
    return Math.max(+year, max)
  }, 0)
  const isPercentage = data[0][3] === 'percent'
  return (
    <VictoryChart
      key={`${usesQuarters}${lastYear}`}
      height={175}
      containerComponent={
        <VictoryBrushContainer
          defaultBrushArea="move"
          brushDimension="x"
          allowResize={false}
          brushDomain={{
            x: usesQuarters
              ? [new Date(lastYear - 1, 10, 1), new Date(lastYear, 0, 1)]
              : [new Date(lastYear - 1, 1, 1), new Date(lastYear, 0, 1)],
          }}
          onBrushDomainChange={(domain) => {
            if (usesQuarters) {
              const middle = new Date(
                (domain.x[1].getTime() - domain.x[0].getTime()) / 2 + domain.x[0].getTime()
              )
              setYear(`${middle.getFullYear()}-Q${Math.trunc(middle.getMonth() / 3) + 1}`)
            } else {
              setYear(`${domain.x[1].getFullYear()}`)
            }
          }}
        />
      }
    >
      <VictoryLine data={data} x={dateForYearField} y={2} />
      <VictoryAxis scale={{x: 'time', y: 'linear'}} />
      <VictoryAxis
        scale={{x: 'time', y: 'linear'}}
        dependentAxis
        tickFormat={(f) => {
          if (isPercentage) return `${Math.round(f * 100)}%`
          if (f > 5000) {
            return `${Math.round(f / 1000)}k`
          }
          return f
        }}
      />
    </VictoryChart>
  )
}

export default LineChart
