// Configure different environments
var ENV_SETTINGS = {
  test: {
    envName: 'test',
    sheetName: 'Highlights[T]',
    sendHighlight: false,
    sendHighlightMail: false,
    sendAnnotationMail: true,
    importCsv: true,
    markupdata: true
  },
  prod: {
    envName: 'prod',
    sheetName: 'Highlights',
    sendHighlight: true,
    sendHighlightMail: true,
    sendAnnotationMail: true,
    importCsv: true,
    markupdata: true
  }
};

var SETTINGS = {
  fontSize: 9,
  rowHeight: 21,
  frozenRows: 1,
  frozenColumns: 1,
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
      name: 'Date created',
      align: 'left',
    },
    5: {
      position: 5,
      name: 'Date modified',
      align: 'left',
    },
    6: {
      position: 6,
      name: 'Annotation',
      align: 'left',
      size: 100,
      wrap: 'CLIP'
    },
    7: {
      position: 7,
      name: 'Highlighted text',
      align: 'left',
      size: 100,
      wrap: 'CLIP'
    },
    8: {
      position: 7,
      name: 'Annotation send to',
      align: 'left',
    },
  }
};