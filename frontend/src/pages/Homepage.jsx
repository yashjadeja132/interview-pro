import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  Clock,
  BarChart3,
  Video,
  FileText,
  ArrowRight,
  Star,
  CheckCircle2,
} from "lucide-react";
import sparrowLogo from "../assets/sparrowlogo.png";

export function Homepage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Video className="w-6 h-6 text-slate-700" />,
      title: "Video Interviews",
      description:
        "Conduct professional face-to-face interviews with advanced video recording capabilities",
    },
    {
      icon: <FileText className="w-6 h-6 text-slate-700" />,
      title: "Automated Assessment",
      description:
        "AI-powered evaluation system for objective and consistent candidate assessment",
    },
    {
      icon: <Shield className="w-6 h-6 text-slate-700" />,
      title: "Secure Platform",
      description:
        "Enterprise-grade security with encrypted data transmission and compliance standards",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-slate-700" />,
      title: "Analytics Dashboard",
      description:
        "Comprehensive insights and performance metrics to support data-driven hiring decisions",
    },
    {
      icon: <Clock className="w-6 h-6 text-slate-700" />,
      title: "Time Management",
      description:
        "Automated scheduling and time-bound assessments for efficient recruitment workflows",
    },
    {
      icon: <Users className="w-6 h-6 text-slate-700" />,
      title: "Multi-User Support",
      description:
        "Seamless collaboration between administrators, HR teams, and candidates",
    },
  ];

  const stats = [
    { number: "10K+", label: "Interviews Conducted" },
    { number: "500+", label: "Companies Trust Us" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "24/7", label: "Support Available" },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HR Director, TechCorp",
      content:
        "This platform revolutionized our hiring process. The automated assessments save us hours of manual work while maintaining consistency.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Talent Acquisition Lead",
      content:
        "The video interview feature is exceptional. We can now evaluate candidates more effectively and make better hiring decisions.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Recruitment Manager",
      content:
        "The analytics dashboard provides insights we never had before. It's transformed how we approach talent acquisition.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center space-x-3">
              <img
                src={sparrowLogo}
                alt="Sparrow Softtech Innovation Unlimited"
                className="h-8 md:h-10 w-auto"
                style={{ imageRendering: "high-quality" }}
              />
              <span className="text-xl md:text-2xl font-semibold text-slate-900">
                InterviewPro
              </span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button
             
              
                className="bg-slate-900 hover:bg-slate-800 text-white text-sm md:text-base px-4 md:px-6"
                onClick={() => navigate("/adminAndHRLogin")}
              >
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 md:mb-6 leading-tight">
              Transform Your
              <span className="text-slate-700"> Hiring Process</span>
            </h1>

            <div className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-md border border-slate-200 mb-6 md:mb-8">
              <CheckCircle2 className="w-4 h-4 text-slate-600 mr-2" />
              <span className="text-slate-700 text-xs md:text-sm font-medium">
                Enterprise Interview Platform
              </span>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
              Streamline interviews with AI-powered assessments, video
              recording, and comprehensive analytics. Make data-driven hiring
              decisions with our enterprise-grade platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
     <section className="bg-slate-50 px-4 sm:px-6 lg:px-8 pt-12 md:pt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="bg-white border border-slate-200 text-center hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-6 md:p-8">
                  <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-slate-600 text-sm md:text-base">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 md:mb-6">
              Powerful Features
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto px-4">
              Everything you need to conduct professional interviews and make
              informed hiring decisions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200"
              >
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-slate-100 rounded-md">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-slate-900 text-lg md:text-xl">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 text-sm md:text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-12 md:pb-20 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 md:mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 px-4">
              See what our clients say about their experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 md:w-5 md:h-5 text-amber-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-4 italic text-sm md:text-base leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="text-slate-900 font-semibold text-sm md:text-base">
                      {testimonial.name}
                    </div>
                    <div className="text-slate-500 text-xs md:text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                <Shield className="w-5 h-5 text-slate-900" />
              </div>
              <span className="text-xl font-semibold text-white">
                InterviewPro
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Enterprise-grade interview platform designed to simplify hiring
              through AI-powered assessments, secure video interviews, and
              actionable analytics.
            </p>
          </div>

       
          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>24/7 Technical Support</li>
              <li>Enterprise SLA</li>
              <li>Data Privacy & Compliance</li>
              <li>Uptime Guarantee: 99.9%</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-slate-500 text-xs md:text-sm">
          © 2024 InterviewPro. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
