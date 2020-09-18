import React, {useEffect} from 'react'
import {ComposableMap, Geographies, Geography} from 'react-simple-maps'
import {scaleLinear} from 'd3-scale'
import {extent} from 'd3-array'
import ReactTooltip from 'react-tooltip'

import {Filter} from './Filters'
import {Table, Row} from './LineChart'
import statesJsonMap from './states.json'

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

const colorScale = scaleLinear(['#FFF1CC', '#C59108'])
const NoData = {color: 'lightgray', tooltip: 'No Data'}

function format(value: number, filter: Filter['tables'][0]): string {
  const {units} = filter
  const formattedValue = value.toLocaleString()

  if (units === '#') {
    return `${formattedValue} colonies`
  }
  if (units === '%') {
    return `${formattedValue}%`
  }
  if (units === 'lbs') {
    return `${formattedValue} lbs`
  }
  if (units === '$') {
    return `$${formattedValue}`
  }
  return formattedValue
}

function includeRow(row: Row): boolean {
  return !['other', 'us'].includes(row[0].toLowerCase())
}

interface MapChartProps {
  data: Table
  filter: Filter['tables'][0]
  setTooltipContent: (content: string) => void
}

// Original example is here: https://www.react-simple-maps.io/examples/usa-counties-choropleth-quantize/
function MapChart({setTooltipContent, filter, data}: MapChartProps): JSX.Element {
  const dataByGeoName: {[key: string]: {tooltip: string; color: string}} = React.useMemo(() => {
    if (!data.length) return data
    const e = extent(data, (d) => (includeRow(d) ? d[2] : undefined))
    colorScale.domain(e)

    return data.reduce((memo, row) => {
      if (includeRow(row)) {
        const tooltip = !Number.isNaN(row[2]) ? format(row[2], filter) : NoData.tooltip
        const color = !isNaN(row[2]) ? colorScale(row[2]) : NoData.color
        memo[statesJsonMap[row[0]]] = {
          tooltip,
          color,
        }
      }
      return memo
    }, {})
  }, [data, filter])

  const states = React.useCallback(
    ({geographies}) =>
      geographies.map((geo) => {
        const {tooltip, color} = dataByGeoName[geo.properties.name] ?? NoData
        return (
          <Geography
            onMouseEnter={() => {
              setTooltipContent(tooltip)
            }}
            onMouseLeave={() => {
              setTooltipContent('')
            }}
            key={`${geo.rsmKey}-${tooltip}-${color}`}
            stroke="#FFF"
            geography={geo}
            fill={color}
          />
        )
      }),
    [dataByGeoName, setTooltipContent]
  )

  // Because of returning null below, react-tooltip may lose track
  // of elements that we want a tooltip over (data-tip="").
  // Rebuilding the tooltip tells it to finds these elements again.
  useEffect(() => {
    ReactTooltip.rebuild()
  })

  return (
    <ComposableMap data-tip="" projection="geoAlbersUsa">
      <Geographies geography={geoUrl}>{states}</Geographies>
    </ComposableMap>
  )
}

// react-tooltip docs recommend using React.memo to "prevent excessive
// rendering when the content of the tooltip is set"
export default React.memo(MapChart)
