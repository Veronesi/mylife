import { MongoClient, ServerApiVersion } from 'mongodb';
import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const uri = process.env.MONGO;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const app = express();
app.use(cors());

app.use(bodyParser.json());

app.use(function (req, res, next) {

  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Content-Security-Policy', "default-src 'self'; connect-src 'self' http://localhost:3000");
  if (req.query.token !== process.env.TOKEN) return res.status(404).send();
  next();
});

app.use(function (req, res, next) {
  const auth = req.get('Autorization');
  if (auth === '123') {
    res.status(404).send();
    return;
  }
  next();
});

const cashflow = async (dateFrom, dateTo) => {
  await client.connect();

  const db = client.db("mylife");
  if (!db) {
    res.send({ message: 'db problem' });
    return;
  }
  try {
    const Sale = db.collection('sale');
    const sales = await Sale.find({
      date: {
        $gte: dateFrom,
        $lte: dateTo
      }
    }).toArray();

    const IncomeMoney = db.collection('incomeMoney');
    const incomeMoney = await IncomeMoney.find({
      date: {
        $gte: dateFrom,
        $lte: dateTo
      }
    }).toArray();

    const groups = {
      serviciosProductos: {
        comida: {
          total: 0,
          products: {}
        },
        sesiones: {
          total: 0,
          products: {}
        },
        transporte: {
          total: 0,
          products: {}
        },
        impuestos: {
          total: 0,
          products: {}
        },
        inversion: {
          total: 0,
          products: {}
        }

      },
      vivienda: {
        alquiler: {
          total: 0,
          products: {}
        },
        internet: {
          total: 0,
          products: {}
        },
        luz: {
          total: 0,
          products: {}
        },
        agua: {
          total: 0,
          products: {}
        }
      },
      salud: {
        farmacia: {
          total: 0,
          products: {}
        }
      },
      entretenimiento: {
        regalos: {
          total: 0,
          products: {}
        },
        ropa: {
          total: 0,
          products: {}
        },
        electrodomestico: {
          total: 0,
          products: {}
        },
        coleccionables: {
          total: 0,
          products: {}
        },
        salidas: {
          total: 0,
          products: {}
        },
        saas: {
          total: 0,
          products: {}
        },
        infusiones: {
          total: 0,
          products: {}
        }
      },
      otros: {
        total: 0,
        products: {}
      },
      SinGrupo: {
        total: 0,
        products: {}
      }
    }

    sales.forEach(sale => {
      sale.products.forEach(product => {
        if (['Rucula', 'Morcilla', 'Papafritas', 'Queso azul', 'Tomate', 'Sal', 'Leche en polvo', 'Perejil', 'Gaseosa', 'Harina', 'Comida', 'Cornalito', 'Coco', 'Osobuco', 'Limon', 'Nuez', 'Agua 500ml', 'Caramelo', 'Papel higenico', 'Chancho', 'Bondiola', 'Fideos', 'Maizena', 'Cacao', 'Barra cereal', 'Leche coco', 'Leche almendras', 'Cereal', 'Crema de leche', 'Ravioles', 'Sardina enlatada', 'Mermelada', 'Chocolate', 'Bife', 'Higado', 'Queso cremoso', 'Aceite de oliva', 'Condimento', 'Patitas merluza', 'Vino blanco', 'Zanahoria', 'Choclo', 'Tomate cherry', 'Patamuslo pollo', 'Berenjena', 'Merluza', 'Costeleta', 'Huevo', 'Acelga', 'Cebolla Verdeo', 'Yogurt', 'Yogur', 'Morron', 'Zapallito', 'Pasta de Mani', 'Atun filete', 'Atun enlatado', 'Galletitas', 'Manzana', 'Naranja', 'Carne Picada', 'Pollo', 'Kiwi', 'Ajo', 'Queso rallado', 'Pan', 'Leche', 'Arroz', 'Pascualina', 'Banana', 'Cebolla', 'Arandanos', 'Manteca', 'Queso', 'Champiñones', 'Jamon'].includes(product.name)) {
          groups.serviciosProductos.comida.total += product.total;
          if (!groups.serviciosProductos.comida.products[product.name]) {
            groups.serviciosProductos.comida.products[product.name] = product.total;
          } else {
            groups.serviciosProductos.comida.products[product.name] += product.total;
          }
        }
        else if (['Clonazepam', 'Mezalasina', 'Eterogermina', 'Mesalazina', 'EVATEST'].includes(product.name)) {
          groups.salud.farmacia.total += product.total;
          if (!groups.salud.farmacia.products[product.name]) {
            groups.salud.farmacia.products[product.name] = product.total;
          } else {
            groups.salud.farmacia.products[product.name] += product.total;
          }
        }
        else if (['Remis', 'Colectivo'].includes(product.name)) {
          groups.serviciosProductos.transporte.total += product.total;
          if (!groups.serviciosProductos.transporte.products[product.name]) {
            groups.serviciosProductos.transporte.products[product.name] = product.total;
          } else {
            groups.serviciosProductos.transporte.products[product.name] += product.total;
          }
        }

        else if (['Contador', 'Nutricionista', 'Psicologo', 'Psiquiatra'].includes(product.name)) {
          groups.serviciosProductos.sesiones.total += product.total;
          if (!groups.serviciosProductos.sesiones.products[product.name]) {
            groups.serviciosProductos.sesiones.products[product.name] = product.total;
          } else {
            groups.serviciosProductos.sesiones.products[product.name] += product.total;
          }
        }

        else if (['Alquiler'].includes(product.name)) {
          groups.vivienda.alquiler.total += product.total;
          if (!groups.vivienda.alquiler.products[product.name]) {
            groups.vivienda.alquiler.products[product.name] = product.total;
          } else {
            groups.vivienda.alquiler.products[product.name] += product.total;
          }
        }

        else if (['Compra en juegos'].includes(product.name)) {
          groups.entretenimiento.saas.total += product.total;
          if (!groups.entretenimiento.saas.products[product.name]) {
            groups.entretenimiento.saas.products[product.name] = product.total;
          } else {
            groups.entretenimiento.saas.products[product.name] += product.total;
          }
        }

        else if (['Internet'].includes(product.name)) {
          groups.vivienda.internet.total += product.total;
          if (!groups.vivienda.internet.products[product.name]) {
            groups.vivienda.internet.products[product.name] = product.total;
          } else {
            groups.vivienda.internet.products[product.name] += product.total;
          }
        }

        else if (['Luz'].includes(product.name)) {
          groups.vivienda.luz.total += product.total;
          if (!groups.vivienda.luz.products[product.name]) {
            groups.vivienda.luz.products[product.name] = product.total;
          } else {
            groups.vivienda.luz.products[product.name] += product.total;
          }
        }

        else if (['Agua'].includes(product.name)) {
          groups.vivienda.agua.total += product.total;
          if (!groups.vivienda.agua.products[product.name]) {
            groups.vivienda.agua.products[product.name] = product.total;
          } else {
            groups.vivienda.agua.products[product.name] += product.total;
          }
        }

        else if (['Electrodomestico', 'FUNDA CELULAR'].includes(product.name)) {
          groups.entretenimiento.electrodomestico.total += product.total;
          if (!groups.entretenimiento.electrodomestico.products[product.name]) {
            groups.entretenimiento.electrodomestico.products[product.name] = product.total;
          } else {
            groups.entretenimiento.electrodomestico.products[product.name] += product.total;
          }
        }

        else if (['Salida', 'Playa'].includes(product.name)) {
          groups.entretenimiento.salidas.total += product.total;
          if (!groups.entretenimiento.salidas.products[product.name]) {
            groups.entretenimiento.salidas.products[product.name] = product.total;
          } else {
            groups.entretenimiento.salidas.products[product.name] += product.total;
          }
        }

        else if (['Regalo'].includes(product.name)) {
          groups.entretenimiento.regalos.total += product.total;
          if (!groups.entretenimiento.regalos.products[product.name]) {
            groups.entretenimiento.regalos.products[product.name] = product.total;
          } else {
            groups.entretenimiento.regalos.products[product.name] += product.total;
          }
        }

        else if (['Ropa'].includes(product.name)) {
          groups.entretenimiento.ropa.total += product.total;
          if (!groups.entretenimiento.ropa.products[product.name]) {
            groups.entretenimiento.ropa.products[product.name] = product.total;
          } else {
            groups.entretenimiento.ropa.products[product.name] += product.total;
          }
        }

        else if (['Impuesto'].includes(product.name)) {
          groups.serviciosProductos.impuestos.total += product.total;
          if (!groups.serviciosProductos.impuestos.products[product.name]) {
            groups.serviciosProductos.impuestos.products[product.name] = product.total;
          } else {
            groups.serviciosProductos.impuestos.products[product.name] += product.total;
          }
        }

        else if (['Acciones'].includes(product.name)) {
          groups.serviciosProductos.inversion.total += product.total;
          if (!groups.serviciosProductos.inversion.products[product.name]) {
            groups.serviciosProductos.inversion.products[product.name] = product.total;
          } else {
            groups.serviciosProductos.inversion.products[product.name] += product.total;
          }
        }

        else if (['Cafe', 'Te'].includes(product.name)) {
          groups.entretenimiento.infusiones.total += product.total;
          if (!groups.entretenimiento.infusiones.products[product.name]) {
            groups.entretenimiento.infusiones.products[product.name] = product.total;
          } else {
            groups.entretenimiento.infusiones.products[product.name] += product.total;
          }
        }

        else if (['Otro', 'Esponja'].includes(product.name)) {
          groups.otros.total += product.total;
          if (!groups.otros.products[product.name]) {
            groups.otros.products[product.name] = product.total;
          } else {
            groups.otros.products[product.name] += product.total;
          }
        }

        // else if (['Nutricionista', 'Agua 500ml', 'contador'].includes(product.name)) {
        //   groups.servicio.total += product.total;
        //   if (!groups.servicio.products[product.name]) {
        //     groups.servicio.products[product.name] = product.total;
        //   } else {
        //     groups.servicio.products[product.name] += product.total;
        //   }
        // }
        // else if (['Te', 'Papel higenico', 'Otro', 'Cafe', 'Caramelo'].includes(product.name)) {
        //   groups.otros.total += product.total;
        //   if (!groups.otros.products[product.name]) {
        //     groups.otros.products[product.name] = product.total;
        //   } else {
        //     groups.otros.products[product.name] += product.total;
        //   }
        // }
        else {
          console.log(product.name, sale._id);
          groups.SinGrupo.total += product.total;
        }
      })
    })
    const valanceMensual = {
      ar: 0,
      usd: 0,
      arAround: 0,
      usdAround: 0,
      onWallet: 0,
    }
    valanceMensual.ar = +incomeMoney.reduce((acc, e) => {
      if (e.amount.ar) {
        return acc + e.amount.ar
      }
      return acc;
    }, 0).toFixed(2);

    valanceMensual.usd = +incomeMoney.reduce((acc, e) => {
      if (!e.amount.ar) {
        return acc + e.amount.usd
      }
      return acc;
    }, 0).toFixed(2);

    valanceMensual.arAround = +(+valanceMensual.ar + valanceMensual.usd * 905).toFixed(2);
    valanceMensual.usdAround = +(Number(valanceMensual.ar) / 905 + Number(valanceMensual.usd)).toFixed(2);

    const total = +sales.reduce((acc, e) => acc + e.total, 0).toFixed(2);
    groups.vivienda.alquiler.total = +groups.vivienda.alquiler.total.toFixed(2);
    groups.vivienda.agua.total = +groups.vivienda.agua.total.toFixed(2);
    groups.vivienda.internet.total = +groups.vivienda.internet.total.toFixed(2);
    groups.vivienda.luz.total = +groups.vivienda.luz.total.toFixed(2);

    groups.serviciosProductos.comida.total = +groups.serviciosProductos.comida.total.toFixed(2);
    groups.serviciosProductos.impuestos.total = +groups.serviciosProductos.impuestos.total.toFixed(2);
    groups.serviciosProductos.inversion.total = +groups.serviciosProductos.inversion.total.toFixed(2);
    groups.serviciosProductos.sesiones.total = +groups.serviciosProductos.sesiones.total.toFixed(2);
    groups.serviciosProductos.transporte.total = +groups.serviciosProductos.transporte.total.toFixed(2);

    groups.entretenimiento.coleccionables.total = +groups.entretenimiento.coleccionables.total.toFixed(2);
    groups.entretenimiento.electrodomestico.total = +groups.entretenimiento.electrodomestico.total.toFixed(2);
    groups.entretenimiento.regalos.total = +groups.entretenimiento.regalos.total.toFixed(2);
    groups.entretenimiento.ropa.total = +groups.entretenimiento.ropa.total.toFixed(2);
    groups.entretenimiento.saas.total = +groups.entretenimiento.saas.total.toFixed(2);
    groups.entretenimiento.salidas.total = +groups.entretenimiento.salidas.total.toFixed(2);
    groups.entretenimiento.infusiones.total = +groups.entretenimiento.infusiones.total.toFixed(2);

    groups.salud.farmacia.total = +groups.salud.farmacia.total.toFixed(2);
    groups.otros.total = +groups.otros.total.toFixed(2);
    groups.SinGrupo.total = +groups.SinGrupo.total.toFixed(2);

    Object.keys(groups.vivienda.alquiler.products).map((k) => {
      groups.vivienda.alquiler.products[k] = +groups.vivienda.alquiler.products[k].toFixed(2);
    });
    Object.keys(groups.vivienda.agua.products).map((k) => {
      groups.vivienda.agua.products[k] = +groups.vivienda.agua.products[k].toFixed(2);
    });
    Object.keys(groups.vivienda.internet.products).map((k) => {
      groups.vivienda.internet.products[k] = +groups.vivienda.internet.products[k].toFixed(2);
    });
    Object.keys(groups.vivienda.luz.products).map((k) => {
      groups.vivienda.luz.products[k] = +groups.vivienda.luz.products[k].toFixed(2);
    });

    Object.keys(groups.serviciosProductos.impuestos.products).map((k) => {
      groups.serviciosProductos.impuestos.products[k] = +groups.serviciosProductos.impuestos.products[k].toFixed(2);
    });
    Object.keys(groups.serviciosProductos.inversion.products).map((k) => {
      groups.serviciosProductos.inversion.products[k] = +groups.serviciosProductos.inversion.products[k].toFixed(2);
    });
    Object.keys(groups.serviciosProductos.sesiones.products).map((k) => {
      groups.serviciosProductos.sesiones.products[k] = +groups.serviciosProductos.sesiones.products[k].toFixed(2);
    });

    Object.keys(groups.serviciosProductos.transporte.products).map((k) => {
      groups.serviciosProductos.transporte.products[k] = +groups.serviciosProductos.transporte.products[k].toFixed(2);
    });

    Object.keys(groups.serviciosProductos.comida.products).map((k) => {
      groups.serviciosProductos.comida.products[k] = +groups.serviciosProductos.comida.products[k].toFixed(2);
    });

    Object.keys(groups.entretenimiento.coleccionables.products).map((k) => {
      groups.entretenimiento.coleccionables.products[k] = +groups.entretenimiento.coleccionables.products[k].toFixed(2);
    });
    Object.keys(groups.entretenimiento.electrodomestico.products).map((k) => {
      groups.entretenimiento.electrodomestico.products[k] = +groups.entretenimiento.electrodomestico.products[k].toFixed(2);
    });
    Object.keys(groups.entretenimiento.regalos.products).map((k) => {
      groups.entretenimiento.regalos.products[k] = +groups.entretenimiento.regalos.products[k].toFixed(2);
    });
    Object.keys(groups.entretenimiento.ropa.products).map((k) => {
      groups.entretenimiento.ropa.products[k] = +groups.entretenimiento.ropa.products[k].toFixed(2);
    });
    Object.keys(groups.entretenimiento.saas.products).map((k) => {
      groups.entretenimiento.saas.products[k] = +groups.entretenimiento.saas.products[k].toFixed(2);
    });
    Object.keys(groups.entretenimiento.salidas.products).map((k) => {
      groups.entretenimiento.salidas.products[k] = +groups.entretenimiento.salidas.products[k].toFixed(2);
    });
    Object.keys(groups.entretenimiento.infusiones.products).map((k) => {
      groups.entretenimiento.infusiones.products[k] = +groups.entretenimiento.infusiones.products[k].toFixed(2);
    });

    Object.keys(groups.salud.farmacia.products).map((k) => {
      groups.salud.farmacia.products[k] = +groups.salud.farmacia.products[k].toFixed(2);
    });


    valanceMensual.onWallet = (+valanceMensual.ar) - (+total);

    return { total, groups, valanceMensual };
  } catch (error) {
    console.log(error);
    return { message: error.message };
  } finally {
    await client.close();
  }
}

