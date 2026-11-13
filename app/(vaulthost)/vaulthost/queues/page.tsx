'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { 
  Inbox, Clock, Copy, GitMerge, ListOrdered, 
  Cpu, ArrowRight, CheckCircle, Mail, ImageIcon, ServerCrash, Check
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    title: "Exactly-Once Delivery",
    description: "Never process a payment twice. VaultQueues guarantees exactly-once delivery semantics for your most critical messages.",
    icon: <CheckCircle className="w-5 h-5 text-signal" />
  },
  {
    title: "Dead Letter Queues",
    description: "Automatically route failed messages to a DLQ after reaching your max retry count. Inspect and replay them later.",
    icon: <Inbox className="w-5 h-5 text-signal" />
  },
  {
    title: "Batch Processing",
    description: "Consume up to 100 messages simultaneously in a single Worker invocation. Maximize throughput and lower execution costs.",
    icon: <Copy className="w-5 h-5 text-signal" />
  },
  {
    title: "Delay Queues",
    description: "Schedule messages to become visible in the future. Delay delivery anywhere from 1 second up to 42 days.",
    icon: <Clock className="w-5 h-5 text-signal" />
  },
  {
    title: "FIFO Ordering",
    description: "Strict First-In-First-Out ordering guarantees. Ideal for state machines or sequential event sourcing architectures.",
    icon: <ListOrdered className="w-5 h-5 text-signal" />
  },
  {
    title: "Workers Consumer",
    description: "Process messages serverlessly. Our Edge Workers automatically scale up to handle massive queue backlogs in seconds.",
    icon: <Cpu className="w-5 h-5 text-signal" />
  }
];

const queueTypes = [
  {
    title: "Standard Queue",
    description: "High throughput, at-least-once delivery. Best for massive scale background tasks where order doesn't strictly matter.",
    ideal: "Webhooks, Logs, Email blasts"
  },
  {
    title: "FIFO Queue",
    description: "Ordered delivery, exactly-once processing. When sequence and strict deduplication are absolutely critical.",
    ideal: "Financial transactions, State updates"
  },
  {
    title: "Priority Queue",
    description: "Assign weight to messages. Ensure critical notifications jump the line ahead of background maintenance tasks.",
    ideal: "Premium user tasks, Urgent alerts"
  }
];

