// Configure different environments
var ENV_SETTINGS = {
  test: {
    envName: 'test',
    sheetName: 'Highlights[T]',
    frozenRows: 0,
    frozenColumns: 0,
    sendEmail: true,
    markupdata : true
  },
  prod: {
    envName: 'prod',
    sheetName: 'Highlights',
    frozenRows: 0,
    frozenColumns: 0,
    sendEmail: true,
    markupdata : true
  }
};

var SETTINGS = {
    fontSize: 9,
    rowHeight : 21,
    frozenRows: 0,
    frozenColumns: 0,
    columns: {
      1: {
        position: 1,
        name: 'Type',
        align: 'left'
      },
      2: {
        position: 2,
        name: 'Book',
        align: 'left',
      },
      3: {
        position: 3,
        name: 'Author',
        align: 'left'
      },
      4: {
        position: 4,
        name: 'Date&Time 1',
        align: 'left',
      },
      5: {
        position: 5,
        name: 'Date&Time 2',
        align: 'left',
      },
      6: {
        position: 6,
        name: '',
        align: 'left',
      },
      7: {
        position: 7,
        name: 'Highlighted text',
        align: 'left',
        size: 100,
        wrap: 'CLIP'
      },
    }
  };
  
  