app.post('/income-money', async (req, res) => {
  try {
    const { title, date, amount, relativeDate } = req.body;

    await client.connect();
    const db = client.db("mylife");
    if (!db) {
      res.send({ message: 'db problem' });
      return;
    }

    const IncomeMoney = db.collection('incomeMoney');
    const incomeMoney = await IncomeMoney.insertOne({
      title,
      date: new Date(date),
      amount,
      relativeDate
    })
    res.send({ incomeMoney });
    return;
  } catch (error) {
    res.send({ message: error.message });
  }
})

app.get('/cashflow-all', async (req, res) => {
  try {
    // Fecha de inicio (1 de octubre de 2023 a las 00:00:00)
    const startDate = new Date('2020-11-01T00:00:00.000Z');

    // Fecha de finalización (31 de octubre de 2023 a las 23:59:59)
    const endDate = new Date('2030-11-30T23:59:59.999Z');

    const { total, groups, valanceMensual } = await cashflow(startDate, endDate);

    res.send({ total, groups, valanceMensual });
  } catch (error) {
    res.send({ message: error.message });
  } finally {
  }
});

app.get('/v2/cashflow', async (req, res) => {
  try {
    const { from = '2023-11-01', to = '2023-11-30' } = req.query;
    // Fecha de inicio (1 de octubre de 2023 a las 00:00:00)
    const startDate = new Date(`${from}T00:00:00.000Z`);

    // Fecha de finalización (31 de octubre de 2023 a las 23:59:59)
    const endDate = new Date(`${to}T23:59:59.999Z`);

    const { groups } = await cashflow(startDate, endDate);

    res.send({
      comida: groups.serviciosProductos.comida.total,
      sesiones: groups.serviciosProductos.sesiones.total,
      transporte: groups.serviciosProductos.transporte.total,
      impuestos: groups.serviciosProductos.impuestos.total,
      inversion: groups.serviciosProductos.inversion.total,
      alquiler: groups.vivienda.alquiler.total,
      internet: groups.vivienda.internet.total,
      luz: groups.vivienda.luz.total,
      agua: groups.vivienda.agua.total,
      farmacia: groups.salud.farmacia.total,
      regalos: groups.entretenimiento.regalos.total,
      ropa: groups.entretenimiento.ropa.total,
      electrodomestico: groups.entretenimiento.electrodomestico.total,
      coleccionables: groups.entretenimiento.coleccionables.total,
      salidas: groups.entretenimiento.salidas.total,
      saas: groups.entretenimiento.saas.total,
      infusiones: groups.entretenimiento.infusiones.total,
      otros: groups.otros.total,
      SinGrupo: groups.SinGrupo.total,
    });
  } catch (error) {
    res.send({ message: error.message });
  }
});

