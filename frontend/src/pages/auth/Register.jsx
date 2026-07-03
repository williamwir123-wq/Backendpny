import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../components/BrandLogo';
import HeroIcon from '../../components/HeroIcon';
import api from '../../utils/api';
import './auth.css';

const SECURITY_QUESTIONS = [
  'Nama hewan peliharaan pertama kamu?',
  'Nama sekolah dasar kamu?',
  'Nama kota kelahiran ibu kamu?',
  'Nama panggilan masa kecil kamu?',
  'Makanan favorit kamu waktu kecil?'
];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    nama: '', email: '', password: '', kota: 'Medan',
    security_question: SECURITY_QUESTIONS[0], security_answer: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1013401569429-demo.apps.googleusercontent.com',
          callback: async (response) => {
            setLoading(true);
            try {
              const res = await api.post('/auth/google', { credential: response.credential });
              login(res.data.user, res.data.token);
              navigate('/dashboard');
            } catch (err) {
              setError(err.response?.data?.message || 'Gagal terhubung ke server (Port backend/frontend tidak cocok atau server mati).');
            } finally {
              setLoading(false);
            }
          }
        });

        const btnContainer = document.getElementById('google-official-btn');
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: 340,
            text: 'signup_with',
            shape: 'rectangular'
          });
        }
      }
    };
    document.body.appendChild(script);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const password = form.password;
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasDot = /\./.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasMinLength || !hasUppercase || !hasDot) {
      return setError('Password harus memenuhi semua syarat: minimal 6 karakter, memiliki huruf besar, dan memiliki tanda titik (.).');
    }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setSuccess('Registrasi berhasil! Silakan login.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal registrasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <BrandLogo className="auth-brand-logo" variant="white" />
          <p>Portal Digital Warga Kota Medan</p>
        </div>
      </div>

      <div className="auth-right">
        <h2>Buat Akun Baru</h2>
        <p className="subtitle">Daftar untuk mengakses layanan kota digital</p>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <div id="google-official-btn" style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}></div>

        <div className="auth-divider" style={{ marginBottom: 20 }}>atau daftar dengan email</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input name="nama" placeholder="Masukkan nama lengkap"
              value={form.nama} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="email@example.com"
              value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input name="password" type={showPass ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                value={form.password} onChange={handleChange} required />
              <button type="button" className="password-toggle"
                onClick={() => setShowPass(!showPass)}>
                <HeroIcon name={showPass ? 'eyeSlash' : 'eye'} />
              </button>
            </div>
            {form.password && (
              <div className="password-requirements">
                <div className={`requirement-item ${hasMinLength ? 'valid' : ''}`}>
                  <HeroIcon name={hasMinLength ? 'check' : 'xCircle'} className="req-icon" />
                  <span>Minimal 6 karakter</span>
                </div>
                <div className={`requirement-item ${hasUppercase ? 'valid' : ''}`}>
                  <HeroIcon name={hasUppercase ? 'check' : 'xCircle'} className="req-icon" />
                  <span>Setidaknya 1 huruf besar</span>
                </div>
                <div className={`requirement-item ${hasDot ? 'valid' : ''}`}>
                  <HeroIcon name={hasDot ? 'check' : 'xCircle'} className="req-icon" />
                  <span>Setidaknya 1 tanda titik (.)</span>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Kota</label>
            <input name="kota" placeholder="Kota tempat tinggal"
              value={form.kota} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Pertanyaan Keamanan</label>
            <select name="security_question" value={form.security_question}
              onChange={handleChange}>
              {SECURITY_QUESTIONS.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Jawaban Keamanan</label>
            <input name="security_answer" placeholder="Jawaban kamu"
              value={form.security_answer} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="auth-footer">
          Sudah punya akun? <Link to="/login">Login di sini</Link>
        </div>
      </div>
    </div>
  );
}
