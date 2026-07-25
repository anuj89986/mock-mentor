'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Users, CheckCircle2, Star, FileText,Brain} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  return ( 
    <div className="flex flex-col min-h-screen bg-[#F3EBDD] text-[#5C5147] font-sans selection:bg-[#8C5A3C] selection:text-[#FFFDF8] overflow-x-hidden w-full">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#FBF7EF]/90 backdrop-blur-xl border-b border-[#D8CDBD] shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8C5A3C] flex items-center justify-center shadow-sm shrink-0">
              <Brain className="w-6 h-6 text-[#FFFDF8]" />
            </div>
            <span className="text-xl md:text-2xl font-medium tracking-tight text-[#2B2118]">
              Mock Mentor
            </span>
          </div>
          <div className="flex items-center gap-3 md:gap-5">
            <Button 
              variant="ghost" 
              asChild
              className="text-[#5C5147] hover:bg-[#F3EBDD] hover:text-[#2B2118] font-medium hidden sm:flex"
            >
              <Link href="/auth/signin">Log in</Link>
            </Button>
            <Button asChild className="bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] rounded-xl px-5 shadow-sm transition-all font-medium">
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 md:pt-48 md:pb-32 px-5 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-125 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-[#8C5A3C]/10 via-transparent to-transparent pointer-events-none -z-10" />
        
        <div className="max-w-4xl mx-auto text-center z-10 w-full">
          <div className="mb-8 inline-block">
            <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFDF8] text-[#8C5A3C] text-[11px] md:text-xs font-medium uppercase tracking-widest border border-[#D8CDBD] shadow-sm">
              AI-Powered Interview Prep
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium mb-6 leading-[1.1] text-[#2B2118] tracking-tight text-balance">
            Master your interview skills with{' '}
            <span className="text-[#8C5A3C] italic font-serif pr-2">
              confidence.
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-[#8D8175] mb-10 max-w-2xl mx-auto leading-relaxed text-balance">
            Upload your resume and practice with tailored, AI-driven mock interviews. Get real-time feedback, refine your narrative, and walk into your next interview fully prepared.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-2 sm:px-0">
            <Button size="lg" asChild className="w-full sm:w-auto bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] rounded-xl h-14 px-8 shadow-md transition-all font-medium text-base">
              <Link href="/auth/signin">
                Start Practicing Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-24 px-5 sm:px-6 lg:px-8 bg-[#FFFDF8] border-y border-[#D8CDBD]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-medium text-[#2B2118] tracking-tight mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-[#8D8175] text-base md:text-lg">
              Our platform provides a comprehensive environment to test, analyze, and perfect your professional communication.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
            {[
              {
                icon: Brain,
                title: 'Adaptive AI Mentor',
                description: 'Experience dynamic conversations. The AI adapts follow-up questions based on your real-time responses and experience level.',
              },
              {
                icon: FileText,
                title: 'Resume-Driven',
                description: 'Upload your CV to generate highly personalized questions that target your specific projects, skills, and industry.',
              },
              {
                icon: Zap,
                title: 'Instant Analysis',
                description: 'Receive immediate, actionable breakdowns of your communication clarity, technical accuracy, and confidence markers.',
              },
              {
                icon: Users,
                title: 'Behavioral & Technical',
                description: 'Whether you need to practice coding concepts or leadership scenarios, our mentor switches contexts seamlessly.',
              },
              {
                icon: CheckCircle2,
                title: 'Progress Tracking',
                description: 'Watch your scores improve over time. Our analytics dashboard highlights your growing strengths and lingering blind spots.',
              },
              {
                icon: Star,
                title: 'Industry Standards',
                description: 'Trained on modern hiring frameworks, ensuring you practice against the exact standards top companies use today.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 md:p-8 rounded-2xl bg-[#FBF7EF] border border-[#D8CDBD] hover:border-[#8C5A3C]/40 hover:-translate-y-1 transition-all duration-300 shadow-sm group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FFFDF8] border border-[#D8CDBD] flex items-center justify-center mb-5 md:mb-6 group-hover:border-[#8C5A3C]/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-[#8C5A3C]" />
                </div>
                <h3 className="text-lg font-medium text-[#2B2118] mb-2 md:mb-3">{feature.title}</h3>
                <p className="text-[#8D8175] leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-5 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium text-[#2B2118] tracking-tight">How It Works</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            <div className="space-y-10">
              {[
                {
                  step: '01',
                  title: 'Upload Your Resume',
                  description: 'Share your background securely. Our system parses your experience to create a baseline for your personalized interview.',
                },
                {
                  step: '02',
                  title: 'Select Your Focus',
                  description: 'Choose between technical deep-dives, behavioral scenarios, or a mixed session tailored to your upcoming opportunities.',
                },
                {
                  step: '03',
                  title: 'Converse Naturally',
                  description: 'Engage in a voice or text-based dialogue. Answer naturally, just as you would with a human hiring manager.',
                },
                {
                  step: '04',
                  title: 'Review & Refine',
                  description: 'Get a comprehensive post-interview report detailing your scores, strengths, and specific areas for improvement.',
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 items-start group">
                  <div className="w-12 h-12 rounded-full bg-[#FFFDF8] border border-[#D8CDBD] flex items-center justify-center shrink-0 shadow-sm group-hover:border-[#8C5A3C] transition-colors">
                    <span className="text-[#8C5A3C] font-mono font-medium text-sm">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-[#2B2118] mb-2">{item.title}</h3>
                    <p className="text-[#8D8175] leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Visual Placeholder for How it Works */}
            <div className="hidden md:flex items-center justify-center bg-[#FBF7EF] rounded-3xl border border-[#D8CDBD] shadow-sm relative overflow-hidden min-h-100">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-[#8C5A3C] to-transparent"></div>
              <div className="w-4/5 h-4/5 bg-[#FFFDF8] rounded-2xl border border-[#D8CDBD] shadow-md p-6 flex flex-col gap-4 z-10 relative transform rotate-2">
                <div className="w-1/3 h-4 bg-[#F3EBDD] rounded-full"></div>
                <div className="w-3/4 h-3 bg-[#F3EBDD] rounded-full"></div>
                <div className="w-5/6 h-3 bg-[#F3EBDD] rounded-full"></div>
                <div className="mt-auto w-full h-12 bg-[#FBF7EF] rounded-xl border border-[#D8CDBD] flex items-center px-4">
                  <div className="w-2 h-2 rounded-full bg-[#8C5A3C] animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 px-5 sm:px-6 lg:px-8 bg-[#FBF7EF] border-y border-[#D8CDBD] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#8C5A3C]" />
        
        <div className="max-w-2xl mx-auto text-center relative z-10 w-full">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-[#2B2118] tracking-tight mb-6 text-balance">
            Ready to ace your next interview?
          </h2>
          <p className="text-base md:text-lg text-[#8D8175] mb-10 leading-relaxed text-balance">
            Join professionals who have elevated their careers by preparing with Mock Mentor. Start your first session today.
          </p>
          <Button size="lg" asChild className="w-full sm:w-auto bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] rounded-xl h-14 px-10 shadow-md transition-all font-medium text-base">
            <Link href="/auth/register">
              Create Your Free Account
            </Link>
          </Button>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-[#FFFDF8] py-8 md:py-10 border-t border-[#D8CDBD] px-5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#8C5A3C] flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-[#FFFDF8]" />
            </div>
            <span className="font-medium text-[#2B2118] text-lg tracking-tight">Mock Mentor</span>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
            {['Privacy Policy', 'Terms of Service', 'Contact Us'].map((link) => (
              <a key={link} href="#" className="text-sm text-[#8D8175] hover:text-[#8C5A3C] transition-colors">
                {link}
              </a>
            ))}
          </div>

          <p className="text-xs text-[#8D8175]">
            © {new Date().getFullYear()} Mock Mentor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}