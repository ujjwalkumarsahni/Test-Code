import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { toast } from "react-hot-toast";
import { schoolAPI } from "../../api/api.js";

const Schools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await schoolAPI.getSchools({ status: "active" });
      setSchools(response.data);
    } catch (error) {
      toast.error("Failed to load schools");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-[#D4EDDA] text-[#155724] border-[#C3E6CB]",
      inactive: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || "bg-gray-100"}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTrainerStatus = (school) => {
    const count = school.currentTrainers?.length || 0;
    const required = school.trainersRequired || 1;

    if (count === 0) return { text: "No Trainers", color: "text-[#E22213]" };
    if (count < required) return { text: "Shortage", color: "text-[#EA8E0A]" };
    return { text: "Adequate", color: "text-green-600" };
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-4">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#EA8E0A]/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="relative">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-4">Schools</h1>
                <p className="text-lg text-blue-200 mb-6">
                  All registered schools and their details
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-[#EA8E0A] text-sm font-medium mb-1">
                      Total Schools <span className="font-bold">{schools.length}</span>
                    </p>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schools Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#0B234A] border-t-[#EA8E0A] mb-6"></div>
              <p className="text-gray-700 text-lg font-medium">
                Loading schools...
              </p>
            </div>
          ) : schools.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No schools found
              </h3>
              <p className="text-gray-600">
                There are no schools in the system yet
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        School Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        City
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Contact Person
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Trainers
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schools.map((school) => {
                      const trainerStatus = getTrainerStatus(school);
                      return (
                        <tr key={school._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-[#0B234A]/10 rounded-lg flex items-center justify-center mr-3">
                                <Users className="w-5 h-5 text-[#0B234A]" />
                              </div>
                              <div>
                                <div className="font-bold text-[#0B234A]">
                                  {school.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {school.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-base font-semibold text-gray-900">
                              {school.city}
                            </div>
                            <div className="text-sm text-gray-500">
                              {school.state}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-base font-semibold text-gray-900">
                              {school.contactPersonName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {school.mobile}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-lg font-bold text-[#0B234A]">
                                {school.currentTrainers?.length || 0} /{" "}
                                {school.trainersRequired || 1}
                              </div>
                              <div className={`text-xs font-medium ${trainerStatus.color}`}>
                                {trainerStatus.text}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(school.status)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schools;