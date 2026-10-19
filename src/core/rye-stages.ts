// ============================================================================
// Piekarz — etapy chleba żytniego dla Stolnicy (F-07, podłoga RD-11) [M1-audytor-generalny-030]
// [DO USTALENIA] Sekwencję, czasy i instrukcje ustala rola 06 ze źródeł (wynik 03-zakres, „Potrzeby treści dla roli 06”).
// Pusta lista = Stolnica nie prowadzi wypieku żytniego i pokazuje komunikat; pszennej listy nie podstawiamy.
// Wpis roli 06 trafia tylko tutaj (szablony jak DEFAULT_STAGE_TEMPLATES, bez etapu składania).
// ============================================================================

import { StageTemplate } from '../scheduler/reverse-scheduler';

export const RYE_STAGE_TEMPLATES: readonly StageTemplate[] = [];
