import React, { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import heroBg from '../../assets/hero-bg.png';
import { authAPI } from '../../services/api';
import { useToast } from './Toast';
import {
    FaUsers,
    FaFileInvoiceDollar,
    FaTasks,
    FaChartBar,
    FaWhatsapp,
    FaShieldAlt,
    FaTachometerAlt,
    FaMoneyBillWave,
    FaWallet,
    FaShoppingCart,
    FaFilePdf,
    FaClock,
    FaUserShield,
    FaCalendarCheck,
    FaCogs,
    FaMobileAlt
} from "react-icons/fa";
const heroBenefits = [
    {
        title: '3 Days Free Trial',
        text: 'No credit card required and instant OTP verification for quick access.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 0a8 8 0 108 8A8 8 0 008 0zm3.478 5.656L7 10.133 5.536 8.67a.5.5 0 10-.707.707l1.91 1.91a.5.5 0 00.708 0l4.646-4.647a.5.5 0 10-.707-.707z" />
            </svg>
        )
    },
    {
        title: 'Subscription Based',
        text: 'Flexible plans designed for shops, offices, and growing teams.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 0a8 8 0 108 8A8 8 0 008 0zm3.5 8.5H8.707l1.647 1.646a.5.5 0 01-.708.708L8 9.207V4.5a.5.5 0 011 0v4.793h1.5a.5.5 0 010 1z" />
            </svg>
        )
    },
    {
        title: 'Cloud Based',
        text: 'Access your business data securely from any device and location.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.406 3.342A5.53 5.53 0 018 2a5.53 5.53 0 013.594 1.342A4.002 4.002 0 0114 8a4 4 0 01-4 4H6a3 3 0 01-.594-5.658z" />
            </svg>
        )
    },
    {
        title: 'Role Based Access',
        text: 'Secure permission controls for admins, and employees.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 5a2 2 0 11-4 0 2 2 0 014 0zm4 8s-1 0-1-1-1-4-4-4-4 3-4 4 0 1-1 1H2v1h12v-1h-0z" />
            </svg>
        )
    }
];

const features = [
    {
        icon: <FaUsers size={28} />,
        title: "Employee Management",
        text: "Add, edit, and manage employees with role-based access."
    },
    {
        icon: <FaFileInvoiceDollar size={28} />,
        title: "Billing",
        text: "Generate bills and manage customer payments."
    },
    // {
    //     icon: <FaTasks size={28} />,
    //     title: "Work Entry",
    //     text: "Create and track work entries."
    // },
    // {
    //     icon: <FaChartBar size={28} />,
    //     title: "Reports",
    //     text: "View revenue and performance reports."
    // },
    // {
    //     icon: <FaWhatsapp size={28} />,
    //     title: "WhatsApp Receipt",
    //     text: "Send receipts directly to customers."
    // },
    // {
    //     icon: <FaShieldAlt size={28} />,
    //     title: "Secure Login",
    //     text: "JWT authentication with role-based access."
    // },
    // {
    //     icon: <FaTachometerAlt size={28} />,
    //     title: "Dashboard",
    //     text: "Monitor your business from one place."
    // },
    // {
    //     icon: <FaMoneyBillWave size={28} />,
    //     title: "Payment Tracking",
    //     text: "Manage Cash, GPay and Split payments."
    // },
    // {
    //     icon: <FaWallet size={28} />,
    //     title: "Shop Balance",
    //     text: "Track Cash and GPay balances."
    // },
    // {
    //     icon: <FaShoppingCart size={28} />,
    //     title: "Purchase Management",
    //     text: "Manage shop expenses and purchases."
    // },
    {
        icon: <FaFilePdf size={28} />,
        title: "PDF & Excel Export",
        text: "Download reports in PDF and Excel."
    },
    // {
    //     icon: <FaClock size={28} />,
    //     title: "Duration Tracking",
    //     text: "Track expiry and duration-based services."
    // },
    // {
    //     icon: <FaUserShield size={28} />,
    //     title: "Multi-Role Access",
    //     text: "Separate access for Super Admin, Admin, and Employees."
    // },
    // {
    //     icon: <FaCalendarCheck size={28} />,
    //     title: "Subscription Management",
    //     text: "Manage shop subscriptions and renewals."
    // },
    // {
    //     icon: <FaCogs size={28} />,
    //     title: "Work Item Management",
    //     text: "Create and organize service categories."
    // },
    // {
    //     icon: <FaMobileAlt size={28} />,
    //     title: "Responsive Design",
    //     text: "Works on desktop, tablet, and mobile."
    // }
];



// const superAdminGalleryImports = import.meta.glob('../../assets/super-admin/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' });
const adminGalleryImports = import.meta.glob('../../assets/admin/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' });
const employeeGalleryImports = import.meta.glob('../../assets/employee/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' });

const modules = [
    // {
    //     key: 'superadmin',
    //     title: 'Super Admin',
    //     description: 'Manage shops, admins, and subscriptions with full visibility.',
    //     points: ['Manage shops', 'Create admins', 'Subscription control'],
    //     accent: 'linear-gradient(135deg, #4b8f3c, #3b8132)',
    //     icon: <FaShieldAlt size={20} />
    // },
    {
        key: 'admin',
        title: 'Admin',
        description: 'Run daily operations with reports, purchases, and work management.',
        points: ['Employee management', 'Reports', 'Purchases', 'Dashboard', 'Work management'],
        accent: 'linear-gradient(135deg, #5d9d4e, #3d8c35)',
        icon: <FaTachometerAlt size={20} />
    },
    {
        key: 'employee',
        title: 'Employee',
        description: 'Track tasks, add work entries, and review personal reports.',
        points: ['Add works', 'View reports', 'Manage assigned tasks'],
        accent: 'linear-gradient(135deg, #6ea959, #4f9144)',
        icon: <FaUsers size={20} />
    }
];

