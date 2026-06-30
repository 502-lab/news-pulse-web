import { useState } from "react";
import { Link } from "react-router-dom";
import type { TermsVersion } from "@/lib/api/terms";
import type { components } from "../../../../generated/api-types";

type ConsentInput = components["schemas"]["ConsentInput"];

interface Props {
  terms: TermsVersion[];
  onChange: (consents: ConsentInput[], ageConfirmed: boolean) => void;
  disabled?: boolean;
}

const TYPE_LABEL: Record<string, string> = {
  SERVICE: "서비스 이용약관",
  PRIVACY: "개인정보처리방침",
  MARKETING: "마케팅 정보 수신 동의",
};

const VIEW_LINK: Partial<Record<string, string>> = {
  SERVICE: "/terms",
  PRIVACY: "/privacy",
};

function CheckMark({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors ${
        checked ? "bg-brand" : "border border-ink-300 bg-white"
      }`}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke={checked ? "white" : "transparent"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

function buildInit(terms: TermsVersion[]): Record<string, boolean> {
  const init: Record<string, boolean> = {};
  terms.forEach((t) => {
    if (t.id) init[t.id] = false;
  });
  return init;
}

export default function ConsentList({
  terms,
  onChange,
  disabled = false,
}: Props) {
  const [prevTerms, setPrevTerms] = useState(terms);
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    buildInit(terms),
  );
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  if (prevTerms !== terms) {
    setPrevTerms(terms);
    setChecked(buildInit(terms));
  }

  const allChecked = terms.every((t) => t.id && checked[t.id]) && ageConfirmed;

  function fireChange(c: Record<string, boolean>, age: boolean) {
    const consents: ConsentInput[] = terms
      .filter((t): t is TermsVersion & { id: string } => !!t.id)
      .map((t) => ({ termsVersionId: t.id, agreed: c[t.id] ?? false }));
    onChange(consents, age);
  }

  function handleToggleAll(v: boolean) {
    const next: Record<string, boolean> = {};
    terms.forEach((t) => {
      if (t.id) next[t.id] = v;
    });
    setChecked(next);
    setAgeConfirmed(v);
    fireChange(next, v);
  }

  function handleToggle(id: string, v: boolean) {
    const next = { ...checked, [id]: v };
    setChecked(next);
    fireChange(next, ageConfirmed);
  }

  function handleAgeToggle(v: boolean) {
    setAgeConfirmed(v);
    fireChange(checked, v);
  }

  return (
    <fieldset disabled={disabled} className="flex flex-col gap-0.5">
      <legend className="sr-only">약관 동의</legend>

      <label className="flex items-center gap-3 px-3 py-2.5 rounded-btn bg-brand-50 hover:bg-brand-100 cursor-pointer select-none transition-colors">
        <input
          type="checkbox"
          aria-label="전체 동의"
          checked={allChecked}
          onChange={(e) => handleToggleAll(e.target.checked)}
          className="sr-only"
        />
        <CheckMark checked={allChecked} />
        <span className="text-[13.5px] font-bold text-ink">
          약관에 모두 동의
        </span>
      </label>

      <div className="pt-1 flex flex-col">
        {/* 만 14세 항목 — 내용 없는 필수 항목은 제일 위 */}
        <div className="flex items-center py-1.5">
          <input
            type="checkbox"
            id="consent-age"
            checked={ageConfirmed}
            onChange={(e) => handleAgeToggle(e.target.checked)}
            className="sr-only"
          />
          <label
            htmlFor="consent-age"
            className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
          >
            <CheckMark checked={ageConfirmed} />
            <span className="text-[11.5px] font-bold shrink-0 text-brand">
              [필수]
            </span>
            <span className="text-[13px] font-medium text-ink-700">
              만 14세 이상입니다
            </span>
          </label>
        </div>

        {[...terms]
          .filter((t): t is TermsVersion & { id: string } => !!t.id)
          .sort((a, b) => {
            if (a.isRequired !== b.isRequired) return a.isRequired ? -1 : 1;
            const aHasLink = !!(a.type && VIEW_LINK[a.type]);
            const bHasLink = !!(b.type && VIEW_LINK[b.type]);
            return (aHasLink ? 1 : 0) - (bHasLink ? 1 : 0);
          })
          .map((t) => (
            <div key={t.id} className="flex items-center py-1.5">
              <input
                type="checkbox"
                id={`consent-${t.id}`}
                checked={checked[t.id] ?? false}
                onChange={(e) => handleToggle(t.id, e.target.checked)}
                className="sr-only"
              />
              <label
                htmlFor={`consent-${t.id}`}
                className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
              >
                <CheckMark checked={checked[t.id] ?? false} />
                <span
                  className={`text-[11.5px] font-bold shrink-0 ${
                    t.isRequired ? "text-brand" : "text-ink-400"
                  }`}
                >
                  [{t.isRequired ? "필수" : "선택"}]
                </span>
                <span className="text-[13px] font-medium text-ink-700">
                  {t.type ? (TYPE_LABEL[t.type] ?? t.type) : "약관"}
                </span>
              </label>
              {t.type && VIEW_LINK[t.type] && (
                <Link
                  to={VIEW_LINK[t.type]!}
                  className="text-[11.5px] text-ink-400 hover:text-brand shrink-0 ml-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  보기 ›
                </Link>
              )}
            </div>
          ))}
      </div>
    </fieldset>
  );
}
