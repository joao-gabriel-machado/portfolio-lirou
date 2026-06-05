import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import QuotePage from "./pages/QuotePage";
import NotFound from "./pages/NotFound";
import WhatsAppButton from "./components/WhatsAppButton";
import ScrollProgress from "./components/ScrollProgress";
import { LanguageProvider } from "./contexts/LanguageContext";

const App = () => (
  <LanguageProvider>
    <ScrollProgress />
    <WhatsAppButton />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/orcamento" element={<QuotePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </LanguageProvider>
);

export default App;
