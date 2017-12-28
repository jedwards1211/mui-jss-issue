import * as React from 'react'

import injectSheet from 'react-jss'
import {withStyles} from 'material-ui/styles'
import Typography from 'material-ui/Typography'

const styles1 = {
  root: {
    backgroundColor: '#d3d3d3',
  }
}

const MuiComp = withStyles(styles1)(({classes}) => (
  <div className={classes.root}>
    <Typography>
      withStyles
    </Typography>
  </div>
))

const styles2 = {
  root: {
    backgroundColor: '#bababa',
  }
}

const JssComp = injectSheet(styles2)(({classes}) => (
  <div className={classes.root}>
    <Typography>
      injectSheet
    </Typography>
  </div>
))

export default () => (
  <div>
    <MuiComp />
    <JssComp />
  </div>
)
