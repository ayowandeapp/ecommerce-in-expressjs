const { where } = require('sequelize');
const Product = require('../models/product');
const { deleteFile } = require('../util/file');

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

  try {
    const { title, price, description } = req.body
    const image = req.file
    if(!image){
      req.flash('error', "image file is required!")
      req.session.oldInput = req.body;
      return res.status(422).redirect(req.get('referer') || '/')
      
    }
    const imageUrl = image.path
    // const userId = req.user.id
    // const product = new Product(null, title, imageUrl, description, price);
    // product.save()
    req.user.createProduct({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description
    }).then((res) => {
      req.flash('success', 'Product Created Successfully!')
      console.log('created product')
    }).catch(err => {
      console.log(err)
      throw new Error("Server error");
      req.flash('error', 'Product Created Failed!')

    });
    return res.redirect('/');
  } catch (error) {
    throw new Error("Server error");    

  }
};

exports.getEditProduct = (req, res, next) => {

  let message = req.flash('error')
  message = message.length > 0 ? message.join('\n') : null;

  const oldInput = req.session.oldInput || {}
  req.session.oldInput = null

  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findOne({ where: { id: prodId } })
    .then((product) => {
      return res.render('admin/edit-product', {
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
  try {

    const { productId, title, price, description } = req.body
    const image = req.file 

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
    
    const updateData = {
      title: title,
      price: price,
      description: description
    }
    if(image){
      deleteFile(product.imageUrl)
      updateData.imageUrl = image.path
    }

    await product.update(
      updateData
    )

    return res.redirect('/admin/products');
  } catch (error) {
    console.log(error)
    return res.redirect('/505', 500)
  }
};

exports.getProducts = (req, res, next) => {
  req.user.getProducts()
    .then(products => {
      return res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',

      });
    }).catch(err => {
      console.log('error loading page', err)

    })
};


exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findOne({ where: { id: prodId, userId: req.user.id } })
    .then(product => {
      deleteFile(product.imageUrl)
      return product.destroy()
    }).then(() => {
      return res.redirect('/admin/products');
    }).catch(err => {
      console.log('an error as occured', err)
    });
};
