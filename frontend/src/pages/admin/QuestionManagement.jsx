import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  XCircle
} from "lucide-react";
import api from "../../Api/axiosInstance";
import CreateQuestion from "./CreateQuestion";
import EditQuestion from "./EditQuestion";

export default function QuestionManagement() {
  const [positions, setPositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  // Fetch positions on component mount
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await api.get("/position");
        setPositions(res.data.data);
      } catch (err) {
        console.error("Failed to load positions", err);
        toast.error("Failed to load positions");
      }
    };
    fetchPositions();
  }, []);

  // Fetch questions when position changes
  useEffect(() => {
    if (selectedPosition) {
      fetchQuestionsByPosition(selectedPosition);
    } else {
      setQuestions([]);
      setFilteredQuestions([]);
    }
  }, [selectedPosition]);

  // Filter questions based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredQuestions(questions);
    } else {
      const filtered = questions.filter(q =>
        q.questionText?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQuestions(filtered);
    }
  }, [searchTerm, questions]);

  const fetchQuestionsByPosition = async (positionId) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/question/position/${positionId}`);
      setQuestions(res.data);
      setFilteredQuestions(res.data);
    } catch (err) {
      console.error("Failed to load questions", err);
      toast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      try {
        await api.delete(`/question/${questionId}`);
        toast.success("Question deleted successfully");
        if (selectedPosition) {
          fetchQuestionsByPosition(selectedPosition);
        }
      } catch (err) {
        console.error("Failed to delete question", err);
        toast.error("Failed to delete question");
      }
    }
  };

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    setShowEditDialog(true);
  };

  const handleViewQuestion = (question) => {
    setSelectedQuestion(question);
    setShowViewDialog(true);
  };

  const handleQuestionCreated = () => {
    setShowCreateDialog(false);
    if (selectedPosition) {
      fetchQuestionsByPosition(selectedPosition);
    }
  };

  const handleQuestionUpdated = () => {
    setShowEditDialog(false);
    if (selectedPosition) {
      fetchQuestionsByPosition(selectedPosition);
    }
  };

  const getCorrectOption = (options) => {
    return options.find(opt => opt.isCorrect);
  };

  const renderQuestionCard = (question) => (
    <Card key={question._id} className="group border border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-900">
      <CardContent className="p-6">
        {/* Header with badges and actions */}
        {/* <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                {question.position?.name || "No Position"}
              </Badge>
              {question.questionImage && (
                <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                  <ImageIcon className="w-3 h-3 mr-1" />
                  Has Image
                </Badge>
              )}
              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-700">
                {question.options?.length || 0} options
              </Badge>
            </div>
          </div>
          <div className="flex gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewQuestion(question)}
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 dark:text-gray-300 dark:hover:bg-slate-800"
              title="View Question"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditQuestion(question)}
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 dark:text-gray-300 dark:hover:bg-slate-800"
              title="Edit Question"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteQuestion(question._id)}
              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              title="Delete Question"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div> */}

        {/* Question Content */}
        <div className="mb-4">
          {question.questionImage ? (
            <div className="mb-3">
              <img
                src={question.questionImage}
                alt="Question"
                className="w-full h-40 object-contain rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="w-full h-40 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm" style={{ display: 'none' }}>
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                  <p>Image not available</p>
                </div>
              </div>
            </div>
          ) : null}

         <h1 className="text-base font-semibold text-gray-900 dark:text-white mb-3 leading-relaxed border border-slate-300 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-gray-900 shadow-sm">
                   {question.questionText || "No question text provided"}
            </h1>

        </div>

        {/* Options */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Answer Options:</h4>
          <div className="space-y-2">
            {question.options?.slice(0, 3).map((option, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${option.isCorrect
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : 'bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-700'
                  }`}
              >
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${option.isCorrect ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'
                  }`}></div>
                <span className="flex-1 text-gray-800 dark:text-gray-200">
                  {option.optionText || "No option text"}
                </span>
                {option.isCorrect && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex-shrink-0">
                    Correct
                  </Badge>
                )}
              </div>
            ))}
            {question.options?.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                +{question.options.length - 3} more options
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Question Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Organize and manage questions by position for your interviews</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm text-gray-600 dark:text-gray-400">
              <div className="font-medium text-gray-900 dark:text-white">
                {positions.length} Position{positions.length !== 1 ? 's' : ''}
              </div>
              <div>Available</div>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>

              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">Create New Question</DialogTitle>
                </DialogHeader>
                <CreateQuestion onQuestionCreated={handleQuestionCreated} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                  Select Position
                </Label>
                <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                  <SelectTrigger className="h-11 border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Choose a position to view questions" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                    {positions.map((pos) => (
                      <SelectItem key={pos._id} value={pos._id} className="dark:text-gray-200 dark:focus:bg-slate-700">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {pos.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedPosition && (
                <div className="flex-1">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                    Search Questions
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                    <Input
                      placeholder="Search questions by text..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:ring-blue-500"
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
              )}
            </div>

            {/* Quick Stats */}
            {selectedPosition && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Position: <span className="font-medium text-gray-900 dark:text-white">{positions.find(p => p._id === selectedPosition)?.name}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Questions: <span className="font-medium text-gray-900 dark:text-white">{filteredQuestions.length}</span></span>
                  </div>
                  {searchTerm && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Searching: <span className="font-medium text-gray-900 dark:text-white">"{searchTerm}"</span></span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions Section */}
        {selectedPosition ? (
          <div className="space-y-6">
            {/* Header with Stats */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Questions for {positions.find(p => p._id === selectedPosition)?.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage and organize questions for this position
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {filteredQuestions.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Questions
                  </div>
                </div>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </div>

            {/* Questions Content */}
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="border border-gray-200 dark:border-slate-800 dark:bg-slate-900">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <div className="h-6 w-16 bg-gray-200 dark:bg-slate-800 rounded animate-pulse"></div>
                          <div className="h-6 w-20 bg-gray-200 dark:bg-slate-800 rounded animate-pulse"></div>
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-3/4"></div>
                        <div className="space-y-2">
                          <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded animate-pulse"></div>
                          <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredQuestions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredQuestions.map(renderQuestionCard)}
              </div>
            ) : (
              <Card className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardContent className="p-16 text-center">
                  <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {searchTerm ? "No questions found" : "No questions available"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    {searchTerm
                      ? "We couldn't find any questions matching your search. Try adjusting your search terms or clear the search to see all questions."
                      : "This position doesn't have any questions yet. Start building your question bank by adding the first question."
                    }
                  </p>
                  <div className="flex gap-3 justify-center">
                    {searchTerm ? (
                      <Button
                        variant="outline"
                        onClick={() => setSearchTerm("")}
                        className="dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800"
                      >
                        Clear Search
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setShowCreateDialog(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Question
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-16 text-center">
              <div className="w-24 h-24 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Filter className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Select a Position
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Choose a position from the dropdown above to view and manage its questions.
                Each position can have its own set of questions for interviews.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                💡 Tip: Questions are organized by position to ensure relevant assessments
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Question Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:text-white">Question Details</DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-6">
              {/* Position Badge */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Position:</Label>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                  {selectedQuestion.position?.name}
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

      {/* Edit Question Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Edit Question</DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <EditQuestion
              question={selectedQuestion}
              onQuestionUpdated={handleQuestionUpdated}
            />
          )}
        </DialogContent>
      </Dialog>

      <Toaster />
    </>
  );
}
