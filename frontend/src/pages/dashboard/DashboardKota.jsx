import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import HeroIcon from '../../components/HeroIcon';
import api from '../../utils/api';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './Dashboard.css';

const GOLD = '#E3B473';
const NAVY = '#111E43';
const BLUE = '#043CB1';
const GOLD2 = '#F0C98A';

const StatCard = ({ icon, label, value, unit, sub, color, trend = 'up', delay = 0 }) => (
  <div className="stat-card" data-reveal="fade-up" style={{ '--reveal-delay': `${delay}ms` }}>
    <div className="stat-head">
      <div className="stat-label">{label}</div>
      <div className="stat-icon" style={{ background: color + '18', color }}>
        <HeroIcon name={icon} />
      </div>
    </div>
    <div className="stat-value">{value}<span className="stat-unit">{unit}</span></div>
    {sub && (
      <div className={`stat-sub ${trend === 'down' ? 'down' : ''}`}>
        <HeroIcon name={trend === 'down' ? 'arrowDownRight' : 'arrowUpRight'} />
        {sub}
      </div>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: NAVY, padding: '10px 14px', borderRadius: 14, border: `1px solid ${GOLD}44` }}>
        <p style={{ color: GOLD, fontWeight: 600, marginBottom: 6, fontSize: 13 }}>{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: '#fff', fontSize: 12 }}>
            {p.name}: <strong style={{ color: GOLD2 }}>{Number(p.value).toLocaleString('id-ID')}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ALL_NEWS_POOL = [
  {
    id: 1,
    judul: "Revitalisasi Lapangan Merdeka Medan Ditargetkan Selesai Akhir Tahun Ini",
    sumber: "Tribunnews Medan",
    tanggal: "Baru saja • 10:15",
    gambar: "https://images.unsplash.com/photo-1579621970795-87faff3f68b8?w=500&auto=format&fit=crop&q=60",
    url: "https://medan.tribunnews.com/2026/01/01/revitalisasi-lapangan-merdeka-medan-ditargetkan-selesai-akhir-tahun-ini"
  },
  {
    id: 2,
    judul: "Pemko Medan Uji Coba Koridor Baru Bus Listrik Trans Metro Deli",
    sumber: "Tribunnews Medan",
    tanggal: "2 menit lalu • 10:13",
    gambar: "https://images.unsplash.com/photo-1570129476815-ba368ac77013?w=500&auto=format&fit=crop&q=60",
    url: "https://medan.tribunnews.com/2026/01/01/pemko-medan-uji-coba-koridor-baru-bus-listrik-trans-metro-deli"
  },
  {
    id: 3,
    judul: "Indeks Kualitas Udara Medan Masuk Kategori Baik Pagi Ini",
    sumber: "Tribunnews Medan",
    tanggal: "5 menit lalu • 10:10",
    gambar: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&auto=format&fit=crop&q=60",
    url: "https://medan.tribunnews.com/2026/01/01/indeks-kualitas-udara-medan-masuk-kategori-baik-pagi-ini"
  },
  {
    id: 4,
    judul: "Dinas Pendidikan Kota Medan Luncurkan Program Beasiswa Siswa Berprestasi",
    sumber: "Tribunnews Medan",
    tanggal: "12 menit lalu • 10:03",
    gambar: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=500&auto=format&fit=crop&q=60",
    url: "https://medan.tribunnews.com/2026/01/01/dinas-pendidikan-kota-medan-luncurkan-program-beasiswa-siswa-berprestasi"
  },
  {
    id: 5,
    judul: "Pembangunan Underpass Jl. HM Yamin Medan Mulai Tahap Akhir Pengecoran",
    sumber: "Tribunnews Medan",
    tanggal: "20 menit lalu • 09:55",
    gambar: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&auto=format&fit=crop&q=60",
    url: "https://medan.tribunnews.com/2026/01/01/pembangunan-underpass-jl-hm-yamin-medan-mulai-tahap-akhir-pengecoran"
  },
  {
    id: 6,
    judul: "Pasar Petisah Medan Siap Terapkan Pembayaran Digital QRIS Secara Serentak",
    sumber: "Tribunnews Medan",
    tanggal: "35 menit lalu • 09:40",
    gambar: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60",
    url: "https://medan.tribunnews.com/2026/01/01/pasar-petisah-medan-siap-terapkan-pembayaran-digital-qris-secara-serentak"
  },
  {
    id: 7,
    judul: "BMKG Keluarkan Peringatan Dini Cuaca Hujan Ringan di Kawasan Medan Selayang",
    sumber: "Tribunnews Medan",
    tanggal: "45 menit lalu • 09:30",
    gambar: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=500&auto=format&fit=crop&q=60",
    url: "https://medan.tribunnews.com/2026/01/01/bmkg-keluarkan-peringatan-dini-cuaca-hujan-ringan-di-kawasan-medan-selayang"
  },
  {
    id: 8,
    judul: "Taman Cadika Johor Jadi Lokasi Utama Lomba Catur Komunitas Akhir Pekan Ini",
    sumber: "Tribunnews Medan",
    tanggal: "1 jam lalu • 09:15",
    gambar: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=500&auto=format&fit=crop&q=60",
    url: "https://medan.tribunnews.com/2026/01/01/taman-cadika-johor-jadi-lokasi-utama-lomba-catur-komunitas-akhir-pekan-ini"
  }
];

