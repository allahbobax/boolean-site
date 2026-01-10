import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import LogoWithHat from '../components/LogoWithHat';
import '../styles/auth/AuthBase.css';
import '../styles/auth/AuthForm.css';

const BadGatewayPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-fullscreen">
            <Navigation onLanguageChange={() => { }} />

            <div className="auth-page-centered">
                <div className="auth-box-clean" style={{ textAlign: 'center' }}>
                    <div className="auth-header">
                        <div className="auth-logo-small">
                            <LogoWithHat size={40} alt="Boolean Logo" />
                        </div>
                        <div className="auth-title-clean">
                            <h1 style={{
                                fontSize: '6rem',
                                fontWeight: '700',
                                margin: '0 0 8px 0',
                                lineHeight: 1,
                                letterSpacing: '-0.02em',
                            }}>
                                502
                            </h1>
                            <h2 style={{ marginBottom: '8px' }}>Bad Gateway</h2>
                            <p>The server is temporarily unavailable. Please try again later.</p>
                        </div>
                    </div>

                    <div className="auth-form-clean" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary-clean"
                        >
                            Refresh Page
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="btn-text-only"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BadGatewayPage;
