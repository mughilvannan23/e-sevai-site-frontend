import React, { useState, useEffect, useMemo } from 'react';

const STORAGE_KEY_FAVORITES = 'quicklinks_favorites';
const STORAGE_KEY_RECENT = 'quicklinks_recent';
const MAX_RECENT = 5;

const centralGovServices = [
  { id: 'pan-efiling', name: 'PAN (e-Filing)', description: 'Income Tax e-Filing portal for PAN services and tax returns.', url: 'https://www.incometax.gov.in', icon: '🏛️' },
  { id: 'pan-protean', name: 'PAN (Protean/NSDL)', description: 'Apply for new PAN or make corrections via Protean.', url: 'https://www.protean-tinpan.com', icon: '🪪' },
  { id: 'pan-utiitsl', name: 'PAN (UTIITSL)', description: 'PAN card services through UTIITSL portal.', url: 'https://www.utiitsl.com', icon: '🪪' },
  { id: 'passport', name: 'Passport Seva', description: 'Apply for passport, track status, and manage appointments.', url: 'https://www.passportindia.gov.in', icon: '🛂' },
  { id: 'aadhaar', name: 'UIDAI (Aadhaar)', description: 'Aadhaar enrollment, update, and verification services.', url: 'https://uidai.gov.in', icon: '🆔' },
  { id: 'gst', name: 'GST Portal', description: 'GST registration, returns filing, and compliance portal.', url: 'https://www.gst.gov.in', icon: '📊' },
  { id: 'incometax', name: 'Income Tax e-Filing', description: 'File income tax returns and manage tax profile online.', url: 'https://www.incometax.gov.in', icon: '💰' },
  { id: 'digilocker', name: 'DigiLocker', description: 'Access and store official documents digitally.', url: 'https://www.digilocker.gov.in', icon: '🔐' },
  { id: 'scholarship', name: 'National Scholarship Portal', description: 'Apply for central and state government scholarships.', url: 'https://scholarships.gov.in', icon: '🎓' },
  { id: 'parivahan', name: 'Parivahan', description: 'Vehicle registration, driving license, and transport services.', url: 'https://parivahan.gov.in', icon: '🚗' },
  { id: 'epfo', name: 'EPFO', description: 'Employee Provident Fund services and UAN management.', url: 'https://www.epfindia.gov.in', icon: '🏦' },
  { id: 'esic', name: 'ESIC', description: 'Employee State Insurance Corporation services.', url: 'https://www.esic.gov.in', icon: '🏥' },
  { id: 'pmkisan', name: 'PM Kisan', description: 'PM Kisan Samman Nidhi beneficiary status and registration.', url: 'https://pmkisan.gov.in', icon: '🌾' },
  { id: 'eshram', name: 'e-Shram', description: 'Unorganized worker registration and e-Shram card.', url: 'https://eshram.gov.in', icon: '👷' },
  { id: 'voter', name: 'National Voter Service Portal', description: 'Voter ID registration, status check, and electoral roll.', url: 'https://voters.eci.gov.in', icon: '🗳️' },
  { id: 'mca', name: 'MCA', description: 'Ministry of Corporate Affairs - company registration and filings.', url: 'https://www.mca.gov.in', icon: '🏢' },
  { id: 'gem', name: 'GeM', description: 'Government e-Marketplace for public procurement.', url: 'https://gem.gov.in', icon: '🛒' },
  { id: 'csc', name: 'CSC', description: 'Common Service Centre registration and services.', url: 'https://register.csc.gov.in', icon: '🏪' },
  { id: 'jeevanpramaan', name: 'Jeevan Pramaan', description: 'Digital life certificate for pensioners.', url: 'https://jeevanpramaan.gov.in', icon: '📜' },
  { id: 'umang', name: 'UMANG', description: 'Unified Mobile Application for accessing government services.', url: 'https://web.umang.gov.in', icon: '📱' },
];

