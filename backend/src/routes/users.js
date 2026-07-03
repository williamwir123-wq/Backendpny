const express = require('express');
const router = express.Router();
const { getProfil, updateProfil, getStatistik } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../config/upload');

/**
 * @swagger
 * /users/profil:
 *   get:
 *     summary: Ambil profil lengkap user login
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Data profil user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User tidak ditemukan
 */
router.get('/profil', authMiddleware, getProfil);

/**
 * @swagger
 * /users/profil:
 *   put:
 *     summary: Update profil user login (nama, kota, foto profil)
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nama: { type: string, example: "Budi Santoso" }
 *               kota: { type: string, example: "Medan" }
 *               foto_profil:
 *                 type: string
 *                 format: binary
 *                 description: File gambar (jpg, png, webp), maks 5MB
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui
 *       404:
 *         description: User tidak ditemukan
 */
router.put('/profil', authMiddleware, upload.single('foto_profil'), updateProfil);

/**
 * @swagger
 * /users/statistik:
 *   get:
 *     summary: Ambil statistik partisipasi user login (vote, laporan, login)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Statistik partisipasi user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalVote: { type: integer, example: 4 }
 *                 totalLaporan: { type: integer, example: 2 }
 *                 totalLogin: { type: integer, example: 15 }
 */
router.get('/statistik', authMiddleware, getStatistik);

module.exports = router;
