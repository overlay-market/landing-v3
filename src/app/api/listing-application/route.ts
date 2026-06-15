import { NextResponse } from "next/server"

const RESEND_EMAILS_URL = "https://api.resend.com/emails"

type RedirectStatus =
  | "config"
  | "email_failed"
  | "invalid"
  | "missing"
  | "sent"

type ListingApplication = {
  assetDescription: string
  chain: string
  contactEmail: string
  personalName: string
  projectName: string
  projectWebsite: string
}

function getFormText(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === "string" ? value.trim() : ""
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function getListingRedirect(request: Request, status: RedirectStatus) {
  const redirectUrl = new URL("/listing", request.url)
  redirectUrl.searchParams.set("listing", status)
  redirectUrl.hash = "apply-form"

  return NextResponse.redirect(redirectUrl, { status: 303 })
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function getSubmission(formData: FormData): ListingApplication | undefined {
  const submission = {
    assetDescription: getFormText(formData, "asset_description"),
    chain: getFormText(formData, "chain"),
    contactEmail: getFormText(formData, "contact_email"),
    personalName: getFormText(formData, "personal_name"),
    projectName: getFormText(formData, "project_name"),
    projectWebsite: getFormText(formData, "project_website"),
  }

  if (
    !submission.assetDescription ||
    !submission.chain ||
    !submission.contactEmail ||
    !submission.personalName ||
    !submission.projectName ||
    !submission.projectWebsite
  ) {
    return undefined
  }

  return submission
}

function getEmailText(submission: ListingApplication) {
  return [
    "New Overlay listing application",
    "",
    `Personal name: ${submission.personalName}`,
    `Contact email: ${submission.contactEmail}`,
    `Project name: ${submission.projectName}`,
    `Project website: ${submission.projectWebsite}`,
    `Chain: ${submission.chain}`,
    "",
    "Asset description:",
    submission.assetDescription,
  ].join("\n")
}

function getEmailHtml(submission: ListingApplication) {
  const rows = [
    ["Personal name", submission.personalName],
    ["Contact email", submission.contactEmail],
    ["Project name", submission.projectName],
    ["Project website", submission.projectWebsite],
    ["Chain", submission.chain],
  ]

  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #111827;">
      <h1 style="font-size: 20px; margin: 0 0 16px;">New Overlay listing application</h1>
      <table style="border-collapse: collapse; width: 100%; max-width: 680px;">
        <tbody>
          ${rows
            .map(
              ([label, value]) => `
                <tr>
                  <td style="border: 1px solid #d1d5db; padding: 8px 10px; font-weight: 700; width: 180px;">${escapeHtml(label)}</td>
                  <td style="border: 1px solid #d1d5db; padding: 8px 10px;">${escapeHtml(value)}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
      <h2 style="font-size: 16px; margin: 20px 0 8px;">Asset description</h2>
      <p style="white-space: pre-wrap; line-height: 1.5; max-width: 680px;">${escapeHtml(
        submission.assetDescription
      )}</p>
    </div>
  `
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const honeypot = getFormText(formData, "company")

  if (honeypot) {
    return getListingRedirect(request, "sent")
  }

  const submission = getSubmission(formData)
  const consent = getFormText(formData, "consent")

  if (!submission) {
    return getListingRedirect(request, "missing")
  }

  if (!isValidEmail(submission.contactEmail) || consent !== "on") {
    return getListingRedirect(request, "invalid")
  }

  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.LISTING_APPLICATION_FROM_EMAIL
  const toEmails = process.env.LISTING_APPLICATION_TO_EMAIL?.split(",")
    .map((email) => email.trim())
    .filter(Boolean)

  if (!apiKey || !fromEmail || !toEmails?.length) {
    return getListingRedirect(request, "config")
  }

  const response = await fetch(RESEND_EMAILS_URL, {
    body: JSON.stringify({
      from: fromEmail,
      html: getEmailHtml(submission),
      reply_to: submission.contactEmail,
      subject: `Overlay listing application: ${submission.projectName}`,
      text: getEmailText(submission),
      to: toEmails,
    }),
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    method: "POST",
  })

  if (!response.ok) {
    console.error("Resend email failed", response.status, await response.text())

    return getListingRedirect(request, "email_failed")
  }

  return getListingRedirect(request, "sent")
}
