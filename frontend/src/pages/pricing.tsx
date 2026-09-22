import './pricing.css';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { z } from 'zod';

// Define a Zod schema for validating payment details, including cardholder name, card number, expiry date, and CVV. Each field has specific validation rules to ensure correct input format.
const paymentSchema = z.object({
    cardholderName: z.string().trim().min(1, 'Cardholder name is required'),
    cardNumber: z.string().regex(/^\d{16}$/, 'Enter a valid 16-digit card number'),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Use MM/YY format').refine((date) => {
        const [month, year] = date.split('/').map(Number);
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100; // Get last two digits of the year
        const currentMonth = currentDate.getMonth() + 1; // Months are zero-indexed
        return year > currentYear || (year === currentYear && month >= currentMonth);
    }, 'Expiry date must be in the future'),
    cvv: z.string().regex(/^\d{3,4}$/, 'Enter a valid 3 or 4-digit CVV'),
});

// Infer the TypeScript type for payment details based on the Zod schema, allowing for type-safe handling of payment data throughout the component.
type PaymentDetails = z.infer<typeof paymentSchema>;

// The UpgradeModal component is responsible for rendering a modal dialog that allows users to upgrade their account to a premium plan. It handles user input for payment details, validates the input, and updates the user's plan in Firestore upon successful submission.
const UpgradeModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { user } = useAuth();
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [error, setError] = useState('');
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
        cardholderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
    });
    // The handlePaymentChange function updates the state of paymentDetails whenever the user modifies any of the input fields in the payment form. It takes the field name and new value as parameters and updates the corresponding property in the paymentDetails state.
    const handlePaymentChange = (field: keyof PaymentDetails, value: string) => {
        setPaymentDetails((current) => ({ ...current, [field]: value }));
    };
    // The handleUpgrade function is triggered when the user submits the payment form. It validates the payment details using the Zod schema, and if valid, updates the user's plan in Firestore to 'paid'. It also handles error states and provides feedback to the user through toast notifications.
    const handleUpgrade = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        const validation = paymentSchema.safeParse(paymentDetails);
        // If the validation fails, we set the error state to display the validation messages to the user and return early to prevent further processing.
        if (!validation.success) {
            setError(validation.error.issues.map((issue) => issue.message).join(' '));
            return;
        }
        // If the user is not logged in, we return early to prevent unauthorized access to the upgrade functionality.
        if (!user) return;
        setIsUpgrading(true);
        // We attempt to update the user's plan in Firestore to 'paid'. If successful, we show a success toast and close the modal. If an error occurs, we log it and set an error message for the user.
        try {
            await updateDoc(doc(db, 'users', user.uid), { plan: 'paid' });
            toast.success('Successfully upgraded to premium!');
            onClose();
        // If an error occurs during the upgrade process, we catch it, log it to the console for debugging, and set an error message to inform the user that the upgrade failed. Finally, we reset the isUpgrading state to false to allow further attempts.
        } catch (err) {
            console.error('Error upgrading plan:', err);
            setError('An error occurred while upgrading. Please try again.');
        } finally {
            setIsUpgrading(false);
        }
    };

    if (!isOpen) return null; // If the modal is not open, we return null to prevent rendering the modal content. This ensures that the modal is only displayed when the isOpen prop is true.

    return (
        <div className="modal-overlay">
            <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="upgrade-title">
                <h2 id="upgrade-title">Upgrade to Premium</h2>
                <p>Unlock advanced features for $9.99 per month.</p>
                {error && <p className="form-error" role="alert">{error}</p>}
                <form onSubmit={handleUpgrade} className="payment-form">
                    <label htmlFor="cardholder-name">Name on card</label>
                    <input
                        id="cardholder-name"
                        value={paymentDetails.cardholderName}
                        onChange={(event) => handlePaymentChange('cardholderName', event.target.value)}
                        autoComplete="cc-name"
                    />
                    <label htmlFor="card-number">Card number</label>
                    <input
                        id="card-number"
                        inputMode="numeric"
                        maxLength={16}
                        value={paymentDetails.cardNumber}
                        onChange={(event) => handlePaymentChange('cardNumber', event.target.value.replace(/\D/g, ''))}
                        autoComplete="cc-number"
                    />
                    <div className="payment-row">
                        <div>
                            <label htmlFor="expiry-date">Expiry (MM/YY)</label>
                            <input
                                id="expiry-date"
                                placeholder="MM/YY"
                                maxLength={5}
                                value={paymentDetails.expiryDate}
                                onChange={(event) => handlePaymentChange('expiryDate', event.target.value)}
                                autoComplete="cc-exp"
                            />
                        </div>
                        <div>
                            <label htmlFor="cvv">CVV</label>
                            <input
                                id="cvv"
                                inputMode="numeric"
                                maxLength={4}
                                value={paymentDetails.cvv}
                                onChange={(event) => handlePaymentChange('cvv', event.target.value.replace(/\D/g, ''))}
                                autoComplete="cc-csc"
                            />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" disabled={isUpgrading}>
                            {isUpgrading ? 'Processing...' : 'Pay $9.99'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// The PricingPage component displays the available subscription plans and handles user interactions for upgrading to the premium plan. It checks the user's authentication status and plan, and conditionally renders the UpgradeModal when the user chooses to upgrade.
export default function PricingPage() {
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const { user, plan, isAuthLoading, isPlanLoading } = useAuth();
    const navigate = useNavigate();

    // The handleUpgradeClick function is triggered when the user clicks the "Upgrade to Premium" button. It checks if the user is logged in, if they are already on the premium plan, or if they can proceed to open the upgrade modal. Depending on these conditions, it either navigates to the login page, shows an informational toast, or opens the upgrade modal.
    const handleUpgradeClick = () => {
        // If the user is not logged in, we navigate them to the login page to ensure they are authenticated before attempting to upgrade.
        if (!user) {
            navigate('/login');
        // If the user is already on the premium plan, we show an informational toast to let them know they don't need to upgrade again.
        } else if (plan === 'paid') {
            toast.info('You are already on the premium plan.');
        // If the user is logged in and not on the premium plan, we open the upgrade modal to allow them to enter their payment details and upgrade their account.
        } else {
            setIsUpgradeModalOpen(true);
        }
    };

    return (
        <main className="pricing">
            <header className="pricing-header">
                <p className="eyebrow">Choose your workspace</p>
                <h1>Plans that grow with your ideas.</h1>
                <p>Start with the essentials, then unlock deeper tools when your projects demand more.</p>
            </header>
            <section className="pricing-grid" aria-label="Available plans">
                <article className="pricing-card">
                    <p className="plan-label">For getting started</p>
                    <h2>Free</h2>
                    <p className="plan-price">$0 <span>/ forever</span></p>
                    <ul>
                        <li>Browse community articles</li>
                        <li>Save tutorials and resources</li>
                        <li>Ask questions to the community</li>
                    </ul>
                </article>
                <article className="pricing-card pricing-card-featured">
                    <p className="plan-label">For serious makers</p>
                    <h2>Premium</h2>
                    <p className="plan-price">$9.99 <span>/ month</span></p>
                    <ul>
                        <li>Everything in Free</li>
                        <li>Advanced learning features</li>
                        <li>Priority community support</li>
                    </ul>
                    <button onClick={handleUpgradeClick} disabled={isAuthLoading || isPlanLoading}>
                        {isAuthLoading || isPlanLoading ? 'Loading...' : 'Upgrade to Premium'}
                    </button>
                </article>
            </section>

            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
            />
        </main>
    );
}


 

