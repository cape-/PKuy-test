class PKuyObj_base {
  rowRange;
  TS;
  usuario;
  borrado;
  constructor(dataIn) {
    var attrib;
    for (attrib in dataIn) {
      if (dataIn[attrib] === 'TRUE')
        dataIn[attrib] = true;
      else if (dataIn[attrib] === 'FALSE')
        dataIn[attrib] = false;
    }
  }
  direccion() {
    return PkuyApp.db.maestroDirecciones.getByID(this.dirID);
  }
}

//*----------------------------------------------------------------------------------PKuy-1.0---*/
//*--------------------------------------CLASES-------------------------------------------------*/
//*--------------------------------------------OBJETOS------------------------------------------*/
//*---------------------------------------------------------------------------------------------*/

/* 01 CLASE CLIENTE */
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
    this.keys = () => [this.cliID];
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

/* 02 CLASE PEDIDO */
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
    this.keys = () => [this.ordID, this.ordPos];
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

/* 03 CLASE STATUS DE PEDIDOS */
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
    this.keys = () => [this.ordID, this.statusTS, this.tipoStatus];
  }
}

/* 04 CLASE TIPO DE STATUS DE PEDIDOS */
class cl_tipoStatusPedido extends PKuyObj_base {
  tipoStatus;
  nombreTipoStatus;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.keys = () => [this.tipoStatus];
  }
}

/* 05 CLASE ALMACEN*/
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
    this.keys = () => [this.almacenID];
  }
}

/* 06 CLASE PUNTO DE DESPACHO */
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
    this.keys = () => [this.ptoDespachoID];
  }
}

/* 07 CLASE MEDIO DE PAGO */
class cl_medioPago extends PKuyObj_base {
  medioPagoID;
  descripcion;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.keys = () => [this.medioPagoID];
  }
}

/* 08 CLASE PRODUCTO */
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
  files;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.keys = () => [this.prodID];
  }
}

/* 09 CLASE PRECIO PRODUCTO */
class cl_precioProducto extends PKuyObj_base {
  prodID;
  tipoPrecio;
  inicioTS;
  finTS;
  valor;
  precioCalculado;
  moneda;
  cotizacionMoneda;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.keys = () => [this.prodID, this.tipoPrecio, this.inicioTS];
  }
}

/* 10 CLASE TIPO DE PRECIO */
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
    this.keys = () => [this.tipoPrecio];
  }
}

/* 11 CLASE MOVIMIENTO DE MATERIAL */
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
    this.keys = () => [this.movID];
  }
}

/* 12 CLASE TIPO DE MOVIMIENTO DE MATERIAL */
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
    this.keys = () => [this.tipoMov];
  }
}

/* 13 CLASE CÁLCULO DE STOCK */
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
    this.keys = () => [this.calcID, this.almacenID, this.prodID];
  }
}

/* 14 CLASE DIRECCIÓN */
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
    this.keys = () => [this.dirID];
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

/* 15 CLASE COTIZACIÓN DE MONEDA */
class cl_cotizacion extends PKuyObj_base {
  cotizacionTS;
  monedaDe;
  monedaA;
  factor;
  constructor(dataIn) {

    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.keys = () => [this.cotizacionTS, this.monedaDe, this.monedaA];
  }
}

/* 16 CLASE UNIDAD DE MEDIDA */
class cl_unidadMedida extends PKuyObj_base {
  unidadMedida;
  umCorto;
  umSingular;
  umPlural;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.keys = () => [this.unidadMedida];
  }
}

/* 17 CLASE TERMINAL */
class cl_terminal extends PKuyObj_base {
  terminalID;
  descripcion;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.keys = () => [this.terminalID];
  }

}

/* CLASE UPDATELOG */
class cl_updateLog extends PKuyObj_base {
  updTS;
  terminalID;
  updRowRange;

  constructor(dataIn) {
    super(dataIn);
    var attrib;
    for (attrib in dataIn) {
      this[attrib] = dataIn[attrib];
    }
    this.keys = () => [this.updTS, this.terminalID, this.updRowRange];
  }

}


//*----------------------------------------------------------------------------------PKuy-1.0---*/
//*--------------------------------------CLASES-------------------------------------------------*/
//*--------------------------------------------MAESTROS-----------------------------------------*/
//*---------------------------------------------------------------------------------------------*/

class cl_maestro_base {
  recordSet;

  constructor() {
  }

  /** Devuelve todos los elementos */
  getAll() {
    return this.recordSet;
  }

  /** Devuelve el último elemento de acuerdo al TS */
  getLatest() {
    return this.recordSet
      .sort((a, b) => b.TS - a.TS)[0]; // Primer elemento del array ordenado inverso por TS
  }

  /** Verificar Objeto: completitud de Clave */
  verifyKey(obj) {
    var keyFields = obj.keys() || [];
    for (let i = 0; i < keyFields.length; i++) {
      const field = keyFields[i];
      if (!field)
        throw new Error(".add: faltan campos clave");
    }
  }

