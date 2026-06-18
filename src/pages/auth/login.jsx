import { useState } from "react";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  HomeIcon,
  HomeModernIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export default function Login() {
  const [selectedRole, setSelectedRole] = useState("student");
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [linkRole, setLinkRole] = useState("student");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">

      <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm border">

        {/* Header */}
        <div className="border-b px-8 py-5 flex items-center gap-4">

          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <HomeIcon className="w-5 h-5 text-blue-700" />
          </div>

          <h1 className="text-3xl font-bold text-black" style={{ color: "#000000" }}>
            HomeFind SU
          </h1>

        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center py-12 px-8">

          {/* House Icon Box */}
          <div className="w-32 h-32 bg-blue-100 rounded-3xl flex items-center justify-center mb-8">
            <HomeModernIcon className="w-14 h-14 text-blue-700" />

          </div>

          {/* Title */}
          <h2 className="text-5xl font-bold text-center leading-tight text-black" style={{ color: "#000000" }}>
            Find your home
            <br />
            near Strathmore
          </h2>

          

          {/* Form */}
          <div className="w-full max-w-2xl">

            <label className="block text-gray-600 mb-2">
              Email address
            </label>

            <div className="w-full border border-gray-300 rounded-2xl px-4 py-4 flex items-center gap-3 mb-6 focus-within:border-blue-500">
              <EnvelopeIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="email"
                placeholder="you@strathmore.edu"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full outline-none text-lg bg-transparent"
              />
            </div>

            <label className="block text-gray-600 mb-2">
              I am a
            </label>

            <div className="grid grid-cols-2 gap-4 mb-6">

              <button
                type="button"
                onClick={() => setSelectedRole("student")}
                className={`py-5 rounded-2xl border-2 font-semibold text-xl transition ${
                  studentActive
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                    <span className="flex items-center justify-center gap-2">
                      <UserCircleIcon className="w-6 h-6" />
                      Student
                    </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("landlord")}
                className={`py-5 rounded-2xl border-2 font-semibold text-xl transition ${
                  landlordActive
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                    <span className="flex items-center justify-center gap-2">
                      <HomeModernIcon className="w-6 h-6" />
                      Landlord
                    </span>
              </button>

            </div>

            {/* Login Button */}
            <button
              type="button"
              onClick={handleSendLink}
              disabled={isSending}
              className="w-full bg-black text-white py-5 rounded-2xl text-xl font-semibold mb-8 hover:bg-gray-900 transition disabled:cursor-not-allowed disabled:bg-gray-700 flex items-center justify-center gap-3"
            >
              {isSending ? (
                <>
                  <CheckCircleIcon className="w-6 h-6 animate-pulse" />
                  Sending...
                </>
              ) : (
                <>
                  Send magic link
                  <ArrowRightIcon className="w-6 h-6" />
                </>
              )}
            </button>

            {/* Success Alert */}
            {linkSent && (
              <div className="bg-green-50 border border-green-500 rounded-2xl p-5">
                <h3 className="text-green-800 font-bold text-xl mb-1 flex items-center gap-2">
                  <CheckCircleIcon className="w-6 h-6" />
                  Link sent!
                </h3>

                <p className="text-green-700">
                  Check {email} for your link as a {linkRole}. Click the link in your inbox to open the correct dashboard. It expires in 15 min.
                </p>
              </div>
            )}

            {errorMessage && !linkSent && (
              <div className="bg-red-50 border border-red-500 rounded-2xl p-5 mt-4">
                <h3 className="text-red-800 font-bold text-xl mb-1 flex items-center gap-2">
                  <CheckCircleIcon className="w-6 h-6 text-red-700" />
                  Could not send link
                </h3>

                <p className="text-red-700">
                  {errorMessage}
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}