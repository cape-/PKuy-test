class PKuyObj_base {
  rowRange;
  TS;
  usuario;
  constructor() {
  }
  direccion() {
    return PkuyApp.db.maestroDirecciones.getByID(this.dirID);
  }
}

//*----------------------------------------------------------------------------------PKuy-1.0---*/
//*--------------------------------------CLASES-------------------------------------------------*/
//*--------------------------------------------OBJETOS------------------------------------------*/
//*---------------------------------------------------------------------------------------------*/

/* CLASE CLIENTE */
class cl_cliente extends PKuyObj_base {
  cliID;
  nombre;
  apellido;
  nombreCliente;
  esML;
  dirID;
  ptoDespachoID_default;
  medioPago_default;
  descuento_default;
  grClientes;
  resourceName;
  esModelo;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.key = this.cliID;
  }
  apellidoNombre() {
    return this.apellido + ', ' + this.nombre;
  }
  nombreApellido() {
    return this.nombre + ' ' + this.apellido;
  }
  // pedidos() {
  //   return PkuyApp.maestroPedidos.getByCliID(this.cliID);
  // }
  pedidosCerrados() {
  }
}

/* CLASE PEDIDO */
class cl_pedido extends PKuyObj_base {
  ordID;
  ordPos;
  fechaHoraOrd;
  prodID;
  descripcion;
  cant;
  esML;
  cliID;
  nombreCliente;
  almacenID;
  nombreAlmacen;
  ptoDespachoID;
  nombrePtoDespacho;
  implicaMovimiento;
  borrado;
  pagado;
  cbtePago;
  preparado;
  entregado;
  tiempoRestante;
  prioridad;
  precioTotal;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.key = this.ordID + this.ordPos;
    // if (this.TS <<< Seguir con inicializacion
  }
  agregarProducto(cbtePago) {
    // crear posición
    // 
    // cambiar status
  }

  quitarProducto(cbtePago) {

  }

  confirmarPago(cbtePago) {
    // asociar comprobante
    // cambiar status
  }

  confirmar() {
    // generar entrega
    // reservar stock (generar mov.material)
    // cambiar status
  }
}

/* CLASE STATUS DE PEDIDOS */
class cl_statusPedido extends PKuyObj_base {
  ordID;
  statusTS;
  tipoStatus;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.key = this.ordID + this.statusTS + this.tipoStatus;
  }
}

/* CLASE TIPO DE STATUS DE PEDIDOS */
class cl_tipoStatusPedido extends PKuyObj_base {
  tipoStatus;
  nombreTipoStatus;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.key = this.tipoStatus;
  }
}

/* CLASE ALMACEN*/
class cl_almacen extends PKuyObj_base {
  almacenID;
  nombreAlmacen;
  dirID;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.key = this.almacenID;
  }
}

/* CLASE PUNTO DE DESPACHO */
class cl_ptoDespacho extends PKuyObj_base {
  ptoDespachoID;
  nombrePtoDespacho;
  dirID;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.key = this.ptoDespachoID;
  }
}

/* CLASE MEDIO DE PAGO */
class cl_medioPago extends PKuyObj_base {
  medioPagoID;
  descripcion;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.key = this.medioPagoID;
  }
}

/* CLASE PRODUCTO */
class cl_producto extends PKuyObj_base {
  prodID;
  descripcion;
  origen;
  prodID_modelo;
  esModelo;
  cantPresentacion;
  UM;
  peso;
  mlUrl;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.key = this.prodID;
  }
}

/* CLASE PRECIO PRODUCTO */
class cl_precioProducto extends PKuyObj_base {
  prodID;
  tipoPrecio;
  fechaHora_ini;
  valor;
  moneda;
  precioCalculado;
  fechaHora_fin;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.key = this.prodID + this.tipoPrecio + this.fechaHora_ini;
  }
}

/* CLASE TIPO DE PRECIO */
class cl_tipoPrecio extends PKuyObj_base {
  tipoPrecio;
  nombreTipoPrecio;
  moneda;
  claseTipoPrecio;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.key = this.tipoPrecio;
  }
}

/* CLASE MOVIMIENTO DE MATERIAL */
class cl_movMaterial extends PKuyObj_base {
  movID;
  indicadorEI;
  tipoMov;
  movTS;
  ordID;
  ordPos;
  prodID;
  movID_asociado;
  cant;
  almacenID_e;
  almacenID_i;
  cliID;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.key = this.movID;
  }
}

/* CLASE TIPO DE MOVIMIENTO DE MATERIAL */
class cl_tipoMovMat extends PKuyObj_base {
  tipoMov;
  indicadorEI;
  descripcion;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.key = this.tipoMov;
  }
}

