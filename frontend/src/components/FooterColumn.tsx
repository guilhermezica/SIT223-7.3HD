import type { ReactNode } from 'react'
import './FooterColumn.css'

export type FooterColumnProps = {
    title: string,
    links?: string[]
    children?: ReactNode
}

export function FooterColumn({ title, links, children }: FooterColumnProps) {
    return (
        <div>
            <h3>{title}</h3>
            {links && ( //Logical AND short circuit to ensure if there are no links, don't render the list
                <ul>
                    {links.map((link) => (
                        <li key={link}>{link}</li>
                    ))}
                </ul>
            )}
            {children}
        </div>
    )
}