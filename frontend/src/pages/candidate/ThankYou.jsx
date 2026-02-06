import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Lottie from "lottie-react";
import Success from "../../assets/Success.json";
import { 
  CheckCircle, 
  Clock, 
  Mail, 
  Star,
  Award,
  Users
} from "lucide-react";
import { useEffect } from "react";

const ThankYou = () => {
  useEffect(() => {
  const disableBack = () => {
    window.history.pushState(null, "", window.location.href);
  };
  window.history.pushState(null, "", window.location.href);
  window.addEventListener("popstate", disableBack);
  return () => window.removeEventListener("popstate", disableBack);
}, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Main Thank You Card */}
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
          
          <CardHeader className="text-center pb-8 relative z-10">
            {/* Success Animation */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Lottie
                  animationData={Success}
                  loop={false}
                  className="w-32 h-32"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Test Submitted Successfully!
            </CardTitle>
            
            <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Congratulations! You have successfully completed your interview test. 
              Our team will carefully review your responses and get back to you with the results soon.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 relative z-10">
            {/* Status Information */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Review Process</h3>
                <p className="text-sm text-gray-600">
                  Our team will review your test within 2-3 business days
                </p>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email Notification</h3>
                <p className="text-sm text-gray-600">
                  You'll receive an email with your results and next steps
                </p>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-100">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Next Steps</h3>
                <p className="text-sm text-gray-600">
                  If selected, we'll schedule the next round of interviews
                </p>
              </div>
            </div>

            {/* Test Statistics */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Test Completion Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">100%</div>
                  <div className="text-sm text-gray-600">Completion</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    <Star className="w-6 h-6 mx-auto" />
                  </div>
                  <div className="text-sm text-gray-600">Well Done</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    <Users className="w-6 h-6 mx-auto" />
                  </div>
                  <div className="text-sm text-gray-600">Team Review</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">24-48h</div>
                  <div className="text-sm text-gray-600">Response Time</div>
                </div>
              </div>
            </div>

       
            <div className="text-center pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">
                Need help or have questions?
              </p>
              <p className="text-sm text-gray-600">
                Contact our support team at{" "}
                <a href="mailto:support@sparrow.com" className="text-blue-600 hover:text-blue-700 font-medium">
                  support@sparrow.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Message */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Thank you for choosing Sparrow Interview System
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
