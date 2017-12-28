// @flow

import jss from 'jss'
import preset from 'jss-preset-default'
import expand from 'jss-expand'
import nested from 'jss-nested'

jss.setup(preset())
jss.use(nested())
jss.use(expand())