const tnGovServices = [
  { id: 'tnesevai', name: 'TN e-Sevai', description: 'Tamil Nadu e-Governance services portal.', url: 'https://www.tnesevai.tn.gov.in', icon: '🏛️' },
  { id: 'tnega', name: 'TNeGA', description: 'Tamil Nadu e-Governance Agency portal.', url: 'https://tnega.tn.gov.in', icon: '💻' },
  { id: 'pattachitta', name: 'Patta & Chitta', description: 'Land records - Patta, Chitta, and Adangal details.', url: 'https://eservices.tn.gov.in', icon: '📋' },
  { id: 'edistrict', name: 'TN e-District', description: 'Apply for certificates and district-level services online.', url: 'https://edistrict.tn.gov.in', icon: '🏘️' },
  { id: 'tangedco', name: 'TN EB (TANGEDCO)', description: 'Electricity bill payment and connection services.', url: 'https://www.tangedco.gov.in', icon: '⚡' },
  { id: 'tnreginet', name: 'TN Registration', description: 'Property registration and encumbrance certificate services.', url: 'https://tnreginet.gov.in', icon: '🏠' },
  { id: 'tntransport', name: 'TN Transport', description: 'Tamil Nadu transport and vehicle services.', url: 'https://tnsta.gov.in', icon: '🚌' },
];

const allServices = {
  central: centralGovServices,
  tamilnadu: tnGovServices,
};

