import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="min-h-screen bg-indian-lightGreen">
      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-indian-green mb-6">
            Spot. Report. Resolve.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Help keep your community clean and safe by reporting environmental issues and civic problems.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-indian-green hover:bg-green-800 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors shadow-lg"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started"}
            </button>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="border-2 border-indian-green text-indian-green font-semibold py-3 px-8 rounded-lg text-lg transition-colors hover:bg-indian-green hover:text-white inline-block"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-indian-green mb-4">How It Works</h2>
            <p className="text-gray-600">Simple steps to make your community better</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 text-center border-2 border-indian-lightGreen">
              <div className="w-16 h-16 bg-indian-lightGreen rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="text-xl font-semibold text-indian-green mb-2">1. Spot an Issue</h3>
              <p className="text-gray-600">Find problems like potholes, garbage, or broken infrastructure in your area.</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center border-2 border-indian-lightGreen">
              <div className="w-16 h-16 bg-indian-lightGreen rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-indian-green mb-2">2. Report It</h3>
              <p className="text-gray-600">Take a photo, add details, and submit your report through our easy-to-use app.</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center border-2 border-indian-lightGreen">
              <div className="w-16 h-16 bg-indian-lightGreen rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold text-indian-green mb-2">3. Track Progress</h3>
              <p className="text-gray-600">Monitor your report's status and get notified when the issue gets resolved.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Issues Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-indian-green mb-4">Recent Community Issues</h2>
            <p className="text-gray-600">See what others are reporting in your area</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-indian-lightGreen">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">In Progress</span>
                <span className="text-sm text-gray-500">2 days ago</span>
              </div>
              <h4 className="font-semibold text-indian-green mb-2">Pothole on Main St</h4>
              <p className="text-gray-600 text-sm mb-4">Large pothole causing traffic issues near the market area</p>
              <div className="flex items-center text-sm text-gray-500">
                <span>📍 1.2 km away</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-indian-lightGreen">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Resolved</span>
                <span className="text-sm text-gray-500">5 days ago</span>
              </div>
              <h4 className="font-semibold text-indian-green mb-2">Garbage Pile Up</h4>
              <p className="text-gray-600 text-sm mb-4">Trash accumulation in park area needs cleaning</p>
              <div className="flex items-center text-sm text-gray-500">
                <span>📍 0.8 km away</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-indian-lightGreen">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Submitted</span>
                <span className="text-sm text-gray-500">Today</span>
              </div>
              <h4 className="font-semibold text-indian-green mb-2">Broken Streetlight</h4>
              <p className="text-gray-600 text-sm mb-4">Streetlight not working on Oak Avenue</p>
              <div className="flex items-center text-sm text-gray-500">
                <span>📍 2.1 km away</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indian-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of citizens who are actively improving their communities one report at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-white text-indian-green font-semibold py-3 px-8 rounded-lg text-lg transition-colors hover:bg-gray-100"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started"}
            </button>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors hover:bg-white hover:text-indian-green"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