export default function QueuesPage() {
  return (
    <div className="v4-page">
      <PageHeroV4
        eyebrow="VaultQueues"
        title={<>Reliable Message Queuing. <span className="text-signal">Built for Edge.</span></>}
        description="Durable, scalable message queues with guaranteed delivery. Decouple your services, handle traffic spikes, and process jobs reliably — with Workers or HTTP consumers."
      />

      {/* Stats Bar */}
      <section className="v4-section-sm border-b border-hairline bg-ink-surface-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">Exactly-once</div>
              <div className="text-sm text-text-muted-v4">Delivery Guarantee</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">DLQ</div>
              <div className="text-sm text-text-muted-v4">Dead Letter Queues</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">100</div>
              <div className="text-sm text-text-muted-v4">Batch Consumer Size</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">&lt;50ms</div>
              <div className="text-sm text-text-muted-v4">Publish Latency</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="v4-display text-text-primary-v4 text-center mb-16">Enterprise-grade Messaging</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 0.1}>
                <PanelCard className="h-full bg-ink-surface-2 p-6">
                  <div className="w-10 h-10 rounded-lg bg-ink border border-hairline flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary-v4 mb-3">{feature.title}</h3>
                  <p className="text-text-secondary-v4 text-sm leading-relaxed">{feature.description}</p>
                </PanelCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Queue Types */}
      <section className="v4-section bg-ink-surface-2 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">A Queue for Every Architecture</h2>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {queueTypes.map((qt, i) => (
              <ScrollReveal key={qt.title} delay={i * 0.1}>
                <PanelCard className="h-full bg-ink p-8 border-hairline">
                  <h3 className="text-2xl font-semibold text-text-primary-v4 mb-4">{qt.title}</h3>
                  <p className="text-text-secondary-v4 mb-6">{qt.description}</p>
                  <div className="pt-4 border-t border-hairline">
                    <span className="text-xs text-text-muted-v4 uppercase tracking-wider font-semibold">Ideal For:</span>
                    <p className="text-signal text-sm mt-1">{qt.ideal}</p>
                  </div>
                </PanelCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Code Sample */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="v4-display text-text-primary-v4 mb-6">Simple API</h2>
                <p className="text-text-secondary-v4 text-lg mb-8">
                  Produce and consume messages with just a few lines of code. VaultQueues handles the complex distributed systems problems like locking, visibility timeouts, and retries for you.
                </p>
                
                <h4 className="text-text-primary-v4 font-semibold mb-3">Popular Use Cases</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-text-secondary-v4 text-sm"><Mail className="w-4 h-4 text-signal" /> Asynchronous Email Sending</li>
                  <li className="flex items-center gap-3 text-text-secondary-v4 text-sm"><ImageIcon className="w-4 h-4 text-signal" /> Image / Video Processing Jobs</li>
                  <li className="flex items-center gap-3 text-text-secondary-v4 text-sm"><GitMerge className="w-4 h-4 text-signal" /> Webhook Fan-out & Retries</li>
                  <li className="flex items-center gap-3 text-text-secondary-v4 text-sm"><ServerCrash className="w-4 h-4 text-signal" /> Traffic Spike Buffering</li>
                </ul>
              </div>

              <div className="bg-[#0D1117] border border-hairline rounded-xl p-6 overflow-x-auto shadow-2xl">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <pre className="text-sm font-mono text-gray-300">
                  <code dangerouslySetInnerHTML={{ __html: `// 1. Publish to the Queue\nawait env.MY_QUEUE.send({\n  userId: 'usr_123',\n  action: 'send_welcome_email',\n  timestamp: Date.now()\n});\n\n// 2. Consume from the Queue (Edge Worker)\nexport default {\n  async queue(batch, env) {\n    for (const msg of batch.messages) {\n      try {\n        await processJob(msg.body);\n        msg.ack(); // Mark successful\n      } catch (err) {\n        msg.retry(); // Return to queue\n      }\n    }\n  }\n}` }} />
                </pre>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing */}
      {/* Pricing */}
      <section className="v4-section border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="v4-display text-text-primary-v4 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-text-secondary-v4">Higher than GoDaddy. Way below AWS.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Free tier */}
            <div className="v4-panel rounded-2xl p-6 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-medium mb-2">FREE</div>
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹0 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">Zero-cost message queuing for background jobs and tasks.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 1M operations / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Standard FIFO message ordering</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 128KB payload size</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 4-day message retention</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Community support</li>
                </ul>
              </div>
              <Link href="/vaulthost/signup" className="v4-btn-secondary rounded-btn w-full text-center block py-2.5">Start Free</Link>
            </div>
            {/* Pro tier — highlighted */}
            <div className="v4-panel rounded-2xl p-6 border-2 border-signal relative flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-signal text-ink text-xs font-semibold px-3 py-1 rounded-full">MOST POPULAR</div>
              <div>
                <div className="text-signal text-sm font-medium mb-2">PRO</div>
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹499 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">High-throughput message broker with delay queues &amp; retries.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 50M operations / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Delay &amp; priority queues up to 14 days</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Dead-letter queues (DLQ) with retries</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 256KB payload size</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Priority email support</li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=queues-pro" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
            </div>
            {/* Business tier */}
            <div className="v4-panel rounded-2xl p-6 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-medium mb-2">BUSINESS</div>
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹1,999 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">Enterprise event fabric with guaranteed SLA and unlimited ops.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited operations / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 1MB payload size support</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 30-day message retention</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Private VPC peering &amp; webhook fanout</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 99.99% delivery SLA &amp; dedicated support</li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=queues-business" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
            </div>
          </div>
          {/* Competitor comparison */}
          <div className="border border-hairline rounded-2xl overflow-hidden mb-12">
            <table className="w-full text-sm">
              <thead className="bg-ink-surface-2 text-text-secondary-v4">
                <tr>
                  <th className="py-3 px-4 text-left font-medium">Provider</th>
                  <th className="py-3 px-4 text-left font-medium">Pricing</th>
                  <th className="py-3 px-4 text-left font-medium">Comparison / Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                <tr className="bg-signal/5">
                  <td className="py-3 px-4 font-semibold text-signal">VaultHost Queues</td>
                  <td className="py-3 px-4 font-medium text-text-primary-v4">₹0 Free / ₹499 Pro / ₹1,999 Business</td>
                  <td className="py-3 px-4 text-text-secondary-v4">RabbitMQ engine, exactly-once delivery, delay queues, zero server management</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">AWS SQS</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹2,500+/mo for 50M ops</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹35/M requests + extra data transfer and multi-region outbound charges</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">Cloudflare Queues</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹420 base + ₹35/M ops</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Restricted solely to Cloudflare Workers scripts, cannot consume from external microservices</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">CloudAMQP</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹1,580 - ₹8,200/mo</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Unmanaged cluster sizing, queue connection limits, and strict RAM ceilings</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
