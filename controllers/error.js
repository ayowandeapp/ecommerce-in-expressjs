exports.get404 = (req, res, next) => {
  res.status(404).render('error/404', { pageTitle: 'Page Not Found', path: '/404'});
};

exports.get505 = (req, res, next) => {
  res.status(505).render('error/505', { pageTitle: 'Server Error', path: '/505'});
};
