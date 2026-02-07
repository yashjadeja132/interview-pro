import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../Api/axiosInstance";
import CandidateResultCard from "../../components/CandidateResultCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy } from "lucide-react";
import { generateCandidateResultPDF, generatePDFFromHTML } from "../../utils/pdfGenerator";

export default function CandidateReportPage() {
    const { candidateId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [candidateData, setCandidateData] = useState(null);
    const [testResults, setTestResults] = useState([]);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    useEffect(() => {
        const fetchCandidateData = async () => {
            try {
                setLoading(true);
                // data returned is an array of test results for the candidate
                const { data } = await axiosInstance.get(`/test/${candidateId}`);

                if (data && data.length > 0) {
                    // Assuming we want the latest or first result. Logic from Monitoring page uses first result.
                    const result = data[0];

                    // Reconstruct candidate object to match what CandidateResultCard expects
                    // The API returns populated candidateId and positionId
                    const candidateInfo = {
                        candidateName: result.candidateId?.name || "Unknown Candidate",
                        candidateEmail: result.candidateId?.email || "No Email",
                        positionName: result.positionId?.name || "Unknown Position",
                        score: result.score,
                        timeTakenFormatted: result.timeTakenFormatted,
                        createdAt: result.createdAt,
                        isNagativeMarking: result.candidateId?.isNagativeMarking,
                        negativeMarkingValue: result.candidateId?.negativeMarkingValue
                    };
                    console.log('candidateInfo',candidateInfo)
                    setCandidateData(candidateInfo);
                    setTestResults(result.answers || []);
                } else {
                    setError("No test results found for this candidate.");
                }
            } catch (err) {
                console.error("Error fetching candidate report:", err);
                setError("Failed to load candidate report.");
            } finally {
                setLoading(false);
            }
        };

        if (candidateId) {
            fetchCandidateData();
        }
    }, [candidateId]);

    const handleDownloadPDF = async () => {
        if (!candidateData || testResults.length === 0) return;

        setIsGeneratingPDF(true);
        try {
            const pdf = await generateCandidateResultPDF(candidateData, testResults);
            const filename = `${candidateData.candidateName.replace(/\s+/g, '_')}_Assessment_Report.pdf`;
            pdf.save(filename);
        } catch (error) {
            console.error("Error generating PDF:", error);
            try {
                const filename = `${candidateData.candidateName.replace(/\s+/g, '_')}_Assessment_Report.pdf`;
                const pdf = await generatePDFFromHTML('candidate-result-pdf', filename);
                pdf.save(filename);
            } catch (fallbackError) {
                console.error("Fallback PDF generation failed:", fallbackError);
                alert("Failed to generate PDF.");
            }
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-600 dark:text-slate-400">Loading candidate report...</span>
                </div>
            </div>
        );
    }

    if (error || !candidateData) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="text-red-500 mb-4">{error || "Candidate not found"}</div>
                <Button onClick={() => navigate(-1)} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="mr-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                        >
                        </Button>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Assessment Report</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{candidateData.candidateName}</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <CandidateResultCard
                    candidateData={candidateData}
                    testResults={testResults}
                    onDownloadPDF={handleDownloadPDF}
                    onViewDetails={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                />
            </div>
        </div>
    );
}
