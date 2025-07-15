import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Shield, TrendingUp, Brain } from 'lucide-react';

const LandingContent: React.FC = () => {
  const features = [
    {
      id: 'ai-powered-tax-analysis',
      title: 'AI-Powered Tax Analysis',
      date: 'Apr 6, 2023',
      description: "In the latest release, I've added support for advanced AI-powered tax analysis that can process your IRS corporate tax files and provide personalized recommendations. The system analyzes your filing patterns, deductions, and business structure to identify potential tax savings opportunities you might have missed.",
      icon: Brain,
      improvements: [
        'Added AI-powered corporate tax file analysis with personalized recommendations',
        'Implemented secure file upload with end-to-end encryption for sensitive tax documents',
        'Enhanced recommendation engine to identify missed deductions and tax optimization opportunities',
        'Added real-time tax savings calculator to quantify potential benefits'
      ]
    },
    {
      id: 'enhanced-security-compliance',
      title: 'Enhanced Security & Compliance',
      date: 'Mar 17, 2023',
      description: "I've added enterprise-grade security features to ensure your sensitive tax documents are protected throughout the analysis process. All files are encrypted during upload, processing, and storage, with automatic deletion after analysis completion.",
      icon: Shield,
      improvements: [
        'Added SOC 2 Type II compliant security infrastructure',
        'Implemented automatic file encryption and secure deletion protocols',
        'Enhanced integration with QuickBooks, Xero, and other accounting platforms',
        'Added audit trail functionality for all tax document processing activities'
      ]
    },
    {
      id: 'smart-deduction-discovery',
      title: 'Smart Deduction Discovery',
      date: 'Mar 6, 2023',
      description: 'The new smart deduction discovery feature analyzes your business expenses and identifies potential deductions you may have overlooked. Using machine learning algorithms trained on thousands of successful tax filings, it can spot patterns and opportunities specific to your industry.',
      icon: TrendingUp,
      improvements: [
        'Added smart deduction discovery powered by machine learning',
        'Implemented industry-specific tax optimization recommendations',
        'Enhanced expense categorization with automatic classification',
        'Added comprehensive tax savings dashboard with detailed breakdowns'
      ]
    }
  ];

  return (
    <div className="relative flex-auto">
      {/* Pattern Background */}
      <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-lg lg:overflow-visible">
        <svg className="absolute top-0 left-[max(0px,calc(50%-18.125rem))] h-full w-1.5 lg:left-full lg:ml-1 xl:right-1 xl:left-auto xl:ml-0" aria-hidden="true">
          <defs>
            <pattern id="pattern" width="6" height="8" patternUnits="userSpaceOnUse">
              <path d="M0 0H6M0 8H6" className="stroke-sky-900/10 xl:stroke-white/10 dark:stroke-white/10" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern)" />
        </svg>
      </div>
      
      <main className="space-y-20 py-20 sm:space-y-32 sm:py-32">
        {features.map((feature, index) => (
          <article key={feature.id} id={feature.id} className="scroll-mt-16">
            <div>
              {/* Header */}
              <header className="relative mb-10 xl:mb-0">
                <div className="pointer-events-none absolute top-0 left-[max(-0.5rem,calc(50%-18.625rem))] z-50 flex h-4 items-center justify-end gap-x-2 lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:left-0 lg:min-w-lg xl:h-8">
                  <a className="inline-flex" href={`#${feature.id}`}>
                    <time dateTime={feature.date} className="hidden xl:pointer-events-auto xl:block xl:text-2xs/4 xl:font-medium xl:text-white/50">
                      {feature.date}
                    </time>
                  </a>
                  <div className="h-0.25 w-3.5 bg-gray-400 lg:-mr-3.5 xl:mr-0 xl:bg-gray-300" />
                </div>
                <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
                  <div className="lg:ml-96 lg:flex lg:w-full lg:justify-end lg:pl-32">
                    <div className="mx-auto max-w-lg lg:mx-0 lg:w-0 lg:max-w-xl lg:flex-auto">
                      <div className="flex">
                        <a className="inline-flex" href={`#${feature.id}`}>
                          <time dateTime={feature.date} className="text-2xs/4 font-medium text-gray-500 xl:hidden dark:text-white/50">
                            {feature.date}
                          </time>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </header>
              
              {/* Content */}
              <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
                <div className="lg:ml-96 lg:flex lg:w-full lg:justify-end lg:pl-32">
                  <div className="mx-auto max-w-lg lg:mx-0 lg:w-0 lg:max-w-xl lg:flex-auto">
                    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                            <feature.icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">
                              <a href={`#${feature.id}`} className="hover:text-blue-600 transition-colors">
                                {feature.title}
                              </a>
                            </CardTitle>
                            <Badge variant="secondary" className="mt-1">
                              {feature.date}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <CardDescription className="text-base leading-relaxed">
                          {feature.description}
                        </CardDescription>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-blue-500" />
                            <h4 className="font-semibold text-sm">Improvements</h4>
                          </div>
                          <ul className="space-y-2">
                            {feature.improvements.map((improvement, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
        
        {/* TaxGenius Introduction */}
        <article id="taxgenius-v100" className="scroll-mt-16">
          <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
            <div className="lg:ml-96 lg:flex lg:w-full lg:justify-end lg:pl-32">
              <div className="mx-auto max-w-lg lg:mx-0 lg:w-0 lg:max-w-xl lg:flex-auto">
                <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-emerald-200 dark:border-emerald-700">
                  <CardHeader>
                    <CardTitle className="text-2xl text-emerald-800 dark:text-emerald-200">
                      <a href="#taxgenius-v100" className="hover:text-emerald-600 transition-colors">
                        TaxGenius v1.0.0
                      </a>
                    </CardTitle>
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 w-fit">
                      Mar 3, 2023
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-base leading-relaxed">
                      TaxGenius is an AI-powered tax optimization platform that transforms how businesses handle their corporate tax filings. Simply upload your IRS corporate tax files, and our advanced AI engine analyzes every aspect of your filing to identify missed deductions, optimization opportunities, and potential tax savings.
                    </p>
                    <p className="text-base leading-relaxed">
                      The platform processes your documents in minutes, not hours, and provides detailed, actionable recommendations that you can implement immediately or share with your tax professional. With bank-level security and compliance, your sensitive financial information is always protected.
                    </p>
                    <p className="text-base leading-relaxed">
                      Whether you're a small business owner or managing taxes for a large corporation, TaxGenius helps you maximize your tax efficiency and keep more money in your business.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default LandingContent;