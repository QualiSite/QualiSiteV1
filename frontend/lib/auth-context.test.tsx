import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./auth-context";

function mockFetchResponse(ok: boolean, body: unknown = {}) {
  return { ok, json: () => Promise.resolve(body) } as Response;
}

function TestConsumer() {
  const { user, isLoading, login, logout } = useAuth();

  if (isLoading) return <div>loading</div>;

  return (
    <div>
      <div data-testid="user">{user ? user.email : "anonymous"}</div>
      <button onClick={() => login("admin@qualisite.fr", "Password1!")}>login</button>
      <button onClick={() => logout().catch(() => {})}>logout</button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stays anonymous when the refresh cookie is absent/invalid", async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(false));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("anonymous"));
  });

  it("restores the session when the refresh cookie is valid", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockFetchResponse(true, {
        accessToken: "token-abc",
        user: { id: "1", email: "admin@qualisite.fr", role: "ADMIN" },
      })
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("admin@qualisite.fr"));
  });

  it("login sets the user after a successful call", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockFetchResponse(false)) // refresh au montage
      .mockResolvedValueOnce(
        mockFetchResponse(true, {
          accessToken: "token-abc",
          user: { id: "1", email: "admin@qualisite.fr", role: "ADMIN" },
        })
      );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("anonymous"));
    await user.click(screen.getByText("login"));

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("admin@qualisite.fr"));
  });

  it("logout clears the user even when the request fails", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        mockFetchResponse(true, {
          accessToken: "token-abc",
          user: { id: "1", email: "admin@qualisite.fr", role: "ADMIN" },
        })
      )
      .mockRejectedValueOnce(new Error("network error"));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("admin@qualisite.fr"));
    await user.click(screen.getByText("logout"));

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("anonymous"));
  });
});
