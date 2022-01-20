# Nekiro's Rcc Editor

Nekiro's Rcc Editor is easy to use tool that allows you to replace assets in compiled qt resource files .rcc.

Framework: Electron

Languages: html, js, css

## Features

- Load rcc
- Compile rcc
- Replace images
- Extract assets

## Installation

Nekiro's Rcc Editor requires [Node.js](https://nodejs.org/) to run.
Install the dependencies and start the main script.

```sh
cd nekiro-rcc-editor
npm i
npm run compile
npm run start
```

## Compilation

Follow above instructions, but instead of **start** write **build**, build files are written to /dist directory

```sh
npm run build
```

## Donate

If you like my work and respect my time, consider becoming [Github Sponsor](https://github.com/sponsors/nekiro).

### Credits

- [rccextended](https://github.com/zedxxx/rccextended) for awesome QT rcc lib
