import Footer from '../components/Footer'
import Navigation from '../components/Navigation'
import '../styles/legal/LegalPages.css'
import { useTranslation } from '../hooks/useTranslation'

export default function UserAgreementPage() {
  const { t } = useTranslation()
  const content = t.legal.userAgreement

  return (
    <div className="legal-page">
      <Navigation />
      <section className="features-section" style={{ paddingTop: '120px' }}>
        <div className="container">
          <div className="legal-intro">
            <h1>{content.title}</h1>
            <p>{content.subtitle}</p>
          </div>

          <div className="legal-content">
            {content.sections.map((section, idx) => (
              <div className="legal-section" key={idx}>
                <div className="legal-section-header">
                  <div className="legal-section-number">{idx + 1}</div>
                  <h2 className="legal-section-title">{section.title}</h2>
                </div>
                <div className="legal-section-content">
                  {section.paragraphs.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                  {section.list && (
                    <ul>
                      {section.list.map((item, iIdx) => (
                        <li key={iIdx}>
                          <strong>{item.title}</strong> {item.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
