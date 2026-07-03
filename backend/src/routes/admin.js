const router = require("express").Router();
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const ctrl = require("../controllers/adminController");

router.use(authMiddleware, adminMiddleware);

/**
 * @swagger
 * /admin/summary:
 *   get:
 *     summary: Ambil ringkasan jumlah seluruh entitas kota (khusus admin)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Ringkasan berhasil diambil
 *       403:
 *         description: Akses ditolak, hanya admin
 */
router.get("/summary", ctrl.summary);

/**
 * @swagger
 * /admin/bootstrap:
 *   get:
 *     summary: Ambil seluruh data awal panel admin (kebijakan, laporan, banjir, pengumuman, alert, master data)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Data bootstrap admin berhasil diambil
 */
router.get("/bootstrap", ctrl.bootstrap);

/**
 * @swagger
 * /admin/logs:
 *   get:
 *     summary: Ambil log aktivitas pengguna (maks 200 terbaru, bisa difilter)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: aksi
 *         required: false
 *         schema: { type: string }
 *         example: "LOGIN"
 *       - in: query
 *         name: start
 *         required: false
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: end
 *         required: false
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Daftar log berhasil diambil
 */
router.get("/logs", ctrl.logs);

/**
 * @swagger
 * /admin/policies:
 *   post:
 *     summary: Tambah kebijakan kota baru
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [judul, kategori, deskripsi]
 *             properties:
 *               judul: { type: string, example: "Zona Rendah Emisi Pusat Kota" }
 *               kategori: { type: string, example: "Transportasi" }
 *               deskripsi: { type: string }
 *     responses:
 *       200:
 *         description: Kebijakan berhasil ditambahkan
 */
router.post("/policies", ctrl.createPolicy);

/**
 * @swagger
 * /admin/policies/{id}:
 *   put:
 *     summary: Update kebijakan kota
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               judul: { type: string }
 *               kategori: { type: string }
 *               deskripsi: { type: string }
 *     responses:
 *       200:
 *         description: Kebijakan berhasil diperbarui
 *       404:
 *         description: Kebijakan tidak ditemukan
 */
router.put("/policies/:id", ctrl.updatePolicy);

/**
 * @swagger
 * /admin/policies/{id}:
 *   delete:
 *     summary: Hapus kebijakan kota beserta seluruh votenya
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Kebijakan berhasil dihapus
 *       404:
 *         description: Kebijakan tidak ditemukan
 */
router.delete("/policies/:id", ctrl.deletePolicy);

/**
 * @swagger
 * /admin/reports/{type}/{id}/status:
 *   patch:
 *     summary: Update status laporan warga atau laporan banjir
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema: { type: string, enum: [flood, report] }
 *         description: "'flood' untuk laporan banjir, selain itu dianggap laporan warga"
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
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pending, proses, selesai], example: "proses" }
 *     responses:
 *       200:
 *         description: Status laporan berhasil diperbarui
 *       404:
 *         description: Laporan tidak ditemukan
 */
router.patch("/reports/:type/:id/status", ctrl.updateReportStatus);

/**
 * @swagger
 * /admin/announcements:
 *   post:
 *     summary: Tambah pengumuman kota baru
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [judul, kategori, tanggal, isi]
 *             properties:
 *               judul: { type: string, example: "Pemeliharaan Jaringan PDAM" }
 *               kategori: { type: string, example: "Air Bersih" }
 *               tanggal: { type: string, format: date, example: "2026-04-25" }
 *               isi: { type: string }
 *     responses:
 *       200:
 *         description: Pengumuman berhasil ditambahkan
 */
router.post("/announcements", ctrl.createAnnouncement);

/**
 * @swagger
 * /admin/announcements/{id}:
 *   put:
 *     summary: Update pengumuman kota
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               judul: { type: string }
 *               kategori: { type: string }
 *               tanggal: { type: string, format: date }
 *               isi: { type: string }
 *     responses:
 *       200:
 *         description: Pengumuman berhasil diperbarui
 *       404:
 *         description: Pengumuman tidak ditemukan
 */
router.put("/announcements/:id", ctrl.updateAnnouncement);

/**
 * @swagger
 * /admin/announcements/{id}:
 *   delete:
 *     summary: Hapus pengumuman kota
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Pengumuman berhasil dihapus
 *       404:
 *         description: Pengumuman tidak ditemukan
 */
router.delete("/announcements/:id", ctrl.deleteAnnouncement);

/**
 * @swagger
 * /admin/alerts/{id}:
 *   patch:
 *     summary: Aktifkan/nonaktifkan status siaga darurat (versi admin)
 *     tags: [Admin]
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
 *       404:
 *         description: Alert tidak ditemukan
 */
router.patch("/alerts/:id", ctrl.toggleAlert);

/**
 * @swagger
 * /admin/jobs:
 *   get:
 *     summary: Ambil seluruh lowongan kerja (termasuk yang belum disetujui)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Daftar lowongan kerja berhasil diambil
 */
router.get("/jobs", ctrl.getJobs);

/**
 * @swagger
 * /admin/jobs/{id}/status:
 *   patch:
 *     summary: Moderasi status lowongan kerja (Pending/Approved/Rejected)
 *     tags: [Admin]
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
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [Pending, Approved, Rejected], example: "Approved" }
 *     responses:
 *       200:
 *         description: Status lowongan berhasil diubah
 *       400:
 *         description: Status tidak valid
 *       404:
 *         description: Lowongan tidak ditemukan
 */
router.patch("/jobs/:id/status", ctrl.updateJobStatus);

/**
 * @swagger
 * /admin/master/{type}:
 *   post:
 *     summary: Tambah data master baru (hospitals, education, umkm, atau transport)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema: { type: string, enum: [hospitals, education, umkm, transport] }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payload menyesuaikan model master yang dipilih
 *     responses:
 *       200:
 *         description: Data master berhasil ditambahkan
 *       400:
 *         description: Tipe master tidak valid
 */
router.post("/master/:type", ctrl.createMaster);

/**
 * @swagger
 * /admin/master/{type}/{id}:
 *   put:
 *     summary: Update data master (hospitals, education, umkm, atau transport)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema: { type: string, enum: [hospitals, education, umkm, transport] }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Data master berhasil diperbarui
 *       400:
 *         description: Tipe master tidak valid
 *       404:
 *         description: Data master tidak ditemukan
 */
router.put("/master/:type/:id", ctrl.updateMaster);

/**
 * @swagger
 * /admin/master/{type}/{id}:
 *   delete:
 *     summary: Hapus data master (hospitals, education, umkm, atau transport)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema: { type: string, enum: [hospitals, education, umkm, transport] }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Data master berhasil dihapus
 *       400:
 *         description: Tipe master tidak valid
 *       404:
 *         description: Data master tidak ditemukan
 */
router.delete("/master/:type/:id", ctrl.deleteMaster);

module.exports = router;
