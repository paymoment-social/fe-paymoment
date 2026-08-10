import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy | PayMoment", description: "Privacy Policy for PayMoment." };

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" intro="This Policy explains how PayMoment handles information when you use the service." sections={[
    { title: "Information we process", body: ["We process account information supplied through Google sign-in, such as your email address, display name, profile image, and provider account identifier. We also process the profile details, Moments, replies, messages, reward activity, reports, and media that you choose to submit.", "We process limited technical and security information, including session identifiers, device or browser information, hashed network identifiers for abuse protection, and service activity needed to secure and operate PayMoment."] },
    { title: "Why we use information", body: ["We use information to authenticate you, provide social and messaging features, deliver rewards, moderate content, prevent abuse, respond to support requests, and maintain the reliability and security of the service."] },
    { title: "Service providers", body: ["PayMoment uses infrastructure providers for hosting, PostgreSQL and Redis operations, Google authentication, and Pinata media storage. Providers process information only as needed to provide their service to PayMoment."] },
    { title: "Visibility and choices", body: ["Your profile and content visibility follow the controls you select in PayMoment. Public Moments may be visible to other users and to authorized MCP clients acting for you. You can update profile settings, delete eligible content, and submit reports through the service."] },
    { title: "Retention and security", body: ["We retain information for as long as needed to operate PayMoment, meet legal obligations, resolve disputes, and enforce agreements. We use access controls, opaque session cookies, encryption in transit, audit logs, and abuse protections, but no online service can guarantee absolute security."] },
    { title: "Policy changes", body: ["We may update this Policy when our processing changes. Material changes will be communicated through the service or another reasonable channel before they take effect where required."] },
  ]} />;
}
