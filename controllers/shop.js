const Product = require('../models/product');
const fs = require('fs');
const path = require('path');
const Order = require('../models/order');
const PDFDocument = require('pdfkit');

exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 1
    const offset = (page - 1) * limit

    const {count, rows:products } = await Product.findAndCountAll({
      limit: limit,
      offset: offset
    })
    const totalPages = Math.ceil(count / limit);
    
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',
      currentPage: page,
      totalPages,
    });
    
  } catch (error) {
    
  }
  // Product.findAll()
  //   .then((products) => {
  //     res.render('shop/product-list', {
  //       prods: products,
  //       pageTitle: 'All Products',
  //       path: '/products',
  //     });

  //   }).catch(err => {
  //     console.log(err)
  //   })
};

exports.showProduct = (req, res, next) => {
  const prodId = req.params.product_id
  Product.findOne({ where: { id: prodId } })
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: `Show Product`,
        path: `/products`,
      });

    }).catch(err => {
      console.log(err)
    });
};

exports.getIndex = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 1
    const offset = (page - 1) * limit

    const {count, rows:products } = await Product.findAndCountAll({
      limit: limit,
      offset: offset
    })
    const totalPages = Math.ceil(count / limit);
    
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      currentPage: page,
      totalPages,
    });
    
  } catch (error) {
    
  }
  // Product.findAll()
  //   .then(products => {
  //     res.render('shop/index', {
  //       prods: products,
  //       pageTitle: 'Shop',
  //       path: '/',
  //     });

  //   }).catch(err => {
  //     console.log(err)
  //   });

};

exports.getCart = async (req, res, next) => {
  try {
    let cart = await req.user.getCart()
    let products = [];
    if (cart) {
      products = await cart.getProducts();
    }
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: products,
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
  }

  // Cart.getCart(cart => {
  //   Product.fetchAll(products => {
  //     const cartProducts = [];
  //     for (product of products) {
  //       const cartProductData = cart.products.find(
  //         prod => prod.id === product.id
  //       );
  //       if (cartProductData) {
  //         cartProducts.push({ productData: product, qty: cartProductData.qty });
  //       }
  //     }
  //     res.render('shop/cart', {
  //       path: '/cart',
  //       pageTitle: 'Your Cart',
  //       products: cartProducts
  //     });
  //   });
  // });
};


exports.addCart = async (req, res, next) => {

  try {

    const prodId = req.body.productId

    const product = await Product.findOne({ where: { id: prodId } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await req.user.getCart();
    if (!cart) {
      cart = await req.user.createCart();
    }

    let cartProducts = await cart.getProducts({ where: { id: product.id } });

    let newQty = 1;
    if (cartProducts.length > 0) {
      const existingProduct = cartProducts[0];
      newQty = existingProduct.CartItem.quantity + 1;
    }
    // Add or update product in cart
    await cart.addProduct(product, { through: { quantity: newQty } });

    res.redirect('/cart')

  } catch (error) {

  }

  // Product.findById(prodId, product => {
  //   Cart.addProduct(prodId, product.price)
  // });


  // res.render('shop/cart', {
  //   path: '/cart',
  //   pageTitle: 'Your Cart'
  // });
};

exports.submitOrder = async (req, res, next) => {

  try {

    let cart = await req.user.getCart()
    if (!cart) {
      //no item in cart
    }
    let cartProducts = await cart.getProducts()

    //create an order
    let order = await req.user.createOrder()

    await order.addProducts(cartProducts.map(product => {
      product.OrderItem = { quantity: product.CartItem.quantity }
      return product
    }))
    // for (const product of cartProducts) {

    //   let qtyInCart = product.CartItem.quantity

    //   await order.addProducts(cartProducts, { through: { quantity: qtyInCart } })
    // }

    //clear the cart
    cart.setProducts(null)
    res.redirect('/orders')
  } catch (error) {

  }



}

exports.getOrders = async (req, res, next) => {

  let orders = await req.user.getOrders({ include: Product })

  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders',
    orders: orders,
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',

  });
};

exports.postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  const product = await Product.findByPk(prodId)

  let cart = await req.user.getCart()

  await cart.removeProduct(product)

  res.redirect('/cart');
  // Product.findById(prodId, product => {
  //   Cart.deleteProduct(prodId, product.price);
  //   res.redirect('/cart');
  // });
};


exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId
  const order = await Order.findByPk(orderId)
  if (!order || (req.user.id != order.userId)) {
    return res.redirect(req.get('referer'));
  }
  const invoiceName = `invoice-${orderId}.pdf`
  const invoicePath = path.join('data', 'invoices', invoiceName)

  // Create a document
  const doc = new PDFDocument({font: 'Courier'});
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    'inline; filename="' + invoiceName + '"'
  )
  doc.pipe(fs.createWriteStream(invoicePath));
  doc.pipe(res)

  doc.font('Courier-Bold')
    .fontSize(20)
    .text('Invoice', {
      underline: true
    })
    doc.moveDown();
  doc
    .text('---------------------------------------')
  const products = await order.getProducts()
  let orderTotal = 0
  doc.moveDown();
  const arr = []
  products.forEach(product => {
    orderTotal += product.OrderItem.quantity * product.price
    const info = `${product.title} - ${product.OrderItem.quantity} * $${product.price}`
    // doc.text(info)
    arr.push(info)

  });
  doc.list(arr)
  doc.moveDown();
  doc
    .text('---------------------------------------')
  doc
    .text(`Order total: $${orderTotal}`)
  doc.end();

  //preloading data
  // fs.readFile(invoicePath, (err, data) => {
  //   if(err){
  //     return next(err)
  //   }
  //   res.setHeader('Content-Type', 'application/pdf')
  //   res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName+ '"')
  //   res.send(data)
  // })
  //stream data
  // const file = fs.createReadStream(invoicePath)

  // file.pipe(res)


}