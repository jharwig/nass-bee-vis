import * as React from 'react'
import {
  VictoryChart,
  VictoryAxis,
  VictoryLine,
  VictoryBrushContainer,
  VictoryStyleInterface,
} from 'victory'

type Row = [string, string, number, 'percent' | '']
type Table = Row[]
type Domain = {min: number; max: number; firstYear: number; lastYear: number; usesQuarters: boolean}
type TickFormat = (n: number) => string

const dateForYearField = (d: Row): Date => {
  const [year, quarter] = d[1].split('-')
  if (quarter) {
    const month: {[key: string]: number} = {Q1: 0, Q2: 3, Q3: 6, Q4: 9}
    return new Date(+year, month[quarter], 1)
  }
  return new Date(+year, 0, 1)
}

function lineStyleForIndex(
  i: number,
  color: string
): VictoryStyleInterface /* VictoryLine['props']['style'] */ {
  if (i === 0) return {data: {stroke: color}}
  if (i === 1) return {data: {stroke: color, strokeDasharray: [5, 2]}}
  if (i === 2) return {data: {stroke: color, strokeOpacity: 0.5}}
  if (i === 3) return {data: {stroke: color, strokeDasharray: [5, 2], strokeOpacity: 0.5}}
  return {data: {stroke: color, strokeDasharray: [i, i * 2]}}
}

function getDomain(tables: Table[]): Domain {
  return tables.reduce(
    (domain: Domain, table: Table) => {
      table.forEach((row) => {
        const [year, quarter] = row[1].split('-')
        /* eslint no-param-reassign:off */
        if (quarter) domain.usesQuarters = true
        domain.firstYear = Math.min(+year, domain.firstYear)
        domain.lastYear = Math.max(+year, domain.lastYear)
        domain.max = Math.max(row[2], domain.max)
        domain.min = Math.min(row[2], domain.min)
      })
      return domain
    },
    {
      min: Number.MAX_SAFE_INTEGER,
      max: 0,
      firstYear: Number.MAX_SAFE_INTEGER,
      lastYear: 0,
      usesQuarters: false,
    }
  )
}

function LineChart({
  dataColors = 'black',
  altColors = 'red',
  setYear,
  data,
  altData,
}: {
  dataColors: string
  altColors: string
  setYear: (year: string) => void
  data: Table[]
  altData?: Table[]
}): JSX.Element {
  const mainDomain: Domain = getDomain(data)
  const altDomain: Domain | undefined = altData && getDomain(altData)

  const normalizedAltData:
    | {tickFormat: TickFormat; data: Table[]}
    | undefined = React.useMemo(() => {
    if (!altData?.length || !altDomain) return undefined

    return {
      tickFormat: (f: number) =>
        `${Math.round(
          ((f - mainDomain.min) / (mainDomain.max - mainDomain.min)) *
            (altDomain.max - altDomain.min) +
            altDomain.min
        )}`,
      data: altData.map((rows) =>
        rows.map((column) => {
          const d: Row = [...column]
          d[2] =
            ((d[2] - altDomain.min) / (altDomain.max - altDomain.min)) *
              (mainDomain.max - mainDomain.min) +
            mainDomain.min
          return d
        })
      ),
    }
  }, [altData, altDomain, mainDomain])

  const isPercentage = data && data[0] && data[0][0][3] === 'percent'
  const padding = {top: 10, right: 50, bottom: 30, left: 50}
  return (
    <VictoryChart
      key={`${mainDomain.usesQuarters}${mainDomain.lastYear}`}
      padding={padding}
      width={600}
      height={150}
      containerComponent={
        <VictoryBrushContainer
          defaultBrushArea="move"
          brushDimension="x"
          allowResize={false}
          brushStyle={{stroke: 'transparent', fill: 'black', fillOpacity: 0.1}}
          brushDomain={{
            x: mainDomain.usesQuarters
              ? [new Date(mainDomain.lastYear - 1, 10, 1), new Date(mainDomain.lastYear, 0, 1)]
              : [new Date(mainDomain.lastYear - 1, 1, 1), new Date(mainDomain.lastYear, 0, 1)],
          }}
          onBrushDomainChange={(domain) => {
            if (mainDomain.usesQuarters) {
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
      {data.map((rows, i, list) => (
        <VictoryLine
          data={rows}
          style={lineStyleForIndex(i, dataColors)}
          x={dateForYearField}
          y={2}
        />
      ))}
      <VictoryAxis tickFormat={(f) => f.getFullYear()} scale={{x: 'time', y: 'linear'}} />
      <VictoryAxis
        scale={{x: 'time', y: 'linear'}}
        dependentAxis
        style={{axis: {stroke: dataColors}, tickLabels: {fill: dataColors}}}
        tickFormat={(f) => {
          if (isPercentage) return `${Math.round(f * 100)}%`
          if (f > 5000) {
            return `${Math.round(f / 1000)}k`
          }
          return f
        }}
      />
      {/* Right Axis */}
      {normalizedAltData && (
        <VictoryAxis
          offsetX={padding.right}
          standalone={false}
          style={{axis: {stroke: altColors}, tickLabels: {fill: altColors}}}
          scale={{x: 'time', y: 'linear'}}
          dependentAxis
          tickFormat={normalizedAltData.tickFormat}
          orientation="right"
        />
      )}
      {normalizedAltData &&
        normalizedAltData.data.map((rows, i) => (
          <VictoryLine
            data={rows}
            style={lineStyleForIndex(i, altColors)}
            x={dateForYearField}
            y={2}
          />
        ))}
    </VictoryChart>
  )
}

export default LineChart
