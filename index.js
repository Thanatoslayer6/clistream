#!/usr/bin/env node

const SflixClass = require('./lib/sflix');
const SessionClass = require('./lib/session');
const os = require('os')

let Instance = new SflixClass("https://sflix.to");
let Session = new SessionClass(`${os.homedir()}/.config/CliStream`, Instance);

// Main
;(async() => {
    try {
        Session.current = Session.getOld(); // Grab old session if possible
        await Session.StartMenu();
    } catch (error) {
        console.error(error)
    }
})();
