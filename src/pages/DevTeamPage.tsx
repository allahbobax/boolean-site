import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import DecorativeElements from '../components/DecorativeElements'
import React, { useState, useEffect } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { MdDesignServices, MdDns } from 'react-icons/md'
import { FaCode, FaServer, FaPlay, FaBug, FaCheckCircle, FaTh, FaUserSecret } from 'react-icons/fa'
import '../styles/home/index.css'
import '../styles/animations/keyframes.css'
import '../styles/animations/effects.css'
import '../styles/animations/hover.css'
import '../styles/animations/scroll.css'
import '../styles/dev-team/DevTeamPage.css'
import '../styles/dev-team/DevTeamPageStyles.css'

interface TeamMember {
  name: string
  role: string
  avatar: string
  skills: { name: string; icon: React.ReactNode }[]
  isSecret?: boolean
  noBorder?: boolean
  isFeatured?: boolean
}

function DevTeamPage() {
  const { t } = useTranslation()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  useEffect(() => {
    // Устанавливаем данные команды с использованием переводов
    const translatedTeamMembers: TeamMember[] = [
      {
        name: t.devteam.members.nihmadev.name,
        role: t.devteam.members.nihmadev.role,
        avatar: '/324728hd48724g7982dg348i73g43248i24gr83d7g263er726478ed427e3.jpg',
        skills: [
          { 
            name: t.devteam.skills.frontend,
            icon: <FaCode size={14} />
          },
          {
            name: t.devteam.skills.backend,
            icon: <FaServer size={14} />
          },
          {
            name: t.devteam.skills.webDesign,
            icon: <MdDesignServices size={14} />
          },
          {
            name: t.devteam.skills.launcherDev,
            icon: <FaPlay size={14} />
          },
          {
            name: t.devteam.skills.serverManagement,
            icon: <MdDns size={14} />
          }
        ],
        noBorder: true
      },
      {
        name: t.devteam.members.dkdajw.name,
        role: t.devteam.members.dkdajw.role,
        avatar: '/234442323232.jpg',
        skills: [
          { name: t.devteam.skills.cheatDevelopment, icon: <FaCode size={14} /> },
          { name: t.devteam.skills.testing, icon: <FaBug size={14} /> },
          { name: t.devteam.skills.qualityAssurance, icon: <FaCheckCircle size={14} /> },
          { name: t.devteam.skills.serverArchitecture, icon: <FaTh size={14} /> }
        ],
        noBorder: true
      },
      {
        name: t.devteam.members.killer.name,
        role: t.devteam.members.killer.role,
        avatar: '/122321.jpg',
        skills: [
          { name: t.devteam.skills.testing, icon: <FaBug size={14} /> },
          { name: t.devteam.skills.qualityAssurance, icon: <FaCheckCircle size={14} /> },
          { name: t.devteam.skills.bugHunting, icon: <FaBug size={14} /> },
          { name: t.devteam.skills.betaTesting, icon: <FaPlay size={14} /> },
          { name: t.devteam.skills.stressTesting, icon: <FaServer size={14} /> }
        ],
        noBorder: true,
        isFeatured: true
      }
    ]
    setTeamMembers(translatedTeamMembers)
  }, [t])

  return (
    <div className="home-page">
      <DecorativeElements />
      <Navigation />
      
      <main className="dev-team-page">
        <div className="container">
          <div className="team-grid">
            {teamMembers.map((member: TeamMember, index: number) => (
              <div 
                key={index}
                className={`team-card ${member.isSecret ? 'team-card-secret' : ''} ${member.isFeatured ? 'team-card-featured' : ''}`}
              >
                <div className="member-avatar">
                  {member.isSecret ? (
                    <div className="secret-avatar">
                      <FaUserSecret size={60} />
                    </div>
                  ) : (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className={`member-avatar-img ${member.noBorder ? 'member-avatar-no-border' : ''}`}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        return false
                      }}
                      onDragStart={(e) => {
                        e.preventDefault()
                        return false
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        return false
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        // Если аватар не загрузился, используем заглушку
                        target.src = `https://ui-avatars.com/api/?name=${member.name}&background=ff6b35&color=fff&size=120`
                      }}
                    />
                  )}
                </div>
                
                <h3 className="member-name">
                  {member.name}
                </h3>
                
                <p className="member-role">
                  {member.role}
                </p>
                
                <div className="member-skills">
                  {member.skills.map((skill: { name: string; icon: React.ReactNode }, skillIndex: number) => (
                    <React.Fragment key={skillIndex}>
                      <div className="skill-tag">
                        {skill.icon}
                        {skill.name}
                      </div>
                      {skillIndex < member.skills.length - 1 && (
                        <span className="skill-divider">|</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default DevTeamPage
