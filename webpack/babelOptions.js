module.exports = {
  "babelrc": false,
  "presets": [
    ["env", {
      "targets": {"browsers": "> 5%", "uglify": true}, "loose": true, "modules": false,
    }],
    "react", "flow"
  ],
  "plugins": [
    "transform-class-properties"
  ]
}
