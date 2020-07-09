import React, {useState, useEffect} from 'react'
import {ComposableMap, Geographies, Geography} from 'react-simple-maps'
import {scaleQuantize} from 'd3-scale'
import {csv} from 'd3-fetch'

import honeyData from '../clean-data/honey2019.csv'

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

// Original example is here: https://www.react-simple-maps.io/examples/usa-with-state-labels/
function MapChart2(): JSX.Element {
  const [data, setData] = useState([])

  console.log(honeyData)

  // useEffect(() => {
  //   csv('/cleaned-data/honey2019.csv').then((d) => {
  //     console.log(d)
  //     setData(d)
  //   })
  // })

  const states = ({geographies}) =>
    geographies.map((geo) => (
      <Geography key={geo.rsmKey} stroke="#FFF" geography={geo} fill="#DDD" />
    ))

  return (
    <ComposableMap projection="geoAlbersUsa">
      <Geographies geography={geoUrl}>
        {states}
        {/* Labels states
        {({geographies}) => (
          <>
            {geographies.map((geo) => (
              <Geography key={geo.rsmKey} stroke="#FFF" geography={geo} fill="#DDD" />
            ))}
          //{geographies.map((geo) => {
            //const centroid = geoCentroid(geo)
            //const cur = allStates.find((s) => s.val === geo.id)
            //return (
              //<g key={`${geo.rsmKey}-name`}>
                //{cur &&
                  //centroid[0] > -160 &&
                  //centroid[0] < -67 &&
                  //(Object.keys(offsets).indexOf(cur.id) === -1 ? (
                    //<Marker coordinates={centroid}>
                      //<text y="2" fontSize={14} textAnchor="middle">
                        //{cur.id}
                      //</text>
                    //</Marker>
                  //) : (
                    //<Annotation subject={centroid} dx={offsets[cur.id][0]} dy={offsets[cur.id][1]}>
                      //<text x={4} fontSize={14} alignmentBaseline="middle">
                        //{cur.id}
                      //</text>
                    //</Annotation>
                  //))}
              //</g>
            //)
          })}
          </>
        )}
		*/}
      </Geographies>
    </ComposableMap>
  )
}

export default MapChart2