app.get('/cashflow', async (req, res) => {
  try {
    const { from = '2023-11-01', to = '2023-11-30' } = req.query;
    // Fecha de inicio (1 de octubre de 2023 a las 00:00:00)
    const startDate = new Date(`${from}T00:00:00.000Z`);

    // Fecha de finalización (31 de octubre de 2023 a las 23:59:59)
    const endDate = new Date(`${to}T23:59:59.999Z`);

    const { total, groups, valanceMensual, message } = await cashflow(startDate, endDate);

    res.send({ total, groups, valanceMensual, message });
  } catch (error) {
    res.send({ message: error.message });
  } finally {
  }
})

app.get('/add-title', async (req, res) => {
  const title = '*FORMITAS DE MERLUZA';
  const name = "Patitas merluza";

  await client.connect();
  const db = client.db("mylife");
  if (!db) {
    res.send({ message: 'db problem' });
    return;
  }
  try {
    const ProductTitles = db.collection('productTitles');
    const { titles } = await ProductTitles.findOne();

    titles[title] = name;

    await ProductTitles.updateMany({}, { $set: { titles } });

    res.send({});

  } catch (error) {
    res.send({ message: error.message });
  } finally {
    await client.close();
  }
})

app.post('/add-title', async (req, res) => {
  const { title, name } = req.body;

  await client.connect();
  const db = client.db("mylife");
  if (!db) {
    res.send({ message: 'db problem' });
    return;
  }
  try {
    const ProductTitles = db.collection('productTitles');
    const { titles } = await ProductTitles.findOne();

    titles[title] = name;

    await ProductTitles.updateMany({}, { $set: { titles } });

    res.send({ title, name });

  } catch (error) {
    res.send({ message: error.message });
  } finally {
    await client.close();
  }
})

