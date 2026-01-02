'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">GH</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">GradeHub</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#roles" className="text-gray-600 hover:text-gray-900 transition-colors">Roles</a>
            <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
              Login
            </Link>
            <Link href="/register" className="button-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">

          <div className="relative z-10">
            <div className="inline-block mb-6 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              Welcome to GradeHub
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Smart Grade <span className="text-blue-600">Management</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Streamline academic grade management with our comprehensive platform. 
              Built for faculty, registrars, and students with powerful features and intuitive design.
            </p>

            <div className="flex gap-4 justify-center mb-12 flex-wrap">
              <Link href="/register" className="group relative px-8 py-4 text-lg font-semibold bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2">
                  Start Free Trial
                </span>
              </Link>
              <a href="#features" className="group px-8 py-4 text-lg font-semibold border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all flex items-center gap-2">
                <span>Explore Features</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-blue-600">50K+</div>
                <p className="text-gray-600 text-sm">Students Managed</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">100+</div>
                <p className="text-gray-600 text-sm">Institutions</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">99.9%</div>
                <p className="text-gray-600 text-sm">Uptime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image/Mockup */}
        <div className="max-w-5xl mx-auto px-4 pb-20 relative z-10">
          <div className="bg-gray-100 rounded-2xl shadow-2xl p-2 border border-gray-200">
            <div className="bg-white rounded-lg p-12 text-center">
              <div className="inline-block mb-6 px-6 py-3 bg-blue-100 rounded-lg">
                <p className="text-gray-700 font-medium">Manage Grades & Generate Reports</p>
              </div>
              <p className="text-gray-600 text-lg">Access powerful grade management features</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to manage grades efficiently</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-xl border border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 bg-white">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 text-white font-bold">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Grade Encoding</h3>
              <p className="text-gray-600 mb-4">Enter grades individually or in bulk with validation, draft saving, and auto-grading calculations.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Single & batch entry</li>
                <li>✓ Auto calculations</li>
                <li>✓ Draft management</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-xl border border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 bg-white">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4 text-white font-bold">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verification & Approval</h3>
              <p className="text-gray-600 mb-4">Multi-level approval workflow with comprehensive audit trails and quality checks for compliance.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Multi-level review</li>
                <li>✓ Batch approval</li>
                <li>✓ Audit logging</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-xl border border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 bg-white">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 text-white font-bold">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Student Portal</h3>
              <p className="text-gray-600 mb-4">Students view grades, calculate GPA, generate transcripts, and track academic progress.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Grade transcript</li>
                <li>✓ GPA calculation</li>
                <li>✓ Progress tracking</li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-xl border border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300 bg-white">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4 text-white font-bold">4</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Grade Corrections</h3>
              <p className="text-gray-600 mb-4">Request and manage grade changes with proper documentation and approval workflows.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Request forms</li>
                <li>✓ Change history</li>
                <li>✓ Documentation</li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-xl border border-red-200 hover:border-red-400 hover:shadow-lg transition-all duration-300 bg-white">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4 text-white font-bold">5</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Reports & Analytics</h3>
              <p className="text-gray-600 mb-4">Generate comprehensive reports with analytics, visualizations, and export to PDF/Excel.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Grade reports</li>
                <li>✓ Analytics</li>
                <li>✓ PDF/Excel export</li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-xl border border-gray-600 hover:border-gray-800 hover:shadow-lg transition-all duration-300 bg-white">
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4 text-white font-bold">6</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Security & Compliance</h3>
              <p className="text-gray-600 mb-4">Enterprise-grade security with role-based access, encryption, and comprehensive audit logs.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Role-based access</li>
                <li>✓ Data encryption</li>
                <li>✓ Audit trails</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Built for Everyone</h2>
            <p className="text-xl text-gray-600">Tailored workflows for each user role</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Faculty */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-l-4 border-blue-600">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Faculty</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Enter grades individually</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Bulk upload grades</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Save as draft</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Request corrections</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Track submissions</span>
                </li>
              </ul>
            </div>

            {/* Registrar */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-l-4 border-teal-600">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Registrar</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Verify grades</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Batch approvals</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Quality checks</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Generate reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>View audit logs</span>
                </li>
              </ul>
            </div>

            {/* Student */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-l-4 border-purple-600">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Student</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>View grades</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>Calculate GPA</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>Download transcript</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>Track progress</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>View analytics</span>
                </li>
              </ul>
            </div>

            {/* Admin */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-l-4 border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Admin</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-gray-700 font-bold">✓</span>
                  <span>Manage users</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-700 font-bold">✓</span>
                  <span>Configure courses</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-700 font-bold">✓</span>
                  <span>System reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-700 font-bold">✓</span>
                  <span>Settings</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-700 font-bold">✓</span>
                  <span>System logs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 rounded-3xl p-12 md:p-24 text-center text-white shadow-2xl relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400 rounded-full -ml-16 -mb-16"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">Ready to Transform Your Grade Management?</h2>
            <p className="text-lg md:text-xl mb-12 opacity-95 max-w-3xl mx-auto leading-relaxed">
              Join 100+ institutions that trust GradeHub to streamline grades, ensure accuracy, and save countless hours on administrative tasks.
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register" className="group relative px-12 py-5 rounded-xl font-bold text-lg bg-white text-blue-600 hover:shadow-2xl transition-all transform hover:-translate-y-1 hover:scale-105">
                <span className="relative z-10">Get Started Free</span>
                <div className="absolute inset-0 bg-blue-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link href="/login" className="group px-12 py-5 rounded-xl font-bold text-lg border-2 border-white text-white hover:bg-blue-700 transition-all transform hover:-translate-y-1">
                Sign In
              </Link>
            </div>
            
            <p className="text-sm opacity-75 mt-10">No credit card required. Free trial for 14 days.</p>
          </div>
        </div>
      </section>

      {/* Benefits & Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left side - Benefits */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Why Choose GradeHub?</h2>
              <p className="text-xl text-gray-600 mb-8">Experience the future of grade management with features designed specifically for educational institutions.</p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white text-lg font-bold">1</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Lightning Fast</h3>
                    <p className="text-gray-600">Process thousands of grades in seconds with our optimized system.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-teal-600 text-white text-lg font-bold">2</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Enterprise Security</h3>
                    <p className="text-gray-600">Bank-level encryption and compliance with FERPA, GDPR, and other regulations.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-600 text-white text-lg font-bold">3</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Role-Based Access</h3>
                    <p className="text-gray-600">Customizable permissions for faculty, registrars, students, and administrators.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-600 text-white text-lg font-bold">4</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Advanced Analytics</h3>
                    <p className="text-gray-600">Comprehensive reports and visualizations for data-driven decisions.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white text-lg font-bold">5</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Easy Integration</h3>
                    <p className="text-gray-600">Seamless API integration with your existing student information system.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Stats */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-blue-600">
                <div className="text-5xl font-bold text-blue-600 mb-2">50K+</div>
                <p className="text-xl text-gray-700 font-semibold">Students Managed</p>
                <p className="text-gray-600 mt-2">Across universities and colleges worldwide</p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-green-600">
                <div className="text-5xl font-bold text-green-600 mb-2">100+</div>
                <p className="text-xl text-gray-700 font-semibold">Institutions Trust Us</p>
                <p className="text-gray-600 mt-2">From small colleges to large universities</p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-purple-600">
                <div className="text-5xl font-bold text-purple-600 mb-2">99.9%</div>
                <p className="text-xl text-gray-700 font-semibold">Uptime Guarantee</p>
                <p className="text-gray-600 mt-2">Reliable 24/7 grade management system</p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-yellow-600">
                <div className="text-5xl font-bold text-yellow-600 mb-2">24/7</div>
                <p className="text-xl text-gray-700 font-semibold">Expert Support</p>
                <p className="text-gray-600 mt-2">Dedicated team ready to help anytime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration & API Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Works With Your Tools</h2>
            <p className="text-xl text-gray-600">GAMS integrates seamlessly with popular educational platforms</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">🎓</div>
              <p className="font-semibold text-gray-900">Canvas</p>
            </div>
            <div className="text-center p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">📚</div>
              <p className="font-semibold text-gray-900">Blackboard</p>
            </div>
            <div className="text-center p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">🔧</div>
              <p className="font-semibold text-gray-900">Moodle</p>
            </div>
            <div className="text-center p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">💼</div>
              <p className="font-semibold text-gray-900">Ellucian</p>
            </div>
          </div>

          <div className="mt-16 bg-gray-50 rounded-xl p-12 text-center border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Custom Integration?</h3>
            <p className="text-gray-600 mb-6 text-lg">Our REST API and webhooks make it easy to build custom integrations with any system.</p>
            <button className="button-primary px-8 py-3">
              View API Documentation
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about GradeHub</p>
          </div>

          <div className="space-y-6">
            {/* FAQ 1 */}
            <details className="bg-gray-50 rounded-lg p-6 border border-gray-200 cursor-pointer group">
              <summary className="flex items-center justify-between font-semibold text-gray-900 text-lg hover:text-blue-600 transition-colors">
                <span>How secure is the grade data?</span>
                <span className="text-2xl group-open:rotate-180 transition-transform">›</span>
              </summary>
              <p className="text-gray-600 mt-4">
                We use industry-standard encryption (AES-256) for all data at rest and TLS 1.3 for data in transit. 
                All data is stored in secure Firebase infrastructure with automatic backups. We comply with FERPA, GDPR, and other data protection regulations.
              </p>
            </details>

            {/* FAQ 2 */}
            <details className="bg-gray-50 rounded-lg p-6 border border-gray-200 cursor-pointer group">
              <summary className="flex items-center justify-between font-semibold text-gray-900 text-lg hover:text-blue-600 transition-colors">
                <span>Can we integrate GradeHub with our existing systems?</span>
                <span className="text-2xl group-open:rotate-180 transition-transform">›</span>
              </summary>
              <p className="text-gray-600 mt-4">
                Yes! GradeHub provides a comprehensive API and supports integration with popular systems. 
                We can help with custom integrations for SIS, ERP, and other platforms. Contact our sales team for enterprise integration options.
              </p>
            </details>

            {/* FAQ 3 */}
            <details className="bg-gray-50 rounded-lg p-6 border border-gray-200 cursor-pointer group">
              <summary className="flex items-center justify-between font-semibold text-gray-900 text-lg hover:text-blue-600 transition-colors">
                <span>What if we need to migrate our existing data?</span>
                <span className="text-2xl group-open:rotate-180 transition-transform">›</span>
              </summary>
              <p className="text-gray-600 mt-4">
                We provide free data migration services for all plans. Our technical team will help you safely transfer your existing grade data 
                into GradeHub without any loss or downtime. Migration typically takes 1-3 days depending on data volume.
              </p>
            </details>

            {/* FAQ 4 */}
            <details className="bg-gray-50 rounded-lg p-6 border border-gray-200 cursor-pointer group">
              <summary className="flex items-center justify-between font-semibold text-gray-900 text-lg hover:text-blue-600 transition-colors">
                <span>Is there training and support available?</span>
                <span className="text-2xl group-open:rotate-180 transition-transform">›</span>
              </summary>
              <p className="text-gray-600 mt-4">
                Absolutely! We provide comprehensive onboarding, video tutorials, documentation, and live support. 
                Professional and Enterprise plans include dedicated training sessions for your entire team.
              </p>
            </details>

            {/* FAQ 5 */}
            <details className="bg-gray-50 rounded-lg p-6 border border-gray-200 cursor-pointer group">
              <summary className="flex items-center justify-between font-semibold text-gray-900 text-lg hover:text-blue-600 transition-colors">
                <span>Can we customize the workflows for our institution?</span>
                <span className="text-2xl group-open:rotate-180 transition-transform">›</span>
              </summary>
              <p className="text-gray-600 mt-4">
                Yes, GradeHub is highly customizable. You can configure approval workflows, permission rules, reporting formats, and more. 
                Enterprise customers can request custom development for specific needs.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-20 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">GH</span>
                </div>
                <h3 className="font-bold text-white text-lg">GradeHub</h3>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">The premier platform for streamlined academic grade management, verification, and reporting.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wide">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#roles" className="hover:text-blue-400 transition-colors">Roles</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wide">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wide">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Status Page</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Legal</p>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Compliance</p>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-blue-400 transition-colors">FERPA Compliant</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">GDPR Ready</a></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Connect</p>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">LinkedIn</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 text-center">
              <p className="text-sm text-gray-500">© 2025 GradeHub. All rights reserved. Built for educational excellence.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
