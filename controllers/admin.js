const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
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
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findOne({ where: { id: prodId }})
    .then((product) => {
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product
      });

    }).catch(err => {
      return res.redirect('/');

    })
};

exports.postEditProduct = (req, res, next) => {
  console.log(req.body)
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  Product.update(
    {
      title: updatedTitle,
      price: updatedPrice,
      imageUrl: updatedImageUrl,
      'description': updatedDesc
    },
    {
      where: { id: prodId }
    }
  ).then(() => {

    res.redirect('/admin/products');
  })
};

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
};


exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findOne({ where: { id: prodId }})
    .then(product => {
      // console.log(product, 'pro', prodId)
      return product.destroy()
    }).then(() => {
      res.redirect('/admin/products');
    }).catch(err => {
      console.log('an error as occured', err)
    });
};
