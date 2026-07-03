const router = require('express').Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const ctrl = require('../controllers/publicServiceController');

router.use(authMiddleware);

/**
 * @swagger
 * /public-services:
 *   get:
 *     summary: Ambil overview layanan publik (rumah sakit, CCTV, alert darurat, kesehatan, pendidikan, lowongan, UMKM, voucher)
 *     tags: [Public Services]
 *     responses:
 *       200:
 *         description: Overview layanan publik berhasil diambil
 */
router.get('/', ctrl.overview);

/**
 * @swagger
 * /public-services/alerts/{id}:
 *   patch:
 *     summary: Aktifkan/nonaktifkan status siaga darurat (khusus admin)
 *     tags: [Public Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [aktif]
 *             properties:
 *               aktif: { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: Status alert berhasil diubah
 *       403:
 *         description: Akses ditolak, hanya admin
 *       404:
 *         description: Alert tidak ditemukan
 */
router.patch('/alerts/:id', adminMiddleware, ctrl.toggleAlert);

/**
 * @swagger
 * /public-services/jobs:
 *   post:
 *     summary: Ajukan lowongan kerja lokal baru (status awal Pending, menunggu moderasi admin)
 *     tags: [Public Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [posisi, perusahaan, lokasi]
 *             properties:
 *               posisi: { type: string, example: "Frontend Developer" }
 *               perusahaan: { type: string, example: "Medan Digital Hub" }
 *               kategori: { type: string, example: "Teknologi" }
 *               lokasi: { type: string, example: "Medan Petisah" }
 *               tipe: { type: string, example: "Full-time" }
 *               gaji: { type: string, example: "Rp6-9 juta" }
 *               deskripsi: { type: string }
 *               persyaratan: { type: string }
 *               kontak: { type: string, example: "hrd@medandigital.id" }
 *               deadline: { type: string, format: date, example: "2026-08-15" }
 *     responses:
 *       200:
 *         description: Lowongan berhasil diajukan
 *       400:
 *         description: Posisi, perusahaan, atau lokasi belum diisi
 */
router.post('/jobs', ctrl.createJob);

/**
 * @swagger
 * /public-services/jobs/{id}/report:
 *   post:
 *     summary: Laporkan lowongan kerja yang mencurigakan/tidak sesuai
 *     tags: [Public Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Laporan berhasil dikirim (lowongan otomatis di-review ulang setelah 3 laporan)
 *       404:
 *         description: Lowongan tidak ditemukan
 */
router.post('/jobs/:id/report', ctrl.reportJob);

module.exports = router;