const gallery = {
    // superAdmin: Object.entries(superAdminGalleryImports)
    //     .sort(([a], [b]) => a.localeCompare(b))
    //     .map(([, src]) => ({ src })),
    admin: Object.entries(adminGalleryImports)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, src]) => ({ src })),
    employee: Object.entries(employeeGalleryImports)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, src]) => ({ src }))
};

const workflow = ['Login', 'Dashboard', 'Create Work', 'Track Payment', 'Generate Receipt', 'Send WhatsApp Bill', 'Reports'];

const pricingPlans = [
    {
        name: "Free Trial",
        price: "3 Days",
        description:
            "Try e-Sevai free for 3 days with all essential features.",
        features: [
            "Employee Management",
            "Work Tracking",
            "Attendance Tracking",
            "Task Assignment",
            "Basic Reports",
            "Free Support"
        ]
    },
    {
        name: "6 Months Plan",
        price: "Contact Us",
        description:
            "Ideal for small and growing businesses looking for an affordable subscription plan.",
        features: [
            "Unlimited Employees",
            "Work & Task Tracking",
            "Advanced Reports",
            "Performance Monitoring",
            "Regular Updates",
            "Technical Support"
        ]
    },
    {
        name: "Yearly Plan",
        price: "Contact Us",
        description:
            "Best value for businesses that want uninterrupted access with premium support.",
        features: [
            "All Premium Features",
            "Priority Support",
            "Cloud Backup",
            "Unlimited Work Tracking",
            "Latest Feature Updates",
            "Best Value Subscription"
        ]
    }
];

const whyChooseUs = [
    {
        title: "Easy Employee Management",
        description: "Manage employee details, roles, and daily activities from a single dashboard."
    },
    {
        title: "Real-Time Work Tracking",
        description: "Assign tasks, monitor progress, and track work status in real time."
    },
    {
        title: "Subscription-Based Solution",
        description: "Affordable monthly and yearly subscription plans with regular updates and support."
    },
    // {
    //     title: "Secure & Cloud-Based",
    //     description: "Access your data anytime, anywhere with secure cloud storage and backups."
    // }
];


const reviews = [
    {
        name: 'Arun Kumar',
        shop: 'Sri Murugan e-Sevai Center',
        rating: 5,
        review: '"  This software has completely simplified our daily billing and employee management. Highly recommended!  "'
    },
    {
        name: 'Prakash',
        shop: 'Vetri Browsing Center',
        rating: 5,
        review: '"  Fast, reliable, and very easy to use. WhatsApp receipt feature saves a lot of time.  "'
    },
    {
        name: 'Sathish',
        shop: 'Smart e-Sevai',
        rating: 5,
        review: '"  Reports, employee management, and billing are all available in one place. Excellent software.  "'
    },
    {
        name: 'Karthik',
        shop: 'Karthik Online Services',
        rating: 5,
        review: '"  The interface is clean and professional. Customer billing is much faster than before.  "'
    },
    {
        name: 'Vignesh',
        shop: 'SV e-Sevai Center',
        rating: 5,
        review: '"  Very useful for managing shop operations. Support is also excellent.  "'
    }
];

const faqs = [
    {
        question: 'Does the login experience stay the same?',
        answer: 'Yes. The existing authentication logic, APIs, routes, and redirects remain unchanged. Only the public UI has been redesigned.'
    },
    {
        question: 'Can I use this with my existing shop setup?',
        answer: 'Yes. The landing page simply adds a modern entry experience while the current application flow and business logic continue to work as before.'
    },
    {
        question: 'Is the portal suitable for mobile screens?',
        answer: 'Yes. The whole experience is built to be responsive for desktop, tablet, and mobile users.'
    }
];

