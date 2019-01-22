/**
 * Google Script that sends you daily/weekly/monthly highlights or 
 * clippings from your ebooks by e-mail.
 * 
 * Configuration: update conf.js
 * Call main() with a timer to run the script or test() for testing purposes.
 */
function main(runMode) {
  console.info('Started main().');
  // Get config based on environment
  var ENV_CONFIG = setEnvConfig(runMode);
  // Get the header from the config
  var header = getHeader(ENV_CONFIG.columns);
  // Check status of sheet (header etc)
  var sheet = getSheet(ENV_CONFIG, header);
  // Imports new items from CSV file
  //importKoboExport(ENV_CONFIG, sheet);
  importNewKoboItems(ENV_CONFIG, sheet);
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
  if (config.sendHighlight) {
    console.info('Started routine for sending a highlight...');

    // get the data
    var data = {
      highlights: getHighlights(sheet)
    };

    // generate random number within range of the data
    var randomRow = getRandomInteger(0, data.highlights.length - 1);
    var highlights = data.highlights;
    var randomHighlight = highlights[randomRow];

    // select te row from the data
    console.log({
      'message': 'Returned highlight from random row: ' + randomRow + '.',
      'jsonPayload': randomHighlight
    });
    sendHighlightMail(config, randomHighlight);
  } else {
    console.warn('Skipped sending highlight, was disabled in config.');
  }
}

/**
 * Sends the actual e-mail containing the highlight
 */
function sendHighlightMail(config, highlight) {
  if (config.sendHighlightMail) {
    var date = new Date();
    var emailAddress = HIGHLIGHT_EMAIL;
    var book = highlight[1];
    var author = highlight[2];
    var highlightText = highlight[6];
    var message = '<body style="background:#FFD371; color:#045E68; font-family:Georgia, serif; font-size:16px" alink="#045E68" link="#045E68" bgcolor="#FFD371" text="#045E68">' +
      '<table style="background:#FFD371; color:#045E68; font-family:Georgia, serif; font-size:16px" bgcolor="#FFD371" id="bgtable" align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%"><tr><td>' +
      '<!-- container 600px -->' +
      '<table border="0" cellpadding="25" cellspacing="0" class="container" width="600"><tr><td style="background:#FFD371; color:#045E68; font-family:Georgia, serif; font-size:16px" align="left" valign="top">' +
      '<p ><strong>' + book + '</strong> by ' + author + '</p>' +
      '<p><i>' + highlightText + '</i></p>' +
      '</td></tr></table>' +
      '<!-- container 600px -->' +
      '</td></tr></body>';

    console.log('Message for e-mail prepared: ' + message);

    // Send the actual e-mail if enabled in config.
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
 * Sends annotation the e-mail
 */
function sendAnnotationMail(config, annotation) {
  if (config.sendAnnotationMail) {
    var emailAddress = ANNOTATION_EMAIL;
    var book = annotation[1];
    var author = annotation[2];
    var replace = ANNOTATION_TAG.join('|');
    var regex = new RegExp(replace, "gm");
    var emailSubject = 'Review Kobo annotation: ' + annotation[5].replace(regex, '');
    console.log(emailSubject);
    var highlightText = annotation[6];
    var message = '<p><i>' + highlightText + '</i></p>' +
                  '<p ><strong>' + book + '</strong> by ' + author + '</p>';

    console.log('Message for e-mail prepared: ' + message);

    MailApp.sendEmail({
      to: emailAddress,
      replyTo: 'noreply@jasperceelen.nl',
      subject: emailSubject,
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
      highlights.push(items[i]);
    }
  }
  console.log('Filtered ' + items.length + ' items and found ' + highlights.length + ' highlights.');
  return highlights;
}

/**
 * Parses CSV genereted with export-kobo.py and imports new annotations, highlights and bookmarks
 */
function importNewKoboItems(config, sheet) {
  if (config.importCsv) {
    console.info('Parsing CSV and importing new items...');
    var dateCol = 5;
    var lastItemDate = retrieveLastDate(sheet, dateCol);
    var data = importCsvFromGoogleDrive(CSV_ID);
    var items = [];

    for (var i = 0; i < data.length; i++) {
      var itemDate = getUnixTime(data[i][4]); // Index of Date Modified
      if (itemDate > lastItemDate) {
        console.log({
          'message': 'Found a new item on index ' + i + ' of ' + data.length + ' items.',
          'items': data[i]
        });
        data[i].push(''); // make room for the 'mailed to column'
        items.push(data[i]);

        if (data[i][0] === 'annotation'){
          console.log('Found an annotation, checking if it contains one of the tags');
          var annotationText = data[i][5];
          var tag = ANNOTATION_TAG;
          if (tag.some(function(v) { return annotationText.indexOf(v) >= 0; })) {
            console.log('The annotation was tagged, sending it as e-mail');
            sendAnnotationMail(config, data[i]);
            data[i][7] = ANNOTATION_EMAIL;
          } else {
            console.log('The annotation was NOT tagged, skipping e-mail');
          }
        }
      }
    }

    if (items.length > 0) {
      var lastRow = sheet.getLastRow();
      var startRow = lastRow + 1;
      var startColumn = 1;
      insertData(sheet, items, startRow, startColumn);
    } else {
      console.log('No new items found in data.');
    }
    console.info('Finished importing CSV...');
  }
}


/**
 * Calls main() in prodmode
 */
function mainProd() {
  var runMode = 'prod';
  main(runMode);
}

/**
 * Calls main() in testmode
 */
function mainTest() {
  var runMode = 'test';
  main(runMode);
}

/**
 * Calls main() in importmode
 */
function importProd() {
  var runMode = 'importProd';
  main(runMode);
}

/**
 * Calls main() in importmode
 */
function importTest() {
  var runMode = 'importTest';
  main(runMode);
}