app.get('/sale', async (req, res) => {
  await client.connect();

  const db = client.db("mylife");
  if (!db) {
    res.send({ message: 'db problem' });
    return;
  }
  try {
    const Sale = db.collection('sale');
    const sales = await Sale.find().toArray();
    res.send({ sales });
  } catch (error) {
    res.send({ message: error.message });
  } finally {
    await client.close();
  }
})

app.post('/sale', async (req, res) => {
  let { products, market, date, text, divided = 1 } = req.body;

  await client.connect();
  const db = client.db("mylife");
  if (!db) {
    res.send({ message: 'db problem' });
    return;
  }
  try {
    if (text && market === "GRANREX") {
      products = RexToProducts(text);
    }

    if (text && market === "MALAMBO") {
      products = MalamboToProduct(text);
    }


    if (divided > 1) {
      products = products.map(e => ({ ...e, total: e.total / divided, amount: e.amount / 2 }))
    }

    const ProductTitles = db.collection('productTitles');
    const { titles } = await ProductTitles.findOne();
    const Sale = db.collection('sale');

    for (let product of products) {
      const name = titles[product.title];
      if (!name) {
        console.log('no se encontro el producto ', product.title);
        res.send({ message: `no se encontro el producto ${product.title}`, product: product.title });
        return;
      } else {
        product.name = name;
      }
    }

    const sale = {
      total: +(products.reduce((acc, e) => acc + e.total, 0).toFixed(2)),
      products,
      date: new Date(date),
      market
    }

    await Sale.insertOne(sale);
    res.send({ sale });
  } catch (error) {
    res.send({ message: error.message });
  } finally {
    await client.close();
  }
})

