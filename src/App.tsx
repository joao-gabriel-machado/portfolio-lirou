import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import QuotePage from "./pages/QuotePage";
import LinksPage from "./pages/LinksPage";
import CityPage from "./pages/CityPage";
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
        <Route path="/links" element={<LinksPage />} />
        <Route path="/cidade" element={<CityPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </LanguageProvider>
);

export default App;
