var user_controller = require('./controller/user_controller.js');
var tags_controller = require('./controller/tags_controller.js');
var pole_controller = require('./controller/pole_controller.js');
var express = require('express');
var router = express.Router();

router.get('/get_user/:user_id',user_controller.get_user);

router.get('/tags/:objectid',tags_controller.get_tags);

router.get('/poste/oid/:objectid',pole_controller.get_pole_by_objectid);
router.get('/poste/codigo/:codigo',pole_controller.get_pole_by_codigo);
router.get('/bb/:lat1,:long1,:lat2,:long2', pole_controller.get_poles);
router.get('/bb_with_tags/:lat1,:long1,:lat2,:long2',pole_controller.get_poles_with_tags);
router.get('/postes_extras',pole_controller.get_postes_extras)

router.post('/poste/extras',pole_controller.save_pole);
router.post('/poste/extras/foto', pole_controller.save_photo);

module.exports = router;