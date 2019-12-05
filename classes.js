class PKuyObj_base {
  constructor() {
  }
  direccion() {
    return PkuyApp.direcciones.getByID(this.dirID);
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
  TS;
  usuario;

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
  pedidos() {
    return PkuyApp.maestroPedidos.getByCliID(this.cliID);
  }
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
  preparado;
  entregado;
  tiempoRestante;
  prioridad;
  precioTotal;
  TS;
  usuario;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.key = this.ordID + this.ordPos;
  }
}


/* CLASE ALMACEN*/
class cl_almacen extends PKuyObj_base {
  almacenID;
  nombreAlmacen;
  dirID;
  TS;
  usuario;

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
  TS;
  usuario;

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
  medioPago;
  descripcion;
  TS;
  usuario;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.key = this.medioPago;
  }
}

/* CLASE PRODUCTO */
class cl_producto extends PKuyObj_base {
  prodID;
  descripcion;
  prodID_modelo;
  esModelo;
  cantPresentación;
  UM;
  peso;
  mlUrl;
  TS;
  usuario;

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
  monto;
  moneda;
  fechaHora_fin;
  TS;
  usuario;

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
  TS;
  usuario;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.key = this.tipoPrecio;
  }
}

/* CLASE STATUS DE PEDIDOS */
class cl_statusPedido extends PKuyObj_base {
  ordID;
  statusTS;
  tipoStatus;
  TS;
  usuario;

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
class cl_tipoStatusPed extends PKuyObj_base {
  tipoStatus;
  nombreTipoStatus;
  TS;
  usuario;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.key = this.tipoStatus;
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
  TS;
  usuario;

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
  descripcion;
  TS;
  usuario;

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
  mail;
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
  static sheetName() { return 'cli_01' };
  constructor(tableData) {
    this.recordSet = new Array();
    var cliente_data;
    for (cliente_data in tableData) {
      this.recordSet.push(new cl_cliente(tableData[cliente_data]));
    }
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
  getByID(ordID) {

  }
  getByCliID(queryCliID) {
    return this.recordSet.filter((pedido) => pedido.cliID == queryCliID);
  }
  getByProdID(queryProdID) {
    return this.recordSet.filter((pedido) => pedido.prodID == queryProdID);
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
}

/* CLASE MAESTRO DE MEDIOS DE PAGO */
class cl_maestroMediosPago {
  static sheetName() { return 'medioPago_01' };
  constructor(tableData) {
    this.recordSet = new Array();
    var medioPago_data;
    for (medioPago_data in tableData) {
      this.recordSet.push(new cl_ptoDespacho(tableData[medioPago_data]));
    }
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
    return (this.recordSet[prodID - 1].prodID == prodID) ? this.recordSet[prodID - 1] : null;
  }
}

/* CLASE MAESTRO DE DIRECCIONES */
class cl_maestroDirecciones {
  static sheetName() { return 'dir_01' };
  constructor(tableData) {
    this.recordSet = new Array();
    var direccion_data;
    for (direccion_data in tableData) {
      this.recordSet.push(new cl_direccion(tableData[direccion_data]));
    }
  }
  getByID(dirID) {
    return (this.recordSet[dirID - 1].dirID == dirID) ? this.recordSet[dirID - 1] : null;
  }
}

