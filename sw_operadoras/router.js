var express = require('express');
var router = express.Router();
var pole_controller = require('./controller/pole_controller.js');
var user_controller = require('./controller/user_controller.js');
var tag_controller = require('./controller/tag_controller.js');

router.get('/get_pole/:id',pole_controller.get_pole_by_objectid);
router.get('/get_poles',pole_controller.get_poles);
router.get('/get_poles_of_user',pole_controller.get_poles_of_user);
router.get('/get_tags/:object_id',tag_controller.get_tags_by_id);
router.get('/get_poles_with_tags',pole_controller.get_poles_with_tags);
router.post('/login',user_controller.login);
router.post('/save_tags',tag_controller.save_tags);
router.post("/save_tags_auto",tag_controller.save_tags_auto);

module.exports = router;