  /** Verificar y Agregar */
  add(obj) {
    this.verifyKey(obj);
    // TODO Verificar Unicidad Key
    this.recordSet.push(obj);
  }
}

/* CLASE MAESTRO DE CLIENTES */
class cl_maestroClientes extends cl_maestro_base {
  static sheetName() { return 'cli_01' }

  constructor(tableData) {
    super(tableData);
    this.recordSet = [];
    var cliente_data;
    for (cliente_data in tableData) {
      this.add(new cl_cliente(tableData[cliente_data]));
    }
  }
  // add(cliente) {
  //   if ((cliente.cliID === undefined) || (cliente.cliID === ''))
  //     throw "Error: Cliente: falta cliID";
  //   this.recordSet.push(cliente);
  // }
  getAll() {
    return this.recordSet.filter((p) => !p.borrado);
  }
  getModelos() {
    return this.getAll().filter((cliente) => cliente.esModelo);
  }
  getClientes() {
    return this.getAll().filter((cliente) => !cliente.esModelo);
  }
  getByApellido(queryApellido) {
    return this.getAll().find((cliente) => cliente.apellido.toLowerCase() == queryApellido.toLowerCase());
  }
}

/* CLASE MAESTRO DE PEDIDOS */
class cl_maestroPedidos extends cl_maestro_base {
  static sheetName() { return 'ord_01' };
  constructor(tableData) {
    super(tableData);
    this.recordSet = [];
    var pedido_data;
    for (pedido_data in tableData) {
      this.add(new cl_pedido(tableData[pedido_data]));
    }
  }
  getAll() {
    return this.recordSet.filter((p) => !p.borrado);
  }
  getByID(queryOrdID) {
    return this.getAll().filter((pedido) => pedido.ordID === queryOrdID);
  }
  getByCliID(queryCliID) {
    return this.getAll().filter((pedido) => pedido.cliID === queryCliID);
  }
  getByProdID(queryProdID) {
    return this.getAll().filter((pedido) => pedido.prodID === queryProdID);
  }
}

/* CLASE MAESTRO DE STATUS DE PEDIDOS */
class cl_statusPedidos extends cl_maestro_base {
  static sheetName() { return 'ord_status' };
  constructor(tableData) {
    super(tableData);
    this.recordSet = [];
    var statusPedido_data;
    for (statusPedido_data in tableData) {
      this.add(new cl_statusPedido(tableData[statusPedido_data]));
    }
  }
}

/* CLASE TIPO DE STATUS DE PEDIDOS */
class cl_tiposStatusPedido extends cl_maestro_base {
  static sheetName() { return 'status_tipo' };
  constructor(tableData) {
    super(tableData);
    this.recordSet = [];
    var tipoStatusPedido_data;
    for (tipoStatusPedido_data in tableData) {
      this.add(new cl_tipoStatusPedido(tableData[tipoStatusPedido_data]));
    }
  }
}

/* CLASE MAESTRO DE ALMACENES */
class cl_maestroAlmacenes extends cl_maestro_base {
  static sheetName() { return 'almacen_01' };
  constructor(tableData) {
    super(tableData);
    this.recordSet = [];
    var almacen_data;
    for (almacen_data in tableData) {
      this.add(new cl_almacen(tableData[almacen_data]));
    }
  }
}

/* CLASE MAESTRO DE PUNTOS DE DESPACHO */
class cl_maestroPtosDespacho extends cl_maestro_base {
  static sheetName() { return 'ptoDespacho_01' };
  constructor(tableData) {
    super(tableData);
    this.recordSet = [];
    var ptoDespacho_data;
    for (ptoDespacho_data in tableData) {
      this.add(new cl_ptoDespacho(tableData[ptoDespacho_data]));
    }
  }
}

/* CLASE MAESTRO DE MEDIOS DE PAGO */
class cl_maestroMediosPago extends cl_maestro_base {
  static sheetName() { return 'medioPago_01' };
  constructor(tableData) {
    super(tableData);
    this.recordSet = [];
    var medioPago_data;
    for (medioPago_data in tableData) {
      this.add(new cl_medioPago(tableData[medioPago_data]));
    }
  }
}

/* CLASE MAESTRO DE PRODUCTOS */
class cl_maestroProductos extends cl_maestro_base {
  static sheetName() { return 'prod_01' };
  constructor(tableData) {
    super(tableData);
    this.recordSet = [];
    var producto_data;
    for (producto_data in tableData) {
      this.add(new cl_producto(tableData[producto_data]));
    }
  }
  getAll() {
    return this.recordSet.filter((p) => !p.borrado);
  }
  getByProdID(prodID) {
    return this.getAll().find((p) => p.prodID === prodID);
  }
  getProdsModelo() {
    return this.getAll().filter((p) => p.esModelo);
  }
  getProdsPorOrigen(origen) {
    return this.getAll().filter((p) => p.origen === origen);
  }
  getOrigenesProductos() {
    return this.getAll().reduce(function (accum, curr, i, arr) {
      if (i === 1)
        accum = (accum.origen) ? [accum.origen] : [];
      if (curr.origen && (accum.findIndex((o) => o === curr.origen) === -1))
        accum.push(curr.origen);

      return accum;
    });
  }
  getPresentacionesProd(prodID = '0') {
    return this.getAll().filter((p) => p.prodID_modelo === prodID);
  }
}

