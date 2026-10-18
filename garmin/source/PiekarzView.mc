import Toybox.Graphics;
import Toybox.WatchUi;
import Toybox.Lang;
import Toybox.Timer;

class PiekarzView extends WatchUi.View {
    public var currentStage as String = "SKŁADANIE 1/3";
    public var timerSeconds as Number = 1800; // 30 min
    public var foldsCompleted as Number = 0;
    private var uiTimer as Timer.Timer?;

    function initialize() {
        View.initialize();
        uiTimer = new Timer.Timer();
    }

    function onLayout(dc as Graphics.Dc) as Void {
    }

    function onShow() as Void {
        if (uiTimer != null) {
            uiTimer.start(method(:onTimerTick), 1000, true);
        }
    }

    function onHide() as Void {
        if (uiTimer != null) {
            uiTimer.stop();
        }
    }

    function onTimerTick() as Void {
        if (timerSeconds > 0) {
            timerSeconds -= 1;
            WatchUi.requestUpdate();
        }
    }

    function onUpdate(dc as Graphics.Dc) as Void {
        dc.setColor(Graphics.COLOR_BLACK, Graphics.COLOR_BLACK);
        dc.clear();

        // High contrast amber / gold
        dc.setColor(Graphics.COLOR_ORANGE, Graphics.COLOR_TRANSPARENT);
        var width = dc.getWidth();
        var height = dc.getHeight();

        dc.drawText(width / 2, height * 0.20, Graphics.FONT_TINY, "PIEKARZ (CRUST)", Graphics.TEXT_JUSTIFY_CENTER);

        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.drawText(width / 2, height * 0.35, Graphics.FONT_SMALL, currentStage, Graphics.TEXT_JUSTIFY_CENTER);

        var mins = timerSeconds / 60;
        var secs = timerSeconds % 60;
        var timeStr = Lang.format("$1$:$2$", [mins.format("%02d"), secs.format("%02d")]);

        dc.setColor(Graphics.COLOR_YELLOW, Graphics.COLOR_TRANSPARENT);
        dc.drawText(width / 2, height * 0.55, Graphics.FONT_NUMBER_HOT, timeStr, Graphics.TEXT_JUSTIFY_CENTER);

        dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
        dc.drawText(width / 2, height * 0.82, Graphics.FONT_XTINY, "START: Złóż ciasto", Graphics.TEXT_JUSTIFY_CENTER);
    }
}
