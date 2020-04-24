# PicoACM
A small, lightweight Access Control application for AdHoc situations.

## Backstory
A freind came to me with an issue of hosting a holiday party at a company, and wanted to implement access control.

It seems that largely, the infrastructure and initial investment for something so simple just didn't make sense.

So I thought it would be neat to build a simple cross-platform app that can satisfy this little niche need.

## The goals
Lightweight (Relatively... it is electron, afterall)

No need for internet (Party in the desert?)

Operator Mode --> To station someone to handle the badging, if desired

Journal --> To log entries and exits in the database

## Installation
```bash
# clone the repo locally
git clone https://github.com/AndrewDavis1191/PicoACM-Electron.git
# start the app with npm
npm start
```

## Usage
Populate the users via the CRUD, or import a CSV of your users (this can be exported from your established Access Management System if you have one in place)

Set up a device that can accept badge reads via USB, like one of the PcProx readers shown below:
![Image of pcprox](https://github.com/AndrewDavis1191/PicoACM-Electron/blob/master/images/pscprox%20reader.png)
![Image of pcproxalt](https://github.com/AndrewDavis1191/PicoACM-Electron/blob/master/images/pcprox%20reader%20alt.png)

Switch to kiosk mode, and your AdHoc Access Control is ready to go!

## Tech used (so far)
HTML

CSS (bulma)

JS (node/electron)

SQLite3

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Constructive Criticism!
Please please please send feedback to me if you have suggestions on code in any manner; operation, readability, overall javascript best practices.

This is my first time messing around with JavaScript, and I wanted to go vanilla, as I'd like to move into react and actually appreciate the problems it solves; Most of what I've done professionally is Powershell.:poop:

## License
[MIT](https://choosealicense.com/licenses/mit/)
