/**
 * Adds a custom menu with items to show the sidebar.
 * @param {Object} e The event parameter for a simple onOpen trigger.
 */
function onOpen(e) {
  //var service = getStravaService();
  var menu = SpreadsheetApp.getUi().createAddonMenu();

  if (0==0) {
    menu.addItem('Send Highlight', 'main');
    menu.addItem('Send Highlight[T]', 'testMain');
    menu.addSeparator();
    menu.addItem('WIP: Import CSV', 'wip');
    menu.addItem('WIP: Change e-mail', 'wip');
    menu.addItem('WIP: Change interval', 'wip');
  } else {
    menu.addItem('Sign in', 'signInStrava');
  }
  menu.addToUi();
}

/**
 * Runs when the add-on is installed; calls onOpen() to ensure menu creation and
 * any other initializion work is done immediately.
 * @param {Object} e The event parameter for a simple onInstall trigger.
 */
function onInstall(e) {
  onOpen(e);
}