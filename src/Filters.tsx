import * as React from 'react'
import {css} from '@emotion/core'

export interface Filter {
  state: string
  file: string
  index: number
}

interface FiltersProps {
  states: string[]
  filter: Filter
  setFilter: React.SetStateAction<Filter>
}

const label = css(`
display: block;
`)

function Filters({states, filter, setFilter}: FiltersProps): JSX.Element {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const {file, index} = event.target.dataset
    if (file && index) {
      setFilter((filter) => ({...filter, file, index: +index}))
    }
  }
  const onChangeState = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilter((filter) => ({...filter, state: event.target.value}))
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
      ],
    },
  ]
  return (
    <>
      <label>
        State
        <select value={filter.state} onChange={onChangeState}>
          <option value="US">US</option>
          {states.map(
            (state) =>
              state !== 'US' && (
                <option key={state} value={state}>
                  {state}
                </option>
              )
          )}
        </select>
      </label>
      {filterDefs.map(({group, items}) => (
        <section key={group}>
          <strong>{group}</strong>
          {items.map(({file, index, name}) => (
            <label key={file + index} css={label}>
              <input
                type="radio"
                name="column"
                onChange={onChange}
                checked={filter.file === file && index === filter.index}
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

/*
 *
 *
      <section>
        <strong>Colonies</strong>
        <label>
          <input
            type="radio"
            name="column"
            onChange={onChange}
            checked={1 === filter.index}
            data-file="numbers"
            data-index="1"
          />
          All
        </label>
          <input
            type="radio"
            name="column"
            onChange={onChange}
            data-file="numbers"
            data-index="3"
          />{' '}
          Lost
          <input
            type="radio"
            name="column"
            onChange={onChange}
            data-file="numbers"
            data-index="6"
          />{' '}
          Renovated
          <input
            type="radio"
            name="column"
            onChange={onChange}
            data-file="honey"
            data-index="1"
          />{' '}
          Honey Producing
        </label>
      </section>
      <section>
        <strong>Honey</strong>
        <label>
          <input type="radio" name="column" onChange={onChange} data-file="honey" data-index="2" />{' '}
          Yield
          <input
            type="radio"
            name="column"
            onChange={onChange}
            data-file="honey"
            data-index="3"
          />{' '}
          Production
        </label>
      </section>
 */
