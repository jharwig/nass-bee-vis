import * as React from 'react'
import {css} from '@emotion/core'

export interface Filter {
  state: string
  tables: {file: string; index: number; desc: string; units: string}[]
}

interface LegendStyle {
  stroke: string
  strokeDasharray?: number[]
  strokeOpacity?: number
}

export type Legend = Record<string, LegendStyle>
export const FilterDefs = [
  {
    group: 'Colonies',
    items: [
      {desc: 'All', file: 'numbers', index: 1, units: '#'},
      {desc: 'Lost', file: 'numbers', index: 3, units: '#'},
      {desc: 'Renovated', file: 'numbers', index: 6, units: '#'},
      {desc: 'Honey Producing', file: 'honey', index: 1, units: '#'},
    ],
  },
  {
    group: 'Honey',
    items: [
      {desc: 'Yield / Colony', file: 'honey', index: 2, units: 'lbs'},
      {desc: 'Production', file: 'honey', index: 3, units: 'lbs'},
      {desc: 'Stocks', file: 'honey', index: 4, units: 'lbs'},
      {desc: 'Price / Pound', file: 'honey', index: 5, units: '$'},
      {desc: 'Value of Production', file: 'honey', index: 6, units: '$'},
    ],
  },
  {
    group: 'Stressors',
    items: [
      {desc: 'Varroa mites', file: 'stressors', index: 1, units: '%'},
      {desc: 'Other Pests', file: 'stressors', index: 2, units: '%'},
      {desc: 'Diseases', file: 'stressors', index: 3, units: '%'},
      {desc: 'Pesticides', file: 'stressors', index: 4, units: '%'},
      {desc: 'Other', file: 'stressors', index: 5, units: '%'},
      {desc: 'Unknown', file: 'stressors', index: 6, units: '%'},
    ],
  },
]

interface FiltersProps {
  filter: Filter
  setFilter: React.Dispatch<React.SetStateAction<Filter>>
  legend: Legend | undefined
}

const section = css`
  margin-bottom: 1em;
  strong {
    font-variant: small-caps;
    text-transform: lowercase;
    opacity: 0.5;
  }
`

const label = css`
  display: block;
  margin-bottom: 0.1em;
  display: flex;
  align-items: center;
  span.desc {
    flex: 1 1 100%;
    padding-right: 5px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  span.unit {
    color: #535863;
    padding: 0px 10px 0px 0px;
    font-size: 9pt;
  }
  div.legendItem {
    width: 20px;
    flex: none;
    margin-right: 5px;
  }
`

function LegendItem({stroke, strokeDasharray, strokeOpacity}: LegendStyle): JSX.Element {
  // Make the dashed lines easier to see at a smaller scale
  const dasharray = strokeDasharray?.map((number) => number * 5).join(' ')
  return (
    <svg viewBox="0 0 100 100" width="20" height="20">
      <path
        strokeWidth="10"
        fill="none"
        stroke={stroke}
        strokeDasharray={dasharray}
        strokeOpacity={strokeOpacity}
        d="M 0 70 L 30 10 L 60 90 L 100 40 "
      />
    </svg>
  )
}

function Filters({filter, setFilter, legend}: FiltersProps): JSX.Element {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const {checked} = event.target
    const {file, index, desc, units} = event.target.dataset
    if (file && index && desc && units) {
      setFilter((prevFilter) => {
        const newTables = [...prevFilter.tables]
        if (checked) {
          newTables.push({file, index: +index, desc, units})
        } else {
          const removeIndex = newTables.findIndex((t) => t.desc === desc)
          if (removeIndex >= 0) {
            newTables.splice(removeIndex, 1)
          }
        }
        return {...prevFilter, tables: newTables}
      })
    }
  }
  const filterTypes: {[key: string]: boolean} = React.useMemo(() => {
    const units: {[key: string]: boolean} = {}
    filter.tables.forEach((t) => {
      units[t.units] = true
    })
    return units
  }, [filter.tables])
  const canAddFilterTypes = Object.keys(filterTypes).length < 2

  return (
    <>
      {FilterDefs.map(({group, items}) => (
        <section css={section} key={group}>
          <strong>{group}</strong>
          {items.map(({file, index, desc, units}) => (
            <label key={file + index} css={label}>
              <input
                type="checkbox"
                name="column"
                onChange={onChange}
                checked={
                  filter.tables && filter.tables.filter((table) => table.desc === desc).length === 1
                }
                data-desc={desc}
                data-file={file}
                data-index={index}
                data-units={units}
                disabled={!canAddFilterTypes && !filterTypes[units]}
              />{' '}
              <span className="desc" title={desc}>
                {desc}
              </span>
              <span className="unit">{units}</span>
              <div className="legendItem">
                {legend && legend[file + index] && <LegendItem {...legend[file + index]} />}
              </div>
            </label>
          ))}
        </section>
      ))}
    </>
  )
}

export default Filters