const LandingPage = () => {
    const navigate = useNavigate();
    const { login, error: authError, clearError } = useAuth();
    const { success, error: showError } = useToast();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [authTab, setAuthTab] = useState('login');
    const [formData, setFormData] = useState({ shopName: '', mobile: '', email: '', password: '' });
    const [loginData, setLoginData] = useState({ loginId: '', password: '' });
    const [submitting, setSubmitting] = useState(false);
    const [loginSubmitting, setLoginSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [loginFormError, setLoginFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [activeTab, setActiveTab] = useState('employee');
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [fadeGallery, setFadeGallery] = useState(true);
    const [activeReviewIndex, setActiveReviewIndex] = useState(0);
    const [isReviewHovered, setIsReviewHovered] = useState(false);
    const [reviewFade, setReviewFade] = useState(true);
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
    const [contactSubmitting, setContactSubmitting] = useState(false);
    const [contactSuccess, setContactSuccess] = useState('');
    const [contactError, setContactError] = useState('');
    const formRef = useRef();

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100,
        });
    }, []);

    const scrollToSection = (id) => {
        const target = document.getElementById(id);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setMobileMenuOpen(false);
    };

    const activeGalleryImages = gallery[activeTab] || [];

    useEffect(() => {
        setSelectedImageIndex(null);
        setFadeGallery(false);
        const timeout = window.setTimeout(() => {
            setFadeGallery(true);
        }, 50);
        return () => window.clearTimeout(timeout);
    }, [activeTab]);

    useEffect(() => {
        if (selectedImageIndex === null) return;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setSelectedImageIndex(null);
            } else if (event.key === 'ArrowRight') {
                setSelectedImageIndex((prev) => (prev === null ? 0 : (prev + 1) % activeGalleryImages.length));
            } else if (event.key === 'ArrowLeft') {
                setSelectedImageIndex((prev) => (prev === null ? 0 : (prev - 1 + activeGalleryImages.length) % activeGalleryImages.length));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeGalleryImages.length, selectedImageIndex]);

    useEffect(() => {
        if (!reviews.length) return;
        const timer = window.setTimeout(() => {
            if (!isReviewHovered) {
                setActiveReviewIndex((prev) => (prev + 1) % reviews.length);
            }
        }, 2000);
        return () => window.clearTimeout(timer);
    }, [activeReviewIndex, isReviewHovered]);

    useEffect(() => {
        setReviewFade(false);
        const fadeTimeout = window.setTimeout(() => setReviewFade(true), 50);
        return () => window.clearTimeout(fadeTimeout);
    }, [activeReviewIndex]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'mobile') {
            const numericValue = value.replace(/[^0-9]/g, '').substring(0, 10);
            setFormData((prev) => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
        if (formError) setFormError('');
    };

    const handleLoginInputChange = (event) => {
        const { name, value } = event.target;
        setLoginData((prev) => ({ ...prev, [name]: value }));
        if (loginFormError) setLoginFormError('');
    };

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        const trimmedId = loginData.loginId.trim();
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedId);
        const isMobile = /^\d{10}$/.test(trimmedId);

        if (!isEmail && !isMobile) {
            setLoginFormError('Please enter a valid Email Address or 10-digit Mobile Number.');
            return;
        }
        if (!loginData.password) {
            setLoginFormError('Password is required.');
            return;
        }

        clearError();
        setLoginSubmitting(true);
        setLoginFormError('');
        try {
            const result = await login(loginData);
            success('Login successful!');
            if (result.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/employee/dashboard');
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Invalid credentials. Please try again.';
            setLoginFormError(message);
            showError(message);
        } finally {
            setLoginSubmitting(false);
        }
    };

    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setContactForm((prev) => ({ ...prev, [name]: value }));
        if (contactError) setContactError('');
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setContactSubmitting(true);
        setContactError('');
        setContactSuccess('');

        if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
            setContactError('All fields are required.');
            setContactSubmitting(false);
            return;
        }

        try {
            const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
            const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
            const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

            await emailjs.sendForm(
                SERVICE_ID,
                TEMPLATE_ID,
                formRef.current,
                PUBLIC_KEY
            );

            setContactSuccess('Message sent successfully! We will get back to you soon.');
            setContactForm({ name: '', email: '', message: '' });
        } catch (err) {
            setContactError('Failed to send message. Please try again later.');
        } finally {
            setContactSubmitting(false);
        }
    };

    const handleDemoSubmit = async (event) => {
        event.preventDefault();

        if (!formData.shopName.trim()) {
            setFormError('Shop name is required.');
            return;
        }

        if (formData.mobile.length !== 10) {
            setFormError('Please enter a valid 10-digit mobile number.');
            return;
        }

        if (formData.password.length < 6) {
            setFormError('Password must be at least 6 characters long.');
            return;
        }

        if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
            setFormError('Password must include both letters and numbers.');
            return;
        }

        setSubmitting(true);
        setFormError('');

        try {
            const response = await authAPI.register({
                shopName: formData.shopName.trim(),
                mobile: formData.mobile,
                email: formData.email.trim(),
                password: formData.password
            });

            if (response.data?.success) {
                success('Your free trial account has been created successfully. Your subscription is valid for 3 days. Please login to continue.');
                setSuccessMessage('Free trial created successfully. Please login with your mobile number or email.');
                setFormData((prev) => ({ ...prev, mobile: formData.mobile, email: formData.email, shopName: '' }));
            } else {
                setFormError(response.data?.message || 'Unable to create your account.');
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Unable to create your account.';
            setFormError(message);
            showError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.page}>
            <style>{`
        html { scroll-behavior: smooth; }
        .landing-card {
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .feature-card:hover, .module-card:hover, .preview-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 45px rgba(59, 129, 50, 0.15);
        }
        .module-image-card:hover {
          transform: translateY(-6px) scale(1.01);
        }
        .module-image-card .image-overlay {
          opacity: 0;
          background-color: rgba(0, 0, 0, 0.24);
          transition: opacity 0.25s ease;
        }
        .module-image-card:hover .image-overlay {
          opacity: 1;
        }
        .module-image-card:hover img {
          transform: scale(1.05);
        }
        .review-card {
        //   background-color: #ffffff;
          border-radius: 20px;
        //   box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
        //   border: 1px solid rgba(59, 129, 50, 0.08);
          padding: 44px 36px;
          transition: transform 0.5s ease, opacity 0.5s ease;
          min-height: 280px;
          text-align: center;
          items-align: center;
        }
        .review-active {
          opacity: 1;
          transform: translateY(0);
        }
        .review-inactive {
          opacity: 0;
          transform: translateY(20px);
        }
        .review-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #d1d5db;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease, background-color 0.3s ease;
        }
        .review-dot:hover {
          transform: scale(1.15);
        }
        .review-dot.active {
          background-color: #2f6f2b;
        }
        .gallery-fade-in {
          opacity: 1;
          transition: opacity 0.35s ease;
        }
        .gallery-fade-out {
          opacity: 0.3;
          transition: opacity 0.35s ease;
        }
        @keyframes slideDownFade {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .navbar-nav .nav-link:hover {
          color: #3b8132 !important;
        }
      `}</style>

            <header className="fixed-top" style={styles.navbar}>
                <nav className="container navbar navbar-expand-lg px-3 px-lg-4 py-3">
                    <button className="navbar-brand btn btn-link p-0 border-0 text-decoration-none d-flex align-items-center gap-2" onClick={() => scrollToSection('home')}>
                        {/* <div style={styles.logo}>E</div> */}
                        <div>
                            <div style={styles.brandName}>E-Service</div>
                            {/* <div style={styles.brandSub}>Office Suite</div> */}
                        </div>
                    </button>

                    <button className="navbar-toggler border-0" type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ boxShadow: 'none' }}>
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
                        <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
                            {['Home', 'Features', 'Pricing', 'About', 'Contact'].map((item) => {
                                const id = item.toLowerCase() === 'home' ? 'home' : item.toLowerCase();
                                return (
                                    <li className="nav-item" key={item}>
                                        <button className="nav-link btn btn-link text-decoration-none" style={styles.navLink} onClick={() => scrollToSection(id)}>
                                            {item}
                                        </button>
                                    </li>
                                );
                            })}
                            {/* <li className="nav-item">
                                <button className="btn btn-success rounded-pill px-3 shadow-sm" onClick={() => navigate('/login')}>
                                    Login
                                </button>
                            </li> */}
                        </ul>
                    </div>
                </nav>
            </header>

            <main id="home" style={{ paddingTop: '80px' }}>
                <section className="container-fluid px-0 py-5 py-lg-6" style={styles.heroSection}>
                    <div style={styles.heroSectionOverlay} />
                    <div className="container">
                        <div className="row align-items-center g-5" style={styles.heroSectionContent}>
                            <div className="col-lg-7">
                                <div className="badge rounded-pill px-3 py-2 mb-4" style={styles.badge}>
                                    Premium SaaS for Shop & Office Operations
                                </div>
                                <h1 className="display-4 fw-bold mb-4" style={styles.heroTitle}>
                                    Customer E-Service Management System
                                </h1>
                                <p className="lead mb-4" style={styles.heroText}>
                                    Simplify employee management, work tracking, billing, reports, analytics, and shop operations from one elegant portal.
                                </p>
                                <div className="d-flex flex-wrap gap-3 mb-4">
                                    <button className="btn btn-success btn-lg px-4 py-3 rounded-pill shadow" onClick={() => { setAuthTab('register'); scrollToSection('hero-login'); }}>
                                        Start Free Demo
                                    </button>
                                    <button className="btn btn-outline-secondary btn-lg px-4 py-3 rounded-pill" onClick={() => { setAuthTab('login'); scrollToSection('hero-login'); }}>
                                        Login
                                    </button>
                                </div>
                                {/* <div className="d-flex flex-wrap gap-3">
                                    {['Secure Login', 'Cloud Ready', 'Fast Performance', 'Role Based Access'].map((item) => (
                                        <div key={item} className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill" style={styles.trustBadge}>
                                            <span style={{ color: '#3b8132' }}>✔</span>
                                            <span style={{ fontWeight: 600 }}>{item}</span>
                                        </div>
                                    ))}
                                </div> */}
                            </div>

                            <div className="col-lg-5" id="hero-login">
                                <div className="landing-card rounded-4 shadow-lg p-2 p-md-3" style={styles.heroCard}>
                                    <div style={styles.authCard} className="rounded-4 p-4 position-relative overflow-hidden">
                                        {successMessage && (
                                            <div className="alert alert-success" role="alert">
                                                {successMessage}
                                            </div>
                                        )}
                                        {/* Tab Toggle - Login / Register */}
                                        <div className="d-flex mb-4" style={{ borderBottom: '2px solid #e5e7eb' }}>
                                            
                                            <button
                                                type="button"
                                                onClick={() => { setAuthTab('register'); setFormError(''); setLoginFormError(''); }}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px 0',
                                                    border: 'none',
                                                    background: 'none',
                                                    fontWeight: 700,
                                                    fontSize: '1rem',
                                                    color: authTab === 'register' ? '#3b8132' : '#9ca3af',
                                                    borderBottom: authTab === 'register' ? '3px solid #3b8132' : '3px solid transparent',
                                                    marginBottom: '-2px',
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Register
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setAuthTab('login'); setLoginFormError(''); setFormError(''); }}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px 0',
                                                    border: 'none',
                                                    background: 'none',
                                                    fontWeight: 700,
                                                    fontSize: '1rem',
                                                    color: authTab === 'login' ? '#3b8132' : '#9ca3af',
                                                    borderBottom: authTab === 'login' ? '3px solid #3b8132' : '3px solid transparent',
                                                    marginBottom: '-2px',
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Login
                                            </button>
                                        </div>

                                        <div style={styles.tabContent}>
                                            {authTab === 'login' ? (
                                                <form onSubmit={handleLoginSubmit}>
                                                    <div className="mb-3">
                                                        <h5 className='text-center pb-2 fw-bold' style={{ color: '#18391a' }}>Welcome Back</h5>
                                                        <label className="form-label fw-semibold">Email Address or Mobile Number</label>
                                                        <input
                                                            type="text"
                                                            name="loginId"
                                                            className="form-control"
                                                            placeholder="Enter Email or Mobile Number"
                                                            value={loginData.loginId}
                                                            onChange={handleLoginInputChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <label className="form-label fw-semibold mb-0">Password</label>
                                                            <a href="#/forgot-password" style={{ fontSize: '13px', color: '#3b8132', textDecoration: 'none', fontWeight: '500' }}>Forgot Password?</a>
                                                        </div>
                                                        <input
                                                            type="password"
                                                            name="password"
                                                            className="form-control mt-1"
                                                            placeholder="Enter your password"
                                                            value={loginData.password}
                                                            onChange={handleLoginInputChange}
                                                            required
                                                        />
                                                    </div>
                                                    {loginFormError && <div className="alert alert-danger py-2" role="alert">{loginFormError}</div>}
                                                    <div className="d-flex gap-2 mt-4 flex-wrap">
                                                        <button type="submit" className="btn btn-success flex-grow-1" disabled={loginSubmitting}>
                                                            {loginSubmitting ? 'Logging in...' : 'Login'}
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <form onSubmit={handleDemoSubmit}>
                                                    <div className="mb-3">
                                                        <h5 className='text-center pb-2 fw-bold' style={{ color: '#18391a' }}>Register For Free Trial</h5>
                                                        <label className="form-label fw-semibold">Shop Name</label>
                                                        <input
                                                            type="text"
                                                            name="shopName"
                                                            className="form-control"
                                                            placeholder="Enter shop name"
                                                            value={formData.shopName}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold">Mobile Number</label>
                                                        <input
                                                            type="text"
                                                            name="mobile"
                                                            className="form-control"
                                                            placeholder="Enter 10-digit mobile number"
                                                            value={formData.mobile}
                                                            onChange={handleInputChange}
                                                            maxLength="10"
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold">Email Address </label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            className="form-control"
                                                            placeholder="Enter email address"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold">Password</label>
                                                        <input
                                                            type="password"
                                                            name="password"
                                                            className="form-control"
                                                            placeholder="Create a strong password"
                                                            value={formData.password}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                    {formError && <div className="alert alert-danger py-2" role="alert">{formError}</div>}
                                                    <div className="d-flex gap-2 mt-4 flex-wrap">
                                                        <button type="submit" className="btn btn-success flex-grow-1" disabled={submitting}>
                                                            {submitting ? 'Creating account...' : 'Create Free Account'}
                                                        </button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="py-5" >
                    <div className="container">
                        <div className="text-center mb-5">
                            <p className="text-uppercase fw-semibold mb-2" style={{ color: '#3b8132', letterSpacing: '0.2em' }}>Features</p>
                            <h2 className="display-6 fw-bold mb-3">Everything your business needs in one place</h2>
                            <p className="mx-auto" style={{ maxWidth: '700px', color: '#6b7280' }}>
                                From employee onboarding to reports and billing, the platform is designed to keep operations smooth, visible, and secure.
                            </p>
                        </div>
                        {/* <div className="row g-4">
                            {features.map((feature) => (
                                <div className="col-12 col-md-6 col-lg-4" key={feature.title}>
                                    <div className="feature-card h-100 rounded-4 p-4 shadow-sm border-0" style={styles.featureCard}>
                                        <div className="fs-1 mb-3">{feature.icon}</div>
                                        <h5 className="fw-bold mb-2">{feature.title}</h5>
                                        <p className="mb-0" style={{ color: '#6b7280' }}>{feature.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div> */}

                        <div className="row g-4">
                            {features.map((feature, index) => (
                                <div
                                    className="col-12 col-md-6 col-lg-4"
                                    key={feature.title}
                                    data-aos="fade-up"
                                    data-aos-delay={index * 100}
                                >
                                    <div
                                        className="feature-card h-100 rounded-4 p-4 shadow-sm border-0"
                                        style={styles.featureCard}
                                    >
                                        <div className="fs-1 mb-3">{feature.icon}</div>
                                        <h5 className="fw-bold mb-2">{feature.title}</h5>
                                        <p className="mb-0" style={{ color: "#6b7280" }}>
                                            {feature.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="modules" className="py-5" style={styles.sectionAlt, { backgroundColor: '#fff' }}>
                    <div className="container">
                        <div className="text-center mb-5">
                            <p className="text-uppercase fw-semibold mb-2" style={{ color: '#3b8132', letterSpacing: '0.2em' }}>Modules</p>
                            <h2 className="display-6 fw-bold mb-3">Built for every role in your operation</h2>
                        </div>
                        {/* <div className="row g-4 align-items-stretch">
                            {modules.map((module) => (
                                <div className="col-12 col-md-6 col-lg-4 d-flex" key={module.key}>
                                    <div className="w-100 d-flex flex-column">
                                        <div
                                            className="module-card w-100 h-100 d-flex flex-column justify-content-between rounded-4 p-4 shadow-sm"
                                            style={{
                                                ...styles.moduleCard,
                                                border: '1px solid rgba(226,232,240,0.9)',
                                                boxShadow: '0 10px 25px rgba(15, 23, 42, 0.06)'
                                            }}
                                        >
                                            <div className="d-flex align-items-start justify-content-between gap-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="rounded-3 p-3 text-white" style={{ background: module.accent }}>
                                                        {module.icon}
                                                    </div>
                                                    <div>
                                                        <h4 className="fw-bold mb-1" style={{ color: '#18391a' }}>{module.title}</h4>
                                                        <p className="mb-0" style={{ color: '#6b7280', fontSize: '0.95rem' }}>{module.description}</p>
                                                    </div>
                                                </div>
                                                <div
                                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                                    style={{
                                                        width: '38px',
                                                        height: '38px',
                                                        backgroundColor: 'rgba(243, 244, 246, 1)',
                                                        color: '#3b8132'
                                                    }}
                                                >
                                                    ▼
                                                </div>
                                            </div>
                                            <ul className="mb-0 mt-3 ps-3" style={{ color: '#4b5563' }}>
                                                {module.points.map((point) => <li key={point} className="mb-2">{point}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div> */}

                        <div className="mt-5">
                            <div className="d-flex flex-wrap gap-3 justify-content-center mb-4">
                                {[
                                    // { key: 'superAdmin', label: 'Super Admin' },
                                    { key: 'admin', label: 'Admin' },
                                    { key: 'employee', label: 'Employee' }
                                ].map((tab) => {
                                    const isActive = activeTab === tab.key;
                                    return (
                                        <button
                                            key={tab.key}
                                            type="button"
                                            onClick={() => setActiveTab(tab.key)}
                                            className="btn rounded-pill px-4 py-2 border"
                                            style={{
                                                minWidth: '140px',
                                                fontWeight: 600,
                                                color: isActive ? '#ffffff' : '#2f6f2b',
                                                backgroundColor: isActive ? '#2f6f2b' : '#ffffff',
                                                borderColor: isActive ? '#2f6f2b' : '#d1d5db',
                                                transition: 'all 0.25s ease',
                                                boxShadow: isActive ? '0 10px 30px rgba(47, 111, 43, 0.16)' : '0 6px 18px rgba(15, 23, 42, 0.06)'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive) e.currentTarget.style.backgroundColor = '#ecf7ed';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive) e.currentTarget.style.backgroundColor = '#ffffff';
                                            }}
                                        >
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className={`row g-3 ${fadeGallery ? 'gallery-fade-in' : 'gallery-fade-out'}`}>
                                {activeGalleryImages.map((image, index) => (
                                    <div className="col-12 col-md-6 col-lg-4" key={`${activeTab}-${index}`}>
                                        <button
                                            type="button"
                                            className="module-image-card w-100 border-0 p-0 overflow-hidden rounded-4 position-relative"
                                            style={{
                                                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
                                                minHeight: '240px',
                                                backgroundColor: '#f9fafb',
                                                transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                                            }}
                                            onClick={() => setSelectedImageIndex(index)}
                                        >
                                            <img
                                                src={image.src}
                                                alt={`Gallery ${activeTab} ${index + 1}`}
                                                loading="lazy"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.35s ease' }}
                                            />
                                            {/* <div className="image-overlay position-absolute inset-0 d-flex align-items-center justify-content-center">
                                                <div className="rounded-circle bg-white d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                                                    <span style={{ fontSize: '1.1rem', color: '#2f6f2b' }}>🔍</span>
                                                </div>
                                            </div> */}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* <section className="py-5">
                    <div className="container">
                        <div className="text-center mb-5">
                            <p className="text-uppercase fw-semibold mb-2" style={{ color: '#3b8132', letterSpacing: '0.2em' }}>Workflow</p>
                            <h2 className="display-6 fw-bold mb-3">A smooth path from login to reporting</h2>
                        </div>
                        <div className="d-flex flex-wrap justify-content-center gap-3">
                            {workflow.map((step, index) => (
                                <React.Fragment key={step}>
                                    <div className="px-4 py-3 rounded-pill shadow-sm" style={styles.workflowStep}>{step}</div>
                                    {index < workflow.length - 1 && <div className="d-flex align-items-center fs-4" style={{ color: '#3b8132' }}>↓</div>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </section> */}

                <section id="pricing" className="py-5" style={styles.sectionAlt}>
                    <div className="container">

                        <div className="text-center mb-5">
                            <p
                                className="text-uppercase fw-semibold mb-2"
                                style={{ color: "#3b8132", letterSpacing: "0.2em" }}
                            >
                                Pricing
                            </p>

                            <h2 className="display-6 fw-bold mb-3">
                                Simple & Affordable Subscription Plans
                            </h2>

                            <p
                                className="mx-auto"
                                style={{ maxWidth: "700px", color: "#6b7280" }}
                            >
                                Start with a 3-day free trial and choose the subscription plan
                                that best fits your business needs.
                            </p>
                        </div>

                        <div className="row g-4">
                            {pricingPlans.map((plan) => (
                                <div className="col-md-6 col-lg-4" key={plan.name}>
                                    <div
                                        className="h-100 rounded-4 p-4 shadow-sm"
                                        style={styles.pricingCard, { fontSize: "1rem" }}
                                    >
                                        <h4 className="fw-bold">{plan.name}</h4>

                                        <div
                                            className="display-6 fw-bold my-3"
                                            style={{ color: "#3b8132", fontSize: "2rem" }}
                                        >
                                            {plan.price}
                                        </div>

                                        <p style={{ color: "#6b7280" }}>
                                            {plan.description}
                                        </p>

                                        <ul className="list-unstyled mt-4">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="mb-2">
                                                    ✅ {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            className="btn btn-success rounded-pill w-100 mt-3"
                                            onClick={() => {
                                                document
                                                    .getElementById("contact")
                                                    ?.scrollIntoView({
                                                        behavior: "smooth",
                                                        block: "start",
                                                    });
                                            }}
                                        >
                                            Request Demo
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </section>

                <section
                    id="about"
                    className="py-3 mt-4 mb-4"
                    style={{ ...styles.sectionAlt, backgroundColor: "#fff" }}
                >
                    <div className="container">
                        <div className="row align-items-center">

                            {/* Left Content */}
                            <div className="col-lg-5">
                                <p
                                    className="text-uppercase fw-semibold mb-2"
                                    style={{ color: "#3b8132", letterSpacing: "0.2em" }}
                                >
                                    About
                                </p>

                                <h2 className="display-6 fw-bold mb-3">
                                    Smart Employee Management & Work Tracking Solution
                                </h2>

                                <p style={{ color: "#6b7280", lineHeight: "1.8" }}>
                                    e-Sevai is a subscription-based Employee Management and Work
                                    Tracking Software designed to simplify daily business operations.
                                    Manage employees, assign tasks, monitor work progress, track
                                    attendance, and generate reports—all from one secure platform.
                                    Whether you're a small business or a growing organization,
                                    e-Sevai helps improve productivity, transparency, and team
                                    performance with an easy-to-use interface.
                                </p>
                            </div>

                            {/* Center Divider */}
                            <div className="col-lg-2 d-none d-lg-flex justify-content-center">
                                <div
                                    style={{
                                        width: "4px",
                                        height: "320px",
                                        backgroundColor: "#3b8132",
                                        borderRadius: "10px",
                                    }}
                                ></div>
                            </div>

                            {/* Right Content */}
                            <div className="col-lg-5">
                                <div className="rounded-4 p-4 shadow-sm" style={styles.aboutCard}>
                                    <h4 className="fw-bold mb-4" style={{ color: "#3b8132" }}>
                                        Why Choose Us?
                                    </h4>

                                    {whyChooseUs.map((item, index) => (
                                        <div
                                            key={index}
                                            className="mb-3 p-3 rounded-3"
                                            style={styles.testimonialCard}
                                        >
                                            <h6 className="fw-bold mb-2">{item.title}</h6>
                                            <p className="mb-0" style={{ color: "#6b7280" }}>
                                                {item.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                <section id="reviews" className="py-5" style={styles.reviewSection}>
                    <div className="container">
                        <div className="text-center mb-2">
                            <p className="text-uppercase fw-semibold mb-2" style={{ color: '#3b8132', letterSpacing: '0.2em' }}>Customer Reviews</p>
                            <h2 className="display-6 fw-bold mb-1">What our customers say about our software</h2>
                        </div>
                        <div className="d-flex justify-content-center px-3">
                            <div
                                className="w-100"
                                style={{ maxWidth: '760px' }}
                                onMouseEnter={() => setIsReviewHovered(true)}
                                onMouseLeave={() => setIsReviewHovered(false)}
                            >
                                <div className={`review-card ${reviewFade ? 'review-active' : 'review-inactive'}`}>
                                    {/* <div style={{ fontSize: '3.5rem', lineHeight: 1, color: '#d5f1d0', marginBottom: '1rem' }}>
                                        “
                                    </div> */}
                                    <p className="fw-semibold" style={{ fontSize: '1.15rem', color: '#15390f', lineHeight: 1.55, marginBottom: '1.5rem', marginLeft: 'auto', marginRight: 'auto', maxWidth: '680px' }}>
                                        {reviews[activeReviewIndex].review}
                                    </p>
                                    <div className="d-flex justify-content-center gap-2 mb-3" style={{ fontSize: '1.1rem' }}>
                                        {Array.from({ length: reviews[activeReviewIndex].rating }).map((_, index) => (
                                            <span key={index} style={{ color: '#3b8132' }}>★</span>
                                        ))}
                                    </div>
                                    <div style={{ color: '#18391a', fontWeight: 700, fontSize: '1rem' }}>
                                        {reviews[activeReviewIndex].name}
                                    </div>
                                    <div style={{ color: '#4b5563', fontSize: '0.95rem' }}>
                                        {reviews[activeReviewIndex].shop}
                                    </div>
                                </div>
                                <div className="d-flex justify-content-center gap-2 mt-0">
                                    {reviews.map((_, index) => {
                                        const isActive = index === activeReviewIndex;
                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => setActiveReviewIndex(index)}
                                                className={`review-dot${isActive ? ' active' : ''}`}
                                                aria-label={`Show review ${index + 1}`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-5">
                    <div className="container">
                        <div className="text-center mb-5">
                            <p className="text-uppercase fw-semibold mb-2" style={{ color: '#3b8132', letterSpacing: '0.2em' }}>FAQ</p>
                            <h2 className="display-6 fw-bold mb-3">Common questions</h2>
                        </div>
                        <div className="accordion" id="faqAccordion">
                            {faqs.map((faq, index) => (
                                <div className="accordion-item border-0 shadow-sm rounded-4 mb-3" key={faq.question}>
                                    <h2 className="accordion-header" id={`heading-${index}`}>
                                        <button className="accordion-button collapsed rounded-4" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${index}`} aria-expanded="false" aria-controls={`collapse-${index}`}>
                                            {faq.question}
                                        </button>
                                    </h2>
                                    <div id={`collapse-${index}`} className="accordion-collapse collapse" aria-labelledby={`heading-${index}`} data-bs-parent="#faqAccordion">
                                        <div className="accordion-body" style={{ color: '#6b7280' }}>{faq.answer}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="contact" className="py-5" style={styles.sectionAlt}>
                    <div className="container">
                        <div className="row g-5 align-items-start">
                            <div className="col-lg-5">
                                <p className="text-uppercase fw-semibold mb-2" style={{ color: '#3b8132', letterSpacing: '0.2em' }}>Contact</p>
                                <h2 className="display-6 fw-bold mb-3">Let’s connect</h2>
                                <p style={{ color: '#6b7280' }}>Reach out for a demo, support, or product guidance.</p>
                                <div className="mt-4">
                                    <p className="mb-2"><strong>Email:</strong> tnsevagan.vle@gmail.com</p>
                                    <p className="mb-2"><strong>Phone:</strong> +91 9789683106</p>
                                    <p className="mb-2"><strong>Address:</strong> Trichy, Tamil Nadu, India</p>
                                </div>
                            </div>
                            <div className="col-lg-7">
                                <form className="rounded-4 p-4 shadow-sm" style={styles.contactCard} ref={formRef} onSubmit={handleContactSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Name</label>
                                            <input className="form-control" name="name" placeholder="Your name" value={contactForm.name} onChange={handleContactChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Email</label>
                                            <input className="form-control" name="email" placeholder="Your email" value={contactForm.email} onChange={handleContactChange} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Message</label>
                                            <textarea className="form-control" name="message" rows="4" placeholder="How can we help?" value={contactForm.message} onChange={handleContactChange}></textarea>
                                        </div>
                                        {contactError && <div className="col-12"><div className="alert alert-danger py-2">{contactError}</div></div>}
                                        {contactSuccess && <div className="col-12"><div className="alert alert-success py-2">{contactSuccess}</div></div>}
                                        <div className="col-12">
                                            <button className="btn btn-success rounded-pill px-4" type="submit" disabled={contactSubmitting}>
                                                {contactSubmitting ? 'Sending...' : 'Send Message'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>


            {selectedImageIndex !== null && activeGalleryImages.length > 0 && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', zIndex: 2000, padding: '20px' }}
                    onClick={() => setSelectedImageIndex(null)}
                >
                    <div
                        className="position-relative rounded-4 overflow-hidden shadow-lg"
                        style={{ maxWidth: '980px', width: '100%', backgroundColor: '#fff' }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="btn btn-light position-absolute top-0 end-0 m-3 rounded-circle"
                            style={{ zIndex: 2, width: '42px', height: '42px' }}
                            onClick={() => setSelectedImageIndex(null)}
                        >
                            ×
                        </button>
                        <img
                            src={activeGalleryImages[selectedImageIndex].src}
                            alt="Module screenshot"
                            style={{ width: '100%', maxHeight: '78vh', objectFit: 'contain', display: 'block' }}
                        />
                        <div className="d-flex justify-content-between align-items-center px-3 py-3" style={{ backgroundColor: '#fff' }}>
                            <button type="button" className="btn btn-outline-secondary" onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? activeGalleryImages.length - 1 : prev - 1))}>
                                Previous
                            </button>
                            <div style={{ color: '#4b5563', fontSize: '0.95rem' }}>
                                {selectedImageIndex + 1} / {activeGalleryImages.length}
                            </div>
                            <button type="button" className="btn btn-success" onClick={() => setSelectedImageIndex((prev) => (prev + 1) % activeGalleryImages.length)}>
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="py-4 border-top" style={{ background: '#f8fbf7' }}>
                <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <div style={{ color: '#6b7280' }}>© 2026 e-Sevai. All rights reserved.</div>
                    <div className="d-flex flex-wrap gap-3">
                        <a href="#home" className="text-decoration-none" style={{ color: '#3b8132' }}>Home</a>
                        <a href="#features" className="text-decoration-none" style={{ color: '#3b8132' }}>Features</a>
                        <a href="#pricing" className="text-decoration-none" style={{ color: '#3b8132' }}>Pricing</a>
                        <a href="#contact" className="text-decoration-none" style={{ color: '#3b8132' }}>Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const styles = {
    page: {
        background: 'linear-gradient(180deg, #f7fcf5 0%, #ffffff 100%)',
        color: '#1f2937'
    },
    navbar: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(59,129,50,0.1)'
    },
    logo: {
        width: '46px',
        height: '46px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #3b8132, #6fbf58)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '800',
        fontSize: '20px',
        boxShadow: '0 12px 25px rgba(59,129,50,0.2)'
    },
    brandName: {
        fontWeight: '800',
        fontSize: '1.5rem',
        color: '#1f2937',
        lineHeight: 1.2
    },
    brandSub: {
        fontSize: '0.8rem',
        color: '#6b7280'
    },
    navLink: {
        color: '#374151',
        fontWeight: '600'
    },
    badge: {
        backgroundColor: 'rgba(237, 245, 236, 0.71)',
        color: '#2d7024',
        fontWeight: 700,
        border: '1px solid rgba(59,129,50,0.2)'
    },
    heroTitle: {
        color: '#18391a',
        lineHeight: 1.1,
        textShadow: `
    0 0 5px rgba(255, 255, 255, 0.8),
    0 0 7px rgba(255, 255, 255, 0.6),
    0 0 15px rgba(255, 255, 255, 0.4)
  `,
    },
    heroText: {
        color: '#fff',
        maxWidth: '650px'
    },
    heroSection: {
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        paddingTop: '100px',
        paddingBottom: '100px',
        position: 'relative',
        overflow: 'hidden',
        width: '100vw',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw'
    },
    heroSectionOverlay: {
        // position: 'absolute',
        // inset: 0,
        // background: 'linear-gradient(180deg, rgba(255,255,255,0.82) 10%, rgba(247,252,245,0.95) 100%)',
        // pointerEvents: 'none'
        position: 'absolute',
        inset: 0,
        background: 'rgba(255, 255, 255, 0.08)', // optional transparent overlay
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)', // Safari support
        pointerEvents: 'none',
    },
    heroSectionContent: {
        position: 'relative',
        zIndex: 2
    },
    heroGlow: {
        position: 'absolute',
        width: '420px',
        height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,129,50,0.24), transparent 70%)',
        top: '-80px',
        right: '-100px',
        pointerEvents: 'none'
    },
    heroShape: {
        position: 'absolute',
        width: '220px',
        height: '220px',
        borderRadius: '32px',
        background: 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.6)',
        top: '80px',
        left: '-40px',
        pointerEvents: 'none'
    },
    heroCard: {
        background: 'rgba(255,255,255,0.82)',
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: '0 25px 50px rgba(15, 23, 42, 0.08)'
    },
    trustBadge: {
        backgroundColor: 'rgba(255,255,255,0.85)',
        border: '1px solid rgba(59,129,50,0.12)',
        boxShadow: '0 8px 20px rgba(15,23,42,0.04)'
    },
    featureCard: {
        backgroundColor: 'white',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    sectionAlt: {
        backgroundColor: '#f8fbf7'
    },
    moduleCard: {
        backgroundColor: 'white',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    workflowStep: {
        backgroundColor: 'white',
        color: '#2f5d28',
        fontWeight: 700,
        border: '1px solid rgba(59,129,50,0.16)'
    },
    pricingCard: {
        backgroundColor: 'white',
        border: '1px solid rgba(59,129,50,0.12)'
    },
    aboutCard: {
        backgroundColor: 'white',
        border: '1px solid rgba(59,129,50,0.12)'
    },
    testimonialCard: {
        backgroundColor: '#f9fcf8',
        border: '1px solid rgba(59,129,50,0.08)'
    },
    reviewSection: {
        background: 'linear-gradient(180deg, #f5fbf3 0%, #f8faf5 100%)'
    },
    contactCard: {
        backgroundColor: 'white',
        border: '1px solid rgba(59,129,50,0.14)'
    },
    authCard: {
        backgroundColor: 'white',
        border: '1px solid rgba(59,129,50,0.1)'
    },
    tabContent: {
        position: 'relative'
    }
};

export default LandingPage;
