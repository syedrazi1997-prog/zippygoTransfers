import { ArrowLeft, Shield, FileText } from "lucide-react";

interface InfoPageProps {
  title: string;
  onBack: () => void;
  sections: { heading: string; body: string }[];
}

export function InfoPage({ title, onBack, sections }: InfoPageProps) {
  const Icon = title.toLowerCase().includes("cancellation") ? Shield : FileText;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-10 sm:px-8 sm:py-12">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 backdrop-blur-sm flex items-center justify-center">
                <Icon className="w-7 h-7 text-sky-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                <p className="text-slate-400 text-sm mt-1">Last updated: July 2026</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8 space-y-7">
            {sections.map((s) => (
              <div key={s.heading}>
                <h2 className="text-base font-semibold text-slate-900 mb-2">{s.heading}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
