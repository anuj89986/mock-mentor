'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Brain, Zap, Users, CheckCircle, Star} from 'lucide-react';
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
  }, [session]);
  return ( 
    <div className="flex flex-col min-h-screen bg-black text-white w-full">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold">Mock Mentor</span>
          </div>
          <div className="flex items-center gap-4">
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-block">
            <span className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 text-sm font-semibold border border-blue-500/30">
              🚀 AI-Powered Mock Interviews
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-tight">
            Master Your Interview Skills with{' '}
            <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Mock Mentor
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Practice with AI-driven mock interviews tailored to your resume. Get real-time feedback, 
            improve your skills, and ace your next interview with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/register">
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why Choose Mock Mentor?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Interviews',
                description: 'Get intelligent mock interviews that adapt to your skill level and experience.',
              },
              {
                icon: Zap,
                title: 'Real-Time Feedback',
                description: 'Receive instant analysis of your responses with actionable improvement suggestions.',
              },
              {
                icon: Users,
                title: 'Industry Experts',
                description: 'Learn from curated best practices and interview tips from top professionals.',
              },
              {
                icon: BookOpen,
                title: 'Resume Analysis',
                description: 'Upload your resume and get tailored questions based on your background.',
              },
              {
                icon: CheckCircle,
                title: 'Track Progress',
                description: 'Monitor your improvements across multiple practice sessions and metrics.',
              },
              {
                icon: Star,
                title: 'Interview Preparation',
                description: 'Cover all major topics: technical, behavioral, and role-specific questions.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all duration-300"
              >
                <feature.icon className="w-10 h-10 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="space-y-8">
            {[
              {
                step: '01',
                title: 'Upload Your Resume',
                description: 'Share your resume and let our AI understand your background and experience.',
              },
              {
                step: '02',
                title: 'Start Mock Interview',
                description: 'Choose a role or interview type and begin your personalized mock session.',
              },
              {
                step: '03',
                title: 'Get Real-Time Feedback',
                description: 'Receive instant analysis on communication, technical accuracy, and confidence.',
              },
              {
                step: '04',
                title: 'Improve & Master',
                description: 'Track your progress, retake interviews, and build confidence for the real deal.',
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center shrink-0">
                  <span className="text-blue-400 font-bold">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-blue-600/10 to-cyan-600/10 border-y border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Ace Your Next Interview?</h2>
          <p className="text-lg text-gray-400 mb-8">
            Join hundreds of professionals who've mastered their interview skills with Mock Mentor.
          </p>
          <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/auth/register">
              Get Started Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-blue-400" />
                <span className="font-bold">Mock Mentor</span>
              </div>
              <p className="text-sm text-gray-400">Master your interview skills with AI.</p>
            </div>
            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'Blog', 'Updates'],
              },
              {
                title: 'Company',
                links: ['About', 'Careers', 'Contact', 'Press'],
              },
              {
                title: 'Legal',
                links: ['Privacy', 'Terms', 'Security', 'Cookies'],
              },
            ].map((col, idx) => (
              <div key={idx}>
                <h4 className="font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-gray-400 hover:text-white transition">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-gray-400">© 2026 Mock Mentor. All rights reserved.</p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                <a key={social} href="#" className="text-sm text-gray-400 hover:text-white transition">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
