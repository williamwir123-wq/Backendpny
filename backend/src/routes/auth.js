const express = require('express');
const router = express.Router();
const { register, login, guestLogin, googleLogin, getForgotQuestion, resetPassword, logout } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrasi akun warga baru
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama, email, password, security_question, security_answer]
 *             properties:
 *               nama: { type: string, example: "Budi Santoso" }
 *               email: { type: string, example: "budi@example.com" }
 *               password: { type: string, format: password, example: "rahasia123" }
 *               kota: { type: string, example: "Medan" }
 *               security_question: { type: string, example: "Nama hewan peliharaan pertama?" }
 *               security_answer: { type: string, example: "Kitty" }
 *     responses:
 *       201:
 *         description: Registrasi berhasil
 *       400:
 *         description: Field wajib kosong atau email sudah terdaftar
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login menggunakan email dan password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "budi@example.com" }
 *               password: { type: string, format: password, example: "rahasia123" }
 *               remember: { type: boolean, example: false }
 *     responses:
 *       200:
 *         description: Login berhasil, mengembalikan token JWT
 *       401:
 *         description: Email atau password salah
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/guest:
 *   post:
 *     summary: Masuk sebagai guest demo tanpa registrasi
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: Berhasil masuk sebagai guest, mengembalikan token JWT sementara (12 jam)
 */
router.post('/guest', guestLogin);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Login/registrasi melalui Google OAuth
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credential: { type: string, description: "Google ID token (JWT credential)" }
 *               email: { type: string }
 *               nama: { type: string }
 *               foto_profil: { type: string }
 *     responses:
 *       200:
 *         description: Login via Google berhasil, mengembalikan token JWT
 */
router.post('/google', googleLogin);

/**
 * @swagger
 * /auth/forgot-password/question:
 *   post:
 *     summary: Ambil pertanyaan keamanan berdasarkan email
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, example: "budi@example.com" }
 *     responses:
 *       200:
 *         description: Pertanyaan keamanan ditemukan
 *       404:
 *         description: Email tidak ditemukan
 */
router.post('/forgot-password/question', getForgotQuestion);

/**
 * @swagger
 * /auth/forgot-password/reset:
 *   post:
 *     summary: Reset password menggunakan jawaban keamanan
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, security_answer, new_password]
 *             properties:
 *               email: { type: string, example: "budi@example.com" }
 *               security_answer: { type: string, example: "Kitty" }
 *               new_password: { type: string, format: password, example: "passwordBaru123" }
 *     responses:
 *       200:
 *         description: Password berhasil direset
 *       401:
 *         description: Jawaban keamanan salah
 *       404:
 *         description: Email tidak ditemukan
 */
router.post('/forgot-password/reset', resetPassword);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout dari sesi saat ini
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout berhasil
 *       401:
 *         description: Token tidak ditemukan
 */
router.post('/logout', authMiddleware, logout);
module.exports = router;
