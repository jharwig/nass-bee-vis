import * as React from 'react'
import {VictoryChart, VictoryLine} from 'victory'

import honey from '../merged-data/honey.json'

import {Filter} from './Filters'
// import numbers from '../merged-data/numbers.json'
// import stressors from '../merged-data/stressors.json'

function LineChart({filter}: {filter: Filter}): JSX.Element {
  console.log(filter)
  return null
  // const data = honey.rows.filter((row) => row[0].startsWith(filter.state))
  // return (
  // <VictoryChart>
  // <VictoryLine data={data} x={(d) => new Date(d[7])} y={(d) => Number(d[1])} />
  // </VictoryChart>
  // )
}

export default LineChart
