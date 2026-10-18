import Toybox.WatchUi;
import Toybox.Attention;
import Toybox.System;

class PiekarzDelegate extends WatchUi.BehaviorDelegate {
    private var view as PiekarzView;

    function initialize(v as PiekarzView) {
        BehaviorDelegate.initialize();
        view = v;
    }

    function onKey(keyEvent as WatchUi.KeyEvent) as Boolean {
        var key = keyEvent.getKey();

        // Physical START / ENTER button
        if (key == WatchUi.KEY_ENTER || key == WatchUi.KEY_START) {
            triggerFoldAction();
            return true;
        }

        // Physical DOWN / LAP button
        if (key == WatchUi.KEY_DOWN) {
            advanceBakeStage();
            return true;
        }

        return false;
    }

    function triggerFoldAction() as Void {
        view.foldsCompleted += 1;
        view.timerSeconds = 1800; // Reset 30 min timer for next fold

        if (view.foldsCompleted >= 3) {
            view.currentStage = "FORMOWANIE WSTĘPNE";
            view.timerSeconds = 1200; // 20 min
        } else {
            view.currentStage = "SKŁADANIE " + (view.foldsCompleted + 1) + "/3";
        }

        // Tactile vibration feedback (hands-free confirmation)
        if (Attention has :vibrate) {
            var vibeProfile = [
                new Attention.VibeProfile(100, 250),
                new Attention.VibeProfile(0, 100),
                new Attention.VibeProfile(100, 250)
            ];
            Attention.vibrate(vibeProfile);
        }

        WatchUi.requestUpdate();
    }

    function advanceBakeStage() as Void {
        view.currentStage = "GARNEK: POKRYWKA OFF";
        view.timerSeconds = 1500; // 25 min

        if (Attention has :vibrate) {
            var vibe = [new Attention.VibeProfile(100, 500)];
            Attention.vibrate(vibe);
        }

        WatchUi.requestUpdate();
    }
}
