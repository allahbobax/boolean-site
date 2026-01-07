import React from 'react'

interface LogoutModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000]" 
      onClick={onCancel}
    >
      <div 
        className="bg-[#0a0a0a] rounded border border-[#222] min-w-[380px] max-w-[90%] md:min-w-[300px] md:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 bg-[#0a0a0a]">
          <p className="m-0 text-sm text-[#888] leading-relaxed">
            Вы уверены, что хотите выйти из аккаунта?
          </p>
        </div>
        <div className="px-5 py-4 flex gap-2.5 justify-end bg-[#0a0a0a] border-t border-[#222] max-md:flex-col-reverse">
          <button 
            className="px-5 py-2 rounded text-[13px] font-medium cursor-pointer transition-colors bg-transparent text-[#888] border border-[#333] hover:bg-[#1a1a1a] hover:text-white max-md:w-full"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button 
            className="px-5 py-2 rounded text-[13px] font-medium cursor-pointer transition-colors bg-white text-black border border-white hover:bg-[#ccc] hover:border-[#ccc] max-md:w-full"
            onClick={onConfirm}
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  )
}
