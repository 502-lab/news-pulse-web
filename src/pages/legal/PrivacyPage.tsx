import { LEGAL_DATA } from "@/constants/legalText";
import LegalDocPage from "./LegalDocPage";

export default function PrivacyPage() {
  return <LegalDocPage doc={LEGAL_DATA.privacy} />;
}
