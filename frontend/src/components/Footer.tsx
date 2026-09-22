import './Footer.css'
import { FooterColumn, type FooterColumnProps } from "./FooterColumn";
import { SiFacebook, SiInstagram, SiX } from "@icons-pack/react-simple-icons"
import { subscribe } from '../api/subscribe';
import { useState } from 'react';

const footers: FooterColumnProps[] = [
    {
        title: "Explore",
        links: ["Home", "Questions", "Articles", "Tutorials"],
    },
    {
        title: "Support",
        links: ["FAQs", "Help", "Contact Us"],
    },
]

export function Footer() {
    const [inFlight, setInFlight] = useState(false);
    const [email, setEmail] = useState('');
    const [result, setResult] = useState<subscribeResult | null>(null);
    return (
        <footer className='site-footer'>
            <div className ="signup-bar">
                <h2>Sign up for our newsletter</h2>
                <div className="email-input">
                    <input 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />            
                    <button onClick={async () => {
                        setResult(null); // Clear previous result
                        setInFlight(true);
                        const result = await subscribe(email);
                        setInFlight(false);
                        setResult(result);
                    }} disabled={inFlight}>
                        {inFlight ? 'Subscribing...' : 'Subscribe'}
                    </button>
                    {result && <p style={{ color: result.ok ? 'green' : 'red' }}>{result.message}</p>}
                </div>
            </div>
            <div className="footer-columns">
            {footers.map((column) => (
                <FooterColumn key={column.title} {...column} />
            ))}
            <FooterColumn title="Stay Connected">
                <SiFacebook /> <SiInstagram /> <SiX />
            </FooterColumn>
            </div>
            <div className ="bottom-bar">
                <p>DEV@Deakin 2022</p>
                <p>Privacy Policy / Terms / Code of Conduct</p>
            </div>
        </footer>
    )
}
export type subscribeResult = {
    message: string;
    ok: boolean; // Add ok property to indicate success or failure
};
export default Footer