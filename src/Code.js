/**
 * Google Script that sends you daily/weekly/monthly highlights or 
 * clippings from your ebooks by e-mail.
 * 
 * Configuration: update conf.js
 * Call main() with a timer to run the script or test() for testing purposes.
 */
function main(mode) {
  console.info('Started main().');
  // Get config based on environment
  var ENV_CONFIG = setEnvConfig(mode);
  // Get the header from the config
  var header = getHeader(ENV_CONFIG.columns);
  // Check status of sheet (header etc)
  var sheet = getSheet(ENV_CONFIG, header);
  // Imports new items from CSV file
  importKoboExport(ENV_CONFIG, sheet);
  // Retrieves a highlight randomly selected from the sheet
  sendHighlight(ENV_CONFIG, sheet);
  // Markup all data in the sheet
  markupData(ENV_CONFIG, sheet);
  console.info('Finished main().');
}

/**
 * Selects a random highlight and send it by e-mail
 */
function sendHighlight(config, sheet) {
  console.info('Started routine for sending a highlight...');
  
  // get the data
  var data = {
    highlights: getHighlights(sheet)
  };

  // generate random number within range of the data
  var randomRow = getRandomInteger(0, data.highlights.length-1);
  var highlights = data.highlights;
  var randomHighlight = highlights[randomRow];

  // select te row from the data
  console.log({
    'message': 'Returned highlight from random row: ' + randomRow + '.',
    'jsonPayload': randomHighlight
  });
  sendHighlightMail(config, randomHighlight);
}

/**
 * Sends the actual e-mail containing the highlight
 */
function sendHighlightMail(config, highlight) {
  var date = new Date();
  var sendEmail = config.sendEmail;
  var emailAddress = EMAIL;
  var book = highlight[1];
  var author = highlight[2];
  var highlightText = highlight[6];
  var message = '<body style="background:#FFD371; color:#045E68; font-family:Georgia, serif; font-size:16px" alink="#045E68" link="#045E68" bgcolor="#FFD371" text="#045E68">' +
                '<table style="background:#FFD371; color:#045E68; font-family:Georgia, serif; font-size:16px" bgcolor="#FFD371" id="bgtable" align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%"><tr><td>' +
                '<!-- container 600px -->' +
                '<table border="0" cellpadding="25" cellspacing="0" class="container" width="600"><tr><td style="background:#FFD371; color:#045E68; font-family:Georgia, serif; font-size:16px" align="left" valign="top">' +
                  '<p ><strong>' + book + '</strong> by '+ author +'</p>' +
                  '<p><i>'+highlightText+'</i></p>' +
                '</td></tr></table>' +
                '<!-- container 600px -->' +
                '</td></tr></body>';
  
  console.log('Message for e-mail prepared: ' + message);

  // Send the actual e-mail if enabled in config.
  if(sendEmail){
    MailApp.sendEmail({
      to: emailAddress,
      replyTo: 'noreply@jasperceelen.nl',
      subject: 'Your Highlight for ' + date.toDateString(),
      htmlBody: message
    });
  } else {
    console.warn('Skipped sending the e-mail, was disabled in config.');
  }

}

/**
 * Returns all highlights in the sheet
 */
function getHighlights(sheet) {
  // Set variables for range
  var startRow = 2; // Skipping the header
  var numRows = sheet.getLastRow() - 1; // -1 because startRow is 2
  var startColumn = 1; // Starting at first column
  var numColumns = sheet.getLastColumn(); // Last column
  var dataRange = sheet.getRange(startRow, startColumn, numRows, numColumns);
  var items = dataRange.getValues();
  var highlights = [];

  if (items.length > 0) {
    highlights = filterHighlights(items);
  } else {
    console.info('Found no items in sheet.');
    return;
  }
  
  console.log({
    'message': 'Returned ' + highlights.length + ' highlights from ' + sheet.getName() + '.',
    'jsonPayload': highlights
  });

  return highlights;
}

/**
 * Filters items in the sheet and returns an array of only highlights
 */
function filterHighlights(items) {
  var highlights = [];
  for (var i = 0; i < items.length; i++) {
    if (items[i][0] == 'highlight') {
      console.log({
        'message': 'Found a highlight on index ' + i + ' of ' + items.length + ' items.',
        'items': items[i]
      });
      highlights.push(items[i]);
    }
  }
  console.log('Filtered ' + items.length + ' items and found ' + highlights.length + ' highlights.');
  return highlights;
}

/**
 * Imports annotations, highlights and bookmarks from kobo-export.csv
 */
function importKoboExport(config, sheet){
  if(config.importCsv) {
    console.info('Importing CSV...');
    var startRow = 2; // Skipping the header
    var startColumn = 1; // Starting at first column
    data = importCsvFromGoogleDrive(CSV_ID);
    insertData(sheet, data, startRow, startColumn);   
    console.info('Finished importing CSV...');
  }
}

/**
 * Calls main() in testmode
 */
function testMain() {
  var mode = 'test';
  main(mode);
}