export default function DashboardKota() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [summary, setSummary] = useState(null);
  const [overview, setOverview] = useState(null);
  const [publicServices, setPublicServices] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto rotation states
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (loading) return undefined;
    const interval = setInterval(() => {
      setFade(false); // start fade out
      setTimeout(() => {
        setVisibleIndex((prev) => (prev + 1) % ALL_NEWS_POOL.length);
        setFade(true); // start fade in
      }, 400);
    }, 6000); // rotate every 6 seconds

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, o, ps] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/overview'),
          api.get('/public-services'),
        ]);
        setStats(s.data.data.chart);
        setSummary(s.data.data.summary);
        setOverview(o.data.data);
        setPublicServices(ps.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (loading) return undefined;
    const revealItems = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!revealItems.length) return undefined;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -5% 0px',
      threshold: 0.1,
    });

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [loading]);

  if (loading) return (
    <Layout title="Dashboard Kota" subtitle="Statistik & Monitoring Smart City Medan">
      <div className="loading-state">Memuat data dashboard...</div>
    </Layout>
  );

  const featuredJobs = publicServices?.jobs ? publicServices.jobs.slice(0, 3) : [];
  const hospitalBeds = publicServices?.hospitals ? publicServices.hospitals.slice(0, 2) : [];
  const activeAlert = publicServices?.alerts ? publicServices.alerts.find(a => a.aktif) : null;

  // Select 3 news items to display dynamically
  const currentNews = [
    ALL_NEWS_POOL[visibleIndex],
    ALL_NEWS_POOL[(visibleIndex + 1) % ALL_NEWS_POOL.length],
    ALL_NEWS_POOL[(visibleIndex + 2) % ALL_NEWS_POOL.length]
  ];

  return (
    <Layout title="Dashboard Kota" subtitle="Statistik & Monitoring Smart City Medan">
      {/* Berita Medan Terkini (Microsoft Edge news card feed style) */}
      <div className="dashboard-news-section" data-reveal="fade-up" style={{ '--reveal-delay': '50ms' }}>
        <div className="news-section-header">
          <h3>
            <HeroIcon name="newspaper" style={{ width: 20, height: 20, color: '#043cb1' }} />
            Berita Medan Terkini
          </h3>
          <div className="news-live-indicator">
            <span className="live-dot"></span>
            <span>LIVE UPDATES</span>
          </div>
        </div>
        <div className={`dashboard-news-grid ${fade ? 'fade-in' : 'fade-out'}`}>
          {currentNews.map((item) => (
            <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="news-card-item">
              <div className="news-card-img-wrap">
                <img src={item.gambar} alt={item.judul} />
                <span className="news-card-source">{item.sumber}</span>
              </div>
              <div className="news-card-body">
                <h4 className="news-card-title">{item.judul}</h4>
                <span className="news-card-time">{item.tanggal}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon="people" label="Total Warga" value={(summary?.populasi || 0).toLocaleString('id-ID')} unit=" jiwa" sub="8.5% naik dari periode lalu" color={BLUE} delay={100} />
        <StatCard icon="map" label="Kepadatan" value={(summary?.kepadatan || 0).toLocaleString('id-ID')} unit=" /km²" sub="1.3% naik dari pekan lalu" color={GOLD} delay={160} />
        <StatCard icon="energy" label="Total Energi" value={(summary?.energi_gwh || 0).toFixed(1)} unit=" GWh" sub="4.3% turun dari kemarin" color="#27c98b" trend="down" delay={220} />
        <StatCard icon="cloud" label="AQI Rata-rata" value={(summary?.aqi_rata || 0).toFixed(0)} unit=" AQI" sub="1.8% naik dari kemarin" color="#ff8b8b" delay={280} />
      </div>

      {overview && (
        <div className="overview-grid">
          <div className="overview-card" onClick={() => navigate('/peta')} data-reveal="fade-up" style={{ '--reveal-delay': '240ms' }}>
            <div className="overview-text">
              <span className="overview-num">{overview.totalFasilitas}</span>
              <span className="overview-lbl">Fasilitas Publik</span>
            </div>
            <div className="overview-icon">
              <HeroIcon name="building" />
            </div>
          </div>
          <div className="overview-card" onClick={() => navigate('/transportasi')} data-reveal="fade-up" style={{ '--reveal-delay': '300ms' }}>
            <div className="overview-text">
              <span className="overview-num">{overview.totalRute}</span>
              <span className="overview-lbl">Rute Aktif</span>
            </div>
            <div className="overview-icon">
              <HeroIcon name="road" />
            </div>
          </div>
          <div className="overview-card" onClick={() => navigate('/lalu-lintas')} data-reveal="fade-up" style={{ '--reveal-delay': '360ms' }}>
            <div className="overview-text">
              <span className="overview-num">{overview.totalJalan}</span>
              <span className="overview-lbl">Ruas Jalan Dipantau</span>
            </div>
            <div className="overview-icon">
              <HeroIcon name="eye" />
            </div>
          </div>
          <div className="overview-card" onClick={() => navigate('/udara')} data-reveal="fade-up" style={{ '--reveal-delay': '420ms' }}>
            <div className="overview-text">
              <span className="overview-num">{overview.avgAqi}</span>
              <span className="overview-lbl">Rata-rata AQI Kota</span>
            </div>
            <div className="overview-icon">
              <HeroIcon name="air" />
            </div>
          </div>
        </div>
      )}

      {/* Featured Section */}
      <section className="dashboard-featured-section" data-reveal="fade-up" style={{ '--reveal-delay': '480ms' }}>
        <div className="featured-header">
          <div>
            <span className="featured-badge">🔥 Fitur Unggulan Kota</span>
            <h2>Informasi & Opportunity Terbaru</h2>
          </div>
          <Link to="/layanan" className="featured-link">Lihat Semua Layanan →</Link>
        </div>

        <div className="featured-content-grid">
          <div className="featured-main-card">
            <div className="featured-subhead">
              <h3>💼 Lowongan Kerja Terbaru</h3>
              <span className="featured-count">{featuredJobs.length} Tersedia</span>
            </div>
            <div className="featured-jobs-list">
              {featuredJobs.map((job) => (
                <div key={job.id} className="featured-job-item">
                  <div className="job-item-header">
                    <span className="job-badge">{job.tipe}</span>
                    <span className="job-salary">{job.gaji}</span>
                  </div>
                  <h4 className="job-title">{job.posisi}</h4>
                  <p className="job-company">{job.perusahaan} • <span>{job.lokasi}</span></p>
                  <Link to="/layanan" className="job-apply-btn">Lihat Detail</Link>
                </div>
              ))}
            </div>
          </div>

          <div className="featured-side-stack">
            {activeAlert && (
              <div className="featured-alert-card">
                <span className="alert-tag">🚨 Peringatan Kota</span>
                <h4>{activeAlert.judul}</h4>
                <p>{activeAlert.pesan}</p>
              </div>
            )}

            <div className="featured-hospital-card">
              <div className="hospital-card-head">
                <h4>🏥 Status Bed Rumah Sakit</h4>
                <Link to="/monitoring">Detail</Link>
              </div>
              <div className="hospital-list">
                {hospitalBeds.map((rs) => (
                  <div key={rs.id} className="hospital-item">
                    <div>
                      <strong>{rs.nama}</strong>
                      <span>{rs.kecamatan}</span>
                    </div>
                    <span className={`bed-badge ${rs.status === 'Tersedia' ? 'available' : 'full'}`}>
                      {rs.bed_tersedia} Bed {rs.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="charts-grid">
        <div className="chart-card chart-card-wide" data-reveal="fade-up" style={{ '--reveal-delay': '540ms' }}>
          <div className="chart-header">
            <div>
              <h3>Statistik Detail Kota</h3>
              <p>Pertumbuhan populasi Smart City Medan sepanjang 2024</p>
            </div>
            <span className="chart-badge">2024</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={stats} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="popGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BLUE} stopOpacity={0.32} />
                  <stop offset="95%" stopColor={BLUE} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF0F7" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: '#9AA2B6' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9AA2B6' }} axisLine={false} tickLine={false} tickFormatter={v => (v / 1000000).toFixed(1) + 'M'} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="populasi" name="Populasi" stroke={BLUE} fill="url(#popGrad)" strokeWidth={3} dot={{ fill: BLUE, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card" data-reveal="fade-up" style={{ '--reveal-delay': '600ms' }}>
          <div className="chart-header">
            <div>
              <h3>Konsumsi Energi</h3>
              <p>GWh bulanan</p>
            </div>
            <span className="chart-badge">Bulanan</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF0F7" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: '#9AA2B6' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9AA2B6' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="energi_gwh" name="Energi (GWh)" fill={GOLD} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card" data-reveal="fade-up" style={{ '--reveal-delay': '660ms' }}>
          <div className="chart-header">
            <div>
              <h3>Trend Kualitas Udara</h3>
              <p>AQI rata-rata</p>
            </div>
            <span className="chart-badge">Rata-rata bulanan</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF0F7" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: '#9AA2B6' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9AA2B6' }} axisLine={false} tickLine={false} domain={[0, 150]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="aqi_rata" name="AQI" stroke={NAVY} strokeWidth={2.5} dot={{ fill: NAVY, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card" data-reveal="fade-up" style={{ '--reveal-delay': '720ms' }}>
          <div className="chart-header">
            <div>
              <h3>Kepadatan Penduduk</h3>
              <p>Jiwa per km²</p>
            </div>
            <span className="chart-badge">Bulanan</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="kdtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF0F7" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: '#9AA2B6' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9AA2B6' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="kepadatan" name="Kepadatan" stroke={GOLD} fill="url(#kdtGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}
