import React, { useEffect, useState } from 'react';
import { incidentApi } from './api';
import type { Incident, User } from './types';
import { AnalyticsChart } from './AnalyticsChart';
import {
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Search,
  UserCheck,
  Download,
  Sparkles,
  LayoutDashboard,
  Settings,
  X,
  Layers,
  Inbox,
  Database,
  Server,
  Activity,
  Check
} from 'lucide-react';

type TabType = 'dashboard' | 'incidents' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Modal Durumu
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Incident['priority']>('MEDIUM');
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestedReason, setSuggestedReason] = useState<string | null>(null);

  // Filtre State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const fetchData = async () => {
    try {
      const [incidentsData, usersData] = await Promise.all([
        incidentApi.getAll(),
        incidentApi.getUsers(),
      ]);
      setIncidents(incidentsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Veri çekilemedi:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTextChange = (field: 'title' | 'description', value: string) => {
    if (field === 'title') setTitle(value);
    if (field === 'description') setDescription(value);

    const combinedText = field === 'title' ? `${value} ${description}` : `${title} ${value}`;
    const lower = combinedText.toLowerCase();

    const criticalKeywords = ['crash', 'down', 'deadlock', 'data loss', 'security', 'çöktü', 'kesinti', 'erişilemiyor'];
    const highKeywords = ['timeout', 'exception', 'slow', 'fail', '404', '500', 'hata', 'yavaş'];

    for (const kw of criticalKeywords) {
      if (lower.includes(kw)) {
        setPriority('CRITICAL');
        setSuggestedReason(`AI: "${kw}" anahtar kelimesi tespit edildi → Öncelik Kritik (P1) seviyesine ayarlandı.`);
        return;
      }
    }

    for (const kw of highKeywords) {
      if (lower.includes(kw)) {
        setPriority('HIGH');
        setSuggestedReason(`AI: "${kw}" anahtar kelimesi tespit edildi → Öncelik Yüksek seviyesine ayarlandı.`);
        return;
      }
    }

    setSuggestedReason(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await incidentApi.create({
        title,
        description,
        priority,
        assigned_to: assignedTo,
      });
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setAssignedTo(null);
      setSuggestedReason(null);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Olay kaydedilemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: Incident['status']) => {
    try {
      await incidentApi.updateStatus(id, status);
      fetchData();
    } catch (err) {
      console.error('Durum güncellenemedi:', err);
    }
  };

  const handleAssigneeChange = async (id: number, userId: string) => {
    try {
      const parsedId = userId === '' ? null : Number(userId);
      await incidentApi.updateAssignee(id, parsedId);
      fetchData();
    } catch (err) {
      console.error('Atama güncellenemedi:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu olay kaydını silmek istediğinize emin misiniz?')) return;
    try {
      await incidentApi.delete(id);
      fetchData();
    } catch (err) {
      console.error('Silinemedi:', err);
    }
  };

  const handleExportCSV = () => {
    if (filteredIncidents.length === 0) return;
    const headers = ['ID', 'Baslik', 'Oncelik', 'Durum', 'Atanan_Muhendis', 'Tarih'];
    const rows = filteredIncidents.map((i) => [
      i.id,
      `"${i.title.replace(/"/g, '""')}"`,
      i.priority,
      i.status,
      i.assigned_to_username ? `"${i.assigned_to_username}"` : 'Atanmamis',
      `"${new Date(i.created_at).toLocaleString()}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `incidentflow_rapor_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Metrikler
  const totalCount = incidents.length;
  const openCount = incidents.filter((i) => i.status === 'OPEN').length;
  const inProgressCount = incidents.filter((i) => i.status === 'IN_PROGRESS').length;
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length;

  const filteredIncidents = incidents.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityBadge = (p: Incident['priority']) => {
    switch (p) {
      case 'CRITICAL': return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' };
      case 'HIGH': return { bg: '#ffedd5', text: '#c2410c', border: '#fdba74' };
      case 'MEDIUM': return { bg: '#fef9c3', text: '#854d0e', border: '#fde047' };
      default: return { bg: '#dcfce7', text: '#15803d', border: '#86efac' };
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sol Sidebar */}
      <aside style={{
        width: '260px',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <div style={{ background: 'linear-gradient(135deg, #4f46e5, #3b82f6)', color: '#fff', padding: '8px', borderRadius: '10px', display: 'flex' }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>IncidentFlow</h2>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Ops Command Center</p>
            </div>
          </div>

          {/* Menü Linkleri (Çalışan Sekmeler) */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                background: activeTab === 'dashboard' ? '#eef2ff' : 'transparent',
                color: activeTab === 'dashboard' ? '#4f46e5' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: activeTab === 'dashboard' ? 700 : 500,
                fontSize: '14px',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>

            <button
              onClick={() => setActiveTab('incidents')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                background: activeTab === 'incidents' ? '#eef2ff' : 'transparent',
                color: activeTab === 'incidents' ? '#4f46e5' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: activeTab === 'incidents' ? 700 : 500,
                fontSize: '14px',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <Layers size={18} /> Olay Kayıtları
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                background: activeTab === 'settings' ? '#eef2ff' : 'transparent',
                color: activeTab === 'settings' ? '#4f46e5' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: activeTab === 'settings' ? 700 : 500,
                fontSize: '14px',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <Settings size={18} /> Sistem Ayarları
            </button>
          </nav>
        </div>

        {/* Profil */}
        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
            AY
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {users[0]?.username ? `@${users[0].username}` : 'Mühendis'}
            </p>
            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>● Çevrimiçi</span>
          </div>
        </div>
      </aside>

      {/* Ana Gövde */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        {/* Üst Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              {activeTab === 'dashboard' && 'Teknik Olay Yönetimi'}
              {activeTab === 'incidents' && 'Tüm Olay Kayıtları'}
              {activeTab === 'settings' && 'Sistem & Operasyon Ayarları'}
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
              {activeTab === 'dashboard' && 'Sistem sağlığını izleyin, arızaları önceliklendirin ve çözüme kavuşturun.'}
              {activeTab === 'incidents' && 'Veritabanında kayıtlı tüm olayları filtreleyin ve yönetin.'}
              {activeTab === 'settings' && 'IncidentFlow mimari servis durumu ve aktif ortam yapılandırması.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={handleExportCSV}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Download size={15} color="#64748b" /> Rapor İndir
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
              }}
            >
              <Plus size={16} /> Yeni Olay Bildir
            </button>
          </div>
        </div>

        {/* 1. SEKME: DASHBOARD GÖRÜNÜMÜ */}
        {activeTab === 'dashboard' && (
          <>
            {/* Metrik Kartları */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div className="dash-card" style={{ padding: '20px' }}>
                <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 700 }}>TOPLAM OLAY</span>
                <p style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>{totalCount}</p>
              </div>
              <div className="dash-card" style={{ padding: '20px' }}>
                <span style={{ color: '#dc2626', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <AlertCircle size={14} /> BEKLEYEN (AÇIK)
                </span>
                <p style={{ fontSize: '30px', fontWeight: 800, color: '#dc2626', marginTop: '6px' }}>{openCount}</p>
              </div>
              <div className="dash-card" style={{ padding: '20px' }}>
                <span style={{ color: '#d97706', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={14} /> İŞLEMDE
                </span>
                <p style={{ fontSize: '30px', fontWeight: 800, color: '#d97706', marginTop: '6px' }}>{inProgressCount}</p>
              </div>
              <div className="dash-card" style={{ padding: '20px' }}>
                <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle2 size={14} /> ÇÖZÜLEN
                </span>
                <p style={{ fontSize: '30px', fontWeight: 800, color: '#16a34a', marginTop: '6px' }}>{resolvedCount}</p>
              </div>
            </div>

            {/* Grafikler */}
            <AnalyticsChart incidents={incidents} />
          </>
        )}

        {/* 1. VE 2. SEKMELERDE ORTAK OLAY LİSTESİ */}
        {(activeTab === 'dashboard' || activeTab === 'incidents') && (
          <div className="dash-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  {activeTab === 'dashboard' ? 'Son Olay Akışı' : 'Filtrelenmiş Olay Listesi'}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b' }}>Filtrelenen: {filteredIncidents.length} / Toplam {incidents.length}</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '220px' }}>
                  <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                  <input
                    type="text"
                    placeholder="Başlık veya log ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px 8px 32px', fontSize: '13px' }}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '13px', background: '#fff' }}
                >
                  <option value="ALL">Tüm Durumlar</option>
                  <option value="OPEN">Açık</option>
                  <option value="IN_PROGRESS">İşlemde</option>
                  <option value="RESOLVED">Çözüldü</option>
                  <option value="CLOSED">Kapatıldı</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '13px', background: '#fff' }}
                >
                  <option value="ALL">Tüm Öncelikler</option>
                  <option value="LOW">Düşük</option>
                  <option value="MEDIUM">Orta</option>
                  <option value="HIGH">Yüksek</option>
                  <option value="CRITICAL">Kritik</option>
                </select>
              </div>
            </div>

            {filteredIncidents.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
                <Inbox size={36} color="#cbd5e1" style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '14px', fontWeight: 500 }}>Filtre kriterlerine uygun olay kaydı bulunamadı.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredIncidents.map((item) => {
                  const badge = getPriorityBadge(item.priority);
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: badge.bg,
                              color: badge.text,
                              border: `1px solid ${badge.border}`
                            }}
                          >
                            {item.priority}
                          </span>
                          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{item.title}</h4>
                        </div>

                        {item.description && (
                          <p style={{ color: '#475569', fontSize: '13px', margin: '4px 0 0', lineHeight: '1.4' }}>
                            {item.description}
                          </p>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                          <span style={{ fontWeight: 600, color: '#94a3b8' }}>#{item.id}</span>
                          <span>•</span>
                          <span>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: item.assigned_to_username ? '#4f46e5' : '#94a3b8', fontWeight: item.assigned_to_username ? 600 : 400 }}>
                            <UserCheck size={14} />
                            {item.assigned_to_username ? `@${item.assigned_to_username}` : 'Atanmamış'}
                          </span>
                        </div>
                      </div>

                      {/* Aksiyonlar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select
                          value={item.assigned_to ?? ''}
                          onChange={(e) => handleAssigneeChange(item.id, e.target.value)}
                          style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer', background: '#fff' }}
                        >
                          <option value="">👤 Mühendis Seç</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              @{u.username}
                            </option>
                          ))}
                        </select>

                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as Incident['status'])}
                          style={{
                            padding: '6px 10px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background:
                              item.status === 'OPEN' ? '#fee2e2' :
                              item.status === 'IN_PROGRESS' ? '#fef3c7' :
                              '#dcfce7',
                            color:
                              item.status === 'OPEN' ? '#b91c1c' :
                              item.status === 'IN_PROGRESS' ? '#b45309' :
                              '#15803d',
                            border:
                              item.status === 'OPEN' ? '1px solid #fca5a5' :
                              item.status === 'IN_PROGRESS' ? '1px solid #fde68a' :
                              '1px solid #86efac'
                          }}
                        >
                          <option value="OPEN">🔴 Açık</option>
                          <option value="IN_PROGRESS">🟡 İşlemde</option>
                          <option value="RESOLVED">🟢 Çözüldü</option>
                          <option value="CLOSED">⚪ Kapatıldı</option>
                        </select>

                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            padding: '6px',
                            display: 'flex'
                          }}
                          title="Sil"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. SEKME: SİSTEM AYARLARI GÖRÜNÜMÜ */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Sistem Sağlık Durumu Kartı */}
            <div className="dash-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#4f46e5" /> Sistem Sağlık & Altyapı Durumu
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontSize: '13px', fontWeight: 600 }}>
                    <Check size={16} /> PostgreSQL Veritabanı
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Docker Konteyner • Port 5432 • Çevrimiçi</p>
                </div>
                <div style={{ padding: '16px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontSize: '13px', fontWeight: 600 }}>
                    <Check size={16} /> Django REST API
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Backend Servisi • Port 8000 • Sağlıklı</p>
                </div>
                <div style={{ padding: '16px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontSize: '13px', fontWeight: 600 }}>
                    <Check size={16} /> AI Öncelik Motoru
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Kural & Heuristic Tabanlı Model • Aktif</p>
                </div>
              </div>
            </div>

            {/* Kayıtlı Mühendisler / Kullanıcılar */}
            <div className="dash-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={18} color="#4f46e5" /> Sistem Mühendisleri ({users.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {users.map(u => (
                  <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                        {u.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#0f172a' }}>@{u.username}</strong>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{u.email || 'E-posta belirtilmemiş'}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#dcfce7', color: '#166534' }}>
                      Yetkili Mühendis
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* YENİ OLAY MODALI */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '640px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Yeni Olay Bildirimi</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Sistem hatasını detaylandırın ve ekibe yönlendirin.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Olay Başlığı <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Örn: 504 Gateway Timeout veya Veritabanı Crash..."
                  value={title}
                  onChange={(e) => handleTextChange('title', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', fontSize: '14px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Açıklama & Hata Ayrıntısı
                </label>
                <textarea
                  placeholder="Sorunun yaşandığı servis, hata kodu, stack trace veya kullanıcı bildirimleri..."
                  value={description}
                  onChange={(e) => handleTextChange('description', e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: '10px 14px', fontSize: '14px', resize: 'vertical' }}
                />
              </div>

              {suggestedReason && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 14px', borderRadius: '8px', color: '#1d4ed8', fontSize: '13px', fontWeight: 500 }}>
                  <Sparkles size={18} />
                  <span>{suggestedReason}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Öncelik Seviyesi
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => {
                      setPriority(e.target.value as Incident['priority']);
                      setSuggestedReason(null);
                    }}
                    style={{ width: '100%', padding: '10px 12px', fontSize: '13px', background: '#fff', cursor: 'pointer' }}
                  >
                    <option value="LOW">🟢 Low (Düşük)</option>
                    <option value="MEDIUM">🟡 Medium (Orta)</option>
                    <option value="HIGH">🟠 High (Yüksek)</option>
                    <option value="CRITICAL">🔴 Critical (P1)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Atanacak Mühendis
                  </label>
                  <select
                    value={assignedTo ?? ''}
                    onChange={(e) => setAssignedTo(e.target.value ? Number(e.target.value) : null)}
                    style={{ width: '100%', padding: '10px 12px', fontSize: '13px', background: '#fff', cursor: 'pointer' }}
                  >
                    <option value="">👤 Atanmamış</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        @{u.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 22px',
                    background: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
                  }}
                >
                  {loading ? 'Oluşturuluyor...' : 'Olayı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}