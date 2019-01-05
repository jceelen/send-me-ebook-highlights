# send-me-ebook-highlights #

Google Script that sends you daily/weekly/monthly highlights or clippings from your ebooks by e-mail.

## Getting started ##
* Clone the repository
* Install devDependencies: `npm install --only=dev`

## Requirements ##
- CSV file created with [export-kobo](https://github.com/pettarin/export-kobo)
- Spreadsheet with imported CSV file in first sheet

## Features ##
* Sends a random highlight by e-mail

## Wanted features ##
* Add date to subject (to make it unique)
* Count how many times highlights are sent
* on install: save spreadsheet ID
* Publish as a public add-on
* Send quotes through telegram/whatsapp/messenger

## Notes
* This script is developend using clasp, [documentation is available here](https://developers.google.com/apps-script/guides/clasp)