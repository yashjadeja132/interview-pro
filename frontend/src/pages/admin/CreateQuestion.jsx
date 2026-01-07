import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import api from "../../Api/axiosInstance";

export default function CreateQuestion({ onQuestionCreated }) {
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    positionId: "",
    category: "",
    question: "",
    questionImage: null,
    options: [
      { optionText: "", optionImage: null, isCorrect: false },
      { optionText: "", optionImage: null, isCorrect: false },
      { optionText: "", optionImage: null, isCorrect: false },
      { optionText: "", optionImage: null, isCorrect: false },
    ],
  });

  const categories = [
    { value: 1, label: "Quantitative & Aptitude" },
    { value: 2, label: "Verbal & Language Skills" },
    { value: 3, label: "Programming Logic" }
  ];

  const [fieldErrors, setFieldErrors] = useState({});

  // refs for file inputs
  const questionImageRef = useRef(null);
  const optionImageRefs = useRef([]);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await api.get("/position");
        setPositions(res.data.data);
      } catch (err) {
        console.error("Failed to load positions", err);
      }
    };
    fetchPositions();
  }, []);

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    if (index !== null) {
      const newOptions = [...form.options];
      newOptions[index] = { ...newOptions[index], optionText: value };
      setForm((prev) => ({ ...prev, options: newOptions }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    let errors = {};
    if (!form.positionId) errors.positionId = "Position is required";
    if (!form.question) errors.question = "Question is required";

    form.options.forEach((opt, idx) => {
      if (!opt.optionText && !opt.optionImage)
        errors[`option${idx}`] = `Option ${idx + 1} is required`;
    });

    if (!form.options.some((o) => o.isCorrect)) {
      errors.correct = "You must select a correct answer";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateField = (name, value) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      if (value && newErrors[name]) {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("positionId", form.positionId);
      formData.append("questionText", form.question);
      
      // Category (optional) - send as number
      if (form.category) {
        formData.append("category", Number(form.category));
      }

      // Question image
      if (form.questionImage) {
        formData.append("questionImage", form.questionImage);
      }

      // Option images (all under same field name 'optionImages')
      form.options.forEach((opt) => {
        if (opt.optionImage) {
          formData.append("optionImages", opt.optionImage);
        }
      });

      // Send options array as JSON string
      formData.append("options", JSON.stringify(form.options));

      // Send request
      const res = await api.post("/question", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 201) {
        toast.success("Question created successfully");
        // Only call onQuestionCreated if it's provided as a prop
        if (onQuestionCreated) {
          onQuestionCreated();
        }
      } else {
        toast.warning("Something went wrong");
      }

      // Reset form
      setForm({
        positionId: "",
        category: "",
        question: "",
        questionImage: null,
        options: [
          { optionText: "", optionImage: null, isCorrect: false },
          { optionText: "", optionImage: null, isCorrect: false },
          { optionText: "", optionImage: null, isCorrect: false },
          { optionText: "", optionImage: null, isCorrect: false },
        ],
      });

      if (questionImageRef.current) questionImageRef.current.value = "";
      optionImageRefs.current.forEach((ref) => {
        if (ref) ref.value = "";
      });
    } catch (err) {
      console.error("Failed to create question:", err);
      toast.error("Failed to create question");
    } finally {
      setIsLoading(false);
    }
  };

  // remove question image
  const removeQuestionImage = () => {
    setForm((prev) => ({ ...prev, questionImage: null }));
    if (questionImageRef.current) {
      questionImageRef.current.value = "";
    }
  };

  // remove option image
  const removeOptionImage = (idx) => {
    const newOptions = [...form.options];
    newOptions[idx] = { ...newOptions[idx], optionImage: null };
    setForm((prev) => ({ ...prev, options: newOptions }));
    
    if (optionImageRefs.current[idx]) {
      optionImageRefs.current[idx].value = "";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Create New Question</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Position and Category Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Position Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Position</Label>
              <Select
                value={form.positionId || ""}
                onValueChange={(value) => {
                  setForm((prev) => ({ ...prev, positionId: value }));
                  validateField("positionId", value);
                }}
              >
                <SelectTrigger className={fieldErrors.positionId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos._id} value={pos._id}>
                      {pos.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.positionId && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.positionId}
                </p>
              )}
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Select
                value={form.category ? String(form.category) : ""}
                onValueChange={(value) => {
                  setForm((prev) => ({ ...prev, category: value ? Number(value) : "" }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={String(cat.value)}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Question Text</Label>
            <Input
              name="question"
              value={form.question}
              onChange={(e) => {
                handleChange(e);
                validateField("question", e.target.value);
              }}
              placeholder="Enter your question here..."
              className={fieldErrors.question ? "border-red-500" : ""}
            />
            {fieldErrors.question && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.question}
              </p>
            )}
          </div>

          {/* Question Image */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Question Image (Optional)</Label>
            <Input
              type="file"
              accept="image/*"
              ref={questionImageRef}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  questionImage: e.target.files[0],
                }))
              }
            />
            {form.questionImage && (
              <div className="relative inline-block">
                <img
                  src={URL.createObjectURL(form.questionImage)}
                  alt="preview"
                  className="w-48 h-32 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={removeQuestionImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-800">Answer Options</h3>
            
            {form.options.map((opt, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Option {idx + 1}</Label>
                  <RadioGroup
                    value={opt.isCorrect ? String(idx) : ""}
                    onValueChange={(value) => {
                      const selectedIndex = parseInt(value, 10);
                      const newOptions = form.options.map((o, i) => ({
                        ...o,
                        isCorrect: i === selectedIndex,
                      }));
                      setForm((prev) => ({
                        ...prev,
                        options: newOptions,
                      }));
                      validateField("correct", true);
                    }}
                  >
                    <Label className="flex items-center gap-2 cursor-pointer text-sm">
                      <RadioGroupItem value={String(idx)} />
                      Mark as correct answer
                    </Label>
                  </RadioGroup>
                </div>

                <Input
                  placeholder={`Option ${idx + 1} text`}
                  value={opt.optionText}
                  onChange={(e) => {
                    const newOptions = [...form.options];
                    newOptions[idx] = {
                      ...newOptions[idx],
                      optionText: e.target.value,
                    };
                    setForm((prev) => ({
                      ...prev,
                      options: newOptions,
                    }));
                    validateField(`option${idx}`, e.target.value);
                  }}
                  className={fieldErrors[`option${idx}`] ? "border-red-500" : ""}
                />

                <div className="space-y-2">
                  <Label className="text-xs text-slate-600">Option Image (Optional)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    ref={(el) => (optionImageRefs.current[idx] = el)}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      const newOptions = [...form.options];
                      newOptions[idx] = {
                        ...newOptions[idx],
                        optionImage: file,
                      };
                      setForm((prev) => ({
                        ...prev,
                        options: newOptions,
                      }));
                      validateField(`option${idx}`, file ? "image" : "");
                    }}
                  />
                  
                  {opt.optionImage && (
                    <div className="relative inline-block">
                      <img
                        src={URL.createObjectURL(opt.optionImage)}
                        alt="preview"
                        className="w-32 h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeOptionImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {fieldErrors[`option${idx}`] && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors[`option${idx}`]}
                  </p>
                )}
              </div>
            ))}

            {fieldErrors.correct && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.correct}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            {onQuestionCreated && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onQuestionCreated()}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Creating Question..." : "Create Question"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  );
}