app.listen(3000, async function () {
  console.log(`server is runing`);
});

function MalamboToProduct(text) {
  const products = text.match(/(\d+\.\d+)\s((?:\D).*)\n/g).map(e => {
    const match = /(\d+\.\d+)\s((?:\D).*)\n/.exec(e);
    return {
      total: 0,
      amount: Number(match[1]),
      standarPrice: 0,
      title: match[2]
    }
  });
  const prices = text.match(/(\d+\.\d+)\n/g).map(e => {
    const match = /(\d+\.\d+)\n/.exec(e);
    return +match[1]
  });

  prices.forEach((e, k) => {
    if (k % 2 === 0) {
      products[k / 2].standarPrice = e;
      return;
    }
    products[(k - 1) / 2].total = e;
  })

  return products;
}

function RexToProducts(text) {
  return text.match(/(\d+,\d+)\s\(\d+\)\sx\s(\d+,\d+)\n(.*)\n/g).map(e => {
    const match = /(\d+,\d+)\s\(\d+\)\sx\s(\d+,\d+)\n(.*)\n/.exec(e);
    return {
      total: +((Number(match[1].replace(',', '.')) * Number(match[2].replace(',', '.'))).toFixed(2)),
      amount: Number(match[1].replace(',', '.')),
      standarPrice: +((Number(match[2].replace(',', '.'))).toFixed(2)),
      title: match[3]
    }
  })
}
