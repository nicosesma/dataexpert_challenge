"use client";

import { useState, useEffect } from "react";
import { Student } from "@/app/types/student";

const FIELD_LABELS: { key: keyof Student; label: string; type?: string }[] = [
  { key: "email", label: "Email" },
  { key: "lastName", label: "Last Name" },
  { key: "firstName", label: "First Name" },
  { key: "middleName", label: "Middle Name" },
  { key: "dob", label: "Date of Birth" },
  { key: "birthCity", label: "Birth City" },
  { key: "birthState", label: "Birth State" },
  { key: "birthCounty", label: "Birth County" },
  { key: "birthCountry", label: "Birth Country" },
  { key: "addressStreet", label: "Street Address" },
  { key: "addressApt", label: "Apt. Number" },
  { key: "addressCounty", label: "County" },
  { key: "addressCity", label: "City" },
  { key: "addressState", label: "State" },
  { key: "addressZipCode", label: "Zip Code" },
  { key: "phoneNumber", label: "Phone Number" },
  { key: "drivingPermitNumber", label: "Driving Permit Number" },
  { key: "drivingPermitState", label: "Driving Permit State" },
  { key: "drivingPermitIssueDate", label: "Permit Issue Date" },
  { key: "drivingPermitExpireDate", label: "Permit Expire Date" },
  { key: "age", label: "Age", type: "number" },
  { key: "gender", label: "Gender" },
  { key: "eyeColor", label: "Eye Color" },
  { key: "hairColor", label: "Hair Color" },
  { key: "race", label: "Race" },
  { key: "ethnicity", label: "Ethnicity" },
  { key: "weight", label: "Weight (lbs)", type: "number" },
  { key: "height", label: "Height" },
  { key: "fatherLastName", label: "Father's Last Name" },
  { key: "motherLastName", label: "Mother's Last Name" },
  { key: "primaryContactName", label: "Primary Contact Name" },
  { key: "primaryContactPhone", label: "Primary Contact Phone" },
  { key: "primaryContactAddress", label: "Primary Contact Address" },
  { key: "secondaryContactName", label: "Secondary Contact Name" },
  { key: "secondaryContactPhone", label: "Secondary Contact Phone" },
  { key: "secondaryContactAddress", label: "Secondary Contact Address" },
];

