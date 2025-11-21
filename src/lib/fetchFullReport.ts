/**
 * Fetch all current (latest) reports
 */
export async function fetchAllReports() {
  try {
    const res = await fetch("/api/reports", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch reports");
    return await res.json();
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
}

/**
 * Fetch a full report with all related data
 * @param id Report ID
 */
export async function fetchFullReport(id: number | string) {
  try {
    const res = await fetch(`/api/reports/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch report ${id}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching report:", error);
    throw error;
  }
}

/**
 * Fetch report version history (past submissions)
 * @param id Report ID
 */
export async function fetchReportHistory(id: number | string) {
  try {
    const res = await fetch(`/api/reports/${id}/history`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch history for report ${id}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching history:", error);
    throw error;
  }
}
