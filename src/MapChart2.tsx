import React, {useState, useEffect} from 'react'
import {ComposableMap, Geographies, Geography} from 'react-simple-maps'
import {scaleLinear} from 'd3-scale'
import {extent} from 'd3-array'

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

const baseColor = 'lightgray'
const scale = scaleLinear().range([baseColor, 'steelblue'])

// Original example is here: https://www.react-simple-maps.io/examples/usa-counties-choropleth-quantize/
function MapChart2({data}): JSX.Element {
  const [field, setField] = useState('Yield-per-colony')

  useEffect(() => {
    scale.domain(extent(data, (d) => d[field]))
  }, [data, field])

  const states = ({geographies}) =>
    geographies.map((geo) => {
      const cur = data.find((d) => d.State === geo.properties.name)
      return (
        <Geography
          key={geo.rsmKey}
          stroke="#FFF"
          geography={geo}
          fill={cur ? scale(cur[field]) : baseColor}
        />
      )
    })

  return (
    <ComposableMap projection="geoAlbersUsa">
      <Geographies geography={geoUrl}>{states}</Geographies>
    </ComposableMap>
  )
}

export default MapChart2
