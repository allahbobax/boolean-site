import React from 'react';
import { useNavigate } from 'react-router-dom';

const BadGatewayPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#000000',
            color: '#ffffff',
            fontFamily: '"Inter", sans-serif',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background glow effect - slightly red for error */}
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 0,
            }} />

            <h1 style={{
                fontSize: '12rem',
                fontWeight: '900',
                margin: 0,
                lineHeight: 1,
                background: 'linear-gradient(135deg, #fff 0%, #f87171 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                zIndex: 1,
                letterSpacing: '-0.05em',
                filter: 'drop-shadow(0 0 30px rgba(220, 38, 38, 0.2))',
            }}>
                502
            </h1>

            <p style={{
                fontSize: '2rem',
                fontWeight: '500',
                marginTop: '1rem',
                marginBottom: '2rem',
                color: '#fca5a5',
                zIndex: 1,
            }}>
                Bad Gateway
            </p>

            <div style={{
                display: 'flex',
                gap: '16px',
                zIndex: 1,
            }}>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '12px 32px',
                        fontSize: '1.1rem',
                        backgroundColor: '#dc2626',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#ef4444';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc2626';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    Обновить страницу
                </button>

                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '12px 32px',
                        fontSize: '1.1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backdropFilter: 'blur(10px)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    На главную
                </button>
            </div>
        </div>
    );
};

export default BadGatewayPage;
