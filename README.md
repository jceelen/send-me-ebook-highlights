# send-me-ebook-highlights #

Google Script that sends you daily/weekly/monthly highlights or clippings from your ebooks by e-mail.

## Getting started (development) ##
* Clone the repository
* Install devDependencies: `npm install --only=dev`

## Requirements ##
- CSV file created with [export-kobo](https://github.com/pettarin/export-kobo)
- Optional: use Hazel to upload export-kobo output to Google Drive
- Spreadsheet with imported CSV file in first sheet

## Features ##
* Imports CSV from Google Drive
* Sends a random highlight by e-mail
* Sends annotations to a second e-mailadres

## Wanted features #
* Improve format of annotation e-mail for readability
* Import every hour
* Configure time send highlights
* Configure frequency of highlights
* Updates changed items (is kobo-export updating notes?)
* Count how many times highlights are sent to make it more random
* on install: save spreadsheet ID
* Publish as a public add-on
* Send quotes through telegram/whatsapp/messenger

## Notes
* This script is developend using clasp, [documentation is available here](https://developers.google.com/apps-script/guides/clasp)