const QuickLinks = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('central');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_FAVORITES)) || [];
    } catch { return []; }
  });
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_RECENT)) || [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recent));
  }, [recent]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleOpenLink = (service) => {
    setRecent((prev) => {
      const filtered = prev.filter((r) => r.id !== service.id);
      return [{ id: service.id, name: service.name, url: service.url, icon: service.icon, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT);
    });
    window.open(service.url, '_blank', 'noopener,noreferrer');
  };

  const allServicesList = [...centralGovServices, ...tnGovServices];

  const favoriteServices = useMemo(() => {
    return allServicesList.filter((s) => favorites.includes(s.id));
  }, [favorites]);

  const filteredServices = useMemo(() => {
    const services = allServices[category] || [];
    if (!search.trim()) return services;
    const q = search.toLowerCase();
    return services.filter(
      (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }, [category, search]);

  const recentServices = useMemo(() => {
    return recent
      .map((r) => allServicesList.find((s) => s.id === r.id))
      .filter(Boolean);
  }, [recent]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <style>{`
        .ql-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #e8f0e6;
          cursor: default;
        }
        .ql-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 16px 40px rgba(59, 129, 50, 0.15) !important;
          border-color: #3b8132;
        }
        .ql-open-btn {
          transition: all 0.2s ease;
        }
        .ql-open-btn:hover {
          background-color: #2e6a28 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 129, 50, 0.3);
        }
        .ql-fav-btn {
          transition: all 0.2s ease;
        }
        .ql-fav-btn:hover {
          transform: scale(1.2);
        }
        .ql-search:focus {
          border-color: #3b8132 !important;
          box-shadow: 0 0 0 3px rgba(59, 129, 50, 0.12) !important;
        }
        .ql-tab {
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
          background: none;
        }
        .ql-tab:hover:not(.ql-tab-active) {
          color: #3b8132 !important;
          background-color: rgba(59, 129, 50, 0.06);
        }
        .ql-recent-chip {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .ql-recent-chip:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 129, 50, 0.15);
          border-color: #3b8132 !important;
        }
        .ql-section-fade {
          animation: qlFadeIn 0.3s ease;
        }
        @keyframes qlFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1" style={{ color: '#1a3a18', fontSize: '1.6rem' }}>
          🔗 Quick Links
        </h4>
        <p className="mb-0" style={{ color: '#6b7280', fontSize: '0.95rem' }}>
          Access frequently used Government and e-Sevai service portals from one place.
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="position-relative">
          {/* <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '18px' }}>🔍</span> */}
          <input
            type="text"
            className="form-control ql-search"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              paddingLeft: '44px',
              paddingRight: '16px',
              height: '48px',
              borderRadius: '12px',
              border: '1.5px solid #e0e5dd',
              fontSize: '15px',
              backgroundColor: '#fafdfb',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: '#9ca3af', fontSize: '18px', cursor: 'pointer'
              }}
            >✕</button>
          )}
        </div>
      </div>

      {/* Favorites Section */}
      {favoriteServices.length > 0 && !search && (
        <div className="mb-4 ql-section-fade">
          <h6 className="fw-bold mb-3" style={{ color: '#1a3a18' }}>
            ⭐ Favorites
          </h6>
          <div className="row g-3">
            {favoriteServices.map((service) => (
              <div key={`fav-${service.id}`} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <ServiceCard
                  service={service}
                  isFavorite={true}
                  onToggleFavorite={toggleFavorite}
                  onOpen={handleOpenLink}
                />
              </div>
            ))}
          </div>
          <hr style={{ borderColor: '#e8f0e6', marginTop: '24px' }} />
        </div>
      )}

      {/* Recently Opened */}
      {recentServices.length > 0 && !search && (
        <div className="mb-4 ql-section-fade">
          <h6 className="fw-bold mb-3" style={{ color: '#1a3a18' }}>
            🕐 Recently Opened
          </h6>
          <div className="d-flex flex-wrap gap-2">
            {recentServices.map((service) => (
              <button
                key={`recent-${service.id}`}
                className="ql-recent-chip d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                style={{
                  backgroundColor: '#f0f7ee',
                  border: '1px solid #d4e5d0',
                  color: '#2d5a28',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
                onClick={() => handleOpenLink(service)}
              >
                <span>{service.icon}</span>
                <span>{service.name}</span>
                <span style={{ fontSize: '12px', color: '#6b8f66' }}>↗</span>
              </button>
            ))}
          </div>
          <hr style={{ borderColor: '#e8f0e6', marginTop: '24px' }} />
        </div>
      )}

      {/* Category Tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        <button
          className={`ql-tab px-4 py-2 rounded-pill fw-semibold ${category === 'central' ? 'ql-tab-active' : ''}`}
          onClick={() => setCategory('central')}
          style={{
            fontSize: '14px',
            backgroundColor: category === 'central' ? '#3b8132' : 'transparent',
            color: category === 'central' ? '#fff' : '#6b7280',
            border: category === 'central' ? 'none' : '1.5px solid #e0e5dd',
            boxShadow: category === 'central' ? '0 4px 12px rgba(59, 129, 50, 0.25)' : 'none',
          }}
        >
          🏛️ Central Government
        </button>
        <button
          className={`ql-tab px-4 py-2 rounded-pill fw-semibold ${category === 'tamilnadu' ? 'ql-tab-active' : ''}`}
          onClick={() => setCategory('tamilnadu')}
          style={{
            fontSize: '14px',
            backgroundColor: category === 'tamilnadu' ? '#3b8132' : 'transparent',
            color: category === 'tamilnadu' ? '#fff' : '#6b7280',
            border: category === 'tamilnadu' ? 'none' : '1.5px solid #e0e5dd',
            boxShadow: category === 'tamilnadu' ? '0 4px 12px rgba(59, 129, 50, 0.25)' : 'none',
          }}
        >
          🏛️ Tamil Nadu Government
        </button>
      </div>

      {/* Service Cards */}
      <div className="ql-section-fade" key={category + search}>
        {filteredServices.length > 0 ? (
          <div className="row g-3">
            {filteredServices.map((service) => (
              <div key={service.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <ServiceCard
                  service={service}
                  isFavorite={favorites.includes(service.id)}
                  onToggleFavorite={toggleFavorite}
                  onOpen={handleOpenLink}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
            <h6 className="fw-bold" style={{ color: '#6b7280' }}>No services found</h6>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Try a different search term or category.</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center mt-5 mb-3">
        <p style={{ color: '#9ca3af', fontSize: '12px' }}>
          All links point to official Government websites. External sites open in a new tab.
        </p>
      </div>
    </div>
  );
};

const ServiceCard = ({ service, isFavorite, onToggleFavorite, onOpen }) => {
  return (
    <div
      className="ql-card h-100 rounded-4 p-3 d-flex flex-column"
      style={{
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Top Row: Icon + Favorite */}
      <div className="d-flex align-items-start justify-content-between mb-3">
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #e8f5e3 0%, #d4edcf 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            flexShrink: 0,
          }}
        >
          {service.icon}
        </div>
        <button
          className="ql-fav-btn"
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(service.id); }}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            color: isFavorite ? '#f59e0b' : '#d1d5db',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
          }}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '⭐' : '☆'}
        </button>
      </div>

      {/* Service Name */}
      <h6 className="fw-bold mb-1" style={{ color: '#1a3a18', fontSize: '0.95rem', lineHeight: 1.3 }}>
        {service.name}
      </h6>

      {/* Description */}
      <p className="mb-3 flex-grow-1" style={{ color: '#6b7280', fontSize: '0.8rem', lineHeight: 1.5 }}>
        {service.description}
      </p>

      {/* Open Button */}
      <button
        className="ql-open-btn btn w-100 d-flex align-items-center justify-content-center gap-2"
        onClick={() => onOpen(service)}
        style={{
          backgroundColor: '#3b8132',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          padding: '10px 16px',
          fontSize: '13px',
          fontWeight: '600',
        }}
      >
        Open Website
        <span style={{ fontSize: '14px' }}>↗</span>
      </button>
    </div>
  );
};

export default QuickLinks;
