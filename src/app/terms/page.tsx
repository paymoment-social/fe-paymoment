import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Terms of Service | PayMoment", description: "Terms of Service for PayMoment." };

export default function TermsPage() {
  return <LegalPage title="Terms of Service" intro="These Terms govern your use of PayMoment, the social layer for sharing payment moments and earning Box rewards." sections={[
    { title: "Using PayMoment", body: ["You must provide accurate account information and keep access to your account secure. You are responsible for activity performed through your account and for complying with applicable law.", "You may use PayMoment to publish Moments, articles, replies, media, and messages. Do not publish unlawful, deceptive, infringing, abusive, or harmful content, and do not interfere with the service or another person’s access to it."] },
    { title: "Your content", body: ["You retain ownership of content you submit. You grant PayMoment the limited right to host, process, display, and distribute that content as needed to operate, secure, and improve the service.", "You must have the rights needed to post your content. We may restrict, remove, or moderate content and accounts that violate these Terms, our safety rules, or applicable law."] },
    { title: "Box rewards", body: ["Box rewards, balances, claims, and redemptions are recorded by the PayMoment service. Rewards are subject to eligibility rules, available inventory, abuse controls, and correction of clear errors. Box is not a bank account, payment instrument, or guarantee of monetary value unless a separate written program states otherwise."] },
    { title: "Account actions and availability", body: ["We may suspend or terminate access when reasonably necessary to protect users, investigate misuse, comply with legal obligations, or maintain service security. We may change or discontinue features with reasonable notice where practical."] },
    { title: "Contact and changes", body: ["We may update these Terms as PayMoment evolves. Continued use after an effective update means you accept the updated Terms. Material changes will be communicated through the service or another reasonable channel."] },
  ]} />;
}
