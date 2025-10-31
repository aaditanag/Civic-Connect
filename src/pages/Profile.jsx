import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { issueService } from "../services/issueService";

const Profile = () => {
  const { user } = useAuth();
  const [userReports, setUserReports] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        const response = await issueService.getUserReports();
        setUserReports(response.issues);
        setStatistics(response.statistics);
      } catch (error) {
        console.error('Error fetching user reports:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserReports();
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
      case 'inProgress': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'closed': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-indian-lightGreen py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indian-lightGreen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-2 border-indian-green">
          <h1 className="text-3xl font-bold text-indian-green mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account and track your reports</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-indian-saffron">
              <div className="text-center">
                <div className="w-24 h-24 bg-indian-lightGreen rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-indian-green">
                  <span className="text-3xl text-indian-green font-bold">RK</span>
                </div>
                <h2 className="text-xl font-bold text-indian-green">{user?.name || 'User'}</h2>
                <p className="text-gray-600">{user?.email || ''}</p>
                <p className="text-gray-500 mt-2">Delhi, India</p>
                <p className="text-gray-500">Joined {user ? new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}</p>
                
                <button className="w-full mt-4 bg-indian-green hover:bg-green-800 text-white py-2 px-4 rounded-lg transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-6 border-2 border-indian-green">
              <h3 className="text-lg font-semibold text-indian-green mb-4">Activity Summary</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-indian-lightGreen rounded-lg border border-indian-green">
                  <div className="text-2xl font-bold text-indian-green">{statistics.total}</div>
                  <div className="text-sm text-gray-600">Reports</div>
                </div>

                <div className="text-center p-4 bg-green-100 rounded-lg border border-green-300">
                  <div className="text-2xl font-bold text-green-800">{statistics.resolved}</div>
                  <div className="text-sm text-gray-600">Resolved</div>
                </div>

                <div className="text-center p-4 bg-yellow-100 rounded-lg border border-yellow-300">
                  <div className="text-2xl font-bold text-yellow-800">{statistics.inProgress}</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>

                <div className="text-center p-4 bg-blue-100 rounded-lg border border-blue-300">
                  <div className="text-2xl font-bold text-blue-800">{statistics.pending}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Reports */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-indian-green">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-indian-green">My Reports</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-indian-lightGreen text-indian-green rounded-lg text-sm border border-indian-green">All</button>
                  <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm border border-blue-300">Open</button>
                  <button className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm border border-green-300">Resolved</button>
                </div>
              </div>

              {/* Report List */}
              <div className="space-y-4">
                {userReports.length > 0 ? (
                  userReports.map((report) => (
                    <div key={report._id} className="flex items-center justify-between p-4 border-2 border-indian-lightGreen rounded-lg">
                      <div>
                        <h4 className="font-semibold text-indian-green">{report.title}</h4>
                        <p className="text-sm text-gray-600">
                          {report.location?.address || 'Location not specified'} • {formatDate(report.createdAt)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(report.status)}`}>
                        {report.status === 'inProgress' ? 'In Progress' :
                         report.status === 'pending' ? 'Pending' :
                         report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No reports found. Start by reporting an issue!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;