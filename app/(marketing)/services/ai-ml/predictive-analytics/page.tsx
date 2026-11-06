'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { LineChart, Activity, AlertTriangle, DollarSign, Database, BrainCircuit, ArrowRight, GitMerge } from 'lucide-react';

export default function PredictiveAnalyticsPage() {
  return (
    <main className="v4-page">
      <PageHeroV4 
        eyebrow="Predictive Analytics"
        title={<>Turn Historical Data Into <span className="text-signal">Future Revenue</span></>}
        description="Leverage machine learning to forecast trends, identify risks, and optimize operations. We build robust predictive models that transform your raw data into actionable foresight."
      />

      <section className="v4-section">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">High-Impact Use Cases</h2>
              <p className="text-text-secondary-v4 text-lg">We focus on predictive models that deliver measurable ROI across critical business functions.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Demand Forecasting', desc: 'Optimize inventory and supply chain based on highly accurate demand predictions.', icon: LineChart },
              { title: 'Churn Prediction', desc: 'Identify at-risk customers before they leave and trigger targeted retention campaigns.', icon: Activity },
              { title: 'Risk Management', desc: 'Detect anomalies and predict fraudulent activities or system failures.', icon: AlertTriangle },
              { title: 'Dynamic Pricing', desc: 'Adjust prices in real-time based on demand signals and market conditions.', icon: DollarSign }
            ].map((useCase, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <PanelCard className="p-8 h-full">
                  <useCase.icon className="w-8 h-8 text-signal mb-4" />
                  <h3 className="text-xl font-bold text-text-primary-v4 mb-3">{useCase.title}</h3>
                  <p className="text-text-secondary-v4">{useCase.desc}</p>
                </PanelCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="v4-section bg-ink-surface border-y border-hairline">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">Advanced Model Architectures</h2>
              <p className="text-text-secondary-v4 text-lg mb-6">Our data scientists select the right algorithmic approach based on your data topology and business objectives.</p>
              
              <ul className="space-y-4">
                {[
                  'Time Series Forecasting (ARIMA, Prophet, LSTM)',
                  'Classification & Regression (XGBoost, Random Forest)',
                  'Deep Learning (Neural Networks)',
                  'Survival Analysis'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-text-primary-v4 font-medium">
                    <BrainCircuit className="w-5 h-5 text-signal" />
                    {item}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <div className="v4-panel p-8 bg-ink border border-signal/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Database className="w-48 h-48" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary-v4 mb-6 relative z-10">Data Pipeline Architecture</h3>
                <div className="space-y-6 relative z-10">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded bg-signal/20 flex items-center justify-center text-signal font-bold mt-1">1</div>
                    <div>
                      <h4 className="font-semibold text-text-primary-v4">Ingestion & ETL</h4>
                      <p className="text-sm text-text-secondary-v4">Aggregating siloed data using Snowflake, dbt, or Airflow.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded bg-signal/20 flex items-center justify-center text-signal font-bold mt-1">2</div>
                    <div>
                      <h4 className="font-semibold text-text-primary-v4">Feature Engineering</h4>
                      <p className="text-sm text-text-secondary-v4">Extracting meaningful signals from raw data lakes.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded bg-signal/20 flex items-center justify-center text-signal font-bold mt-1">3</div>
                    <div>
                      <h4 className="font-semibold text-text-primary-v4">Model Training & MLOps</h4>
                      <p className="text-sm text-text-secondary-v4">Automated retraining pipelines using Vertex AI or SageMaker.</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="v4-section-sm text-center">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-text-primary-v4 mb-6">See the future of your business</h2>
            <div className="flex justify-center">
              <Link href="/contact" className="v4-btn-primary">
                Schedule an AI Assessment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
