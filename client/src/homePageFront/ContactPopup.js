import React from 'react';
import './homePageStyles/ContactPopup.css';

const ContactPopup = ({ freelancer, onClose }) => {
    if (!freelancer) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleCopyContact = (text, type) => {
        navigator.clipboard.writeText(text)
            .then(() => alert(`${type} copied to clipboard!`))
            .catch(() => alert(`Failed to copy ${type}`));
    };

    // Get payment method
    const getPaymentEmoji = (method) => {
        switch(method) {
            case 'Cash': return '💵';
            case 'GCash': return '📱';
            case 'Bank Transfer': return '🏦';
            default: return '💰';
        }
    };

    return (
        <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup-container">
                <button className="popup-close" onClick={onClose}>×</button>
                
                <div className="popup-header">
                    <img 
                        src={freelancer.profileimage || 'http://localhost:5000/assets/default-avatar.jpg'} 
                        alt={freelancer.name}
                        className="popup-avatar"
                    />
                    <div className="popup-title">
                        <h2>{freelancer.name}</h2>
                        <p>Click contact details to copy</p>
                    </div>
                </div>

                <div className="popup-content">
                    {/* First Row: Payment Methods */}
                    <div className="popup-row">
                        <h3 className="popup-row-title">
                            <span>💰</span> Accepted Payment Methods
                        </h3>
                        <div className="payment-methods-popup">
                            {freelancer.paymentMethods && freelancer.paymentMethods.length > 0 ? (
                                freelancer.paymentMethods.map((method, index) => (
                                    <span key={index} className="payment-method-popup-badge">
                                        {getPaymentEmoji(method)} {method}
                                    </span>
                                ))
                            ) : (
                                <p className="no-info">No payment methods specified</p>
                            )}
                        </div>
                    </div>

                    {/* Second Row: Contact Details */}
                    <div className="popup-row">
                        <h3 className="popup-row-title">
                            <span>📞</span> Contact Details
                        </h3>
                        <div className="contact-list">
                            {/* Facebook */}
                            {freelancer.contactInfo?.facebook && (
                                <div className="contact-item-popup">
                                    <div className="contact-item-left">
                                        <span className="contact-icon-popup">📘</span>
                                        <div className="contact-info">
                                            <span className="contact-label">Facebook</span>
                                            <span className="contact-value">{freelancer.contactInfo.facebook}</span>
                                        </div>
                                    </div>
                                    <button 
                                        className="copy-btn"
                                        onClick={() => handleCopyContact(freelancer.contactInfo.facebook, 'Facebook link')}
                                    >
                                        Copy
                                    </button>
                                </div>
                            )}

                            {/* Email */}
                            {freelancer.contactInfo?.email && (
                                <div className="contact-item-popup">
                                    <div className="contact-item-left">
                                        <span className="contact-icon-popup">📧</span>
                                        <div className="contact-info">
                                            <span className="contact-label">Email</span>
                                            <span className="contact-value">{freelancer.contactInfo.email}</span>
                                        </div>
                                    </div>
                                    <div className="contact-actions">
                                        <a href={`mailto:${freelancer.contactInfo.email}`} className="action-btn-small">
                                            Send
                                        </a>
                                        <button 
                                            className="copy-btn"
                                            onClick={() => handleCopyContact(freelancer.contactInfo.email, 'Email')}
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Phone */}
                            {freelancer.contactInfo?.phone && (
                                <div className="contact-item-popup">
                                    <div className="contact-item-left">
                                        <span className="contact-icon-popup">📞</span>
                                        <div className="contact-info">
                                            <span className="contact-label">Phone</span>
                                            <span className="contact-value">{freelancer.contactInfo.phone}</span>
                                        </div>
                                    </div>
                                    <div className="contact-actions">
                                        <a href={`tel:${freelancer.contactInfo.phone}`} className="action-btn-small">
                                            Call
                                        </a>
                                        <button 
                                            className="copy-btn"
                                            onClick={() => handleCopyContact(freelancer.contactInfo.phone, 'Phone number')}
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Other Contact */}
                            {freelancer.contactInfo?.other && (
                                <div className="contact-item-popup">
                                    <div className="contact-item-left">
                                        <span className="contact-icon-popup">💬</span>
                                        <div className="contact-info">
                                            <span className="contact-label">Other</span>
                                            <span className="contact-value">{freelancer.contactInfo.other}</span>
                                        </div>
                                    </div>
                                    <button 
                                        className="copy-btn"
                                        onClick={() => handleCopyContact(freelancer.contactInfo.other, 'Contact info')}
                                    >
                                        Copy
                                    </button>
                                </div>
                            )}

                            {/* No contact info */}
                            {!freelancer.contactInfo?.facebook && 
                             !freelancer.contactInfo?.email && 
                             !freelancer.contactInfo?.phone && 
                             !freelancer.contactInfo?.other && (
                                <p className="no-info">No contact information available</p>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="popup-footer">
                    <p>
                        <span>📌</span> 
                        Contact the freelancer directly to discuss your project details and payment.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ContactPopup;