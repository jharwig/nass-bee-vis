import React, {useState, useEffect} from 'react'
import {ComposableMap, Geographies, Geography} from 'react-simple-maps'
import {scaleLinear} from 'd3-scale'
import {extent} from 'd3-array'
import ReactTooltip from 'react-tooltip'

import statesJsonMap from './states.json'

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

const baseColor = 'lightgray'
const scale = scaleLinear().range([baseColor, 'steelblue'])

// Original example is here: https://www.react-simple-maps.io/examples/usa-counties-choropleth-quantize/
function MapChart({setTooltipContent, filter, data}): JSX.Element {
  const [filteredData, setFilteredData] = useState([])

  useEffect(() => {
    setFilteredData(data.filter((d) => !['other', 'US'].includes(d[0])))
  }, [data])

  const [version, setVersion] = useState(1)
  useEffect(() => {
    if (!filteredData.length) return
    scale.domain(extent(filteredData, (d) => d[2]))
  }, [filteredData])

  useEffect(() => {
    setVersion((v) => v + 1)
  }, [filter])

  const states = React.useCallback(
    ({geographies}) =>
      geographies.map((geo) => {
        const cur = filteredData.find((d) => statesJsonMap[d[0]] === geo.properties.name)
        return (
          <Geography
            onMouseEnter={() => {
              setTooltipContent(geo.properties.name)
            }}
            onMouseLeave={() => {
              setTooltipContent('')
            }}
            key={geo.rsmKey}
            stroke="#FFF"
            geography={geo}
            fill={cur ? scale(cur[2]) : baseColor}
          />
        )
      }),
    [filteredData, setTooltipContent]
  )

  // Because of returning null below, react-tooltip may lose track
  // of elements that we want a tooltip over (data-tip="").
  // Rebuilding the tooltip tells it to finds these elements again.
  useEffect(() => {
    ReactTooltip.rebuild()
  })

  if (!filteredData.length) return null

  return (
    <>
      <ComposableMap data-tip="" key={version} projection="geoAlbersUsa">
        <Geographies geography={geoUrl}>{states}</Geographies>
      </ComposableMap>
    </>
  )
}

// react-tooltip docs recommend using React.memo to "prevent excessive
// rendering when the content of the tooltip is set"
export default React.memo(MapChart)
