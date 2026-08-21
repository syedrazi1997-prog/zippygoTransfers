import { SearchWidget } from "./SearchWidget";
import type { SearchParams } from "../lib/types";
import { Star, Shield, Clock, Globe } from "lucide-react";

interface HeroProps {
  onSearch: (params: SearchParams) => void;
  defaultService?: "transfer" | "shuttle" | "car_hire" | "parking";
}

export function Hero({ onSearch, defaultService }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/28603501/pexels-photo-28603501.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Airport terminal"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
            <span className="text-sm text-white font-medium">
              Rated 4.9/5 by 250,000+ travelers worldwide
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            Your Journey,{" "}
            <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
              Simplified
            </span>
          </h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            Airport transfers, car hire, and parking in 180+ countries. Compare prices,
            book in minutes, and travel with confidence.
          </p>
        </div>

        <SearchWidget onSearch={onSearch} defaultService={defaultService} />

        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Globe, value: "180+", label: "Countries Covered" },
            { icon: Shield, value: "100%", label: "Secure Payments" },
            { icon: Clock, value: "24/7", label: "Customer Support" },
            { icon: Star, value: "4.9/5", label: "Customer Rating" },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10"
            >
              <stat.icon className="w-5 h-5 text-sky-400 flex-shrink-0" />
              <div>
                <p className="text-lg font-bold text-white leading-none">{stat.value}</p>
                <p className="text-xs text-slate-300 mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
