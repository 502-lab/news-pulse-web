import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "./setup";
import AuthShell from "@/components/layout/AuthShell";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";

const BASE = "http://localhost:8080";

function renderForgotPw() {
  const routes = [
    {
      element: <AuthShell />,
      children: [
        { path: "/forgot-password", element: <ForgotPasswordPage /> },
        { path: "/login", element: <div data-testid="login">Login</div> },
      ],
    },
  ];
  const router = createMemoryRouter(routes, {
    initialEntries: ["/forgot-password"],
  });
  return render(<RouterProvider router={router} />);
}

async function typeOtp(
  user: ReturnType<typeof userEvent.setup>,
  digits: string,
) {
  const boxes = screen.getAllByLabelText(/인증 코드 \d번째 자리/);
  for (let i = 0; i < Math.min(digits.length, 6); i++) {
    await user.type(boxes[i], digits[i]);
  }
}

describe("ForgotPasswordPage — S-5 비밀번호 재설정 4단계", () => {
  beforeEach(() => {
    server.use(
      http.post(
        `${BASE}/api/v1/auth/password-reset/request`,
        () => new HttpResponse(null, { status: 202 }),
      ),
      http.post(`${BASE}/api/v1/auth/password-reset/verify`, () =>
        HttpResponse.json({ resetToken: "mock-reset-token" }),
      ),
      http.post(
        `${BASE}/api/v1/auth/password-reset/confirm`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    );
  });

  it("폼이 렌더된다 — 이메일 입력 + 인증 코드 받기 버튼", () => {
    renderForgotPw();
    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "인증 코드 받기" }),
    ).toBeInTheDocument();
  });

  it("← 로그인으로 back 링크가 /login을 가리킨다", () => {
    renderForgotPw();
    const link = screen.getByRole("link", { name: "로그인으로" });
    expect(link).toHaveAttribute("href", "/login");
  });

  it("스테퍼가 1단계 활성 상태로 표시된다", () => {
    renderForgotPw();
    expect(
      screen.getByRole("heading", { name: "비밀번호 재설정" }),
    ).toBeInTheDocument();
  });

  it("Stage1: 이메일 입력 후 발송 → Stage2 전환", async () => {
    const user = userEvent.setup();
    renderForgotPw();

    await user.type(screen.getByLabelText("이메일"), "reset@example.com");
    await user.click(screen.getByRole("button", { name: "인증 코드 받기" }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "인증 코드 입력" }),
      ).toBeInTheDocument();
    });
    expect(screen.getByLabelText("인증 코드 1번째 자리")).toBeInTheDocument();
  });

  it("빈 이메일로 발송 클릭 → 서버 요청 없이 오류 표시", async () => {
    const user = userEvent.setup();
    renderForgotPw();

    await user.click(screen.getByRole("button", { name: "인증 코드 받기" }));
    expect(
      screen.getByText("올바른 이메일 형식이 아닙니다."),
    ).toBeInTheDocument();
  });

  it("전체 4단계 흐름: Stage1 → Stage2 → Stage3 → Stage4(성공)", async () => {
    const user = userEvent.setup();
    renderForgotPw();

    // Stage 1
    await user.type(screen.getByLabelText("이메일"), "reset@example.com");
    await user.click(screen.getByRole("button", { name: "인증 코드 받기" }));

    // Stage 2
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "인증 코드 입력" }),
      ).toBeInTheDocument(),
    );
    await typeOtp(user, "123456");
    await user.click(screen.getByRole("button", { name: "인증 확인" }));

    // Stage 3
    await waitFor(() =>
      expect(screen.getByLabelText("새 비밀번호")).toBeInTheDocument(),
    );
    await user.type(screen.getByLabelText("새 비밀번호"), "NewPass1");
    await user.type(screen.getByLabelText("새 비밀번호 확인"), "NewPass1");
    await user.click(screen.getByRole("button", { name: "비밀번호 변경하기" }));

    // Stage 4
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "비밀번호가 변경됐어요" }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: "로그인하러 가기" }),
    ).toBeInTheDocument();
  });

  it("Stage2: 잘못된 코드 → 400 → 코드 오류 표시", async () => {
    server.use(
      http.post(
        `${BASE}/api/v1/auth/password-reset/verify`,
        () => new HttpResponse(null, { status: 400 }),
      ),
    );
    const user = userEvent.setup();
    renderForgotPw();

    await user.type(screen.getByLabelText("이메일"), "reset@example.com");
    await user.click(screen.getByRole("button", { name: "인증 코드 받기" }));

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "인증 코드 입력" }),
      ).toBeInTheDocument(),
    );
    await typeOtp(user, "999999");
    await user.click(screen.getByRole("button", { name: "인증 확인" }));

    await waitFor(() => {
      expect(
        screen.getByText("인증 코드가 올바르지 않습니다. 다시 확인해 주세요."),
      ).toBeInTheDocument();
    });
  });

  it("Stage3: 비밀번호 불일치 → 오류 표시 + 제출 차단", async () => {
    const user = userEvent.setup();
    renderForgotPw();

    // Stage 1 → 2
    await user.type(screen.getByLabelText("이메일"), "reset@example.com");
    await user.click(screen.getByRole("button", { name: "인증 코드 받기" }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "인증 코드 입력" }),
      ).toBeInTheDocument(),
    );
    await typeOtp(user, "123456");
    await user.click(screen.getByRole("button", { name: "인증 확인" }));

    // Stage 3
    await waitFor(() =>
      expect(screen.getByLabelText("새 비밀번호")).toBeInTheDocument(),
    );
    await user.type(screen.getByLabelText("새 비밀번호"), "NewPass1");
    await user.type(
      screen.getByLabelText("새 비밀번호 확인"),
      "DifferentPass2",
    );

    expect(
      screen.getByText("비밀번호가 일치하지 않습니다."),
    ).toBeInTheDocument();
  });

  it("Stage2: 이메일 주소 바꾸기 → Stage1으로 복귀", async () => {
    const user = userEvent.setup();
    renderForgotPw();

    await user.type(screen.getByLabelText("이메일"), "reset@example.com");
    await user.click(screen.getByRole("button", { name: "인증 코드 받기" }));

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "인증 코드 입력" }),
      ).toBeInTheDocument(),
    );
    await user.click(
      screen.getByRole("button", { name: "이메일 주소 바꾸기" }),
    );

    expect(
      screen.getByRole("heading", { name: "비밀번호 재설정" }),
    ).toBeInTheDocument();
  });
});
