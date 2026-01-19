import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";




import { 
  Play, 
  Camera, 
  Mic, 
  Monitor, 
  Shield, 
  Clock, 
  Trophy,
  CheckCircle,
  AlertCircle,
  Sparkles
} from "lucide-react";
import sparrowLogo from "../../assets/sparrowlogo.png";
export default function StartButton({ setStreams }) {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
   
const handleStartTest = async () => {
  setErrorMessage("");
   
  try {
  const testpage = () => {
    useEffect(() => {
      const disabledKeyboard = (e) => {
        if (e.key === "F12" || e.key === "F5" || e.key === "F11" || (e.ctrlKey && e.key === "r") || (e.ctrlKey && e.shiftKey && e.key === "i")) {
          e.preventDefault();
          console.log("Keyboard  blocked");
        }
      };
      window.addEventListener("keydown", disabledKeyboard);
      return () => window.removeEventListener("keydown", disabledKeyboard);
    }, []);
  };



  const enter = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  // initial enter
  enter();

  // store handlers globally (clean remove ke liye)
  window.__fsEnter = enter;

  // agar user ESC se bahar nikle → wapas fullscreen
  window.__fsChange = () => {
    if (!document.fullscreenElement) {
      enter();
    }
  };

  document.addEventListener("fullscreenchange", window.__fsChange);
  // /////////////////////////////////

    setIsLoading(true);

    // request screen + camera
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setStreams({ screenStream, camStream });

    // Disable keyboard after starting
    // keyboardAllowed.current = false;

    // Navigate and fullscreen
    navigate("/candidate/Quiztest");
    setTimeout(() => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    }, 300);

  } catch (err) {
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header with Logo */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <img 
            src={sparrowLogo} 
            alt="Sparrow Softtech Innovation Unlimited" 
            className="h-16 w-auto"
            style={{ imageRendering: 'high-quality' }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-6">
        <div className="max-w-4xl w-full">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Welcome to Your Assessment
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              You're about to begin an exciting journey. Show us your skills and let your potential shine!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Test Information Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  Assessment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-900">Duration</p>
                      <p className="text-sm text-slate-600">Approximately 30-45 minutes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-slate-900">Secure Environment</p>
                      <p className="text-sm text-slate-600">Your session is monitored for integrity</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Trophy className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-slate-900">Multiple Choice</p>
                      <p className="text-sm text-slate-600">Answer questions to the best of your ability</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Required Permissions:</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-600">Camera access for monitoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-600">Microphone access for audio</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-600">Screen sharing for security</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Start Test Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                  <Play className="w-6 h-6" />
                  Ready to Begin?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-blue-100 mb-6">
                    Click the button below to start your assessment. Make sure you're in a quiet environment with good internet connection.
                  </p>
                  
                  <Button 
                    onClick={handleStartTest}
                   
                    disabled={isLoading}
                    className="w-full bg-white text-blue-600 hover:bg-blue-50 text-lg font-semibold py-6 h-auto"
                    size="lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span>Preparing Assessment...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Play className="w-5 h-5" />
                        <span>Start Assessment</span>
                      </div>
                    )}
                  </Button>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-300" />
                      <p className="text-red-100 font-medium">Permission Required</p>
                    </div>
                    <p className="text-red-200 text-sm mt-1">{errorMessage}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-blue-500/30">
                  <div className="flex items-center justify-center gap-2 text-blue-200">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Your progress is automatically saved</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-slate-500 text-sm">
              Powered by <span className="font-semibold text-slate-700">Sparrow Softtech Innovation Unlimited</span>
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Secure • Reliable • Professional Assessment Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
