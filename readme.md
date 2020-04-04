# BurdIRC

This is the next flavor of the BurdIRC IRC client. The main goal in this new recode is to drop electron in favor running via webpage or via chrome's --app switch.

## Installation

Make sure you have node.js and NPM installed. Next clone this repository, then in the main BurdIRC directory run

```bash
npm install
```

## Usage

After you have installed the required modules run the follow to start the server

```bash
node index.js
```
Once the server is running you can open the app two ways, either by using chrome's (or chromium's) --app switch (**Recommended**)

```bash
chrome --app=http://localhost:2083/
```
Or by running the app as a webpage, by visiting the URL in your browser
```bash
http://localhost:2083/open.html
```