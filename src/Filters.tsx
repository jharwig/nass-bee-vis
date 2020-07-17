import * as React from 'react'
import {css} from '@emotion/core'

export interface Filter {
  state: string
  file: string
  index: number
  desc: string
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

function Filters({filter, setFilter}: FiltersProps): JSX.Element {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const {file, index, desc} = event.target.dataset
    if (file && index) {
      setFilter((filter) => ({...filter, file, desc, index: +index}))
    }
  }

  const filterDefs = [
    {
      group: 'Colonies',
      items: [
        {name: 'All', file: 'numbers', index: 1},
        {name: 'Lost', file: 'numbers', index: 3},
        {name: 'Renovated', file: 'numbers', index: 6},
        {name: 'Honey Producing', file: 'honey', index: 1},
      ],
    },
    {
      group: 'Honey',
      items: [
        {name: 'Yield', file: 'honey', index: 2},
        {name: 'Production', file: 'honey', index: 3},
        {name: 'Stocks', file: 'honey', index: 4},
        {name: 'Price / Pound', file: 'honey', index: 5},
        {name: 'Value of Production', file: 'honey', index: 6},
      ],
    },
    {
      group: 'Stressors',
      items: [
        {name: 'Varroa mites', file: 'stressors', index: 1},
        {name: 'Other Pests', file: 'stressors', index: 2},
        {name: 'Diseases', file: 'stressors', index: 3},
        {name: 'Pesticides', file: 'stressors', index: 4},
        {name: 'Other', file: 'stressors', index: 5},
        {name: 'Unknown', file: 'stressors', index: 6},
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
                type="radio"
                name="column"
                onChange={onChange}
                checked={filter.file === file && index === filter.index}
                data-desc={name}
                data-file={file}
                data-index={index}
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
