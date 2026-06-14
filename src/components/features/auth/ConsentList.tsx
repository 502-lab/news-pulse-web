import { useState, useEffect } from 'react';
import type { components } from '../../../../generated/api-types';

type TermsVersion = components['schemas']['TermsVersion'];
type ConsentInput = components['schemas']['ConsentInput'];

interface Props {
  terms: TermsVersion[];
  onChange: (consents: ConsentInput[], ageConfirmed: boolean) => void;
  disabled?: boolean;
}

const TYPE_LABEL: Record<string, string> = {
  SERVICE: '서비스 이용약관',
  PRIVACY: '개인정보처리방침',
  MARKETING: '마케팅 수신 동의',
};

export default function ConsentList({ terms, onChange, disabled = false }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  useEffect(() => {
    const init: Record<string, boolean> = {};
    terms.forEach((t) => { init[t.id] = false; });
    setChecked(init);
  }, [terms]);

  const allChecked = terms.every((t) => checked[t.id]) && ageConfirmed;

  function fireChange(c: Record<string, boolean>, age: boolean) {
    const consents: ConsentInput[] = terms.map((t) => ({
      termsVersionId: t.id,
      agreed: c[t.id] ?? false,
    }));
    onChange(consents, age);
  }

  function handleToggleAll(v: boolean) {
    const next: Record<string, boolean> = {};
    terms.forEach((t) => { next[t.id] = v; });
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
    <fieldset disabled={disabled} className="space-y-2.5">
      <legend className="sr-only">약관 동의</legend>

      <label className="flex items-center gap-2 font-semibold text-sm text-ink cursor-pointer select-none">
        <input
          type="checkbox"
          checked={allChecked}
          onChange={(e) => handleToggleAll(e.target.checked)}
          aria-label="전체 동의"
          className="w-4 h-4 accent-brand"
        />
        전체 동의
      </label>

      <hr className="border-ink-200" />

      {terms.map((t) => (
        <label
          key={t.id}
          htmlFor={`consent-${t.id}`}
          className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id={`consent-${t.id}`}
            checked={checked[t.id] ?? false}
            onChange={(e) => handleToggle(t.id, e.target.checked)}
            className="w-4 h-4 accent-brand"
          />
          <span>
            {TYPE_LABEL[t.type] ?? t.type}{' '}
            <span className={t.isRequired ? 'text-danger text-xs' : 'text-ink-400 text-xs'}>
              {t.isRequired ? '[필수]' : '[선택]'}
            </span>
          </span>
        </label>
      ))}

      <label
        htmlFor="consent-age"
        className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer select-none"
      >
        <input
          type="checkbox"
          id="consent-age"
          checked={ageConfirmed}
          onChange={(e) => handleAgeToggle(e.target.checked)}
          className="w-4 h-4 accent-brand"
        />
        <span>
          만 14세 이상입니다{' '}
          <span className="text-danger text-xs">[필수]</span>
        </span>
      </label>
    </fieldset>
  );
}
