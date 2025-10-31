import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { issueService } from "../services/issueService";

const CitizenView = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    pending: 0
  });
  const [communityIssues, setCommunityIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user stats if logged in
        if (user) {
          const userResponse = await issueService.getUserReports();
          setUserStats(userResponse.statistics);
        }

        // Fetch all community issues
        const issuesResponse = await issueService.getIssues({ limit: 9, sort: '-createdAt' });
        setCommunityIssues(issuesResponse.issues || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'inProgress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleVote = async (issueId) => {
    if (!user) {
      alert('Please log in to vote on issues.');
      return;
    }

    try {
      await issueService.voteIssue(issueId);
      // Add to user's voted issues
      setUserVotes(prev => new Set([...prev, issueId]));
      // Refresh the issues list to show updated vote count
      const issuesResponse = await issueService.getIssues({ limit: 9, sort: '-createdAt' });
      setCommunityIssues(issuesResponse.issues || []);
    } catch (error) {
      console.error('Error voting on issue:', error);
      if (error.response?.status === 400) {
        alert('You have already voted on this issue.');
      } else {
        alert('Failed to vote on issue. Please try again.');
      }
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
          <Link
            to="/report"
            className="bg-indian-green hover:bg-green-800 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors shadow-lg inline-block"
          >
            Report an Issue
          </Link>
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

      {/* My Reports Preview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-indian-green mb-4">My Reports</h2>
            <p className="text-gray-600">Track the status of environmental issues you've reported</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-indian-lightGreen rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-indian-green">{userStats.total}</div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </div>
            <div className="bg-green-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-800">{userStats.resolved}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
            <div className="bg-yellow-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-800">{userStats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="bg-blue-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-800">{userStats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/profile"
              className="bg-indian-saffron hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-block"
            >
              View All Reports
            </Link>
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
            {communityIssues.length > 0 ? (
              communityIssues.map((issue) => (
                <div key={issue._id} className="bg-white rounded-xl shadow-md p-6 border-2 border-indian-lightGreen">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(issue.status)}`}>
                      {issue.status === 'inProgress' ? 'In Progress' :
                       issue.status === 'pending' ? 'Pending' :
                       issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">{formatDate(issue.createdAt)}</span>
                  </div>
                  <h4 className="font-semibold text-indian-green mb-2">{issue.title}</h4>
                  <p className="text-gray-600 text-sm mb-4">{issue.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>📍 {issue.location?.address || 'Location not specified'}</span>
                    <span>👍 {issue.votes || 0}</span>
                  </div>
                  <button
                    onClick={() => handleVote(issue._id)}
                    disabled={userVotes.has(issue._id)}
                    className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors ${
                      userVotes.has(issue._id)
                        ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                        : 'bg-indian-green hover:bg-green-800 text-white'
                    }`}
                  >
                    {userVotes.has(issue._id) ? 'Voted' : 'Upvote'}
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p>No recent issues found. Be the first to report an issue!</p>
              </div>
            )}
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
            <Link
              to="/register"
              className="bg-white text-indian-green font-semibold py-3 px-8 rounded-lg text-lg transition-colors hover:bg-gray-100"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors hover:bg-white hover:text-indian-green"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CitizenView;