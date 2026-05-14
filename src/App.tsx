import { useState } from 'react';
import { TierList } from './components/TierList';
import { MAAT_CONFESSIONS, BUSHIDO_VIRTUES, DEFAULT_TIERS } from './constants';
import { TierListData } from './types';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [userName, setUserName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  const [maatData, setMaatData] = useState<TierListData>({
    levels: DEFAULT_TIERS.map(t => ({ ...t, itemIds: [] })),
    unassignedItems: MAAT_CONFESSIONS.map(i => i.id),
  });

  const [bushidoData, setBushidoData] = useState<TierListData>({
    levels: DEFAULT_TIERS.map(t => ({ ...t, itemIds: [] })),
    unassignedItems: BUSHIDO_VIRTUES.map(i => i.id),
  });

  const handleSend = async () => {
    if (!userName.trim()) {
      setSendResult({ success: false, message: 'נא להזין שם כדי להמשיך' });
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      const response = await fetch('/api/send-tier-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          maatLevels: maatData.levels.map(l => ({
            name: l.name,
            color: l.color,
            items: l.itemIds.map(id => MAAT_CONFESSIONS.find(i => i.id === id)?.name)
          })),
          bushidoLevels: bushidoData.levels.map(l => ({
            name: l.name,
            color: l.color,
            items: l.itemIds.map(id => BUSHIDO_VIRTUES.find(i => i.id === id)?.name)
          }))
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSendResult({ success: true, message: result.message || 'הדירוג נשלח בהצלחה ל-avrahaaam@gmail.com!' });
      } else {
        setSendResult({ success: false, message: 'שגיאה בשליחת המייל. בדוק את הגדרות השרת.' });
      }
    } catch (error) {
      setSendResult({ success: false, message: 'שגיאה בתקשורת עם השרת.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-ink font-sans flex flex-col" dir="rtl">
      {/* High Density Header */}
      <header className="h-[50px] md:h-[60px] bg-gradient-to-r from-card-dark to-bg-dark border-b-2 border-gold flex items-center justify-between px-4 md:px-6 shrink-0">
        <h1 className="font-serif text-lg md:text-2xl text-gold tracking-wider uppercase">
          התשוקה לדירוג
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-3 md:p-6 space-y-8 md:space-y-12 bg-[radial-gradient(circle_at_center,#151515_0%,#0C0C0C_100%)]">
        {/* Intro */}
        <div className="max-w-4xl mx-auto text-center space-y-2 md:space-y-4">
          <p className="text-xs md:text-base text-ink/80 font-light leading-relaxed max-w-2xl mx-auto">
            דרג את ההצהרות לפי הרלוונטיות - A הכי גבוה ו-E הכי נמוך. S הוא Super, כלומר ממש גבוה.
          </p>
        </div>

        {/* Ma'at Section */}
        <section className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-4">
            <span className="text-crimson font-black text-base md:text-lg">I.</span>
            <h2 className="text-base md:text-xl font-serif text-gold uppercase tracking-normal md:tracking-widest leading-tight">42 הצהרות המעת - דרג עד כמה ההצהרה מתנגשת עם התשוקות שלך</h2>
            <div className="h-[1px] flex-1 bg-[#333]"></div>
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
            <h2 className="text-base md:text-xl font-serif text-gold uppercase tracking-normal md:tracking-widest leading-tight">קוד הבושידו - דרג במה מהערכים עשויות לפגוע התשוקות שלך</h2>
            <div className="h-[1px] flex-1 bg-[#333]"></div>
          </div>
          <TierList 
            title="עקרונות הבושידו" 
            allItems={BUSHIDO_VIRTUES} 
            data={bushidoData} 
            onChange={setBushidoData} 
          />
        </section>
      </main>

      {/* Footer Utility Bar */}
      <footer className="h-auto bg-[#111] border-t border-gold flex flex-col md:flex-row items-center p-3 md:px-6 gap-3 md:gap-8 shrink-0 pb-safe">
        <div className="flex flex-col gap-1 w-full md:w-auto">
          <label className="text-[10px] text-gold uppercase font-bold tracking-tight">שם המשתמש</label>
          <input
            type="text"
            placeholder="הכנס את שמך..."
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="bg-[#222] border border-[#444] text-white text-sm px-3 py-1.5 md:py-2 rounded-sm focus:outline-none focus:border-gold transition-colors w-full md:w-64"
          />
        </div>

        <div className="flex-1 flex justify-center md:justify-end w-full">
          <button
            onClick={handleSend}
            disabled={isSending || !userName.trim()}
            className={cn(
              "btn-send bg-gold hover:bg-gold/80 active:bg-gold/90 text-black font-bold uppercase text-xs tracking-widest py-2.5 md:py-3 px-6 md:px-8 rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full md:w-auto",
              isSending && "animate-pulse"
            )}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                מעבד...
              </>
            ) : (
              <>
                שלח את הדירוג
              </>
            )}
          </button>
        </div>

        {sendResult && (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={cn(
                "fixed bottom-20 left-4 right-4 md:absolute md:bottom-24 md:left-6 md:right-auto p-3 p-4 rounded-sm border shadow-2xl flex items-center gap-3 z-50",
                sendResult.success ? "bg-green-950/90 text-green-400 border-green-500/50" : "bg-red-950/90 text-red-400 border-red-500/50"
              )}
            >
              {sendResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span className="text-sm font-medium">{sendResult.message}</span>
            </motion.div>
          </AnimatePresence>
        )}
      </footer>
    </div>
  );
}
