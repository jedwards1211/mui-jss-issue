// @flow

import * as React from 'react'
import {Route, Link, Switch} from 'react-router-dom'
import NotFound from './NotFound'
import WithStylesPlusInjectSheet from './WithStylesPlusInjectSheet'
import DynamicStyles from './DynamicStyles'

const Home = () => (
  <div>
    <h1>Material UI / JSS Issues</h1>
    <Link to="/withStylesPlusInjectSheet">
      withStyles + injectSheet issue
    </Link>
  </div>
)

const App = (): React.Element<any> => {
  return (
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/withStylesPlusInjectSheet" exact component={WithStylesPlusInjectSheet} />
      <Route path="/DynamicStyles" exact render={() => <DynamicStyles backgroundColor="blue" />} />
      <Route path="*" component={NotFound} />
    </Switch>
  )
}

export default App