/* CLASE MAESTRO DE PRECIOS */
class cl_maestroPrecios extends cl_maestro_base {
  static sheetName() { return 'prod_precios' };
  constructor(tableData) {
    super(tableData);
    this.recordSet = [];
    var productoPrecio_data;
    for (productoPrecio_data in tableData) {
      this.add(new cl_precioProducto(tableData[productoPrecio_data]));
    }
  }
}

/* CLASE TIPOS DE PRECIO */
class cl_tiposPrecios extends cl_maestro_base {
  static sheetName() { return 'tipo_precio' };
  constructor(tableData) {
    super(tableData);
    this.recordSet = [];
    var tipoPrecio_data;
    for (tipoPrecio_data in tableData) {
      this.add(new cl_tipoPrecio(tableData[tipoPrecio_data]));
    }
  }
}

/* CLASE MAESTRO DE MOVIMIENTOS DE MATERIAL */
class cl_maestroMovimientos extends cl_maestro_base {
  static sheetName() { return 'mov_01' };
  constructor(tableData) {
    super(tableData);
    this.recordSet = [];
    var movimientos_data;
    for (movimientos_data in tableData) {
      this.add(new cl_movMaterial(tableData[movimientos_data]));
    }
  }
}

/* CLASE TIPOS DE MOVIMIENTO DE MATERIAL */
class cl_tiposMovimiento extends cl_maestro_base {
  static sheetName() { return 'movimientos_tipo' };
  constructor(tableData) {
    super(tableData);
    this.recordSet = [];
    var tiposMovimiento_data;
    for (tiposMovimiento_data in tableData) {
      this.add(new cl_tipoMovMat(tableData[tiposMovimiento_data]));
    }
  }
}

/* CLASE MAESTRO DE CALCULOS DE STOCK */
class cl_maestroCalculosStock extends cl_maestro_base {
  static sheetName() { return 'calculos_stock' };
  constructor(tableData) {
    super(tableData);
    this.recordSet = [];
    var calculosStock_data;
    for (calculosStock_data in tableData) {
      this.add(new cl_calculoStock(tableData[calculosStock_data]));
    }
  }
}

/* CLASE MAESTRO DE DIRECCIONES */
class cl_maestroDirecciones extends cl_maestro_base {
  static sheetName() { return 'dir_01' };
  constructor(tableData) {
    super(tableData);
    this.recordSet = [];
    var direccion_data;
    for (direccion_data in tableData) {
      this.add(new cl_direccion(tableData[direccion_data]));
    }
  }
  getByID(queryDirID) {
    return this.getAll().find(direccion => direccion.dirID === queryDirID);
  }
  // add(direccion) {
  //   if ((direccion.dirID === undefined) || (direccion.dirID === ''))
  //     throw "Error: Direccion: falta dirID";
  //   this.recordSet.push(direccion);
  // }
}

/* CLASE COTIZACIÓNES */
class cl_maestroCotizaciones extends cl_maestro_base {
  static sheetName() { return 'cotizaciones_01' };
  constructor(tableData) {
    super(tableData);
    this.recordSet = [];
    var cotizaciones_data;
    for (cotizaciones_data in tableData) {
      this.add(new cl_cotizacion(tableData[cotizaciones_data]));
    }
  }
  getLast(monedaDe, monedaA) {
    return this.recordSet
      .filter((cotizacion) => ((cotizacion.monedaDe === monedaDe) && cotizacion.monedaA === monedaA))
      .sort((a, b) => b.cotizacionTS - a.cotizacionTS)[0]; // Primer elemento del array ordenado inverso por cotizacionTS
  }
  // add(cotizacion) {
  //   if (!cotizacion.cotizacionTS || !cotizacion.monedaDe || !cliente.monedaA 7))
  //   throw new Error("Cotización .add: falta clave");
  //   this.add(cotizacion);
  // }

}

/* CLASE UNIDADES DE MEDIDA */
class cl_unidadesMedida extends cl_maestro_base {
  static sheetName() { return 'unidadesMedida_01' };
  constructor(tableData) {
    super(tableData);
    this.recordSet = [];
    var unidadesMedida_data;
    for (unidadesMedida_data in tableData) {
      this.add(new cl_unidadMedida(tableData[unidadesMedida_data]));
    }
  }
}

/* CLASE MAESTRO DE TERMINALES */
class cl_maestroTerminales extends cl_maestro_base {
  static sheetName() { return 'terminal_01' }

  constructor(tableData) {
    super(tableData);
    this.recordSet = [];
    var terminal_data;
    for (terminal_data in tableData) {
      this.add(new cl_terminal(tableData[terminal_data]));
    }
  }
}


// gr.Clientes
// contabilizacion
// balance