/* CLASE CÁLCULO DE STOCK */
class cl_calculoStock extends PKuyObj_base {
  calcID;
  almacenID;
  prodID;
  calcTS;
  cantTot;
  cantLista;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.key = this.calcID + this.almacenID + this.prodID;
  }
}

/* CLASE DIRECCIÓN */
class cl_direccion {
  dirID;
  dirID_modelo;
  tel;
  email;
  redSocial;
  dirCalle;
  dirNum;
  dirPiso;
  ditDpto;
  dirCP;
  dir;
  localidadBarrio;
  partido;
  provincia;
  TS;
  usuario;

  constructor(dataIn) {
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.key = this.dirID;
  }
  direccionCompleta() {
    var dirComp = this.dirCalle + ' ' + this.dirNum;
    if (this.dirPiso != '')
      dirComp = dirComp + ' Piso ' + this.dirPiso;
    if (this.dirDpto != '')
      dirComp = dirComp + ' Dpto.' + this.dirDpto;
    if (this.dirCP != '')
      dirComp = dirComp + ' (' + this.dirCP + ')';
    if (this.localidadBarrio != '')
      dirComp = dirComp + ', ' + this.localidadBarrio;
    if (this.partido != '')
      dirComp = dirComp + ', ' + this.partido;
    if (this.provincia != '')
      dirComp = dirComp + ', ' + this.provincia;
    return dirComp;
  }
  direccionCorta() {
    var dirComp = this.dirCalle + ' ' + this.dirNum;
    if (this.dirPiso != '')
      dirComp = dirComp + ' ' + this.dirPiso;
    if (this.dirDpto != '')
      dirComp = dirComp + ' ' + this.dirDpto;
    if (this.localidadBarrio != '')
      dirComp = dirComp + ', ' + this.localidadBarrio;
    else if (this.partido != '')
      dirComp = dirComp + ', ' + this.partido;
    else if (this.provincia != '')
      dirComp = dirComp + ', ' + this.provincia;
    return dirComp;
  }
}
//*----------------------------------------------------------------------------------PKuy-1.0---*/
//*--------------------------------------CLASES-------------------------------------------------*/
//*--------------------------------------------MAESTROS-----------------------------------------*/
//*---------------------------------------------------------------------------------------------*/

/* CLASE MAESTRO DE CLIENTES */
class cl_maestroClientes {
  static sheetName() { return 'cli_01' }

  constructor(tableData) {
    this.recordSet = new Array();
    var cliente_data;
    for (cliente_data in tableData) {
      this.add(new cl_cliente(tableData[cliente_data]));
    }
  }
  add(cliente) {
    if ((cliente.cliID === undefined) || (cliente.cliID === ''))
      throw "Error: Cliente: falta cliID";
    this.recordSet.push(cliente);
  }

  getModelos() {
    return this.recordSet.filter(cliente => cliente.esModelo);
  }

  getClientes() {
    return this.recordSet.filter(cliente => !cliente.esModelo);
  }

  getByApellido(queryApellido) {
    return this.recordSet.find((cliente) => cliente.apellido.toLowerCase() == queryApellido.toLowerCase());
  }
}

/* CLASE MAESTRO DE PEDIDOS */
class cl_maestroPedidos {
  static sheetName() { return 'ord_01' };
  constructor(tableData) {
    this.recordSet = new Array();
    var pedido_data;
    for (pedido_data in tableData) {
      this.recordSet.push(new cl_pedido(tableData[pedido_data]));
    }
  }
  getByID(queryOrdID) {
    return this.recordSet.filter((pedido) => pedido.ordID == queryOrdID);
  }
  getByCliID(queryCliID) {
    return this.recordSet.filter((pedido) => pedido.cliID == queryCliID);
  }
  getByProdID(queryProdID) {
    return this.recordSet.filter((pedido) => pedido.prodID == queryProdID);
  }
  getAll(){
    return this.recordSet;
  }
}

/* CLASE MAESTRO DE STATUS DE PEDIDOS */
class cl_statusPedidos {
  static sheetName() { return 'ord_status' };
  constructor(tableData) {
    this.recordSet = new Array();
    var statusPedido_data;
    for (statusPedido_data in tableData) {
      this.recordSet.push(new cl_statusPedido(tableData[statusPedido_data]));
    }
  }
  getAll(){
    return this.recordSet;
  }
}

/* CLASE TIPO DE STATUS DE PEDIDOS */
class cl_tiposStatusPedido {
  static sheetName() { return 'status_tipo' };
  constructor(tableData) {
    this.recordSet = new Array();
    var tipoStatusPedido_data;
    for (tipoStatusPedido_data in tableData) {
      this.recordSet.push(new cl_tipoStatusPedido(tableData[tipoStatusPedido_data]));
    }
  }
  getAll(){
    return this.recordSet;
  }
}

