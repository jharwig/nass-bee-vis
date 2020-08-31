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

  const filterDefs = [
    {
      group: 'Colonies',
      items: [
        {name: 'All', file: 'numbers', index: 1, units: '#'},
        {name: 'Lost', file: 'numbers', index: 3, units: '#'},
        {name: 'Renovated', file: 'numbers', index: 6, units: '#'},
        {name: 'Honey Producing', file: 'honey', index: 1, units: '#'},
      ],
    },
    {
      group: 'Honey',
      items: [
        {name: 'Yield', file: 'honey', index: 2, units: 'lbs'},
        {name: 'Production', file: 'honey', index: 3, units: 'lbs'},
        {name: 'Stocks', file: 'honey', index: 4, units: 'lbs'},
        {name: 'Price / Pound', file: 'honey', index: 5, units: '$'},
        {name: 'Value of Production', file: 'honey', index: 6, units: '$'},
      ],
    },
    {
      group: 'Stressors',
      items: [
        {name: 'Varroa mites', file: 'stressors', index: 1, units: '%'},
        {name: 'Other Pests', file: 'stressors', index: 2, units: '%'},
        {name: 'Diseases', file: 'stressors', index: 3, units: '%'},
        {name: 'Pesticides', file: 'stressors', index: 4, units: '%'},
        {name: 'Other', file: 'stressors', index: 5, units: '%'},
        {name: 'Unknown', file: 'stressors', index: 6, units: '%'},
      ],
    },
  ]
  return (
    <>
      {filterDefs.map(({group, items}) => (
        <section css={section} key={group}>
          <strong>{group}</strong>
          {items.map(({file, index, name, units}) => (
            <label key={file + index} css={label}>
              <input
                type="checkbox"
                name="column"
                onChange={onChange}
                checked={
                  filter.tables && filter.tables.filter((table) => table.desc === name).length === 1
                }
                data-desc={name}
                data-file={file}
                data-index={index}
                data-units={units}
                disabled={!canAddFilterTypes && !filterTypes[units]}
              />{' '}
              <span className="desc" title={name}>
                {name}
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
