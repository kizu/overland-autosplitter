# Overland Autosplitter / Tracker

This is a [speedrunning](https://www.speedrun.com/overland/#Any) autosplitter for the [Overland](https://overland-game.com/) game.

For now it is just a node.js app that runs [vite](https://vitejs.dev) for the front-end part, and [express](https://expressjs.com/) with [chokidar](https://github.com/paulmillr/chokidar) (and some other stuff, see package.json) for monitoring the Overland's save files and providing the API.

## Run

```sh
yarn
yarn start
```
