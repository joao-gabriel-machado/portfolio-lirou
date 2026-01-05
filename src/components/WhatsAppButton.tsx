import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WhatsAppButton = () => {
    const phoneNumber = '5512987083178';
    const message = 'Olá! Vim pelo seu portfólio e gostaria de conversar.';

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
            <Button
                className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg hover:shadow-xl hover-lift transition-all duration-300 relative group overflow-visible"
                onClick={() => window.open(whatsappUrl, '_blank')}
                aria-label="Contato via WhatsApp"
            >
                <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping" />
                <Phone className="w-7 h-7 relative z-10" fill="currentColor" />

                <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-background border border-border rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    <p className="text-sm font-medium">Vamos conversar?</p>
                </div>
            </Button>
        </div>
    );
};

export default WhatsAppButton;
