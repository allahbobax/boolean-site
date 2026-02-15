import { useState } from 'react';
import { TurnstileWidget } from './TurnstileWidget';
import '../styles/CloudflareCheck.css';

interface CloudflareCheckProps {
  onVerified: () => void;
}

export const CloudflareCheck = ({ onVerified }: CloudflareCheckProps) => {
  const [status, setStatus] = useState<'checking' | 'verifying' | 'completed'>('verifying');

  const handleVerify = (_token: string) => {
    setStatus('completed');
    onVerified();
  };

  return (
    <div className="cloudflare-check-container">
      <div className="cf-content">
        <div className="cf-spinner"></div>
        
        <h1 className="cf-title">
          {status === 'checking' && 'Checking your browser before accessing the site.'}
          {status === 'verifying' && 'Please verify you are a human'}
          {status === 'completed' && 'Success! Redirecting...'}
        </h1>
        
        <p className="cf-subtitle">
          {status === 'checking' && 'This process is automatic. Your browser will redirect to your requested content shortly.'}
          {status === 'verifying' && 'Please complete the security check to proceed.'}
          {status === 'completed' && 'Verification complete. One moment please...'}
        </p>

        {status === 'verifying' && (
          <div className="cf-turnstile">
            <TurnstileWidget onVerify={handleVerify} theme="auto" />
          </div>
        )}

        <div className="cf-footer">
          <div className="cf-footer-line">Ray ID: {Math.random().toString(16).substring(2, 18)}</div>
        </div>
      </div>
    </div>
  );
};
