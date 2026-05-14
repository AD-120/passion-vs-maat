import { useState, useRef } from 'react';
import { TierList } from './components/TierList';
import { MAAT_CONFESSIONS, BUSHIDO_VIRTUES, DEFAULT_TIERS } from './constants';
import { TierListData } from './types';
import { Download, CheckCircle2, AlertCircle, Loader2, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { toPng } from 'html-to-image';

export default function App() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string } | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const [maatData, setMaatData] = useState<TierListData>({
    levels: DEFAULT_TIERS.map(t => ({ ...t, itemIds: [] })),
    unassignedItems: MAAT_CONFESSIONS.map(i => i.id),
  });

  const [bushidoData, setBushidoData] = useState<TierListData>({
    levels: DEFAULT_TIERS.map(t => ({ ...t, itemIds: [] })),
    unassignedItems: BUSHIDO_VIRTUES.map(i => i.id),
  });

  const handleExport = async (isShare = false) => {
    if (!exportRef.current) return;
    
    setIsExporting(true);
    setExportResult(null);

    try {
      // Small delay to ensure any transient UI states are settled
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(exportRef.current, {
        backgroundColor: '#FFFFFF',
        quality: 1,
        pixelRatio: 2, // Higher resolution
      });

      if (isShare && navigator.share) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `tier-list-${new Date().getTime()}.png`, { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'הדירוג שלי',
            text: 'בדקו את הדירוג שלי!',
          });
          setExportResult({ success: true, message: 'שותף בהצלחה!' });
          return;
        }
      }

      const link = document.createElement('a');
      link.download = `tier-list-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();

      setExportResult({ success: true, message: 'התמונה הורדה בהצלחה!' });
    } catch (error) {
      console.error('Export failed:', error);
      setExportResult({ success: false, message: 'שגיאה ביצירת התמונה.' });
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportResult(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light text-ink font-sans flex flex-col" dir="rtl">
      {/* High Density Header */}
      <header className="h-[50px] md:h-[60px] bg-white border-b border-border-light flex items-center justify-between px-4 md:px-6 shrink-0 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-border-light overflow-hidden bg-white flex items-center justify-center shrink-0">
             <img 
               src="/k3-logo.png" 
               alt="k3" 
               className="w-full h-full object-cover"
               onError={(e) => {
                 (e.target as HTMLImageElement).style.display = 'none';
               }}
             />
             <div className="bg-gold/10 w-full h-full flex items-center justify-center">
                <span className="text-xs font-bold text-gold">k³</span>
             </div>
          </div>
          <div className="flex flex-col text-right">
            <h1 className="font-serif text-lg md:text-xl text-[#0a0a0a] tracking-wider uppercase font-bold leading-tight">
              התשוקה לדירוג
            </h1>
            <span className="text-[10px] md:text-xs text-ink/60 font-bold">מסמך רשמי של k³</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-2 md:p-6 space-y-6 md:space-y-12 bg-bg-subtle">
        <div ref={exportRef} className="p-4 bg-white rounded-lg shadow-sm border border-border-light space-y-8 md:space-y-12">
          {/* Intro */}
          <div className="max-w-4xl mx-auto text-center space-y-1 md:space-y-4">
            <h2 className="text-2xl font-serif text-[#fb32ff] font-black">סיכום הדירוג האישי</h2>
            <p className="text-[10px] md:text-base text-ink/60 font-light leading-relaxed max-w-2xl mx-auto">
              S = הכי משמעותי | E = הכי פחות משמעותי
            </p>
          </div>

          {/* Ma'at Section */}
          <section className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-4">
              <span className="text-crimson font-black text-base md:text-lg">I.</span>
              <h2 className="text-base md:text-xl font-serif text-ink font-bold leading-tight">דרג עד כמה הצווים המוסריים פוגעים ביכולת שלך לממש את התשוקות שלך (מתוך 42 הצהרות המעת)</h2>
              <div className="h-[1px] flex-1 bg-border-light"></div>
            </div>
            <TierList 
              title="הצהרות המעת" 
              allItems={MAAT_CONFESSIONS} 
              data={maatData} 
              onChange={setMaatData} 
            />
          </section>

          {/* Bushido Section */}
          <section className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-4">
              <span className="text-crimson font-black text-base md:text-lg">II.</span>
              <h2 className="text-base md:text-xl font-serif text-ink font-bold leading-tight">דרג עד כמה אתה חושש שהתשוקות שלך יפגעו בתכונות חיוביות (מתוך קוד הבושידו)</h2>
              <div className="h-[1px] flex-1 bg-border-light"></div>
            </div>
            <TierList 
              title="עקרונות הבושידו" 
              allItems={BUSHIDO_VIRTUES} 
              data={bushidoData} 
              onChange={setBushidoData} 
            />
          </section>
        </div>
      </main>

      {/* Footer Utility Bar */}
      <footer className="h-auto bg-white border-t border-border-light flex flex-col md:flex-row items-center p-3 md:px-6 gap-3 md:gap-4 shrink-0 pb-safe shadow-sm">
        <div className="flex-1 flex flex-col md:flex-row gap-3 md:gap-4 justify-center md:justify-end w-full">
          <button
            onClick={() => handleExport(false)}
            disabled={isExporting}
            className={cn(
              "btn-export bg-bg-subtle hover:bg-border-light text-ink font-bold uppercase text-[10px] tracking-widest py-2.5 md:py-3 px-6 rounded-full transition-all border border-border-light disabled:opacity-50 flex items-center justify-center gap-2 w-full md:w-auto",
              isExporting && "animate-pulse"
            )}
          >
            <Download className="w-4 h-4" />
            הורד תמונה
          </button>
          
          <button
            onClick={() => handleExport(true)}
            disabled={isExporting}
            className={cn(
              "btn-share bg-gold hover:bg-gold/90 text-white font-bold uppercase text-[10px] tracking-widest py-2.5 md:py-3 px-10 rounded-full transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 w-full md:w-auto",
              isExporting && "animate-pulse"
            )}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                מעבד...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                שתף לווטסאפ / אחר
              </>
            )}
          </button>
        </div>

        {exportResult && (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={cn(
                "fixed bottom-20 left-4 right-4 md:absolute md:bottom-24 md:left-6 md:right-auto p-3 p-4 rounded-lg border shadow-2xl flex items-center gap-3 z-50",
                exportResult.success ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
              )}
            >
              {exportResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span className="text-sm font-medium">{exportResult.message}</span>
            </motion.div>
          </AnimatePresence>
        )}
      </footer>
    </div>
  );
}
