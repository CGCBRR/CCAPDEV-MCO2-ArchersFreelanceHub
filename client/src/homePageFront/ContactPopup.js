import React, { useEffect, useState } from "react";
import axios from "axios";
import './homePageStyles/ContactPopup.css';
import './homePageStyles/comments.css';

const ContactPopup = ({ freelancer, onClose, currentUser }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Create axios instance with base URL
    const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Fetch comments when popup opens
    useEffect(() => {
        const fetchComments = async () => {
            // Get the freelancer ID - your data has freelancer.freelancerId
            const freelancerId = freelancer?.freelancerId || freelancer?._id;
            
            if (!freelancerId) {
                console.error('No freelancer ID found');
                setError('Unable to load comments');
                return;
            }

            try {
                console.log('Fetching comments for freelancerId:', freelancerId);
                const response = await axios.get(`http://localhost:5000/api/comments/${freelancerId}`);
                setComments(response.data);
                setError('');
            } catch (err) {
                console.error('Error fetching comments:', err.response?.data || err.message);
                setError('Failed to load comments');
            }
        };

        if (freelancer) {
            fetchComments();
        }
    }, [freelancer]); // Re-fetch when freelancer changes

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

    // Submit comment
    const handleSubmitComment = async (e) => {
        e.preventDefault();

        // Debug logging
        console.log('Full freelancer object:', freelancer);
        console.log('Freelancer freelancerId:', freelancer?.freelancerId);
        console.log('Freelancer name:', freelancer?.name);
        console.log('Full user object:', currentUser);
        console.log('user _id:', currentUser._id);
        console.log('user id:', currentUser.id);

        if (!newComment.trim()) {
            setError('Please enter a comment');
            return;
        }
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await api.post('/comments', {
                freelancerid: freelancer.freelancerId,
                freelancername: freelancer.name,
                usercomment: newComment,
                userrating: rating,
                username: currentUser?.username || 'Guest User',
                userid: currentUser.id
            });

            if (response.status === 200 || response.status === 201) {
                // Reset form
                setNewComment('');
                setRating(0);
                setHoverRating(0);

                // Refresh comments list
                const refreshResponse = await axios.get(`http://localhost:5000/api/comments/${freelancer.freelancerId}`);
                setComments(refreshResponse.data);
                alert('Comment posted successfully!');
            }
        } catch (err) {
            console.error('Error posting comment:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Error posting comment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate average rating
    const averageRating = comments.length > 0 
        ? (comments.reduce((sum, comment) => sum + comment.userrating, 0) / comments.length).toFixed(1)
        : 0;

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    if (!freelancer) return null;

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
                            <span>💰</span> Accepted Payment
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
                
                {/* Third Row: Comments Section */}
                <div className="popup-row">
                    <h3 className="popup-row-title">
                        <span>💬</span> Reviews & Ratings (for this user)
                    </h3>
                    
                    {/* Rating Summary */}
                    {comments.length > 0 && (
                        <div className="rating-summary">
                            <div className="average-rating">
                                <span className="rating-stars">
                                    {'★'.repeat(Math.round(averageRating))}
                                    {'☆'.repeat(5 - Math.round(averageRating))}
                                </span>
                                <span className="rating-number">{averageRating}</span>
                            </div>
                            <div className="total-reviews">
                                Based on {comments.length} review{comments.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    )}

                    {/* Comment Form */}
                    <form onSubmit={handleSubmitComment} className="comment-form">
                        <div className="rating-input">
                            <label>Your Rating:</label>
                            <div className="stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <textarea
                            className="comment-textarea"
                            placeholder="Write your review or comment here..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows="3"
                        />
                        
                        {error && <div className="comment-error">{error}</div>}
                        
                        <button 
                            type="submit" 
                            className="submit-comment-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </form>

                    {/* Comments List */}
                    <div className="comments-list">
                        {comments.length > 0 ? (
                            comments.map((comment, index) => (
                                <div key={comment._id || index} className="comment-item">
                                    <div className="comment-header">
                                        <div className="comment-user-info">
                                            <img src={comment.useprofileid?.profileimage || 'http://localhost:5000/assets/default-avatar.jpg'} alt={comment.userid.username} className="comment-avatar" />
                                            <span className="comment-user-name">{comment.username}</span>
                                        </div>
                                        <div className="comment-rating">
                                            {'★'.repeat(comment.userrating)}
                                            {'☆'.repeat(5 - comment.userrating)}
                                        </div>
                                    </div>
                                    <div className="comment-date">
                                        {formatDate(comment.createdAt)}
                                    </div>
                                    <div className="comment-text">
                                        {comment.usercomment}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-comments">
                                <p>No reviews yet. Be the first to leave a review!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPopup;