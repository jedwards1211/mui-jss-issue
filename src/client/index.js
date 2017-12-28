// @flow

// $FlowFixMe
import { render, hydrate } from 'react-dom'
import * as React from 'react'
import { AppContainer } from 'react-hot-loader'
import Root from './Root'
import '../universal/components/initJss'

async function bootstrap(): Promise<any> {
  const rootElement = document.getElementById('root')
  if (!rootElement) throw new Error("Can't find #root element")

  function renderError(error: any) {
    render(
      <div>
        {error}
      </div>,
      rootElement
    )
  }

  let reloads = 0

  function mount(Root: typeof Root, callback?: () => void) {
    hydrate(
      <AppContainer key={++reloads}>
        <Root />
      </AppContainer>,
      rootElement,
      // $FlowFixMe
      callback,
    )
  }


  // Hot Module Replacement API
  if (module.hot instanceof Object) {
    module.hot.accept('./Root', () => {
      mount(require('./Root').default)
    })
  }

  mount(
    Root,
    () => {
      // We don't need the static css any more once we have launched our application.
      const ssStyles = document.getElementById('server-side-styles')
      if (ssStyles && ssStyles.parentNode) ssStyles.parentNode.removeChild(ssStyles)
    }
  )
}
bootstrap()

