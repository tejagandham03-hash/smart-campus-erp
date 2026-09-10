import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import StudentNavbar from '../../components/common/StudentNavbar';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Receipt,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';

const FeesPage = () => {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [fees, setFees] = useState([]);
  const [payingFee, setPayingFee] = useState(null);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      const profileRes = await API.get('/user/profile');
      const student = profileRes.data?.data?.additionalData;
      setStudentData(student);

      if (student?._id) {
        const feeRes = await API.get(`/fees?student=${student._id}`);
        setFees(feeRes.data?.data || []);
      }
    } catch (err) {
      console.error('Error fetching fees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeData();
  }, []);

  const totalFee = fees.reduce((acc, f) => acc + (f.amount || 0), 0);
  const totalPaid = fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
  const totalDue = Math.max(0, totalFee - totalPaid);

  const handlePayFee = async (e) => {
    e.preventDefault();
    if (!payingFee) return;

    setIsProcessing(true);
    try {
      const remaining = payingFee.amount - (payingFee.paidAmount || 0);
      const newPaidAmount = payingFee.amount;
      const transactionId = `PBS_ONLINE_${Date.now()}`;

      await API.put(`/fees/${payingFee._id}`, {
        paidAmount: newPaidAmount,
        status: 'paid',
        paymentDate: new Date(),
        transactionId,
      });

      setPaymentSuccessMsg(`Payment of ₹${remaining.toLocaleString()} processed successfully! Txn ID: ${transactionId}`);
      setPayingFee(null);
      await fetchFeeData();
      setTimeout(() => setPaymentSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Payment failed', err);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <StudentNavbar studentData={studentData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <CreditCard className="w-6 h-6 text-indigo-600" />
              Semester Tuition & Examination Fees
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              PB Siddhartha College of Arts & Science • Accounts & Fee Portal
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 font-semibold">
              Roll No: {studentData?.studentId || 'N/A'}
            </span>
          </div>
        </div>

        {paymentSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{paymentSuccessMsg}</span>
          </div>
        )}

        {/* 3 Dynamic Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Total Autonomous Fee</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
              ₹{totalFee.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-2">Tuition, Lab & Exam assessment dues</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Total Cleared</span>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              ₹{totalPaid.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-2">Verified bank payments</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Outstanding Balance Due</span>
            <p className={`text-3xl font-black mt-2 ${totalDue === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ₹{totalDue.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {totalDue === 0 ? 'All dues fully cleared' : 'Due by specified semester deadline'}
            </p>
          </div>
        </div>

        {/* Fee Invoices & Payment Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            Semester Fee Statements & Invoices
          </h3>

          {loading ? (
            <p className="text-xs text-slate-500 py-6 text-center">Loading fee statements...</p>
          ) : fees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-750 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Fee Type</th>
                    <th className="px-4 py-3">Academic Year</th>
                    <th className="px-4 py-3">Semester</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Total Amount</th>
                    <th className="px-4 py-3">Paid Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {fees.map((fee, i) => {
                    const balance = (fee.amount || 0) - (fee.paidAmount || 0);
                    const isPaid = fee.status === 'paid' || balance === 0;
                    return (
                      <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-750/50">
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{fee.feeType}</p>
                          {fee.transactionId && (
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Txn: {fee.transactionId}</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-medium">{fee.academicYear || '2024-2025'}</td>
                        <td className="px-4 py-3.5 font-semibold">Semester {fee.semester || 1}</td>
                        <td className="px-4 py-3.5 text-slate-500">
                          {new Date(fee.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold">₹{fee.amount.toLocaleString()}</td>
                        <td className="px-4 py-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{(fee.paidAmount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5">
                          {isPaid ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                              Paid
                            </span>
                          ) : fee.status === 'partially_paid' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                              Partial (Due ₹{balance.toLocaleString()})
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                            </span>
                          ) : (
                            <button
                              onClick={() => setPayingFee(fee)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition"
                            >
                              Pay Now (₹{balance.toLocaleString()})
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No fee records found for this student.</p>
          )}
        </div>

        {/* Payment Modal */}
        {payingFee && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  PBS Secure Payment Portal
                </h4>
                <button
                  onClick={() => setPayingFee(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-750 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fee Purpose:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{payingFee.feeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Semester:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Semester {payingFee.semester}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-sm">
                  <span>Balance Due:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    ₹{(payingFee.amount - (payingFee.paidAmount || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <form onSubmit={handlePayFee} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Payment Method
                  </label>
                  <select className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750">
                    <option>Siddhartha Academy Gateway (UPI / Net Banking)</option>
                    <option>State Bank of India (SB Collect)</option>
                    <option>Debit / Credit Card</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setPayingFee(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-2"
                  >
                    {isProcessing ? 'Processing Payment...' : 'Confirm & Pay'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FeesPage;