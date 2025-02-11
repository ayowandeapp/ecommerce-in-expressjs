const { where } = require('sequelize');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  
  let message = req.flash('error')
  message = message.length > 0 ? message.join('\n') : null;
  
  const oldInput = req.session.oldInput || {}
  req.session.oldInput = null

  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    oldInput: oldInput,
    errorMsg: message,
    product: {},

  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  // const userId = req.user.id
  // const product = new Product(null, title, imageUrl, description, price);
  // product.save()
  req.user.createProduct({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description
  }).then((res) => {
    console.log('created product')

  }).catch(err => {
    console.log(err)
  });;
  res.redirect('/');
};

exports.getEditProduct = (req, res, next) => {
   
  let message = req.flash('error')
  message = message.length > 0 ? message.join('\n') : null;
  
  const oldInput = req.session.oldInput || {}
  req.session.oldInput = null

  console.log(oldInput, 'oldiput')
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findOne({ where: { id: prodId } })
    .then((product) => {
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        oldInput: oldInput,
        errorMsg: message,

      });

    }).catch(err => {
      return res.redirect('/');

    })
};

exports.postEditProduct = async (req, res, next) => {
  console.log(req.body)
  const { productId, title, price, imageUrl, description } = req.body

  const product = await Product.findOne(
    {
      where: {
        id: productId,
        userId: req.user.id
      }
    })
  if (!product) {
    return res.redirect('/admin/products')
  }

  await product.update(
    {
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description
    }
  )

  return res.redirect('/admin/products');
};

exports.getProducts = (req, res, next) => {
  req.user.getProducts()
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',

      });
    })
};


exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findOne({ where: { id: prodId, userId: req.user.id } })
    .then(product => {
      // console.log(product, 'pro', prodId)
      return product.destroy()
    }).then(() => {
      res.redirect('/admin/products');
    }).catch(err => {
      console.log('an error as occured', err)
    });
};