/* CLASE MAESTRO DE ALMACENES */
class cl_maestroAlmacenes {
  static sheetName() { return 'almacen_01' };
  constructor(tableData) {
    this.recordSet = new Array();
    var almacen_data;
    for (almacen_data in tableData) {
      this.recordSet.push(new cl_almacen(tableData[almacen_data]));
    }
  }
  getAll(){
    return this.recordSet;
  }
}

/* CLASE MAESTRO DE PUNTOS DE DESPACHO */
class cl_maestroPtosDespacho {
  static sheetName() { return 'ptoDespacho_01' };
  constructor(tableData) {
    this.recordSet = new Array();
    var ptoDespacho_data;
    for (ptoDespacho_data in tableData) {
      this.recordSet.push(new cl_ptoDespacho(tableData[ptoDespacho_data]));
    }
  }
  getAll(){
    return this.recordSet;
  }
}

/* CLASE MAESTRO DE MEDIOS DE PAGO */
class cl_maestroMediosPago {
  static sheetName() { return 'medioPago_01' };
  constructor(tableData) {
    this.recordSet = new Array();
    var medioPago_data;
    for (medioPago_data in tableData) {
      this.recordSet.push(new cl_medioPago(tableData[medioPago_data]));
    }
  }
  getAll(){
    return this.recordSet;
  }
}

/* CLASE MAESTRO DE PRODUCTOS */
class cl_maestroProductos {
  static sheetName() { return 'prod_01' };
  constructor(tableData) {
    this.recordSet = new Array();
    var producto_data;
    for (producto_data in tableData) {
      this.recordSet.push(new cl_producto(tableData[producto_data]));
    }
  }
  getByProdID(prodID) {
  }
  getAll(){
    return this.recordSet;
  }
}

/* CLASE MAESTRO DE PRECIOS */
class cl_maestroPrecios {
  static sheetName() { return 'prod_precios' };
  constructor(tableData) {
    this.recordSet = new Array();
    var productoPrecio_data;
    for (productoPrecio_data in tableData) {
      this.recordSet.push(new cl_precioProducto(tableData[productoPrecio_data]));
    }
  }
  getAll(){
    return this.recordSet;
  }
}

/* CLASE TIPOS DE PRECIO */
class cl_tiposPrecios {
  static sheetName() { return 'tipo_precio' };
  constructor(tableData) {
    this.recordSet = new Array();
    var tipoPrecio_data;
    for (tipoPrecio_data in tableData) {
      this.recordSet.push(new cl_tipoPrecio(tableData[tipoPrecio_data]));
    }
  }
  getAll(){
    return this.recordSet;
  }
}

/* CLASE MAESTRO DE MOVIMIENTOS DE MATERIAL */
class cl_maestroMovimientos {
  static sheetName() { return 'mov_01' };
  constructor(tableData) {
    this.recordSet = new Array();
    var movimientos_data;
    for (movimientos_data in tableData) {
      this.recordSet.push(new cl_movMaterial(tableData[movimientos_data]));
    }
  }
  getAll(){
    return this.recordSet;
  }
}

/* CLASE TIPOS DE MOVIMIENTO DE MATERIAL */
class cl_tiposMovimiento {
  static sheetName() { return 'movimientos_tipo' };
  constructor(tableData) {
    this.recordSet = new Array();
    var tiposMovimiento_data;
    for (tiposMovimiento_data in tableData) {
      this.recordSet.push(new cl_tipoMovMat(tableData[tiposMovimiento_data]));
    }
  }
  getAll(){
    return this.recordSet;
  }
}

/* CLASE MAESTRO DE CALCULOS DE STOCK */
class cl_maestroCalculosStock {
  static sheetName() { return 'calculos_stock' };
  constructor(tableData) {
    this.recordSet = new Array();
    var calculosStock_data;
    for (calculosStock_data in tableData) {
      this.recordSet.push(new cl_calculoStock(tableData[calculosStock_data]));
    }
  }
  getAll(){
    return this.recordSet;
  }
}

/* CLASE MAESTRO DE DIRECCIONES */
class cl_maestroDirecciones {
  static sheetName() { return 'dir_01' };
  constructor(tableData) {
    this.recordSet = new Array();
    var direccion_data;
    for (direccion_data in tableData) {
      this.add(new cl_direccion(tableData[direccion_data]));
    }
  }
  getAll(){
    return this.recordSet;
  }
  getByID(queryDirID) {
    return this.recordSet.find(direccion => direccion.dirID == queryDirID);
  }
  add(direccion) {
    if ((direccion.dirID === undefined) || (direccion.dirID === ''))
      throw "Error: Direccion: falta dirID";
    this.recordSet.push(direccion);
  }
}
// gr.Clientes
// unidades de medida
// cotizacion
// contabilizacion
// balance
