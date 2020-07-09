import React, {useState, useEffect} from 'react'
import {ComposableMap, Geographies, Geography} from 'react-simple-maps'
import {scaleLinear} from 'd3-scale'
import {extent} from 'd3-array'

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

const baseColor = 'lightgray'
const scale = scaleLinear().range([baseColor, 'steelblue'])

// Original example is here: https://www.react-simple-maps.io/examples/usa-counties-choropleth-quantize/
function MapChart2({columns, data}): JSX.Element {
  const [field, setField] = useState(columns[1])
  const [year, setYear] = useState('2019-hony')
  const [filteredData, setFilteredData] = useState([])

  useEffect(() => {
    setFilteredData(
      data.filter(
        (d) =>
          d[columns.indexOf('Year')] === year &&
          !['Other States 5/ 6/', 'United States 6/ 7/'].includes(d[columns.indexOf('State')])
      )
    )
  }, [data, field, year, columns])

  useEffect(() => {
    scale.domain(extent(filteredData, (d) => +d[columns.indexOf(field)]))
    console.log(filteredData)
    console.log(scale.domain())
  }, [field, filteredData, columns])

  const states = ({geographies}) =>
    geographies.map((geo) => {
      const cur = filteredData.find((d) => d[columns.indexOf('State')] === geo.properties.name)
      return (
        <Geography
          key={geo.rsmKey}
          stroke="#FFF"
          geography={geo}
          fill={cur ? scale(cur[columns.indexOf(field)]) : baseColor}
        />
      )
    })

  return (
    <>
      <ComposableMap projection="geoAlbersUsa">
        <Geographies geography={geoUrl}>{states}</Geographies>
      </ComposableMap>
      <select onChange={(e) => setField(e.target.value)}>
        {columns.map((col) => (
          <option key={col} value={col} selected={col === field}>
            {col}
          </option>
        ))}
      </select>
    </>
  )
}

export default MapChart2
