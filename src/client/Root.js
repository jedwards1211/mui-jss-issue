/* @flow */

import * as React from 'react'
import {BrowserRouter as Router} from 'react-router-dom'
import App from '../universal/components/App'
import {MuiThemeProvider} from 'material-ui/styles'
import theme from '../universal/theme'

type Props = {
}

export default class Root extends React.Component<Props, void> {
  render(): React.Node {
    return (
      <MuiThemeProvider theme={theme}>
        <Router>
          <App />
        </Router>
      </MuiThemeProvider>
    )
  }
}
