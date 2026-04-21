import da from "@/app/messages/da.json";
import de from "@/app/messages/de.json";
import en from "@/app/messages/en.json";
import es from "@/app/messages/es.json";
import fi from "@/app/messages/fi.json";
import fr from "@/app/messages/fr.json";
import it from "@/app/messages/it.json";
import nl from "@/app/messages/nl.json";
import no from "@/app/messages/no.json";
import pl from "@/app/messages/pl.json";
import pt from "@/app/messages/pt.json";
import sv from "@/app/messages/sv.json";

export const translations = {
  da, de, en, es, fi, fr, it, nl, no, pl, pt, sv,
};

export function getT(lang) {
  return translations[lang] ?? translations.en;
}

export const SUPPORTED_LANGUAGES = Object.keys(translations);
