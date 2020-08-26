import * as React from 'react'
import {css} from '@emotion/core'

export interface Filter {
  state: string
  tables: {file: string; index: number; desc: string}[]
}

interface FiltersProps {
  filter: Filter
  setFilter: React.SetStateAction<Filter>
}

const section = css(`
margin-bottom: 1em;
strong {
font-variant: small-caps;
text-transform: lowercase;
opacity: 0.5
}
`)

const label = css(`
display: block;
margin-bottom: 0.1em;
`)

// const newTables = prevState.tables
// newTables.push({file: file, index: index, desc: desc})
// return {state: prevFilter.state, tables: newTables}

function Filters({filter, setFilter}: FiltersProps): JSX.Element {
  const [filterTypes, setFilterTypes] = React.useState([])
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const {checked} = event.target
    const {file, index, desc} = event.target.dataset
    if (file && index) {
      setFilter((prevFilter) => {
        const newTables = prevFilter.tables
        if (checked) {
          newTables.push({file, index, desc})
        } else {
          for (let i = 0; i < newTables.length; i++) {
            if (newTables[i].desc === desc) {
              newTables.splice(i, 1)
              break
            }
          }
        }
        return {state: prevFilter.state, tables: newTables}
      })
    }
  }

  const filterDefs = [
    {
      group: 'Colonies',
      items: [
        {name: 'All', file: 'numbers', index: 1, units: 'colonies'},
        {name: 'Lost', file: 'numbers', index: 3, units: 'colonies'},
        {name: 'Renovated', file: 'numbers', index: 6, units: 'colonies'},
        {name: 'Honey Producing', file: 'honey', index: 1, units: 'colonies'},
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
          {items.map(({file, index, name}) => (
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
                disabled={false}
              />{' '}
              {name}
            </label>
          ))}
        </section>
      ))}
    </>
  )
}

export default Filters
