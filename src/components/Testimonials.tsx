import { Star, Quote } from "lucide-react";

export function Testimonials() {
  const reviews = [
    {
      name: "Sarah Mitchell",
      location: "London, UK",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200",
      rating: 5,
      text: "Booked a transfer from Heathrow to central London. The driver was waiting at arrivals with a name sign, the Mercedes was immaculate, and we arrived at our hotel in 35 minutes. Flawless service.",
    },
    {
      name: "Rajesh Kumar",
      location: "Mumbai, India",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200",
      rating: 5,
      text: "Hired a car for a 3-day trip to Goa through ZippyGo. The booking process was smooth, paid in rupees, and the car was delivered to my hotel. Great prices compared to other platforms.",
    },
    {
      name: "Emily Johnson",
      location: "New York, USA",
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200",
      rating: 5,
      text: "Used the airport parking service at JFK for a week-long trip. Booked online, parked at the designated spot, and the shuttle had me at the terminal in 5 minutes. Will definitely use again.",
    },
    {
      name: "Ahmed Al-Rashid",
      location: "Dubai, UAE",
      avatar: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200",
      rating: 5,
      text: "The luxury transfer from Dubai Airport to Abu Dhabi was worth every dirham. Professional chauffeur, premium Mercedes S-Class, and the flight tracking meant they were there exactly when I landed.",
    },
    {
      name: "Yuki Tanaka",
      location: "Tokyo, Japan",
      avatar: "https://images.pexels.com/photos/2169434/pexels-photo-2169434.jpeg?auto=compress&cs=tinysrgb&w=200",
      rating: 5,
      text: "Excellent service from Narita to my hotel in Shinjuku. The driver was punctual, the van was spacious for our family of 6 with all our luggage, and the price was very reasonable. Highly recommend.",
    },
    {
      name: "Sophie Laurent",
      location: "Paris, France",
      avatar: "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=200",
      rating: 5,
      text: "I use ZippyGo for every business trip. The executive sedan option is perfect, the drivers are always professional, and being able to pay in euros with a corporate card makes expense reporting easy.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5 text-amber-400" fill="currentColor" />
            ))}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Trusted by 250,000+ Travelers
          </h2>
          <p className="mt-3 text-slate-500">Real reviews from real customers around the world</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-lg transition-all duration-300"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-slate-200" fill="currentColor" />
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400" fill="currentColor" />
                ))}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">{review.text}</p>
              <div className="flex items-center gap-3">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                  <p className="text-xs text-slate-400">{review.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
