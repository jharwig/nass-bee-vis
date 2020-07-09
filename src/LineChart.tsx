import * as React from 'react'
import {VictoryChart, VictoryLine} from 'victory'

const dateForYearField = (d) => {
  const [year, quarter] = d[1].split('-')
  if (quarter) {
    const month = {Q1: 0, Q2: 3, Q3: 6, Q4: 9}
    return new Date(year, month[quarter])
  }
  return new Date(year)
}

function LineChart({data}: {data: [string, string, number][]}): JSX.Element {
  return (
    <VictoryChart height={200}>
      <VictoryLine data={data} x={dateForYearField} y={2} />
    </VictoryChart>
  )
}

export default LineChart
