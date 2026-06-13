import { motion } from 'motion/react';
import { AlertCircle, Mail, FileText, Clock, CheckCircle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ComplaintsPolicyPage() {
  return (
    <>
      <title>Complaints Policy - JA Group Services</title>
      <meta name="description" content="Our complaints policy and procedure. Learn how to raise concerns and how we handle complaints professionally and transparently." />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-[#0A1F44] to-[#1e3a5f] text-white py-20 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-full mb-6 border border-blue-300/30">
                <Shield className="w-4 h-4 text-blue-300" />
                <span className="text-blue-200 text-sm font-semibold tracking-wide">CORPORATE POLICY</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Complaints Policy</h1>
              <p className="text-xl text-white/90 leading-relaxed">
                We are committed to handling all complaints professionally, transparently, and in accordance with our governance standards.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Introduction */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-l-4 border-l-[#2563eb]">
                <CardContent className="pt-6">
                  <p className="text-[#0A1F44]/80 leading-relaxed">
                    At JA Group Services Ltd, we value feedback and take all complaints seriously. This policy outlines how we receive, investigate, and resolve complaints in a fair, timely, and professional manner.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* What is a Complaint */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#0A1F44]">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-[#2563eb]" />
                    </div>
                    What is a Complaint?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[#0A1F44]/80 leading-relaxed">
                    A complaint is an expression of dissatisfaction about our services, actions, or lack of action by our company or staff. This may include:
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="text-[#0A1F44]/80 flex items-start gap-2">
                      <span className="text-[#2563eb] mt-1">•</span>
                      <span>Service quality or delivery issues</span>
                    </li>
                    <li className="text-[#0A1F44]/80 flex items-start gap-2">
                      <span className="text-[#2563eb] mt-1">•</span>
                      <span>Communication or response time concerns</span>
                    </li>
                    <li className="text-[#0A1F44]/80 flex items-start gap-2">
                      <span className="text-[#2563eb] mt-1">•</span>
                      <span>Billing or contractual disputes</span>
                    </li>
                    <li className="text-[#0A1F44]/80 flex items-start gap-2">
                      <span className="text-[#2563eb] mt-1">•</span>
                      <span>Staff conduct or professionalism</span>
                    </li>
                    <li className="text-[#0A1F44]/80 flex items-start gap-2">
                      <span className="text-[#2563eb] mt-1">•</span>
                      <span>Data protection or privacy concerns</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* How to Make a Complaint */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#0A1F44]">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-[#2563eb]" />
                    </div>
                    How to Make a Complaint
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-[#0A1F44] mb-3">Step 1: Contact Us</h4>
                    <p className="text-[#0A1F44]/80 leading-relaxed mb-4">
                      Please submit your complaint in writing to our dedicated complaints email address:
                    </p>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-[#2563eb]" />
                        <a href="mailto:complaints@jagroupservices.co.uk" className="text-[#2563eb] font-semibold hover:underline">
                          complaints@jagroupservices.co.uk
                        </a>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-[#0A1F44] mb-3">Step 2: Provide Details</h4>
                    <p className="text-[#0A1F44]/80 leading-relaxed mb-3">
                      To help us investigate your complaint effectively, please include:
                    </p>
                    <ul className="space-y-2 ml-6">
                      <li className="text-[#0A1F44]/80 flex items-start gap-2">
                        <span className="text-[#2563eb] mt-1">•</span>
                        <span>Your full name and contact details</span>
                      </li>
                      <li className="text-[#0A1F44]/80 flex items-start gap-2">
                        <span className="text-[#2563eb] mt-1">•</span>
                        <span>A clear description of the issue</span>
                      </li>
                      <li className="text-[#0A1F44]/80 flex items-start gap-2">
                        <span className="text-[#2563eb] mt-1">•</span>
                        <span>Relevant dates, times, and reference numbers</span>
                      </li>
                      <li className="text-[#0A1F44]/80 flex items-start gap-2">
                        <span className="text-[#2563eb] mt-1">•</span>
                        <span>Any supporting documentation or evidence</span>
                      </li>
                      <li className="text-[#0A1F44]/80 flex items-start gap-2">
                        <span className="text-[#2563eb] mt-1">•</span>
                        <span>Your desired outcome or resolution</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Our Complaints Process */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#0A1F44]">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="w-5 h-5 text-[#2563eb]" />
                    </div>
                    Our Complaints Process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Stage 1 */}
                    <div className="relative pl-8 pb-6 border-l-2 border-[#2563eb]/30">
                      <div className="absolute left-0 top-0 -translate-x-1/2 w-8 h-8 bg-[#2563eb] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                      <h4 className="font-semibold text-[#0A1F44] mb-2">Acknowledgment (Within 2 Business Days)</h4>
                      <p className="text-[#0A1F44]/80 leading-relaxed">
                        We will acknowledge receipt of your complaint and provide a reference number for tracking purposes.
                      </p>
                    </div>

                    {/* Stage 2 */}
                    <div className="relative pl-8 pb-6 border-l-2 border-[#2563eb]/30">
                      <div className="absolute left-0 top-0 -translate-x-1/2 w-8 h-8 bg-[#2563eb] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        2
                      </div>
                      <h4 className="font-semibold text-[#0A1F44] mb-2">Investigation (Within 10 Business Days)</h4>
                      <p className="text-[#0A1F44]/80 leading-relaxed">
                        A designated complaints officer will investigate the matter thoroughly, reviewing all relevant information and speaking with involved parties.
                      </p>
                    </div>

                    {/* Stage 3 */}
                    <div className="relative pl-8 pb-6 border-l-2 border-[#2563eb]/30">
                      <div className="absolute left-0 top-0 -translate-x-1/2 w-8 h-8 bg-[#2563eb] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        3
                      </div>
                      <h4 className="font-semibold text-[#0A1F44] mb-2">Response (Within 15 Business Days)</h4>
                      <p className="text-[#0A1F44]/80 leading-relaxed">
                        We will provide a detailed written response outlining our findings, any actions taken, and proposed resolution.
                      </p>
                    </div>

                    {/* Stage 4 */}
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-0 -translate-x-1/2 w-8 h-8 bg-[#2563eb] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        4
                      </div>
                      <h4 className="font-semibold text-[#0A1F44] mb-2">Escalation (If Required)</h4>
                      <p className="text-[#0A1F44]/80 leading-relaxed">
                        If you are not satisfied with our response, you may request an escalation to senior management for further review.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Our Commitments */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#0A1F44]">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-[#2563eb]" />
                    </div>
                    Our Commitments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <h4 className="font-semibold text-[#0A1F44] mb-2">Impartiality</h4>
                      <p className="text-sm text-[#0A1F44]/70">
                        All complaints are handled fairly and without bias.
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <h4 className="font-semibold text-[#0A1F44] mb-2">Confidentiality</h4>
                      <p className="text-sm text-[#0A1F44]/70">
                        Your complaint details are kept confidential and secure.
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <h4 className="font-semibold text-[#0A1F44] mb-2">Transparency</h4>
                      <p className="text-sm text-[#0A1F44]/70">
                        We provide clear explanations of our findings and actions.
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <h4 className="font-semibold text-[#0A1F44] mb-2">Continuous Improvement</h4>
                      <p className="text-sm text-[#0A1F44]/70">
                        We learn from complaints to improve our services.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-slate-50 to-white border-2 border-[#2563eb]/20">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold text-[#0A1F44]">Need to Make a Complaint?</h3>
                    <p className="text-[#0A1F44]/70">
                      Contact our complaints team directly:
                    </p>
                    <div className="flex flex-col items-center gap-3">
                      <a
                        href="mailto:complaints@jagroupservices.co.uk"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563eb] text-white rounded-lg font-semibold hover:bg-[#1d4ed8] transition-colors"
                      >
                        <Mail className="w-5 h-5" />
                        complaints@jagroupservices.co.uk
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Company Information */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-slate-50 rounded-lg p-6 border border-slate-200"
            >
              <div className="text-center space-y-2">
                <p className="text-sm text-[#0A1F44]/60">
                  <strong className="text-[#0A1F44]">JA Group Services Ltd</strong> • Company No. 16314179
                </p>
                <p className="text-sm text-[#0A1F44]/60">
                  Registered in England and Wales
                </p>
                <p className="text-sm text-[#0A1F44]/60">
                  Last Updated: February 2026
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
