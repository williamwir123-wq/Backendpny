const router = require('express').Router();
const ctrl = require('../controllers/dashboardController');

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Ambil statistik kota (chart tahunan dan ringkasan terbaru)
 *     tags: [Dashboard]
 *     security: []
 *     responses:
 *       200:
 *         description: Data statistik kota berhasil diambil
 */
router.get('/stats', ctrl.getCityStats);

/**
 * @swagger
 * /dashboard/overview:
 *   get:
 *     summary: Ambil ringkasan cepat kota (total fasilitas, rute aktif, jalan, rata-rata AQI)
 *     tags: [Dashboard]
 *     security: []
 *     responses:
 *       200:
 *         description: Ringkasan kota berhasil diambil
 */
router.get('/overview', ctrl.getOverview);

module.exports = router;