function fullName(s: Student): string {
  return [s.firstName, s.lastName].filter(Boolean).join(" ") || s.email || "—";
}

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Student | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Student, string>>>({});
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch("/api/students")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStudents(data.students ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const validateDraft = (draft: Student): Partial<Record<keyof Student, string>> => {
    const errors: Partial<Record<keyof Student, string>> = {};
    if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) {
      errors.email = "Invalid email address";
    }
    if (draft.age !== null && (isNaN(Number(draft.age)) || Number(draft.age) < 0)) {
      errors.age = "Age must be a positive number";
    }
    if (draft.weight !== null && (isNaN(Number(draft.weight)) || Number(draft.weight) < 0)) {
      errors.weight = "Weight must be a positive number";
    }
    return errors;
  };

  const openDetail = (idx: number) => {
    setDetailIndex(idx);
    setEditDraft({ ...students[idx] });
    setFormErrors({});
  };

  const closeDetail = () => {
    setDetailIndex(null);
    setEditDraft(null);
    setFormErrors({});
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    setPdfPreviewUrl(null);
    setPdfFilename("");
  };

  const handleExport = async () => {
    if (!editDraft) return;
    setExporting(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editDraft),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const name = [editDraft.firstName, editDraft.middleName, editDraft.lastName]
        .filter(Boolean).join(" ") || "student";
      setPdfFilename(`${name}.pdf`);
      setPdfPreviewUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const saveDetail = () => {
    if (detailIndex === null || !editDraft) return;
    const errors = validateDraft(editDraft);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setStudents((prev) => {
      const next = [...prev];
      next[detailIndex] = editDraft;
      return next;
    });
    closeDetail();
  };

  const handleFieldChange = (key: keyof Student, value: string) => {
    setEditDraft((prev) => {
      if (!prev) return prev;
      const isNum = key === "age" || key === "weight";
      const parsed = isNum ? (value === "" ? null : Number(value)) : value;
      const updated = { ...prev, [key]: parsed };
      setFormErrors((errs) => {
        const next = { ...errs };
        delete next[key];
        return next;
      });
      return updated;
    });
  };

  const toggleAll = () => {
    if (selected.size === students.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(students.map((_, i) => i)));
    }
  };

  const toggleRow = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const allSelected = students.length > 0 && selected.size === students.length;
  const someSelected = selected.size > 0 && !allSelected;
  const detailStudent = detailIndex !== null ? students[detailIndex] : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-5 flex items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-sm select-none">
            ES
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-white">
            El Sur Driving School{" "}
            <span className="text-zinc-400 font-normal">Data Exporter</span>
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-8 py-8 max-w-5xl mx-auto w-full">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Students</h2>
            <p className="text-zinc-400 text-sm mt-1">
              Select students to export. Click a name to view and edit details.
            </p>
          </div>
          <button
            onClick={() => {
              const blank: Student = {
                email: "", lastName: "", firstName: "", middleName: "",
                dob: "", birthCity: "", birthState: "", birthCounty: "", birthCountry: "",
                addressStreet: "", addressApt: "", addressCounty: "", addressCity: "",
                addressState: "", addressZipCode: "", phoneNumber: "",
                drivingPermitNumber: "", drivingPermitState: "",
                drivingPermitIssueDate: "", drivingPermitExpireDate: "",
                age: null, gender: "", eyeColor: "", hairColor: "",
                race: "", ethnicity: "", weight: null, height: "",
                fatherLastName: "", motherLastName: "",
                primaryContactName: "", primaryContactPhone: "", primaryContactAddress: "",
                secondaryContactName: "", secondaryContactPhone: "", secondaryContactAddress: "",
              };
              setStudents((prev) => [...prev, blank]);
              setDetailIndex(students.length);
              setEditDraft(blank);
            }}
            className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition-all hover:bg-white/[0.08] hover:text-white shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add student
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">
            <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading students…
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && students.length === 0 && (
          <div className="text-center py-20 text-zinc-500 text-sm">No students found.</div>
        )}

        {!loading && !error && students.length > 0 && (
          <>
            <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.03]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.04]">
                    <th className="w-12 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => { if (el) el.indeterminate = someSelected; }}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-rose-600 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-400 uppercase tracking-wider text-xs">
                      Name
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => {
                    const isSelected = selected.has(idx);
                    return (
                      <tr
                        key={idx}
                        className={[
                          "border-b border-white/5 transition-colors",
                          idx === students.length - 1 ? "border-b-0" : "",
                          isSelected ? "bg-rose-600/10" : "",
                        ].join(" ")}
                      >
                        <td className="px-4 py-3.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(idx)}
                            className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-rose-600 cursor-pointer"
                          />
                        </td>
                        <td
                          className="px-4 py-3.5 font-medium text-white cursor-pointer hover:text-rose-400 transition-colors"
                          onClick={() => openDetail(idx)}
                        >
                          {fullName(student)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-zinc-600 text-xs mt-4">
              {selected.size === 0
                ? `${students.length} students total`
                : `${selected.size} of ${students.length} selected`}
            </p>
          </>
        )}
      </main>

      {/* Detail / Edit Modal */}
      {detailStudent && editDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={closeDetail}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#111] shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#111] px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{fullName(editDraft)}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{editDraft.email}</p>
              </div>
              <button
                onClick={closeDetail}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Editable fields grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
              {FIELD_LABELS.map(({ key, label, type }) => {
                const val = editDraft[key];
                const strVal = val !== null && val !== undefined ? String(val) : "";
                const fieldError = formErrors[key];
                return (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      {label}
                    </label>
                    <input
                      type={type ?? "text"}
                      value={strVal}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      className={[
                        "bg-white/5 border rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:bg-white/[0.07] transition-colors",
                        fieldError
                          ? "border-red-500/70 focus:border-red-500"
                          : "border-white/10 focus:border-rose-500/60",
                      ].join(" ")}
                      placeholder="—"
                    />
                    {fieldError && (
                      <span className="text-xs text-red-400">{fieldError}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* PDF Preview */}
            {pdfPreviewUrl && (
              <div className="px-6 pb-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-300">{pdfFilename}</span>
                  <a
                    href={pdfPreviewUrl}
                    download={pdfFilename}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M8 12l4 4 4-4M12 4v12" />
                    </svg>
                    Download PDF
                  </a>
                </div>
                <iframe
                  src={pdfPreviewUrl}
                  className="w-full rounded-lg border border-white/10"
                  style={{ height: "400px" }}
                  title="PDF Preview"
                />
              </div>
            )}

            {/* Modal footer */}
            <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-white/10 bg-[#111] px-6 py-4">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition-all hover:bg-white/[0.08] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M8 12l4 4 4-4M12 4v12" />
                  </svg>
                )}
                {exporting ? "Generating…" : "Export PDF"}
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={closeDetail}
                  className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveDetail}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-sm font-medium text-white hover:bg-rose-500 transition-colors"
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
