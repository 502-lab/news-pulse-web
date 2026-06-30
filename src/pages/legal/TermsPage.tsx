import { LEGAL_DATA } from "@/constants/legalText";
import LegalDocPage from "./LegalDocPage";

export default function TermsPage() {
  return <LegalDocPage doc={LEGAL_DATA.terms} />;
}
