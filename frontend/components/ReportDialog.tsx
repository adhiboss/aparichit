"use client";

import React, { useState } from "react";
import { X, Flag, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { submitReport } from "@/lib/reports";
import { getSavedAccount } from "@/lib/storage";

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "post" | "reply";
  targetId: string;
}

const REPORT_REASONS = [
  { id: "harassment", label: "Harassment, bullying, or hate speech" },
  { id: "spam", label: "Spam, advertising, or repetitive content" },
  { id: "inappropriate", label: "Inappropriate, graphic, or offensive material" },
  { id: "other", label: "Other violation of community guidelines" },
];

export const ReportDialog: React.FC<ReportDialogProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
}) => {
  const [reason, setReason] = useState("inappropriate");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const account = getSavedAccount();
      const token = account?.session_token;

      await submitReport(
        {
          target_type: targetType,
          target_id: targetId,
          reason,
        },
        token
      );

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to file report.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#242830] border border-[#2E333D] shadow-2xl p-6 relative text-[#E7E1D5] space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#9EA3AF] hover:text-[#E7E1D5] rounded-lg hover:bg-[#1E222A] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#E7E1D5]">Report Community Content</h3>
            <p className="text-xs text-[#9EA3AF]">
              Flag this {targetType} for human moderation review.
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-[#E7E1D5]">
              Report submitted successfully
            </p>
            <p className="text-xs text-[#9EA3AF]">
              Thank you for keeping our community safe. Our team will review this shortly.
            </p>
          </div>
        ) : (
          <>
            {/* Reason Radio Group */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#9EA3AF]">
                Select reason for reporting:
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                      reason === r.id
                        ? "bg-[#1E222A] border-[#B69A61] text-[#E7E1D5]"
                        : "bg-[#1E222A]/50 border-[#2E333D] text-[#9EA3AF] hover:bg-[#1E222A]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="report_reason"
                      value={r.id}
                      checked={reason === r.id}
                      onChange={(e) => setReason(e.target.value)}
                      className="text-[#B69A61] focus:ring-0"
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#9EA3AF] hover:text-[#E7E1D5] rounded-lg hover:bg-[#1E222A] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Filing Report...</span>
                  </>
                ) : (
                  <span>Submit Report</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
