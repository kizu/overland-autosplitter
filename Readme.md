# Overland Autosplitter / Tracker

This is a [speedrunning](https://www.speedrun.com/overland/#Any) autosplitter for the [Overland](https://overland-game.com/) game.

It is just a node.js app that runs [vite](https://vitejs.dev) for the front-end part, and [chokidar](https://github.com/paulmillr/chokidar), wrapped in [Electron](https://www.electronjs.org/) (with a help of this [quick start](https://github.com/electron/electron-quick-start-typescript)) (and some other stuff, see package.json) for monitoring the Overland's save files and providing the API.

## Disclaimer

This is a pre-alpha version, it is very raw and in development, do not expect it to work well.

## Run

The latest version is available in the [Releases](https://github.com/kizu/overland-autosplitter/releases).

For now only a very very basic and buggy windows version available pre-build.

When you would run the app, you'll need to first select an Overland saves directory to watch for changes: it is a `gameSaves` folder that you can find if you'd run Overland and go to `Options` -> `Support` -> `Save files`.

After that whenever you would start a new game, the tracker should automatically track the start and the end, however there would be slight delays/differences with the Speedrun.com rules due to the tracker only tracking the changes in the save files.

In order to help the tracker there are keyboard shortcuts that start and end the run and are available globally: `ctrl+shift+1` or `ctrl+shift+z` to start a run, and `ctrl+shift+2` or `ctrl+shift+x` to end it. The option to redefine the shortcuts is planned.

### Development version

If you know what you're doing: after cloning the project and doing `yarn install`:

- To run a dev electron version: `yarn dev`
- To run a express.js web app version: `yarn start:app`
