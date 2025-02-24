import React from "react";
import { useSalesmanSummary } from "../api/apiHooks";
import SalesmanSummaryTable from "../components/graphs/analytics/SalesmanSummaryTable";
import { LocationAnalyticResponse, LocationAnalytic } from "../types/salesmanResponse";

const SalesmanSummary: React.FC = () => {
  const { data: salesmanSummaryData, isLoading: isLoadingSalesmanSummary, error } = useSalesmanSummary();

  if (isLoadingSalesmanSummary) {
    return <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-xl font-semibold text-red-600">Error loading data</div>;
  }

  const transformedData = (salesmanSummaryData?.data ?? []).map((item: LocationAnalytic) => ({
    ...item,
    inTime: item.inTime ?? 0, // Ensure inTime is always a number
    visitedDistance: item.visitedDistance ?? 0, // Ensure visitedDistance is always a number
    accuracyDistance: item.accuracyDistance ?? 0, // Use actual accuracyDistance value or default to 0
  }));

  return (
    <div className="p-6 md:p-10 bg-gray-100 min-h-screen">
      {/* Heading with Icon */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 flex justify-center items-center gap-3">
          <span className="bg-gradient-to-r from-blue-700 via-blue-500 to-blue-300 text-transparent bg-clip-text drop-shadow-lg">
            Salesman Summary
          </span>
        </h1>
      </div>

      {/* Salesman Summary Table */}
      <div className="mt-8">
        <SalesmanSummaryTable data={transformedData} />
      </div>
    </div>
  );
};

export default SalesmanSummary;