'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Logo } from '@/components/ui/logo';
import { Download, ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';

export default function InvoicePage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('hosting_invoices')
        .select('*, hosting_orders(*)')
        .eq('id', params.id as string)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        setInvoice(null);
      } else {
        setInvoice(data);
      }
      setLoading(false);
    };

    fetchInvoice();
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  if (!invoice) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Invoice Not Found</h1>
      <Link href="/portal/dashboard" className="text-primary hover:underline">Return to Dashboard</Link>
    </div>
  );

  const issueDate = new Date(invoice.created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const invoiceNumber = invoice.invoice_number || `INV-${invoice.id.split('-')[0].toUpperCase()}`;
  const order = invoice.hosting_orders || {};
  const currency = invoice.currency || order.currency || 'INR';
  const symbol = currency === 'INR' ? '₹' : '$';

  const subtotal = Number(order.subtotal ?? invoice.amount ?? 0);
  const discountAmount = Number(order.discount_amount ?? 0);
  const taxAmount = Number(invoice.tax_amount ?? order.tax_amount ?? 0);
  const totalAmount = Number(invoice.total ?? order.total ?? Math.max(0, subtotal - discountAmount + taxAmount));
  const taxRatePct = subtotal - discountAmount > 0 && taxAmount > 0
    ? Math.round((taxAmount / Math.max(1, subtotal - discountAmount)) * 100)
    : 0;
  const status = (invoice.status || 'pending').toUpperCase();

  let orderNotes: any = {};
  try {
    if (order.notes) {
      orderNotes = typeof order.notes === 'string' ? JSON.parse(order.notes) : order.notes;
    }
  } catch {}

  return (
    <div className="min-h-screen bg-white text-black py-8 px-4 sm:px-8">
      {/* Non-printable controls */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
        <Link href="/portal/billing" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black">
          <ArrowLeft className="h-4 w-4" /> Back to Billing
        </Link>
        <div className="flex gap-4">
          {invoice.pdf_url && (
            <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200">
              <Download className="h-4 w-4" /> Download Official Receipt
            </a>
          )}
          <button onClick={handlePrint} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Printer className="h-4 w-4" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Printable Invoice Area */}
      <div className="max-w-4xl mx-auto border border-gray-200 p-8 sm:p-12 bg-white shadow-sm print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
          <div>
            <div className="mb-4">
              <Logo />
            </div>
            <h2 className="text-gray-800 font-semibold text-sm">ELSxGlobal — VaultHost Cloud Infrastructure</h2>
            <p className="text-gray-500 text-sm">Enterprise Data Centers · Mumbai · Pune · Delhi NCR</p>
            <p className="text-gray-500 text-sm">billing@elsxglobal.cloud</p>
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-light text-gray-300 mb-2 tracking-widest uppercase">Invoice</h1>
            <p className="text-sm font-semibold"># {invoiceNumber}</p>
            <p className="text-sm text-gray-500 mt-1">Date: {issueDate}</p>
            {invoice.transaction_id && (
              <p className="text-xs text-gray-500 mt-0.5 font-mono">Txn: {invoice.transaction_id}</p>
            )}
            <div className={`mt-4 inline-block px-3 py-1 text-xs font-bold rounded-sm border ${status === 'PAID' ? 'text-green-600 border-green-600' : status === 'REFUNDED' ? 'text-purple-600 border-purple-600' : 'text-amber-600 border-amber-600'}`}>
              {status}
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-12">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
          <p className="font-medium text-lg">{order.user_email || orderNotes.user_email || 'Customer'}</p>
          <p className="text-gray-500 text-sm">Customer ID: {invoice.user_id ? invoice.user_id.split('-')[0].toUpperCase() : 'Unknown'}</p>
          {order.server_location && (
            <p className="text-gray-500 text-xs mt-1 uppercase">Region: {order.server_location}</p>
          )}
        </div>

        {/* Line Items */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] mb-12">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500 text-left">
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold text-right">Term / Cycle</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-gray-100">
                <td className="py-4">
                  <p className="font-medium">{order.plan_name || 'VaultHost Cloud Service'}</p>
                  {order.domain && <p className="text-gray-500 text-xs mt-1">Domain: {order.domain}</p>}
                  {orderNotes.custom_vcpu && (
                    <p className="text-gray-500 text-xs mt-0.5">
                      Specs: {orderNotes.custom_vcpu} vCPU · {orderNotes.custom_ram} GB RAM · {orderNotes.custom_storage} GB NVMe
                    </p>
                  )}
                  {order.billing_cycle === 'pay_as_you_go' && orderNotes.hourly_rate && (
                    <p className="text-gray-500 text-xs mt-0.5">Metered Rate: ₹{orderNotes.hourly_rate}/hr (30-day prepaid cap)</p>
                  )}
                </td>
                <td className="py-4 text-right capitalize">{(order.billing_cycle || 'monthly').replace(/_/g, ' ')}</td>
                <td className="py-4 text-right font-mono">{symbol}{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-16">
          <div className="w-72">
            <div className="flex justify-between py-2 text-sm text-gray-500">
              <span>Subtotal</span>
              <span className="font-mono">{symbol}{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between py-2 text-sm text-green-600">
                <span>Discount / Credits</span>
                <span className="font-mono">- {symbol}{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between py-2 text-sm text-gray-500">
              <span>GST / Tax ({taxRatePct}%)</span>
              <span className="font-mono">{symbol}{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between py-3 border-t border-gray-200 text-lg font-semibold">
              <span>Total</span>
              <span className="font-mono">{symbol}{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-400">
          <p>Thank you for choosing VaultHost by ELSxGlobal.</p>
          <p>For billing or technical support, open a ticket in your Client Portal.</p>
        </div>
      </div>
    </div>
  );
}
