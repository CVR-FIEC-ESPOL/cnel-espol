var user_controller = require('./controller/user_controller.js');
var tags_controller = require('./controller/tags_controller.js');
var pole_controller = require('./controller/pole_controller.js');
var app_middlewares = require('./app_middlewares.js');

var express = require('express');
var router = express.Router();
var db = require('./model/model.js');

router.use(app_middlewares.auth);

router.post('/tag',tags_controller.save_tags);
router.post('/tag_auto',tags_controller.save_tag_auto)
router.get('/user/:user_id',user_controller.get_user);
router.get('/users',user_controller.get_users);
router.get('/tags/:objectid',tags_controller.get_tags);
router.get('/poste/oid/:objectid',pole_controller.get_pole_by_objectid);
router.get('/poste/codigo/:codigo',pole_controller.get_pole_by_codigo);
router.get('/bb/:lat1,:long1,:lat2,:long2', pole_controller.get_poles);
router.get('/bb_with_tags/:lat1,:long1,:lat2,:long2',pole_controller.get_poles_with_tags);
router.get('/postes_extras',pole_controller.get_postes_extras)
router.get('/postes_extras/:user_id',pole_controller.get_poles_of_user);
router.post('/sync_postes',pole_controller.get_new_poles);
router.post('/postes',pole_controller.get_all_poles);
router.post('/poste/extras',pole_controller.save_pole);
router.post('/poste/extras/foto', pole_controller.save_photo);

module.exports = router;