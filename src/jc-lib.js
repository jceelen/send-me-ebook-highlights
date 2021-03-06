/**
 * Sets the global configuration based on the environment
 */
function setEnvConfig(runMode) {
    console.log('var(runMode) is Type: %s, and value is %s', whichType(runMode), runMode);
    if (runMode == undefined) {
        environmentName = 'prod';
        console.info('Running in '+runMode+'-mode, environment is: '+environmentName+'.');
    } else {
        environmentName = runMode;
        console.warn('Running in '+runMode+'-mode, environment is: '+environmentName+'.');
    }
    var config = ENV_SETTINGS[environmentName];
    for (var i in SETTINGS) {
        config[i] = SETTINGS[i];
    }
    console.log({
        'message': 'Loaded configuration settings for environment: ' + environmentName + '.',
        'ENV_CONFIG': config
    });
    return config;
}

/**
 * Returns the sheet defined in the config
 */
function getSheet(config, header) {
    var spreadsheet;
    if(SpreadsheetApp.getActiveSpreadsheet()){    
        spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    } else if(SPREADSHEET_ID) {
            spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    } else {
        console.warn('Spreadsheet id not found, please edit Conf.js.');
        return;
    }
    var sheet = getOrCreateSheet(spreadsheet, config.sheetName);
    removeUnusedSheet(spreadsheet, 'Sheet1');
    removeUnusedSheet(spreadsheet, 'Blad1');
    ensureHeader(config, sheet, header);
    return sheet;
}
/**
 * Gets or creates a sheet in the spreadsheet document with the correct name
 */
function getOrCreateSheet(spreadsheet, sheetName) {
    var sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
        console.warn('Sheet %s does not exists, created new sheet.', sheetName);
        sheet = spreadsheet.insertSheet(sheetName);
    }
    console.log('Returned the sheet: ' + sheetName);
    return sheet;
}

/**
 * Removes a sheet called Sheet1 
 */
function removeUnusedSheet(spreadsheet, sheetname) {
    var sheet = spreadsheet.getSheetByName(sheetname);
    if (sheet && sheet.getLastRow() == 0) spreadsheet.deleteSheet(sheet);
}

/**
 * Checks for a header and create one if not available
 */
function ensureHeader(config, sheet, header) {
    // If there is a header
    if (sheet.getLastRow() > 0) {
        // Get the values from the sheet and the config file
        var headerString = JSON.stringify(header);
        var sheetHeaderString = JSON.stringify(getSheetHeader(sheet)[0]);
        // Compare the header from the sheet with the config
        if (sheetHeaderString != headerString) {
            sheet.clear();
            insertData(sheet, [header], 1, 1);
            console.warn({
                'message': 'Found incorrect header, cleared sheet and updated header.',
                'header': header
            });
        } else {
            console.log('Found correct header in the sheet.');
        }
    } else {
        console.warn('Found no header, added header.');
        sheet.appendRow(header);
    }
}

/**
 * Gets the header from the config file
 */
function getHeader(columns) {
    var header = [];
    for (var i in columns) {
        header.push(columns[i].name);
    }
    console.log({
        'message': 'Returned header from config.',
        'header': header
    });
    return header;
}

/**
 * Sets the frozen rows and columns based on the config file
 */
function freezeRowsColumns(sheet, wantedRows, wantedColumns) {
    var frozenRows = sheet.getFrozenRows();
    var frozenColumns = sheet.getFrozenColumns();
    if (frozenRows != wantedRows) {
        sheet.setFrozenRows(wantedRows);
        console.log('Frozen %s rows in the sheet', wantedRows);
    }
    if (frozenColumns != wantedColumns) {
        sheet.setFrozenColumns(wantedColumns);
        console.log('Frozen %s columns in the sheet', wantedRows);
    }
}

/**
 * Returns the date of the last entry in unixTime.
 */
function retrieveLastDate(sheet, dateCol) {
    var lastRow = sheet.getLastRow();
    console.log('Found the last row in the sheet: ' + lastRow);

    var unixTime = 631152000; // date of 1-1-1990, used if there is no activity available
    if (lastRow > 1) {
        var dateCell = sheet.getRange(lastRow, dateCol);
        //var dateString = dateCell.getValue();
        var dateString = dateCell.getValue();
        console.log('Retrieved the datestring from the lastrow: ' + dateString);
        unixTime = getUnixTime(dateString);
    }
    return unixTime;
}

/**
 * Returns the unixtime from a datestring
 */
function getUnixTime(dateString){
    // Remove miliseconds
    dateString = dateString.split('.')[0];
    // Replace and remove unwanted characters
    var date = new Date((dateString || '').replace(/-/g, '/').replace(/[TZ]/g, ' '));
    var unixTime = date / 1000;
    //console.log('Returned the datestring converted to unixtime: ' + unixTime);
    return unixTime;
}

/**
 * Inserts a two dimentional array into a sheet and triggers markup
 */
function insertData(sheet, data, startRow, startColumn) {
    var numRows = data.length;
    var numColums = data[0].length;
    var range = sheet.getRange(startRow, startColumn, numRows, numColums);
    range.setValues(data);
    console.info('Inserted %s data records into %s', data.length, sheet.getName());
}

/**
 * Updates all markup options from settins
 */
