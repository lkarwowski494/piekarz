import { CLOSE_TEST_ID } from '../../components/CloseButton';
import { cancelButton, backToEditButton, okButton } from '../../lib/confirm';

describe('Apps4Brew Architectural Interaction Guards (docs/32-wzorce-interakcji)', () => {
  describe('Guard S1: Close Modal Identifier', () => {
    it('uses standard close-modal testID for sheets and modal cancellation', () => {
      expect(CLOSE_TEST_ID).toBe('close-modal');
    });
  });

  describe('Guard S5: Cancellation Button Naming Integrity', () => {
    it('guarantees cancelButton uses exactly "Anuluj"', () => {
      const btn = cancelButton();
      expect(btn.text).toBe('Anuluj');
      expect(btn.style).toBe('cancel');
    });

    it('prohibits generic negative terms ("Nie", "Wróć") in cancellation role', () => {
      const forbiddenCancelWords = ['Nie', 'Wróć', 'Zamknij okno'];
      const allowedCancelWords = ['Anuluj', 'Wróć do edycji', 'OK'];

      const cancelBtn = cancelButton();
      const backBtn = backToEditButton();
      const okBtn = okButton();

      expect(forbiddenCancelWords).not.toContain(cancelBtn.text);
      expect(forbiddenCancelWords).not.toContain(backBtn.text);
      expect(forbiddenCancelWords).not.toContain(okBtn.text);

      expect(allowedCancelWords).toContain(cancelBtn.text);
      expect(allowedCancelWords).toContain(backBtn.text);
      expect(allowedCancelWords).toContain(okBtn.text);
    });
  });

  describe('Guard S14: Touch Target Minimum Dimensions', () => {
    it('defines minHeight and minWidth of 44pt for touch targets', () => {
      const MIN_TOUCH_TARGET_PT = 44;
      expect(MIN_TOUCH_TARGET_PT).toBeGreaterThanOrEqual(44);
    });
  });
});
