import React from 'react';
import { FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';

const FloatingContact = () => {
  return (
    <>
      <style>{`
        @keyframes floatingPulse {
          0% { box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
          50% { box-shadow: 0 4px 25px rgba(0,0,0,0.35); }
          100% { box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        }
        .floating-contact-icon {
          position: fixed;
          left: 24px;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 24px;
          cursor: pointer;
          z-index: 9999;
          text-decoration: none;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          animation: floatingPulse 2s ease-in-out infinite;
        }
        .floating-contact-icon:hover {
          transform: scale(1.15);
          box-shadow: 0 6px 30px rgba(0,0,0,0.4);
          color: #fff;
        }
        .floating-contact-whatsapp {
          bottom: 90px;
          background: linear-gradient(135deg, #25d366, #128c7e);
        }
        .floating-contact-phone {
          bottom: 24px;
          background: linear-gradient(135deg, #4285f4, #1a73e8);
        }
      `}</style>

      <a
        href="https://wa.me/919789683106"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-contact-icon floating-contact-whatsapp"
        title="Chat on WhatsApp"
      >
        <FaWhatsapp />
      </a>

      <a
        href="tel:+919789683106"
        className="floating-contact-icon floating-contact-phone"
        title="Call Us"
      >
        <FaPhoneAlt />
      </a>
    </>
  );
};

export default FloatingContact;
