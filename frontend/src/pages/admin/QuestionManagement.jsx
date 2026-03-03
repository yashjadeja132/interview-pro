import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon,
  FileText,
  Filter,
  CheckCircle,
  XCircle,
  Edit2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import api from "../../Api/axiosInstance";
import QuestionModal from "./components/QuestionModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function QuestionManagement() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch positions on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/subject");
        const subjectsData = res.data.data;
        setSubjects(subjectsData);

        // Auto-select subject with max questions if none selected
        if (subjectsData && subjectsData.length > 0 && !selectedSubject) {
          const maxQuestionsSubject = subjectsData.reduce((prev, current) =>
            (prev.questionCount || 0) > (current.questionCount || 0) ? prev : current
          );
          if (maxQuestionsSubject) {
            setSelectedSubject(maxQuestionsSubject._id);
          }
        }
      } catch (err) {
        console.error("Failed to load positions", err);
        toast.error("Failed to load positions");
      }
    };
    fetchSubjects();
  }, []);

  // Fetch questions when position changes, page changes, or search term changes
  useEffect(() => {
    if (selectedSubject) {
      fetchQuestionsBySubject(selectedSubject, currentPage, searchTerm);
    } else {
      setQuestions([]);
      setFilteredQuestions([]);
    }
  }, [selectedSubject, currentPage, searchTerm, rowsPerPage]);

  // Reset page when subject or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubject, searchTerm]);

  // (Removed local filtering in favor of server-side filtering)

  const fetchQuestionsBySubject = async (subjectId, page = 1, search = "") => {
    setIsLoading(true);
    try {
      const res = await api.get(`/question/subject/${subjectId}`, {
        params: {
          page,
          limit: rowsPerPage,
          search
        }
      });
      if (res.data.success) {
        setQuestions(res.data.data);
        setFilteredQuestions(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setTotalQuestions(res.data.pagination.total);
      } else {
        // Fallback for older API or if format is different
        setQuestions(res.data);
        setFilteredQuestions(res.data);
      }
    } catch (err) {
      console.error("Failed to load questions", err);
      toast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = (questionId) => {
    setDeleteId(questionId);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/question/${deleteId}`);
      toast.success("Question deleted successfully");
      setDeleteId(null);
      if (selectedSubject) {
        fetchQuestionsBySubject(selectedSubject);
      }
    } catch (err) {
      console.error("Failed to delete question", err);
      toast.error("Failed to delete question");
    }
  };

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    setShowQuestionModal(true);
  };

  const handleViewQuestion = (question) => {
    setSelectedQuestion(question);
    setShowViewDialog(true);
  };

  const handleQuestionSuccess = () => {
    setShowQuestionModal(false);
    setSelectedQuestion(null);
    if (selectedSubject) {
      fetchQuestionsBySubject(selectedSubject);
    }
  };
  console.log(selectedSubject);

  return (
    <>
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Question Management</h1>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl">Organize and manage questions by subject for your interviews</p>
            <Button
              onClick={() => {
                setSelectedQuestion(null);
                setShowQuestionModal(true);
              }}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 w-full sm:w-auto mt-2 sm:mt-0"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Question
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                Select Subject
              </label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-primary h-11">
                  <SelectValue placeholder="Choose a subject to view questions" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  {subjects.map((subject) => (
                    <SelectItem key={subject._id} value={subject._id} className="dark:text-gray-200 dark:focus:bg-slate-700">
                      <div className="flex items-center justify-between w-[350px]">
                        <span className="truncate">{subject.name}</span>
                        <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0 h-4 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 shrink-0">
                          {subject.questionCount || 0}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                Search Questions
              </label>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors w-4 h-4" />
                <Input
                  placeholder="Search questions by text..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-primary"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table/Card Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-slate-500 font-medium italic">Loading questions...</p>
              </div>
            ) : filteredQuestions.length > 0 ? (
              <div className="flex flex-col">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <TableRow>
                        <TableHead className="w-16 px-6 py-4 text-left text-sm font-bold text-slate-700 dark:text-slate-300">#</TableHead>
                        <TableHead className="px-6 py-4 text-left text-sm font-bold text-slate-700 dark:text-slate-300">Question Content</TableHead>
                        <TableHead className="w-32 px-6 py-4 text-center text-sm font-bold text-slate-700 dark:text-slate-300">Options</TableHead>
                        <TableHead className="w-40 px-6 py-4 text-right text-sm font-bold text-slate-700 dark:text-slate-300 pr-8">Actions</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredQuestions.map((question, index) => (
                        <TableRow
                          key={question._id}
                          className="group border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <TableCell className="px-6 py-5 font-medium text-slate-400">
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </TableCell>
                          <TableCell className="px-6 py-5">
                            <div className="flex flex-col gap-2 max-w-2xl">
                              {question.questionText && (
                                <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed line-clamp-2">
                                  {question.questionText}
                                </p>
                              )}
                              {question.questionImage && (
                                <div className="inline-flex items-center gap-2 text-[10px] text-primary font-bold bg-primary/5 px-2 py-1 rounded w-fit">
                                  <ImageIcon className="w-3.5 h-3.5" /> IMAGE ATTACHED
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-5 text-center">
                            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 font-bold dark:text-white">
                              {question.options?.length || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-5 text-right pr-8">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                onClick={() => handleViewQuestion(question)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                onClick={() => handleEditQuestion(question)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => handleDeleteQuestion(question._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredQuestions.map((question, index) => (
                    <div key={question._id} className="p-4 bg-white dark:bg-slate-900/50 active:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold text-slate-400">
                          #{(currentPage - 1) * rowsPerPage + index + 1}
                        </span>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-600" onClick={() => handleViewQuestion(question)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" onClick={() => handleEditQuestion(question)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleDeleteQuestion(question._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {question.questionText && (
                          <p className="text-slate-900 dark:text-slate-100 text-sm font-medium leading-relaxed line-clamp-3">
                            {question.questionText}
                          </p>
                        )}
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800">
                            {question.options?.length || 0} OPTIONS
                          </Badge>
                          {question.questionImage && (
                            <div className="flex items-center gap-1.5 text-[10px] text-primary font-bold">
                              <ImageIcon className="w-3.5 h-3.5" /> IMAGE
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 dark:text-slate-400">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 text-slate-400">
                  <FileText className="w-8 h-8" />
                </div>
                <p className="font-medium">
                  {selectedSubject
                    ? "No questions found for this subject."
                    : "Please select a subject to view questions."}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredQuestions.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Showing {Math.min((currentPage - 1) * rowsPerPage + 1, totalQuestions)} to {Math.min(currentPage * rowsPerPage, totalQuestions)} of {totalQuestions} questions
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 p-0 ${currentPage === pageNum ? "bg-primary text-white" : "dark:bg-slate-800 dark:text-white dark:border-slate-700"}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Question Modal (Add/Edit) */}
      <QuestionModal
        isOpen={showQuestionModal}
        onClose={() => {
          setShowQuestionModal(false);
          setSelectedQuestion(null);
        }}
        initialData={selectedQuestion}
        defaultSubjectId={selectedSubject}
        subjects={subjects}
        onSuccess={handleQuestionSuccess}
      />

      {/* View Question Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:text-white">Question Details</DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-6">
              {/* Subject Badge */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Subject:</Label>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                  {selectedQuestion.subject?.name}
                </Badge>
              </div>

              {/* Question Content */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Question:</Label>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                  {selectedQuestion.questionImage && (
                    <div className="mb-4">
                      <img
                        src={selectedQuestion.questionImage}
                        alt="Question"
                        className="w-full max-h-64 object-contain rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="w-full h-32 bg-gray-100 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm" style={{ display: 'none' }}>
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                          <p>Image not available</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-gray-900 dark:text-white leading-relaxed">
                    {selectedQuestion.questionText || "No question text provided"}
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Answer Options:</Label>
                <div className="space-y-3">
                  {selectedQuestion.options?.map((option, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${option.isCorrect
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        : 'bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-700'
                        }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {option.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        )}
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Option {index + 1}
                        </span>
                        {option.isCorrect && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            Correct Answer
                          </Badge>
                        )}
                      </div>
                      <div className="ml-8">
                        {option.optionImage ? (
                          <div className="space-y-2">
                            <img
                              src={option.optionImage}
                              alt={`Option ${index + 1}`}
                              className="max-w-full h-auto rounded border border-gray-200 dark:border-slate-600"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div className="w-full h-24 bg-gray-100 dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm" style={{ display: 'none' }}>
                              <div className="text-center">
                                <ImageIcon className="w-6 h-6 mx-auto mb-1 text-gray-400 dark:text-gray-500" />
                                <p className="text-xs">Image not available</p>
                              </div>
                            </div>
                            {option.optionText && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{option.optionText}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {option.optionText || "No option text provided"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle className="text-xl font-semibold dark:text-white">Confirm Delete</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4 mt-4 text-slate-600 dark:text-slate-300">
            <p>Are you sure you want to delete this question? This action cannot be undone.</p>
          </div>
          <DialogFooter className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="dark:bg-slate-800 dark:text-white dark:border-slate-700">Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete Question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </>
  );
}

