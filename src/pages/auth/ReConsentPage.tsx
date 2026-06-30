import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import {
  getActiveTerms,
  getConsents,
  submitConsents,
  TERMS_QUERY_KEYS,
} from "@/lib/api/terms";
import { getMe } from "@/lib/api/auth";
import { logout as logoutApi } from "@/lib/api/auth";
import { getRefreshToken } from "@/lib/tokenStorage";
import ConsentList from "@/components/features/auth/ConsentList";
import type { components } from "../../../generated/api-types";

type ConsentInput = components["schemas"]["ConsentInput"];

function SkeletonRow() {
  return <div className="h-5 bg-ink-100 rounded animate-pulse" />;
}

export default function ReConsentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);

  const [consents, setConsents] = useState<ConsentInput[]>([]);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState("");

  const {
    data: terms,
    isLoading: termsLoading,
    isError: termsError,
  } = useQuery({
    queryKey: TERMS_QUERY_KEYS.activeTerms,
    queryFn: getActiveTerms,
    staleTime: 10 * 60 * 1000,
  });

  const { data: myConsents, isLoading: consentsLoading } = useQuery({
    queryKey: TERMS_QUERY_KEYS.myConsents,
    queryFn: getConsents,
    staleTime: 0,
  });

  const mutation = useMutation({
    mutationFn: submitConsents,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: TERMS_QUERY_KEYS.myConsents,
      });
      if (user && accessToken) {
        // 로컬 갱신 먼저
        setAuth({ ...user, requiresReConsent: false }, accessToken);
        // GateRoute가 requiresReConsent=false를 보고 통과하도록 능동 navigate
        navigate("/home", { replace: true });
        // fallback: 로컬 갱신이 서버와 어긋나는 경우 getMe()로 재확인
        try {
          const freshUser = await getMe();
          setAuth(freshUser, accessToken);
        } catch {
          // fallback 실패 시 무시 (이미 로컬 갱신 완료)
        }
      }
    },
    onError: () => {
      setError("동의 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    },
  });

  async function handleDecline() {
    const rt = getRefreshToken();
    if (rt) {
      try {
        await logoutApi(rt);
      } catch {
        /* 서버 오류 무관 */
      }
    }
    logout();
    navigate("/login", { replace: true });
  }

  function handleConsentChange(next: ConsentInput[], age: boolean) {
    setConsents(next);
    setAgeConfirmed(age);
  }

  const isLoading = termsLoading || consentsLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-6 w-40 bg-ink-100 rounded animate-pulse" />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  if (termsError) {
    return (
      <div className="p-6">
        <p role="alert" className="text-sm text-danger">
          약관을 불러오는 중 오류가 발생했습니다. 새로고침해주세요.
        </p>
      </div>
    );
  }

  // 미동의 필수 약관만 표시
  const agreedIds = new Set(
    (myConsents ?? []).filter((c) => c.agreed).map((c) => c.termsVersionId),
  );
  const pendingTerms = (terms ?? []).filter(
    (t) => t.isRequired && !agreedIds.has(t.id),
  );

  const requiredIds = pendingTerms.filter((t) => t.isRequired).map((t) => t.id);
  const allRequiredAgreed =
    requiredIds.length === 0 ||
    (requiredIds.every(
      (id) => consents.find((c) => c.termsVersionId === id)?.agreed,
    ) &&
      ageConfirmed);

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-lg font-bold text-ink">약관 재동의</h1>
      <p className="text-sm text-ink-600">
        서비스 이용을 위해 변경된 약관에 동의해주세요.{" "}
        <Link to="/terms" className="underline hover:text-brand">
          이용약관
        </Link>{" "}
        ·{" "}
        <Link to="/privacy" className="underline hover:text-brand">
          개인정보처리방침
        </Link>
      </p>

      {error && (
        <p
          role="alert"
          className="text-sm text-danger bg-danger/5 rounded-input px-3 py-2"
        >
          {error}
        </p>
      )}

      {pendingTerms.length > 0 ? (
        <ConsentList
          terms={pendingTerms}
          onChange={handleConsentChange}
          disabled={mutation.isPending}
        />
      ) : (
        <p className="text-sm text-ink-400">
          동의가 필요한 약관이 없습니다. 아래 버튼을 눌러 계속하세요.
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => mutation.mutate(consents)}
          disabled={!allRequiredAgreed || mutation.isPending}
          className="w-full bg-brand hover:bg-brand-600 disabled:bg-ink-300 text-white font-semibold rounded-btn py-2.5 text-sm transition-colors"
        >
          {mutation.isPending ? "처리 중…" : "동의하고 계속"}
        </button>
        <button
          type="button"
          onClick={handleDecline}
          disabled={mutation.isPending}
          className="w-full border border-ink-200 text-ink-500 hover:text-danger hover:border-danger rounded-btn py-2.5 text-sm transition-colors"
        >
          거부하고 로그아웃
        </button>
      </div>
    </div>
  );
}
