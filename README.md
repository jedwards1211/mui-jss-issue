# mui-jss-issue

Demonstrates an issue when using Material UI together with react-jss' injectSheet.

## Running

Make sure ports 3000 and 4000 are open.

In one terminal, run:
```
./run dev:server
```

In another terminal, run:
```
./run dev:client
```


### Static styles

Then open http://localhost:4000/withStylesPlusInjectSheet.

Open the dev tools and you will see the following error in the console:

```
Warning: Prop `className` did not match. Server: "Component- Unthemed- Static-root-26" Client: "Component-root-0-1"
```

This is because the `createGenerateClassName` function from `material-ui/styles` doesn't process `styleSheet.options.meta` from 
`injectSheet` correctly.

### Dynamic styles

Same issue, but allows you to see how multiple style sheets get created by `injectSheet` for dynamic styles.

Open http://localhost:4000/DynamicStyles.

Open the dev tools and you will see the following error in the console:

```
Warning: Prop `className` did not match. Server: "Component- Unthemed- Dynamic-root-2 Component- Unthemed- Static-root-1" Client: "Component-root-0-2 Component-root-0-1"
```
