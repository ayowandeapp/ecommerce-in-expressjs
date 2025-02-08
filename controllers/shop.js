const Product = require('../models/product');
const Cart = require('../models/cart');
const CartItem = require('../models/cart-item');
const { where } = require('sequelize');

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });

    }).catch(err => {
      console.log(err)
    })
};

exports.showProduct = (req, res, next) => {
  const prodId = req.params.product_id
  Product.findOne({ where: { id: prodId } })
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: `Show Product`,
        path: `/products`
      });

    }).catch(err => {
      console.log(err)
    });
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
      // console.log(products, 'res');
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });

    }).catch(err => {
      console.log(err)
    });

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
      products: products
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

    await order.addProducts(cartProducts.map(product =>{
      product.OrderItem = {quantity : product.CartItem.quantity}
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

  let orders = await req.user.getOrders({include: Product})

  // console.log(orders, 'orders');
  
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders',
    orders: orders
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
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
