import { Metadata } from 'next'
import Link from 'next/link'
import { Scale, FileText, Shield, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Legal — VaultHost',
  description: 'Legal information, terms of service, and policies for VaultHost.',
}

export default function LegalIndexPage() {
  const legalDocs = [
    {
      title: 'Terms of Service',
      description: 'The terms and conditions governing your use of VaultHost services.',
      href: '/vaulthost/legal/terms',
      icon: <FileText className="w-6 h-6 text-blue-400" />
    },
    {
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect your personal information.',
      href: '/vaulthost/legal/privacy',
      icon: <Shield className="w-6 h-6 text-green-400" />
    },
    {
      title: 'Service Level Agreement',
      description: 'Our commitment to uptime and service reliability guarantees.',
      href: '/vaulthost/legal/sla',
      icon: <Scale className="w-6 h-6 text-purple-400" />
    }
  ]

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Simple Hero Section */}
        <div className="text-center mb-16 pt-12">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4 text-white">
            Legal & Policies
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Everything you need to know about our terms, privacy practices, and service guarantees.
          </p>
        </div>

        {/* Legal Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {legalDocs.map((doc, idx) => (
            <Link 
              key={idx}
              href={doc.href}
              className="v4-panel border-hairline p-8 rounded-2xl group hover:border-white/20 transition-all duration-300 flex flex-col h-full"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
                {doc.icon}
              </div>
              <h3 className="text-xl font-medium text-white mb-3">
                {doc.title}
              </h3>
              <p className="text-white/60 mb-8 flex-grow">
                {doc.description}
              </p>
              
              <div className="flex items-center text-sm font-medium text-white/80 group-hover:text-white transition-colors mt-auto">
                Read Document
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  )
}
