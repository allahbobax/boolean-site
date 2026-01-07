import { ReactNode } from 'react';

interface SubNavItem {
    id: string;
    label: string;
    icon?: ReactNode;
}

interface AdminSubNavProps {
    items: SubNavItem[];
    activeId: string;
    onChange: (id: string) => void;
}

export function AdminSubNav({ items, activeId, onChange }: AdminSubNavProps) {
    return (
        <div className="admin-sub-nav">
            {items.map((item) => (
                <button
                    key={item.id}
                    className={`sub-nav-item ${activeId === item.id ? 'active' : ''}`}
                    onClick={() => onChange(item.id)}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </button>
            ))}
        </div>
    );
}
