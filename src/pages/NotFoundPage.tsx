import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
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
            {/* Background glow effect */}
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(29, 78, 216, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
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
                background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                zIndex: 1,
                letterSpacing: '-0.05em',
                filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.1))',
            }}>
                404
            </h1>

            <p style={{
                fontSize: '2rem',
                fontWeight: '500',
                marginTop: '1rem',
                marginBottom: '2rem',
                color: '#94a3b8',
                zIndex: 1,
            }}>
                Not Found
            </p>

            <button
                onClick={() => navigate('/')}
                style={{
                    padding: '12px 32px',
                    fontSize: '1.1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    zIndex: 1,
                    backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                Вернуться на главную
            </button>
        </div>
    );
};

export default NotFoundPage;
