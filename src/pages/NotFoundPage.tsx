import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import '../styles/auth/AuthBase.css';
import '../styles/auth/AuthForm.css';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-fullscreen">
            <Navigation />

            <div className="auth-page-centered">
                <div className="auth-box-clean" style={{ textAlign: 'center' }}>
                    <div className="auth-header">
                        <div className="auth-logo-small">
                        </div>
                        <div className="auth-title-clean">
                            <h1 style={{
                                fontSize: '6rem',
                                fontWeight: '700',
                                margin: '0 0 8px 0',
                                lineHeight: 1,
                                letterSpacing: '-0.02em',
                            }}>
                                404
                            </h1>
                            <h2 style={{ marginBottom: '8px' }}>Page Not Found</h2>
                            <p>The page you're looking for doesn't exist or has been moved.</p>
                        </div>
                    </div>

                    <div className="auth-form-clean" style={{ marginTop: '24px' }}>
                        <button
                            onClick={() => navigate('/')}
                            className="btn-primary-clean"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
