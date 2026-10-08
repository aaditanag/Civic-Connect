import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { issueService } from "../services/issueService";
import useGeolocation from "../hooks/useGeolocation";
import LocationMap from "../components/citizen/LocationMap";
import CurrentLocationMap from "../components/citizen/CurrentLocationMap";

const ReportIssue = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    urgency: "medium",
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const navigate = useNavigate();

  const { location: currentLocation, error: locationError, loading: locationLoading, getCurrentPosition } = useGeolocation();

  const categories = [
    "Potholes & Roads",
    "Street Lighting",
    "Garbage & Sanitation",
    "Water Supply",
    "Drainage Issues",
    "Parks & Public Spaces",
    "Traffic Signals",
    "Illegal Construction",
    "Other"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleUseCurrentLocation = () => {
    getCurrentPosition();
    setShowMap(true);
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      location: location.address
    }));
  };

  const categoryToDepartment = {
    "Potholes & Roads":       "Public Works",
    "Street Lighting":        "Electricity",
    "Garbage & Sanitation":   "Sanitation",
    "Water Supply":           "Water Department",
    "Drainage Issues":        "Water Department",
    "Parks & Public Spaces":  "Public Works",
    "Traffic Signals":        "Electricity",
    "Illegal Construction":   "Public Works",
    "Other":                  "Public Works"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const department = categoryToDepartment[formData.category] || "Public Works";
      const issueData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: { address: formData.location },
        urgency: formData.urgency,
        department
      };

      await issueService.createIssue(issueData);
      alert("Issue reported successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error reporting issue:", error);
      alert("Failed to report issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-bg font-outfit">
      {/* Page Header */}
      <div className="bg-civic-navy py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gold-line" />
          <h1 className="text-3xl font-black text-white">Report an Issue</h1>
          <p className="text-white/50 text-sm mt-1">Help improve your community by reporting civic issues</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Link to="/" className="text-civic-gold hover:text-civic-goldHover text-sm font-semibold transition-colors">← Back to Home</Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Issue Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-civic-navy mb-2">
                Issue Title <span className="text-civic-gold">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief description of the issue"
                className="input-civic"
                disabled={loading}
              />
            </div>

            {/* Category Selection */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-civic-navy mb-2">
                Category <span className="text-civic-gold">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="input-civic appearance-none cursor-pointer"
                disabled={loading}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-civic-navy mb-2">
                Description <span className="text-civic-gold">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Please provide detailed information about the issue..."
                className="input-civic resize-none"
                disabled={loading}
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-civic-navy mb-2">
                Location <span className="text-civic-gold">*</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Street address or landmark"
                  className="input-civic flex-1"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={loading || locationLoading}
                  className={`btn-secondary px-4 py-2.5 rounded-xl text-sm whitespace-nowrap ${
                    loading || locationLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {locationLoading ? 'Getting...' : '📍 My Location'}
                </button>
              </div>
              {locationError && (
                <p className="text-sm text-red-600 mt-1">{locationError}</p>
              )}
              {currentLocation && showMap && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Click on the map to select a more precise location:</p>
                  <LocationMap
                    location={currentLocation}
                    onLocationSelect={handleLocationSelect}
                  />
                </div>
              )}
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-semibold text-civic-navy mb-2">
                Urgency Level <span className="text-civic-gold">*</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[{value:'low',icon:'🟢',label:'Low',sub:'Minor issue'},{value:'medium',icon:'🟡',label:'Medium',sub:'Moderate'},{value:'high',icon:'🔴',label:'High',sub:'Emergency'}].map(opt => (
                  <label key={opt.value} className={`flex flex-col items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                    formData.urgency === opt.value
                      ? 'border-civic-gold bg-civic-gold/10 shadow-md'
                      : 'border-gray-200 hover:border-civic-gold/50'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input type="radio" name="urgency" value={opt.value} checked={formData.urgency === opt.value} onChange={handleInputChange} className="sr-only" disabled={loading} />
                    <span className="text-2xl mb-1">{opt.icon}</span>
                    <span className="text-sm font-bold text-civic-navy">{opt.label}</span>
                    <span className="text-xs text-gray-400">{opt.sub}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-civic-navy mb-2">
                Upload Photo <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="border-2 border-dashed border-gray-200 hover:border-civic-gold/50 rounded-2xl p-8 text-center transition-colors">
                {formData.image ? (
                  <div>
                    <img src={URL.createObjectURL(formData.image)} alt="Preview" className="mx-auto h-36 object-cover rounded-xl mb-3 shadow-md" />
                    <p className="text-sm text-gray-500 mb-2">{formData.image.name}</p>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: null }))} className="text-red-500 hover:text-red-600 text-sm font-semibold transition-colors" disabled={loading}>
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-civic-gold/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">📸</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">Drag & drop or click to upload</p>
                    <label htmlFor="image-upload" className={`btn-secondary text-sm cursor-pointer inline-block py-2 px-5 rounded-xl ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      Choose File
                    </label>
                    <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" disabled={loading} />
                    <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className={`btn-primary w-full py-3.5 rounded-xl text-base shadow-lg shadow-civic-gold/20 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Submitting report...
                  </span>
                ) : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>

        {/* Current Location Map */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
          <h3 className="text-lg font-bold text-civic-navy mb-1">📍 Your Current Location</h3>
          <p className="text-sm text-gray-400 mb-4">Click on the map to select your exact location for the issue report.</p>
          <CurrentLocationMap onLocationSelect={handleLocationSelect} />
        </div>

        {/* Additional Info */}
        <div className="bg-civic-navy rounded-2xl p-6 mt-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-civic-gold mb-4">What happens next?</h3>
          <div className="space-y-3">
            {['Your report will be reviewed by our team', 'It will be assigned to the relevant department', "You'll receive updates on the progress", 'The issue will be resolved as quickly as possible'].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-civic-gold text-civic-navy text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-white/70 text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;