function markupData(config, sheet) {
    if (config.markupdata) {
        console.info('Updating markup...');
        var lastRow = sheet.getLastRow();
        var lastColumn = sheet.getLastColumn();
        var range = sheet.getRange(1, 1, lastRow, lastColumn);
        freezeRowsColumns(sheet, config.frozenRows, config.frozenColumns);
        range.setFontSize(config.fontSize);
        setColumnMarkup(sheet, config.columns, lastRow);
        console.log('Finished updating markup.');
    }
}

/**
 * Updates all per-column-markup options from settings
 */
function setColumnMarkup(sheet, columns, lastRow) {
    var markupLog = [];
    for (var i in columns) {
        var range; 
        var row;
        var column = columns[i].position;
        if (columns[i].align) {
            row = 1; // only the header
            range = sheet.getRange(row, column);
            range.setHorizontalAlignment(columns[i].align);
            logMessage = 'Setting alignment to '+columns[i].align+' for '+columns[i].name+'.';
            markupLog.push(logMessage);
        }
        if (columns[i].numberFormat) {
            row = 2; // skipping the header
            range = sheet.getRange(row, column, lastRow);
            range.setNumberFormat(columns[i].numberFormat);
            logMessage = 'Setting format to '+columns[i].numberFormat+' for '+columns[i].name+'.';
            markupLog.push(logMessage);
        }
        if (columns[i].size) {
            sheet.setColumnWidth(column, columns[i].size);
            logMessage = 'Setting column width to '+columns[i].size+' for '+columns[i].name+'.';
            markupLog.push(logMessage);
        } else {
            sheet.autoResizeColumn(column);
            logMessage = 'Setting column width automatically for '+columns[i].name+'.';
            markupLog.push(logMessage);
        }
        if (columns[i].wrap) {
            row = 2; // skipping the header
            range = sheet.getRange(row, column, lastRow);
            var wrap = columns[i].wrap;
            range.setWrapStrategy(SpreadsheetApp.WrapStrategy[wrap]);
            logMessage = 'Setting wrap to '+columns[i].wrap+' for '+columns[i].name+'.';
            markupLog.push(logMessage);
        }
    }
    console.log({
        'message': 'Updated column markup.',
        'markupLog': markupLog
    });
}

/**
 * Sorts all rows of the sheet based on column 1
 */
function sortData(sheet) {
    var lastRow = sheet.getLastRow();
    var lastColumn = sheet.getLastColumn();
    var range = sheet.getRange(2, 1, lastRow, lastColumn);
    range.sort({
        column: 1,
        ascending: true
    });
}

/**
 * Gets the address of the Lat Long location.
 */
function getLocation( useCache, lat, lng) {
    // Check if location is already cached
    var cache = CacheService.getScriptCache();
    var cached = JSON.parse(cache.get('location-for-lat-' + lat + '-lng-' + lng));
    if (cached != null) {
        console.log({
            'message': 'Found address for ' + lat + ', ' + lng + ' in cache.',
            'cached': cached
        });
        return cached;
    }

    // Get new location if not available in cache and put in cache
    var response = Maps.newGeocoder().reverseGeocode(lat, lng);
    for (var i = 0; i < response.results.length; i++) {
        var result = response.results[i];
        cache.put('location-for-lat-' + lat + '-lng-' + lng, JSON.stringify(result.address_components), 21600);
        console.log({
            'message': 'Retrieved address for ' + lat + ', ' + lng + ' from Google Maps and added it to cache.',
            'adress_components': result.address_components
        });
        return result.address_components;
    }
}

/**
 * Extracts any address component from the result of a google maps call
 */
function extractFromAdress(components, type) {
    for (var i = 0; i < components.length; i++)
        for (var j = 0; j < components[i].types.length; j++)
            if (components[i].types[j] == type) return components[i].long_name;
    return '';
}

/**
 * Returns an 2D array of values from the first row, the header
 */
function getSheetHeader(sheet) {
    var lastColumn = sheet.getLastColumn();
    var sheetHeader = sheet.getRange(1, 1, 1, lastColumn).getValues();
    return sheetHeader;
}

/**
 * Returns an random integer within a range 
 */
function getRandomInteger(min, max) {
    var random = Math.round(Math.random() * (max - min) + min);
    console.log('Returned the random number: %s (within the range of %s and %s)', random, min, max);
    return random;
}

/**
 * Imports csv file, parse it and returns is as an array
 */
function importCsvFromGoogleDrive(csvId) {
    // Get the file
    var file = DriveApp.getFileById(csvId);
    console.log('Got file %s', file.getName());
    
    // Clean the data
    var csv = file.getBlob().getDataAsString();
    console.log({'message': 'Pulled CSV data from file.', 'csv': csv});
    var cleanCsv = csv.replace(/\s+/gm, ' ')
                        .replace(/(highlight|annotation|bookmark)/gm, '\n$&')
                        .replace(/^\s*/gm, '')
                        .replace(/[ \t]+$/gm, '');
    console.log({'message': 'Cleaned CSV data.', 'cleanCsv': cleanCsv});

    // Parse the CSV
    var array = Utilities.parseCsv(cleanCsv);
  
    console.log({
        'message': 'Returned 2D array with CSV data with ' + array.length + ' records.',
        'array': array
    });
    return array;
  }

/**
 * Writes the type of a variable to the log
 */
function whichType(variable) {
    var variableType = typeof variable;
    console.log('The type of the variable: ' + variableType);
    return variableType;
}