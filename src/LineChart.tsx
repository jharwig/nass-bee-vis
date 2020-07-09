import * as React from 'react'
import {VictoryChart, VictoryLine} from 'victory'

import honey from '../merged-data/honey.json'
import numbers from '../merged-data/numbers.json'
import stressors from '../merged-data/stressors.json'

const us = honey.rows.filter((row) => row[0].startsWith('United States'))

function LineChart(): JSX.Element {
  console.log(us)
  return (
    <VictoryChart>
      <VictoryLine data={us} x={(d) => new Date(d[7])} y={(d) => Number(d[1])} />
    </VictoryChart>
  )
}

export default LineChart
