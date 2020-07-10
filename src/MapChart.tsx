import React, {useState, useEffect} from 'react'
import {ComposableMap, Geographies, Geography} from 'react-simple-maps'
import {scaleLinear} from 'd3-scale'
import {extent} from 'd3-array'

import statesJsonMap from './states.json'

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

const baseColor = 'lightgray'
const scale = scaleLinear().range([baseColor, 'steelblue'])

// Original example is here: https://www.react-simple-maps.io/examples/usa-counties-choropleth-quantize/
function MapChart2({filter, data}): JSX.Element {
  const [filteredData, setFilteredData] = useState([])

  useEffect(() => {
    setFilteredData(data.filter((d) => !['other', 'US'].includes(d[0])))
  }, [data])

  const [version, setVersion] = useState(1)
  useEffect(() => {
    if (!filteredData.length) return
    scale.domain(extent(filteredData, (d) => d[2]))
    console.log(scale.domain())
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
            key={geo.rsmKey}
            stroke="#FFF"
            geography={geo}
            fill={cur ? scale(cur[2]) : baseColor}
          />
        )
      }),
    [filteredData]
  )

  if (!filteredData.length) return null

  return (
    <>
      <ComposableMap key={version} projection="geoAlbersUsa">
        <Geographies geography={geoUrl}>{states}</Geographies>
      </ComposableMap>
    </>
  )
}

export default MapChart2
