import * as React from 'react'

import injectSheet from 'react-jss'

const styles = {
  root: {
    backgroundColor: props => props.backgroundColor,
  }
}

const DynamicStyles = injectSheet(styles)(({classes}) => (
  <div className={classes.root}>
    Dynamic backgroundColor
  </div>
))

export default DynamicStyles