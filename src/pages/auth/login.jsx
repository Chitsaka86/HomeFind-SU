import { useState } from "react";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  HomeIcon,
  HomeModernIcon,
  UserCircleIcon,
  AcademicCapIcon,
  BuildingOffice2Icon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

export default function Login() {
  const [selectedRole, setSelectedRole] = useState("student");
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [linkRole, setLinkRole] = useState("student");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const studentActive = selectedRole === "student";
  const landlordActive = selectedRole === "landlord";

  const handleSendLink = async () => {
    if (!email.trim()) {
      setLinkSent(false);
      setErrorMessage("Please enter your email address.");
      return;
    }

    setIsSending(true);
    setErrorMessage("");
    setLinkSent(false);

    try {
      const response = await fetch("/api/magic-link/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          role: selectedRole,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : { message: await response.text() };

      if (!response.ok) {
        throw new Error(data?.message || "Unable to send magic link right now.");
      }

      setLinkRole(selectedRole);
      setLinkSent(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to send magic link right now.");
    } finally {
      setIsSending(false);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How do I find a property?",
      a: "Simply search by location, filter by your preferences (price, amenities, property type), and browse through the available properties near campus. You can also view properties on the interactive map."
    },
    {
      q: "Is this service free?",
      a: "Yes! HomeFind SU is completely free for both students and landlords. There are no hidden fees or charges."
    },
    {
      q: "How do I book a viewing?",
      a: "Click 'View details' on any property, select your preferred date and time from the calendar, and submit your booking request. The landlord will confirm your viewing."
    },
    {
      q: "How do I list my property as a landlord?",
      a: "Create a landlord account, click 'Add property' from your dashboard, fill in the property details, upload images, and submit for review. Once approved, your property will be visible to students."
    },
    {
      q: "What happens after I book a viewing?",
      a: "The landlord will receive your request and confirm the viewing. You'll receive a confirmation notification and can communicate with the landlord through the platform."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HomeFind SU</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-black hover:text-blue-600 transition cursor-pointer font-medium"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-black hover:text-blue-600 transition cursor-pointer font-medium"
              >
                How it works
              </button>
              <button 
                onClick={() => scrollToSection('faq')}
                className="text-black hover:text-blue-600 transition cursor-pointer font-medium"
              >
                FAQ
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Login */}
      <div className="min-h-screen flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-blue-700 text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Strathmore University
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-black">Find your perfect</span>
                <br />
                <span className="text-blue-600">home near campus</span>
              </h1>

              <p className="text-lg text-gray-700 max-w-lg font-medium">
                Discover the best accommodation options near Strathmore University.
                Connect with landlords, view properties, and book viewings—all in one place.
              </p>

              

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-2xl font-bold text-gray-900">500+</p>
                  <p className="text-sm text-gray-600 font-medium">Properties Listed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">200+</p>
                  <p className="text-sm text-gray-600 font-medium">Happy Students</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">50+</p>
                  <p className="text-sm text-gray-600 font-medium">Landlords</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                  Verified Listings
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MagnifyingGlassIcon className="w-5 h-5 text-blue-600" />
                  Easy Search
                </div>
              </div>
            </div>

            {/* Right Side - Login Card */}
            <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/80 border-2 border-blue-50/80 p-7 transform transition-all duration-300 hover:shadow-blue-200/90 hover:-translate-y-1">
                <div className="text-center mb-5">
                  <h2 style={{ color: '#000000', fontSize: '1.25rem', fontWeight: 'bold' }}>
                    Get Started
                  </h2>
                  <p className="text-sm text-gray-600 font-medium mt-1">Sign in to access your dashboard</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        placeholder="you@strathmore.edu"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-gray-900 placeholder-gray-400 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      I am a
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRole("student")}
                        className={`py-2.5 rounded-xl border-2 font-semibold text-xs transition-all duration-200 ${
                          studentActive
                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md shadow-blue-100/50"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <AcademicCapIcon className={`w-4 h-4 ${studentActive ? "text-blue-600" : "text-gray-500"}`} />
                          Student
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRole("landlord")}
                        className={`py-2.5 rounded-xl border-2 font-semibold text-xs transition-all duration-200 ${
                          landlordActive
                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md shadow-blue-100/50"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <BuildingOffice2Icon className={`w-4 h-4 ${landlordActive ? "text-blue-600" : "text-gray-500"}`} />
                          Landlord
                        </div>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendLink}
                    disabled={isSending}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                      isSending
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gray-900 hover:bg-gray-800 active:scale-[0.98] shadow-lg shadow-gray-200"
                    }`}
                  >
                    {isSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send magic link
                        <ArrowRightIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {linkSent && (
                    <div className="p-3 bg-green-50 border-2 border-green-200 rounded-xl animate-fadeIn">
                      <div className="flex items-start gap-2.5">
                        <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-green-800 text-xs">Link sent!</h3>
                          <p className="text-green-700 text-xs mt-0.5">
                            Check <strong>{email}</strong> for your link as a <strong>{linkRole}</strong>. Expires in 15 min.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {errorMessage && !linkSent && (
                    <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl animate-fadeIn">
                      <div className="flex items-start gap-2.5">
                        <span className="text-red-600 text-sm flex-shrink-0">⚠️</span>
                        <div>
                          <h3 className="font-semibold text-red-800 text-xs">Could not send link</h3>
                          <p className="text-red-700 text-xs mt-0.5">{errorMessage}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 style={{ color: '#000000', fontSize: '2.25rem', fontWeight: 'bold' }}>
              Features
            </h2>
            <p className="text-gray-600 mt-2">Everything you need to find your perfect home</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <MagnifyingGlassIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Smart Search</h3>
              <p className="text-gray-600 text-sm mt-2">Filter properties by location, price, amenities, and availability.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <MapPinIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Interactive Maps</h3>
              <p className="text-gray-600 text-sm mt-2">See exactly where properties are located with our interactive map.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Easy Booking</h3>
              <p className="text-gray-600 text-sm mt-2">Schedule viewings and book properties directly through the platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 style={{ color: '#000000', fontSize: '2.25rem', fontWeight: 'bold' }}>
              How It Works
            </h2>
            <p className="text-gray-600 mt-2">Find your dream home in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900">Search</h3>
              <p className="text-gray-600 text-sm mt-1">Browse available properties near campus</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900">View</h3>
              <p className="text-gray-600 text-sm mt-1">Explore property details, photos, and maps</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900">Book</h3>
              <p className="text-gray-600 text-sm mt-1">Schedule a viewing or book your favorite unit</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                <span className="text-white text-2xl font-bold">4</span>
              </div>
              <h3 className="font-semibold text-gray-900">Move In</h3>
              <p className="text-gray-600 text-sm mt-1">Confirm your booking and settle into your new home</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 style={{ color: '#000000', fontSize: '2.25rem', fontWeight: 'bold' }}>
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 mt-2">Quick answers to common questions</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 pt-1 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  Enhanced Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4">HomeFind SU</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Students</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Find Properties</a></li>
                <li><a href="#" className="hover:text-white transition">Book Viewings</a></li>
                <li><a href="#" className="hover:text-white transition">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition">Student Guide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Landlords</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">List Your Property</a></li>
                <li><a href="#" className="hover:text-white transition">Manage Bookings</a></li>
                <li><a href="#" className="hover:text-white transition">Landlord Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  
                  <a href="mailto:support@homefindsu.com" className="hover:text-white transition">support@homefindsu.com</a>
                </li>
                <li className="flex items-center gap-2">
                  
                  <span>+254 700 123 456</span>
                </li>
                <li className="flex items-center gap-2">
                  
                  <span>Strathmore University, Nairobi</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
            <p>© 2026 HomeFind SU. All rights reserved. Made with ❤️ for Strathmore University students.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}