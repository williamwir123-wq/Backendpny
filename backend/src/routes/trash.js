const express = require('express');
const router = express.Router();
const trashController = require('../controllers/trashController');

/**
 * @swagger
 * /trash:
 *   get:
 *     summary: Ambil semua jadwal pengangkutan sampah
 *     tags: [City Services]
 *     security: []
 *     responses:
 *       200:
 *         description: Daftar jadwal sampah berhasil diambil
 */
router.get('/', trashController.getAll);

/**
 * @swagger
 * /trash/{kecamatan}:
 *   get:
 *     summary: Ambil jadwal sampah berdasarkan kecamatan
 *     tags: [City Services]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: kecamatan
 *         required: true
 *         schema: { type: string }
 *         example: "Medan Kota"
 *     responses:
 *       200:
 *         description: Data jadwal sampah berhasil diambil
 */
router.get('/:kecamatan', trashController.getByKecamatan);

module.exports = router;