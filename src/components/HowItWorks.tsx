import { Search, CalendarCheck, CreditCard, Car, ShieldCheck, Clock, Globe, Headphones, BadgePercent } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Search & Compare",
      description: "Enter your route and dates. We compare hundreds of providers to find the best options.",
    },
    {
      icon: CalendarCheck,
      title: "Choose Your Vehicle",
      description: "Pick from economy sedans to luxury Mercedes, SUVs, vans, and minibuses. All with transparent pricing.",
    },
    {
      icon: CreditCard,
      title: "Pay Securely",
      description: "Checkout in minutes with Razorpay. Pay in your local currency with free cancellation up to 24h.",
    },
    {
      icon: Car,
      title: "Travel in Comfort",
      description: "Meet your driver at the airport or your doorstep. Sit back and enjoy a stress-free journey.",
    },
  ];

  const features = [
    { icon: Globe, title: "180+ Countries", description: "Worldwide coverage at 900+ airports" },
    { icon: ShieldCheck, title: "Secure Payments", description: "Bank-grade encryption with Razorpay" },
    { icon: Clock, title: "24/7 Support", description: "Round-the-clock customer service" },
    { icon: BadgePercent, title: "Best Price Guarantee", description: "Found it cheaper? We'll match it" },
    { icon: Headphones, title: "Multi-Currency", description: "Pay in 12+ currencies worldwide" },
    { icon: Car, title: "Free Cancellation", description: "Cancel up to 24h before pickup" },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold tracking-wide uppercase mb-3">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Book in 4 Easy Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg hover:border-sky-200 transition-all duration-300 h-full">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20 mb-4">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-slate-300" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-slate-900">Why Choose ZippyGo?</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-5 rounded-xl bg-white border border-slate-200 hover:border-sky-200 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{f.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
