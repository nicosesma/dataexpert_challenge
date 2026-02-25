import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import LandingPage from "@/app/page";

describe("Landing page", () => {
  it("renders the page title", () => {
    render(<LandingPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /El Sur Driving School/i
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Data Explorer/i
    );
  });

  it("renders the ES logo mark in the header", () => {
    render(<LandingPage />);
    const logos = screen.getAllByText("ES");
    expect(logos.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the school name in the header", () => {
    render(<LandingPage />);
    const header = screen.getByRole("banner");
    expect(within(header).getByText("El Sur Driving School")).toBeInTheDocument();
  });

  it("renders the value-prop tagline", () => {
    render(<LandingPage />);
    expect(
      screen.getByText(/Effortlessly manage student records/i)
    ).toBeInTheDocument();
  });

  it("renders an 'Open Dashboard' CTA link pointing to /dashboard", () => {
    render(<LandingPage />);
    const ctaLink = screen.getByRole("link", { name: /open dashboard/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute("href", "/dashboard");
  });

  it("renders an 'Open App' link in the header pointing to /dashboard", () => {
    render(<LandingPage />);
    const headerLink = screen.getByRole("link", { name: /open app/i });
    expect(headerLink).toBeInTheDocument();
    expect(headerLink).toHaveAttribute("href", "/dashboard");
  });

  it("renders exactly two links that both point to /dashboard", () => {
    render(<LandingPage />);
    const dashboardLinks = screen
      .getAllByRole("link")
      .filter((el) => el.getAttribute("href") === "/dashboard");
    expect(dashboardLinks).toHaveLength(2);
  });

  it("renders the three feature highlight cards", () => {
    render(<LandingPage />);
    expect(screen.getByText("Live Sheet Data")).toBeInTheDocument();
    expect(screen.getByText("Inline Editing")).toBeInTheDocument();
    expect(screen.getByText("PDF Export")).toBeInTheDocument();
  });

  it("renders the feature card descriptions", () => {
    render(<LandingPage />);
    expect(
      screen.getByText(/Pull structured student records directly/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Open any student record, edit fields in a modal/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Generate filled enrollment PDFs/i)
    ).toBeInTheDocument();
  });

  it("renders the footer with the school name and current year", () => {
    render(<LandingPage />);
    const year = new Date().getFullYear().toString();
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveTextContent(/El Sur Driving School/i);
    expect(footer).toHaveTextContent(year);
  });

  it("renders the live demo disclaimer below the CTA", () => {
    render(<LandingPage />);
    expect(screen.getByText(/live demo/i)).toBeInTheDocument();
    expect(
      screen.getByText(/the Google account is already connected/i)
    ).toBeInTheDocument();
  });

  it("does not render any loading spinner or student table", () => {
    render(<LandingPage />);
    expect(screen.queryByText(/loading students/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
