const express = require('express');
const {
    getActive,
    list,
    create,
    update,
    toggleActive,
    remove
} = require('../controllers/siteAnnouncementController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public — anyone can hit this for the live site bar
router.get('/active', getActive);

// Admin — full CRUD
router.use(protect);
router.use(authorize('admin'));

router.get('/', list);
router.post('/', create);
router.put('/:id', update);
router.patch('/:id/toggle', toggleActive);
router.delete('/:id', remove);

module.exports = router;
