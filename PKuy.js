var PkuyApp = {};
PkuyApp = {
  ver: '1.0',
  author: 'laucape@gmail.com',
  tipos: {}
};

var gapiClientParams = {
  "client_id": "299062314670-1g1rv86a1tcibkurn42ma93oco3ou6ul.apps.googleusercontent.com",
  "project_id": "quickstart-1574510515702",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "redirect_uris": ["http://localhost:8000"],
  "javascript_origins": ["http://localhost:8000"],
  "discoveryDocs": ["https://sheets.googleapis.com/$discovery/rest?version=v4",
    "https://people.googleapis.com/$discovery/rest?version=v1"],
  "scope": "https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/contacts"
}
var SPREADSHEET = '1O8y6zq7qmCtiWmg3Sj4VqTXlO7NQHorNWZjO3oSRlDg';

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

var cli_01 = new Object();

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  console.log('initClient()');
  gapi.client.init(
    // {
    // apiKey: API_KEY,
    // clientId: CLIENT_ID,
    // discoveryDocs: DISCOVERY_DOCS,
    // scope: SCOPES
    //  }
    gapiClientParams
  ).then(function () {
    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  }, function (error) {
    console.log('initClient->error->' + JSON.stringify(error, null, 2));
  }).then(function () {

    // PkuyApp.currentUser.names[0].displayName
    // "Lautaro Capella"
    // PkuyApp.currentUser.emailAddresses[0].value
    // "laucape@gmail.com"
    console.log('Cargando Datos de Usuario');
    loadUserData(function (data) { PkuyApp.currentUser = data });

    // Descarga Recursiva de Contactos
    console.log('Descargando Contactos');
    PkuyApp.contactos = new Array();
    loadContactsToTable('', (data) => { PkuyApp.contactos.push(...data.connections) });

    // Descarga de la BD
    console.log('Descargando PKuyDB')
    loadSheetTableToObj(cl_maestroClientes.sheetName(), (data) => { PkuyApp.maestroClientes = new cl_maestroClientes(data) });
    loadSheetTableToObj(cl_maestroDirecciones.sheetName(), (data) => { PkuyApp.direcciones = new cl_maestroDirecciones(data) });
    loadSheetTableToObj(cl_maestroProductos.sheetName(), (data) => { PkuyApp.maestroProductos = new cl_maestroProductos(data) });
    loadSheetTableToObj(cl_maestroPedidos.sheetName(), (data) => { PkuyApp.maestroPedidos = new cl_maestroPedidos(data) });
    loadSheetTableToObj(cl_maestroAlmacenes.sheetName(), (data) => { PkuyApp.maestroAlmacenes = new cl_maestroAlmacenes(data) });
    loadSheetTableToObj(cl_maestroPtosDespacho.sheetName(), (data) => { PkuyApp.maestroPtosDespacho = new cl_maestroPtosDespacho(data) });
    loadSheetTableToObj(cl_maestroAlmacenes.sheetName(), (data) => { PkuyApp.maestroAlmacenes = new cl_maestroAlmacenes(data) });
    loadSheetTableToObj(cl_maestroMediosPago.sheetName(), (data) => { PkuyApp.tipos.mediosPago = new cl_maestroMediosPago(data) });
    // loadSheetTableToObj(cl_maestroMediosPago.sheetName(), (data) => { PkuyApp.tipo.mediosPago = new cl_maestroMediosPago(data) });
    // loadSheetTableToObj(cl_maestroMediosPago.sheetName(), (data) => { PkuyApp.tipo.mediosPago = new cl_maestroMediosPago(data) });


  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
* @param {string} message Text to be placed in pre element.
  */
function divContentNewP(message) {
  var div = document.getElementById('content');
  var p = document.createElement('p');
  var textContent = document.createTextNode(message);
  p.appendChild(textContent);
  div.appendChild(p);
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
/*
  PKuy_1_0-test
  https://docs.google.com/spreadsheets/d/1O8y6zq7qmCtiWmg3Sj4VqTXlO7NQHorNWZjO3oSRlDg/edit
*/
function loadSheetTableToObj(tableName, callback, startRecord = 1, endRecord = null) {
  var returnTable = new Array();
  var cab;

  if (startRecord < endRecord) return null;

  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET,
    range: tableName + '!A1:ZZ1',
    majorDimension: 'ROWS'
  }).then(function (responseHead) {
    // Puntero a Cabecera
    cab = responseHead.result.values[0];
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET,
      range: tableName + '!A2:ZZ20',
      majorDimension: 'ROWS'
    }).then(function (response) {
      var range = response.result;
      // console.log('dataload sheet:' + tableName);
      // console.debug(range);
      // Si tiene datos
      if (range.values.length > 0) {
        // Recorrer registros
        for (i = 0; i < range.values.length; i++) {
          var row = range.values[i];
          var tempObj = new Object;
          for (j = 0; j < row.length; j++) {
            tempObj[cab[j]] = row[j];
          }
          if (Object.values(tempObj)[0] !== '') {
            returnTable.push(tempObj);
          }
        }
      } else {
        divContentNewP('No data found.');
      }
      callback(returnTable);
    }, function (response) {
      divContentNewP('Error: ' + response.result.error.message);
    });
  }, function (response) {
    divContentNewP('Error: ' + response.result.error.message);
  });
  return returnTable;
}

function loadContactsToTable(nextPage, callback) {
  gapi.client.people.people.connections.list({
    'resourceName': 'people/me',
    'pageSize': 500,
    'pageToken': nextPage,
    'personFields': 'names,emailAddresses,phoneNumbers',
  }).then(function (response) {
    // console.log('people.init().then');
    var nextPage = response.result.nextPageToken;
    var connections = response.result.connections;
    if (connections.length > 0) {
      callback(response.result);
      if (nextPage !== undefined && nextPage != '') {
        // Recursive
        loadContactsToTable(nextPage, callback);
      }
    } else {
      console.log('No connections found.');
    }
  }, function (response) {
    console.log('people.init().error->' + response.result.error.message);
  });
}
function loadUserData(callback) {
  gapi.client.people.people.get({
    resourceName: 'people/me',
    personFields: 'names,emailAddresses',
  }).then(function (response) {
    callback(response.result);
  });
}

function listarContactos(start, end) {
  if (start == undefined) start = 0;
  if (end == undefined || end > PkuyApp.contactos.length) end = PkuyApp.contactos.length;
  let intermediateDiv = document.createElement('div');
  for (let i = start; i < end; i++) {
    if (PkuyApp.contactos[i].names !== undefined && PkuyApp.contactos[i].names[0].displayName !== undefined) {
      console.log(i + '/' + PkuyApp.contactos[i].names[0].displayName);
      let newDiv;
      newDiv = document.createElement('div');
      newDiv.appendChild(document.createTextNode(i + ''));
      newDiv.appendChild(document.createElement('br'));
      newDiv.appendChild(document.createTextNode('' + PkuyApp.contactos[i].names[0].displayName));
      newDiv.setAttribute("class", "contacto")
      if (i % 3)
        newDiv.setAttribute("style", "background-color: darkcyan;")
      else
        newDiv.setAttribute("style", "background-color: coral;")

      intermediateDiv.appendChild(newDiv);
    }
  }

  intermediateDiv.setAttribute("style", "width: max-content;")
  contentDiv = document.getElementById('content');
  contentDiv.appendChild(intermediateDiv);
}
